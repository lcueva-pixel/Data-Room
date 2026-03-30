# Plan de Acción: Frontend — LockerStudio (Next.js)

> **Estado:** Pendiente de aprobación
> **Alcance:** Exclusivamente la carpeta `FRONTEND/`
> **Restricción:** Este documento es solo de planificación. No se instalará nada ni se creará ningún archivo de código hasta recibir luz verde por fase.

---

## Diagnóstico del Estado Actual

| Elemento | Estado |
|----------|--------|
| Carpeta `FRONTEND/` | No existe — se crea desde cero |
| Backend disponible | Puerto `3000` — NestJS + Prisma + PostgreSQL |
| Autenticación backend | JWT (`POST /auth/login`) → devuelve `{ access_token, rol_id }` |
| Reportes backend | `GET /reports` → devuelve array de reportes según `rol_id` del token |
| Contenido de cada reporte | `{ id, titulo, descripcion, urlIframe, rolMinimoId, activo }` |
| Roles conocidos | `1 = administrador`, `2 = empleado` |
| Usuario por defecto | `admin@admin.com` / `admin123` |

---

## Stack Tecnológico Seleccionado

| Herramienta | Propósito | Justificación |
|-------------|-----------|---------------|
| **Next.js 14** (App Router) | Framework principal | SSR/CSR, routing, middleware nativo |
| **TypeScript** | Tipado | Consistencia con el backend |
| **Tailwind CSS** | Estilos | Utilidades atómicas, velocidad de desarrollo |
| **Recharts** | Gráficos financieros | Declarativo, integración React, stacked bars + line overlay |
| **Axios** | Cliente HTTP | Interceptores para JWT automático |
| **js-cookie** | Gestión del token | Acceso desde middleware de Next.js |
| **lucide-react** | Iconos del sidebar | Librería ligera y moderna |
| **clsx** | Condicionales de clases | Utilidad para combinar clases Tailwind |

> **Nota sobre Recharts vs iframes:** El campo `urlIframe` de cada reporte es una URL de Looker Studio para incrustar. Las tarjetas de la cuadrícula renderizarán `<iframe>` con esas URLs. Recharts se usa para **tarjetas de métricas nativas** (ej. un KPI card de resumen) si se agregan en el futuro, o como fallback si la URL del iframe no carga.

---

## Arquitectura de Carpetas

```
FRONTEND/
├── .env.local                      ← Variables de entorno (URL del backend)
├── next.config.ts                  ← Configuración Next.js (domains para iframes)
├── tailwind.config.ts              ← Configuración Tailwind
├── tsconfig.json
├── package.json
├── public/
│   └── construex-logo.svg          ← Logo SVG del sidebar
└── src/
    ├── middleware.ts               ← Protección de rutas (redirige a /login si no hay token)
    ├── app/
    │   ├── layout.tsx              ← Root layout (fuente, metadata global)
    │   ├── page.tsx                ← Redirige automáticamente a /login
    │   ├── login/
    │   │   └── page.tsx            ← Página de Login
    │   └── dashboard/
    │       ├── layout.tsx          ← Layout del Dashboard (Sidebar + área de contenido)
    │       └── page.tsx            ← Contenido principal (cuadrícula de reportes)
    ├── components/
    │   ├── auth/
    │   │   └── LoginForm.tsx       ← Formulario de login con validación
    │   └── dashboard/
    │       ├── Sidebar.tsx         ← Sidebar azul con logo y nav dinámica
    │       ├── TopBar.tsx          ← Header con breadcrumbs e info de usuario
    │       ├── ReportGrid.tsx      ← CSS Grid que renderiza las tarjetas
    │       └── ReportCard.tsx      ← Tarjeta individual con <iframe>
    ├── context/
    │   └── AuthContext.tsx         ← Estado global de autenticación (token, rol, logout)
    ├── hooks/
    │   ├── useReports.ts           ← Fetch de GET /reports con el token
    │   └── useAuth.ts              ← Acceso al contexto de autenticación
    ├── lib/
    │   ├── axios.ts                ← Instancia de Axios con interceptor JWT
    │   └── auth.ts                 ← Helpers: guardar/leer/eliminar token de cookie
    └── types/
        ├── auth.types.ts           ← Tipos del login y sesión
        └── report.types.ts         ← Tipo Report (refleja la respuesta del backend)
```

---

## Fase 1 — Inicialización del Proyecto Next.js

**Objetivo:** Crear el proyecto base con todas las dependencias y la configuración inicial lista.

### Paso 1.1 — Crear el proyecto Next.js

Ejecutar dentro de la carpeta raíz `LockerStudio/`:

```bash
npx create-next-app@latest FRONTEND \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Opciones clave:
- `--app`: Usa el App Router de Next.js 14 (no Pages Router)
- `--src-dir`: Código en `src/` (consistente con el backend)
- `--tailwind`: Instala y configura Tailwind automáticamente

### Paso 1.2 — Instalar dependencias adicionales

```bash
cd FRONTEND
npm install axios js-cookie recharts lucide-react clsx
npm install --save-dev @types/js-cookie
```

| Paquete | Versión objetivo |
|---------|-----------------|
| `axios` | ^1.7.x |
| `js-cookie` | ^3.0.x |
| `recharts` | ^2.x |
| `lucide-react` | ^0.400.x |
| `clsx` | ^2.x |

### Paso 1.3 — Configurar variables de entorno

Crear `FRONTEND/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> `NEXT_PUBLIC_` expone la variable al cliente (necesario para llamadas desde el browser).

### Paso 1.4 — Configurar `next.config.ts`

Agregar los dominios permitidos para los iframes de Looker Studio y el backend de CORS:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

> Los iframes de Looker Studio no requieren configuración especial en Next.js — solo se renderiza el `<iframe>` con la URL de `urlIframe`. La restricción de `X-Frame-Options` aplica a nuestra app siendo incrustada en otros sitios, no al revés.

### Paso 1.5 — Limpiar el boilerplate de Next.js

Eliminar archivos de ejemplo generados automáticamente:
- `src/app/page.tsx` → reemplazar por una redirección a `/login`
- `src/app/globals.css` → mantener solo la importación de Tailwind
- `public/next.svg`, `public/vercel.svg` → eliminar

---

## Fase 2 — Capa de Autenticación

**Objetivo:** Implementar el sistema completo de login, gestión del token JWT y protección de rutas.

### Paso 2.1 — Definir los tipos TypeScript

**`src/types/auth.types.ts`** — Tipos de la sesión y la respuesta del backend:

```typescript
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  rol_id: number;
}

export interface SessionUser {
  access_token: string;
  rol_id: number;
}
```

**`src/types/report.types.ts`** — Tipo del reporte (refleja la respuesta de `GET /reports`):

```typescript
export interface Report {
  id: number;
  titulo: string;
  descripcion: string | null;
  urlIframe: string;
  rolMinimoId: number;
  activo: boolean;
  fechaRegistro: string;
}
```

### Paso 2.2 — Helpers de gestión del token

**`src/lib/auth.ts`** — Leer/guardar/eliminar el token en una cookie:

```typescript
// Guarda el token en cookie (accesible por el middleware de Next.js)
export const saveSession = (data: LoginResponse): void => {
  Cookies.set('access_token', data.access_token, { expires: 1/3 }); // 8h
  Cookies.set('rol_id', String(data.rol_id), { expires: 1/3 });
};

export const getToken = (): string | undefined =>
  Cookies.get('access_token');

export const clearSession = (): void => {
  Cookies.remove('access_token');
  Cookies.remove('rol_id');
};
```

> **Razón de cookie vs localStorage:** El middleware de Next.js (`middleware.ts`) solo puede leer cookies, no `localStorage`. Guardar el token en cookie permite al middleware hacer la redirección de rutas protegidas antes de que llegue al cliente.

### Paso 2.3 — Instancia de Axios con interceptor JWT

**`src/lib/axios.ts`** — Configurar Axios para que adjunte el token automáticamente:

```typescript
import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Adjunta el token Bearer en cada request automáticamente
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend devuelve 401, limpiar sesión y redirigir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

### Paso 2.4 — Contexto de autenticación

**`src/context/AuthContext.tsx`** — Estado global de la sesión con React Context:

```typescript
// Estado que provee el contexto:
interface AuthContextValue {
  session: SessionUser | null;  // null = no autenticado
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

Flujo interno del contexto:
1. Al montar, lee las cookies para restaurar la sesión existente
2. `login()`: llama a `POST /auth/login`, guarda cookies, actualiza estado
3. `logout()`: elimina cookies, redirige a `/login`

### Paso 2.5 — Hook `useAuth`

**`src/hooks/useAuth.ts`** — Acceso conveniente al contexto:

```typescript
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Paso 2.6 — Middleware de protección de rutas

**`src/middleware.ts`** — Se ejecuta en el servidor (Edge Runtime) antes de renderizar cualquier página:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Si no hay token y la ruta no es /login → redirigir a /login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token y la ruta es /login → redirigir al dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// El middleware solo se aplica a estas rutas
export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
```

---

## Fase 3 — Página de Login

**Objetivo:** Crear una página de login con diseño elegante, minimalista y validación del formulario.

### Paso 3.1 — Estructura visual de la página

**Diseño planificado:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  [Fondo gris claro]                     │
│                                                         │
│          ┌─────────────────────────────┐               │
│          │    [Logo / Ícono arriba]    │               │
│          │     CONSTRUEX              │               │
│          │   Portal de Reportes       │               │
│          │                            │               │
│          │  ┌────────────────────┐    │               │
│          │  │  Email             │    │               │
│          │  └────────────────────┘    │               │
│          │  ┌────────────────────┐    │               │
│          │  │  Contraseña    👁  │    │               │
│          │  └────────────────────┘    │               │
│          │                            │               │
│          │  [Mensaje de error]        │               │
│          │                            │               │
│          │  ┌────────────────────┐    │               │
│          │  │   Iniciar Sesión   │    │               │
│          │  └────────────────────┘    │               │
│          └─────────────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Paleta de la página de login:**
- Fondo exterior: `#F1F5F9` (slate-100)
- Tarjeta blanca: `#FFFFFF` con sombra suave (`shadow-xl`)
- Botón de submit: Azul oscuro `#1E3A5F` → hover `#152C47`
- Inputs: borde `#CBD5E1`, foco azul `#3B82F6`
- Error: rojo suave `#EF4444`

### Paso 3.2 — Lógica del componente `LoginForm.tsx`

Estados internos del formulario:
- `email: string` — valor del input
- `password: string` — valor del input
- `showPassword: boolean` — toggle del ojo del input de contraseña
- `isLoading: boolean` — deshabilita el botón durante el fetch
- `error: string | null` — mensaje de error del backend

Flujo de submit:
1. Prevenir submit vacío (validación básica HTML5 + TypeScript)
2. Llamar a `auth.login({ email, password })`
3. Si éxito → el contexto redirige a `/dashboard`
4. Si error → mostrar mensaje inline bajo el formulario

### Paso 3.3 — Redirección automática desde la raíz

**`src/app/page.tsx`** — La ruta `/` redirige inmediatamente:

```typescript
import { redirect } from 'next/navigation';
export default function RootPage() {
  redirect('/login');
}
```

El middleware también maneja esto, pero la redirección explícita en la página garantiza el comportamiento correcto en todos los casos.

---

## Fase 4 — Layout del Dashboard

**Objetivo:** Crear el esqueleto visual completo del dashboard con Sidebar + TopBar + área de contenido.

### Paso 4.1 — Estructura visual general

```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fijo)     │   ÁREA DE CONTENIDO PRINCIPAL       │
│ [Fondo azul oscuro]      │   [Fondo gris claro #F1F5F9]        │
│ ─────────────────────    │   ─────────────────────────────────  │
│  CONSTRUEX logo          │   [TOPBAR]                          │
│  ─────────────────       │   Dashboard > {titulo reporte}       │
│  [Nav items dinámicos]   │   ─────────────────────────────────  │
│  □ Ventas                │                                      │
│  □ Operaciones           │   [Título dinámico]                  │
│  □ Finanzas              │   "Ventas"                           │
│  □ RRHH                  │                                      │
│                          │   [CUADRÍCULA DE REPORTES]           │
│  ─────────────────       │   ┌──────┐ ┌──────┐ ┌──────┐        │
│  [Zona inferior]         │   │Card 1│ │Card 2│ │Card 3│        │
│  ⚙ Configuración         │   └──────┘ └──────┘ └──────┘        │
│  ⬅ Cerrar sesión         │   ┌──────┐ ┌──────┐                 │
│                          │   │Card 4│ │Card 5│                 │
│                          │   └──────┘ └──────┘                 │
└────────────────────────────────────────────────────────────────┘
```

### Paso 4.2 — Layout del Dashboard (`dashboard/layout.tsx`)

Estructura del layout:

```typescript
// Estructura JSX planificada:
<AuthProvider>
  <div className="flex h-screen overflow-hidden">
    <Sidebar />                         // 240px, fondo azul
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar />                        // ~64px, barra superior
      <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
        {children}                      // dashboard/page.tsx
      </main>
    </div>
  </div>
</AuthProvider>
```

### Paso 4.3 — Componente `Sidebar.tsx`

**Especificaciones visuales:**

| Elemento | Valor CSS / Tailwind |
|----------|---------------------|
| Ancho | `w-60` (240px) fijo |
| Fondo | `bg-blue-900 bg-opacity-95` |
| Borde derecho | `border-r border-blue-800` |
| Fuente | `text-white` |

**Estructura interna:**

```
┌──────────────────────────┐
│ [Logo Construex]         │  ← Logo SVG + texto
│ ──────────────────       │
│                          │
│  [Nav items dinámicos]   │  ← Generados desde reports
│  Cada item:              │
│  [icono] [titulo]        │  ← lucide-react BarChart2
│                          │
│ ──────────────────       │
│  [Settings] [Logout]     │  ← Botones fijos en el fondo
└──────────────────────────┘
```

**Estado gestionado en el Sidebar:**
- `activeReportId: number | null` — ID del reporte seleccionado
- Al hacer clic en un item → actualiza `activeReportId` y comunica al componente padre

**Comunicación del estado seleccionado:**
- El estado `selectedReport` vive en `dashboard/page.tsx` (el componente padre del grid)
- Se pasa al Sidebar como `onReportSelect` callback
- El Sidebar llama `onReportSelect(report)` al hacer clic

**Lógica de fetch de la navegación:**
- Los items del sidebar se obtienen de `GET /reports` (el mismo endpoint que devuelve los reportes accesibles)
- Cada item usa el campo `titulo` como texto del botón
- Si `reports.length === 0` → mostrar mensaje "Sin reportes disponibles"
- Si `isLoading` → mostrar skeleton de 4 items

### Paso 4.4 — Componente `TopBar.tsx`

**Estructura:**

```
[Breadcrumbs]                               [Info de usuario]
Dashboard > Ventas                          👤 Administrador   [Logout]
```

**Especificaciones:**

| Elemento | Detalle |
|----------|---------|
| Altura | `h-16` (64px) |
| Fondo | `bg-white border-b border-slate-200` |
| Padding | `px-6` |
| Breadcrumb | `Dashboard` → `{titulo del reporte activo}` |
| Nombre usuario | Leído del contexto de auth (campo `rol_id` → texto del rol) |
| Botón Logout | Ícono + texto, llama a `auth.logout()` |

**Nota:** El backend no devuelve el `nombre_completo` del usuario en el token JWT. El token solo contiene `{ sub: userId, rol_id: rolId }`. Para mostrar el nombre, hay dos opciones:
- **Opción A (simple):** Mostrar "Administrador" o "Empleado" según `rol_id` en la cookie
- **Opción B (completa):** Crear un endpoint `GET /users/me` en el backend que devuelva los datos del usuario autenticado

> **Decisión de plan:** Se planifica la **Opción A** por ahora. Si se requiere el nombre completo, se planificará el endpoint `/users/me` como una mejora del backend en una iteración futura.

---

## Fase 5 — Cuadrícula de Reportes (Dashboard Principal)

**Objetivo:** Crear la cuadrícula dinámica y responsive de tarjetas con iframes de Looker Studio.

### Paso 5.1 — Hook `useReports.ts`

Este hook encapsula la lógica de fetch y el estado de los reportes:

```typescript
interface UseReportsResult {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Internamente:
// 1. Al montar → llama a GET /reports con el token automático (via axios instance)
// 2. Guarda los reportes en estado
// 3. Expone isLoading y error para mostrar estados de UI
```

### Paso 5.2 — Lógica del Dashboard (`dashboard/page.tsx`)

Estado en el componente de la página:

```typescript
const [selectedReport, setSelectedReport] = useState<Report | null>(null);
const { reports, isLoading, error } = useReports();

// Al cargar, seleccionar automáticamente el primer reporte
useEffect(() => {
  if (reports.length > 0 && !selectedReport) {
    setSelectedReport(reports[0]);
  }
}, [reports]);
```

Comportamiento:
- Cuando `selectedReport` cambia → el título dinámico y el grid se actualizan
- El título sobre el grid muestra `selectedReport.titulo`
- El grid muestra **todos los reportes** (no solo el seleccionado) para el vista tipo "overview"

> **Decisión de diseño:** Se planifican dos modos:
> - **Modo Overview (default):** El grid muestra TODOS los reportes accesibles como tarjetas iframe
> - **Modo Focused:** Al hacer clic en un sidebar item, filtra el grid para mostrar solo ese reporte ampliado

### Paso 5.3 — Componente `ReportGrid.tsx`

**CSS Grid responsive con auto-fit:**

```css
/* Tailwind equivalente */
grid-cols-1              /* móvil: 1 columna */
sm:grid-cols-2           /* tablet: 2 columnas */
lg:grid-cols-2           /* laptop: 2 columnas */
xl:grid-cols-4           /* desktop ancho: 4 columnas (base planificada) */
gap-4
```

O con CSS puro para máxima flexibilidad:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
gap: 1rem;
```

Esta regla hace que la cuadrícula se adapte automáticamente:
- Si hay 1 reporte → ocupa todo el ancho
- Si hay 2 reportes → se divide en 2 columnas
- Si hay 4 reportes → 4 columnas en pantallas anchas, 2 en medianas
- Si hay 7 reportes → 4 + 3 (la última fila se llena con `justify-items: stretch`)

### Paso 5.4 — Componente `ReportCard.tsx`

**Estructura de la tarjeta:**

```
┌──────────────────────────────────────┐
│ [Título del reporte]        [⤢ icon]  │  ← Header: titulo + botón fullscreen
│ ─────────────────────────────────── │
│                                      │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │    <iframe src={urlIframe}   │   │
│  │    width="100%" height="100%"│   │
│  │    />                        │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│ [descripcion opcional]               │  ← Footer opcional
└──────────────────────────────────────┘
```

**Especificaciones visuales:**

| Elemento | Valor |
|----------|-------|
| Fondo tarjeta | `bg-white` |
| Sombra | `shadow-md hover:shadow-lg transition-shadow` |
| Border radius | `rounded-xl` |
| Altura del iframe | `400px` fija (ajustable) |
| Header | Padding `p-4`, fuente `font-semibold text-slate-800` |

**Props del componente:**

```typescript
interface ReportCardProps {
  report: Report;
  isActive?: boolean;   // Si está seleccionado en el sidebar → highlight
}
```

**Manejo del iframe:**
- `loading="lazy"` para no cargar todos los iframes al mismo tiempo
- `allow="fullscreen"` para permitir pantalla completa en Looker Studio
- Estado de carga propio: mostrar spinner mientras el iframe carga (`onLoad` event)
- Placeholder de error si la URL es inválida o el iframe no carga

---

## Fase 6 — Estados de UI y Detalles Finales

**Objetivo:** Pulir la experiencia de usuario con estados de carga, errores y transiciones.

### Paso 6.1 — Estados de carga del Sidebar

Mientras `GET /reports` carga, mostrar skeleton animado:

```
┌──────────────────────────┐
│  [████████████████] 90%  │  ← Skeleton animado (bg-blue-800 pulse)
│  [████████████████] 70%  │
│  [████████████████] 85%  │
│  [████████████████] 60%  │
└──────────────────────────┘
```

### Paso 6.2 — Estados de carga del Grid

Mientras los reportes cargan, mostrar tarjetas skeleton:

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│░░░░░░│ │░░░░░░│ │░░░░░░│ │░░░░░░│  ← animate-pulse
│░░░░░░│ │░░░░░░│ │░░░░░░│ │░░░░░░│
└──────┘ └──────┘ └──────┘ └──────┘
```

### Paso 6.3 — Estado vacío

Si el usuario no tiene reportes asignados:

```
          📊
   Sin reportes disponibles
   Contacta al administrador para
   solicitar acceso a los reportes.
```

### Paso 6.4 — Título dinámico del Dashboard

El título sobre el grid cambia cuando el usuario hace clic en el sidebar:

```typescript
// En dashboard/page.tsx
<h1 className="text-2xl font-bold text-slate-800 mb-6">
  {selectedReport?.titulo ?? 'Panel de Reportes'}
</h1>
```

Transición suave: `transition-all duration-200` para el cambio de texto.

### Paso 6.5 — Manejo de expiración del token

Escenario: el usuario tiene la sesión abierta 8+ horas y el token expira.

El interceptor de Axios (`src/lib/axios.ts`) captura el error 401 del backend y:
1. Llama a `clearSession()`
2. Redirige a `/login`
3. El middleware de Next.js previene acceso a rutas protegidas

---

## Resumen de Archivos a Crear

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `FRONTEND/.env.local` | Config | `NEXT_PUBLIC_API_URL` |
| `FRONTEND/next.config.ts` | Config | Configuración Next.js |
| `FRONTEND/public/construex-logo.svg` | Asset | Logo del sidebar |
| `src/middleware.ts` | Lógica | Protección de rutas |
| `src/app/layout.tsx` | Layout | Root layout global |
| `src/app/page.tsx` | Página | Redirect a /login |
| `src/app/login/page.tsx` | Página | Página de login |
| `src/app/dashboard/layout.tsx` | Layout | Layout con sidebar y topbar |
| `src/app/dashboard/page.tsx` | Página | Grid de reportes |
| `src/components/auth/LoginForm.tsx` | Componente | Formulario de login |
| `src/components/dashboard/Sidebar.tsx` | Componente | Menú lateral dinámico |
| `src/components/dashboard/TopBar.tsx` | Componente | Barra superior |
| `src/components/dashboard/ReportGrid.tsx` | Componente | CSS Grid de tarjetas |
| `src/components/dashboard/ReportCard.tsx` | Componente | Tarjeta con iframe |
| `src/context/AuthContext.tsx` | Contexto | Estado global de auth |
| `src/hooks/useAuth.ts` | Hook | Acceso al contexto de auth |
| `src/hooks/useReports.ts` | Hook | Fetch de reportes |
| `src/lib/axios.ts` | Lib | Axios con interceptor JWT |
| `src/lib/auth.ts` | Lib | Helpers de cookie/token |
| `src/types/auth.types.ts` | Tipos | Tipos de autenticación |
| `src/types/report.types.ts` | Tipos | Tipo Report del backend |

**Total: 21 archivos nuevos** (sin contar los generados por `create-next-app`)

---

## Flujo Completo de Usuario (End-to-End)

```
1. Usuario visita http://localhost:3001
       │
       ▼
2. middleware.ts: sin token → redirige a /login
       │
       ▼
3. Usuario ve la página de Login (/login)
   [Ingresa admin@admin.com / admin123]
       │
       ▼
4. LoginForm → AuthContext.login()
   → POST http://localhost:3000/auth/login
   → Backend valida, devuelve { access_token, rol_id }
       │
       ▼
5. auth.ts guarda token + rol_id en cookies (8h)
       │
       ▼
6. AuthContext redirige a /dashboard
       │
       ▼
7. middleware.ts: hay token → permite acceso
       │
       ▼
8. dashboard/layout.tsx renderiza Sidebar + TopBar
       │
       ▼
9. useReports hook → GET /reports (con Bearer token)
   → Backend devuelve reportes filtrados por rol_id
       │
       ▼
10. Sidebar muestra los titulos como botones de navegación
    ReportGrid muestra las tarjetas con iframes de Looker Studio
       │
       ▼
11. Usuario hace clic en un sidebar item
    → selectedReport cambia
    → Título dinámico se actualiza
    → Grid resalta la tarjeta activa
       │
       ▼
12. Usuario hace clic en Logout
    → auth.ts elimina cookies
    → middleware.ts redirige a /login
```

---

## Paleta de Colores del Sistema

| Elemento | Color | Tailwind |
|----------|-------|----------|
| Sidebar fondo | `#1E3A5F` | `bg-blue-900` |
| Sidebar item activo | `#2D5282` | `bg-blue-800` |
| Sidebar texto | `#FFFFFF` | `text-white` |
| Página fondo | `#F1F5F9` | `bg-slate-100` |
| Tarjeta fondo | `#FFFFFF` | `bg-white` |
| Título principal | `#1E293B` | `text-slate-800` |
| Texto secundario | `#64748B` | `text-slate-500` |
| Acento primario | `#3B82F6` | `text-blue-500` |
| Error | `#EF4444` | `text-red-500` |
| TopBar fondo | `#FFFFFF` | `bg-white` |
| TopBar borde | `#E2E8F0` | `border-slate-200` |

---

## Orden de Ejecución Recomendado

```
Fase 1 (Inicialización)
  → Fase 2 (Autenticación: tipos, lib, contexto, middleware)
    → Fase 3 (Página de Login: diseño + lógica)
      → Fase 4 (Layout Dashboard: sidebar + topbar)
        → Fase 5 (Grid de Reportes: hook + grid + cards)
          → Fase 6 (Estados de UI: loading, error, empty)
```

Cada fase debe compilar y ser probada visualmente antes de avanzar a la siguiente.

---

## Comando de Inicio

Una vez implementado, el frontend se ejecuta en:

```bash
cd FRONTEND
npm run dev          # → http://localhost:3000 (Next.js)
```

> Si el backend ya ocupa el puerto 3000, configurar el frontend en el puerto 3001:
> ```bash
> npm run dev -- -p 3001
> ```
> Y actualizar `.env.local`:
> ```
> NEXT_PUBLIC_API_URL=http://localhost:3000
> ```

---

*Documento generado el 2026-03-26. Pendiente de aprobación antes de inicializar el proyecto.*
