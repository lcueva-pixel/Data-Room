# Plan 11: Recursividad N-Niveles y Permisos Granulares por Usuario

**Alcance:** Implementar sub-reportes infinitos y permisos de acceso por email/usuario individual  
**Dependencias a instalar:** Ninguna nueva (Prisma, NestJS, React ya disponibles)  
**Archivos afectados:** ~18 (3 creados, 15 modificados)

---

## Contexto

Actualmente el sistema tiene dos limitaciones:

1. **Profundidad fija:** `findByRole()` en `reports.service.ts` hardcodea 3 niveles de include (raiz -> hijos -> nietos). No soporta sub-sub-sub-reportes.
2. **Permisos solo por Rol:** La tabla `cex_reportes_roles` vincula reportes con roles completos. No hay forma de dar acceso a un usuario individual sin cambiar su rol.

Este plan introduce:
- **Recursividad real** a N niveles (sin limite de profundidad).
- **Permisos hibridos:** un usuario ve un reporte si (su Rol esta en `ReportRole`) **O** (su Email/ID esta en una lista blanca especifica del reporte).

---

## Fase 1: Arquitectura de Base de Datos (Prisma)

### 1.1 — Analisis del Modelo Actual de Report

| Archivo | Ruta |
|---------|------|
| `schema.prisma` | `BACKEND/prisma/schema.prisma` (lineas 38-55) |

**Estado actual:**
```prisma
model Report {
  padreId  Int?     @map("padre_id")
  padre    Report?  @relation("ReportHierarchy", fields: [padreId], references: [id], onDelete: SetNull)
  children Report[] @relation("ReportHierarchy")
  // ...
}
```

**Soporte de recursividad:** El modelo Prisma ya soporta N niveles de jerarquia. La relacion `ReportHierarchy` es auto-referencial y no tiene limite de profundidad. **El problema no es el esquema, sino las consultas** que hardcodean niveles de `include`.

### 1.2 — Nueva Tabla: `ReportUserAccess` (Permisos por Usuario)

Agregar al schema de Prisma:

```prisma
model ReportUserAccess {
  reporteId Int @map("reporte_id")
  usuarioId Int @map("usuario_id")

  reporte Report @relation(fields: [reporteId], references: [id], onDelete: Cascade)
  usuario User   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@id([reporteId, usuarioId])
  @@map("cex_reportes_usuarios")
}
```

**Relaciones a agregar en modelos existentes:**

```prisma
// En model Report (agregar campo):
reportesUsuarios ReportUserAccess[]

// En model User (agregar campo):
reportesAcceso ReportUserAccess[]
```

### 1.3 — Migracion Prisma

```bash
cd BACKEND
npx prisma migrate dev --name add-report-user-access
```

**Tabla resultante `cex_reportes_usuarios`:**

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `reporte_id` | INT (PK, FK) | ID del reporte |
| `usuario_id` | INT (PK, FK) | ID del usuario con acceso especial |

---

## Fase 2: Logica Backend (NestJS)

### 2.1 — Consulta Recursiva para N-Niveles

| Archivo | Ruta |
|---------|------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` (lineas 34-78) |

**Problema actual:** `findByRole()` construye un `include` anidado de 3 niveles estaticos. Agregar un 4to nivel requiere modificar el codigo.

**Solucion — Estrategia de 2 pasos:**

1. **Paso 1:** Obtener TODOS los reportes activos accesibles en una sola query plana (sin include de children).
2. **Paso 2:** Construir el arbol en memoria con una funcion `buildTree()`.

```typescript
// reports.service.ts — nuevo metodo
async findByRoleRecursive(rolId: number, userId: number) {
  // Paso 1: Query plana — obtener todos los reportes accesibles
  const allReports = await this.prisma.report.findMany({
    where: {
      activo: true,
      OR: [
        // Acceso por Rol
        ...(rolId === 1
          ? [{}]  // Admin ve todo
          : [{ reportesRoles: { some: { rolId } } }]
        ),
        // Acceso por Usuario individual
        { reportesUsuarios: { some: { usuarioId: userId } } },
      ],
    },
    include: {
      reportesRoles: { include: { rol: true } },
      reportesUsuarios: { select: { usuarioId: true } },
    },
    orderBy: { id: 'asc' },
  });

  // Paso 2: Construir arbol en memoria
  return this.buildTree(allReports);
}

private buildTree(reports: Report[]): Report[] {
  const map = new Map<number, Report & { children: Report[] }>();
  const roots: Report[] = [];

  // Indexar todos los reportes por ID
  for (const r of reports) {
    map.set(r.id, { ...r, children: [] });
  }

  // Construir relaciones padre-hijo
  for (const r of reports) {
    const node = map.get(r.id)!;
    if (r.padreId && map.has(r.padreId)) {
      map.get(r.padreId)!.children.push(node);
    } else {
      // Es raiz (padreId = null) O su padre no esta en la lista de accesibles
      roots.push(node);
    }
  }

  return roots;
}
```

**Ventajas de esta estrategia:**
- **Una sola query** a la BD (vs. N queries anidadas actuales).
- **N niveles** sin limite: la construccion del arbol es O(n).
- **Permisos hibridos** ya integrados en el `OR` del `where`.

**Nota importante sobre visibilidad de ancestros:** Si un usuario tiene acceso a un sub-reporte de nivel 3 pero NO a su padre de nivel 2, el sub-reporte aparecera como raiz en su sidebar. Esto es intencional — evita exponer titulos de reportes a los que no tiene acceso. Si se desea mostrar la ruta completa (breadcrumb), se necesitaria una query adicional de ancestros con `select: { titulo: true }` unicamente.

### 2.2 — Autorizacion Hibrida (Rol + Usuario)

| Archivo | Ruta |
|---------|------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` |
| `reports.controller.ts` | `BACKEND/src/reports/reports.controller.ts` |

**Cambio en el Controller:** El endpoint `GET /reports` debe recibir tanto `rol_id` como `userId` del JWT:

```typescript
// reports.controller.ts
@Get()
@UseGuards(JwtAuthGuard)
findAll(@Request() req) {
  return this.reportsService.findByRoleRecursive(req.user.rol_id, req.user.userId);
}
```

**Logica de acceso (pseudocodigo):**
```
PUEDE_VER(usuario, reporte) =
    usuario.rol_id == 1                                    // Es admin
  OR reporte.reportesRoles.some(rr => rr.rolId == usuario.rol_id)  // Su rol tiene acceso
  OR reporte.reportesUsuarios.some(ru => ru.usuarioId == usuario.id) // Acceso individual
```

### 2.3 — Actualizar DTOs para Permisos por Usuario

| Archivo | Ruta |
|---------|------|
| `create-report.dto.ts` | `BACKEND/src/reports/dto/create-report.dto.ts` |
| `update-report.dto.ts` | `BACKEND/src/reports/dto/update-report.dto.ts` |

**Agregar campo `usuariosIds`:**

```typescript
// create-report.dto.ts
@IsArray()
@IsInt({ each: true })
@IsOptional()
usuariosIds?: number[];  // IDs de usuarios con acceso individual
```

```typescript
// update-report.dto.ts
@IsArray()
@IsInt({ each: true })
@IsOptional()
usuariosIds?: number[];
```

### 2.4 — Actualizar el Servicio de Reportes (CRUD)

| Archivo | Ruta |
|---------|------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` (lineas 125-199) |

**En `create()`:** Agregar creacion de `reportesUsuarios` junto con `reportesRoles`:

```typescript
// Dentro de prisma.report.create({ data: { ... } })
reportesUsuarios: dto.usuariosIds?.length
  ? { create: dto.usuariosIds.map((usuarioId) => ({ usuarioId })) }
  : undefined,
```

**En `update()`:** Agregar delete + recreate de `reportesUsuarios` (mismo patron que `reportesRoles`):

```typescript
...(dto.usuariosIds !== undefined && {
  reportesUsuarios: {
    deleteMany: {},
    create: dto.usuariosIds.map((usuarioId) => ({ usuarioId })),
  },
}),
```

### 2.5 — Nuevo Endpoint: Buscar Usuarios por Email

| Archivo | Ruta |
|---------|------|
| `users.controller.ts` | `BACKEND/src/users/users.controller.ts` |
| `users.service.ts` | `BACKEND/src/users/users.service.ts` |

**Proposito:** El admin necesita un endpoint para buscar usuarios por email al asignar permisos.

```typescript
// users.controller.ts
@Get('search')
@UseGuards(JwtAuthGuard, AdminGuard)
searchByEmail(@Query('email') email: string) {
  return this.usersService.searchByEmail(email);
}

// users.service.ts
async searchByEmail(email: string) {
  return this.prisma.user.findMany({
    where: {
      email: { contains: email, mode: 'insensitive' },
      activo: true,
    },
    select: { id: true, email: true, nombreCompleto: true },
    take: 10,  // Limitar resultados del autocomplete
  });
}
```

---

## Fase 3: Frontend UI/UX (Next.js)

### 3.1 — Sidebar Recursivo sin Limite de Profundidad

| Archivo | Ruta |
|---------|------|
| `Sidebar.tsx` | `frontend/src/components/dashboard/Sidebar.tsx` (lineas 42-104) |

**Estado actual:** El componente `SidebarReportItem` **ya es recursivo** (se llama a si mismo en linea 90-98). Sin embargo, el backend solo envia 3 niveles.

**Cambios necesarios:**

1. **Ningun cambio en `SidebarReportItem`** — ya soporta N niveles gracias a la recursion.
2. **Ajuste visual de profundidad:** Limitar el padding izquierdo maximo para evitar que items muy profundos desaparezcan:

```typescript
// Sidebar.tsx linea 73
style={{ paddingLeft: `${12 + Math.min(depth, 5) * 16}px` }}
```

3. **Indicador de nivel:** Para niveles > 2, reducir el tamanio del icono progresivamente:

```typescript
// Sidebar.tsx linea 75
const iconSize = depth === 0 ? 'w-4 h-4' : depth <= 2 ? 'w-3.5 h-3.5' : 'w-3 h-3';
```

4. **Linea de conexion visual:** La linea `border-l border-white/10 ml-5` (linea 88) ya proporciona indentacion visual. Se mantiene.

### 3.2 — Actualizar el Hook `useReports`

| Archivo | Ruta |
|---------|------|
| `useReports.ts` | `frontend/src/hooks/useReports.ts` |

**Cambio:** No requiere modificacion si el endpoint `GET /reports` sigue devolviendo el mismo formato (arbol de reportes). La unica diferencia es que ahora el backend construye el arbol con logica hibrida y sin limite de profundidad. El contrato de la API no cambia.

### 3.3 — Actualizar Tipos TypeScript

| Archivo | Ruta |
|---------|------|
| `report.types.ts` | `frontend/src/types/report.types.ts` |

**Agregar:**

```typescript
export interface ReportUserAccess {
  usuarioId: number;
  usuario?: {
    id: number;
    email: string;
    nombreCompleto: string;
  };
}

// Agregar al interface Report:
reportesUsuarios?: ReportUserAccess[];

// Agregar a CreateReportPayload y UpdateReportPayload:
usuariosIds?: number[];
```

### 3.4 — UI de Permisos Especiales en el Modal de Reporte

| Archivo | Ruta |
|---------|------|
| `ReportForm.tsx` | `frontend/src/components/admin/ReportForm.tsx` |

**Componente nuevo a crear: `UserAccessSelector.tsx`**

| Archivo | Ruta |
|---------|------|
| `UserAccessSelector.tsx` | `frontend/src/components/admin/UserAccessSelector.tsx` (NUEVO) |

**Diseno del componente:**

```
+---------------------------------------------------------------+
| Acceso especial por usuario                                   |
+---------------------------------------------------------------+
| Buscar por email:                                             |
| [  usuario@correo.com                              ] [Buscar] |
|                                                               |
|  Sugerencias:                                                 |
|  > juan.perez@empresa.com  —  Juan Perez           [+ Agregar]|
|  > maria.lopez@empresa.com —  Maria Lopez          [+ Agregar]|
|                                                               |
|  Usuarios con acceso:                                         |
|  [x] carlos@empresa.com  —  Carlos Garcia          [Quitar]  |
|  [x] ana@empresa.com     —  Ana Martinez           [Quitar]  |
+---------------------------------------------------------------+
```

**Logica del componente:**

1. **Input de busqueda** con debounce de 300ms.
2. **Fetch** a `GET /users/search?email=<query>` (endpoint nuevo del paso 2.5).
3. **Lista de sugerencias** desplegable debajo del input.
4. **Chips/tags** para los usuarios ya seleccionados con boton de quitar.
5. **Prop `value`:** `number[]` (array de `userId`s seleccionados).
6. **Prop `onChange`:** `(ids: number[]) => void`.

**Integracion en `ReportForm.tsx`:**

```typescript
// Agregar al schema de Zod:
usuariosIds: z.array(z.number()).optional().default([]),

// Agregar despues de la seccion de roles (checkboxes):
<UserAccessSelector
  value={watch('usuariosIds')}
  onChange={(ids) => setValue('usuariosIds', ids)}
  existingUsers={report?.reportesUsuarios ?? []}
/>
```

### 3.5 — Hook para Busqueda de Usuarios

| Archivo | Ruta |
|---------|------|
| `useUserSearch.ts` | `frontend/src/hooks/useUserSearch.ts` (NUEVO) |

```typescript
export function useUserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const { data } = await api.get(`/users/search?email=${query}`);
      setResults(data);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, isLoading };
}
```

### 3.6 — Actualizar el Hook `useAdminReports`

| Archivo | Ruta |
|---------|------|
| `useAdminReports.ts` | `frontend/src/hooks/useAdminReports.ts` |

**Cambio:** Incluir `usuariosIds` en los payloads de `createReport()` y `updateReport()`. El hook ya pasa el DTO completo, solo hay que asegurar que el tipo lo incluya.

---

## Resumen de Archivos Afectados

| # | Archivo | Tipo | Accion |
|:-:|---------|------|--------|
| 1 | `BACKEND/prisma/schema.prisma` | Schema | Agregar modelo `ReportUserAccess` + relaciones |
| 2 | `BACKEND/src/reports/reports.service.ts` | Backend | Refactorizar `findByRole` a recursivo + permisos hibridos |
| 3 | `BACKEND/src/reports/reports.controller.ts` | Backend | Pasar `userId` al servicio |
| 4 | `BACKEND/src/reports/dto/create-report.dto.ts` | Backend | Agregar `usuariosIds` |
| 5 | `BACKEND/src/reports/dto/update-report.dto.ts` | Backend | Agregar `usuariosIds` |
| 6 | `BACKEND/src/users/users.service.ts` | Backend | Agregar `searchByEmail()` |
| 7 | `BACKEND/src/users/users.controller.ts` | Backend | Agregar endpoint `GET /users/search` |
| 8 | `frontend/src/types/report.types.ts` | Tipos | Agregar `ReportUserAccess`, `usuariosIds` |
| 9 | `frontend/src/components/dashboard/Sidebar.tsx` | Frontend | Ajustar padding/iconos para profundidad N |
| 10 | `frontend/src/components/admin/ReportForm.tsx` | Frontend | Integrar `UserAccessSelector` |
| 11 | `frontend/src/components/admin/UserAccessSelector.tsx` | Frontend | **NUEVO** — Buscador multiselect de usuarios |
| 12 | `frontend/src/hooks/useUserSearch.ts` | Frontend | **NUEVO** — Hook de busqueda por email |
| 13 | `frontend/src/hooks/useAdminReports.ts` | Frontend | Incluir `usuariosIds` en payloads |
| 14 | `frontend/src/hooks/useReports.ts` | Frontend | Sin cambios (contrato API se mantiene) |

---

## Diagrama de Flujo de Permisos (Post-Implementacion)

```
                    Usuario solicita ver reporte X
                                |
                                v
                    +------------------------+
                    |  Es Administrador?     |
                    |  (rol_id === 1)        |
                    +------------------------+
                      |  SI              |  NO
                      v                  v
                  [PERMITIR]    +------------------------+
                                |  Rol en ReportRole?    |
                                |  (cex_reportes_roles)  |
                                +------------------------+
                                  |  SI              |  NO
                                  v                  v
                              [PERMITIR]    +------------------------+
                                            |  User en ReportUser?   |
                                            |  (cex_reportes_usuarios)|
                                            +------------------------+
                                              |  SI              |  NO
                                              v                  v
                                          [PERMITIR]         [DENEGAR]
```

---

## Orden de Implementacion Recomendado

| Paso | Tarea | Dependencia |
|:----:|-------|:-----------:|
| 1 | Migracion Prisma (modelo `ReportUserAccess`) | Ninguna |
| 2 | Backend: `searchByEmail()` en users | Paso 1 |
| 3 | Backend: Refactorizar `findByRoleRecursive()` + `buildTree()` | Paso 1 |
| 4 | Backend: Actualizar DTOs con `usuariosIds` | Paso 1 |
| 5 | Backend: Actualizar `create()` y `update()` en reports service | Pasos 1, 4 |
| 6 | Frontend: Tipos TypeScript | Paso 4 |
| 7 | Frontend: `useUserSearch` hook | Paso 2 |
| 8 | Frontend: `UserAccessSelector` componente | Pasos 6, 7 |
| 9 | Frontend: Integrar en `ReportForm` | Paso 8 |
| 10 | Frontend: Ajustes de Sidebar para N niveles | Paso 3 |

---

## Checklist de Verificacion

### Recursividad
- [ ] Crear reporte A (raiz) -> sub-reporte B -> sub-sub-reporte C -> sub-sub-sub-reporte D
- [ ] Sidebar muestra los 4 niveles con acordeon funcional
- [ ] Padding e iconos se ajustan por nivel sin desbordar
- [ ] Admin ve toda la jerarquia en la tabla de gestion
- [ ] Eliminar (desactivar) un padre no elimina los hijos (onDelete: SetNull)

### Permisos por Usuario
- [ ] Admin asigna acceso individual a usuario X para reporte Y
- [ ] Usuario X (con rol no-admin) ve reporte Y en su sidebar
- [ ] Usuario Z (mismo rol que X, sin acceso individual) NO ve reporte Y
- [ ] Admin quita acceso individual -> usuario X ya no ve reporte Y
- [ ] Buscador de emails autocompleta correctamente
- [ ] No se pueden agregar usuarios duplicados al mismo reporte

### Permisos Hibridos
- [ ] Reporte con Rol 2 asignado + Usuario X individual: ambos lo ven
- [ ] Quitar Rol 2 -> solo usuario X sigue viendolo
- [ ] Quitar usuario X -> solo usuarios con Rol 2 lo ven
- [ ] Admin siempre ve todo, independientemente de la tabla de permisos
