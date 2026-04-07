# Arquitectura del Backend

**Framework:** NestJS 10.4.15  
**ORM:** Prisma 6.0.0  
**Base de datos:** PostgreSQL  
**Lenguaje:** TypeScript 5.7.3

---

## Stack Tecnologico

| Libreria | Version | Proposito |
|----------|---------|-----------|
| @nestjs/core | 10.4.15 | Framework backend modular |
| @nestjs/platform-express | 10.4.15 | Adaptador Express para NestJS |
| @nestjs/config | 3.3.0 | Gestion de variables de entorno |
| @nestjs/passport | 10.0.3 | Integracion con Passport.js |
| @nestjs/jwt | 10.2.0 | Manejo de JSON Web Tokens |
| @prisma/client | 6.0.0 | Cliente ORM para PostgreSQL |
| passport | 0.7.0 | Middleware de autenticacion |
| passport-jwt | 4.0.1 | Estrategia JWT para Passport |
| bcrypt | 5.1.1 | Hashing de contrasenas |
| class-validator | 0.14.1 | Validacion de DTOs con decoradores |
| class-transformer | 0.5.1 | Transformacion automatica de payloads |
| dotenv | 17.3.1 | Carga de variables de entorno |
| rxjs | 7.8.1 | Programacion reactiva |

---

## Estructura Modular

```
BACKEND/src/
  main.ts              -> Bootstrap: CORS, prefijo global, ValidationPipe, puerto
  app.module.ts         -> Modulo raiz, importa todos los modulos

  auth/                 -> Modulo de Autenticacion
    auth.controller.ts      Endpoint de login
    auth.service.ts         Validacion de credenciales y firma JWT
    auth.module.ts          Configuracion JWT y Passport
    jwt.strategy.ts         Estrategia de extraccion y validacion de token
    jwt-auth.guard.ts       Guard que valida presencia de JWT
    admin.guard.ts          Guard que valida rol administrador
    dto/
      login.dto.ts          DTO de login

  users/                -> Modulo de Usuarios
    users.controller.ts     5 endpoints CRUD
    users.service.ts        Logica de negocio con Prisma
    users.module.ts         Declaracion del modulo
    dto/
      create-user.dto.ts    DTO de creacion
      update-user.dto.ts    DTO de actualizacion
      list-users-query.dto.ts  DTO de query params

  reports/              -> Modulo de Reportes
    reports.controller.ts   7 endpoints CRUD + jerarquia
    reports.service.ts      Logica con soporte padre-hijo
    reports.module.ts       Declaracion del modulo
    dto/
      create-report.dto.ts  DTO de creacion
      update-report.dto.ts  DTO de actualizacion
      list-reports-query.dto.ts  DTO de query params

  roles/                -> Modulo de Roles
    roles.controller.ts     1 endpoint GET
    roles.service.ts        findAll()
    roles.module.ts         Declaracion del modulo

  audit/                -> Modulo de Auditoria
    audit.controller.ts     2 endpoints (GET + POST)
    audit.service.ts        Combina accesos y visualizaciones
    audit.module.ts         Declaracion del modulo
    dto/
      create-report-view.dto.ts  DTO de registro de visualizacion
    types/
      audit.types.ts        Tipos internos

  log/                  -> Modulo de Log de Actividades
    log.controller.ts       1 endpoint GET
    log.service.ts          Registro y consulta de actividades
    log.module.ts           Declaracion del modulo
    types/
      log.types.ts          Tipos internos

  prisma/               -> Modulo de Base de Datos
    prisma.service.ts       Wrapper de PrismaClient
    prisma.module.ts        Modulo global

  common/               -> DTOs Compartidos
    dto/
      pagination-query.dto.ts     DTO base de paginacion
      paginated-response.dto.ts   Estructura de respuesta paginada

  generated/prisma/     -> Cliente Prisma generado
```

---

## Configuracion del Bootstrap (main.ts)

**Archivo:** `src/main.ts`

### Orden de Inicializacion
1. **dotenv:** Carga variables de `.env` con ruta absoluta (`__dirname/../.env`)
2. **NestFactory.create(AppModule):** Inicializa la aplicacion
3. **setGlobalPrefix('api'):** Todas las rutas bajo `/api/*`
4. **enableCors():** CORS con origenes de `CORS_ORIGIN` env, `credentials: true`
5. **useGlobalPipes(ValidationPipe):** Validacion automatica en todos los endpoints
6. **app.listen(port):** Escucha en el puerto de `PORT` env (default: 3001)

### ValidationPipe Global
```typescript
new ValidationPipe({
  whitelist: true,           // Remueve propiedades no decoradas
  forbidNonWhitelisted: true, // Lanza error si envian campos extra
  transform: true,           // Transforma payloads a instancias de DTO
})
```

---

## App Module

**Archivo:** `src/app.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Variables de entorno globales
    PrismaModule,      // Base de datos (global)
    AuthModule,        // Autenticacion
    UsersModule,       // Gestion de usuarios
    ReportsModule,     // Gestion de reportes
    LogModule,         // Log de actividades
    AuditModule,       // Auditoria de accesos
    RolesModule,       // Listado de roles
  ],
})
```

---

## Variables de Entorno

| Variable | Requerida | Default | Descripcion |
|----------|:---------:|---------|-------------|
| `DATABASE_URL` | Si | - | URL de conexion a PostgreSQL |
| `JWT_SECRET` | Si | `'supersecret'` | Secreto para firmar JWT |
| `PORT` | No | `3001` | Puerto del servidor |
| `CORS_ORIGIN` | No | `['*']` | Origenes permitidos (separados por coma) |

---

## Mapa Completo de Endpoints

| Metodo | Ruta | Guards | Modulo |
|--------|------|--------|--------|
| POST | `/api/auth/login` | Ninguno | Auth |
| GET | `/api/users` | JWT + Admin | Users |
| POST | `/api/users` | JWT + Admin | Users |
| PUT | `/api/users/:id` | JWT + Admin | Users |
| PATCH | `/api/users/:id/toggle` | JWT + Admin | Users |
| DELETE | `/api/users/:id` | JWT + Admin | Users |
| GET | `/api/reports` | JWT | Reports |
| GET | `/api/reports/admin` | JWT + Admin | Reports |
| GET | `/api/reports/:id/children` | JWT + Admin | Reports |
| POST | `/api/reports` | JWT + Admin | Reports |
| PUT | `/api/reports/:id` | JWT + Admin | Reports |
| PATCH | `/api/reports/:id/toggle` | JWT + Admin | Reports |
| DELETE | `/api/reports/:id` | JWT + Admin | Reports |
| GET | `/api/logs` | JWT | Log |
| GET | `/api/audit` | JWT + Admin | Audit |
| POST | `/api/audit/report-time` | JWT | Audit |
| GET | `/api/roles` | JWT + Admin | Roles |
