# Auditoria de Seguridad

---

## Resumen Ejecutivo

Se evaluan las practicas de seguridad del sistema Data Room analizando el codigo fuente de ambos stacks (Next.js + NestJS). Se clasifican los hallazgos por severidad: CRITICA, ALTA, MEDIA, BAJA.

---

## 1. Sanitizacion de Inputs

### Estado: CORRECTO con observaciones

**ValidationPipe Global (main.ts):**
```typescript
new ValidationPipe({
  whitelist: true,           // Remueve campos no decorados
  forbidNonWhitelisted: true, // Rechaza campos desconocidos
  transform: true,           // Transforma tipos automaticamente
})
```

| Aspecto | Estado | Detalle |
|---------|:------:|--------|
| Whitelist activo | OK | Campos no definidos en el DTO se eliminan |
| Campos extra rechazados | OK | Error 400 si envian propiedades no esperadas |
| Transformacion automatica | OK | Query params se convierten a tipos correctos |
| DTOs con validadores | OK | Todos los DTOs usan decoradores de class-validator |
| Validacion de email | OK | @IsEmail en LoginDto, CreateUserDto |
| Longitud de password | OK | @MinLength(6) en todos los DTOs con password |
| Validacion de arrays | OK | @ArrayMinSize(1) en rolesIds de CreateReportDto |

**Observacion:** La validacion de la URL del iframe (`urlIframe`) en el backend solo usa `@IsString` sin verificar formato HTTPS. El frontend valida que comience con `https://` via Zod, pero el backend no lo hace. Un atacante podria enviar una URL maliciosa directamente a la API.

| Severidad | Hallazgo |
|:---------:|----------|
| MEDIA | `urlIframe` no valida formato URL ni protocolo HTTPS en el backend |

**Recomendacion:** Agregar `@IsUrl()` o validacion custom en `CreateReportDto` y `UpdateReportDto`.

---

## 2. Cross-Site Scripting (XSS)

### Estado: RIESGO MEDIO

| Vector | Estado | Detalle |
|--------|:------:|--------|
| Renderizado de HTML en React | OK | React escapa strings por defecto |
| dangerouslySetInnerHTML | OK | No se usa en ningun componente |
| URLs en iframes | RIESGO | `urlIframe` se carga directamente sin sanitizar |
| Inputs de texto | OK | No se renderizan como HTML |

**Hallazgo critico: Iframe con URL de base de datos**

```typescript
// ReportViewer.tsx
<iframe src={urlIframe} ... />
```

La URL del iframe proviene directamente de la base de datos sin validacion en el backend. Si un administrador malicioso o un atacante con acceso a la BD inserta una URL como `javascript:alert(1)` o un sitio malicioso, se ejecutaria en el contexto del portal.

| Severidad | Hallazgo |
|:---------:|----------|
| MEDIA | URL del iframe no se valida como HTTPS en backend |
| BAJA | Framework React mitiga XSS en la mayoria de los vectores |

**Recomendacion:** 
- Validar que `urlIframe` sea una URL HTTPS valida en el backend
- Agregar header `Content-Security-Policy` con directiva `frame-src` que limite dominios permitidos para iframes

---

## 3. SQL Injection

### Estado: PROTEGIDO

| Aspecto | Estado | Detalle |
|---------|:------:|--------|
| ORM Prisma | OK | Todas las queries usan el cliente Prisma (parametrizadas) |
| $queryRaw / $executeRaw | OK | No se usan en ningun servicio |
| Inputs en queries | OK | Valores pasan por DTOs -> Prisma (nunca concatenados) |

Prisma ORM usa internamente queries parametrizadas, lo que elimina el riesgo de SQL injection.

---

## 4. Autenticacion y Sesion

### Hallazgos

| # | Severidad | Hallazgo | Detalle |
|:-:|:---------:|----------|--------|
| 1 | CRITICA | JWT_SECRET con fallback inseguro | `jwt.strategy.ts`: `secretOrKey: process.env.JWT_SECRET \|\| 'supersecret'`. Si la variable de entorno no se carga, cualquier atacante puede forjar tokens |
| 2 | ALTA | JWT_SECRET debil en .env | El valor actual es `supersecret` (10 caracteres, palabra de diccionario) |
| 3 | MEDIA | Cookies sin flags de seguridad | `js-cookie` no establece `secure`, `httpOnly` ni `sameSite` |
| 4 | BAJA | Token accesible desde JavaScript | Al no ser `httpOnly`, el token es vulnerable a XSS (si existiera un vector) |
| 5 | MEDIA | Sin mecanismo de revocacion | No hay blacklist de tokens. Un token comprometido es valido hasta que expire (8h) |
| 6 | BAJA | Sin refresh token | Si el token expira, el usuario debe re-autenticarse completamente |

### Detalle de Cookies

**Configuracion actual:**
```typescript
Cookies.set('access_token', token, { expires: 1/3 }); // Solo expires
```

**Configuracion recomendada para produccion:**
```typescript
Cookies.set('access_token', token, {
  expires: 1/3,
  secure: true,      // Solo HTTPS
  sameSite: 'strict', // Previene CSRF
  path: '/',
});
```

**Nota:** `httpOnly` no puede establecerse desde JavaScript (requiere que el backend establezca la cookie via `Set-Cookie` header).

---

## 5. Rate Limiting

### Estado: NO IMPLEMENTADO

| Severidad | Hallazgo |
|:---------:|----------|
| ALTA | No existe rate limiting en ningun endpoint |

**Riesgos:**
- **Fuerza bruta en login:** Un atacante puede intentar miles de combinaciones de password sin limite
- **DoS:** Peticiones masivas a endpoints de consulta pueden sobrecargar la BD
- **Enumeracion de usuarios:** Peticiones repetidas a login para descubrir emails validos

**Recomendacion:** Implementar `@nestjs/throttler`:

```typescript
// app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,     // Ventana de tiempo en segundos
  limit: 10,   // Max peticiones por ventana
})

// auth.controller.ts (mas restrictivo para login)
@Throttle(5, 60)  // 5 intentos por minuto
@Post('login')
```

---

## 6. CORS

### Estado: CORREGIDO (previamente vulnerable)

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Origin | `['*']` (wildcard) | `http://localhost:3000` (especifico) |
| Credentials | `true` | `true` |
| Funciona? | No (browser rechaza) | Si |

---

## 7. Exposicion de Datos Sensibles

| Dato | Expuesto? | Detalle |
|------|:---------:|--------|
| passwordHash | Verificar | Los servicios retornan objetos de Prisma completos en algunos casos. Verificar que los select/include no incluyan passwordHash |
| .env en repositorio | RIESGO | El archivo `.env` con DATABASE_URL y JWT_SECRET esta en el proyecto |
| JWT_SECRET en codigo | Si | Fallback `'supersecret'` hardcodeado en jwt.strategy.ts |

| Severidad | Hallazgo |
|:---------:|----------|
| ALTA | `.env` con credenciales podria estar en el repositorio. Agregar a `.gitignore` |
| MEDIA | Verificar que `passwordHash` nunca se retorne en respuestas de API |

---

## 8. Otros Riesgos

| # | Severidad | Hallazgo | Recomendacion |
|:-:|:---------:|----------|---------------|
| 1 | MEDIA | Sin HTTPS en desarrollo | Usar HTTPS en produccion obligatoriamente |
| 2 | MEDIA | Sin headers de seguridad (Helmet) | Agregar `@nestjs/helmet` para headers CSP, X-Frame-Options, etc. |
| 3 | BAJA | Sin logging de intentos fallidos de login | Registrar intentos fallidos en cex_log_actividades |
| 4 | BAJA | Admin rol hardcodeado (ID=1) | Considerar permisos basados en tablas |

---

## Resumen de Hallazgos por Severidad

| Severidad | Cantidad | Hallazgos Principales |
|:---------:|:--------:|----------------------|
| CRITICA | 1 | JWT_SECRET con fallback inseguro |
| ALTA | 3 | JWT_SECRET debil, sin rate limiting, .env expuesto |
| MEDIA | 5 | Cookies sin flags, sin revocacion, urlIframe sin validar, sin Helmet, sin HTTPS |
| BAJA | 4 | Token no httpOnly, sin refresh token, admin hardcodeado, sin log de fallos |
