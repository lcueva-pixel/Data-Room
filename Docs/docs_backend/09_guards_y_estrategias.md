# Guards y Estrategias de Seguridad

---

## Flujo Completo de Autorizacion

```
                          Peticion HTTP
                               |
                               v
                    +---------------------+
                    |   JwtAuthGuard      |
                    | (valida JWT token)  |
                    +---------------------+
                          |         |
                       valido    invalido
                          |         |
                          v         v
                   req.user =    401
                   { userId,   Unauthorized
                     rol_id }
                          |
                          v
                    +---------------------+
                    |    AdminGuard       |
                    | (verifica rol = 1)  |
                    +---------------------+
                          |         |
                       admin    no admin
                          |         |
                          v         v
                     Controller    403
                     ejecuta    Forbidden
```

---

## 1. JwtAuthGuard

**Archivo:** `src/auth/jwt-auth.guard.ts`

### Descripcion
Guard que valida la presencia y validez de un JWT en el header `Authorization`.

### Implementacion
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Extiende `AuthGuard('jwt')` de `@nestjs/passport`, que internamente:
1. Busca el header `Authorization: Bearer <token>`
2. Extrae el token
3. Delega la validacion a `JwtStrategy`
4. Si es valido: adjunta el resultado de `validate()` a `req.user`
5. Si falla: retorna 401 Unauthorized

### Respuesta de Error
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Uso
```typescript
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogController { ... }
```

---

## 2. AdminGuard

**Archivo:** `src/auth/admin.guard.ts`

### Descripcion
Guard que verifica que el usuario autenticado tenga el rol de administrador (`rol_id === 1`).

### Implementacion
```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.rol_id !== 1) {
      throw new ForbiddenException(
        'Solo el administrador puede realizar esta accion'
      );
    }
    return true;
  }
}
```

### Prerequisito
**Debe usarse siempre DESPUES de JwtAuthGuard**, ya que depende de `req.user` que es adjuntado por JwtAuthGuard.

### Respuesta de Error
```json
{
  "statusCode": 403,
  "message": "Solo el administrador puede realizar esta accion"
}
```

### Uso
```typescript
@UseGuards(JwtAuthGuard, AdminGuard)  // Orden importante
@Controller('users')
export class UsersController { ... }
```

---

## 3. JwtStrategy

**Archivo:** `src/auth/jwt.strategy.ts`

### Descripcion
Estrategia de Passport que define como se extrae y valida el JWT.

### Configuracion

| Parametro | Valor | Descripcion |
|-----------|-------|-------------|
| `jwtFromRequest` | `ExtractJwt.fromAuthHeaderAsBearerToken()` | Extrae del header Authorization |
| `ignoreExpiration` | `false` | Rechaza tokens expirados |
| `secretOrKey` | `process.env.JWT_SECRET \|\| 'supersecret'` | Secreto de verificacion |

### Metodo validate()
```typescript
async validate(payload: any) {
  return { userId: payload.sub, rol_id: payload.rol_id };
}
```

Recibe el payload decodificado del JWT y retorna el objeto que se adjunta a `req.user`.

### Payload del JWT
```json
{
  "sub": 5,           // -> req.user.userId
  "rol_id": 1,        // -> req.user.rol_id
  "iat": 1711871426,  // Issued At (automatico)
  "exp": 1711900226   // Expires (8h despues)
}
```

---

## Aplicacion por Controller

| Controller | Guards | Acceso |
|------------|--------|--------|
| AuthController | Ninguno | Publico |
| UsersController | JwtAuthGuard + AdminGuard | Solo admin |
| ReportsController | JwtAuthGuard (base) + AdminGuard (en endpoints especificos) | Mixto |
| RolesController | JwtAuthGuard + AdminGuard | Solo admin |
| AuditController | JwtAuthGuard (base) + AdminGuard (en GET /audit) | Mixto |
| LogController | JwtAuthGuard | Usuarios autenticados |

### Detalle del ReportsController (Mixto)
| Endpoint | Guards |
|----------|--------|
| GET /reports | JwtAuthGuard | 
| GET /reports/admin | JwtAuthGuard + AdminGuard |
| GET /reports/:id/children | JwtAuthGuard + AdminGuard |
| POST /reports | JwtAuthGuard + AdminGuard |
| PUT /reports/:id | JwtAuthGuard + AdminGuard |
| PATCH /reports/:id/toggle | JwtAuthGuard + AdminGuard |
| DELETE /reports/:id | JwtAuthGuard + AdminGuard |

### Detalle del AuditController (Mixto)
| Endpoint | Guards |
|----------|--------|
| GET /audit | JwtAuthGuard + AdminGuard |
| POST /audit/report-time | JwtAuthGuard |
