# Plan de Acción: Refactorización del Backend — LockerStudio

> **Estado:** Pendiente de aprobación
> **Alcance:** Exclusivamente la carpeta `BACKEND/`
> **Restricción:** Este documento es solo de planificación. Ningún archivo debe modificarse hasta que el desarrollador dé luz verde fase por fase.

---

## Diagnóstico del Estado Actual

Antes de planificar, se identificaron los siguientes problemas críticos en la arquitectura actual:

| # | Problema | Ubicación | Severidad |
|---|----------|-----------|-----------|
| 1 | Lógica de negocio directamente en los controladores | `users`, `reports`, `log` | Alta |
| 2 | Sin capa de servicio (`*.service.ts`) en la mayoría de módulos | `users`, `reports`, `log`, `audit` | Alta |
| 3 | Inyección de repositorios TypeORM directamente en controladores | `users.controller`, `reports.controller`, `log.controller` | Alta |
| 4 | Módulo `roles` incompleto (solo existe la entidad, sin `module.ts`, sin controller ni service) | `src/roles/` | Media |
| 5 | Módulo `audit` sin controller ni service | `src/audit/` | Media |
| 6 | `package.json` incompleto: no lista NestJS, TypeORM, Passport, ni JWT como dependencias | `BACKEND/package.json` | Alta |
| 7 | `ValidationPipe` no está configurado globalmente en `main.ts` | `src/main.ts` | Media |
| 8 | Ningún módulo tendrá que cambiar su lógica de dominio, solo su capa de acceso a datos | Todos | Baja |

---

## Estructura Objetivo

Al finalizar la refactorización, el backend tendrá esta estructura:

```
BACKEND/
└── src/
    ├── main.ts                         ← Agregar ValidationPipe global
    ├── app.module.ts                   ← Limpiar TypeORM, importar PrismaModule
    │
    ├── prisma/                         ← NUEVO módulo global de base de datos
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    │
    ├── auth/
    │   ├── auth.controller.ts          ← Sin cambios de lógica
    │   ├── auth.service.ts             ← Reemplazar repositorios TypeORM por PrismaService
    │   ├── auth.module.ts              ← Eliminar TypeOrmModule.forFeature, importar PrismaModule
    │   ├── jwt.strategy.ts             ← Sin cambios
    │   ├── jwt-auth.guard.ts           ← Sin cambios
    │   ├── admin.guard.ts              ← Sin cambios
    │   └── dto/
    │       └── login.dto.ts            ← Sin cambios
    │
    ├── users/
    │   ├── users.controller.ts         ← Delegar toda la lógica al servicio
    │   ├── users.service.ts            ← NUEVO: mover lógica desde el controller
    │   ├── users.module.ts             ← Eliminar TypeOrmModule.forFeature, importar PrismaModule
    │   └── dto/
    │       └── create-user.dto.ts      ← Sin cambios
    │
    ├── reports/
    │   ├── reports.controller.ts       ← Delegar toda la lógica al servicio
    │   ├── reports.service.ts          ← NUEVO: mover lógica desde el controller
    │   ├── reports.module.ts           ← Eliminar TypeOrmModule.forFeature, importar PrismaModule
    │   └── dto/
    │       └── create-report.dto.ts    ← Sin cambios
    │
    ├── audit/
    │   ├── audit.controller.ts         ← NUEVO: exponer endpoint GET /audit
    │   ├── audit.service.ts            ← NUEVO: lógica de consulta y registro
    │   ├── audit.module.ts             ← Eliminar TypeOrmModule.forFeature, importar PrismaModule
    │   └── types/
    │       └── audit.types.ts          ← NUEVO: interfaces de auditoría
    │
    ├── log/
    │   ├── log.controller.ts           ← Delegar toda la lógica al servicio
    │   ├── log.service.ts              ← NUEVO: mover lógica desde el controller
    │   ├── log.module.ts               ← Eliminar TypeOrmModule.forFeature, importar PrismaModule
    │   └── types/
    │       └── log.types.ts            ← NUEVO: interfaces del log
    │
    └── roles/
        ├── roles.controller.ts         ← NUEVO: endpoint GET /roles (consulta de roles)
        ├── roles.service.ts            ← NUEVO: lógica de roles
        ├── roles.module.ts             ← NUEVO: módulo completo
        └── dto/
            └── create-role.dto.ts      ← NUEVO: si se necesita crear roles
```

---

## Fase 1 — Corrección del `package.json` e Instalación de Dependencias Base

**Objetivo:** Asegurar que el proyecto tenga todas las dependencias de NestJS correctamente declaradas antes de cualquier migración.

**Problema detectado:** El `package.json` actual solo lista devDependencies (`@types/bcrypt`, `@types/node`, `typescript`, `tsc-watch`). No tiene listadas las dependencias de producción como `@nestjs/core`, `@nestjs/common`, `typeorm`, `@nestjs/jwt`, etc. Esto indica que el `package.json` está incompleto, aunque los paquetes estén físicamente en `node_modules`.

### Paso 1.1 — Auditar dependencias reales instaladas

- Ejecutar `npm list --depth=0` dentro de `BACKEND/` para obtener la lista exacta de paquetes instalados en `node_modules`.
- Comparar contra lo declarado en `package.json` para identificar qué paquetes faltan en el manifiesto.

### Paso 1.2 — Reconstruir el `package.json`

Reescribir el `package.json` para que refleje correctamente las dependencias. La estructura objetivo es:

```json
{
  "name": "lockerstudio-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch"
  },
  "dependencies": {
    "@nestjs/common": "^10.x",
    "@nestjs/core": "^10.x",
    "@nestjs/platform-express": "^10.x",
    "@nestjs/jwt": "^10.x",
    "@nestjs/passport": "^10.x",
    "@nestjs/config": "^3.x",
    "passport": "^0.7.x",
    "passport-jwt": "^4.x",
    "bcrypt": "^5.x",
    "class-validator": "^0.14.x",
    "class-transformer": "^0.5.x",
    "reflect-metadata": "^0.2.x",
    "rxjs": "^7.x"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.x",
    "@nestjs/schematics": "^10.x",
    "@types/bcrypt": "^5.x",
    "@types/node": "^20.x",
    "@types/passport-jwt": "^4.x",
    "typescript": "^5.x",
    "ts-node": "^10.x"
  }
}
```

> **Nota:** TypeORM y sus tipos (`@nestjs/typeorm`, `typeorm`, `pg`) se desinstalan en la Fase 2. NO se listan en el nuevo `package.json`.

---

## Fase 2 — Migración de ORM: TypeORM → Prisma

**Objetivo:** Reemplazar completamente TypeORM por Prisma como capa de acceso a la base de datos.

### Paso 2.1 — Desinstalar TypeORM y sus dependencias

Ejecutar dentro de `BACKEND/`:

```bash
npm uninstall typeorm @nestjs/typeorm pg
```

Paquetes a eliminar:
- `typeorm` — el ORM actual
- `@nestjs/typeorm` — el módulo de integración con NestJS
- `pg` — el driver de PostgreSQL para TypeORM (Prisma usa su propio driver)

### Paso 2.2 — Instalar Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client
```

- `prisma` (devDependency): CLI para generar migraciones y el cliente
- `@prisma/client` (dependency): cliente de acceso a datos que se usa en runtime

### Paso 2.3 — Inicializar Prisma

```bash
npx prisma init --datasource-provider postgresql
```

Este comando crea:
- `BACKEND/prisma/schema.prisma` — el esquema central de la base de datos
- Actualiza `.env` con la variable `DATABASE_URL`

### Paso 2.4 — Configurar la variable de entorno `DATABASE_URL`

Actualizar el archivo `.env` en `BACKEND/`:

```env
# Reemplazar las variables individuales por una sola DATABASE_URL para Prisma
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cex_LookerStudio?schema=public"

# Mantener JWT_SECRET
JWT_SECRET=supersecret
```

> Las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` son reemplazadas por `DATABASE_URL`. Si el `ConfigModule` las usa en otros lados, se revisará en cada módulo.

### Paso 2.5 — Escribir el `schema.prisma`

Basado en el análisis de las 5 entidades TypeORM actuales y el script SQL de creación de BD, el schema completo que se debe escribir en `BACKEND/prisma/schema.prisma` es:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Role {
  id             Int      @id @default(autoincrement())
  rolDescripcion String   @unique @map("rol_descripcion") @db.VarChar(50)

  usuarios  User[]
  reportes  Report[]

  @@map("cex_roles")
}

model User {
  id             Int      @id @default(autoincrement())
  nombreCompleto String   @map("nombre_completo") @db.VarChar(100)
  email          String   @unique @db.VarChar(150)
  passwordHash   String   @map("password_hash")
  rolId          Int      @map("rol_id")
  activo         Boolean  @default(true)
  fechaCreacion  DateTime @default(now()) @map("fecha_creacion") @db.Timestamptz

  rol            Role              @relation(fields: [rolId], references: [id])
  auditAccesses  AuditAccess[]
  logActivities  LogActivity[]

  @@map("cex_usuarios")
}

model Report {
  id            Int      @id @default(autoincrement())
  titulo        String   @db.VarChar(100)
  descripcion   String?
  urlIframe     String   @map("url_iframe")
  rolMinimoId   Int      @map("rol_minimo_id")
  activo        Boolean  @default(true)
  fechaRegistro DateTime @default(now()) @map("fecha_registro") @db.Timestamptz

  rolMinimo     Role     @relation(fields: [rolMinimoId], references: [id])

  @@map("cex_reportes")
}

model AuditAccess {
  id         Int      @id @default(autoincrement())
  usuarioId  Int      @map("usuario_id")
  fechaHora  DateTime @default(now()) @map("fecha_hora") @db.Timestamptz
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  userAgent  String?  @map("user_agent")

  usuario    User     @relation(fields: [usuarioId], references: [id])

  @@map("cex_auditoria_accesos")
}

model LogActivity {
  id        Int      @id @default(autoincrement())
  usuarioId Int      @map("usuario_id")
  accion    String   @db.VarChar(100)
  detalle   String?
  fechaHora DateTime @default(now()) @map("fecha_hora") @db.Timestamptz

  usuario   User     @relation(fields: [usuarioId], references: [id])

  @@map("cex_log_actividades")
}
```

**Mapeo TypeORM → Prisma — tabla de equivalencias:**

| TypeORM | Prisma | Notas |
|---------|--------|-------|
| `@Entity({ name: 'cex_...' })` | `@@map("cex_...")` | Mapeo al nombre real de la tabla |
| `@Column({ name: 'col_name' })` | `@map("col_name")` | Mapeo al nombre real de la columna |
| `@PrimaryGeneratedColumn()` | `@id @default(autoincrement())` | PK autoincremental |
| `@Column({ type: 'timestamptz' })` | `@db.Timestamptz` | Tipo con zona horaria |
| `@ManyToOne(() => Role)` | `@relation(fields: [...], references: [...])` | Relación de clave foránea |
| `@Column({ unique: true })` | `@unique` | Restricción de unicidad |
| `nullable: true` | `String?` (signo `?`) | Campo opcional |

### Paso 2.6 — Generar el cliente Prisma

```bash
npx prisma generate
```

Esto genera el cliente tipado en `node_modules/@prisma/client` basado en el schema.

### Paso 2.7 — Verificar la conexión con la base de datos existente

Como la base de datos ya existe (fue creada con el script SQL), NO se ejecutan migraciones destructivas. En su lugar:

```bash
npx prisma db pull
```

Esto introspecciona la BD existente y verifica que el `schema.prisma` escrito sea consistente con las tablas reales. Si hay diferencias, se corrigen en el schema.

> **Importante:** No ejecutar `npx prisma migrate dev` en este punto si la BD ya tiene datos de producción/prueba. Ese comando está reservado para cuando se necesiten cambios de esquema futuros.

### Paso 2.8 — Eliminar las carpetas de entidades TypeORM

Una vez que Prisma esté configurado y verificado, eliminar las siguientes carpetas y archivos que ya no tendrán uso:

- `src/users/entities/` — `user.entity.ts`
- `src/roles/entities/` — `role.entity.ts`
- `src/reports/entities/` — `report.entity.ts`
- `src/audit/entities/` — `audit-access.entity.ts`
- `src/log/entities/` — `log-activity.entity.ts`

---

## Fase 3 — Creación del Módulo Prisma (`PrismaModule` + `PrismaService`)

**Objetivo:** Crear un módulo centralizado y reutilizable que provea acceso a la base de datos mediante `PrismaClient` a todos los demás módulos.

### Paso 3.1 — Crear `src/prisma/prisma.service.ts`

El servicio extiende `PrismaClient` y gestiona el ciclo de vida de la conexión.

Contenido planificado:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Razón de `OnModuleInit` y `OnModuleDestroy`:** NestJS llama a estos hooks automáticamente al iniciar y apagar la aplicación, garantizando que la conexión a PostgreSQL se abra y se cierre correctamente sin fugas de conexiones.

### Paso 3.2 — Crear `src/prisma/prisma.module.ts`

El módulo se configura como `@Global()` para que esté disponible en toda la aplicación sin necesidad de importarlo en cada módulo.

Contenido planificado:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Razón de `@Global()`:** Los módulos `auth`, `users`, `reports`, `audit` y `log` necesitan `PrismaService`. Hacerlo global evita importar `PrismaModule` en cada uno de ellos — solo se importa una vez en `AppModule`.

### Paso 3.3 — Registrar `PrismaModule` en `app.module.ts`

El `AppModule` se simplifica eliminando toda la configuración de TypeORM e importando `PrismaModule`:

```typescript
// Configuración objetivo de app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,       // ← Reemplaza TypeOrmModule.forRoot(...)
    AuthModule,
    UsersModule,
    ReportsModule,
    LogModule,
    AuditModule,
    RolesModule,        // ← Módulo nuevo que se agrega
  ],
})
export class AppModule {}
```

Cambios respecto al estado actual:
- Se elimina: `TypeOrmModule.forRoot({ ... })` con toda su configuración
- Se elimina: todos los imports de entidades (`User`, `Role`, `Report`, etc.) en `AppModule`
- Se agrega: `PrismaModule`
- Se agrega: `RolesModule` (módulo nuevo)

---

## Fase 4 — Refactorización a Arquitectura Modular Estricta

**Objetivo:** Cada módulo debe seguir el patrón Controller → Service → PrismaService. Los controladores solo manejan HTTP; la lógica de negocio vive en los servicios.

---

### Módulo: `auth`

**Estado actual:** El `auth.service.ts` inyecta directamente dos repositorios TypeORM (`Repository<User>` y `Repository<AuditAccess>`). El `auth.module.ts` importa `TypeOrmModule.forFeature([User, AuditAccess])`.

**Cambios planificados:**

**`auth.service.ts`** — Reemplazar inyección de repositorios:

```typescript
// ANTES
@InjectRepository(User) private userRepository: Repository<User>
@InjectRepository(AuditAccess) private auditAccessRepository: Repository<AuditAccess>

// DESPUÉS
constructor(private readonly prisma: PrismaService, ...) {}

// Ejemplo de equivalencia de consultas:
// ANTES: this.userRepository.findOne({ where: { email, activo: true } })
// DESPUÉS: this.prisma.user.findFirst({ where: { email, activo: true } })

// ANTES: this.auditAccessRepository.save({ usuarioId, ipAddress, userAgent })
// DESPUÉS: this.prisma.auditAccess.create({ data: { usuarioId, ipAddress, userAgent } })
```

**`auth.module.ts`** — Simplificar imports:

```typescript
// ANTES: imports: [TypeOrmModule.forFeature([User, AuditAccess]), PassportModule, JwtModule...]
// DESPUÉS: imports: [PassportModule, JwtModule...]
// PrismaService se inyecta automáticamente porque PrismaModule es @Global()
```

**Archivos sin cambios:** `auth.controller.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`, `admin.guard.ts`, `dto/login.dto.ts`

---

### Módulo: `users`

**Estado actual:** `UsersController` inyecta `Repository<User>` directamente y hace operaciones de base de datos dentro del método `create()`. No existe `users.service.ts`.

**Cambios planificados:**

**Crear `users.service.ts`** (archivo nuevo):

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        email: dto.email,
        passwordHash: hash,
        rolId: dto.rolId,
        activo: dto.activo ?? true,
      },
    });
    return { message: 'Usuario creado exitosamente' };
  }
}
```

**Refactorizar `users.controller.ts`** — Solo delegar al servicio:

```typescript
// ANTES: El controller inyecta Repository<User> y hace bcrypt + save
// DESPUÉS: El controller solo recibe el request y llama al servicio
@Post()
@UseGuards(JwtAuthGuard, AdminGuard)
async create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

**Actualizar `users.module.ts`**:

```typescript
// ANTES: imports: [TypeOrmModule.forFeature([User])], controllers: [UsersController]
// DESPUÉS:
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

---

### Módulo: `reports`

**Estado actual:** `ReportsController` inyecta `Repository<Report>` directamente, usa QueryBuilder de TypeORM, y crea/guarda reportes dentro del controller. No existe `reports.service.ts`.

**Cambios planificados:**

**Crear `reports.service.ts`** (archivo nuevo):

```typescript
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRole(rolId: number) {
    // Equivalente al QueryBuilder de TypeORM:
    // WHERE rol_minimo_id <= rolId AND activo = true
    return this.prisma.report.findMany({
      where: {
        rolMinimoId: { lte: rolId },
        activo: true,
      },
    });
  }

  async create(dto: CreateReportDto) {
    await this.prisma.report.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        urlIframe: dto.urlIframe,
        rolMinimoId: dto.rolMinimoId,
        activo: dto.activo ?? true,
      },
    });
    return { message: 'Reporte creado exitosamente' };
  }
}
```

**Refactorizar `reports.controller.ts`** — Solo delegar al servicio:

```typescript
@Get()
async findAll(@Req() req: any) {
  return this.reportsService.findByRole(req.user.rol_id);
}

@Post()
@UseGuards(AdminGuard)
async create(@Body() createReportDto: CreateReportDto) {
  return this.reportsService.create(createReportDto);
}
```

**Actualizar `reports.module.ts`**:

```typescript
@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
```

---

### Módulo: `audit`

**Estado actual:** `audit.module.ts` existe pero solo registra la entidad TypeORM. No hay controller ni service. La lógica de auditoría (registrar accesos) vive en `auth.service.ts`.

**Cambios planificados:**

**Crear `audit.service.ts`** (archivo nuevo):

```typescript
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAccess(usuarioId: number, ipAddress: string, userAgent: string) {
    return this.prisma.auditAccess.create({
      data: { usuarioId, ipAddress, userAgent },
    });
  }

  async findAll() {
    return this.prisma.auditAccess.findMany({
      orderBy: { fechaHora: 'desc' },
      include: { usuario: { select: { nombreCompleto: true, email: true } } },
    });
  }
}
```

**Crear `audit.controller.ts`** (archivo nuevo):

```typescript
@Controller('audit')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll() {
    return this.auditService.findAll();
  }
}
```

**Actualizar `audit.module.ts`**:

```typescript
@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],  // Exportado para que auth.service.ts lo use
})
export class AuditModule {}
```

> **Decisión arquitectural:** En vez de que `auth.service.ts` acceda directamente a `prisma.auditAccess`, se inyectará `AuditService` en `AuthService`. Esto respeta los límites de dominio — el módulo `audit` es el único responsable de los registros de auditoría.

**Crear `audit/types/audit.types.ts`** (archivo nuevo):

```typescript
export interface AuditAccessRecord {
  usuarioId: number;
  ipAddress?: string;
  userAgent?: string;
}
```

---

### Módulo: `log`

**Estado actual:** `LogController` inyecta `Repository<LogActivity>` directamente. No existe `log.service.ts`. El endpoint `GET /logs` solo devuelve todos los registros sin filtrado por rol.

**Cambios planificados:**

**Crear `log.service.ts`** (archivo nuevo):

```typescript
@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.logActivity.findMany({
      orderBy: { fechaHora: 'desc' },
      include: { usuario: { select: { nombreCompleto: true, email: true } } },
    });
  }

  async register(usuarioId: number, accion: string, detalle?: string) {
    return this.prisma.logActivity.create({
      data: { usuarioId, accion, detalle },
    });
  }
}
```

**Refactorizar `log.controller.ts`**:

```typescript
@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  findAll() {
    return this.logService.findAll();
  }
}
```

**Actualizar `log.module.ts`**:

```typescript
@Module({
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],  // Exportado para uso futuro en otros módulos
})
export class LogModule {}
```

**Crear `log/types/log.types.ts`** (archivo nuevo):

```typescript
export interface LogActivityRecord {
  usuarioId: number;
  accion: string;
  detalle?: string;
}
```

---

### Módulo: `roles` (Módulo Nuevo)

**Estado actual:** Solo existe `src/roles/entities/role.entity.ts`. No hay `roles.module.ts`, ni controller, ni service.

**Cambios planificados:**

**Crear `roles.service.ts`** (archivo nuevo):

```typescript
@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany();
  }
}
```

**Crear `roles.controller.ts`** (archivo nuevo):

```typescript
@Controller('roles')
@UseGuards(JwtAuthGuard, AdminGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
```

**Crear `roles.module.ts`** (archivo nuevo):

```typescript
@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
```

> La entidad `role.entity.ts` se elimina junto con las demás entidades TypeORM en la Fase 2, Paso 2.8.

---

## Fase 5 — Mejoras Transversales

**Objetivo:** Aplicar mejores prácticas de NestJS que actualmente faltan en el proyecto.

### Paso 5.1 — Configurar `ValidationPipe` global en `main.ts`

Actualmente los DTOs tienen decoradores de `class-validator` (`@IsEmail`, `@IsString`, etc.) pero el pipe no está configurado, por lo que las validaciones nunca se ejecutan.

```typescript
// Configuración objetivo de main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // Elimina propiedades no declaradas en el DTO
    forbidNonWhitelisted: true, // Rechaza requests con propiedades extra
    transform: true,      // Convierte tipos automáticamente (ej: string → number)
  }));
  await app.listen(3000);
  console.log('Servidor corriendo en http://localhost:3000');
}
```

### Paso 5.2 — Crear `auth/dto/login.dto.ts` y usarlo en el controller

El `LoginDto` existe pero el controller no lo usa — recibe `@Body() body: { email: string; password: string }` manualmente.

```typescript
// ANTES en auth.controller.ts
@Post('login')
async login(@Body() body: { email: string; password: string }, @Req() req: any)

// DESPUÉS
@Post('login')
async login(@Body() loginDto: LoginDto, @Req() req: any)
```

### Paso 5.3 — Refactorizar `auth.module.ts` para inyectar `AuditModule`

Para respetar los límites de dominio (ver decisión en módulo `audit`):

```typescript
@Module({
  imports: [
    AuditModule,   // ← Para poder inyectar AuditService en AuthService
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## Resumen de Archivos por Acción

| Archivo | Acción | Fase |
|---------|--------|------|
| `BACKEND/package.json` | Reescribir con dependencias correctas | Fase 1 |
| `BACKEND/prisma/schema.prisma` | Crear nuevo | Fase 2 |
| `BACKEND/.env` | Agregar `DATABASE_URL`, conservar `JWT_SECRET` | Fase 2 |
| `src/*/entities/*.entity.ts` (5 archivos) | Eliminar | Fase 2 |
| `src/prisma/prisma.service.ts` | Crear nuevo | Fase 3 |
| `src/prisma/prisma.module.ts` | Crear nuevo | Fase 3 |
| `src/app.module.ts` | Modificar: quitar TypeORM, agregar PrismaModule + RolesModule | Fase 3 |
| `src/main.ts` | Modificar: agregar ValidationPipe | Fase 5 |
| `src/auth/auth.service.ts` | Modificar: reemplazar repos TypeORM por PrismaService + AuditService | Fase 4 |
| `src/auth/auth.module.ts` | Modificar: quitar TypeOrmModule, agregar AuditModule | Fase 4 / 5 |
| `src/auth/auth.controller.ts` | Modificar: usar LoginDto | Fase 5 |
| `src/users/users.service.ts` | Crear nuevo | Fase 4 |
| `src/users/users.controller.ts` | Modificar: delegar a UsersService | Fase 4 |
| `src/users/users.module.ts` | Modificar: quitar TypeOrmModule, agregar UsersService | Fase 4 |
| `src/reports/reports.service.ts` | Crear nuevo | Fase 4 |
| `src/reports/reports.controller.ts` | Modificar: delegar a ReportsService | Fase 4 |
| `src/reports/reports.module.ts` | Modificar: quitar TypeOrmModule, agregar ReportsService | Fase 4 |
| `src/audit/audit.service.ts` | Crear nuevo | Fase 4 |
| `src/audit/audit.controller.ts` | Crear nuevo | Fase 4 |
| `src/audit/audit.module.ts` | Modificar: quitar TypeOrmModule, agregar service/controller | Fase 4 |
| `src/audit/types/audit.types.ts` | Crear nuevo | Fase 4 |
| `src/log/log.service.ts` | Crear nuevo | Fase 4 |
| `src/log/log.controller.ts` | Modificar: delegar a LogService | Fase 4 |
| `src/log/log.module.ts` | Modificar: quitar TypeOrmModule, agregar LogService | Fase 4 |
| `src/log/types/log.types.ts` | Crear nuevo | Fase 4 |
| `src/roles/roles.service.ts` | Crear nuevo | Fase 4 |
| `src/roles/roles.controller.ts` | Crear nuevo | Fase 4 |
| `src/roles/roles.module.ts` | Crear nuevo | Fase 4 |

---

## Endpoints del Backend tras la Refactorización

| Método | Ruta | Guard | Descripción |
|--------|------|-------|-------------|
| `POST` | `/auth/login` | Ninguno | Login con email y contraseña |
| `POST` | `/users` | JWT + Admin | Crear nuevo usuario |
| `GET` | `/reports` | JWT | Listar reportes accesibles según el rol del usuario |
| `POST` | `/reports` | JWT + Admin | Crear nuevo reporte |
| `GET` | `/logs` | JWT | Listar actividades del sistema |
| `GET` | `/audit` | JWT + Admin | Listar accesos registrados |
| `GET` | `/roles` | JWT + Admin | Listar roles disponibles |

---

## Orden de Ejecución Recomendado

```
Fase 1  →  Fase 2  →  Fase 3  →  Fase 4 (módulos en orden: prisma → auth → users → reports → audit → log → roles)  →  Fase 5
```

Cada fase debe completarse y verificarse (compilar sin errores con `npm run build`) antes de avanzar a la siguiente.

---

*Documento generado el 2026-03-26. Pendiente de aprobación antes de ejecutar cualquier cambio.*
