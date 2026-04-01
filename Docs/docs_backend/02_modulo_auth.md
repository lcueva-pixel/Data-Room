# Modulo: Autenticacion (Auth)

---

## Archivos del Modulo

| Archivo | Proposito |
|---------|-----------|
| `src/auth/auth.module.ts` | Configuracion del modulo, JWT y Passport |
| `src/auth/auth.controller.ts` | Endpoint de login |
| `src/auth/auth.service.ts` | Validacion de credenciales, firma de JWT |
| `src/auth/jwt.strategy.ts` | Estrategia Passport para validar JWT |
| `src/auth/jwt-auth.guard.ts` | Guard que protege rutas con JWT |
| `src/auth/admin.guard.ts` | Guard que verifica rol administrador |
| `src/auth/dto/login.dto.ts` | DTO de credenciales de login |

---

## Configuracion del Modulo

**Archivo:** `src/auth/auth.module.ts`

```
Imports:
  - PassportModule (integracion con Passport.js)
  - JwtModule.registerAsync:
      secret: JWT_SECRET (desde ConfigService)
      signOptions: { expiresIn: '8h' }

Providers: AuthService, JwtStrategy
Controllers: AuthController
Exports: AuthService
```

---

## Endpoint

### POST /api/auth/login

**Guard:** Ninguno (endpoint publico)  
**Body:** `LoginDto`

```typescript
LoginDto {
  email: string     // @IsEmail()
  password: string  // @IsString(), @MinLength(6)
}
```

**Flujo:**
1. Recibe email y password en el body
2. Extrae `user-agent` del header de la peticion
3. Llama `authService.validateUser(email, password, userAgent)`
4. Si es valido, llama `authService.login(user)`
5. Retorna `{ access_token: "jwt...", rol_id: 1 }`

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "rol_id": 1
}
```

**Respuesta fallida (401):**
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

---

## AuthService

**Archivo:** `src/auth/auth.service.ts`

### validateUser(email, password, userAgent)

1. Busca usuario en BD: `prisma.user.findFirst({ where: { email, activo: true } })`
2. Si no existe o esta inactivo: lanza `UnauthorizedException('Credenciales invalidas')`
3. Compara password con hash: `bcrypt.compare(password, user.passwordHash)`
4. Si no coincide: lanza `UnauthorizedException('Credenciales invalidas')`
5. Registra acceso en auditoria: `prisma.auditAccess.create({ usuarioId, userAgent })`
6. Retorna `{ id: user.id, rolId: user.rolId }`

### login(user)

1. Construye payload JWT: `{ sub: user.id, rol_id: user.rolId }`
2. Firma el token con `jwtService.sign(payload)`
3. Retorna `{ access_token: token, rol_id: user.rolId }`

---

## JWT Strategy

**Archivo:** `src/auth/jwt.strategy.ts`

Extiende `PassportStrategy(Strategy)` de `@nestjs/passport`.

### Configuracion
| Parametro | Valor | Descripcion |
|-----------|-------|-------------|
| `jwtFromRequest` | `ExtractJwt.fromAuthHeaderAsBearerToken()` | Extrae JWT del header `Authorization: Bearer <token>` |
| `ignoreExpiration` | `false` | No acepta tokens expirados |
| `secretOrKey` | `process.env.JWT_SECRET \|\| 'supersecret'` | Secreto para verificar la firma |

### validate(payload)
Recibe el payload decodificado del JWT y retorna el objeto que se adjunta a `request.user`:

```typescript
// Payload del JWT: { sub: 5, rol_id: 1, iat: ..., exp: ... }
// Retorna:
{ userId: 5, rol_id: 1 }
```

Este objeto queda disponible en `req.user` para todos los controllers y guards subsecuentes.

---

## Guards

### JwtAuthGuard

**Archivo:** `src/auth/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- Extiende el `AuthGuard` de Passport con la estrategia `'jwt'`
- Si el token es valido: permite el acceso y adjunta `req.user`
- Si el token falta o es invalido: retorna **401 Unauthorized**

### AdminGuard

**Archivo:** `src/auth/admin.guard.ts`

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.rol_id !== 1) {
      throw new ForbiddenException('Solo el administrador puede realizar esta accion');
    }
    return true;
  }
}
```

- Verifica que `req.user.rol_id === 1`
- Si no es admin: retorna **403 Forbidden**
- **Debe usarse siempre despues de `JwtAuthGuard`** para que `req.user` este disponible

### Orden de Aplicacion de Guards
```
Request --> JwtAuthGuard --> (valida JWT, adjunta req.user) --> AdminGuard --> (verifica rol) --> Controller
```

---

## Estructura del JWT

### Payload
```json
{
  "sub": 5,        // ID del usuario
  "rol_id": 1,     // ID del rol
  "iat": 1711871426, // Timestamp de emision
  "exp": 1711900226  // Timestamp de expiracion (8h despues)
}
```

### Ciclo de Vida
- **Creacion:** Al hacer login exitoso
- **Expiracion:** 8 horas despues de la emision
- **Almacenamiento:** En cookies del navegador (frontend)
- **Envio:** En header `Authorization: Bearer <token>` de cada peticion
- **Validacion:** En cada request a endpoints protegidos via JwtAuthGuard
