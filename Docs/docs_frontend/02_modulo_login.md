# Modulo: Login y Autenticacion

---

## Archivos Involucrados

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| Login Page | `src/app/login/page.tsx` | Pagina de login, monta AuthProvider y LoginForm |
| LoginForm | `src/components/auth/LoginForm.tsx` | Formulario visual de inicio de sesion |
| AuthContext | `src/context/AuthContext.tsx` | Provider global de autenticacion |
| auth.ts | `src/lib/auth.ts` | Utilidades de sesion con cookies |
| axios.ts | `src/lib/axios.ts` | Cliente HTTP con interceptores |
| proxy.ts | `src/proxy.ts` | Middleware de proteccion de rutas |
| auth.types.ts | `src/types/auth.types.ts` | Tipos TypeScript de autenticacion |

---

## Flujo de Autenticacion

```
[Usuario] --> [LoginForm] --> [AuthContext.login()] --> [POST /api/auth/login]
                                     |
                                     v
                              [Respuesta JWT]
                                     |
                                     v
                          [saveSession() en cookies]
                                     |
                                     v
                          [Redirect a /dashboard/overview]
```

### Paso a Paso

1. **Ingreso de credenciales:** El usuario escribe email y password en `LoginForm.tsx`.
2. **Envio:** Al hacer submit, se llama `login({ email, password })` del `AuthContext`.
3. **Peticion HTTP:** `AuthContext.login()` envia `POST /api/auth/login` via Axios.
4. **Respuesta del backend:** `{ access_token: "jwt...", rol_id: 1 }`.
5. **Almacenamiento:** `saveSession()` guarda `access_token` y `rol_id` en cookies con expiracion de 8 horas (`1/3` de dia).
6. **Estado global:** Se actualiza `session` en el context.
7. **Redireccion:** `router.push('/dashboard/overview')`.

---

## LoginForm - Detalle del Componente

**Archivo:** `src/components/auth/LoginForm.tsx` (167 lineas)

### Elementos Visuales
- Logo de la empresa (`/cex_logo.png`)
- Titulo "Data Room" con subtitulo "Portal de Reportes"
- Campo de email con placeholder "admin@admin.com"
- Campo de password con toggle de visibilidad (iconos Eye/EyeOff)
- Boton "Iniciar sesion" con icono LogIn
- Spinner animado durante carga
- Banner de error en rojo cuando falla la autenticacion
- Footer con copyright

### Estados
| Estado | Tipo | Proposito |
|--------|------|-----------|
| `email` | string | Valor del campo email |
| `password` | string | Valor del campo password |
| `showPassword` | boolean | Toggle de visibilidad del password |
| `isLoading` | boolean | Indica peticion en curso |
| `error` | string \| null | Mensaje de error de autenticacion |

### Manejo de Errores
- Si el backend responde con un mensaje en `response.data.message`, se muestra tal cual.
- Si no hay mensaje especifico, se muestra: "Credenciales incorrectas. Intenta de nuevo."

---

## Gestion de Sesion (auth.ts)

**Archivo:** `src/lib/auth.ts` (32 lineas)

Utiliza la libreria `js-cookie` para almacenar la sesion en cookies del navegador.

### Constantes
| Constante | Valor | Descripcion |
|-----------|-------|-------------|
| `TOKEN_KEY` | `'access_token'` | Nombre de la cookie del JWT |
| `ROL_KEY` | `'rol_id'` | Nombre de la cookie del rol |
| `EXPIRY_DAYS` | `1/3` (~8 horas) | Tiempo de vida de las cookies |

### Funciones Exportadas
| Funcion | Descripcion |
|---------|-------------|
| `saveSession(data)` | Guarda `access_token` y `rol_id` en cookies con expiracion de 8h |
| `getToken()` | Retorna el access_token o `undefined` |
| `getRolId()` | Retorna el rol_id como numero o `null` |
| `clearSession()` | Elimina ambas cookies |
| `isAuthenticated()` | Retorna `true` si existe el token |

---

## AuthContext - Provider Global

**Archivo:** `src/context/AuthContext.tsx` (61 lineas)

### Valores del Context
| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `session` | `SessionUser \| null` | Datos de sesion activa |
| `isLoading` | `boolean` | `true` mientras se restaura sesion desde cookies |
| `login` | `(credentials) => Promise<void>` | Autentica y redirige |
| `logout` | `() => void` | Limpia sesion y redirige a login |

### Restauracion de Sesion
Al montar el `AuthProvider`, se verifica si existen cookies `access_token` y `rol_id`. Si ambas existen, se restaura la sesion sin necesidad de re-autenticar. Esto permite que el usuario mantenga su sesion al refrescar la pagina.

---

## Middleware de Proteccion (proxy.ts)

**Archivo:** `src/proxy.ts` (34 lineas)

Funciona como middleware de Next.js (server-side) que intercepta peticiones a rutas protegidas.

### Reglas de Proteccion

| Condicion | Accion |
|-----------|--------|
| Sin token + cualquier ruta (excepto /login) | Redirige a `/login` |
| Con token + en `/login` | Redirige a `/dashboard` |
| Con token + ruta `/dashboard/admin/*` + `rol_id != '1'` | Redirige a `/dashboard` |
| Cualquier otro caso | Permite el acceso (`NextResponse.next()`) |

### Rutas Interceptadas
```typescript
matcher: ['/login', '/dashboard/:path*']
```

---

## Interceptor de Respuesta (Axios)

**Archivo:** `src/lib/axios.ts` (lineas 19-30)

Cuando cualquier peticion HTTP recibe un error **401 Unauthorized**:
1. Se ejecuta `clearSession()` (elimina cookies)
2. Se redirige a `/login` via `window.location.href`

Esto asegura que si el JWT expira durante la sesion, el usuario es redirigido automaticamente al login.

---

## Tipos de Datos

**Archivo:** `src/types/auth.types.ts`

```typescript
LoginCredentials {
  email: string;
  password: string;
}

LoginResponse {
  access_token: string;
  rol_id: number;
}

SessionUser {
  access_token: string;
  rol_id: number;
}
```
