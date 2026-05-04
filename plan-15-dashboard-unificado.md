# Plan 15 — Dashboard Unificado de Reportes

> **Tipo:** Plan de acción (no implementación).
> **Stack objetivo:** Next.js (App Router) + Tailwind CSS + TanStack Query + iframes de Looker Studio.
> **Origen del requerimiento:** Transformar la vista de un reporte padre en un *dashboard* que renderice todos sus sub-reportes simultáneamente, en formato de tarjetas/widgets.

---

## 0. Resumen ejecutivo

Hoy un click en cualquier nodo del Sidebar (padre o hijo) renderiza **un único iframe** a pantalla completa. El resultado es que el usuario nunca ve un panorama consolidado: tiene que ir nodo por nodo.

El cambio propuesto es semántico: **un reporte padre deja de ser un "contenedor navegable" y pasa a ser un dashboard** que renderiza, en una sola pantalla y dentro de un grid responsivo, los `urlIframe` de todos sus hijos directos (`children`). Los reportes hoja (sin hijos) se siguen comportando como hoy.

El backend ya devuelve la jerarquía completa (`padreId` / `children` en la tabla `Report`), así que **no se requiere modificación de API** — solo aprovechar mejor lo que ya entrega el endpoint.

---

## 1. Modelo mental y supuestos

| Concepto | Definición operativa |
|---|---|
| Reporte hoja | `children.length === 0`. Renderiza **un** iframe a pantalla completa (comportamiento actual). |
| Reporte dashboard | `children.length >= 1`. Renderiza un **grid de N iframes** (uno por hijo directo). |
| Profundidad | El dashboard solo agrega los **hijos directos**, no los nietos. Si un hijo es a su vez padre, su tarjeta puede mostrar su propio iframe (si lo tiene) y un enlace "Ver dashboard" que navegue al sub-dashboard de ese nodo. |
| `urlIframe` del padre | Opcional. Si existe, se usa como **cabecera** del dashboard (ver Fase 1.3). Si está vacío, el dashboard arranca directo con la grilla. |

**Supuestos que conviene validar antes de codear:**

1. **Volumen máximo de hijos por padre.** ¿Puede un padre tener 12+ hijos? Si sí, hay que pensar paginación o virtualización del grid (ver Fase 3.4).
2. **Política de URLs vacías.** ¿Existen reportes padre cuyos hijos tengan `urlIframe = null`? Hay que decidir si se ocultan, se muestran con placeholder o si esa fila no debería existir.
3. **Latencia de Looker Studio.** Cada iframe abre conexión TLS y descarga ~500 KB-1 MB. 6+ iframes simultáneos en una página dev local son tolerables; en mobile/3G no. Esto es lo que justifica la Fase 3.

---

## 2. Fase 1 — Lógica de renderizado y enrutamiento (Next.js)

### 2.1 Detección del tipo de nodo

La decisión "iframe único vs. grid" se toma en el componente de la **página de reporte** (la ruta dinámica que actualmente renderiza el iframe).

Pasos:

1. La página recibe el `id` del reporte por params (App Router, `[id]` o slug equivalente).
2. Hace fetch del reporte vía TanStack Query — el backend ya devuelve `children` en la respuesta del nodo (según `useChildReports.ts` y la jerarquía descrita en `contexto_proyecto.md`).
3. **Predicado de decisión** — un solo `if` claro, sin abstracciones:

   ```text
   const esDashboard = report.children && report.children.length > 0;
   ```

4. Render condicional:
   - `esDashboard === false` → `<ReportIframeFull url={report.urlIframe} />` (lo de hoy).
   - `esDashboard === true` → `<DashboardGrid parent={report} children={report.children} />` (componente nuevo, ver Fase 2).

> **Decisión arquitectónica:** mantener **una sola ruta** (`/dashboard/reporte/[id]` o equivalente) y bifurcar internamente. *No* crear una ruta separada `/dashboard/reporte/[id]/grid`. Razón: la URL representa "ver este reporte" — el formato (iframe vs grid) es un detalle de presentación derivado del estado del dato, no de la intención del usuario.

### 2.2 Datos necesarios en una sola query

Hoy `useChildReports` y `useReports` (probablemente) hacen fetch separados. Para el dashboard hay dos opciones:

| Opción | Pros | Contras |
|---|---|---|
| **A.** Endpoint actual ya trae `children` con `urlIframe` incluido | 1 sola request, render instantáneo | Si el backend no incluye `urlIframe` en `children`, hay que extender la respuesta |
| **B.** Fetch del padre + fetch de hijos en paralelo (`useChildReports`) | No requiere tocar backend | 2 round-trips, doble loading state |

**Acción de la Fase 1:** auditar la respuesta real de `GET /api/reports/:id` (o el endpoint que use `useReports`) y decidir A o B según lo que devuelva. Documentar la decisión en una nota al inicio del componente `DashboardGrid`.

### 2.3 ¿Qué hacer con el `urlIframe` del propio padre?

Tres patrones posibles. Recomendación: **patrón "cabecera condicional"**.

- Si `parent.urlIframe` existe → renderizarlo como **banda superior full-width** (alto reducido, ~280-320 px), seguida del grid de hijos debajo. Funciona como "KPI summary".
- Si `parent.urlIframe` está vacío/null → la página arranca con un encabezado textual (`titulo` + `descripcion`) y el grid debajo, sin iframe del padre.

Justificación: muchos dashboards de Looker Studio usan el reporte padre como vista de KPIs agregados y los hijos como desgloses. Ocultar el padre haría perder esa información.

### 2.4 Estados de carga y error

- **Loading global del padre:** skeleton de la página completa.
- **Loading individual por iframe:** cada tarjeta del grid maneja su propio `onLoad` para mostrar un spinner sobre el iframe hasta que dispara el evento. Importante: el `loading="lazy"` (Fase 3) **no** dispara `onLoad` hasta que entra en viewport — el spinner debe aparecer recién al iniciar la carga real, no al montar el componente.
- **Error de iframe:** los `iframe` no exponen `onError` confiable cross-origin. La estrategia es un timeout de seguridad (ej. 15 s) que si no recibió `onLoad` muestra un fallback "No se pudo cargar el reporte. [Reintentar]".

---

## 3. Fase 2 — Grid dinámico y responsivo (Tailwind CSS)

### 3.1 Tabla de decisión del layout

El grid debe **escalar matemáticamente** con la cantidad de hijos. Usamos clases estáticas de Tailwind (no concatenación dinámica de clases — Tailwind purge no las detecta) más una elección por rama según `children.length`:

| `children.length` | Mobile (`< md`) | Tablet (`md`) | Desktop (`lg`) | XL (`xl`) |
|---|---|---|---|---|
| 1 | 1 col, alto 600 px | 1 col | 1 col, max-w-5xl centrado | igual |
| 2 | 1 col | 2 cols | 2 cols | 2 cols |
| 3 | 1 col | 2 cols (último ocupa 2) **o** 3 cols | 3 cols | 3 cols |
| 4 | 1 col | 2 cols | 2 cols | 4 cols |
| 5–6 | 1 col | 2 cols | 3 cols | 3 cols |
| 7+ | 1 col | 2 cols | 3 cols | 4 cols |

El criterio: **menos hijos → cada tarjeta ocupa más espacio** (lectura cómoda). **Más hijos → más columnas** (densidad).

### 3.2 Implementación en Tailwind — sin clases dinámicas

Patrón recomendado: una función pura `getGridClasses(count: number): string` que devuelve un string literal **completo** (no concatenado), así Tailwind lo encuentra en el bundle. Ejemplo conceptual (no es código a copiar, solo ilustra la forma):

```text
function getGridClasses(count) {
  if (count === 1) return "grid grid-cols-1";
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2";
  if (count <= 4) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4";
  return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}
```

Alternativa más simple: **siempre** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` y dejar que el grid se "rellene" naturalmente. Tradeoff: pierde el ajuste fino para 1-2 hijos. **Recomendación:** empezar con la forma simple y solo introducir `getGridClasses` si UX lo pide después.

### 3.3 Alturas mínimas y aspect ratio

Looker Studio renderiza mejor con aspect ratio fijo. Dos opciones:

1. **`aspect-video` (16:9)** + `min-h-[400px]` como piso → la tarjeta crece con el ancho disponible y nunca queda más baja que 400 px.
2. **Altura fija** `h-[480px]` → simple, predecible, pero rompe en pantallas muy anchas (iframe queda con barras).

**Recomendación:** Opción 1 (`aspect-video min-h-[400px]`). El gap entre tarjetas: `gap-6` (24 px) — suficiente respiro sin desperdiciar viewport.

### 3.4 Anatomía de una tarjeta

Cada tarjeta del grid es una unidad autocontenida con:

```text
┌──────────────────────────────────────────┐
│  Header                                  │
│  ├── Título del sub-reporte              │
│  └── Botón "Abrir en pantalla completa"  │
├──────────────────────────────────────────┤
│                                          │
│           <iframe Looker>                │
│           (aspect-video min-h-[400px])   │
│                                          │
└──────────────────────────────────────────┘
```

- **Borde + sombra suave** (`border border-border rounded-lg shadow-sm`) para separación visual.
- **Botón "abrir en pantalla completa"** → navega a la ruta del hijo (`/dashboard/reporte/[hijoId]`) que, al ser hoja, renderiza el iframe full-width. Esto cubre el caso "necesito explorar este gráfico solo".

---

## 4. Fase 3 — Rendimiento y UX (iframes)

### 4.1 Lazy loading

- **Atributo `loading="lazy"`** en cada iframe → el navegador difiere la descarga hasta que el iframe se acerca al viewport. Solo se aplica a partir del segundo iframe en adelante; **el primero** (above-the-fold) debería usar `loading="eager"` para que el usuario vea contenido inmediato.
- Heurística: aplicar `eager` a los primeros N iframes que con alta probabilidad estén en viewport inicial. En desktop con 2 columnas y `min-h-[400px]`, los primeros 2 son "above the fold". `N = 2` es un buen default; en mobile (1 col), `N = 1`.

### 4.2 Pre-aviso visual mientras carga

- Skeleton con animación `animate-pulse` que ocupa el `aspect-video` hasta que el iframe dispara `onLoad`.
- Una vez cargado, **fade-in** de 200 ms (Tailwind `transition-opacity`) para evitar el "pop" abrupto.

### 4.3 Política de re-render

- El componente `DashboardGrid` debe recibir como key/prop estable solo `parent.id`. Si el usuario navega de un padre a otro, los iframes anteriores deben desmontarse (no quedarse en memoria) — esto se logra con `key={parent.id}` en el contenedor del grid.
- **No** memoizar individualmente cada iframe con `useMemo` — el costo de comparar URLs es despreciable y agrega complejidad sin beneficio.

### 4.4 Plan de degradación si hay 10+ hijos

Si el volumen real (auditar contra la BD) supera ~10 hijos por padre:

- **Opción A:** paginar el grid (mostrar 6 a la vez con "Cargar más").
- **Opción B:** usar `IntersectionObserver` para montar/desmontar iframes según scroll (virtualización ligera).
- **Opción C:** advertir al admin en el formulario de creación de reportes ("Este padre ya tiene 10 hijos, considera dividirlo").

**Recomendación:** dejar registrada esta decisión como TODO. No implementar ninguna en la primera versión a menos que ya haya un padre con >10 hijos en la BD.

### 4.5 Accesibilidad

- Cada iframe debe tener `title={hijo.titulo}` (requisito WCAG; lectores de pantalla lo usan).
- El botón "abrir en pantalla completa" debe tener `aria-label` explícito.
- `tabIndex` y orden de foco: el grid debe ser navegable por teclado en orden visual (top-to-bottom, left-to-right).

---

## 5. Fase 4 — Adaptación del Sidebar

Este es el punto donde el cambio de modelo mental impacta más al usuario. Hay tres opciones de comportamiento del Sidebar y cada una tiene tradeoffs:

### 5.1 Opción A — Sub-botones como anclas (scroll dentro del dashboard)

- Click en padre → carga el dashboard.
- Click en hijo → hace `scrollIntoView` a la tarjeta correspondiente del grid (con `behavior: 'smooth'`).
- Si el usuario está en otra ruta, primero navega al padre y después scrollea al ancla (vía `#hijo-id` en la URL).

**Pros:** unifica todo bajo el modelo de dashboard. Coherente.
**Contras:** el usuario pierde la posibilidad de ver el iframe del hijo a pantalla completa con un solo click.

### 5.2 Opción B — Sub-botones siguen abriendo iframe full-screen

- Click en padre → dashboard.
- Click en hijo → reemplaza el dashboard por la vista de iframe único (comportamiento de hoy).

**Pros:** preserva el flujo actual; cero cambios para el usuario que ya lo usa así.
**Contras:** dos modos de visualización conviviendo. Puede sentirse inconsistente.

### 5.3 Opción C — Híbrida (recomendada)

- Click corto en hijo → ancla/scroll dentro del dashboard del padre (Opción A).
- Click en el botón "abrir en pantalla completa" de la tarjeta → vista full iframe (Opción B).
- En el Sidebar, **un menú contextual o un icono secundario** junto a cada hijo permite forzar "abrir aislado".

**Pros:** ofrece ambos modos sin que compitan; el usuario elige según necesidad.
**Contras:** requiere mejor diseño visual del Sidebar (no se puede improvisar el icono secundario).

**Recomendación de plan:** ir con **Opción C**, pero implementar primero la rama "ancla/scroll" (default) y dejar el botón "abrir aislado" como segunda iteración. Justifica por qué: el 80% de los clicks van a ser exploración rápida dentro del dashboard; el "abrir aislado" es excepcional.

### 5.4 Estado activo en el Sidebar

- Cuando estamos en el dashboard de un padre: el padre se marca como **activo** y, si hay un ancla en la URL (`#hijo-id`), también se resalta el hijo correspondiente.
- Cuando estamos en vista aislada de un hijo: solo el hijo se marca activo, y el padre queda con un estado "expandido" (no "seleccionado").

---

## 6. Plan de implementación por orden de ejecución

> Esta sección es **orden sugerido**, no un compromiso. Cada paso es verificable de forma aislada.

1. **Auditoría de datos** — confirmar qué devuelve el endpoint del reporte padre (¿incluye `children` con sus `urlIframe`?). Decidir Opción A vs B de la Fase 1.2.
2. **Componente `DashboardGrid`** — recibe `parent` y `children`, renderiza grid simple sin lazy loading aún. Verificar visual con 1, 2, 3, 4 y 6 hijos en mock data.
3. **Bifurcación en la página de reporte** — agregar el `if (esDashboard)` y enchufar `DashboardGrid`. Verificar que reportes hoja siguen funcionando idénticos.
4. **Loading skeleton + lazy loading** (Fase 3.1, 3.2). Medir con DevTools Network throttling "Slow 4G" antes y después.
5. **Header del padre** (Fase 1.3) — banda superior con `parent.urlIframe` cuando aplique.
6. **Sidebar Opción C — rama de scroll** (Fase 5.3). Verificar que el hash en la URL funciona en navegación directa (entrar a `/dashboard/reporte/123#hijo-7`).
7. **Botón "abrir aislado"** en cada tarjeta (Fase 2.4) + actualización del estado activo del Sidebar (Fase 5.4).
8. **QA cross-browser** — Chrome, Firefox, Safari, mobile Safari. Looker Studio tiene quirks conocidos en Safari iOS con `loading="lazy"`.

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Padres con muchos hijos (>10) saturan la página | Media | Alto | Lazy loading agresivo + plan de paginación documentado en Fase 3.4 |
| `urlIframe` con dominio bloqueado por CSP/headers | Baja | Alto | Auditar `Content-Security-Policy` actual de Next; Looker Studio requiere `frame-src https://lookerstudio.google.com` |
| Tailwind purga las clases dinámicas y el grid no responde | Media | Medio | Usar strings literales completos (Fase 2.2), no template literals con interpolación |
| Iframes en mobile con scroll interno conflictivo | Media | Medio | `pointer-events` y `overflow` controlados en la tarjeta; testear en device real |
| Cambios de jerarquía en BD rompen dashboards en uso | Baja | Medio | TanStack Query con `invalidateQueries` cuando se edita un reporte (ya existe en `useAdminReports`) |

---

## 8. Métricas de éxito

Para considerar la feature "lista":

- [ ] Un padre con 1, 2, 3, 4 y 6 hijos renderiza correctamente en mobile, tablet y desktop.
- [ ] La página de un padre con 6 hijos termina de cargar visualmente (skeleton → primer iframe interactivo) en menos de 3 s sobre conexión local.
- [ ] El Sidebar mantiene el estado activo correcto al navegar entre padres y al usar anclas.
- [ ] Reportes hoja siguen funcionando igual que antes (regresión cero).
- [ ] No hay clases de Tailwind generadas dinámicamente que terminen ausentes en el bundle de producción.

---

## 9. Lo que este plan **no** cubre (fuera de alcance)

- Cambios en el backend (estructura de la tabla `Report`, endpoints, permisos).
- Drag & drop para reordenar tarjetas dentro del dashboard.
- Filtros globales que se propaguen a todos los iframes (Looker Studio expone parámetros vía URL — sería una feature aparte).
- Exportar el dashboard como PDF.
- Personalización por usuario (tarjetas ocultas, orden custom).

Estos son candidatos naturales a un "Plan 16" si el feedback inicial los pide.

---

**Fin del plan.**
