# Arquitectura del Frontend

**Framework:** Next.js 16.2.1 con App Router  
**Lenguaje:** TypeScript 5  
**UI:** React 19.2.4 + Tailwind CSS 4

---

## Stack Tecnologico

| Libreria | Version | Proposito |
|----------|---------|-----------|
| Next.js | 16.2.1 | Framework React con SSR, App Router, middleware |
| React | 19.2.4 | Biblioteca de UI |
| TypeScript | 5 | Tipado estatico |
| Tailwind CSS | 4 | Estilos utilitarios |
| Axios | 1.13.6 | Cliente HTTP para consumo de API |
| TanStack React Query | 5.95.2 | Gestion de estado de servidor (cache, mutaciones) |
| TanStack React Table | 8.21.3 | Tablas con paginacion, ordenamiento y filtros |
| React Hook Form | 7.72.0 | Gestion de formularios |
| Zod | 4.3.6 | Validacion de esquemas |
| js-cookie | 3.0.5 | Manejo de cookies del navegador |
| next-themes | 0.4.6 | Toggle de tema claro/oscuro |
| Lucide React | 1.7.0 | Iconos SVG |
| Recharts | 3.8.1 | Graficos y visualizaciones |
| clsx | 2.1.1 | Concatenacion condicional de clases CSS |

---

## Estructura de Carpetas

```
frontend/src/
  app/                          -> Paginas y layouts (App Router de Next.js)
    page.tsx                    -> Redireccion raiz a /login
    layout.tsx                  -> Layout global (Providers, metadata, estilos)
    globals.css                 -> Estilos globales
    sidebar-scrollbar.css       -> Estilos custom del scrollbar del sidebar
    login/
      page.tsx                  -> Pagina de inicio de sesion
    dashboard/
      page.tsx                  -> Dashboard principal (visor de reportes)
      layout.tsx                -> Layout del dashboard (AuthProvider)
      overview/
        page.tsx                -> Pagina de bienvenida con tarjetas
      admin/
        layout.tsx              -> Layout admin (guard de rol, sidebar)
        users/page.tsx          -> Gestion de usuarios
        reports/page.tsx        -> Gestion de reportes
        audit/page.tsx          -> Tabla de auditoria

  components/                   -> Componentes React reutilizables
    Providers.tsx               -> Wrapper de providers globales
    auth/
      LoginForm.tsx             -> Formulario de login
    dashboard/
      Sidebar.tsx               -> Menu lateral con arbol de reportes
      TopBar.tsx                -> Barra superior con breadcrumbs y tema
      ReportViewer.tsx          -> Visor de reportes con iframe
    admin/
      UserTable.tsx             -> Tabla de gestion de usuarios
      UserForm.tsx              -> Formulario crear/editar usuario
      ReportTable.tsx           -> Tabla de gestion de reportes
      ReportForm.tsx            -> Formulario crear/editar reporte
      ChildReportsSection.tsx   -> Seccion de sub-reportes
      AuditTable.tsx            -> Tabla de registros de auditoria
    overview/
      OverviewCard.tsx          -> Tarjeta del grid de overview
      PDFViewerModal.tsx        -> Modal visor de documentos
    ui/
      Modal.tsx                 -> Componente modal reutilizable
      ToggleSwitch.tsx          -> Switch on/off reutilizable

  hooks/                        -> Custom hooks
    useReports.ts               -> Carga de reportes del usuario
    useAdminReports.ts          -> CRUD de reportes (admin, React Query)
    useChildReports.ts          -> Sub-reportes de un padre
    useUsers.ts                 -> CRUD de usuarios (React Query)
    useRoles.ts                 -> Listado de roles
    useAudit.ts                 -> Datos de auditoria
    useReportTracking.ts        -> Tracking de tiempo de visualizacion

  lib/                          -> Utilidades y configuracion
    axios.ts                    -> Instancia Axios con interceptores
    auth.ts                     -> Gestion de sesion via cookies

  context/                      -> Providers de estado global
    AuthContext.tsx              -> Context de autenticacion

  types/                        -> Definiciones de tipos TypeScript
    auth.types.ts               -> LoginCredentials, LoginResponse, SessionUser
    user.types.ts               -> User, Role, CreateUserPayload, PaginatedUsers
    report.types.ts             -> Report, ReportRole, CreateReportPayload
    audit.types.ts              -> AuditEntry, PaginatedAudit
```

---

## Patron de Enrutamiento

El frontend usa el **App Router** de Next.js. Las rutas se definen por la estructura de carpetas dentro de `src/app/`.

| Ruta | Archivo | Proteccion | Descripcion |
|------|---------|-----------|-------------|
| `/` | `app/page.tsx` | Ninguna | Redireccion automatica a `/login` |
| `/login` | `app/login/page.tsx` | Redirige a dashboard si hay token | Pagina de inicio de sesion |
| `/dashboard` | `app/dashboard/page.tsx` | Requiere token | Dashboard con visor de reportes |
| `/dashboard/overview` | `app/dashboard/overview/page.tsx` | Requiere token | Pagina de bienvenida |
| `/dashboard/admin/users` | `app/dashboard/admin/users/page.tsx` | Token + rol_id=1 | Gestion de usuarios |
| `/dashboard/admin/reports` | `app/dashboard/admin/reports/page.tsx` | Token + rol_id=1 | Gestion de reportes |
| `/dashboard/admin/audit` | `app/dashboard/admin/audit/page.tsx` | Token + rol_id=1 | Registros de auditoria |

### Middleware de Proteccion (`proxy.ts`)

El archivo `src/proxy.ts` funciona como middleware de Next.js que intercepta las peticiones:

1. **Sin token + ruta protegida** -> Redirige a `/login`
2. **Con token + en /login** -> Redirige a `/dashboard`
3. **Con token + ruta admin + rol_id != 1** -> Redirige a `/dashboard`

---

## Gestion de Estado

El frontend usa tres niveles de gestion de estado:

### 1. Estado Global: Context API (Autenticacion)
- **AuthContext:** Provee `session`, `login()`, `logout()`, `isLoading`
- Se restaura desde cookies al montar el componente
- Disponible en todas las paginas protegidas via `<AuthProvider>`

### 2. Estado de Servidor: React Query
- Configurado en `Providers.tsx` con `staleTime: 30000ms` (30 segundos) y `retry: 1`
- Usado en hooks de admin: `useUsers`, `useAdminReports`, `useChildReports`
- Invalidacion automatica de cache tras mutaciones exitosas

### 3. Estado Local: useState / useEffect
- Usado en hooks simples: `useReports`, `useAudit`, `useRoles`
- Estado de formularios, filtros, paginacion, modales

---

## Cliente HTTP (Axios)

Configurado en `src/lib/axios.ts`:

- **Base URL:** Lee de la variable de entorno `NEXT_PUBLIC_API_URL` (valor: `http://localhost:3001/api`)
- **Interceptor de Request:** Agrega automaticamente `Authorization: Bearer <token>` a todas las peticiones
- **Interceptor de Response:** En caso de error 401, limpia la sesion y redirige a `/login`
- **Header por defecto:** `Content-Type: application/json`

---

## Tema y UI

- **Tema:** next-themes con modo claro por defecto. Toggle en la TopBar
- **Responsive:** Sidebar colapsable en mobile (hamburguesa), breadcrumbs ocultos en pantallas pequenas
- **Loading States:** Skeleton loaders en tablas y sidebar durante carga de datos
- **Iconos:** Lucide React en toda la aplicacion
- **Componentes UI:** Modal reutilizable con soporte para Escape y click fuera, ToggleSwitch con tamanios sm/md

---

## Variables de Entorno

| Variable | Valor | Descripcion |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | URL base del backend NestJS |

Las variables con prefijo `NEXT_PUBLIC_` se exponen al navegador (client-side).
