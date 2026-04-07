# Plan de Correcciones Criticas - Data Room CEX

**Fecha de elaboracion:** 31/03/2026  
**Estado:** Pendiente de aprobacion  
**Alcance:** Backend (NestJS/Prisma) + Frontend (Next.js/Tailwind)

---

## Resumen Ejecutivo

Este plan aborda 3 fases de correcciones criticas:
1. **Vulnerabilidades de seguridad y entorno** (Backend)
2. **Proteccion de infraestructura y trazabilidad** (Backend)
3. **UX/UI critica y responsividad** (Frontend)

Cada fase es independiente y ejecutable por separado.

---

## FASE 1: Vulnerabilidades de Seguridad y Entorno (Backend)

### 1.1 JWT_SECRET Robusto

**Problema actual:**
- En `src/auth/jwt.strategy.ts` (linea 11): `secretOrKey: process.env.JWT_SECRET || 'supersecret'` — fallback inseguro
- En `src/auth/auth.module.ts` (linea 12): `secret: process.env.JWT_SECRET || 'supersecret'` — mismo fallback
- En `BACKEND/.env` (linea 2): `JWT_SECRET=supersecret` — secreto debil

**Archivos a modificar:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `BACKEND/src/auth/jwt.strategy.ts` | Inyectar `ConfigService`, obtener `JWT_SECRET` con validacion obligatoria, eliminar fallback `'supersecret'` |
| 2 | `BACKEND/src/auth/auth.module.ts` | Cambiar `JwtModule.register()` por `JwtModule.registerAsync()` con `ConfigService` para leer `JWT_SECRET` de forma segura |
| 3 | `BACKEND/.env` | Reemplazar `supersecret` por un secreto generado con `crypto.randomBytes(64).toString('hex')` (128 caracteres hex) |

**Enfoque tecnico para `jwt.strategy.ts`:**
```
ANTES (linea 7-12):
  constructor() {
    super({
      ...
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

DESPUES:
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no esta configurado en las variables de entorno');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
```

**Enfoque tecnico para `auth.module.ts`:**
```
ANTES (linea 11-14):
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'supersecret',
    signOptions: { expiresIn: '8h' },
  }),

DESPUES:
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '8h' },
    }),
  }),
```

**Impacto:** Elimina completamente el fallback inseguro. La aplicacion NO arranca si `JWT_SECRET` no esta definido.

---

### 1.2 Proteccion de Variables de Entorno

**Problema actual:**
- El `.gitignore` raiz (lineas 19-25) YA excluye `.env` y `**/.env` — esto esta correcto
- No existe un archivo `.env.example` que sirva de referencia para nuevos desarrolladores

**Archivos a crear:**

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `BACKEND/.env.example` | Crear archivo template con claves vacias y comentarios |

**Contenido del `.env.example`:**
```
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@host:5432/nombre_bd?schema=public"

# Secreto para firma de JWT (generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=

# Puerto del servidor (default: 3001)
PORT=3001

# Origenes permitidos para CORS (separados por coma)
CORS_ORIGIN=http://localhost:3000
```

**Verificacion adicional:** Confirmar que el `.env` actual no esta trackeado en git revisando con `git ls-files --cached .env`.

---

### 1.3 Validacion Anti-XSS en URL del Iframe

**Problema actual:**
- En `src/reports/dto/create-report.dto.ts` (lineas 11-12): `urlIframe` solo valida `@IsString()` sin verificar formato
- En `src/reports/dto/update-report.dto.ts` (lineas 8-10): Mismo problema
- Un atacante podria enviar `javascript:alert(1)` o una URL HTTP maliciosa directamente a la API

**Archivos a modificar:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `BACKEND/src/reports/dto/create-report.dto.ts` | Reemplazar `@IsString()` en `urlIframe` por `@Matches(/^https:\/\//)` con mensaje descriptivo |
| 2 | `BACKEND/src/reports/dto/update-report.dto.ts` | Mismo cambio para `urlIframe` |

**Enfoque tecnico para `create-report.dto.ts`:**
```
ANTES (lineas 11-12):
  @IsString()
  urlIframe: string;

DESPUES:
  @IsString()
  @Matches(/^https:\/\//, {
    message: 'La URL del iframe debe comenzar con https://',
  })
  urlIframe: string;
```

**Nota sobre `@IsUrl()`:** Se descarta `@IsUrl()` porque es demasiado permisivo (acepta `http://`, `ftp://`, etc.). Se usa `@Matches()` con regex explicito para forzar HTTPS obligatorio, alineado con la validacion que ya existe en el frontend (Zod: `startsWith('https://')`).

**Import adicional:** Agregar `Matches` al import de `class-validator` en ambos DTOs.

---

## FASE 2: Proteccion de Infraestructura y Trazabilidad (Backend)

### 2.1 Rate Limiting

**Problema actual:** No existe limite de peticiones en ningun endpoint. El login es vulnerable a fuerza bruta.

**Dependencia a instalar:**
```bash
npm install @nestjs/throttler
```

**Archivos a modificar:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `BACKEND/src/app.module.ts` | Importar `ThrottlerModule.forRoot()` con configuracion global (60s ventana, 30 peticiones) |
| 2 | `BACKEND/src/main.ts` | Registrar `ThrottlerGuard` como guard global con `APP_GUARD` |
| 3 | `BACKEND/src/auth/auth.controller.ts` | Agregar `@Throttle({ default: { limit: 5, ttl: 60000 } })` al endpoint de login (5 intentos por minuto) |

**Enfoque tecnico para `app.module.ts`:**
```
ANTES (linea 11-21):
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ...
  ],

DESPUES:
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minuto
      limit: 30,    // 30 peticiones por minuto (global)
    }]),
    PrismaModule,
    AuthModule,
    ...
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
```

**Enfoque tecnico para `auth.controller.ts`:**
```
ANTES (linea 9):
  @Post('login')

DESPUES:
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
```

Esto limita el endpoint de login a **5 intentos por minuto por IP**, mientras que el resto de endpoints tiene un limite global de 30 peticiones/minuto.

---

### 2.2 Logging Estructurado con Persistencia en Base de Datos

**Problema actual:**
- La tabla `cex_log_actividades` existe pero **no se usa activamente** (confirmado por el usuario en su nota al documento `06_log_actividades.md`)
- El `LogService` tiene un metodo `register()` listo pero nadie lo invoca
- No se registran intentos fallidos de login, errores 500, ni acciones administrativas

**Este es el cambio mas complejo. Se divide en sub-pasos:**

#### 2.2.1 Adaptar el modelo de datos (si es necesario)

**Archivo:** `BACKEND/prisma/schema.prisma`

**Evaluacion:** El modelo actual de `LogActivity` tiene:
- `usuarioId` (Int, FK obligatoria) — **Problema:** los intentos fallidos de login y errores 500 no tienen un usuario identificado
- `accion` (VarChar(100)) — Suficiente
- `detalle` (String?, opcional) — Suficiente
- `fechaHora` (Timestamptz, default now) — Suficiente

**Cambio necesario:** Hacer `usuarioId` **opcional** para soportar eventos del sistema sin usuario autenticado (login fallido, errores 500):

```
ANTES:
  usuarioId Int @map("usuario_id")

DESPUES:
  usuarioId Int? @map("usuario_id")
```

**Tambien agregar un campo `nivel` para clasificar severidad:**

```prisma
model LogActivity {
  id        Int      @id @default(autoincrement())
  usuarioId Int?     @map("usuario_id")     // Opcional: null para eventos sin usuario
  accion    String   @db.VarChar(100)
  detalle   String?
  nivel     String   @default("INFO") @db.VarChar(20)  // INFO, WARN, ERROR
  fechaHora DateTime @default(now()) @map("fecha_hora") @db.Timestamptz

  usuario User? @relation(fields: [usuarioId], references: [id])  // Opcional

  @@index([fechaHora])
  @@index([nivel])
  @@map("cex_log_actividades")
}
```

**Post-cambio:** Ejecutar `npx prisma migrate dev --name add-log-nivel-and-optional-user` para generar la migracion.

**Actualizar tambien:**
- `src/log/types/log.types.ts` — Agregar campo `nivel` al tipo `LogActivityRecord` y hacer `usuarioId` opcional
- `src/log/log.service.ts` — Actualizar `register()` para aceptar `nivel`

#### 2.2.2 Crear el Interceptor Global de Logging

**Archivo a crear:** `BACKEND/src/common/interceptors/logging.interceptor.ts`

**Enfoque tecnico:**

```typescript
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
        this.logger.log(`${method} ${url} ${ms}ms`);
      }),
      catchError((error) => {
        const ms = Date.now() - now;
        const status = error?.status || 500;

        // Registrar errores 500 en BD
        if (status >= 500) {
          this.logService.register({
            usuarioId: user?.userId ?? null,
            accion: 'ERROR_500',
            detalle: `${method} ${url} — ${error.message}`,
            nivel: 'ERROR',
          });
        }

        this.logger.error(`${method} ${url} ${status} ${ms}ms`);
        throw error;
      }),
    );
  }
}
```

#### 2.2.3 Registrar Acciones Administrativas

**Archivos a modificar:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `BACKEND/src/users/users.module.ts` | Importar `LogModule` |
| 2 | `BACKEND/src/users/users.service.ts` | Inyectar `LogService`, llamar `register()` en `create()`, `update()`, `toggleActivo()`, `remove()` |
| 3 | `BACKEND/src/reports/reports.module.ts` | Importar `LogModule` |
| 4 | `BACKEND/src/reports/reports.service.ts` | Inyectar `LogService`, llamar `register()` en `create()`, `update()`, `toggleActivo()`, `remove()` |

**Enfoque tecnico para `users.service.ts` (ejemplo en `create`):**
```
ANTES:
  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({ ... });
    return { message: 'Usuario creado exitosamente' };
  }

DESPUES:
  async create(dto: CreateUserDto, executorId: number) {
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({ ... });
    await this.logService.register({
      usuarioId: executorId,
      accion: 'CREAR_USUARIO',
      detalle: `Usuario creado: ${dto.email}`,
      nivel: 'INFO',
    });
    return { message: 'Usuario creado exitosamente' };
  }
```

**Nota:** Los metodos del servicio necesitaran recibir `executorId` (ID del usuario que ejecuta la accion). Este se obtiene de `req.user.userId` en el controller y se pasa como parametro.

**Archivos de controller a modificar para pasar `executorId`:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `BACKEND/src/users/users.controller.ts` | Agregar `@Req() req` a los metodos create, update, toggleActivo, remove y pasar `req.user.userId` al servicio |
| 2 | `BACKEND/src/reports/reports.controller.ts` | Mismo cambio para create, update, toggleActivo, remove |

#### 2.2.4 Registrar Intentos Fallidos de Login

**Archivo a modificar:** `BACKEND/src/auth/auth.service.ts`

**Enfoque tecnico:**
```
ANTES (lineas 22-28):
  if (!user) {
    throw new UnauthorizedException('Credenciales incorrectas');
  }
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw new UnauthorizedException('Credenciales incorrectas');
  }

DESPUES:
  if (!user) {
    await this.logService.register({
      usuarioId: null,
      accion: 'LOGIN_FALLIDO',
      detalle: `Intento fallido para email: ${email} (usuario no encontrado)`,
      nivel: 'WARN',
    });
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    await this.logService.register({
      usuarioId: user.id,
      accion: 'LOGIN_FALLIDO',
      detalle: `Intento fallido para email: ${email} (password incorrecto)`,
      nivel: 'WARN',
    });
    throw new UnauthorizedException('Credenciales incorrectas');
  }
```

**Archivo adicional:** `BACKEND/src/auth/auth.module.ts` — Importar `LogModule` para que `LogService` este disponible en `AuthService`.

#### 2.2.5 Registrar el Interceptor Global

**Archivo:** `BACKEND/src/main.ts`

```
AGREGAR despues de useGlobalPipes:
  const logService = app.get(LogService);
  app.useGlobalInterceptors(new LoggingInterceptor(logService));
```

#### 2.2.6 Resumen de archivos de la Fase 2.2

| # | Archivo | Tipo | Cambio |
|:-:|---------|------|--------|
| 1 | `prisma/schema.prisma` | Modificar | `usuarioId` opcional, agregar campo `nivel`, agregar indices |
| 2 | `src/log/types/log.types.ts` | Modificar | Agregar `nivel`, hacer `usuarioId` opcional |
| 3 | `src/log/log.service.ts` | Modificar | Actualizar `register()` para el nuevo campo `nivel` |
| 4 | `src/common/interceptors/logging.interceptor.ts` | Crear | Interceptor global HTTP |
| 5 | `src/main.ts` | Modificar | Registrar interceptor global |
| 6 | `src/auth/auth.module.ts` | Modificar | Importar LogModule |
| 7 | `src/auth/auth.service.ts` | Modificar | Inyectar LogService, registrar logins fallidos |
| 8 | `src/users/users.module.ts` | Modificar | Importar LogModule |
| 9 | `src/users/users.service.ts` | Modificar | Inyectar LogService, registrar acciones CRUD |
| 10 | `src/users/users.controller.ts` | Modificar | Pasar `req.user.userId` a los metodos del servicio |
| 11 | `src/reports/reports.module.ts` | Modificar | Importar LogModule |
| 12 | `src/reports/reports.service.ts` | Modificar | Inyectar LogService, registrar acciones CRUD |
| 13 | `src/reports/reports.controller.ts` | Modificar | Pasar `req.user.userId` a los metodos del servicio |

#### Eventos que se registraran

| Accion | Nivel | usuarioId | Detalle |
|--------|:-----:|:---------:|---------|
| `LOGIN_EXITOSO` | INFO | Si | "Login exitoso: email" |
| `LOGIN_FALLIDO` | WARN | Opcional | "Intento fallido para email: X (razon)" |
| `CREAR_USUARIO` | INFO | Si | "Usuario creado: email" |
| `ACTUALIZAR_USUARIO` | INFO | Si | "Usuario actualizado: id" |
| `TOGGLE_USUARIO` | INFO | Si | "Usuario id: activado/desactivado" |
| `DESACTIVAR_USUARIO` | INFO | Si | "Usuario desactivado: id" |
| `CREAR_REPORTE` | INFO | Si | "Reporte creado: titulo" |
| `ACTUALIZAR_REPORTE` | INFO | Si | "Reporte actualizado: id" |
| `TOGGLE_REPORTE` | INFO | Si | "Reporte id: activado/desactivado" |
| `DESACTIVAR_REPORTE` | INFO | Si | "Reporte desactivado: id" |
| `ERROR_500` | ERROR | Opcional | "METHOD /url — mensaje de error" |

---

## FASE 3: UX/UI Critica y Responsividad (Frontend)

### 3.1 Confirmaciones de Acciones Destructivas

**Problema actual:** Los toggles de activar/desactivar en UserTable y ReportTable se ejecutan inmediatamente sin confirmacion.

**Archivos a crear/modificar:**

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/src/components/ui/ConfirmDialog.tsx` | **Crear** — Componente de dialogo de confirmacion reutilizable |
| 2 | `frontend/src/components/admin/UserTable.tsx` | Modificar — Envolver `toggleActivo` con ConfirmDialog |
| 3 | `frontend/src/components/admin/ReportTable.tsx` | Modificar — Envolver `toggleActivo` con ConfirmDialog |

**Enfoque tecnico del `ConfirmDialog.tsx`:**

```
Props:
  isOpen: boolean
  title: string (ej: "Confirmar accion")
  message: string (ej: "¿Desactivar al usuario Juan Perez?")
  confirmLabel: string (ej: "Desactivar")
  confirmVariant: 'danger' | 'warning' (color del boton)
  onConfirm: () => void
  onCancel: () => void

Estructura visual:
  - Overlay oscuro (reutiliza patron del Modal existente)
  - Icono de advertencia (AlertTriangle de Lucide)
  - Titulo en negrita
  - Mensaje descriptivo
  - Dos botones: [Cancelar] (gris) + [Confirmar] (rojo/amarillo segun variant)
  - Soporte para Escape y click fuera
  - Area minima tactil de 44x44px en los botones
```

**Enfoque en UserTable.tsx:**
```
ANTES:
  onClick={() => toggleActivo(user.id)}

DESPUES:
  1. Al hacer click en el toggle, se abre el ConfirmDialog con:
     title: "Confirmar cambio de estado"
     message: `¿Deseas ${user.activo ? 'desactivar' : 'activar'} al usuario ${user.nombreCompleto}?`
  2. Solo al confirmar se ejecuta toggleActivo(user.id)
```

---

### 3.2 Manejo de Errores de API Detallado

**Problema actual:**
- Los errores 400 (validacion) del backend retornan un array de mensajes pero el frontend no los desglosa por campo
- Los errores de mutacion en tablas se silencian o muestran mensajes genericos

**Archivos a modificar:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `frontend/src/components/admin/UserForm.tsx` | Capturar errores 400 y mapear mensajes del backend a campos del formulario usando `setError()` de react-hook-form |
| 2 | `frontend/src/components/admin/ReportForm.tsx` | Mismo enfoque |
| 3 | `frontend/src/hooks/useUsers.ts` | Retornar errores de mutacion al componente llamador |
| 4 | `frontend/src/hooks/useAdminReports.ts` | Mismo enfoque |

**Enfoque tecnico para UserForm.tsx:**
```
ANTES (en handleSubmit):
  try {
    await onSubmit(payload);
  } catch { ... }

DESPUES:
  try {
    await onSubmit(payload);
  } catch (err) {
    const messages = err?.response?.data?.message;
    if (Array.isArray(messages)) {
      // Mapear errores del backend a campos del formulario
      messages.forEach((msg: string) => {
        if (msg.includes('email')) setError('email', { message: msg });
        else if (msg.includes('password')) setError('password', { message: msg });
        else setError('root', { message: msg });
      });
    } else {
      setError('root', { message: typeof messages === 'string' ? messages : 'Error al procesar la solicitud' });
    }
  }
```

---

### 3.3 Notificaciones Globales (Toast)

**Problema actual:** Solo UserForm muestra un banner de exito. Las demas acciones (toggle, delete, create reporte) no dan feedback visual.

**Dependencia a instalar:**
```bash
npm install sonner
```

**Nota:** Se elige `sonner` sobre Shadcn/ui toast porque: (1) el proyecto no usa Shadcn actualmente, (2) sonner es mas ligero y no requiere instalar toda la suite Shadcn, (3) API mas simple (`toast.success('mensaje')`). Sin embargo, si se prefiere Shadcn, el enfoque es equivalente.

**Archivos a crear/modificar:**

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/src/components/Providers.tsx` | Modificar — Agregar `<Toaster />` de sonner como hijo del provider raiz |
| 2 | `frontend/src/hooks/useUsers.ts` | Modificar — Agregar `toast.success()` en `onSuccess` y `toast.error()` en `onError` de cada mutacion |
| 3 | `frontend/src/hooks/useAdminReports.ts` | Mismo enfoque |
| 4 | `frontend/src/components/admin/UserForm.tsx` | Modificar — Reemplazar banner de exito por `toast.success('Usuario creado')` |
| 5 | `frontend/src/components/admin/ReportForm.tsx` | Modificar — Agregar `toast.success()` al completar accion |

**Enfoque tecnico para `Providers.tsx`:**
```
AGREGAR import:
  import { Toaster } from 'sonner';

AGREGAR dentro del return, como ultimo hijo:
  <Toaster position="top-right" richColors closeButton />
```

**Enfoque tecnico para `useUsers.ts` (ejemplo en createUser):**
```
ANTES:
  const createUser = useMutation({
    mutationFn: (payload) => api.post('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

DESPUES:
  const createUser = useMutation({
    mutationFn: (payload) => api.post('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error) => {
      const msg = error?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Error al crear usuario');
    },
  });
```

**Mensajes de toast por accion:**

| Hook | Mutacion | Exito | Error |
|------|----------|-------|-------|
| useUsers | createUser | "Usuario creado exitosamente" | "Error al crear usuario" |
| useUsers | updateUser | "Usuario actualizado exitosamente" | "Error al actualizar usuario" |
| useUsers | toggleActivo | "Estado del usuario actualizado" | "Error al cambiar estado" |
| useAdminReports | createReport | "Reporte creado exitosamente" | "Error al crear reporte" |
| useAdminReports | updateReport | "Reporte actualizado exitosamente" | "Error al actualizar reporte" |
| useAdminReports | toggleActivo | "Estado del reporte actualizado" | "Error al cambiar estado" |
| useAdminReports | deleteReport | "Reporte eliminado" | "Error al eliminar reporte" |

---

### 3.4 Tablas de Administracion Responsivas

**Problema actual:** Las tablas de UserTable, ReportTable y AuditTable muestran todas las columnas en mobile, provocando scroll horizontal excesivo sin indicadores visuales. Los botones de accion pueden ser dificiles de presionar en pantallas tactiles.

**Archivos a modificar:**

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `frontend/src/components/admin/UserTable.tsx` | Envolver tabla en contenedor responsive + indicador de scroll + area tactil minima |
| 2 | `frontend/src/components/admin/ReportTable.tsx` | Mismo enfoque |
| 3 | `frontend/src/components/admin/AuditTable.tsx` | Mismo enfoque |

**Enfoque tecnico — 3 cambios por tabla:**

#### A) Contenedor con overflow y indicador de scroll

```
ANTES:
  <table className="w-full text-sm">

DESPUES:
  {/* Contenedor responsive con indicador de scroll */}
  <div className="relative">
    {/* Indicador: sombra/gradiente a la derecha cuando hay contenido oculto */}
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-sidebar-hover to-transparent pointer-events-none z-10 sm:hidden" />

    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        <table className="w-full text-sm min-w-[640px]">
```

- `overflow-x-auto`: Habilita scroll horizontal
- `min-w-[640px]` en la tabla: Fuerza ancho minimo para evitar compresion
- Gradiente derecho visible solo en mobile (`sm:hidden`): Indica "desliza para ver mas"
- `-mx-4 sm:mx-0`: Extiende el contenedor al borde en mobile para aprovechar ancho

#### B) Ocultar columnas secundarias en mobile

**UserTable:**
```
- Columna ID: agregar clase `hidden sm:table-cell` al <th> y <td>
- Columna Fecha Creacion (si existe): agregar `hidden md:table-cell`
```

**ReportTable:**
```
- Columna ID: agregar `hidden sm:table-cell`
```

**AuditTable:**
```
- Columna Email: agregar `hidden md:table-cell`
- Columna Duracion: agregar `hidden sm:table-cell`
```

#### C) Area tactil minima de 44x44px

Todos los botones de accion (Editar, Toggle, Eliminar) deben tener un area minima de toque:

```
ANTES:
  <button className="p-1.5 ...">
    <Pencil className="w-4 h-4" />
  </button>

DESPUES:
  <button className="min-w-[44px] min-h-[44px] flex items-center justify-center ...">
    <Pencil className="w-4 h-4" />
  </button>
```

Aplicar en:
- Botones de editar (icono Pencil) en UserTable y ReportTable
- ToggleSwitch: el componente ya tiene `h-5 w-10` (sm) que es menor a 44px — envolver en contenedor de 44x44px
- Botones de paginacion: verificar que cumplan el minimo

---

## Resumen de Dependencias a Instalar

| Dependencia | Proyecto | Comando |
|-------------|----------|---------|
| `@nestjs/throttler` | BACKEND | `npm install @nestjs/throttler` |
| `sonner` | frontend | `npm install sonner` |

---

## Resumen de Archivos Afectados por Fase

### Fase 1 (5 archivos)
| Archivo | Accion |
|---------|--------|
| `BACKEND/.env` | Modificar (JWT_SECRET robusto) |
| `BACKEND/.env.example` | **Crear** |
| `BACKEND/src/auth/jwt.strategy.ts` | Modificar |
| `BACKEND/src/auth/auth.module.ts` | Modificar |
| `BACKEND/src/reports/dto/create-report.dto.ts` | Modificar |
| `BACKEND/src/reports/dto/update-report.dto.ts` | Modificar |

### Fase 2 (14 archivos)
| Archivo | Accion |
|---------|--------|
| `BACKEND/package.json` | Modificar (agregar @nestjs/throttler) |
| `BACKEND/src/app.module.ts` | Modificar (ThrottlerModule + provider) |
| `BACKEND/src/auth/auth.controller.ts` | Modificar (@Throttle en login) |
| `BACKEND/prisma/schema.prisma` | Modificar (LogActivity adaptado) |
| `BACKEND/src/log/types/log.types.ts` | Modificar |
| `BACKEND/src/log/log.service.ts` | Modificar |
| `BACKEND/src/common/interceptors/logging.interceptor.ts` | **Crear** |
| `BACKEND/src/main.ts` | Modificar |
| `BACKEND/src/auth/auth.module.ts` | Modificar (importar LogModule) |
| `BACKEND/src/auth/auth.service.ts` | Modificar (logins fallidos) |
| `BACKEND/src/users/users.module.ts` | Modificar |
| `BACKEND/src/users/users.service.ts` | Modificar |
| `BACKEND/src/users/users.controller.ts` | Modificar |
| `BACKEND/src/reports/reports.module.ts` | Modificar |
| `BACKEND/src/reports/reports.service.ts` | Modificar |
| `BACKEND/src/reports/reports.controller.ts` | Modificar |

### Fase 3 (9 archivos)
| Archivo | Accion |
|---------|--------|
| `frontend/package.json` | Modificar (agregar sonner) |
| `frontend/src/components/ui/ConfirmDialog.tsx` | **Crear** |
| `frontend/src/components/Providers.tsx` | Modificar (Toaster) |
| `frontend/src/components/admin/UserTable.tsx` | Modificar |
| `frontend/src/components/admin/ReportTable.tsx` | Modificar |
| `frontend/src/components/admin/AuditTable.tsx` | Modificar |
| `frontend/src/components/admin/UserForm.tsx` | Modificar |
| `frontend/src/components/admin/ReportForm.tsx` | Modificar |
| `frontend/src/hooks/useUsers.ts` | Modificar |
| `frontend/src/hooks/useAdminReports.ts` | Modificar |

---

## Orden de Ejecucion Recomendado

```
Fase 1 (Seguridad)        -> Sin dependencias, ejecutar primero
     |
Fase 2 (Infraestructura)  -> Depende de Fase 1 (auth.module.ts se modifica en ambas)
     |
Fase 3 (Frontend)         -> Independiente, puede ejecutarse en paralelo con Fase 2
```

**Total de archivos:** ~28 archivos (3 nuevos + ~25 modificados)

---

**Estado:** Esperando aprobacion para iniciar ejecucion fase por fase.
