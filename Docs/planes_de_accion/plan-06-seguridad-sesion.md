# Plan 06: Seguridad de Sesion

**Alcance:** Cookies httpOnly, Refresh Tokens, revocacion, headers de seguridad  
**Dependencias a instalar:** `helmet` (backend), `cookie-parser` (backend)  
**Archivos afectados:** ~18

---

## Parte A: Cookies Seguras con httpOnly (Set-Cookie desde NestJS)

### Problema Actual

El JWT se devuelve en el body de la respuesta JSON y se almacena con `js-cookie` en el frontend:

- **`auth.service.ts` linea 38-41:** Retorna `{ access_token, rol_id }` como JSON
- **`auth.ts` lineas 10-12:** `Cookies.set(TOKEN_KEY, data.access_token, { expires: EXPIRY_DAYS })` — cookie accesible desde JavaScript
- **`axios.ts` linea 14:** Lee el token con `getToken()` y lo pone en el header `Authorization`

Esto significa que cualquier script malicioso (XSS) puede leer `document.cookie` y robar el JWT.

### Solucion: Set-Cookie desde el Backend

El backend establecera la cookie directamente en la respuesta HTTP con flags de seguridad. El frontend ya no tocara el token.

### Archivos a Modificar (Backend)

#### A.1 Instalar `cookie-parser`

```bash
cd BACKEND
npm install cookie-parser
npm install -D @types/cookie-parser
```

NestJS necesita `cookie-parser` para leer cookies de las peticiones y `res.cookie()` para escribirlas.

#### A.2 `BACKEND/src/main.ts`

**Cambios:**
- Agregar import: `import * as cookieParser from 'cookie-parser';`
- Despues de `app.setGlobalPrefix('api')` (linea 9), agregar: `app.use(cookieParser());`

#### A.3 `BACKEND/src/auth/auth.service.ts`

**Estado actual (linea 37-41):** Retorna el token en el body.

**Cambio:** El metodo `login()` seguira generando el token, pero ya no lo retornara en el body. Solo retornara `{ rol_id }`. La cookie se establecera en el controller.

**Resultado:**
```typescript
async login(user: { id: number; rolId: number }) {
  const payload = { sub: user.id, rol_id: user.rolId };
  const accessToken = this.jwtService.sign(payload);
  return { accessToken, rol_id: user.rolId };
}
```

#### A.4 `BACKEND/src/auth/auth.controller.ts`

**Estado actual (linea 12-19):** Retorna el JSON directamente.

**Cambios:** Inyectar `@Res()` para establecer la cookie y retornar solo `{ rol_id }`:

```typescript
import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Response } from 'express';

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login(
  @Body() loginDto: LoginDto,
  @Req() req: any,
  @Res({ passthrough: true }) res: Response,
) {
  const userAgent = req.headers['user-agent'] || '';
  const user = await this.authService.validateUser(
    loginDto.email,
    loginDto.password,
    userAgent,
  );
  const { accessToken, rol_id } = await this.authService.login(user);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 horas en ms
    path: '/',
  });

  return { rol_id };
}
```

**Nota:** `passthrough: true` permite que NestJS siga manejando la serializacion del body automaticamente.

**Flags de la cookie:**
| Flag | Valor | Efecto |
|------|-------|--------|
| `httpOnly` | `true` | JavaScript NO puede leer la cookie (previene XSS) |
| `secure` | `true` en produccion | Solo se envia por HTTPS |
| `sameSite` | `'strict'` | No se envia en peticiones cross-site (previene CSRF) |
| `maxAge` | `28800000` (8h) | Expiracion de la cookie |
| `path` | `'/'` | Disponible en todas las rutas |

#### A.5 `BACKEND/src/auth/jwt.strategy.ts`

**Estado actual:** Extrae el token del header `Authorization: Bearer`.

**Cambio:** Configurar la extraccion del JWT desde la cookie `access_token` ademas del header (para compatibilidad):

```typescript
super({
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => req?.cookies?.['access_token'] ?? null,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  ignoreExpiration: false,
  secretOrKey: secret,
});
```

Esto permite que el token se lea de la cookie httpOnly O del header Authorization (compatibilidad con requests programaticos/Postman).

### Archivos a Modificar (Frontend)

#### A.6 `frontend/src/lib/auth.ts`

**Cambio fundamental:** Ya no se almacena `access_token` en cookies desde JavaScript. Solo se maneja `rol_id`.

```typescript
// ANTES: saveSession guarda access_token y rol_id
// DESPUES: solo guarda rol_id (el access_token viene como cookie httpOnly del backend)

export const saveSession = (data: { rol_id: number }): void => {
  Cookies.set(ROL_KEY, String(data.rol_id), { expires: EXPIRY_DAYS });
};

// getToken() ya no es necesario para enviar en headers
// pero se mantiene para verificar si hay sesion activa
export const getToken = (): boolean => {
  // No podemos leer la cookie httpOnly, asi que verificamos
  // si existe rol_id como indicador de sesion
  return !!Cookies.get(ROL_KEY);
};

export const clearSession = (): void => {
  Cookies.remove(ROL_KEY);
};
```

#### A.7 `frontend/src/lib/axios.ts`

**Cambios:**
- **Eliminar** el interceptor de request que agrega `Authorization: Bearer` (la cookie httpOnly se envia automaticamente)
- **Agregar** `withCredentials: true` a la instancia de Axios para que las cookies se envien en peticiones cross-origin

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // NUEVO: envia cookies automaticamente
});

// Eliminar el interceptor de request (ya no es necesario)

// Mantener el interceptor de response para 401
```

#### A.8 `frontend/src/context/AuthContext.tsx`

**Cambios:**
- `login()`: Ya no recibe `access_token` en la respuesta. Solo `rol_id`.
- `session`: Cambiar tipo para no depender de `access_token`.
- Restauracion: Verificar `rol_id` como indicador de sesion.

#### A.9 `frontend/src/hooks/useReportTracking.ts`

**Estado actual:** Usa `fetch()` directo con token del header.

**Cambio:** Agregar `credentials: 'include'` al fetch para enviar la cookie httpOnly. Eliminar el header `Authorization` manual.

#### A.10 `frontend/src/proxy.ts` (Middleware Next.js)

**Sin cambios necesarios.** Este middleware lee `access_token` de las cookies del request. Dado que la cookie httpOnly sigue siendo una cookie del navegador, el middleware de Next.js puede leerla normalmente desde `request.cookies`.

#### A.11 Agregar Endpoint de Logout (Backend)

**Archivo a crear/modificar:** `auth.controller.ts`

Agregar un endpoint `POST /api/auth/logout` que limpie la cookie:

```typescript
@Post('logout')
async logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return { message: 'Sesion cerrada' };
}
```

El frontend llamara a este endpoint en lugar de solo limpiar cookies locales.

---

## Parte B: Refresh Tokens

### Arquitectura

```
Login exitoso:
  Backend genera: Access Token (15 min) + Refresh Token (7 dias)
  Backend guarda: Refresh Token hasheado en BD
  Backend envia: Access Token como cookie httpOnly
                 Refresh Token como cookie httpOnly (ruta /api/auth/refresh)

Access Token expira:
  Frontend recibe 401
  Interceptor Axios llama POST /api/auth/refresh (envia cookie refresh)
  Backend valida refresh token contra BD
  Backend genera nuevo Access Token
  Backend envia nuevo Access Token como cookie httpOnly

Logout:
  Backend elimina Refresh Token de BD
  Backend limpia ambas cookies
```

### Modelo de Datos

#### B.1 `BACKEND/prisma/schema.prisma` — Nuevo modelo RefreshToken

```prisma
model RefreshToken {
  id          Int      @id @default(autoincrement())
  tokenHash   String   @map("token_hash")
  usuarioId   Int      @map("usuario_id")
  expiresAt   DateTime @map("expires_at") @db.Timestamptz
  revoked     Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz

  usuario User @relation(fields: [usuarioId], references: [id])

  @@index([tokenHash])
  @@index([usuarioId])
  @@map("cex_refresh_tokens")
}
```

Tambien agregar la relacion inversa en el modelo User:
```prisma
refreshTokens RefreshToken[]
```

Post-cambio: `npx prisma db push`

### Archivos a Modificar/Crear

#### B.2 `BACKEND/src/auth/auth.service.ts`

**Nuevos metodos:**

- `generateRefreshToken(userId: number)`: Genera un token random con `crypto.randomBytes(40)`, hashea con bcrypt, guarda en BD con expiracion de 7 dias, retorna el token plano.
- `validateRefreshToken(token: string, userId: number)`: Busca en BD tokens no revocados del usuario, compara hash, verifica expiracion.
- `revokeRefreshToken(tokenId: number)`: Marca `revoked = true` en BD.
- `revokeAllUserTokens(userId: number)`: Revoca todos los refresh tokens del usuario.

**Cambios al metodo `login()`:**
- Cambiar `expiresIn` del access token a `'15m'` (antes era `'8h'`)
- Generar refresh token y retornarlo

#### B.3 `BACKEND/src/auth/auth.controller.ts`

**Nuevos endpoints:**

- `POST /api/auth/refresh`: Lee refresh token de cookie, valida, genera nuevo access token, responde con nueva cookie.
- `POST /api/auth/logout`: Revoca refresh token en BD, limpia ambas cookies.

**Cambios al endpoint `login`:** Establecer 2 cookies (access_token y refresh_token).

Cookie de refresh token:
```typescript
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/api/auth/refresh',  // Solo se envia a la ruta de refresh
});
```

**Nota:** `path: '/api/auth/refresh'` asegura que el refresh token solo se envia a ese endpoint especifico.

#### B.4 `BACKEND/src/auth/auth.module.ts`

**Cambio:** Actualizar `expiresIn` en la configuracion de JwtModule a `'15m'`.

### Archivos a Modificar (Frontend)

#### B.5 `frontend/src/lib/axios.ts`

**Cambio en el interceptor de response:** Ante un 401, intentar refresh antes de redirigir al login:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest); // Reintentar con nueva cookie
      } catch {
        clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);
```

---

## Parte C: Mecanismo de Revocacion

### Estrategia

El sistema ya tiene control de revocacion via el campo `revoked` en el modelo `RefreshToken` (Parte B). Para los Access Tokens (corta duracion, 15 min), se usa un enfoque hibrido:

#### C.1 Revocacion de Refresh Tokens (BD)

Ya cubierto en Parte B:
- Cada refresh token tiene campo `revoked` (boolean)
- `revokeRefreshToken(id)` y `revokeAllUserTokens(userId)` en AuthService
- Al hacer logout, se revoca el refresh token
- Al desactivar un usuario (`toggleActivo`), revocar todos sus refresh tokens

#### C.2 Control de Access Tokens (verificacion de usuario activo)

**Archivo:** `BACKEND/src/auth/jwt.strategy.ts`

**Cambio en `validate()`:** Ademas de decodificar el payload, verificar en BD que el usuario sigue activo:

```typescript
async validate(payload: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, activo: true, rolId: true },
  });
  if (!user || !user.activo) {
    throw new UnauthorizedException('Usuario desactivado o no encontrado');
  }
  return { userId: user.id, rol_id: payload.rol_id };
}
```

Esto asegura que si un admin desactiva un usuario, su access token deja de funcionar inmediatamente (no espera 15 min a que expire).

**Nota de rendimiento:** Esto agrega una query por cada peticion autenticada. Para mitigar, se puede cachear con un TTL corto (ej: 60 segundos) usando un Map en memoria, pero para el volumen actual del sistema no es necesario.

#### C.3 Revocar al desactivar usuario

**Archivo:** `BACKEND/src/users/users.service.ts`

**Cambio en `toggleActivo()` y `remove()`:** Cuando un usuario se desactiva, revocar todos sus refresh tokens:

```typescript
async toggleActivo(id: number, executorId: number) {
  // ... toggle logic existente ...
  if (!updated.activo) {
    await this.authService.revokeAllUserTokens(id);
  }
  // ... log ...
}
```

**Dependencia:** UsersModule necesita importar AuthModule o el servicio de revocacion debe exponerse.

---

## Parte D: Headers de Seguridad (Helmet)

### Dependencia

```bash
cd BACKEND
npm install helmet
```

### Archivos a Modificar

#### D.1 `BACKEND/src/main.ts`

**Agregar import:** `import helmet from 'helmet';`

**Agregar despues de `app.setGlobalPrefix('api')` (linea 9):**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", "https://lookerstudio.google.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Necesario para iframes de Looker Studio
}));
```

**Headers que Helmet agrega automaticamente:**
| Header | Valor | Efecto |
|--------|-------|--------|
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Previene clickjacking |
| `Strict-Transport-Security` | `max-age=...` | Fuerza HTTPS |
| `X-XSS-Protection` | `0` | Desactiva filtro XSS legacy (correcto) |
| `Content-Security-Policy` | Configurado arriba | Controla fuentes permitidas |

**Nota:** `frameSrc: ["https://lookerstudio.google.com"]` permite que los iframes de Looker Studio se carguen. Sin esto, el CSP bloquearia los reportes.

---

## Resumen de Archivos

### Backend (11 archivos)
| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `package.json` | Agregar helmet, cookie-parser, @types/cookie-parser |
| 2 | `prisma/schema.prisma` | Agregar modelo RefreshToken + relacion en User |
| 3 | `src/main.ts` | Agregar cookieParser(), helmet(), interceptor logging |
| 4 | `src/auth/auth.module.ts` | Cambiar expiresIn a 15m |
| 5 | `src/auth/auth.service.ts` | Metodos de refresh token, revocar, login modificado |
| 6 | `src/auth/auth.controller.ts` | Set-Cookie, endpoints refresh y logout |
| 7 | `src/auth/jwt.strategy.ts` | Extraer JWT de cookie, validar usuario activo |
| 8 | `src/users/users.service.ts` | Revocar tokens al desactivar usuario |
| 9 | `src/users/users.module.ts` | Importar AuthModule si es necesario |

### Frontend (5 archivos)
| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `src/lib/auth.ts` | Eliminar manejo de access_token, solo rol_id |
| 2 | `src/lib/axios.ts` | withCredentials: true, retry en 401, eliminar header manual |
| 3 | `src/context/AuthContext.tsx` | Adaptar login/logout al nuevo flujo |
| 4 | `src/hooks/useReportTracking.ts` | credentials: 'include' en fetch |
| 5 | `src/types/auth.types.ts` | Actualizar LoginResponse (sin access_token) |

### Orden de Ejecucion Recomendado

```
Parte D (Helmet)          -> Independiente, ejecutar primero
Parte A (Cookies httpOnly) -> Requiere cambios coordinados backend + frontend
Parte B (Refresh Tokens)   -> Requiere Parte A completada
Parte C (Revocacion)       -> Requiere Parte B completada
```
