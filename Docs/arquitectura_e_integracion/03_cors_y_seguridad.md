# CORS y Seguridad en Transito

---

## Configuracion CORS

### Backend (main.ts)

```typescript
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['*'];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
```

### Variables de Entorno

| Variable | Valor Desarrollo | Descripcion |
|----------|-----------------|-------------|
| `CORS_ORIGIN` | `http://localhost:3000` | Origenes permitidos (separados por coma) |

### Regla Critica: origin + credentials

Cuando `credentials: true`, el navegador **rechaza** `Access-Control-Allow-Origin: *`. Debe ser un origen especifico.

| Configuracion | Funciona? |
|---------------|:---------:|
| `origin: ['*']` + `credentials: true` | No |
| `origin: ['http://localhost:3000']` + `credentials: true` | Si |
| `origin: ['*']` + `credentials: false` | Si (pero no envia cookies/headers auth) |

### Configuracion de Produccion

Para produccion, `CORS_ORIGIN` debe contener el dominio del frontend:
```
CORS_ORIGIN=https://dataroom.midominio.com
```

Para multiples origenes:
```
CORS_ORIGIN=https://dataroom.midominio.com,https://admin.midominio.com
```

---

## Headers de Seguridad

### Headers Enviados por el Frontend
| Header | Valor | Proposito |
|--------|-------|-----------|
| `Authorization` | `Bearer eyJ...` | Token JWT para autenticacion |
| `Content-Type` | `application/json` | Tipo de contenido del body |
| `User-Agent` | (automatico del navegador) | Identificacion del navegador (capturado en login) |

### Headers Relevantes de CORS
| Header | Valor | Descripcion |
|--------|-------|-------------|
| `Access-Control-Allow-Origin` | `http://localhost:3000` | Origen permitido |
| `Access-Control-Allow-Credentials` | `true` | Permite envio de cookies/headers |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` | Headers permitidos |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, PATCH, DELETE` | Metodos permitidos |

---

## Variables de Entorno de Seguridad

### Backend (.env)
| Variable | Valor | Riesgo si se expone | Notas |
|----------|-------|---------------------|-------|
| `DATABASE_URL` | `postgresql://...` | CRITICO | Contiene credenciales de BD |
| `JWT_SECRET` | `supersecret` | CRITICO | Permite forjar tokens |
| `CORS_ORIGIN` | `http://localhost:3000` | BAJO | Solo define origenes CORS |
| `PORT` | `3001` | BAJO | Puerto del servidor |

### Frontend (.env)
| Variable | Valor | Riesgo si se expone | Notas |
|----------|-------|---------------------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | BAJO | URL publica de la API |

**Nota:** Variables con prefijo `NEXT_PUBLIC_` se incluyen en el bundle del navegador y son visibles para cualquier usuario.

---

## Flujo de una Peticion Cross-Origin

```
Frontend (localhost:3000)              Backend (localhost:3001)
         |                                      |
   1. Browser detecta cross-origin              |
         |                                      |
   2. Preflight OPTIONS ────────────────────>   |
      Origin: http://localhost:3000              |
      Access-Control-Request-Method: POST        |
      Access-Control-Request-Headers: Authorization, Content-Type
         |                                      |
         |   <──────────────────────────────    3. Respuesta Preflight
         |   Access-Control-Allow-Origin: http://localhost:3000
         |   Access-Control-Allow-Credentials: true
         |   Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE
         |   Access-Control-Allow-Headers: Content-Type,Authorization
         |                                      |
   4. Peticion real POST /api/auth/login ──>    |
      Origin: http://localhost:3000              |
      Authorization: Bearer eyJ...               |
         |                                      |
         |   <──────────────────────────────    5. Respuesta con datos
         |   Access-Control-Allow-Origin: http://localhost:3000
```

**Nota:** Las peticiones simples (GET sin headers custom) no requieren preflight.

---

## Recomendaciones de Seguridad para Produccion

1. **JWT_SECRET:** Cambiar `supersecret` por un secreto largo y aleatorio (min 32 caracteres)
2. **CORS_ORIGIN:** Establecer el dominio exacto de produccion
3. **HTTPS:** Servir tanto frontend como backend sobre HTTPS
4. **Cookies seguras:** Agregar `secure: true` y `sameSite: 'strict'` a las cookies en produccion
5. **Helmet:** Agregar `@nestjs/platform-express` headers de seguridad (X-Frame-Options, CSP, etc.)
