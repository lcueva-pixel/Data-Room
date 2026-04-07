# Plan 03: Logging Estructurado

**Alcance:** Interceptor global de logging + registro de eventos criticos en BD  
**Dependencias a instalar:** Ninguna (se usa Logger nativo de NestJS)  
**Archivos afectados:** 13

---

## Problema Actual

- La tabla `cex_log_actividades` existe pero **no se usa** (confirmado en auditoria)
- `LogService` tiene un metodo `register()` funcional pero nadie lo invoca
- No se registran: intentos fallidos de login, errores 500, ni acciones administrativas
- El modelo `LogActivity` tiene `usuarioId` como campo **obligatorio**, lo que impide registrar eventos sin usuario (login fallido, errores 500)

---

## Paso 1: Adaptar el Modelo de Datos

### 1.1 `BACKEND/prisma/schema.prisma` — Modelo LogActivity

**Estado actual (lineas 74-82):**
```prisma
model LogActivity {
  id        Int      @id @default(autoincrement())
  usuarioId Int      @map("usuario_id")
  accion    String   @db.VarChar(100)
  detalle   String?
  fechaHora DateTime @default(now()) @map("fecha_hora") @db.Timestamptz

  usuario User @relation(fields: [usuarioId], references: [id])

  @@map("cex_log_actividades")
}
```

**Cambios:**
1. Hacer `usuarioId` **opcional** (`Int?`) para soportar eventos sin usuario autenticado
2. Agregar campo `nivel` (`String`, default `"INFO"`) para clasificar severidad
3. Hacer la relacion `usuario` opcional (`User?`)
4. Agregar indices en `fechaHora` y `nivel`

**Resultado:**
```prisma
model LogActivity {
  id        Int      @id @default(autoincrement())
  usuarioId Int?     @map("usuario_id")
  accion    String   @db.VarChar(100)
  detalle   String?
  nivel     String   @default("INFO") @db.VarChar(20)
  fechaHora DateTime @default(now()) @map("fecha_hora") @db.Timestamptz

  usuario User? @relation(fields: [usuarioId], references: [id])

  @@index([fechaHora])
  @@index([nivel])
  @@map("cex_log_actividades")
}
```

**Tambien en el modelo User (linea 31):** Cambiar `logActivities LogActivity[]` — no requiere cambio ya que Prisma maneja la opcionalidad desde el lado del FK.

**Post-cambio:** Ejecutar migracion:
```bash
cd BACKEND
npx prisma migrate dev --name add-log-nivel-optional-user
npx prisma generate
```

---

### 1.2 `BACKEND/src/log/types/log.types.ts`

**Estado actual (5 lineas):**
```typescript
export interface LogActivityRecord {
  usuarioId: number;
  accion: string;
  detalle?: string;
}
```

**Cambios:** Hacer `usuarioId` opcional y agregar campo `nivel`.

**Resultado:**
```typescript
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogActivityRecord {
  usuarioId?: number | null;
  accion: string;
  detalle?: string;
  nivel?: LogLevel;
}
```

---

### 1.3 `BACKEND/src/log/log.service.ts`

**Estado actual (27 lineas):**
```typescript
// lineas 18-26: metodo register()
async register(record: LogActivityRecord) {
  return this.prisma.logActivity.create({
    data: {
      usuarioId: record.usuarioId,
      accion: record.accion,
      detalle: record.detalle,
    },
  });
}
```

**Cambio:** Agregar campo `nivel` al data de `create()`.

**Resultado:**
```typescript
async register(record: LogActivityRecord) {
  return this.prisma.logActivity.create({
    data: {
      usuarioId: record.usuarioId ?? null,
      accion: record.accion,
      detalle: record.detalle,
      nivel: record.nivel ?? 'INFO',
    },
  });
}
```

---

## Paso 2: Crear Interceptor Global de Logging

### 2.1 Crear `BACKEND/src/common/interceptors/logging.interceptor.ts`

**Archivo nuevo.** Crear primero la carpeta `src/common/interceptors/`.

**Contenido:**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LogService } from '../../log/log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        this.logger.log(`${method} ${url} — ${ms}ms`);
      }),
      catchError((error) => {
        const ms = Date.now() - now;
        const status = error?.status || error?.getStatus?.() || 500;

        if (status >= 500) {
          this.logService.register({
            usuarioId: user?.userId ?? null,
            accion: 'ERROR_SERVIDOR',
            detalle: `${method} ${url} [${status}] — ${error.message ?? 'Error interno'}`,
            nivel: 'ERROR',
          }).catch(() => {});  // No bloquear la respuesta si falla el log
        }

        this.logger.error(`${method} ${url} ${status} — ${ms}ms — ${error.message}`);
        return throwError(() => error);
      }),
    );
  }
}
```

**Notas:**
- Solo registra en BD los errores 500+. Los 4xx se manejan en otros puntos (login fallido, validacion)
- El `.catch(() => {})` evita que un fallo en el logging bloquee la respuesta al cliente
- Usa el `Logger` nativo de NestJS para consola y `LogService` para persistencia en BD

---

### 2.2 Registrar el Interceptor en `BACKEND/src/main.ts`

**Estado actual (linea 28):** `const port = process.env.PORT || 3000;`

**Cambios:**

- Agregar imports al inicio del archivo:
  ```typescript
  import { LogService } from './log/log.service';
  import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
  ```

- Agregar despues de `useGlobalPipes` (despues de linea 26) y antes de `app.listen`:
  ```typescript
  const logService = app.get(LogService);
  app.useGlobalInterceptors(new LoggingInterceptor(logService));
  ```

---

## Paso 3: Registrar Intentos Fallidos de Login

### 3.1 `BACKEND/src/auth/auth.module.ts`

**Estado actual:** No importa `LogModule`.

**Cambio:** Agregar `LogModule` al array de `imports` para que `LogService` este disponible en `AuthService`.

```typescript
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    PassportModule,
    LogModule,   // NUEVO
    JwtModule.registerAsync({ ... }),
  ],
  ...
})
```

### 3.2 `BACKEND/src/auth/auth.service.ts`

**Estado actual (45 lineas):**
```typescript
// linea 1: imports
// linea 8-11: constructor con PrismaService y JwtService
// lineas 22-24: throw si usuario no encontrado
// lineas 27-29: throw si password invalido
```

**Cambios:**

- **Linea 4 (imports):** Agregar import de `LogService`:
  ```typescript
  import { LogService } from '../log/log.service';
  ```

- **Constructor (linea 8-11):** Agregar `LogService` como dependencia:
  ```typescript
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}
  ```

- **Lineas 22-24 (usuario no encontrado):** Antes del `throw`, registrar el intento fallido:
  ```typescript
  if (!user) {
    await this.logService.register({
      usuarioId: null,
      accion: 'LOGIN_FALLIDO',
      detalle: `Email no encontrado: ${email}`,
      nivel: 'WARN',
    });
    throw new UnauthorizedException('Credenciales incorrectas');
  }
  ```

- **Lineas 27-29 (password invalido):** Antes del `throw`, registrar con el userId:
  ```typescript
  if (!passwordValid) {
    await this.logService.register({
      usuarioId: user.id,
      accion: 'LOGIN_FALLIDO',
      detalle: `Password incorrecto para: ${email}`,
      nivel: 'WARN',
    });
    throw new UnauthorizedException('Credenciales incorrectas');
  }
  ```

- **Linea 31-33 (login exitoso, despues de crear auditAccess):** Registrar login exitoso:
  ```typescript
  await this.logService.register({
    usuarioId: user.id,
    accion: 'LOGIN_EXITOSO',
    detalle: `Login exitoso: ${email}`,
    nivel: 'INFO',
  });
  ```

---

## Paso 4: Registrar Acciones Administrativas

### Modulo de Usuarios

#### 4.1 `BACKEND/src/users/users.module.ts`

**Cambio:** Agregar `LogModule` a imports.

#### 4.2 `BACKEND/src/users/users.controller.ts`

**Estado actual (linea 1):** No importa `Req`.

**Cambios:** Agregar `Req` al import y `@Req() req: any` a los metodos que modifican datos para extraer `req.user.userId`:

- **`create` (linea 20):** Agregar `@Req() req: any` y pasar `req.user.userId` al servicio
- **`update` (linea 25):** Agregar `@Req() req: any` y pasar `req.user.userId`
- **`toggleActivo` (linea 33):** Agregar `@Req() req: any` y pasar `req.user.userId`
- **`remove` (linea 38):** Agregar `@Req() req: any` y pasar `req.user.userId`

**Ejemplo para create:**
```typescript
@Post()
async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
  return this.usersService.create(createUserDto, req.user.userId);
}
```

#### 4.3 `BACKEND/src/users/users.service.ts`

**Cambios:**

- **Imports:** Agregar `import { LogService } from '../log/log.service';`
- **Constructor (linea 21):** Agregar `private readonly logService: LogService`
- **Metodos:** Agregar parametro `executorId: number` y llamada a `logService.register()` despues de cada operacion exitosa

| Metodo | Parametro nuevo | Accion registrada | Detalle |
|--------|----------------|-------------------|---------|
| `create(dto, executorId)` | `executorId: number` | `CREAR_USUARIO` | `"Usuario creado: ${dto.email}"` |
| `update(id, dto, executorId)` | `executorId: number` | `ACTUALIZAR_USUARIO` | `"Usuario actualizado: id=${id}"` |
| `toggleActivo(id, executorId)` | `executorId: number` | `TOGGLE_USUARIO` | `"Usuario id=${id}: ${activo ? 'activado' : 'desactivado'}"` |
| `remove(id, executorId)` | `executorId: number` | `DESACTIVAR_USUARIO` | `"Usuario desactivado: id=${id}"` |

### Modulo de Reportes

#### 4.4 `BACKEND/src/reports/reports.module.ts`

**Cambio:** Agregar `LogModule` a imports.

#### 4.5 `BACKEND/src/reports/reports.controller.ts`

**Estado actual:** Ya importa `Req` (linea 1) y lo usa en `findAll` (linea 15).

**Cambios:** Agregar `@Req() req: any` a los metodos admin y pasar `req.user.userId`:

- **`create` (linea 33):** Agregar `@Req() req: any`, pasar `req.user.userId`
- **`update` (linea 39):** Agregar `@Req() req: any`, pasar `req.user.userId`
- **`toggleActivo` (linea 48):** Agregar `@Req() req: any`, pasar `req.user.userId`
- **`remove` (linea 54):** Agregar `@Req() req: any`, pasar `req.user.userId`

#### 4.6 `BACKEND/src/reports/reports.service.ts`

**Cambios:** Identicos en patron al users.service.ts:

- Agregar import de `LogService`
- Agregar al constructor
- Agregar parametro `executorId` y llamada a `register()` en `create`, `update`, `toggleActivo`, `remove`

| Metodo | Accion registrada | Detalle |
|--------|-------------------|---------|
| `create(dto, executorId)` | `CREAR_REPORTE` | `"Reporte creado: ${dto.titulo}"` |
| `update(id, dto, executorId)` | `ACTUALIZAR_REPORTE` | `"Reporte actualizado: id=${id}"` |
| `toggleActivo(id, executorId)` | `TOGGLE_REPORTE` | `"Reporte id=${id}: ${activo ? 'activado' : 'desactivado'}"` |
| `remove(id, executorId)` | `DESACTIVAR_REPORTE` | `"Reporte desactivado: id=${id}"` |

---

## Catalogo de Eventos Registrados

| Accion | Nivel | usuarioId | Origen | Detalle |
|--------|:-----:|:---------:|--------|---------|
| `LOGIN_EXITOSO` | INFO | Si | auth.service | "Login exitoso: {email}" |
| `LOGIN_FALLIDO` | WARN | Opcional | auth.service | "Email no encontrado: {email}" o "Password incorrecto para: {email}" |
| `CREAR_USUARIO` | INFO | Si | users.service | "Usuario creado: {email}" |
| `ACTUALIZAR_USUARIO` | INFO | Si | users.service | "Usuario actualizado: id={id}" |
| `TOGGLE_USUARIO` | INFO | Si | users.service | "Usuario id={id}: activado/desactivado" |
| `DESACTIVAR_USUARIO` | INFO | Si | users.service | "Usuario desactivado: id={id}" |
| `CREAR_REPORTE` | INFO | Si | reports.service | "Reporte creado: {titulo}" |
| `ACTUALIZAR_REPORTE` | INFO | Si | reports.service | "Reporte actualizado: id={id}" |
| `TOGGLE_REPORTE` | INFO | Si | reports.service | "Reporte id={id}: activado/desactivado" |
| `DESACTIVAR_REPORTE` | INFO | Si | reports.service | "Reporte desactivado: id={id}" |
| `ERROR_SERVIDOR` | ERROR | Opcional | logging.interceptor | "{METHOD} {URL} [{status}] — {error.message}" |

---

## Resumen de Archivos

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `BACKEND/prisma/schema.prisma` | Modificar (LogActivity: usuarioId opcional, campo nivel, indices) |
| 2 | `BACKEND/src/log/types/log.types.ts` | Modificar (usuarioId opcional, tipo LogLevel, campo nivel) |
| 3 | `BACKEND/src/log/log.service.ts` | Modificar (incluir nivel en register) |
| 4 | `BACKEND/src/common/interceptors/logging.interceptor.ts` | **Crear** |
| 5 | `BACKEND/src/main.ts` | Modificar (registrar interceptor global) |
| 6 | `BACKEND/src/auth/auth.module.ts` | Modificar (importar LogModule) |
| 7 | `BACKEND/src/auth/auth.service.ts` | Modificar (inyectar LogService, registrar login exitoso/fallido) |
| 8 | `BACKEND/src/users/users.module.ts` | Modificar (importar LogModule) |
| 9 | `BACKEND/src/users/users.controller.ts` | Modificar (pasar req.user.userId) |
| 10 | `BACKEND/src/users/users.service.ts` | Modificar (inyectar LogService, registrar acciones CRUD) |
| 11 | `BACKEND/src/reports/reports.module.ts` | Modificar (importar LogModule) |
| 12 | `BACKEND/src/reports/reports.controller.ts` | Modificar (pasar req.user.userId) |
| 13 | `BACKEND/src/reports/reports.service.ts` | Modificar (inyectar LogService, registrar acciones CRUD) |

## Orden de Ejecucion

```
1. Modificar schema.prisma
2. Ejecutar npx prisma migrate dev --name add-log-nivel-optional-user
3. Ejecutar npx prisma generate
4. Modificar log.types.ts y log.service.ts
5. Crear logging.interceptor.ts
6. Modificar main.ts (registrar interceptor)
7. Modificar auth.module.ts + auth.service.ts (login fallido/exitoso)
8. Modificar users.module.ts + users.controller.ts + users.service.ts
9. Modificar reports.module.ts + reports.controller.ts + reports.service.ts
10. Reiniciar backend y verificar logs en BD con Prisma Studio
```
