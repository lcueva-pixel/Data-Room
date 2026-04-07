# Plan 10: Correccion del Bug Critico — Roles y Acceso al Panel de Administracion

**Alcance:** Diagnosticar y corregir el bug que impide al Administrador ver las secciones "Gestion de Reportes", "Usuarios" y "Auditoria" en el Sidebar  
**Dependencias a instalar:** Ninguna  
**Archivos afectados:** ~6 (0 creados, 6 revisados/modificados)

---

## Descripcion del Problema

El menu lateral ya no permite acceder a las rutas de administracion (`/dashboard/admin/*`). El sistema detecta intermitentemente al Administrador como un usuario normal (`rol_id !== 1`), lo que causa:

1. **Sidebar:** La seccion "Administracion" no se renderiza (linea 245 de `Sidebar.tsx`: `isAdmin` es `false`).
2. **Middleware/Proxy:** Las rutas `/dashboard/admin/*` redireccionan al usuario a `/dashboard` porque `auth?.user?.rol_id` no es `1`.
3. **Backend:** Las peticiones a endpoints protegidos con `AdminGuard` devuelven `403 Forbidden`.

**Hipotesis principal:** El `rol_id` se pierde o se transforma incorrectamente en algun punto de la cadena: Backend JWT -> NextAuth callbacks -> Session -> Sidebar/Proxy.

---

## Cadena Completa del Rol (Flujo a Auditar)

```
[1] NestJS: auth.service.ts login()
       payload = { sub: user.id, rol_id: user.rolId }
              |
              v
[2] NestJS: JWT firmado con rol_id como number
              |
              v
[3] NextAuth: auth.ts authorize()
       data.user.rol_id  -->  retorna { rol_id, backendToken }
              |
              v
[4] NextAuth: auth.ts jwt() callback
       token.rol_id = user.rol_id
              |
              v
[5] NextAuth: auth.ts session() callback
       session.user.rol_id = token.rol_id
              |
              v
[6] NextAuth: auth.config.ts authorized() callback
       auth?.user?.rol_id !== 1  -->  redirige si no es admin
              |
              v
[7] Frontend: page.tsx -> session?.user?.rol_id -> Sidebar rolId prop
       rolId === 1 ? mostrar admin : ocultar
```

---

## Fase 1: Diagnostico Backend (NestJS)

### Tarea 1.1 — Verificar el JWT generado por NestJS

| Archivo | Ruta |
|---------|------|
| `auth.service.ts` | `BACKEND/src/auth/auth.service.ts` (lineas 59-70) |

**Que verificar:**
- Que `user.rolId` sea de tipo `number` y valor `1` para el admin.
- Que el payload del JWT sea `{ sub: user.id, rol_id: user.rolId }` (no `"1"` como string).

**Accion:** Agregar un log temporal con `console.log('JWT payload:', payload)` antes de `this.jwtService.sign(payload)` para confirmar el tipo y valor.

### Tarea 1.2 — Verificar la estrategia JWT

| Archivo | Ruta |
|---------|------|
| `jwt.strategy.ts` | `BACKEND/src/auth/jwt.strategy.ts` (lineas 20-22) |

**Que verificar:**
- Que `validate()` retorna `{ userId: payload.sub, rol_id: payload.rol_id }`.
- Que `payload.rol_id` no es `undefined` ni se convierte a string.

**Accion:** Log temporal en `validate()` para inspeccionar el payload decodificado.

### Tarea 1.3 — Verificar el AdminGuard

| Archivo | Ruta |
|---------|------|
| `admin.guard.ts` | `BACKEND/src/auth/admin.guard.ts` (lineas 11-15) |

**Que verificar:**
- Que la comparacion sea `===` estricta con `1` (number).
- Que `request.user` llega correctamente poblado despues de `JwtAuthGuard`.

**Posible bug:** Si `rol_id` llega como `"1"` (string), la comparacion estricta `=== 1` fallaria.

---

## Fase 2: Diagnostico Frontend (NextAuth Callbacks)

### Tarea 2.1 — Verificar el callback `authorize()`

| Archivo | Ruta |
|---------|------|
| `auth.ts` | `frontend/src/auth.ts` (lineas 19-43) |

**Que verificar:**
- La respuesta de `/auth/login` (`data.user.rol_id`) es un `number`.
- El objeto retornado incluye `rol_id` correctamente.

**Posible bug:** Si el backend devuelve `rol_id` dentro de un objeto anidado o con nombre diferente al esperado, se pierde.

**Accion de debugging:**
```typescript
// Temporal — agregar en authorize() despues de const data = await res.json()
console.log('[AUTH] login response:', JSON.stringify(data, null, 2));
console.log('[AUTH] rol_id type:', typeof data.user.rol_id, 'value:', data.user.rol_id);
```

### Tarea 2.2 — Verificar el callback `jwt()`

| Archivo | Ruta |
|---------|------|
| `auth.ts` | `frontend/src/auth.ts` (lineas 46-54) |

**Riesgo critico:** El bloque `if (user)` solo se ejecuta en el **primer login**. En peticiones subsiguientes, `user` es `undefined` y se reutiliza el `token` existente.

**Que verificar:**
- Que `token.rol_id` persiste correctamente entre peticiones (no se sobreescribe a `undefined`).
- Que no hay logica que resetee `token.rol_id` fuera del bloque `if (user)`.

**Posible bug:** Si NextAuth serializa/deserializa el token y `rol_id` no esta en la interfaz tipada de JWT, podria perderse silenciosamente.

### Tarea 2.3 — Verificar el callback `session()`

| Archivo | Ruta |
|---------|------|
| `auth.ts` | `frontend/src/auth.ts` (lineas 55-62) |

**Que verificar:**
- Que `token.rol_id` no es `undefined` cuando se invoca este callback.
- Que `session.user.rol_id` es de tipo `number` (no `string` ni `undefined`).

**Accion de debugging:**
```typescript
async session({ session, token }) {
  console.log('[SESSION] token.rol_id:', token.rol_id, typeof token.rol_id);
  // ... resto del callback
}
```

### Tarea 2.4 — Verificar el callback `authorized()` (Proxy/Middleware)

| Archivo | Ruta |
|---------|------|
| `auth.config.ts` | `frontend/src/auth.config.ts` (lineas 8-27) |

**Riesgo critico (linea 16):**
```typescript
if (isAdminRoute && (auth?.user as any)?.rol_id !== 1)
```

**Posibles bugs:**
1. Si `rol_id` es `"1"` (string), la comparacion `!== 1` es `true` y redirige incorrectamente.
2. Si el callback `authorized()` se ejecuta **antes** de que los callbacks `jwt()` y `session()` propaguen el `rol_id` (orden de ejecucion de NextAuth).
3. En NextAuth v5, el objeto `auth` dentro de `authorized` puede no incluir campos custom que no estan en la interfaz `Session`.

---

## Fase 3: Diagnostico de Tipos TypeScript

### Tarea 3.1 — Verificar las extensiones de tipo de NextAuth

| Archivo | Ruta |
|---------|------|
| `next-auth.d.ts` | `frontend/src/types/next-auth.d.ts` |

**Que verificar:**
- Que `Session.user` extiende con `rol_id: number`.
- Que `JWT` extiende con `rol_id: number`.
- Que `User` extiende con `rol_id: number`.

**Posible bug:** Si solo se extiende `Session` pero no `JWT` ni `User`, TypeScript compila pero NextAuth puede no serializar el campo. La declaracion debe cubrir las tres interfaces:

```typescript
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      rol_id: number;
      email: string;
      name: string;
    };
    backendToken: string;
  }
  interface User {
    rol_id: number;
    backendToken: string;
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

## Fase 4: Diagnostico del Sidebar

### Tarea 4.1 — Verificar la prop `rolId` en el Sidebar

| Archivo | Ruta |
|---------|------|
| `page.tsx` | `frontend/src/app/dashboard/page.tsx` (linea 20) |
| `Sidebar.tsx` | `frontend/src/components/dashboard/Sidebar.tsx` (linea 118) |

**Flujo actual:**
```typescript
// page.tsx
const { data: session } = useSession();
const rolId = session?.user?.rol_id ?? null;  // <-- Si rol_id es undefined, cae a null

// Sidebar.tsx
const isAdmin = rolId === 1;  // <-- null === 1 es false
```

**Que verificar:**
- Que `useSession()` devuelve la sesion completa con `rol_id`.
- Que no hay un estado de carga donde `session` es `undefined` temporalmente y el Sidebar se renderiza con `rolId = null`.

**Posible bug de timing:** En el primer render, `useSession()` puede devolver `status: "loading"` y `session: null`. Si el Sidebar se monta en ese momento, `rolId` sera `null` y la seccion admin no aparecera. Si luego no se re-renderiza al obtener la sesion real, el bug persiste.

---

## Fase 5: Plan de Correccion

### Fix 5.1 — Asegurar tipos correctos en toda la cadena

| # | Archivo | Correccion |
|:-:|---------|------------|
| 1 | `next-auth.d.ts` | Extender `User`, `Session` **y** `JWT` con `rol_id: number` |
| 2 | `auth.ts` (jwt callback) | Castear explicitamente: `token.rol_id = Number((user as any).rol_id)` |
| 3 | `auth.config.ts` (authorized) | Castear: `Number((auth?.user as any)?.rol_id) !== 1` |

### Fix 5.2 — Proteger contra estado de carga

| # | Archivo | Correccion |
|:-:|---------|------------|
| 1 | `page.tsx` | No renderizar Sidebar hasta que `status !== 'loading'` |
| 2 | `Sidebar.tsx` | Opcional: mostrar skeleton del bloque admin si `rolId === null` |

### Fix 5.3 — Logs de auditoria para depuracion futura

| # | Archivo | Correccion |
|:-:|---------|------------|
| 1 | `auth.ts` | Agregar logs en `authorize()`, `jwt()` y `session()` que se activen con `DEBUG=auth` |

---

## Resumen de Archivos Afectados

| # | Archivo | Tipo | Accion |
|:-:|---------|------|--------|
| 1 | `BACKEND/src/auth/auth.service.ts` | Backend | Verificar tipo de `rolId` en payload JWT |
| 2 | `BACKEND/src/auth/jwt.strategy.ts` | Backend | Verificar `validate()` preserva tipo |
| 3 | `frontend/src/types/next-auth.d.ts` | Tipos | Corregir/completar declaraciones |
| 4 | `frontend/src/auth.ts` | Auth | Castear `rol_id` a `number` en callbacks |
| 5 | `frontend/src/auth.config.ts` | Middleware | Castear `rol_id` en `authorized()` |
| 6 | `frontend/src/app/dashboard/page.tsx` | Frontend | Manejar estado de carga de sesion |

---

## Checklist de Verificacion Post-Fix

- [ ] Login como admin -> `session.user.rol_id` es `1` (number) en consola del navegador
- [ ] Sidebar muestra seccion "Administracion" con los 3 enlaces
- [ ] Navegar a `/dashboard/admin/reports` no redirige a `/dashboard`
- [ ] Navegar a `/dashboard/admin/users` no redirige
- [ ] Navegar a `/dashboard/admin/audit` no redirige
- [ ] Login como usuario normal -> seccion "Administracion" NO aparece
- [ ] Usuario normal navega a `/dashboard/admin/reports` -> redirigido a `/dashboard`
- [ ] Refrescar pagina (F5) en ruta admin -> sesion persiste, no redirige
- [ ] Cerrar y abrir navegador -> sesion persiste si no expiro
- [ ] Backend endpoint `/reports/admin` devuelve `200` para admin y `403` para usuario normal
