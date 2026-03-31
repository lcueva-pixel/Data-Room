# Plan de Acción — Sub-Reportes (Jerarquía Recursiva)

> **Flujo de usuario:** Tabla de Reportes → Editar "Reach" → Sección "Sub-reportes vinculados" →
> Botón "+ Agregar Sub-reporte" → Formulario con `parentId` bloqueado → Guardar → El sub-reporte
> aparece en la lista y en el Sidebar como acordeón.
>
> **Recursividad:** Un sub-reporte puede tener sus propios sub-reportes (profundidad ilimitada).

---

## Fase 1 — Base de Datos (Prisma)

### Paso 1.1 — Relación recursiva en el modelo `Report`

Archivo: `BACKEND/prisma/schema.prisma`

Agregar tres líneas al modelo `Report` existente: un campo nullable `padreId` y la relación bidireccional:

```prisma
model Report {
  id            Int      @id @default(autoincrement())
  titulo        String   @db.VarChar(100)
  descripcion   String?
  urlIframe     String   @map("url_iframe")
  activo        Boolean  @default(true)
  fechaRegistro DateTime @default(now()) @map("fecha_registro") @db.Timestamptz

  // ─── Jerarquía recursiva ───────────────────────────
  padreId  Int?     @map("padre_id")
  padre    Report?  @relation("ReportHierarchy", fields: [padreId], references: [id], onDelete: SetNull)
  children Report[] @relation("ReportHierarchy")
  // ───────────────────────────────────────────────────

  reportesRoles  ReportRole[]
  reportViewLogs ReportViewLog[]

  @@map("cex_reportes")
}
```

**Decisiones:**
- `padreId` nullable → `null` = reporte raíz, con valor = sub-reporte.
- `onDelete: SetNull` → si el padre se elimina, los hijos se convierten en raíces (no se eliminan en cascada).
- Nombre de relación `"ReportHierarchy"` → obligatorio en Prisma para relaciones self-referencing.

### Paso 1.2 — Sincronizar con PostgreSQL

```bash
cd BACKEND
npx prisma db push
```

### Paso 1.3 — Verificar getter en `PrismaService`

No requiere cambio: `get report()` ya expone el delegate completo. Los campos `padre` y `children` se activan vía `include` en las queries, no son columnas que necesiten un getter propio.

---

## Fase 2 — Backend (NestJS)

### Paso 2.1 — Actualizar DTOs

**`BACKEND/src/reports/dto/create-report.dto.ts`** — agregar campo opcional:

```typescript
@IsInt()
@IsOptional()
padreId?: number | null;
```

**`BACKEND/src/reports/dto/update-report.dto.ts`** — mismo campo:

```typescript
@IsInt()
@IsOptional()
padreId?: number | null;
```

### Paso 2.2 — Nuevo endpoint: `GET /api/reports/:id/children`

Archivo: `BACKEND/src/reports/reports.controller.ts`

Agregar un endpoint específico que devuelva los hijos directos de un reporte. El modal de edición lo consumirá para listar los sub-reportes del reporte que se está editando:

```typescript
@Get(':id/children')
@UseGuards(AdminGuard)
async findChildren(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.findChildren(id);
}
```

### Paso 2.3 — Actualizar `ReportsService`

Archivo: `BACKEND/src/reports/reports.service.ts`

**a) Nuevo método `findChildren(parentId)`:**

```typescript
async findChildren(parentId: number) {
  return this.prisma.report.findMany({
    where: { padreId: parentId },
    include: {
      reportesRoles: { include: { rol: true } },
      children: { select: { id: true } }, // para saber si tiene nietos
    },
    orderBy: { id: 'asc' },
  });
}
```

**b) Modificar `findByRole()` — endpoint público (Sidebar):**

Solo devolver reportes raíz (`padreId: null`), con sus `children` anidados recursivamente (2 niveles de include para soportar recursividad visual):

```typescript
async findByRole(rolId: number) {
  const childrenInclude = {
    reportesRoles: { include: { rol: true } },
    children: {
      where: { activo: true },
      include: {
        reportesRoles: { include: { rol: true } },
        children: {
          where: { activo: true },
          include: { reportesRoles: { include: { rol: true } } },
          orderBy: { id: 'asc' as const },
        },
      },
      orderBy: { id: 'asc' as const },
    },
  };

  if (rolId === 1) {
    return this.prisma.report.findMany({
      where: { activo: true, padreId: null },
      include: childrenInclude,
      orderBy: { id: 'asc' },
    });
  }

  // Para no-admin: filtrar por rol en cada nivel
  return this.prisma.report.findMany({
    where: { activo: true, padreId: null, reportesRoles: { some: { rolId } } },
    include: {
      reportesRoles: { include: { rol: true } },
      children: {
        where: { activo: true, reportesRoles: { some: { rolId } } },
        include: {
          reportesRoles: { include: { rol: true } },
          children: {
            where: { activo: true, reportesRoles: { some: { rolId } } },
            include: { reportesRoles: { include: { rol: true } } },
            orderBy: { id: 'asc' as const },
          },
        },
        orderBy: { id: 'asc' as const },
      },
    },
    orderBy: { id: 'asc' },
  });
}
```

**c) Modificar `findAllAdmin()` — tabla de admin:**

Incluir referencia al padre y conteo de hijos para la tabla plana:

```typescript
const REPORT_INCLUDE_ADMIN = {
  reportesRoles: { include: { rol: true } },
  padre: { select: { id: true, titulo: true } },
  _count: { select: { children: true } },
};
```

**d) Modificar `create()` — validar que `padreId` apunte a un reporte válido:**

```typescript
async create(dto: CreateReportDto) {
  if (dto.padreId != null) {
    await this.prisma.report.findUniqueOrThrow({ where: { id: dto.padreId } });
  }

  await this.prisma.report.create({
    data: {
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      urlIframe: dto.urlIframe,
      activo: dto.activo ?? true,
      padreId: dto.padreId ?? null,
      reportesRoles: {
        create: dto.rolesIds.map((rolId) => ({ rolId })),
      },
    },
  });
  return { message: 'Reporte creado exitosamente' };
}
```

**e) Modificar `update()` — validar contra dependencia circular:**

```typescript
if (dto.padreId !== undefined) {
  if (dto.padreId === id) {
    throw new BadRequestException('Un reporte no puede ser padre de sí mismo');
  }
  if (dto.padreId !== null) {
    // Verificar que no se crea un ciclo recorriendo la cadena de ancestros
    let ancestorId: number | null = dto.padreId;
    while (ancestorId !== null) {
      if (ancestorId === id) {
        throw new BadRequestException('Dependencia circular detectada');
      }
      const ancestor = await this.prisma.report.findUnique({
        where: { id: ancestorId },
        select: { padreId: true },
      });
      ancestorId = ancestor?.padreId ?? null;
    }
  }
}
```

---

## Fase 3 — Frontend: Tipos y Hooks

### Paso 3.1 — Actualizar `report.types.ts`

```typescript
export interface Report {
  id: number;
  titulo: string;
  descripcion: string | null;
  urlIframe: string;
  activo: boolean;
  fechaRegistro: string;
  padreId: number | null;
  reportesRoles: ReportRole[];
  children?: Report[];                            // sidebar (anidados)
  padre?: { id: number; titulo: string } | null;  // tabla admin
  _count?: { children: number };                   // tabla admin
}

export interface CreateReportPayload {
  // ...campos existentes sin cambios...
  padreId?: number | null;
}

export interface UpdateReportPayload {
  // ...campos existentes sin cambios...
  padreId?: number | null;
}
```

### Paso 3.2 — Nuevo hook `useChildReports(parentId)`

Archivo: `frontend/src/hooks/useChildReports.ts`

Hook dedicado que el modal de edición usará para listar y crear sub-reportes:

```typescript
export function useChildReports(parentId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['report-children', parentId],
    queryFn: () => api.get<Report[]>(`/api/reports/${parentId}/children`).then(r => r.data),
  });

  const createChild = useMutation({
    mutationFn: (payload: CreateReportPayload) =>
      api.post('/api/reports', { ...payload, padreId: parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-children', parentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  return {
    children: data ?? [],
    isLoading,
    createChild: createChild.mutateAsync,
  };
}
```

---

## Fase 4 — Frontend: Modal de Edición con Sub-reportes

### Paso 4.1 — Nuevo componente `ChildReportsSection`

Archivo: `frontend/src/components/admin/ChildReportsSection.tsx`

Se incrusta dentro de `ReportForm.tsx` cuando `isEditing === true`. Estructura:

```
┌─────────────────────────────────────────────┐
│  Sub-reportes vinculados                    │
│  ┌───────────────────────────────────────┐  │
│  │ 📊 Sub-reporte Alpha    ✓ Activo  ✏️  │  │
│  │ 📊 Sub-reporte Beta     ✗ Inactivo ✏️ │  │
│  └───────────────────────────────────────┘  │
│  [ + Agregar Sub-reporte ]                  │
└─────────────────────────────────────────────┘
```

**Props:**

```typescript
interface ChildReportsSectionProps {
  parentId: number;
  parentTitle: string;
}
```

**Comportamiento:**
- Usa `useChildReports(parentId)` para listar hijos.
- El botón "+ Agregar Sub-reporte" abre un segundo modal (`Modal` con `maxWidth="lg"`) que contiene un `ReportForm` limpio con el `padreId` pre-fijado e invisible.
- El botón "Editar" (ícono lápiz) en cada fila abre el mismo modal en modo edición, con ese sub-reporte como `initialValues`.
- Cada fila muestra: título, estado (badge), conteo de hijos (`_count.children > 0` → badge "N sub-reportes"), botón editar.

### Paso 4.2 — Modificar `ReportForm.tsx`

Cambios mínimos:
- Aceptar nueva prop `lockedParentId?: number` (para cuando se crea un hijo).
- Si `lockedParentId` está presente, enviarlo en el payload de `create` / `update`. No mostrar ningún campo visible al usuario (el parentId queda implícito).
- Después de la sección de "Activo", si `isEditing === true` y `lockedParentId` no está presente, renderizar `<ChildReportsSection parentId={initialValues.id} />`.

```
ReportForm (editando "Reach")
  ├── Título: "Reach"
  ├── URL: https://...
  ├── Descripción
  ├── Roles
  ├── Activo ✓
  ├── ────────────────────────────
  └── <ChildReportsSection parentId={7} parentTitle="Reach" />
        ├── Lista de sub-reportes de "Reach"
        └── [+ Agregar Sub-reporte] → abre Modal con ReportForm(lockedParentId=7)
```

### Paso 4.3 — Ajustar el Modal del `ReportForm`

En `admin/reports/page.tsx`, pasar `maxWidth="lg"` al Modal cuando se edita un reporte (para dar espacio a la sección de sub-reportes):

```typescript
<Modal
  isOpen={showForm}
  onClose={handleCancel}
  title={editingReport ? `Editar: ${editingReport.titulo}` : 'Nuevo Reporte'}
  maxWidth={editingReport ? 'lg' : 'md'}
>
```

### Paso 4.4 — Indicación visual en `ReportTable.tsx`

En la columna "Título", mostrar un badge de conteo de hijos:

```tsx
columnHelper.accessor('titulo', {
  header: 'Título',
  cell: (info) => {
    const report = info.row.original;
    const childCount = report._count?.children ?? 0;
    return (
      <div className="flex items-center gap-2">
        {report.padreId && <span className="text-sidebar-accent text-xs">↳</span>}
        <span className="font-medium ...">{info.getValue()}</span>
        {childCount > 0 && (
          <span className="text-xs bg-sidebar-accent/20 text-sidebar-accent px-1.5 py-0.5 rounded-full">
            {childCount} sub
          </span>
        )}
      </div>
    );
  },
}),
```

---

## Fase 5 — Frontend: Sidebar (Acordeón Recursivo)

### Paso 5.1 — Componente recursivo `SidebarReportItem`

Archivo: dentro de `Sidebar.tsx` (componente interno) o archivo separado.

Un componente que se renderiza a sí mismo para cada nivel de hijos:

```typescript
function SidebarReportItem({
  report,
  selectedReport,
  onSelect,
  expandedIds,
  onToggleExpand,
  depth = 0,
}: {
  report: Report;
  selectedReport: Report | null;
  onSelect: (r: Report) => void;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  depth?: number;
}) {
  const hasChildren = report.children && report.children.length > 0;
  const isExpanded = expandedIds.has(report.id);
  const isActive = selectedReport?.id === report.id;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) onToggleExpand(report.id);
          onSelect(report);
        }}
        className={clsx(NAV_BASE, 'w-full text-left', isActive ? NAV_ACTIVE : NAV_INACTIVE)}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <BarChart2 className={clsx('flex-shrink-0', depth > 0 ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        <span className="truncate flex-1">{report.titulo}</span>
        {hasChildren && (
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-180')} />
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="border-l border-white/10 ml-5">
          {report.children!.map((child) => (
            <SidebarReportItem
              key={child.id}
              report={child}
              selectedReport={selectedReport}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Paso 5.2 — Estado de acordeón en `Sidebar`

```typescript
const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

const toggleExpand = (id: number) => {
  setExpandedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};
```

### Paso 5.3 — Auto-expandir ancestros del reporte seleccionado

Recorrer la cadena de padres para expandir todos los ancestros:

```typescript
useEffect(() => {
  if (!selectedReport) return;
  // Buscar todos los ancestros recorriendo el árbol de reports
  const idsToExpand: number[] = [];
  const findAncestors = (reports: Report[], targetId: number): boolean => {
    for (const r of reports) {
      if (r.id === targetId) return true;
      if (r.children?.length && findAncestors(r.children, targetId)) {
        idsToExpand.push(r.id);
        return true;
      }
    }
    return false;
  };
  findAncestors(reports, selectedReport.id);
  if (idsToExpand.length > 0) {
    setExpandedIds((prev) => new Set([...prev, ...idsToExpand]));
  }
}, [selectedReport, reports]);
```

### Paso 5.4 — Reemplazar el mapeo plano actual

En la sección "Reportes" del Sidebar, reemplazar el `.map()` actual por:

```tsx
{reports.map((report) => (
  <SidebarReportItem
    key={report.id}
    report={report}
    selectedReport={selectedReport}
    onSelect={handleReportSelect}
    expandedIds={expandedIds}
    onToggleExpand={toggleExpand}
  />
))}
```

### Paso 5.5 — Estilos Dark Theme

Todos los estilos ya existentes se mantienen:
- `NAV_BASE` → `border-l-4 bg-sidebar-hover border-l-sidebar-accent`
- `NAV_ACTIVE` / `NAV_INACTIVE` sin cambios
- Línea de conexión: `border-l border-white/10 ml-5`
- El `depth` controla el `paddingLeft` dinámico

---

## Resumen de archivos afectados

| Archivo | Tipo de cambio |
|---|---|
| `BACKEND/prisma/schema.prisma` | `padreId`, `padre`, `children` en modelo Report |
| `BACKEND/src/reports/dto/create-report.dto.ts` | Campo `padreId` opcional |
| `BACKEND/src/reports/dto/update-report.dto.ts` | Campo `padreId` opcional |
| `BACKEND/src/reports/reports.controller.ts` | Nuevo `GET :id/children` |
| `BACKEND/src/reports/reports.service.ts` | `findChildren()`, `findByRole()` recursivo, `create()` con padreId, `update()` anti-circular, `findAllAdmin()` con `_count` |
| `frontend/src/types/report.types.ts` | `padreId`, `children?`, `padre?`, `_count?` |
| `frontend/src/hooks/useChildReports.ts` | **NUEVO** — hook para listar/crear hijos |
| `frontend/src/components/admin/ChildReportsSection.tsx` | **NUEVO** — lista de sub-reportes + botón agregar |
| `frontend/src/components/admin/ReportForm.tsx` | Prop `lockedParentId`, renderiza `ChildReportsSection` al editar |
| `frontend/src/components/admin/ReportTable.tsx` | Badge de conteo de hijos en columna Título |
| `frontend/src/app/dashboard/admin/reports/page.tsx` | `maxWidth="lg"` en modal de edición |
| `frontend/src/components/dashboard/Sidebar.tsx` | `SidebarReportItem` recursivo, acordeón con `expandedIds`, auto-expand ancestros |

---

## Orden de ejecución

```
Fase 1 (BD)       → schema + db push
Fase 2 (Backend)  → DTOs + service + controller
Fase 3 (Tipos)    → report.types.ts + useChildReports.ts
Fase 4 (Admin UI) → ChildReportsSection + ReportForm + ReportTable + page
Fase 5 (Sidebar)  → SidebarReportItem recursivo + acordeón
```
