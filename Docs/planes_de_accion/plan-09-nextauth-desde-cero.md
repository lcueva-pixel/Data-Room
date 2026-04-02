# Plan 09: Migracion a NextAuth.js desde Cero

**Alcance:** Reemplazar sistema de autenticacion custom por NextAuth.js como unica fuente de verdad  
**Dependencias a instalar:** `next-auth` (frontend)  
**Archivos afectados:** ~15 (2 eliminados, 4 creados, 9 modificados)

---

## Nota Importante: proxy.ts en Next.js 16

En Next.js 16, la convencion `middleware.ts` fue **deprecada y renombrada a `proxy.ts`**. El archivo `src/proxy.ts` que existe en el proyecto **ES el middleware real** de Next.js y esta correctamente conectado. No debe eliminarse — debe **modificarse** para integrar NextAuth.

Referencia: [Next.js 16 Proxy API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

```
middleware.ts (deprecado) --> proxy.ts (Next.js 16+)
```

La funcion exportada debe llamarse `proxy` (no `middleware`), y el archivo debe estar en `src/proxy.ts` o en la raiz del proyecto.

---

## Estado Actual: Mapa de Deuda Tecnica

### Archivos del sistema de autenticacion custom actual

| # | Archivo | Funcion | Sera... |
|:-:|---------|---------|---------|
| 1 | `src/lib/auth.ts` | Manejo de cookies con js-cookie (saveSession, getToken, getRolId, clearSession) | **Eliminado** |
| 2 | `src/context/AuthContext.tsx` | Provider React con login(), logout(), session state | **Eliminado** |
| 3 | `src/proxy.ts` | Proxy de Next.js 16 (middleware) — proteccion de rutas con cookies manuales | **Reescrito** (integrar NextAuth) |
| 4 | `src/types/auth.types.ts` | Tipos LoginCredentials, LoginResponse, SessionUser | **Reescrito** |
| 5 | `src/lib/axios.ts` | Interceptor que lee cookie con getToken() y agrega Bearer header | **Reescrito** |
| 6 | `src/hooks/useReportTracking.ts` | Usa getToken() directo para fetch con Authorization header | **Modificado** |

### Archivos que consumen el sistema actual (deben adaptarse)

| # | Archivo | Que usa | Import |
|:-:|---------|---------|--------|
| 1 | `src/app/login/page.tsx` | `AuthProvider` | `@/context/AuthContext` |
| 2 | `src/app/dashboard/layout.tsx` | `AuthProvider` | `@/context/AuthContext` |
| 3 | `src/app/dashboard/page.tsx` | `useAuth()`, `getRolId()` | `@/context/AuthContext`, `@/lib/auth` |
| 4 | `src/app/dashboard/overview/page.tsx` | `useAuth()`, `getRolId()` | `@/context/AuthContext`, `@/lib/auth` |
| 5 | `src/app/dashboard/admin/layout.tsx` | `useAuth()`, `getRolId()` | `@/context/AuthContext`, `@/lib/auth` |
| 6 | `src/components/auth/LoginForm.tsx` | `useAuth()` | `@/context/AuthContext` |
| 7 | `src/components/Providers.tsx` | No usa auth (solo QueryClient, Theme, Toaster) | Agregar SessionProvider |

### Dependencias a eliminar despues de la migracion

| Dependencia | Tipo | Razon |
|-------------|------|-------|
| `js-cookie` | dependencies | Reemplazado por cookies encriptadas de NextAuth |
| `@types/js-cookie` | devDependencies | Ya no necesario |

---

## FASE 1: Escaneo y Limpieza (Depuracion de Deuda Tecnica)

### Objetivo
Identificar y planificar la eliminacion del sistema custom. La eliminacion real se ejecuta al final (ver Orden de Ejecucion).

### 1.1 Archivos a Eliminar Completamente

| # | Archivo | Lineas | Razon de eliminacion |
|:-:|---------|:------:|---------------------|
| 1 | `src/lib/auth.ts` | 31 | Reemplazado por la sesion de NextAuth. Ya no se usara js-cookie |
| 2 | `src/context/AuthContext.tsx` | 60 | Reemplazado por `SessionProvider` de NextAuth y el hook `useSession()` |

### 1.2 Archivo a Reescribir (NO eliminar)

| # | Archivo | Razon |
|:-:|---------|-------|
| 1 | `src/proxy.ts` | Es el **middleware oficial de Next.js 16**. Se reescribe para usar la sesion encriptada de NextAuth en lugar de cookies manuales |

### 1.3 Interceptores a Limpiar en `src/lib/axios.ts`

**Estado actual (32 lineas):**
- Linea 2: `import { getToken, clearSession } from './auth';` — Sera eliminado
- Lineas 11-17: Interceptor de request que lee `getToken()` y agrega `Authorization: Bearer` — Sera reescrito para obtener el token desde la sesion de NextAuth
- Lineas 19-30: Interceptor de response que llama `clearSession()` en 401 — Sera simplificado

### 1.4 Uso directo de `getToken()` en `src/hooks/useReportTracking.ts`

**Estado actual (linea 4):** `import { getToken } from '@/lib/auth';`
**Linea 19:** `const token = getToken();`
**Linea 25:** `...(token ? { Authorization: \`Bearer ${token}\` } : {}),`

Este hook usa `fetch()` directo (no axios) con el token manual. Debe migrarse para obtener el token desde NextAuth.

### 1.5 Dependencias a Desinstalar (tras completar migracion)

```bash
cd frontend
npm uninstall js-cookie @types/js-cookie
```

---

## FASE 2: Alineacion del Backend (NestJS)

### Objetivo
Asegurar que el endpoint de login retorne toda la informacion necesaria para que NextAuth construya la sesion.

### 2.1 Revisar endpoint POST /api/auth/login

**Estado actual del controller (`auth.controller.ts`):**
```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Req() req: any) {
  const userAgent = req.headers['user-agent'] || '';
  const user = await this.authService.validateUser(
    loginDto.email, loginDto.password, userAgent,
  );
  return this.authService.login(user);
}
```

**Respuesta actual del servicio (`auth.service.ts` metodo `login`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "rol_id": 1
}
```

**Cambio necesario:** Agregar datos del usuario a la respuesta para que NextAuth los tenga disponibles en los callbacks. El endpoint debe retornar:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@empresa.com",
    "nombreCompleto": "Admin Principal",
    "rol_id": 1
  }
}
```

### Archivo a modificar: `BACKEND/src/auth/auth.service.ts`

**Cambio en metodo `login()` (actualmente lineas 38-43):**

```typescript
// ANTES:
async login(user: { id: number; rolId: number }) {
  const payload = { sub: user.id, rol_id: user.rolId };
  return {
    access_token: this.jwtService.sign(payload),
    rol_id: user.rolId,
  };
}

// DESPUES:
async login(user: { id: number; rolId: number; email: string; nombreCompleto: string }) {
  const payload = { sub: user.id, rol_id: user.rolId };
  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      rol_id: user.rolId,
    },
  };
}
```

**Nota:** El metodo `validateUser()` ya retorna el objeto `user` completo de Prisma (incluye `id`, `email`, `nombreCompleto`, `rolId`), por lo que el controller no necesita cambios.

### 2.2 Verificar que el backend NO requiere cambios en guards

Los guards (`JwtAuthGuard`, `AdminGuard`) y la estrategia JWT (`jwt.strategy.ts`) **no necesitan cambios**. Siguen validando el Bearer token que ahora vendra desde NextAuth en lugar de js-cookie.

---

## FASE 3: Configuracion Core de NextAuth (Next.js App Router)

### Objetivo
Instalar NextAuth.js v5 (Auth.js) y configurar el CredentialsProvider para autenticar contra NestJS.

### 3.1 Instalar NextAuth

```bash
cd frontend
npm install next-auth@beta
```

**Nota:** NextAuth v5 (Auth.js) es la version compatible con Next.js App Router. Se instala como `next-auth@beta` ya que v5 es la version recomendada para App Router.

### 3.2 Variable de entorno

**Archivo:** `frontend/.env`

**Agregar:**
```env
NEXTAUTH_SECRET=<generar con: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

`NEXTAUTH_SECRET` se usa para encriptar el JWT de la sesion de NextAuth (diferente al JWT del backend NestJS).

### 3.3 Crear `frontend/src/auth.config.ts`

**Archivo nuevo.** Configuracion de autorizacion que se usa en el proxy (middleware Edge).

```typescript
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname === '/login';
      const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

      if (isOnDashboard) {
        if (!isLoggedIn) return false; // Redirige a signIn page (/login)
        if (isAdminRoute && auth?.user?.rol_id !== 1) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard/overview', nextUrl));
      }

      return true;
    },
  },
  providers: [], // Se configuran en auth.ts (requieren Node.js runtime)
};
```

**Proposito:** Separar la logica de autorizacion (que corre en proxy/Edge) de los providers (que necesitan Node.js runtime completo para hacer fetch al backend).

### 3.4 Crear `frontend/src/auth.ts`

**Archivo nuevo.** Configuracion completa con providers y callbacks.

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

export const {
  handlers,   // GET, POST handlers para la API route
  auth,       // Funcion para leer sesion en Server Components
  signIn,     // Funcion server-side para login
  signOut,    // Funcion server-side para logout
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          },
        );

        if (!res.ok) return null;

        const data = await res.json();
        // data = { access_token: "...", user: { id, email, nombreCompleto, rol_id } }

        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.user.nombreCompleto,
          rol_id: data.user.rol_id,
          backendToken: data.access_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol_id = user.rol_id;
        token.backendToken = user.backendToken;
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.rol_id = token.rol_id as number;
        session.user.id = token.userId as string;
      }
      session.backendToken = token.backendToken as string;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
```

**Flujo del CredentialsProvider:**
```
1. Usuario envia email/password desde LoginForm
2. NextAuth llama authorize() en el servidor (Node.js runtime)
3. authorize() hace fetch a POST /api/auth/login de NestJS
4. NestJS valida credenciales, retorna { access_token, user }
5. authorize() retorna el objeto user con backendToken incluido
6. NextAuth encripta todo en un JWT firmado con NEXTAUTH_SECRET
7. NextAuth establece cookie de sesion (httpOnly, secure, sameSite)
```

### 3.5 Crear `frontend/src/app/api/auth/[...nextauth]/route.ts`

**Archivo nuevo.** API route handler para NextAuth.

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

Expone los endpoints internos de NextAuth:
- `GET /api/auth/session` — Retorna la sesion actual
- `POST /api/auth/signin/credentials` — Procesa el login
- `POST /api/auth/signout` — Procesa el logout

### 3.6 Extender tipos de TypeScript para NextAuth

**Archivo a crear:** `frontend/src/types/next-auth.d.ts`

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface User {
    rol_id: number;
    backendToken: string;
  }

  interface Session {
    backendToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      rol_id: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol_id: number;
    backendToken: string;
    userId: string;
  }
}
```

---

## FASE 4: Proteccion de Rutas (Proxy y Server/Client Components)

### Objetivo
Reescribir `proxy.ts` para usar la sesion de NextAuth en lugar de cookies manuales.

### 4.1 Reescribir `frontend/src/proxy.ts`

**Estado actual (33 lineas):**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;  // Cookie manual
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';
  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (token && isAdminRoute) {
    const rolId = request.cookies.get('rol_id')?.value;  // Cookie manual spoofeable
    if (rolId !== '1') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
```

**Problemas del estado actual:**
1. Lee `access_token` de una cookie JS plana (no encriptada, accesible por XSS)
2. Lee `rol_id` de otra cookie JS plana (spoofeable: un usuario puede cambiar `rol_id` a `1` en DevTools)
3. No valida la firma ni la expiracion del token

**Estado nuevo — integrado con NextAuth:**

```typescript
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
```

**Explicacion:**
- `NextAuth(authConfig).auth` retorna una funcion proxy/middleware compatible con Next.js 16
- La logica de autorizacion esta definida en `authConfig.callbacks.authorized()` (creada en Fase 3.3)
- NextAuth lee su propia cookie de sesion (encriptada con `NEXTAUTH_SECRET`, httpOnly, no spoofeable)
- El `rol_id` se valida desde el JWT encriptado, no desde una cookie plana

**Ventajas sobre el sistema actual:**
| Aspecto | Antes (cookies manuales) | Despues (NextAuth) |
|---------|--------------------------|-------------------|
| Cookie del token | `access_token` plana, legible por JS | Cookie encriptada httpOnly de NextAuth |
| Cookie del rol | `rol_id` plana, modificable en DevTools | `rol_id` dentro del JWT firmado, no modificable |
| Validacion | Solo verifica existencia de cookie | Verifica firma + expiracion + datos |
| XSS | Vulnerable (JS puede leer cookie) | Protegido (httpOnly) |

### 4.2 Leer sesion en Server Components

**Patron para Server Components (paginas, layouts):**

```typescript
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();
  // session.user.rol_id, session.user.name, session.user.email
  // session.backendToken (para SSR API calls)
}
```

`auth()` lee la sesion desde las cookies del request en el servidor. No necesita Context ni hooks.

### 4.3 Leer sesion en Client Components

Envolver la app con `SessionProvider` de NextAuth en `Providers.tsx`:

```typescript
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider ...>
        <QueryClientProvider ...>
          {children}
          <Toaster ... />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
```

En cualquier Client Component:

```typescript
'use client';
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  // status: 'loading' | 'authenticated' | 'unauthenticated'
  // session.user.rol_id, session.user.name, etc.
}
```

### 4.4 Adaptar layouts y paginas

Cada archivo que usa `useAuth()` o `getRolId()` debe migrarse a `useSession()`:

**Ejemplo — `src/app/dashboard/admin/layout.tsx`:**

```typescript
// ANTES:
import { useAuth } from '@/context/AuthContext';
import { getRolId } from '@/lib/auth';
const { logout } = useAuth();
const rolId = getRolId();

// DESPUES:
import { useSession, signOut } from 'next-auth/react';
const { data: session } = useSession();
const rolId = session?.user?.rol_id ?? null;
const handleLogout = () => signOut({ callbackUrl: '/login' });
```

**Archivos a modificar con este patron:**
| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `src/app/login/page.tsx` | Eliminar `<AuthProvider>` wrapper (SessionProvider esta en Providers.tsx) |
| 2 | `src/app/dashboard/layout.tsx` | Eliminar `<AuthProvider>` wrapper |
| 3 | `src/app/dashboard/page.tsx` | `useSession()` en vez de `useAuth()` + `getRolId()` |
| 4 | `src/app/dashboard/overview/page.tsx` | `useSession()` en vez de `useAuth()` + `getRolId()` |
| 5 | `src/app/dashboard/admin/layout.tsx` | `useSession()` + `signOut()` en vez de `useAuth()` + `getRolId()` |
| 6 | `src/components/auth/LoginForm.tsx` | `signIn('credentials', ...)` de NextAuth en vez de `useAuth().login()` |

---

## FASE 5: Interceptor de Peticiones Seguras (Frontend -> Backend)

### Objetivo
Reescribir el cliente HTTP para obtener el `backendToken` desde NextAuth.

### 5.1 Reescribir `frontend/src/lib/axios.ts`

```typescript
import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

| Aspecto | Antes | Despues |
|---------|-------|---------|
| Fuente del token | `Cookies.get('access_token')` | `getSession().backendToken` |
| Import | `import { getToken, clearSession } from './auth'` | `import { getSession } from 'next-auth/react'` |
| Logout en 401 | `clearSession()` + redirect | Solo redirect (NextAuth maneja sesion) |

### 5.2 Modificar `frontend/src/hooks/useReportTracking.ts`

```typescript
// ANTES:
import { getToken } from '@/lib/auth';
const token = getToken();

// DESPUES:
import { getSession } from 'next-auth/react';
const session = await getSession();
const token = session?.backendToken;
```

### 5.3 Para Server-Side API Calls (SSR)

```typescript
import { auth } from '@/auth';

async function fetchDataFromBackend() {
  const session = await auth();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${session?.backendToken}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}
```

---

## Resumen: Archivos a Modificar por Fase

### Fase 1: Escaneo y Limpieza (se ejecuta AL FINAL)

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `src/lib/auth.ts` | **Eliminar** |
| 2 | `src/context/AuthContext.tsx` | **Eliminar** |

### Fase 2: Alineacion del Backend

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `BACKEND/src/auth/auth.service.ts` | Modificar metodo `login()` para incluir datos del usuario |

### Fase 3: Configuracion Core de NextAuth

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/.env` | Agregar NEXTAUTH_SECRET y NEXTAUTH_URL |
| 2 | `frontend/src/auth.config.ts` | **Crear** (config de autorizacion para proxy/Edge) |
| 3 | `frontend/src/auth.ts` | **Crear** (config completa con providers y callbacks) |
| 4 | `frontend/src/app/api/auth/[...nextauth]/route.ts` | **Crear** (API route handler) |
| 5 | `frontend/src/types/next-auth.d.ts` | **Crear** (extension de tipos TS) |
| 6 | `frontend/src/types/auth.types.ts` | **Reescribir** (adaptar a NextAuth) |

### Fase 4: Proteccion de Rutas

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/src/proxy.ts` | **Reescribir** (integrar NextAuth, reemplazar cookies manuales) |
| 2 | `frontend/src/components/Providers.tsx` | Modificar (agregar SessionProvider) |
| 3 | `frontend/src/app/login/page.tsx` | Modificar (eliminar AuthProvider wrapper) |
| 4 | `frontend/src/app/dashboard/layout.tsx` | Modificar (eliminar AuthProvider) |
| 5 | `frontend/src/app/dashboard/page.tsx` | Modificar (useSession) |
| 6 | `frontend/src/app/dashboard/overview/page.tsx` | Modificar (useSession) |
| 7 | `frontend/src/app/dashboard/admin/layout.tsx` | Modificar (useSession + signOut) |
| 8 | `frontend/src/components/auth/LoginForm.tsx` | Modificar (signIn de NextAuth) |

### Fase 5: Interceptor Seguro

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/src/lib/axios.ts` | **Reescribir** (getSession de NextAuth) |
| 2 | `frontend/src/hooks/useReportTracking.ts` | Modificar (getSession) |

### Limpieza Final

| # | Accion |
|:-:|--------|
| 1 | `npm uninstall js-cookie @types/js-cookie` |
| 2 | Verificar que no queden imports huerfanos de `@/lib/auth` o `@/context/AuthContext` |

---

## Orden de Ejecucion Recomendado

```
Fase 2 (Backend)        -> Primero: asegurar respuesta correcta del login
    |
Fase 3 (NextAuth Core)  -> Instalar, configurar providers, callbacks, API route
    |
Fase 4 (Proxy + Pages)  -> Reescribir proxy.ts, adaptar Providers, adaptar layouts/pages
    |
Fase 5 (Interceptor)    -> Reescribir axios.ts y useReportTracking.ts
    |
Fase 1 (Limpieza)       -> ULTIMO: eliminar archivos viejos y desinstalar js-cookie
```

**Nota critica:** La Fase 1 (eliminacion) se ejecuta **al final**, no al inicio. Primero se construye el sistema nuevo sobre el existente, se verifica que funciona, y solo entonces se eliminan los archivos antiguos. Esto permite rollback si algo falla.

---

## Diagrama de Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUJO CON NEXTAUTH                       │
└─────────────────────────────────────────────────────────────┘

LOGIN:
  LoginForm ──signIn('credentials', {email, pass})──> NextAuth API Route
       NextAuth ──fetch POST /api/auth/login──> NestJS Backend
       NestJS ──{ access_token, user }──> NextAuth
       NextAuth encripta todo en JWT ──Set-Cookie (httpOnly)──> Browser

PETICION AUTENTICADA:
  Client Component ──useSession()──> session.backendToken
       Axios interceptor ──Authorization: Bearer {backendToken}──> NestJS
       NestJS ──JwtAuthGuard valida──> Response

PROTECCION DE RUTAS:
  Browser request /dashboard/admin/users
       ──> proxy.ts (Next.js 16 Proxy = middleware)
       ──> NextAuth auth() lee cookie encriptada (httpOnly)
       ──> authConfig.authorized() verifica sesion + rol (datos firmados)
       ──> Si ok: NextResponse.next()
       ──> Si no: redirect /login

LOGOUT:
  signOut() de NextAuth ──> Limpia cookie de sesion ──> redirect /login
```
