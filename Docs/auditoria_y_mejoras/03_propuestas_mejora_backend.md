# Propuestas de Mejora: Backend

Clasificadas por prioridad de implementacion.

---

## Prioridad ALTA

### 1. Implementar Rate Limiting

**Problema:** No hay limite de peticiones. El endpoint de login es vulnerable a fuerza bruta.

**Solucion:**
```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60000,   // 1 minuto
  limit: 30,    // 30 peticiones por minuto (general)
}])

// auth.controller.ts
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos/min para login
@Post('login')
```

**Impacto:** Previene ataques de fuerza bruta y DoS basicos.

---

### 2. Robustecer JWT_SECRET

**Problema:** El secreto actual es `supersecret` con fallback hardcodeado.

**Solucion:**
1. Generar un secreto robusto:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. Establecer en `.env`:
   ```
   JWT_SECRET=a1b2c3d4e5f6....(64 chars hex)
   ```
3. Eliminar el fallback en `jwt.strategy.ts`:
   ```typescript
   secretOrKey: configService.get<string>('JWT_SECRET'),
   // Sin || 'supersecret'
   ```
4. Agregar validacion al inicio si `JWT_SECRET` no existe:
   ```typescript
   if (!process.env.JWT_SECRET) {
     throw new Error('JWT_SECRET is required');
   }
   ```

---

### 3. Agregar Logging Estructurado

**Problema:** Solo hay `console.log` en el bootstrap. No hay logging de errores, peticiones o eventos de seguridad.

**Solucion:** Implementar el Logger de NestJS o una libreria como `winston`:

```typescript
// Interceptor global de logging
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} ${Date.now() - now}ms`);
      }),
    );
  }
}
```

**Registrar especialmente:**
- Intentos fallidos de login (para detectar ataques)
- Errores 500 con stack trace
- Acciones administrativas (crear/editar/eliminar)

---

### 4. Proteger .env del Repositorio

**Problema:** `.env` con credenciales de BD y JWT_SECRET podria estar en git.

**Solucion:**
1. Agregar a `.gitignore`:
   ```
   .env
   .env.local
   .env.production
   ```
2. Crear `.env.example` sin valores sensibles:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
   JWT_SECRET=your-secret-here
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

---

## Prioridad MEDIA

### 5. Validar URL del Iframe

**Problema:** `urlIframe` solo valida `@IsString` en el backend.

**Solucion:**
```typescript
// create-report.dto.ts
@IsUrl({ protocols: ['https'], require_protocol: true })
urlIframe: string;
```

---

### 6. Agregar Indices a la Base de Datos

**Problema:** Columnas frecuentemente filtradas/ordenadas no tienen indices.

**Solucion en schema.prisma:**
```prisma
model User {
  // ... campos existentes
  @@index([activo])
  @@index([rolId])
}

model AuditAccess {
  // ... campos existentes
  @@index([fechaHora])
  @@index([usuarioId])
}

model LogActivity {
  // ... campos existentes
  @@index([fechaHora])
}

model ReportViewLog {
  // ... campos existentes
  @@index([fechaHora])
}

model Report {
  // ... campos existentes
  @@index([padreId])
  @@index([activo])
}
```

---

### 7. Implementar Refresh Tokens

**Problema:** Cuando el JWT expira (8h), el usuario debe re-autenticarse completamente.

**Solucion:** Implementar un par access_token (corto) + refresh_token (largo):
- Access token: 15 minutos
- Refresh token: 7 dias, almacenado en BD
- Endpoint `POST /api/auth/refresh` para renovar access token

---

### 8. Optimizar Endpoint de Auditoria

**Problema:** `findAll()` carga todos los registros en memoria antes de paginar.

**Solucion:** Usar una query SQL con UNION ALL:
```typescript
const result = await this.prisma.$queryRaw`
  SELECT id, 'ACCESO' as tipo, fecha_hora, usuario_id, NULL as reporte_id, NULL as duracion
  FROM cex_auditoria_accesos
  UNION ALL
  SELECT id, 'VISUALIZACION', fecha_hora, usuario_id, reporte_id, duracion_segundos
  FROM cex_log_visualizaciones
  ORDER BY fecha_hora DESC
  LIMIT ${limit} OFFSET ${offset}
`;
```

---

### 9. Excluir passwordHash de Respuestas

**Problema:** Algunos servicios retornan objetos completos de Prisma que podrian incluir `passwordHash`.

**Solucion:** Usar `select` explicito en vez de `include` en queries de usuarios, o implementar un interceptor que remueva `passwordHash`:

```typescript
// En UsersService
const users = await this.prisma.user.findMany({
  select: {
    id: true,
    nombreCompleto: true,
    email: true,
    rolId: true,
    activo: true,
    fechaCreacion: true,
    rol: true,
    // passwordHash NO incluido
  }
});
```

---

## Prioridad BAJA

### 10. Agregar Paginacion a GET /api/logs

**Problema:** Retorna todos los registros sin limite.

**Solucion:** Agregar `PaginationQueryDto` al controlador y paginacion al servicio, similar a los endpoints de usuarios y reportes.

---

### 11. Documentar API con Swagger/OpenAPI

**Solucion:**
```bash
npm install @nestjs/swagger
```
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Data Room API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

Agrega decoradores `@ApiTags`, `@ApiOperation`, `@ApiResponse` a los controllers.

---

### 12. Agregar Health Check Endpoint

**Solucion:**
```bash
npm install @nestjs/terminus
```
```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

Util para monitoreo y load balancers.

---

### 13. Agregar Headers de Seguridad (Helmet)

```bash
npm install helmet
```
```typescript
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

Agrega automaticamente headers como X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.

---

## Resumen

| # | Mejora | Prioridad | Esfuerzo |
|:-:|--------|:---------:|:--------:|
| 1 | Rate Limiting | ALTA | Bajo |
| 2 | JWT_SECRET robusto | ALTA | Bajo |
| 3 | Logging estructurado | ALTA | Medio |
| 4 | Proteger .env | ALTA | Bajo |
| 5 | Validar URL iframe | MEDIA | Bajo |
| 6 | Indices de BD | MEDIA | Bajo |
| 7 | Refresh Tokens | MEDIA | Alto |
| 8 | Optimizar auditoria | MEDIA | Medio |
| 9 | Excluir passwordHash | MEDIA | Bajo |
| 10 | Paginar logs | BAJA | Bajo |
| 11 | Swagger/OpenAPI | BAJA | Medio |
| 12 | Health Check | BAJA | Bajo |
| 13 | Helmet | BAJA | Bajo |
