# Plan de Acción — Optimización del Dashboard

---

## Fase 1 — Base de Datos (Prisma)

### Paso 1.1 — Eliminar columna `ip_address` del modelo `AuditAccess`

Archivo: `BACKEND/prisma/schema.prisma`

Eliminar la línea:

```prisma
ipAddress String?  @map("ip_address") @db.VarChar(45)
```

El modelo queda:

```prisma
model AuditAccess {
  id        Int      @id @default(autoincrement())
  usuarioId Int      @map("usuario_id")
  fechaHora DateTime @default(now()) @map("fecha_hora") @db.Timestamptz
  userAgent String?  @map("user_agent")

  usuario User @relation(fields: [usuarioId], references: [id])

  @@map("cex_auditoria_accesos")
}
```

### Paso 1.2 — Sincronizar con la BD

```bash
cd BACKEND && npx prisma db push
```

> `db push` aplicará un `ALTER TABLE cex_auditoria_accesos DROP COLUMN ip_address`.
> Los datos existentes en esa columna se pierden. Dado que el usuario pidió eliminarla, esto es intencional.

---

## Fase 2 — Backend (NestJS)

### Paso 2.1 — Limpiar referencia a IP en `AuthService`

Archivo: `BACKEND/src/auth/auth.service.ts`

**Estado actual:** `validateUser(email, password, ipAddress, userAgent)` recibe `ipAddress` y lo guarda en `auditAccess.create({ data: { usuarioId, ipAddress, userAgent } })`.

**Cambio:**
- Eliminar el parámetro `ipAddress` de la firma de `validateUser`.
- Eliminar `ipAddress` del objeto `data` en `auditAccess.create`.

```typescript
// ANTES
async validateUser(email, password, ipAddress, userAgent) {
  ...
  await this.prisma.auditAccess.create({
    data: { usuarioId: user.id, ipAddress, userAgent },
  });
}

// DESPUÉS
async validateUser(email: string, password: string, userAgent: string) {
  ...
  await this.prisma.auditAccess.create({
    data: { usuarioId: user.id, userAgent },
  });
}
```

### Paso 2.2 — Limpiar referencia a IP en `AuthController`

Archivo: `BACKEND/src/auth/auth.controller.ts`

**Estado actual:** Extrae `req.ip || req.headers['x-forwarded-for']` y lo pasa a `validateUser`.

**Cambio:** Eliminar la variable `ipAddress` y actualizar la llamada:

```typescript
// ANTES
const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
const userAgent = req.headers['user-agent'] || '';
const user = await this.authService.validateUser(loginDto.email, loginDto.password, ipAddress, userAgent);

// DESPUÉS
const userAgent = req.headers['user-agent'] || '';
const user = await this.authService.validateUser(loginDto.email, loginDto.password, userAgent);
```

### Paso 2.3 — Limpiar tipos de auditoría

Archivo: `BACKEND/src/audit/types/audit.types.ts`

Si `AuditAccessRecord` tiene un campo `ipAddress`, eliminarlo.

### Paso 2.4 — Paginación y filtros en `AuditService`

Archivo: `BACKEND/src/audit/audit.service.ts`

**Estado actual:** `findAll()` sin parámetros, devuelve **todos** los registros mezclados de `AuditAccess` + `ReportViewLog` ordenados por fecha.

**Cambio:** Reescribir `findAll(query: PaginationQueryDto)` con la misma lógica de paginación que ya usamos en `ReportsService.findAllAdmin()`:

```typescript
async findAll(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  // 1. Traer TODOS los registros de ambas tablas (la mezcla requiere unión en memoria)
  const [accesos, visualizaciones] = await Promise.all([
    this.prisma.auditAccess.findMany({
      select: { id: true, fechaHora: true, usuario: { select: { nombreCompleto: true, email: true } } },
    }),
    this.prisma.reportViewLog.findMany({
      select: { id: true, fechaHora: true, duracion: true,
        reporte: { select: { titulo: true } },
        usuario: { select: { nombreCompleto: true, email: true } } },
    }),
  ]);

  // 2. Mapear a UnifiedAuditEntry[]
  let entries = [...mapAccesos(accesos), ...mapVisualizaciones(visualizaciones)];

  // 3. Filtro de búsqueda (por nombre o email de usuario)
  if (query.search) {
    const s = query.search.toLowerCase();
    entries = entries.filter(e =>
      e.usuario.nombreCompleto.toLowerCase().includes(s) ||
      e.usuario.email.toLowerCase().includes(s)
    );
  }

  // 4. Ordenar por fecha descendente
  entries.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

  // 5. Paginar
  const total = entries.length;
  const paginated = entries.slice((page - 1) * limit, page * limit);

  return buildPaginatedResponse(paginated, total, page, limit);
}
```

> **Nota:** La paginación se hace en memoria porque los datos vienen de 2 tablas distintas mezcladas. Esto es aceptable para volúmenes de auditoría normales (miles de registros). Para cientos de miles, se debería considerar una vista SQL.

### Paso 2.5 — Actualizar `AuditController`

Archivo: `BACKEND/src/audit/audit.controller.ts`

Agregar `@Query() query: PaginationQueryDto` al `findAll()`:

```typescript
@Get()
@UseGuards(AdminGuard)
findAll(@Query() query: PaginationQueryDto) {
  return this.auditService.findAll(query);
}
```

### Paso 2.6 — Verificar que `UsersService` y `UsersController` ya tienen paginación

Archivos: `BACKEND/src/users/users.service.ts`, `BACKEND/src/users/users.controller.ts`

> Estos ya implementan paginación con `ListUsersQueryDto`. Verificar que no necesitan cambios. Si la tabla de usuarios del frontend ya pagina, este paso es solo una confirmación.

---

## Fase 3 — Frontend: Tablas con Paginación

### Paso 3.1 — Actualizar tipos de auditoría

Archivo: `frontend/src/types/audit.types.ts`

Agregar interfaces de paginación:

```typescript
export interface PaginatedAudit {
  data: AuditEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AuditListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
```

### Paso 3.2 — Reescribir `useAudit` con React Query y paginación

Archivo: `frontend/src/hooks/useAudit.ts`

**Estado actual:** `useState` + `useEffect` + `api.get<AuditEntry[]>('/audit')` — sin paginación.

**Cambio:** Migrar al patrón React Query idéntico a `useAdminReports`:

```typescript
export function useAudit() {
  const [query, setQuery] = useState<AuditListQuery>({ page: 1, limit: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', query],
    queryFn: () => api.get<PaginatedAudit>('/audit', { params: query }).then(r => r.data),
  });

  return {
    entries: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    query,
    setPage: (page) => setQuery(q => ({ ...q, page })),
    setSearch: (search) => setQuery(q => ({ ...q, search: search || undefined, page: 1 })),
    setLimit: (limit) => setQuery(q => ({ ...q, limit, page: 1 })),
  };
}
```

### Paso 3.3 — Actualizar `AuditTable` con PaginationBar y búsqueda

Archivo: `frontend/src/components/admin/AuditTable.tsx`

**Estado actual:** Tabla HTML plana con `entries.map(...)`, sin paginación ni búsqueda.

**Cambio:** Copiar el patrón de `ReportTable.tsx`:
- Agregar input de búsqueda con debounce 300ms
- Agregar selector de cantidad por página (5/10/20/50)
- Agregar `PaginationBar` al pie de la tabla (copiar el componente interno de `ReportTable`)
- Actualizar props para recibir `meta`, `query`, `onSearch`, `onPageChange`, `onLimitChange`

### Paso 3.4 — Actualizar `AuditPage` para pasar las nuevas props

Archivo: `frontend/src/app/dashboard/admin/audit/page.tsx`

**Estado actual:**

```tsx
const { entries, isLoading, error, refetch } = useAudit();
<AuditTable entries={entries} isLoading={isLoading} error={error} onRefetch={refetch} />
```

**Cambio:**

```tsx
const { entries, meta, isLoading, query, setPage, setSearch, setLimit } = useAudit();
<AuditTable
  entries={entries}
  meta={meta}
  isLoading={isLoading}
  query={query}
  onSearch={setSearch}
  onPageChange={setPage}
  onLimitChange={setLimit}
/>
```

---

## Fase 4 — Auth Redirect + Sidebar Hover

### Paso 4.1 — Cambiar redirección post-login a Overview

Archivo: `frontend/src/context/AuthContext.tsx`

**Estado actual (línea 38):** `router.push('/dashboard')` — esto carga `dashboard/page.tsx` que auto-selecciona el primer reporte.

**Cambio:**

```typescript
router.push('/dashboard/overview');
```

Esto lleva al usuario a la página de Overview en vez de cargar automáticamente un reporte.

### Paso 4.2 — Sidebar: desplegar sub-reportes con hover

Archivo: `frontend/src/components/dashboard/Sidebar.tsx` — componente `SidebarReportItem`

**Estado actual:** El `onClick` hace dos cosas simultáneas: (1) toggle del acordeón y (2) selecciona el reporte (carga iframe).

**Cambio:** Separar las dos interacciones:
- **Hover (`onMouseEnter`):** Expande los hijos (si los tiene) automáticamente.
- **Click:** Solo selecciona el reporte (carga el iframe). Ya no hace toggle del acordeón.
- **Mouse leave en el grupo:** Colapsa los hijos, excepto si el reporte seleccionado es un hijo (mantener expandido).

```tsx
// SidebarReportItem — cambio conceptual
<div
  onMouseEnter={() => { if (hasChildren) onToggleExpand(report.id, true); }}
  onMouseLeave={() => {
    if (hasChildren && !childIsSelected) onToggleExpand(report.id, false);
  }}
>
  <button onClick={() => onSelect(report)}>
    {/* título + chevron */}
  </button>

  {hasChildren && isExpanded && (
    <div className="border-l border-white/10 ml-5">
      {report.children!.map(child => <SidebarReportItem ... />)}
    </div>
  )}
</div>
```

Actualizar `toggleExpand` para aceptar un valor forzado (`true`/`false`) además del toggle:

```typescript
const setExpanded = (id: number, open: boolean) => {
  setExpandedIds(prev => {
    const next = new Set(prev);
    if (open) next.add(id);
    else next.delete(id);
    return next;
  });
};
```

Mantener la lógica de auto-expand del `useEffect` para que si un hijo está seleccionado, el padre no se cierre al salir el mouse.

---

## Resumen de archivos afectados

| Fase | Archivo | Cambio |
|---|---|---|
| 1 | `BACKEND/prisma/schema.prisma` | Eliminar `ipAddress` de `AuditAccess` |
| 2 | `BACKEND/src/auth/auth.service.ts` | Eliminar parámetro `ipAddress` de `validateUser` |
| 2 | `BACKEND/src/auth/auth.controller.ts` | Eliminar extracción de `req.ip` |
| 2 | `BACKEND/src/audit/types/audit.types.ts` | Eliminar campo `ipAddress` si existe |
| 2 | `BACKEND/src/audit/audit.service.ts` | Reescribir `findAll(query)` con paginación + búsqueda |
| 2 | `BACKEND/src/audit/audit.controller.ts` | Agregar `@Query() query` al `findAll()` |
| 3 | `frontend/src/types/audit.types.ts` | Agregar `PaginatedAudit`, `AuditListQuery` |
| 3 | `frontend/src/hooks/useAudit.ts` | Migrar a React Query + paginación |
| 3 | `frontend/src/components/admin/AuditTable.tsx` | Agregar búsqueda, paginación, selector por página |
| 3 | `frontend/src/app/dashboard/admin/audit/page.tsx` | Actualizar props al nuevo hook |
| 4 | `frontend/src/context/AuthContext.tsx` | `router.push('/dashboard/overview')` |
| 4 | `frontend/src/components/dashboard/Sidebar.tsx` | Hover para expandir sub-reportes |

---

## Orden de ejecución

```
Fase 1 → schema.prisma + db push
Fase 2 → auth.service → auth.controller → audit types → audit.service → audit.controller
Fase 3 → audit.types frontend → useAudit → AuditTable → AuditPage
Fase 4 → AuthContext redirect → Sidebar hover
```
