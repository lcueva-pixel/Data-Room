# Plan de Acción — CRUDs Completos + Corrección de Permisos

> **Estado:** Pendiente de aprobación
> **Versión:** 1.0
> **Alcance:** `BACKEND/` + `frontend/src/` — Solo planificación. Ningún archivo se toca hasta recibir luz verde.

---

## Diagnóstico de Bugs Actuales

### Bug 1 — Administrador solo ve 1 reporte en el sidebar

**Causa raíz en `reports.service.ts`:**
```typescript
// Query actual:
where: { rolMinimoId: { lte: rolId }, activo: true }
// Admin (rolId=1): rolMinimoId <= 1 → solo ve reportes con rolMinimoId=1
// Empleado (rolId=2): rolMinimoId <= 2 → ve reportes con rolMinimoId=1 Y 2
```
Los 5 reportes en BD tienen `rolMinimoId=2`, por eso el admin (rolId=1) no los ve.

### Bug 2 — Modelo de permisos incorrecto (un solo rol mínimo)

**Causa raíz en `schema.prisma`:**
```prisma
model Report {
  rolMinimoId Int  @map("rol_minimo_id")  // ← campo escalar único
}
```
Esto no permite asignar un reporte a múltiples roles específicos (ej. Rol 2 Y Rol 3 pero NO Rol 4).

---

## Estado Actual de Archivos Clave

| Archivo | Estado | Problema detectado |
|---------|--------|--------------------|
| `BACKEND/prisma/schema.prisma` | ⚠️ Bug | `Report` usa `rolMinimoId` escalar — no soporta multi-rol |
| `BACKEND/src/reports/reports.service.ts` | ⚠️ Bug | `lte: rolId` excluye al admin de ver todos los reportes |
| `BACKEND/src/reports/reports.controller.ts` | ⚠️ Incompleto | Solo `GET` y `POST` — faltan `PUT` y `DELETE` |
| `BACKEND/src/users/users.controller.ts` | ⚠️ Incompleto | Solo `POST` — faltan `GET`, `PUT`, `DELETE` |
| `BACKEND/src/users/users.service.ts` | ⚠️ Incompleto | Solo `create` — faltan `findAll`, `update`, `remove` |
| `BACKEND/src/reports/dto/create-report.dto.ts` | ⚠️ Bug | `rolMinimoId: number` — debe ser `rolesIds: number[]` |
| `frontend/src/types/report.types.ts` | ⚠️ Bug | Contiene `rolMinimoId` — debe reflejarse el cambio |
| `frontend/src/components/admin/ReportForm.tsx` | ⚠️ Bug | `<select>` de un solo rol — debe ser checkboxes multi-select |
| `frontend/src/hooks/useAdminReports.ts` | ⚠️ Incompleto | Solo `create` — faltan `update` y `delete` |
| `frontend/src/hooks/useUsers.ts` | ⚠️ Incompleto | Solo `createUser` — faltan `fetchAll`, `update`, `delete` |
| `frontend/src/components/admin/UserForm.tsx` | ⚠️ Incompleto | Solo modo creación, sin modo edición ni lista |
| `frontend/src/components/admin/ReportTable.tsx` | ⚠️ Incompleto | Botón "Editar" sin funcionalidad real |

---

## Decisiones Arquitecturales

### A — Modelo de permisos: tabla de unión explícita

Se reemplaza `rolMinimoId Int` por una relación muchos-a-muchos explícita entre `Report` y `Role` mediante una nueva tabla `cex_reportes_roles`:

```
cex_reportes ←→ cex_reportes_roles ←→ cex_roles
```

> **Por qué tabla explícita (no implícita de Prisma):** La tabla explícita permite consultas directas, nombres de columna controlados, y es más fácil de debuggear en BD.

### B — Regla de negocio del Administrador

```
Si rol_id === 1 → devolver TODOS los reportes activos (sin filtro de roles)
Si rol_id !== 1 → devolver solo reportes donde el rol del usuario está en la lista de roles permitidos
```

Esta regla aplica tanto para el sidebar como para las vistas de admin.

### C — CRUD Reportes: endpoint separado para admin

- `GET /reports` → uso normal (sidebar), filtra por rol del usuario
- `GET /reports/admin` → **NUEVO**, solo admin, devuelve TODOS los reportes (incluyendo inactivos) con sus roles asociados, para la tabla de gestión

### D — CRUD Usuarios: endpoint `DELETE` desactiva, no elimina

`DELETE /users/:id` cambia `activo = false` en lugar de borrar el registro. Esto preserva el historial de auditoría y evita cascadas inesperadas en BD.

### E — Migración de datos existentes

Al ejecutar la migración Prisma, el SQL de transición copiará los datos actuales: para cada reporte con `rolMinimoId=X`, se insertará la fila `(reportId, roleId=X)` en `cex_reportes_roles`. Luego se eliminará la columna `rol_minimo_id` de `cex_reportes`.

---

## Estructura de Archivos Objetivo

```
BACKEND/
├── prisma/
│   └── schema.prisma                        ← MODIFICAR: nuevo modelo ReportRole
│
└── src/
    ├── reports/
    │   ├── dto/
    │   │   ├── create-report.dto.ts          ← MODIFICAR: rolesIds[] en lugar de rolMinimoId
    │   │   └── update-report.dto.ts          ← NUEVO
    │   ├── reports.service.ts                ← MODIFICAR: findByRole, create, + update/delete
    │   └── reports.controller.ts             ← MODIFICAR: agregar GET /admin, PUT/:id, DELETE/:id
    │
    └── users/
        ├── dto/
        │   └── update-user.dto.ts            ← NUEVO
        ├── users.service.ts                  ← MODIFICAR: findAll, update, remove
        └── users.controller.ts               ← MODIFICAR: GET, PUT/:id, DELETE/:id

frontend/src/
├── types/
│   ├── report.types.ts                       ← MODIFICAR: rolesIds[], quitar rolMinimoId
│   └── user.types.ts                         ← MODIFICAR: agregar User completo + UpdateUserPayload
│
├── hooks/
│   ├── useAdminReports.ts                    ← MODIFICAR: agregar updateReport, deleteReport, fetchAll
│   └── useUsers.ts                           ← MODIFICAR: agregar users[], updateUser, deleteUser
│
└── components/
    └── admin/
        ├── ReportForm.tsx                    ← MODIFICAR: checkboxes multi-rol, modo edición
        ├── ReportTable.tsx                   ← MODIFICAR: botones Edit/Delete funcionales
        ├── UserForm.tsx                      ← MODIFICAR: modo edición (password opcional)
        └── UserTable.tsx                     ← NUEVO: tabla listado de usuarios con acciones
```

**Archivos nuevos:** 3 (`update-report.dto.ts`, `update-user.dto.ts`, `UserTable.tsx`)
**Archivos modificados:** 12
**Nuevas dependencias:** ninguna

---

## Fase 1 — Backend: Fix Inmediato del Bug del Administrador

**Objetivo:** Corrección rápida sin cambio de schema. El admin ve todos los reportes.

> Esta fase es independiente de la refactorización de permisos (Fase 2) y puede desplegarse primero.

### Paso 1.1 — Modificar `reports.service.ts`

```typescript
// ANTES:
async findByRole(rolId: number) {
  return this.prisma.report.findMany({
    where: { rolMinimoId: { lte: rolId }, activo: true },
  });
}

// DESPUÉS:
async findByRole(rolId: number) {
  // Admin (rol_id=1): devuelve todos los reportes activos sin filtro
  if (rolId === 1) {
    return this.prisma.report.findMany({ where: { activo: true } });
  }
  // Otros roles: filtro por rol mínimo (lógica actual mientras se migra)
  return this.prisma.report.findMany({
    where: { rolMinimoId: { lte: rolId }, activo: true },
  });
}
```

**Impacto:** El admin inmediatamente ve los 5 reportes en el sidebar. Sin cambio de BD.

---

## Fase 2 — Backend: Refactorización del Modelo de Permisos (Muchos-a-Muchos)

**Objetivo:** Reemplazar `rolMinimoId` por tabla de unión para soportar múltiples roles por reporte.

### Paso 2.1 — Modificar `schema.prisma`

**Cambios en el modelo `Role`:**
```prisma
model Role {
  id             Int    @id @default(autoincrement())
  rolDescripcion String @unique @map("rol_descripcion") @db.VarChar(50)

  usuarios       User[]
  reportesRoles  ReportRole[]   // ← reemplaza "reportes Report[]"

  @@map("cex_roles")
}
```

**Cambios en el modelo `Report`:**
```prisma
model Report {
  id            Int      @id @default(autoincrement())
  titulo        String   @db.VarChar(100)
  descripcion   String?
  urlIframe     String   @map("url_iframe")
  // rolMinimoId Int   ← ELIMINAR este campo
  activo        Boolean  @default(true)
  fechaRegistro DateTime @default(now()) @map("fecha_registro") @db.Timestamptz

  reportesRoles ReportRole[]   // ← relación nueva

  @@map("cex_reportes")
}
```

**Nuevo modelo `ReportRole` (tabla de unión explícita):**
```prisma
model ReportRole {
  reporteId Int @map("reporte_id")
  rolId     Int @map("rol_id")

  reporte Report @relation(fields: [reporteId], references: [id], onDelete: Cascade)
  rol     Role   @relation(fields: [rolId], references: [id], onDelete: Cascade)

  @@id([reporteId, rolId])
  @@map("cex_reportes_roles")
}
```

### Paso 2.2 — Agregar `ReportRole` al `PrismaService`

```typescript
get reportRole() { return this.client.reportRole; }
```

### Paso 2.3 — Ejecutar migración de Prisma

```bash
cd BACKEND
npx prisma migrate dev --name refactor_report_roles_many_to_many
```

La migración Prisma generará SQL que:
1. Crea tabla `cex_reportes_roles`
2. Copia datos: `INSERT INTO cex_reportes_roles SELECT id, rol_minimo_id FROM cex_reportes`
3. Elimina columna `rol_minimo_id` de `cex_reportes`

> **Nota:** El SQL de migración será revisado antes de ejecutarse para confirmar que los datos existentes se preservan correctamente.

### Paso 2.4 — Regenerar el cliente Prisma

```bash
npx prisma generate
```

### Paso 2.5 — Actualizar `create-report.dto.ts`

```typescript
// ANTES:
@IsInt()
rolMinimoId: number;

// DESPUÉS:
@IsArray()
@IsInt({ each: true })
@ArrayMinSize(1, { message: 'Selecciona al menos un rol' })
rolesIds: number[];
```

### Paso 2.6 — Actualizar `reports.service.ts` — método `findByRole`

```typescript
async findByRole(rolId: number) {
  // Admin: todos los reportes activos
  if (rolId === 1) {
    return this.prisma.report.findMany({
      where: { activo: true },
      include: { reportesRoles: { include: { rol: true } } },
    });
  }
  // Otros roles: solo reportes que tengan al rol del usuario en su lista
  return this.prisma.report.findMany({
    where: {
      activo: true,
      reportesRoles: { some: { rolId } },
    },
    include: { reportesRoles: { include: { rol: true } } },
  });
}
```

### Paso 2.7 — Actualizar `reports.service.ts` — método `create`

```typescript
async create(dto: CreateReportDto) {
  await this.prisma.report.create({
    data: {
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      urlIframe: dto.urlIframe,
      activo: dto.activo ?? true,
      reportesRoles: {
        create: dto.rolesIds.map((rolId) => ({ rolId })),
      },
    },
  });
  return { message: 'Reporte creado exitosamente' };
}
```

---

## Fase 3 — Backend: CRUD Completo de Reportes

**Objetivo:** Agregar los endpoints faltantes para editar y eliminar reportes.

### Paso 3.1 — Nuevo `update-report.dto.ts`

```typescript
export class UpdateReportDto {
  @IsString() @IsOptional() titulo?: string;
  @IsString() @IsOptional() urlIframe?: string;
  @IsString() @IsOptional() descripcion?: string;
  @IsArray() @IsInt({ each: true }) @IsOptional() rolesIds?: number[];
  @IsBoolean() @IsOptional() activo?: boolean;
}
```

### Paso 3.2 — Nuevos métodos en `reports.service.ts`

**`findAllAdmin()`** — para la tabla de gestión del admin:
```typescript
async findAllAdmin() {
  return this.prisma.report.findMany({
    include: { reportesRoles: { include: { rol: true } } },
    orderBy: { id: 'asc' },
  });
}
```

**`update(id, dto)`** — editar reporte + reasignar roles:
```typescript
async update(id: number, dto: UpdateReportDto) {
  await this.prisma.report.update({
    where: { id },
    data: {
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.urlIframe && { urlIframe: dto.urlIframe }),
      ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
      // Si se enviaron nuevos roles: eliminar los actuales y crear los nuevos
      ...(dto.rolesIds && {
        reportesRoles: {
          deleteMany: {},
          create: dto.rolesIds.map((rolId) => ({ rolId })),
        },
      }),
    },
  });
  return { message: 'Reporte actualizado exitosamente' };
}
```

**`remove(id)`** — eliminar reporte (cascade a cex_reportes_roles):
```typescript
async remove(id: number) {
  await this.prisma.report.delete({ where: { id } });
  return { message: 'Reporte eliminado exitosamente' };
}
```

### Paso 3.3 — Actualizar `reports.controller.ts`

```typescript
// Nuevos endpoints a agregar:

@Get('admin')
@UseGuards(AdminGuard)
async findAllAdmin() {
  return this.reportsService.findAllAdmin();
}

@Put(':id')
@UseGuards(AdminGuard)
async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto) {
  return this.reportsService.update(id, dto);
}

@Delete(':id')
@UseGuards(AdminGuard)
async remove(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.remove(id);
}
```

**Imports a agregar:** `Put`, `Delete`, `Param`, `ParseIntPipe` de `@nestjs/common`.

---

## Fase 4 — Backend: CRUD Completo de Usuarios

**Objetivo:** Agregar los endpoints faltantes para listar, editar y desactivar usuarios.

### Paso 4.1 — Nuevo `update-user.dto.ts`

```typescript
export class UpdateUserDto {
  @IsString() @IsOptional() nombreCompleto?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @MinLength(6) @IsOptional() password?: string;
  @IsInt() @IsOptional() rolId?: number;
  @IsBoolean() @IsOptional() activo?: boolean;
}
```

### Paso 4.2 — Nuevos métodos en `users.service.ts`

**`findAll()`** — listar todos los usuarios con su rol:
```typescript
async findAll() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      nombreCompleto: true,
      email: true,
      rolId: true,
      activo: true,
      fechaCreacion: true,
      rol: { select: { rolDescripcion: true } },
    },
    orderBy: { id: 'asc' },
  });
}
```
> `passwordHash` queda excluido del `select` — nunca se expone en ninguna respuesta.

**`update(id, dto)`** — editar usuario:
```typescript
async update(id: number, dto: UpdateUserDto) {
  const data: any = { ...dto };
  if (dto.password) {
    data.passwordHash = await bcrypt.hash(dto.password, 10);
    delete data.password;
  }
  await this.prisma.user.update({ where: { id }, data });
  return { message: 'Usuario actualizado exitosamente' };
}
```

**`remove(id)`** — desactivar usuario (soft delete):
```typescript
async remove(id: number) {
  await this.prisma.user.update({
    where: { id },
    data: { activo: false },
  });
  return { message: 'Usuario desactivado exitosamente' };
}
```

### Paso 4.3 — Actualizar `users.controller.ts`

```typescript
// Nuevos endpoints a agregar:

@Get()
@UseGuards(JwtAuthGuard, AdminGuard)
async findAll() {
  return this.usersService.findAll();
}

@Put(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
  return this.usersService.update(id, dto);
}

@Delete(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async remove(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.remove(id);
}
```

**Imports a agregar:** `Get`, `Put`, `Delete`, `Param`, `ParseIntPipe`, `Body` de `@nestjs/common`.

---

## Fase 5 — Frontend: Actualización de Permisos de Reportes

**Objetivo:** Reflejar el nuevo modelo muchos-a-muchos en tipos, hooks y componentes.

### Paso 5.1 — Actualizar `src/types/report.types.ts`

```typescript
// ANTES:
export interface Report {
  rolMinimoId: number;
  // ...
}

// DESPUÉS:
export interface ReportRole {
  rolId: number;
  rol: { rolDescripcion: string };
}

export interface Report {
  id: number;
  titulo: string;
  descripcion: string | null;
  urlIframe: string;
  activo: boolean;
  fechaRegistro: string;
  reportesRoles: ReportRole[];   // ← array de roles asignados
}
```

### Paso 5.2 — Actualizar `src/hooks/useAdminReports.ts`

```typescript
// ANTES: solo create
interface CreateReportPayload { rolMinimoId: number; ... }

// DESPUÉS: create + update + delete, nuevos payloads
interface CreateReportPayload { rolesIds: number[]; ... }  // ← array
interface UpdateReportPayload { rolesIds?: number[]; ... } // ← parcial

// Agregar al hook:
fetchAllAdmin: () => void;       // llama GET /reports/admin
updateReport: (id: number, data: UpdateReportPayload) => Promise<void>;
deleteReport: (id: number) => Promise<void>;
```

Los métodos `updateReport` y `deleteReport` llaman a `PUT /reports/:id` y `DELETE /reports/:id` respectivamente y luego refrescan la lista.

### Paso 5.3 — Actualizar `src/components/admin/ReportForm.tsx`

**Cambios en el schema Zod:**
```typescript
// ANTES:
rolMinimoId: z.number().int().min(1)

// DESPUÉS:
rolesIds: z.array(z.number().int()).min(1, 'Selecciona al menos un rol')
```

**Cambio en el control de formulario:**
```
ANTES: <select> de un solo rol
DESPUÉS: checkboxes — uno por rol cargado desde useRoles()

┌─ Roles con acceso * ─────────────────────────────────────┐
│  ☑ Administrador                                         │
│  ☑ Empleado                                              │
│  ☐ Invitado                                              │
└──────────────────────────────────────────────────────────┘
```

**Agregar prop `initialValues` para modo edición:**
```typescript
interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialValues?: Partial<ReportFormValues>;  // ← para pre-poblar al editar
}
```

Cuando `initialValues` está presente, el título del formulario cambia de "Nuevo Reporte" a "Editar Reporte" y el submit llama a `updateReport` en lugar de `createReport`.

### Paso 5.4 — Actualizar `src/components/admin/ReportTable.tsx`

**Columna "Roles" mejorada:** muestra badges con los nombres de roles en lugar de `getRolLabel(rolMinimoId)`.

**Columna "Acciones" funcional:**
```
[Editar]   → setEditingReport(report) → showForm=true con initialValues
[Eliminar] → confirm() → deleteReport(id) → refetch
```

```
ID │ Nombre          │ Roles                    │ Estado  │ Acciones
───┼─────────────────┼──────────────────────────┼─────────┼──────────────────
1  │ Ventas Q1       │ [Empleado] [Invitado]    │ Activo  │ [✏ Editar] [🗑]
2  │ Operaciones     │ [Administrador]           │ Activo  │ [✏ Editar] [🗑]
```

### Paso 5.5 — Actualizar `src/app/dashboard/admin/reports/page.tsx`

Agregar estado `editingReport: Report | null`:
```typescript
const [editingReport, setEditingReport] = useState<Report | null>(null);

// Al abrir el formulario de edición:
const handleEdit = (report: Report) => {
  setEditingReport(report);
  setShowForm(true);
};

// Al cerrar el formulario:
const handleFormClose = () => {
  setShowForm(false);
  setEditingReport(null);
};
```

---

## Fase 6 — Frontend: CRUD Completo de Usuarios

**Objetivo:** Lista de usuarios con edición y desactivación, reutilizando patrones ya establecidos.

### Paso 6.1 — Actualizar `src/types/user.types.ts`

```typescript
// Agregar tipo User completo (respuesta de GET /users):
export interface User {
  id: number;
  nombreCompleto: string;
  email: string;
  rolId: number;
  activo: boolean;
  fechaCreacion: string;
  rol: { rolDescripcion: string };
}

// Agregar payload de actualización:
export interface UpdateUserPayload {
  nombreCompleto?: string;
  email?: string;
  password?: string;   // opcional — solo si se quiere cambiar
  rolId?: number;
  activo?: boolean;
}
```

### Paso 6.2 — Actualizar `src/hooks/useUsers.ts`

```typescript
// Agregar al resultado del hook:
interface UseUsersResult {
  users: User[];                                          // ← NUEVO
  isLoadingList: boolean;                                 // ← NUEVO
  createUser: (payload: CreateUserPayload) => Promise<void>;
  updateUser: (id: number, payload: UpdateUserPayload) => Promise<void>; // ← NUEVO
  deleteUser: (id: number) => Promise<void>;              // ← NUEVO
  refetch: () => void;                                    // ← NUEVO
  isLoading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}
```

`updateUser` → `PUT /users/:id`
`deleteUser` → `DELETE /users/:id` (soft delete en backend)
`refetch` → recarga `GET /users`

### Paso 6.3 — Nuevo componente `src/components/admin/UserTable.tsx`

```
┌─ Listado de Usuarios ────────────────────── [+ Nuevo Usuario] ─┐
│                                                                 │
│  ID │ Nombre          │ Email              │ Rol    │ Estado    │ Acciones
│  ───┼─────────────────┼────────────────────┼────────┼─────────  ┼──────────────────
│  1  │ Admin Principal │ admin@empresa.com  │ Admin  │ ✅ Activo  │ [✏] [🚫]
│  2  │ Juan Pérez      │ juan@empresa.com   │ Empleado│ ✅ Activo │ [✏] [🚫]
│  3  │ Ana García      │ ana@empresa.com    │ Invitado│ ❌ Inact. │ [✏] [✅]
└─────────────────────────────────────────────────────────────────┘
```

- **[✏] Editar** → abre `UserForm` en modo edición pre-poblado
- **[🚫] Desactivar / [✅] Activar** → llama `deleteUser(id)` o `updateUser(id, { activo: true })`
- Skeleton de carga: misma estructura de `AuditTable`
- Badge de estado: verde "Activo" / gris "Inactivo"

**Props planificadas:**
```typescript
interface UserTableProps {
  users: User[];
  isLoading: boolean;
  roles: Role[];
  onEdit: (user: User) => void;
  onToggleActivo: (user: User) => void;
}
```

### Paso 6.4 — Actualizar `src/components/admin/UserForm.tsx`

**Agregar prop `initialValues` para modo edición:**
```typescript
interface UserFormProps {
  initialValues?: Partial<UserFormValues>;  // pre-poblar campos al editar
  onSuccess?: () => void;                  // callback tras guardar
  onCancel?: () => void;                   // para modo edición (mostrar botón Cancelar)
}
```

**Cambios en el schema Zod para modo edición:**
```typescript
password: z.string().min(6).regex(...).optional()  // ← opcional al editar
```
Cuando `initialValues` existe, el campo contraseña muestra un placeholder "Dejar en blanco para no cambiar".

**Submit lógica:**
```typescript
if (initialValues?.id) {
  // modo edición: updateUser(id, payload)  — no incluir password si está vacío
} else {
  // modo creación: createUser(payload) — password obligatorio
}
```

### Paso 6.5 — Actualizar `src/app/dashboard/admin/users/page.tsx`

```typescript
// Estado de edición:
const [editingUser, setEditingUser] = useState<User | null>(null);

// Layout final:
<div className="space-y-6">
  <h1>Gestión de Usuarios</h1>

  {/* Formulario (crear o editar) */}
  <UserForm
    initialValues={editingUser ?? undefined}
    onSuccess={handleFormSuccess}
    onCancel={editingUser ? () => setEditingUser(null) : undefined}
  />

  {/* Tabla de usuarios */}
  <UserTable
    users={users}
    isLoading={isLoadingList}
    roles={roles}
    onEdit={setEditingUser}
    onToggleActivo={handleToggleActivo}
  />
</div>
```

---

## Resumen de Todos los Cambios

### Backend

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `prisma/schema.prisma` | MODIFICAR | Quitar `rolMinimoId`, agregar `ReportRole` many-to-many |
| `prisma/migrations/...` | CREAR (auto) | Migración SQL con copia de datos existentes |
| `reports/dto/create-report.dto.ts` | MODIFICAR | `rolMinimoId` → `rolesIds: number[]` |
| `reports/dto/update-report.dto.ts` | CREAR | DTO parcial para edición |
| `reports/reports.service.ts` | MODIFICAR | Admin bypass + nuevo findByRole + findAllAdmin + update + remove |
| `reports/reports.controller.ts` | MODIFICAR | Agregar `GET /admin`, `PUT /:id`, `DELETE /:id` |
| `users/dto/update-user.dto.ts` | CREAR | DTO parcial para edición de usuario |
| `users/users.service.ts` | MODIFICAR | Agregar findAll + update + remove |
| `users/users.controller.ts` | MODIFICAR | Agregar `GET /`, `PUT /:id`, `DELETE /:id` |
| `prisma/prisma.service.ts` | MODIFICAR | Agregar getter `reportRole` |

### Frontend

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `types/report.types.ts` | MODIFICAR | `reportesRoles[]` en lugar de `rolMinimoId` |
| `types/user.types.ts` | MODIFICAR | Agregar `User` completo + `UpdateUserPayload` |
| `hooks/useAdminReports.ts` | MODIFICAR | Agregar `updateReport`, `deleteReport`, `fetchAllAdmin` |
| `hooks/useUsers.ts` | MODIFICAR | Agregar `users[]`, `updateUser`, `deleteUser`, `refetch` |
| `components/admin/ReportForm.tsx` | MODIFICAR | Checkboxes multi-rol + modo edición con `initialValues` |
| `components/admin/ReportTable.tsx` | MODIFICAR | Columna Roles con badges + botones Edit/Delete funcionales |
| `components/admin/UserForm.tsx` | MODIFICAR | Modo edición con `initialValues` + password opcional |
| `components/admin/UserTable.tsx` | CREAR | Tabla de usuarios con Edit/Desactivar |
| `app/dashboard/admin/reports/page.tsx` | MODIFICAR | Estado `editingReport` + `handleEdit` |
| `app/dashboard/admin/users/page.tsx` | MODIFICAR | Estado `editingUser` + `UserTable` integrada |

**Total: 10 cambios backend + 10 cambios frontend = 20 cambios. 3 archivos nuevos.**

---

## Orden de Ejecución Recomendado

```
Fase 1 (Backend fix inmediato)   → Bug admin sidebar RESUELTO
     ↓
Fase 2 (Schema + migración)      → Nuevo modelo de permisos en BD
     ↓
Fase 3 (CRUD Reportes backend)   → Endpoints completos
     ↓
Fase 4 (CRUD Usuarios backend)   → Endpoints completos
     ↓
Fase 5 (Frontend Reportes)       → UI actualizada con multi-rol + Edit/Delete
     ↓
Fase 6 (Frontend Usuarios)       → UI con tabla + Edit/Desactivar
```

> Las fases 3 y 4 pueden ejecutarse en paralelo. Las fases 5 y 6 también pueden ejecutarse en paralelo una vez que el backend esté completo.
