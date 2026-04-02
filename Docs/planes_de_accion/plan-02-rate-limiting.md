# Plan 02: Rate Limiting

**Alcance:** Limite global de peticiones + restriccion estricta en login  
**Dependencia a instalar:** `@nestjs/throttler`  
**Archivos afectados:** 3

---

## Problema Actual

No existe ningun mecanismo de limitacion de peticiones en el backend. Riesgos:

- **Fuerza bruta en login:** Un atacante puede enviar miles de combinaciones email/password sin restriccion
- **DoS basico:** Peticiones masivas a cualquier endpoint pueden saturar la base de datos
- **Enumeracion de cuentas:** Intentos repetidos al login para descubrir emails validos

---

## Dependencia

```bash
cd BACKEND
npm install @nestjs/throttler
```

Esto agrega el modulo oficial de NestJS para rate limiting basado en IP.

---

## Archivos a Modificar

### 1. `BACKEND/src/app.module.ts`

**Estado actual (23 lineas):**
```typescript
// linea 1: import { Module } from '@nestjs/common';
// linea 2: import { ConfigModule } from '@nestjs/config';
// lineas 11-21: @Module({ imports: [...] })
```

**Cambios:**

- **Agregar imports (lineas nuevas despues de linea 2):**
  ```typescript
  import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
  import { APP_GUARD } from '@nestjs/core';
  ```

- **Dentro del array `imports` (despues de linea 13, ConfigModule):**
  ```typescript
  ThrottlerModule.forRoot([{
    ttl: 60000,   // Ventana de 1 minuto
    limit: 30,    // Max 30 peticiones por minuto por IP
  }]),
  ```

- **Agregar propiedad `providers` al decorador `@Module` (no existe actualmente):**
  ```typescript
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  ```

**Resultado completo esperado:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { LogModule } from './log/log.module';
import { AuditModule } from './audit/audit.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    LogModule,
    AuditModule,
    RolesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Efecto:** Todas las rutas de la API quedan limitadas a 30 peticiones por minuto por IP de forma automatica.

---

### 2. `BACKEND/src/auth/auth.controller.ts`

**Estado actual (19 lineas):**
```typescript
// linea 1: import { Controller, Post, Body, Req } from '@nestjs/common';
// linea 9: @Post('login')
```

**Cambios:**

- **Linea 1:** Agregar al import de `@nestjs/common` (sin cambios, solo referencia)
- **Agregar import nuevo:**
  ```typescript
  import { Throttle } from '@nestjs/throttler';
  ```
- **Antes de linea 9 (`@Post('login')`):** Agregar decorador `@Throttle`

**Resultado:**
```typescript
import { Controller, Post, Body, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const userAgent = req.headers['user-agent'] || '';
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      userAgent,
    );
    return this.authService.login(user);
  }
}
```

**Efecto:** El endpoint `POST /api/auth/login` queda limitado a **5 intentos por minuto por IP**, sobrescribiendo el limite global de 30.

---

### 3. `BACKEND/package.json`

**Cambio automatico tras `npm install`:** Se agrega `@nestjs/throttler` a `dependencies`.

---

## Comportamiento Esperado

### Limites por Endpoint

| Endpoint | Limite | Ventana | Razon |
|----------|:------:|:-------:|-------|
| `POST /api/auth/login` | 5 peticiones | 60 segundos | Proteccion contra fuerza bruta |
| Todos los demas | 30 peticiones | 60 segundos | Proteccion general contra abuso |

### Respuesta al Exceder el Limite

Cuando una IP excede el limite, recibe:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "statusCode": 429,
  "message": "ThrottlerException: Demasiados intentos de inicio de sesión, vuelva intentar en un minuto"
}
```

El header `Retry-After` indica cuantos segundos debe esperar antes de intentar nuevamente.

### Identificacion por IP

`@nestjs/throttler` identifica al cliente por su IP de origen. En un entorno con proxy reverso (nginx), configurar el header `X-Forwarded-For` para obtener la IP real del cliente.

---

## Resumen

| # | Archivo | Accion | Cambio |
|:-:|---------|--------|--------|
| 1 | `BACKEND/src/app.module.ts` | Modificar | ThrottlerModule.forRoot + ThrottlerGuard como APP_GUARD |
| 2 | `BACKEND/src/auth/auth.controller.ts` | Modificar | @Throttle(5, 60000) en endpoint login |
| 3 | `BACKEND/package.json` | Modificar | Agregar @nestjs/throttler |

## Orden de Ejecucion

```
1. npm install @nestjs/throttler
2. Modificar app.module.ts (ThrottlerModule + provider)
3. Modificar auth.controller.ts (@Throttle en login)
4. Reiniciar backend
5. Verificar: enviar 6 requests a login en < 1 min → el 6to debe retornar 429
```
