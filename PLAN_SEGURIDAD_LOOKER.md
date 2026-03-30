# Plan de Seguridad: Proteccion de Dashboards Looker Studio

## Contexto del Problema

La plataforma LockerStudio funciona como un data room que integra dashboards de Looker Studio via iframes. Actualmente, la URL del iframe (`urlIframe`) se envia directamente al cliente y se renderiza como:

```html
<iframe src="https://lookerstudio.google.com/embed/reporting/..." />
```

### Vulnerabilidades actuales

| # | Vulnerabilidad | Severidad | Detalle |
|---|---------------|-----------|---------|
| 1 | URL visible en DevTools (Elements) | Alta | El `src` del iframe es inspeccionable |
| 2 | URL en props de React | Alta | React DevTools expone `urlIframe` en el componente `ReportViewer` |
| 3 | URL en response del API `/reports` | Alta | El endpoint devuelve `urlIframe` en el JSON al cliente |
| 4 | Link "Abrir en nueva pestana" | Alta | Enlace directo a Looker Studio accesible al usuario |
| 5 | URL compartible | Media | Cualquiera con la URL puede acceder al dashboard sin autenticacion de tu plataforma |
| 6 | Acceso a Data Sources | Alta | Desde un embed link de Looker es posible explorar los data sources conectados |

### Limitacion fundamental de los iframes

**Es imposible ocultar al 100% la URL de un iframe del navegador.** Si el browser necesita cargar contenido de `lookerstudio.google.com`, esa conexion sera visible en la pestana Network de DevTools. Ninguna solucion de frontend puede cambiar esto. Las estrategias viables se enfocan en:

1. Hacer que la URL no sea reutilizable fuera del sistema
2. Reducir la superficie de exposicion
3. Controlar el acceso desde el backend

---

## Evaluacion de Opciones

### Opcion A: Proxy de redireccion (Backend NestJS)

**Concepto:** El frontend nunca recibe la URL de Looker. El iframe apunta a un endpoint del backend (`/reports/:id/embed`) que valida JWT + rol y redirige (302) a Looker.

**Pros:**
- Facil de implementar (~2-3 horas)
- La URL no aparece en el HTML, JS, ni React DevTools
- El endpoint proxy requiere autenticacion
- Compatible con la arquitectura actual

**Contras:**
- La URL sigue visible en Network tab como destino del 302
- Un usuario autenticado aun puede extraer la URL
- La URL sigue siendo reutilizable una vez extraida

**Nivel de seguridad:** Medio - Elimina la exposicion casual pero no protege contra un usuario tecnico determinado.

---

### Opcion B: Proxy de redireccion + Tokens de un solo uso

**Concepto:** Evolucion de la Opcion A. El backend genera un token temporal de un solo uso por cada carga del iframe. El endpoint `/reports/:id/embed?token=xyz` valida el token, lo invalida, y redirige.

**Pros:**
- Todo lo de la Opcion A
- La URL del proxy no es reutilizable (token one-time)
- Protege contra replay de la URL del proxy
- Un usuario que copie la URL del proxy no puede compartirla

**Contras:**
- La URL final de Looker sigue visible en el 302
- Agrega complejidad (almacenamiento de tokens, TTL, limpieza)
- No resuelve el problema fundamental: la URL de Looker en si

**Nivel de seguridad:** Medio-Alto para la URL del proxy. La URL de Looker sigue expuesta via Network.

---

### Opcion C: Reverse Proxy Completo (Backend sirve el contenido)

**Concepto:** El backend actua como proxy completo: descarga el HTML de Looker Studio y lo sirve directamente. El browser nunca contacta a `lookerstudio.google.com`.

**Pros:**
- La URL de Looker nunca llega al cliente, ni siquiera en Network tab
- Maximo control sobre el contenido

**Contras:**
- **Inviable en la practica.** Looker Studio es una Single Page Application completa que carga decenas de sub-recursos (JS, CSS, APIs de Google, WebSockets) desde multiples dominios. Proxear todo esto requeriria reescribir URLs en el HTML/JS dinaimcamente, manejar CORS, cookies de Google, autenticacion OAuth interna, etc.
- Fragilidad extrema: cualquier cambio de Google rompe el proxy
- Posible violacion de ToS de Google

**Nivel de seguridad:** Teoricamente alto. Practicamente inviable.

---

### Opcion D: Looker Studio Embedding con Google Cloud (Solucion Enterprise)

**Concepto:** Usar las funcionalidades enterprise de Looker Studio / Looker (Google Cloud) para controlar el acceso programaticamente.

**Sub-opciones:**

#### D1: Looker Studio Pro - Private Embedding
- Requiere Looker Studio Pro (licencia de pago por usuario)
- Los embeds requieren autenticacion de Google
- Controlas quien puede ver via Google Workspace / Cloud Identity
- Aun requiere gestionar usuarios en Google (no 100% tu backend)

#### D2: Looker (no Looker Studio) - Embedded Analytics con SSO
- Looker (el producto completo, no Looker Studio) soporta **Signed Embedding**
- Tu backend genera un URL firmado con una clave secreta y un TTL corto
- El URL expira automaticamente (tipicamente 5-10 minutos)
- **El acceso esta 100% controlado por tu backend**
- No necesitas gestionar usuarios en Google
- El usuario no puede reutilizar la URL porque expira

**Pros:**
- Solucion definitiva y oficialmente soportada
- URLs con TTL corto eliminan el problema de compartir
- SSO controlado por tu backend
- Cumple todos los requisitos del CTO

**Contras:**
- Requiere Looker (Google Cloud), no Looker Studio gratuito
- Costo significativo (licencia Looker)
- Migracion de dashboards de Looker Studio a Looker
- Mayor complejidad de infraestructura

**Nivel de seguridad:** Alto. Es la solucion disenada para este caso de uso.

---

### Opcion E: Alternativa hibrida - Renderizado server-side de datos + Charts propios

**Concepto:** En lugar de embeder Looker Studio, consumir los datos desde BigQuery/tu data source directamente en tu backend y renderizar los graficos con una libreria de charts (Chart.js, Recharts, Apache ECharts).

**Pros:**
- Control total sobre los datos y la visualizacion
- Cero exposicion de URLs externas
- La data pasa por tu backend con autenticacion completa
- Maxima flexibilidad de UI/UX
- Sin dependencia de iframes ni de Looker
- Sin costos de licencia adicionales

**Contras:**
- Esfuerzo de desarrollo significativo
- Necesitas recrear los dashboards manualmente
- Pierdes las funcionalidades interactivas de Looker (filtros, drill-down, etc.)
- Requiere acceso directo a los data sources (BigQuery, etc.)

**Nivel de seguridad:** Maximo. Los datos nunca salen de tu infraestructura.

---

## Recomendacion

### Corto plazo (implementar ahora): Opcion A + mejoras

Esta combinacion no resuelve el problema al 100% pero reduce drasticamente la exposicion y se implementa en pocas horas sobre la arquitectura actual:

#### Cambios en el Backend (NestJS)

1. **Nuevo endpoint `GET /reports/:id/embed`**
   - Valida JWT (JwtAuthGuard)
   - Verifica que el usuario tiene acceso al reporte por su rol
   - Redirige (302) a la URL real de Looker Studio
   - Registra en audit log cada acceso al embed

2. **Ocultar `urlIframe` del endpoint `GET /reports`**
   - El endpoint que lista reportes para usuarios normales **ya no incluye** `urlIframe` en la respuesta
   - Solo el endpoint admin (`GET /reports/admin`) mantiene el campo para gestion
   - La URL solo vive en la base de datos y en el redirect del backend

3. **Headers de seguridad en el redirect**
   - `Referrer-Policy: no-referrer` para que Looker no reciba info de tu dominio
   - `Cache-Control: no-store` para que el redirect no se cachee

#### Cambios en el Frontend

4. **Modificar `ReportViewer.tsx`**
   - Cambiar `src={urlIframe}` por `src={`${API_URL}/reports/${reportId}/embed`}`
   - Agregar el token JWT como query param o header (via cookie)
   - **Eliminar** el link "Abrir en nueva pestana" (expone la URL directamente)

5. **Modificar tipo `Report`**
   - Eliminar `urlIframe` del tipo `Report` en el frontend
   - El componente solo necesita `reportId` para construir la URL del proxy

6. **Modificar `DashboardPage`**
   - Ya no pasar `urlIframe` como prop a `ReportViewer`

#### Consideracion importante sobre autenticacion del iframe

El endpoint `/reports/:id/embed` necesita autenticar la request del iframe. Como los iframes no envian headers `Authorization`, hay dos opciones:

- **Opcion 1 - Token en query param:** `src="/reports/123/embed?token=JWT_TOKEN"` - Simple pero el token queda en logs del servidor y en el historial del navegador
- **Opcion 2 - Cookie HttpOnly:** Migrar el token de `js-cookie` a una cookie HttpOnly que se envia automaticamente con el request del iframe. **Esta es la opcion recomendada** porque:
  - La cookie se envia automaticamente en el request del iframe
  - No expone el JWT en la URL
  - Es mas segura que el enfoque actual de cookies con js-cookie

### Mediano plazo: Evaluar Opcion D2 o E

Si el negocio requiere seguridad total para el data room:

- **Si los dashboards ya existen en Looker Studio y el presupuesto lo permite:** migrar a Looker con Signed Embedding (Opcion D2)
- **Si se busca independencia total:** desarrollar dashboards propios consumiendo datos directamente (Opcion E)

---

## Resumen de niveles de seguridad

| Opcion | URL visible en HTML | URL visible en Network | URL reutilizable | Control total backend | Esfuerzo |
|--------|:------------------:|:---------------------:|:----------------:|:--------------------:|:--------:|
| Actual | Si | Si | Si | No | - |
| A: Proxy redirect | No | Si (302) | Si | Parcial | Bajo |
| B: Proxy + token one-use | No | Si (302) | No (proxy) / Si (Looker) | Parcial | Medio |
| D2: Looker Signed Embed | No | Si (firmada, expira) | No (TTL corto) | Si | Alto + $ |
| E: Charts propios | No | No | No | Si | Alto |

---

## Archivos a modificar (Opcion A - Corto plazo)

### Backend
- `BACKEND/src/reports/reports.controller.ts` - Agregar endpoint `/reports/:id/embed`
- `BACKEND/src/reports/reports.service.ts` - Metodos `findByRoleSafe()` (sin urlIframe) y `getEmbedUrl()`
- `BACKEND/src/main.ts` - Agregar cookie-parser si se usa Opcion 2 de auth
- `BACKEND/src/auth/jwt.strategy.ts` - Soportar extraccion de JWT desde cookie

### Frontend
- `frontend/src/components/dashboard/ReportViewer.tsx` - Usar URL del proxy, eliminar link externo
- `frontend/src/app/dashboard/page.tsx` - Dejar de pasar urlIframe
- `frontend/src/types/report.types.ts` - Hacer urlIframe opcional o eliminarlo
- `frontend/src/lib/auth.ts` - Migrar a cookie HttpOnly (si se elige Opcion 2)
- `frontend/src/context/AuthContext.tsx` - Adaptar manejo de sesion
