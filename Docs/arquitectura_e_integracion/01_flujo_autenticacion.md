# Flujo de Autenticacion End-to-End

---

## Diagrama de Secuencia

```
  Frontend (Next.js)                          Backend (NestJS)                    PostgreSQL
  ──────────────────                          ────────────────                    ──────────
        |                                           |                                |
  1. Usuario ingresa                                |                                |
     email + password                               |                                |
        |                                           |                                |
  2. LoginForm submit                               |                                |
        |                                           |                                |
  3. AuthContext.login()                             |                                |
        |                                           |                                |
  4. Axios POST /api/auth/login ─────────────────> |                                |
     Body: { email, password }                      |                                |
     Header: User-Agent: Mozilla/5.0...             |                                |
        |                                    5. AuthController.login()               |
        |                                           |                                |
        |                                    6. AuthService.validateUser()           |
        |                                           |                                |
        |                                    7. prisma.user.findFirst() ──────────> |
        |                                        { email, activo: true }             |
        |                                           |                        8. Retorna user
        |                                           | <──────────────────────────────|
        |                                           |                                |
        |                                    9. bcrypt.compare(password, hash)       |
        |                                           |                                |
        |                                   10. prisma.auditAccess.create() ──────> |
        |                                        { usuarioId, userAgent }     Guarda acceso
        |                                           |                                |
        |                                   11. AuthService.login()                  |
        |                                        jwtService.sign({                   |
        |                                          sub: userId,                      |
        |                                          rol_id: rolId                     |
        |                                        })                                  |
        |                                           |                                |
        | <──────────────────────────────── 12. Response 200                         |
        |   { access_token: "eyJ...", rol_id: 1 }  |                                |
        |                                           |                                |
  13. saveSession()                                 |                                |
      Cookie: access_token (8h)                     |                                |
      Cookie: rol_id (8h)                           |                                |
        |                                           |                                |
  14. router.push('/dashboard/overview')            |                                |
        |                                           |                                |
  ─── Peticiones subsecuentes ──────────────────────────────────────────────────────
        |                                           |                                |
  15. Axios GET /api/reports ────────────────────> |                                |
      Header: Authorization: Bearer eyJ...          |                                |
        |                                    16. JwtAuthGuard                        |
        |                                        JwtStrategy.validate()              |
        |                                        req.user = { userId, rol_id }       |
        |                                           |                                |
        |                                    17. Controller ejecuta                  |
        | <──────────────────────────────── 18. Response 200                         |
        |                                           |                                |
  ─── Token expirado ───────────────────────────────────────────────────────────────
        |                                           |                                |
  19. Axios GET /api/users ──────────────────────> |                                |
      Header: Authorization: Bearer eyJ...(expired) |                                |
        |                                    20. JwtAuthGuard RECHAZA               |
        | <──────────────────────────────── 21. Response 401 Unauthorized            |
        |                                           |                                |
  22. Interceptor Axios detecta 401                 |                                |
      clearSession()                                |                                |
      window.location.href = '/login'               |                                |
```

---

## Estructura del JWT

### Payload
```json
{
  "sub": 5,
  "rol_id": 1,
  "iat": 1711871426,
  "exp": 1711900226
}
```

| Campo | Descripcion |
|-------|-------------|
| `sub` | Subject - ID del usuario en la BD |
| `rol_id` | ID del rol del usuario |
| `iat` | Issued At - timestamp de emision (automatico) |
| `exp` | Expiration - timestamp de expiracion (8h despues, automatico) |

### Configuracion de Firma
| Parametro | Valor | Origen |
|-----------|-------|--------|
| Algoritmo | HS256 (default) | @nestjs/jwt |
| Secreto | `JWT_SECRET` env | `BACKEND/.env` |
| Expiracion | 8 horas | `auth.module.ts` -> signOptions.expiresIn |

---

## Almacenamiento de Sesion

### Cookies del Navegador
| Cookie | Valor | Expiracion | Acceso |
|--------|-------|------------|--------|
| `access_token` | JWT completo | 8 horas | Client-side + Middleware |
| `rol_id` | Numero (ej: "1") | 8 horas | Client-side + Middleware |

### Funciones de Gestion (auth.ts)
| Funcion | Accion |
|---------|--------|
| `saveSession(data)` | Guarda ambas cookies |
| `getToken()` | Lee access_token |
| `getRolId()` | Lee rol_id como numero |
| `clearSession()` | Elimina ambas cookies |
| `isAuthenticated()` | Verifica existencia del token |

---

## Proteccion de Rutas (Doble Capa)

### Capa 1: Middleware Next.js (Server-side) - proxy.ts
Intercepta ANTES de renderizar la pagina:

| Condicion | Accion |
|-----------|--------|
| Sin token + ruta protegida | Redirect a `/login` |
| Con token + en `/login` | Redirect a `/dashboard` |
| Con token + ruta admin + rol != 1 | Redirect a `/dashboard` |

### Capa 2: Guards NestJS (Backend)
Validan CADA peticion a la API:

| Guard | Valida | Error |
|-------|--------|-------|
| JwtAuthGuard | Token presente y valido | 401 |
| AdminGuard | rol_id === 1 | 403 |

### Capa 3: Interceptor Axios (Client-side)
Maneja respuestas de error:

| Codigo | Accion |
|--------|--------|
| 401 | clearSession() + redirect a /login |

---

## Escenarios de Fallo

| Escenario | Donde falla | Resultado |
|-----------|-------------|-----------|
| Email inexistente | AuthService.validateUser | 401 "Credenciales invalidas" |
| Password incorrecto | bcrypt.compare | 401 "Credenciales invalidas" |
| Usuario inactivo | findFirst activo:true | 401 "Credenciales invalidas" |
| Token expirado | JwtStrategy | 401 Unauthorized |
| Token manipulado | JwtStrategy | 401 Unauthorized |
| Sin token | JwtAuthGuard | 401 Unauthorized |
| Rol no-admin en ruta admin | AdminGuard | 403 Forbidden |
| Cookie expirada | Interceptor Axios | Redirect a /login |
