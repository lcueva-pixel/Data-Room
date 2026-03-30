# PLAN DE ACCIÓN — Mejoras de Arquitectura y UX/UI
**Proyecto:** LockerStudio Admin Panel
**Fecha:** 2026-03-27
**Estado:** PENDIENTE DE APROBACIÓN

---

## Contexto del Estado Actual

| Elemento | Estado Actual |
|---|---|
| `GET /users` | Devuelve **todos** los usuarios sin paginación |
| `GET /reports/admin` | Devuelve **todos** los reportes sin paginación |
| `DELETE /reports/:id` | Hard delete (elimina fila de la BD) |
| `DELETE /users/:id` | Ya es soft delete (activo=false) vía endpoint DELETE |
| `UserTable` / `ReportTable` | Tablas HTML simples, sin TanStack Table |
| Actualización de datos | `refetch()` manual tras cada mutación |
| Formulario de edición | Se abre como bloque inline sobre la tabla |
| `AuditTable` | Tiene columna IP visible |

---

## Resumen de Fases

| Fase | Área | Descripción |
|---|---|---|
| 1 | Backend | DTO de paginación compartido |
| 2 | Backend | Endpoint `GET /users` con paginación/filtros |
| 3 | Backend | Endpoint `GET /reports/admin` con paginación/filtros |
| 4 | Backend | Endpoints `PATCH /toggle` para Usuarios y Reportes |
| 5 | Backend | Auditoría — eliminar IP de la respuesta |
| 6 | Frontend | Instalación de dependencias (TanStack Table + React Query) |
| 7 | Frontend | `QueryClientProvider` en layout raíz |
| 8 | Frontend | Tipos TypeScript para respuestas paginadas |
| 9 | Frontend | Hook `useUsers` refactorizado con React Query |
| 10 | Frontend | Hook `useAdminReports` refactorizado con React Query |
| 11 | Frontend | Componente reutilizable `ToggleSwitch` |
| 12 | Frontend | Componente reutilizable `Modal` |
| 13 | Frontend | `UserTable` con TanStack Table + paginación + filtros |
| 14 | Frontend | `ReportTable` con TanStack Table + paginación + filtros |
| 15 | Frontend | `users/page.tsx` — UserForm en Modal |
| 16 | Frontend | `reports/page.tsx` — ReportForm en Modal |
| 17 | Frontend | `AuditTable` — eliminar columna IP |

---

## FASE 1 — Backend: DTO de Paginación Compartido

**Archivo a crear:** `BACKEND/src/common/dto/pagination-query.dto.ts`

Crea un DTO genérico y reutilizable para todos los endpoints que admitan paginación.

**Campos del DTO:**
- `page?: number` — número de página (default: 1, mínimo: 1)
- `limit?: number` — registros por página (default: 10, mínimo: 1, máximo: 100)
- `search?: string` — texto libre para buscar en campos de texto relevantes
- `sortBy?: string` — nombre del campo por el que se ordena
- `order?: 'asc' | 'desc'` — dirección del ordenamiento (default: 'asc')

**Decoradores NestJS a usar:** `@IsOptional()`, `@IsInt()`, `@Min()`, `@Max()`, `@IsString()`, `@IsIn()`, `@Type(() => Number)` del paquete `class-transformer`.

**Archivo a crear:** `BACKEND/src/common/dto/paginated-response.dto.ts`

Interfaz/clase de respuesta genérica que todos los endpoints de listado devolverán:
```
{
  data: T[],
  meta: {
    total: number,     // total de registros que coinciden con los filtros
    page: number,      // página actual
    limit: number,     // registros por página
    totalPages: number // Math.ceil(total / limit)
  }
}
```

---

## FASE 2 — Backend: Endpoint `GET /users` con Paginación y Filtros

**Archivos a modificar:**
- `BACKEND/src/users/dto/` — crear `list-users-query.dto.ts`
- `BACKEND/src/users/users.service.ts` — modificar `findAll()`
- `BACKEND/src/users/users.controller.ts` — modificar `@Get()`

### 2.1 — Nuevo DTO `ListUsersQueryDto`

Extiende `PaginationQueryDto` agregando filtros específicos de usuarios:
- `rolId?: number` — filtrar por ID de rol (`@Type(() => Number)`)
- `activo?: boolean` — filtrar por estado activo/inactivo (`@Transform` para parsear string 'true'/'false')

**Campos de búsqueda aplicables al `search`:** `nombreCompleto` y `email`.

**Campos válidos para `sortBy`:** `'id'`, `'nombreCompleto'`, `'email'`, `'fechaCreacion'`. Si llega un valor inválido, ignorarlo y usar `'id'`.

### 2.2 — Modificación de `users.service.ts`

Reemplazar `findAll()` sin parámetros por `findAll(query: ListUsersQueryDto)`.

**Lógica de construcción de la consulta Prisma:**

```
// skip / take
const skip = (page - 1) * limit
const take = limit

// where
where: {
  AND: [
    search ? {
      OR: [
        { nombreCompleto: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {},
    rolId ? { rolId } : {},
    activo !== undefined ? { activo } : {}
  ]
}

// orderBy
orderBy: { [validatedSortBy]: order }
```

Ejecutar dos consultas en paralelo con `Promise.all`:
1. `prisma.user.findMany({ where, skip, take, orderBy, include: { rol: true } })`
2. `prisma.user.count({ where })` — para obtener el total real filtrado

Devolver `{ data, meta: { total, page, limit, totalPages } }`.

**Campos a excluir de la respuesta:** `passwordHash` — usar `select` explícito o desestructuración.

### 2.3 — Modificación de `users.controller.ts`

El método `findAll` pasa de no recibir argumentos a recibir `@Query() query: ListUsersQueryDto`.

---

## FASE 3 — Backend: Endpoint `GET /reports/admin` con Paginación y Filtros

**Archivos a modificar:**
- `BACKEND/src/reports/dto/` — crear `list-reports-query.dto.ts`
- `BACKEND/src/reports/reports.service.ts` — modificar `findAllAdmin()`
- `BACKEND/src/reports/reports.controller.ts` — modificar `@Get('admin')`

### 3.1 — Nuevo DTO `ListReportsQueryDto`

Extiende `PaginationQueryDto` agregando:
- `activo?: boolean` — filtrar por estado activo/inactivo

**Campos de búsqueda aplicables al `search`:** `titulo` y `descripcion`.

**Campos válidos para `sortBy`:** `'id'`, `'titulo'`, `'fechaRegistro'`.

### 3.2 — Modificación de `reports.service.ts`

Reemplazar `findAllAdmin()` por `findAllAdmin(query: ListReportsQueryDto)`.

**Lógica idéntica a usuarios** pero adaptada al modelo `Report`:
- `where.titulo` y `where.descripcion` para el `search`
- Incluir `reportesRoles: { include: { rol: true } }` en el `findMany`
- Devolver `{ data, meta: { total, page, limit, totalPages } }`

### 3.3 — Modificación de `reports.controller.ts`

El método `findAllAdmin` recibe `@Query() query: ListReportsQueryDto`.

---

## FASE 4 — Backend: Endpoints PATCH `/toggle` para Usuarios y Reportes

Esta fase reemplaza la semántica de activar/desactivar del endpoint DELETE/PUT por un endpoint PATCH semánticamente correcto.

### 4.1 — Usuarios: `PATCH /users/:id/toggle`

**Servicio** — agregar método `toggleActivo(id: number)`:
- Busca el usuario por `id`, obtiene su valor actual de `activo`
- Hace `prisma.user.update({ where: { id }, data: { activo: !activo } })`
- Devuelve el usuario actualizado (sin `passwordHash`)

**Controlador** — agregar endpoint:
```
@Patch(':id/toggle')
@UseGuards(JwtAuthGuard, AdminGuard)
toggleActivo(@Param('id', ParseIntPipe) id: number)
```

### 4.2 — Reportes: `PATCH /reports/:id/toggle`

**Servicio** — agregar método `toggleActivo(id: number)`:
- Igual que usuarios: busca el reporte, invierte `activo`, hace update
- Devuelve el reporte actualizado con `reportesRoles`

**Controlador** — agregar endpoint:
```
@Patch(':id/toggle')
@UseGuards(JwtAuthGuard, AdminGuard)
toggleActivo(@Param('id', ParseIntPipe) id: number)
```

### 4.3 — Soft Delete en Reportes (cambio de semántica)

Actualmente `remove(id)` hace un **hard delete** en reportes. Cambiar a **soft delete**:
- El método `remove(id)` pasa a hacer `prisma.report.update({ where: { id }, data: { activo: false } })`
- Esto preserva el historial de auditoría y no rompe relaciones en `cex_reportes_roles`

> **Nota:** El endpoint `DELETE /reports/:id` se mantiene en el controlador pero ahora ejecuta soft delete en lugar de borrado físico.

---

## FASE 5 — Backend: Auditoría — Eliminar IP de la Respuesta

**Archivo a modificar:** `BACKEND/src/audit/audit.service.ts`

### 5.1 — Modificar `findAll()` en AuditService

En la consulta `prisma.auditAccess.findMany(...)`, agregar un `select` explícito que excluya `ipAddress`:

```
select: {
  id: true,
  usuarioId: true,
  fechaHora: true,
  userAgent: true,       // se mantiene por ahora
  usuario: {
    select: {
      nombreCompleto: true,
      email: true
    }
  }
  // ipAddress: OMITIDO deliberadamente
}
```

> El campo `ipAddress` permanece en la base de datos (no se modifica el schema) — solo se omite de la respuesta de la API.

---

## FASE 6 — Frontend: Instalación de Dependencias

**Comandos a ejecutar** (dentro de `frontend/`):

```bash
npm install @tanstack/react-table @tanstack/react-query
```

**Versiones esperadas:**
- `@tanstack/react-table` → v8.x (última estable)
- `@tanstack/react-query` → v5.x (última estable)

> **Importante:** TanStack Query v5 tiene cambios de API respecto a v4. Se usará la sintaxis v5 (`useQuery`, `useMutation`, `QueryClient`).

---

## FASE 7 — Frontend: `QueryClientProvider` en Layout Raíz

**Archivo a modificar:** `frontend/src/app/layout.tsx` (o el layout raíz con `'use client'`)

**Estrategia:**
- Crear un componente `Providers` en `frontend/src/components/Providers.tsx` (client component) que envuelva a los hijos con `<QueryClientProvider client={queryClient}>`.
- Instanciar `queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })`.
- Importar y usar `<Providers>` en el `RootLayout`.

> Esto permite que todos los hooks de React Query funcionen desde cualquier página del dashboard.

---

## FASE 8 — Frontend: Tipos TypeScript para Respuestas Paginadas

**Archivo a modificar:** `frontend/src/types/user.types.ts`

Agregar:
```typescript
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  data: User[];
  meta: PaginatedMeta;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  rolId?: number;
  activo?: boolean;
}
```

**Archivo a modificar:** `frontend/src/types/report.types.ts`

Agregar tipos análogos:
```typescript
export interface PaginatedReports {
  data: Report[];
  meta: PaginatedMeta;
}

export interface ReportListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  activo?: boolean;
}
```

---

## FASE 9 — Frontend: Hook `useUsers` Refactorizado con React Query

**Archivo a reescribir:** `frontend/src/hooks/useUsers.ts`

### 9.1 — Estado del query

Reemplazar `useState` + `useEffect` + `fetchUsers` por `useQuery`:

```typescript
const { data, isLoading: isLoadingList, refetch } = useQuery({
  queryKey: ['admin-users', query],   // query = { page, limit, search, sortBy, order, rolId, activo }
  queryFn: () => api.get<PaginatedUsers>('/users', { params: query }).then(r => r.data),
})
```

El `queryKey` incluye el objeto `query` — cuando cambia cualquier parámetro (búsqueda, página, ordenamiento), React Query re-fetcha automáticamente.

### 9.2 — Estado local del query

El hook expondrá un estado local para los parámetros de query que los componentes de tabla podrán modificar:

```typescript
const [query, setQuery] = useState<UserListQuery>({ page: 1, limit: 10 })
```

Funciones helper:
- `setPage(page: number)` → `setQuery(q => ({ ...q, page }))`
- `setSearch(search: string)` → `setQuery(q => ({ ...q, search, page: 1 }))`
- `setSorting(sortBy: string, order: 'asc' | 'desc')` → `setQuery(q => ({ ...q, sortBy, order }))`
- `setFilters(filters: Partial<UserListQuery>)` → `setQuery(q => ({ ...q, ...filters, page: 1 }))`

### 9.3 — Mutaciones con invalidación de caché

Reemplazar `createUser`, `updateUser`, `deleteUser` por `useMutation`:

```typescript
const createMutation = useMutation({
  mutationFn: (payload: CreateUserPayload) => api.post('/users', payload).then(r => r.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
})

const updateMutation = useMutation({
  mutationFn: ({ id, payload }) => api.put(`/users/${id}`, payload).then(r => r.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
})

const toggleMutation = useMutation({
  mutationFn: (id: number) => api.patch(`/users/${id}/toggle`).then(r => r.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
})
```

### 9.4 — Valor de retorno del hook

```typescript
return {
  users: data?.data ?? [],
  meta: data?.meta,
  isLoadingList,
  query,
  setPage,
  setSearch,
  setSorting,
  setFilters,
  createUser: createMutation.mutateAsync,
  updateUser: (id, payload) => updateMutation.mutateAsync({ id, payload }),
  toggleActivo: toggleMutation.mutateAsync,
  isCreating: createMutation.isPending,
  isUpdating: updateMutation.isPending,
  refetch,
}
```

> **Efecto "Cero F5":** Al llamar `invalidateQueries`, React Query refetcha la lista en background y actualiza la UI automáticamente sin ningún `refetch()` manual en los componentes.

---

## FASE 10 — Frontend: Hook `useAdminReports` Refactorizado con React Query

**Archivo a reescribir:** `frontend/src/hooks/useAdminReports.ts`

**Patrón idéntico al de usuarios** pero adaptado a reportes:

- `queryKey: ['admin-reports', query]`
- `queryFn`: GET `/reports/admin` con `params: query`
- Mutaciones: `createReport`, `updateReport`, `toggleActivo` (nuevo), `deleteReport`
- `toggleMutation`: llama `PATCH /reports/:id/toggle`
- Todas las mutaciones hacen `invalidateQueries({ queryKey: ['admin-reports'] })` en `onSuccess`

**Valor de retorno del hook:**
```typescript
{
  reports, meta, isLoading, query,
  setPage, setSearch, setSorting, setFilters,
  createReport, updateReport, toggleActivo, deleteReport,
  refetch
}
```

---

## FASE 11 — Frontend: Componente `ToggleSwitch`

**Archivo a crear:** `frontend/src/components/ui/ToggleSwitch.tsx`

Componente visual de interruptor deslizante (pill-style):

**Props:**
```typescript
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}
```

**Diseño visual:**
- Pill exterior: `w-10 h-5` (sm) / `w-12 h-6` (md), `rounded-full`, `transition-colors`
- Color: `bg-green-500` cuando `checked=true`, `bg-slate-300` cuando `false`
- Círculo interior blanco que se desplaza con `translate-x` según el estado
- Cursor: `cursor-pointer`, `cursor-not-allowed` cuando `disabled`

**Comportamiento:**
- Al hacer clic llama a `onChange()`
- El componente es **controlado** — no maneja estado interno

---

## FASE 12 — Frontend: Componente `Modal`

**Archivo a crear:** `frontend/src/components/ui/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';  // default: 'md'
}
```

**Estructura HTML/JSX:**
1. **Backdrop:** `fixed inset-0 bg-black/50 z-40` — clic cierra el modal
2. **Panel:** `fixed inset-0 z-50 flex items-center justify-center p-4`
   - Contenedor: `bg-white rounded-xl shadow-xl w-full max-w-lg` (según `maxWidth`)
   - Header: título + botón X (`XIcon` de lucide-react)
   - Body: `overflow-y-auto max-h-[80vh] p-6` — renderiza `children`

**Comportamientos:**
- Clic en backdrop llama `onClose()`
- Tecla `Escape` llama `onClose()` (useEffect con event listener)
- Cuando `isOpen=false`, el componente no renderiza nada (retorna `null`)
- Scroll lock: cuando el modal está abierto, agregar `overflow-hidden` al `document.body`

**Implementación del scroll lock:**
```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [isOpen]);
```

---

## FASE 13 — Frontend: `UserTable` con TanStack Table + Paginación + Filtros

**Archivo a reescribir:** `frontend/src/components/admin/UserTable.tsx`

### 13.1 — Props del componente

```typescript
interface UserTableProps {
  // Datos
  users: User[];
  meta?: PaginatedMeta;
  isLoading: boolean;
  // Parámetros de query actuales (para mostrar estado de filtros/sorting)
  query: UserListQuery;
  // Callbacks para modificar el query
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  onFilterRole: (rolId?: number) => void;
  onFilterActivo: (activo?: boolean) => void;
  // Acciones
  roles: Role[];
  onNew: () => void;
  onEdit: (user: User) => void;
  onToggleActivo: (user: User) => void;
}
```

### 13.2 — Definición de columnas con TanStack Table

Usar `createColumnHelper<User>()` y `useReactTable()` con:
- `data: users`
- `columns`: ID, Nombre (con sorting), Email (con sorting), Rol (con filtering), Estado (con ToggleSwitch), Acciones
- `getCoreRowModel: getCoreRowModel()`
- `manualPagination: true` — la paginación la controla el backend
- `manualSorting: true` — el ordenamiento lo controla el backend
- `pageCount: meta?.totalPages ?? -1`

### 13.3 — Barra de controles sobre la tabla

```
[ 🔍 Buscador ] [ Filtro: Todos los Roles ▼ ] [ Filtro: Estado ▼ ]     [ + Nuevo Usuario ]
```

- **Buscador:** `<input>` con debounce de 300ms — al cambiar llama `onSearch(value)`
- **Filtro de Rol:** `<select>` con opciones de `roles` + "Todos los roles" — llama `onFilterRole(rolId)`
- **Filtro de Estado:** `<select>` con "Todos", "Activo", "Inactivo" — llama `onFilterActivo(activo)`

### 13.4 — Cabeceras de columna con sorting

Las columnas `Nombre` y `Email` tienen indicador de ordenamiento:
- Ícono `↑` / `↓` / `↕` (ChevronUp/ChevronDown/ChevronsUpDown de lucide-react)
- Al hacer clic en la cabecera, llama `onSortChange(column, nextOrder)`
- `nextOrder` lógica: si la columna ya está activa en `asc`, siguiente es `desc`; si en `desc`, vuelve a `asc` por defecto

### 13.5 — Columna de Estado: Toggle Switch

Reemplazar los badges de "Activo/Inactivo" por el componente `<ToggleSwitch>`:
- `checked={user.activo}`
- `onChange={() => onToggleActivo(user)}`

### 13.6 — Paginación

Debajo de la tabla, una barra de paginación:
```
Mostrando 1-10 de 47 usuarios    [←] [1] [2] [3] [4] [5] [→]
```
- "Anterior" / "Siguiente" deshabilitados en extremos
- Números de página: mostrar hasta 5 páginas con elipsis si hay más
- Al hacer clic llama `onPageChange(page)`

### 13.7 — Estados de carga y vacío

- **Loading:** mostrar 5 filas de skeleton (como actualmente)
- **Sin resultados:** mensaje "No se encontraron usuarios con los filtros aplicados"

---

## FASE 14 — Frontend: `ReportTable` con TanStack Table + Paginación + Filtros

**Archivo a reescribir:** `frontend/src/components/admin/ReportTable.tsx`

**Patrón idéntico al de UserTable**, adaptado a reportes:

### Props:
```typescript
interface ReportTableProps {
  reports: Report[];
  meta?: PaginatedMeta;
  isLoading: boolean;
  query: ReportListQuery;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  onFilterActivo: (activo?: boolean) => void;
  onNew: () => void;
  onEdit: (report: Report) => void;
  onToggleActivo: (report: Report) => void;
}
```

### Columnas:
- **ID** (no sortable)
- **Título** (sortable — `sortBy: 'titulo'`)
- **Roles** — badges como actualmente (no sortable)
- **Estado** — `<ToggleSwitch>` en lugar de badge estático
- **Acciones** — solo `Pencil` (editar) — sin botón de eliminar visible en la UI

### Barra de controles:
```
[ 🔍 Buscador ] [ Filtro: Estado ▼ ]     [ + Nuevo Reporte ]
```

> **Nota:** El botón de eliminar se elimina de la UI. El soft delete ocurre solo a través del toggle de estado.

---

## FASE 15 — Frontend: `users/page.tsx` — UserForm en Modal

**Archivo a modificar:** `frontend/src/app/dashboard/admin/users/page.tsx`

### Cambios:

1. **Eliminar** el bloque condicional `{showForm && <div className="bg-white ..."><UserForm .../></div>}` inline.

2. **Agregar** al final del JSX:
```tsx
<Modal
  isOpen={showForm}
  onClose={handleCancel}
  title={editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
>
  <UserForm
    initialValues={editingUser ?? undefined}
    onSuccess={handleSuccess}
    onCancel={handleCancel}
  />
</Modal>
```

3. **Modificar** `UserForm` para no renderizar su propio `<h3>` de título (ya lo muestra el Modal). Agregar prop `hideTitle?: boolean` o simplemente asumir que el Modal siempre lo provee. — **Evaluar** cuál opción es menos invasiva.

4. **Actualizar** `users/page.tsx` para consumir los nuevos props del hook y pasarlos a `UserTable`:
```tsx
const {
  users, meta, isLoadingList, query,
  setSearch, setPage, setSorting, setFilters,
  createUser, updateUser, toggleActivo
} = useUsers();
```

5. **Simplificar** `handleToggleActivo` — ahora solo llama `toggleActivo(user.id)` (ya no necesita `refetch()` manual).

---

## FASE 16 — Frontend: `reports/page.tsx` — ReportForm en Modal

**Archivo a modificar:** `frontend/src/app/dashboard/admin/reports/page.tsx`

**Patrón idéntico a la Fase 15**, adaptado a reportes:

1. Reemplazar el bloque inline `{showForm && ...}` por `<Modal>` envolviendo `<ReportForm>`.

2. Actualizar consumo del hook:
```tsx
const {
  reports, meta, isLoading, query,
  setSearch, setPage, setSorting, setFilters,
  createReport, updateReport, toggleActivo
} = useAdminReports();
```

3. Eliminar `handleDelete` — ya no existe la acción de eliminar en la UI.

4. Agregar `handleToggleActivo(report: Report)` que llama `toggleActivo(report.id)`.

---

## FASE 17 — Frontend: `AuditTable` — Eliminar Columna IP

**Archivos a modificar:**

### 17.1 — `frontend/src/types/audit.types.ts`

Eliminar el campo `ipAddress` de la interfaz `AuditEntry`:
```typescript
// ANTES:
interface AuditEntry {
  id: number;
  usuarioId: number;
  fechaHora: string;
  ipAddress: string | null;  // ← ELIMINAR
  userAgent: string | null;
  usuario: { nombreCompleto: string; email: string; };
}

// DESPUÉS:
interface AuditEntry {
  id: number;
  usuarioId: number;
  fechaHora: string;
  userAgent: string | null;
  usuario: { nombreCompleto: string; email: string; };
}
```

### 17.2 — `frontend/src/components/admin/AuditTable.tsx`

- Eliminar el `<th>IP</th>` de la cabecera
- Eliminar la `<td>` con `entry.ipAddress` de las filas
- Actualizar el `colSpan` en el estado vacío (de 4 a 3)
- Actualizar el `colSpan` en los skeletons de carga

---

## Resumen de Archivos Afectados

### Backend (NestJS)

| Archivo | Acción |
|---|---|
| `src/common/dto/pagination-query.dto.ts` | CREAR |
| `src/common/dto/paginated-response.dto.ts` | CREAR |
| `src/users/dto/list-users-query.dto.ts` | CREAR |
| `src/users/users.service.ts` | MODIFICAR — `findAll(query)`, `toggleActivo(id)` |
| `src/users/users.controller.ts` | MODIFICAR — `@Get()`, `@Patch(':id/toggle')` |
| `src/reports/dto/list-reports-query.dto.ts` | CREAR |
| `src/reports/reports.service.ts` | MODIFICAR — `findAllAdmin(query)`, `toggleActivo(id)`, `remove` → soft delete |
| `src/reports/reports.controller.ts` | MODIFICAR — `@Get('admin')`, `@Patch(':id/toggle')` |
| `src/audit/audit.service.ts` | MODIFICAR — excluir `ipAddress` del select |

### Frontend (Next.js)

| Archivo | Acción |
|---|---|
| `src/app/layout.tsx` | MODIFICAR — agregar `<Providers>` |
| `src/components/Providers.tsx` | CREAR — `QueryClientProvider` |
| `src/components/ui/ToggleSwitch.tsx` | CREAR |
| `src/components/ui/Modal.tsx` | CREAR |
| `src/types/user.types.ts` | MODIFICAR — agregar tipos paginados |
| `src/types/report.types.ts` | MODIFICAR — agregar tipos paginados |
| `src/types/audit.types.ts` | MODIFICAR — eliminar `ipAddress` |
| `src/hooks/useUsers.ts` | REESCRIBIR — React Query |
| `src/hooks/useAdminReports.ts` | REESCRIBIR — React Query |
| `src/components/admin/UserTable.tsx` | REESCRIBIR — TanStack Table |
| `src/components/admin/ReportTable.tsx` | REESCRIBIR — TanStack Table |
| `src/components/admin/AuditTable.tsx` | MODIFICAR — eliminar columna IP |
| `src/app/dashboard/admin/users/page.tsx` | MODIFICAR — Modal + nuevos props |
| `src/app/dashboard/admin/reports/page.tsx` | MODIFICAR — Modal + nuevos props |

---

## Consideraciones y Riesgos

| Riesgo | Mitigación |
|---|---|
| TanStack Query v5 usa `isPending` en lugar de `isLoading` para mutaciones | Usar siempre la API v5 en el plan |
| `class-transformer` puede no estar instalado en el backend | Verificar `package.json` antes de Fase 1; instalar si falta |
| El layout raíz puede ser un Server Component | Crear `Providers.tsx` como `'use client'` separado |
| UserForm tiene su propio `<h3>` de título | Evaluar agregar `hideTitle` prop o mover al Modal |
| `colSpan` en AuditTable debe ajustarse al eliminar la columna IP | Verificar el número correcto de columnas restantes |
| `manualPagination` y `manualSorting` en TanStack Table requieren configuración cuidadosa | Seguir exactamente la API de `useReactTable` v8 |

---

*Plan generado el 2026-03-27. Pendiente de aprobación antes de ejecutar.*
