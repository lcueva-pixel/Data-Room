# Plan de Acción Frontend v2 — LockerStudio (Next.js 16)

> **Estado:** Pendiente de aprobación
> **Versión:** 2.0 — Actualización sobre arquitectura existente
> **Alcance:** Exclusivamente `frontend/src/`
> **Restricción:** Solo planificación. Ningún archivo se toca hasta recibir luz verde fase por fase.

---

## Estado de la Arquitectura Actual

Lo siguiente ya está implementado y **no se toca** salvo que se indique:

| Componente / Archivo | Estado |
|----------------------|--------|
| `src/proxy.ts` | ✅ Funciona — se extenderá para rutas admin |
| `src/context/AuthContext.tsx` | ✅ Completo |
| `src/lib/axios.ts` | ✅ Completo con interceptor JWT |
| `src/lib/auth.ts` | ✅ Helpers de cookie |
| `src/hooks/useReports.ts` | ✅ Completo |
| `src/types/auth.types.ts` | ✅ Completo |
| `src/types/report.types.ts` | ✅ Completo |
| `src/components/auth/LoginForm.tsx` | ✅ Completo |
| `src/components/dashboard/Sidebar.tsx` | ⚠️ Se extiende — agregar sección Admin |
| `src/components/dashboard/TopBar.tsx` | ✅ Completo |
| `src/components/dashboard/ReportGrid.tsx` | ⚠️ Se reemplaza — nuevo modo single-iframe |
| `src/components/dashboard/ReportCard.tsx` | ⚠️ Se refactoriza — nuevo `ReportViewer` |
| `src/app/dashboard/page.tsx` | ⚠️ Se modifica — nueva lógica de visualización |

---

## Diagnóstico de Brechas

| # | Requerimiento nuevo | Brecha actual | Archivos afectados |
|---|---------------------|---------------|--------------------|
| 1 | Iframe único por selección de sidebar | Grid muestra TODOS los reportes en paralelo | `dashboard/page.tsx`, `ReportGrid.tsx` → `ReportViewer.tsx` |
| 2 | Protección de rutas admin (rol=1) | `proxy.ts` solo revisa token, no rol | `proxy.ts`, nuevo helper |
| 3 | Sección admin en sidebar | Sidebar no tiene ítems administrativos | `Sidebar.tsx` |
| 4 | Panel admin: Gestión de Reportes | No existe | Nueva página + componentes |
| 5 | Panel admin: Auditoría | No existe | Nueva página + hook |
| 6 | Panel admin: Gestión de Usuarios | No existe | Nueva página + hook + validación |
| 7 | Validación de formularios cliente | No hay react-hook-form ni Zod | Nuevas dependencias |

---

## Estructura Objetivo de Archivos

```
frontend/src/
├── proxy.ts                             ← Extender: proteger /dashboard/admin
│
├── types/
│   ├── auth.types.ts                    ← Sin cambios
│   ├── report.types.ts                  ← Sin cambios
│   ├── audit.types.ts                   ← NUEVO
│   └── user.types.ts                    ← NUEVO
│
├── lib/
│   ├── auth.ts                          ← Sin cambios
│   └── axios.ts                         ← Sin cambios
│
├── hooks/
│   ├── useReports.ts                    ← Sin cambios
│   ├── useAdminReports.ts               ← NUEVO: CRUD de reportes (admin)
│   ├── useAudit.ts                      ← NUEVO: fetch audit log
│   ├── useUsers.ts                      ← NUEVO: crear usuario
│   └── useRoles.ts                      ← NUEVO: fetch GET /roles
│
├── context/
│   └── AuthContext.tsx                  ← Sin cambios
│
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx                ← Sin cambios
│   ├── dashboard/
│   │   ├── Sidebar.tsx                  ← MODIFICAR: agregar sección admin
│   │   ├── TopBar.tsx                   ← Sin cambios
│   │   ├── ReportViewer.tsx             ← NUEVO: iframe único responsivo
│   │   ├── ReportGrid.tsx               ← ELIMINAR (reemplazado por ReportViewer)
│   │   └── ReportCard.tsx               ← ELIMINAR (reemplazado por ReportViewer)
│   └── admin/
│       ├── ReportForm.tsx               ← NUEVO: crear/editar reporte
│       ├── ReportTable.tsx              ← NUEVO: tabla de reportes admin
│       ├── AuditTable.tsx               ← NUEVO: tabla de auditoría
│       └── UserForm.tsx                 ← NUEVO: formulario registro usuario
│
└── app/
    ├── layout.tsx                       ← Sin cambios
    ├── page.tsx                         ← Sin cambios (redirect /login)
    ├── login/
    │   └── page.tsx                     ← Sin cambios
    └── dashboard/
        ├── layout.tsx                   ← Sin cambios
        ├── page.tsx                     ← MODIFICAR: usar ReportViewer
        └── admin/
            ├── layout.tsx               ← NUEVO: guard de admin client-side
            ├── reports/
            │   └── page.tsx             ← NUEVO: gestión de reportes
            └── audit/
                └── page.tsx             ← NUEVO: auditoría del sistema
            └── users/
                └── page.tsx             ← NUEVO: gestión de usuarios
```

---

## Fase 1 — Instalación de Nuevas Dependencias

**Objetivo:** Agregar las librerías necesarias para validación de formularios.

### Paso 1.1 — Instalar react-hook-form + Zod

```bash
cd frontend
npm install react-hook-form zod @hookform/resolvers
```

| Paquete | Propósito |
|---------|-----------|
| `react-hook-form` | Gestión de estado de formularios sin re-renders innecesarios |
| `zod` | Validación de esquemas tipada con TypeScript |
| `@hookform/resolvers` | Adaptador para integrar Zod con react-hook-form |

---

## Fase 2 — Refactorización del Dashboard Principal (Iframe Único)

**Objetivo:** Cambiar el modo de visualización de "grid de todos los reportes" a "un único iframe que cambia según la selección del sidebar".

### Paso 2.1 — Crear el componente `ReportViewer.tsx`

Este componente reemplaza al binomio `ReportGrid` + `ReportCard`. Recibe una URL y un título, y renderiza un iframe responsivo que ocupa todo el espacio disponible del área de contenido.

**`src/components/dashboard/ReportViewer.tsx`** — Planificado:

```
┌─────────────────────────────────────────────────────────┐
│  [Título del reporte]           [⤢ Abrir en nueva tab]  │
│ ─────────────────────────────────────────────────────── │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │           <iframe src={urlIframe}                │   │
│  │           width="100%" height="100%"              │   │
│  │           />                                     │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Props planificadas:**

```typescript
interface ReportViewerProps {
  titulo: string;
  urlIframe: string;
}
```

**Comportamientos:**
- El iframe se ajusta al 100% del alto disponible del contenido (`calc(100vh - 64px topbar - 48px title)`)
- Spinner de carga mientras el iframe carga (`onLoad` event)
- URL de prueba para desarrollo: `https://lookerstudio.google.com/s/mlvEd3iDOXc#cd-jsr284k30d`
- Botón de "abrir en nueva pestaña" como fallback si Looker Studio bloquea embedding

**Estado vacío:** Si no hay reporte seleccionado, mostrar ilustración + mensaje "Selecciona un reporte del menú lateral para comenzar".

### Paso 2.2 — Modificar `dashboard/page.tsx`

Reemplazar la lógica de `ReportGrid` por `ReportViewer`:

```typescript
// ANTES: mostraba todos los reportes en grid
<ReportGrid reports={reports} selectedReport={selectedReport} ... />

// DESPUÉS: muestra solo el reporte seleccionado
{selectedReport ? (
  <ReportViewer
    titulo={selectedReport.titulo}
    urlIframe={selectedReport.urlIframe}
  />
) : (
  <EmptyState />
)}
```

**El flujo completo queda:**
1. Usuario hace clic en un ítem del sidebar → `setSelectedReport(report)`
2. `ReportViewer` recibe la nueva URL → muestra spinner → carga el iframe
3. Título en `TopBar` y en `ReportViewer` cambian dinámicamente

### Paso 2.3 — Eliminar `ReportGrid.tsx` y `ReportCard.tsx`

Estos archivos quedan obsoletos tras la implementación de `ReportViewer`.

---

## Fase 3 — Protección de Rutas de Administrador

**Objetivo:** Asegurar que las rutas `/dashboard/admin/*` solo sean accesibles para usuarios con `rol_id === 1` (administrador).

### Paso 3.1 — Extender `src/proxy.ts`

El proxy actual solo verifica si existe el token. Se extiende para verificar también el `rol_id` cuando la ruta es `/dashboard/admin/*`:

**Lógica adicional planificada:**

```typescript
// Para rutas admin: verificar que rol_id sea 1
const rolId = request.cookies.get('rol_id')?.value;
const isAdminRoute = pathname.startsWith('/dashboard/admin');

if (isAdminRoute && rolId !== '1') {
  // No es admin: redirigir al dashboard normal
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

**Matcher actualizado:**

```typescript
export const config = {
  matcher: ['/login', '/dashboard/:path*'],
  // /dashboard/admin/* queda cubierto por /dashboard/:path*
};
```

### Paso 3.2 — Guard client-side en `dashboard/admin/layout.tsx`

El proxy es la primera línea de defensa, pero se agrega un segundo nivel client-side como respaldo:

**`src/app/dashboard/admin/layout.tsx`** — Planificado:

```typescript
'use client';
// Al montar, verificar que rolId === 1
// Si no → redirigir a /dashboard
// Si sí → renderizar children
```

Esta doble verificación (proxy server-side + component client-side) es la práctica recomendada.

---

## Fase 4 — Extensión del Sidebar con Sección Admin

**Objetivo:** Agregar una sección de navegación administrativa en el sidebar, visible únicamente para administradores.

### Paso 4.1 — Modificar `Sidebar.tsx`

**Estructura nueva del sidebar:**

```
┌──────────────────────────┐
│  CONSTRUEX logo          │
│ ──────────────────       │
│                          │
│  REPORTES                │  ← Sección existente (sin cambios)
│  □ [Reporte 1]           │
│  □ [Reporte 2]           │
│  □ [Reporte N]           │
│                          │
│  ──────────────────      │  ← Solo si rol_id === 1:
│  ADMINISTRACIÓN          │
│  □ Gestión de Reportes   │  → /dashboard/admin/reports
│  □ Auditoría             │  → /dashboard/admin/audit
│  □ Usuarios              │  → /dashboard/admin/users
│                          │
│ ──────────────────       │
│  ⚙ Configuración         │
│  ⬅ Cerrar sesión         │
└──────────────────────────┘
```

**Cambios planificados en `Sidebar.tsx`:**
- Leer `rolId` desde `useAuth()` o directamente desde `getRolId()`
- Renderizar condicionalmente la sección "Administración" si `rolId === 1`
- Usar `<Link href="/dashboard/admin/reports">` para navegación (no `<button>`)
- Los ítems admin tienen icono diferenciado: `ShieldCheck`, `ClipboardList`, `Users`

---

## Fase 5 — Panel Admin: Gestión de Reportes

**Objetivo:** Formulario admin para crear/visualizar reportes de la tabla `cex_reportes`.

### Paso 5.1 — Nuevo hook `useAdminReports.ts`

**`src/hooks/useAdminReports.ts`** — Planificado:

```typescript
interface UseAdminReportsResult {
  reports: Report[];       // Todos los reportes (no filtrados por rol)
  isLoading: boolean;
  error: string | null;
  createReport: (data: CreateReportPayload) => Promise<void>;
  refetch: () => void;
}
```

**Endpoints que consume:**
- `GET /reports` — lista de reportes del usuario autenticado (admin ve todos porque rol_id=1 ≤ rolMinimoId de todos)
- `POST /reports` — crear reporte (solo admin)

> **Nota arquitectural:** El backend actual solo tiene `GET` y `POST` para reportes. No existe `PUT /reports/:id` ni `DELETE /reports/:id`. El plan incluye únicamente **creación** de reportes. Cuando el backend implemente los endpoints de edición/borrado, el hook se extiende.

### Paso 5.2 — Nuevo hook `useRoles.ts`

**`src/hooks/useRoles.ts`** — Planificado:

```typescript
interface Role {
  id: number;
  rolDescripcion: string;
}

interface UseRolesResult {
  roles: Role[];
  isLoading: boolean;
}
```

**Endpoint que consume:** `GET /roles` (protegido por JWT + AdminGuard)

Este hook es compartido entre el formulario de reportes y el formulario de usuarios.

### Paso 5.3 — Nuevo tipo `user.types.ts`

**`src/types/user.types.ts`** — Planificado:

```typescript
export interface Role {
  id: number;
  rolDescripcion: string;
}

export interface CreateUserPayload {
  nombreCompleto: string;
  email: string;
  password: string;
  rolId: number;
  activo?: boolean;
}
```

### Paso 5.4 — Esquema Zod para el formulario de reportes

**Validaciones client-side planificadas:**

```typescript
const reportSchema = z.object({
  titulo: z.string().min(1, 'El nombre del reporte es obligatorio').max(100),
  urlIframe: z
    .string()
    .url('Debe ser una URL válida de Looker Studio')
    .startsWith('https://', 'La URL debe comenzar con https://'),
  descripcion: z.string().max(500).optional(),
  rolMinimoId: z
    .number({ required_error: 'Selecciona un rol' })
    .int()
    .min(1),
  activo: z.boolean().default(true),
});

type ReportFormValues = z.infer<typeof reportSchema>;
```

> **Nota sobre `rolMinimoId`:** El backend usa un campo `rolMinimoId` de tipo entero que define el umbral de acceso (no es una lista de roles). El formulario incluirá un selector dropdown (`<select>`) que cargará los roles desde `GET /roles` y dejará seleccionar uno solo — el que será el umbral mínimo para ver el reporte. Esto es consistente con el esquema actual de la BD (`cex_reportes.rol_minimo_id`).

### Paso 5.5 — Componente `ReportForm.tsx`

**`src/components/admin/ReportForm.tsx`** — Diseño planificado:

```
┌────────────────────────────────────────────────┐
│  Nuevo Reporte                                  │
│ ────────────────────────────────────────────── │
│  Nombre del botón *                             │
│  ┌──────────────────────────────────────────┐  │
│  │ Ej: Reporte de Ventas Q1                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  URL de Looker Studio *                         │
│  ┌──────────────────────────────────────────┐  │
│  │ https://lookerstudio.google.com/...      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Descripción (opcional)                         │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Rol mínimo de acceso *                         │
│  ┌──────────────────────────────────────────┐  │
│  │ ▾ Selecciona un rol                      │  │
│  └──────────────────────────────────────────┘  │
│  ℹ️ Los usuarios con este rol o superior         │
│     podrán ver este reporte.                    │
│                                                 │
│  ☑ Reporte activo                               │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Cancelar    │  │  ✓ Guardar   │            │
│  └──────────────┘  └──────────────┘            │
└────────────────────────────────────────────────┘
```

**Props planificadas:**

```typescript
interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Implementación con react-hook-form + Zod:**
- `useForm<ReportFormValues>({ resolver: zodResolver(reportSchema) })`
- Validación en tiempo real (en blur de cada campo)
- Mensajes de error inline bajo cada campo
- El selector de rol carga dinámicamente desde `useRoles()`
- Submit → `POST /reports` → toast de éxito o error inline

### Paso 5.6 — Componente `ReportTable.tsx`

**`src/components/admin/ReportTable.tsx`** — Diseño planificado:

```
┌─ Gestión de Reportes ─────────────────── [+ Nuevo Reporte] ─┐
│                                                              │
│  ID  │ Nombre              │ Rol mínimo │ Activo │ Acciones  │
│  ────┼─────────────────────┼────────────┼────────┼──────── │
│  1   │ Ventas Q1           │ admin      │ ✅      │ [Editar] │
│  2   │ Operaciones         │ empleado   │ ✅      │ [Editar] │
│  3   │ RRHH                │ admin      │ ❌      │ [Editar] │
└──────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Botón "Nuevo Reporte" → muestra `ReportForm` en un modal o sección expandible
- Botón "Editar" → pre-popula el formulario (cuando el backend tenga `PUT /reports/:id`)
- Badge de color para el estado "Activo/Inactivo"
- `rolMinimoId` se muestra como texto descriptivo usando los roles cargados

### Paso 5.7 — Página `dashboard/admin/reports/page.tsx`

```typescript
// Estructura planificada:
export default function AdminReportsPage() {
  const [showForm, setShowForm] = useState(false);
  // ...
  return (
    <div>
      <ReportTable ... />
      {showForm && <ReportForm onSuccess={...} onCancel={...} />}
    </div>
  );
}
```

---

## Fase 6 — Panel Admin: Módulo de Auditoría

**Objetivo:** Vista de solo lectura con el historial de accesos al sistema.

### Paso 6.1 — Nuevo tipo `audit.types.ts`

**`src/types/audit.types.ts`** — Planificado:

```typescript
export interface AuditEntry {
  id: number;
  usuarioId: number;
  fechaHora: string;
  ipAddress: string | null;
  userAgent: string | null;
  usuario: {
    nombreCompleto: string;
    email: string;
  };
}
```

### Paso 6.2 — Nuevo hook `useAudit.ts`

**`src/hooks/useAudit.ts`** — Planificado:

```typescript
interface UseAuditResult {
  entries: AuditEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Endpoint que consume:** `GET /audit` (protegido por JWT + AdminGuard)

### Paso 6.3 — Componente `AuditTable.tsx`

**`src/components/admin/AuditTable.tsx`** — Diseño planificado:

```
┌─ Auditoría del Sistema ──────────────────────── [↻ Actualizar] ─┐
│                                                                  │
│  Usuario          │ Email           │ Fecha/Hora    │ IP        │
│  ─────────────────┼─────────────────┼───────────────┼───────── │
│  Administrador    │ admin@admin.com  │ 26/03 14:32   │ 127.0.0.1│
│  Juan Pérez       │ juan@empresa.com │ 26/03 12:15   │ 192.168.1│
└──────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Tabla ordenada por `fechaHora` descendente (más reciente primero)
- Fecha formateada en español con `Intl.DateTimeFormat`
- `userAgent` en tooltip al hacer hover sobre la celda (evita columna muy ancha)
- IP address truncada si es muy larga
- Botón "Actualizar" llama a `refetch()`
- Estado de carga: skeleton de filas
- Estado vacío: mensaje informativo

### Paso 6.4 — Página `dashboard/admin/audit/page.tsx`

```typescript
export default function AuditPage() {
  const { entries, isLoading, error, refetch } = useAudit();
  return <AuditTable entries={entries} isLoading={isLoading} error={error} onRefetch={refetch} />;
}
```

**Acceso:** Protegida por `proxy.ts` (rol_id=1) + guard client-side en `admin/layout.tsx`.

---

## Fase 7 — Panel Admin: Gestión de Usuarios

**Objetivo:** Formulario para registrar nuevos usuarios, disponible solo dentro del panel de administración.

### Decisión de ubicación

El formulario de registro **vive dentro del panel de administración** (`/dashboard/admin/users`), no en una ruta pública. Razones:
- El endpoint `POST /users` está protegido por `JwtAuthGuard + AdminGuard` en el backend
- Solo los administradores pueden crear usuarios
- Una ruta pública de registro sería inútil sin autenticación

### Paso 7.1 — Esquema Zod para el formulario de usuario

```typescript
const userSchema = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
  rolId: z.number({ required_error: 'Selecciona un rol' }).int().min(1),
  activo: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type UserFormValues = z.infer<typeof userSchema>;
```

**Nota:** `confirmPassword` se valida solo en el cliente y **no se envía** al backend.

### Paso 7.2 — Nuevo hook `useUsers.ts`

**`src/hooks/useUsers.ts`** — Planificado:

```typescript
interface UseUsersResult {
  createUser: (payload: CreateUserPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}
```

**Endpoint que consume:** `POST /users` (protegido por JWT + AdminGuard)

### Paso 7.3 — Componente `UserForm.tsx`

**`src/components/admin/UserForm.tsx`** — Diseño planificado:

```
┌─ Registrar Nuevo Usuario ──────────────────────────────────────┐
│                                                                 │
│  Nombre completo *                                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Juan Pérez                                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Correo electrónico *                                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ juan@empresa.com                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Contraseña *                              Confirmar *          │
│  ┌──────────────────────────┐   ┌────────────────────────┐    │
│  │ ••••••••             👁  │   │ ••••••••           👁  │    │
│  └──────────────────────────┘   └────────────────────────┘    │
│  ⚠ Min. 6 caracteres, 1 mayús., 1 número                       │
│                                                                 │
│  Rol del usuario *                                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ▾ Selecciona un rol                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ☑ Usuario activo                                              │
│                                                                 │
│  ┌──────────────┐  ┌─────────────────────┐                    │
│  │  Limpiar     │  │  ✓ Crear Usuario    │                    │
│  └──────────────┘  └─────────────────────┘                    │
│                                                                 │
│  ✅ Usuario creado exitosamente     ← banner de éxito          │
└─────────────────────────────────────────────────────────────────┘
```

**Implementación con react-hook-form + Zod:**
- `useForm<UserFormValues>({ resolver: zodResolver(userSchema) })`
- Los roles se cargan desde `useRoles()` (reutilizado de Fase 5)
- Al éxito → mostrar banner verde + limpiar formulario
- Al error → mostrar mensaje del backend inline
- Botón "Limpiar" → `reset()` del hook de react-hook-form

### Paso 7.4 — Página `dashboard/admin/users/page.tsx`

```typescript
export default function AdminUsersPage() {
  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      <UserForm />
    </div>
  );
}
```

---

## Fase 8 — Layout Admin con Guard Client-Side

**Objetivo:** Crear el layout que protege todas las rutas `/dashboard/admin/*` a nivel de componente.

### Paso 8.1 — Crear `dashboard/admin/layout.tsx`

**Lógica planificada:**

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRolId } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const rolId = getRolId();
    if (rolId !== 1) {
      router.replace('/dashboard'); // Redirigir si no es admin
    }
  }, [router]);

  const rolId = getRolId();
  if (rolId !== 1) return null; // No renderizar nada mientras redirige

  return <>{children}</>;
}
```

**¿Por qué doble protección (proxy + layout)?**
- El `proxy.ts` protege en el servidor antes de renderizar → previene el flash de contenido
- El `admin/layout.tsx` protege en el cliente → cubre edge cases donde la cookie cambia sin recargar
- Juntos forman una defensa en profundidad

---

## Resumen de Todos los Archivos

### Archivos NUEVOS a crear

| Archivo | Fase |
|---------|------|
| `src/types/audit.types.ts` | Fase 6 |
| `src/types/user.types.ts` | Fase 5 |
| `src/hooks/useAdminReports.ts` | Fase 5 |
| `src/hooks/useAudit.ts` | Fase 6 |
| `src/hooks/useUsers.ts` | Fase 7 |
| `src/hooks/useRoles.ts` | Fase 5 |
| `src/components/dashboard/ReportViewer.tsx` | Fase 2 |
| `src/components/admin/ReportForm.tsx` | Fase 5 |
| `src/components/admin/ReportTable.tsx` | Fase 5 |
| `src/components/admin/AuditTable.tsx` | Fase 6 |
| `src/components/admin/UserForm.tsx` | Fase 7 |
| `src/app/dashboard/admin/layout.tsx` | Fase 8 |
| `src/app/dashboard/admin/reports/page.tsx` | Fase 5 |
| `src/app/dashboard/admin/audit/page.tsx` | Fase 6 |
| `src/app/dashboard/admin/users/page.tsx` | Fase 7 |

### Archivos MODIFICADOS

| Archivo | Cambio | Fase |
|---------|--------|------|
| `src/proxy.ts` | Agregar protección para rutas admin con verificación de `rol_id` | Fase 3 |
| `src/components/dashboard/Sidebar.tsx` | Agregar sección admin condicional (rol=1) | Fase 4 |
| `src/app/dashboard/page.tsx` | Reemplazar `<ReportGrid>` por `<ReportViewer>` | Fase 2 |

### Archivos ELIMINADOS

| Archivo | Razón |
|---------|-------|
| `src/components/dashboard/ReportGrid.tsx` | Reemplazado por `ReportViewer` |
| `src/components/dashboard/ReportCard.tsx` | Reemplazado por `ReportViewer` |

---

## Nuevas Rutas del Frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público (sin token) | Formulario de login |
| `/dashboard` | JWT requerido | Dashboard principal con iframe de reporte |
| `/dashboard/admin/reports` | JWT + rol=1 | Gestión de reportes (crear) |
| `/dashboard/admin/audit` | JWT + rol=1 | Auditoría del sistema |
| `/dashboard/admin/users` | JWT + rol=1 | Registro de nuevos usuarios |

---

## Flujo Completo del Sistema (End-to-End v2)

```
[USUARIO]
    │
    ▼
http://localhost:3001
    │
    ▼
proxy.ts → sin token → /login
    │
    ▼
Login form → POST /auth/login → { access_token, rol_id }
    │
    ▼
Cookies: access_token, rol_id
    │
    ▼
    ├─── rol_id = 2 (empleado) ──────────────────────────┐
    │                                                     │
    │   /dashboard                                        │
    │   Sidebar: muestra solo reportes con               │
    │            rolMinimoId accesible                   │
    │   Click en reporte → ReportViewer (iframe)         │
    │                                                     │
    └─── rol_id = 1 (admin) ─────────────────────────────┘
                                                         │
        /dashboard                                       │
        Sidebar: reportes + sección ADMINISTRACIÓN       │
        Click en reporte → ReportViewer (iframe)         │
                                                         │
        /dashboard/admin/reports                         │
        → Crear reportes (POST /reports)                 │
                                                         │
        /dashboard/admin/audit                           │
        → Ver log de accesos (GET /audit)                │
                                                         │
        /dashboard/admin/users                           │
        → Crear usuarios (POST /users)                   │
```

---

## Orden de Ejecución Recomendado

```
Fase 1 (Dependencias: react-hook-form + Zod)
  → Fase 2 (Refactor: ReportViewer, eliminar Grid/Card)
    → Fase 3 (Proxy: proteger /admin con rol_id)
      → Fase 4 (Sidebar: sección admin)
        → Fase 8 (Admin layout: guard client-side)
          → Fase 5 (Panel admin: Gestión de Reportes)
            → Fase 6 (Panel admin: Auditoría)
              → Fase 7 (Panel admin: Registro de Usuarios)
```

> **Nota:** Las fases 5, 6 y 7 son independientes entre sí una vez implementada la Fase 8. Pueden ejecutarse en cualquier orden.

---

*Documento generado el 2026-03-26. Pendiente de aprobación antes de ejecutar cualquier cambio.*
