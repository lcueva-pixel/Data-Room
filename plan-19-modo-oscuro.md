# Plan 19 — Implementación de Modo Oscuro (Dark Mode)

> **Tipo:** Plan estratégico / UI-UX Frontend
> **Stack objetivo:** Next.js (App Router) + Tailwind CSS **v4** + `next-themes`
> **Alcance:** Frontend (`Data-Room/frontend/`)
> **Estado:** Borrador para aprobación. No se modificará código hasta dar luz verde.

---

## 0. Regla de Oro de Diseño (innegociable)

El **Modo Claro actual NO se modifica bajo ningún concepto**. Toda la implementación se construye como **una capa superpuesta** mediante el prefijo `dark:` de Tailwind.

- ❌ Prohibido: eliminar, sustituir o reescribir clases base existentes (`bg-white`, `text-slate-900`, `border-gray-200`, etc.).
- ✅ Permitido: **añadir al lado** la variante `dark:` correspondiente.
- Patrón canónico: `class="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"`.
- Cualquier PR que altere el estilo claro existente debe ser rechazado en revisión.

Esto garantiza que el diff sea reversible (basta con quitar las clases `dark:` para volver al estado previo) y que el QA del modo claro no requiera reverificación visual.

---

## 0.1. Hallazgo crítico previo al plan — Tailwind v4

Al inspeccionar el proyecto se confirmó:

- `frontend/postcss.config.mjs` usa `@tailwindcss/postcss` → **Tailwind v4**.
- `frontend/src/app/globals.css` ya importa con `@import "tailwindcss"` y declara:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- **No existe `tailwind.config.ts`** en el proyecto (Tailwind v4 prescinde del archivo de config JS por defecto y migra la configuración a CSS vía `@theme`).

**Implicación:** la instrucción original del plan ("habilitar `darkMode: 'class'` en `tailwind.config.ts`") corresponde al modelo de Tailwind v3. En v4 el equivalente —activar el modo oscuro basado en clase— **ya está hecho** mediante el `@custom-variant dark` que mira el selector `.dark`. Por tanto, la Fase 1 se reduce a integrar `next-themes` para que sea quien aplique la clase `.dark` al `<html>`.

> ⚠️ Importante: el `AGENTS.md` del frontend advierte que esta versión de Next.js puede tener convenciones distintas. Antes de implementar, se consultará `node_modules/next/dist/docs/` para confirmar el patrón correcto de Provider en App Router.

---

## 1. Fase 1 — Infraestructura (`next-themes` + Tailwind v4)

### 1.1. Objetivo
Habilitar el cambio de tema sin **FOUC/flickering** (parpadeo del tema claro al cargar la página antes de aplicar el oscuro), persistente en `localStorage` y respetando la preferencia del sistema operativo.

### 1.2. Instalación
- Dependencia a añadir: `next-themes` (versión estable más reciente compatible con la versión de Next.js del proyecto).
- Comando previsto (no se ejecutará en esta fase): `npm install next-themes` desde `frontend/`.
- Auditar `package.json` para verificar la versión de React/Next.js antes de instalar.

### 1.3. Configuración de Tailwind (v4 — ya cubierta)
- **Acción:** ninguna en `tailwind.config.ts` (no existe).
- **Verificación:** confirmar que `globals.css` mantiene la línea
  `@custom-variant dark (&:where(.dark, .dark *));`
- Esa línea es la equivalencia de `darkMode: 'class'` de v3. Si `next-themes` aplica `class="dark"` al `<html>`, todas las utilidades `dark:*` activarán correctamente.

### 1.4. Provider sin parpadeo
- Crear (o extender) un componente cliente `ThemeProvider` ubicado en `src/components/Providers.tsx` (ya existe — se compondrá dentro) o en un archivo dedicado `src/components/theme-provider.tsx`.
- Configuración prevista de `next-themes`:
  - `attribute="class"` → escribe `.dark` en `<html>`.
  - `defaultTheme="system"` → respeta preferencia del SO en primera visita.
  - `enableSystem` → activado.
  - `disableTransitionOnChange` → activado, evita transiciones globales molestas al alternar.
  - `storageKey="dataroom-theme"` (o similar) → para no colisionar con otros usos.
- Integración en el árbol: envolver el `children` del `RootLayout` (`src/app/layout.tsx`) dentro del Provider. **No se reescribe** el layout, solo se anida el provider.
- En `<html>` se añadirá `suppressHydrationWarning` (requisito de `next-themes` para evitar warnings al hidratar el atributo `class`).

### 1.5. Criterios de aceptación de la Fase 1
- [ ] `next-themes` instalado y bloqueado en `package.json`.
- [ ] Provider montado sin romper el render actual.
- [ ] Toggle manual desde devtools (añadir `class="dark"` a `<html>`) muestra que **nada cambia visualmente todavía** (porque aún no se han añadido utilidades `dark:`). Esto confirma que el modo claro permanece intacto.
- [ ] No hay parpadeo visible al refrescar la página con tema oscuro forzado.

---

## 2. Fase 2 — Estrategia de Estilos (`dark:` prefix)

### 2.1. Directriz absoluta
> **Nunca eliminar una clase base existente. Solo añadir su contraparte `dark:`.**

Ejemplo correcto:
```diff
- className="bg-white border border-gray-200 text-slate-900"
+ className="bg-white border border-gray-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
```

Ejemplo prohibido:
```diff
- className="bg-white text-slate-900"
+ className="bg-slate-900 text-slate-100"   // ❌ rompe la regla de oro
```

### 2.2. Paleta oscura oficial del proyecto

| Rol semántico                      | Token claro (intacto)         | Token oscuro (nuevo)            | Notas |
|------------------------------------|-------------------------------|---------------------------------|-------|
| Fondo global / dashboard           | `bg-gray-50` / `bg-white`     | `dark:bg-slate-900` (#0f172a)   | Navy profundo. Base del lienzo. |
| Tarjeta / contenedor de contenido  | `bg-white`                    | `dark:bg-slate-800` (#1e293b)   | Eleva sobre el fondo para crear jerarquía. |
| Tarjeta elevada / hover de card    | n/a                           | `dark:bg-slate-700`             | Solo donde el claro use sombras notables. |
| Bordes sutiles                     | `border-gray-200`/`border-slate-200` | `dark:border-slate-700`  | |
| Bordes fuertes / divisores         | `border-gray-300`             | `dark:border-slate-600`         | |
| Texto principal                    | `text-slate-900`              | `dark:text-slate-100`           | |
| Texto secundario                   | `text-slate-600`              | `dark:text-slate-300`           | |
| Texto deshabilitado / muted        | `text-slate-400`              | `dark:text-slate-500`           | |
| Acento (ya definido en `globals.css`) | `--sidebar-accent: #68d6e3` | mismo (preservar)               | El cyan del sidebar funciona en ambos temas. |
| Estado focus ring                  | `ring-indigo-500` (o similar) | `dark:ring-indigo-400`          | Subir un escalón para contraste sobre fondo oscuro. |
| Sombras                            | `shadow-sm` / `shadow-md`     | `dark:shadow-black/40` o quitar | Las sombras grises rinden mal sobre navy. Se usarán sombras sutiles negras o se omitirán. |

### 2.3. Reglas de contraste (WCAG AA mínimo)
- Texto principal sobre `slate-900`: usar `slate-100` o más claro (ratio ≥ 7:1).
- Texto secundario sobre `slate-800`: nunca por debajo de `slate-300`.
- Validación: pasar pantallas representativas por un checker de contraste antes del merge.

### 2.4. Convención de orden de clases
Para legibilidad y revisión en PR: primero las clases base, luego las `dark:`. Ej.:
`"px-4 py-2 bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"`.

---

## 3. Fase 3 — Refactorización de Componentes (solo añadir `dark:`)

> Recordatorio: **no se reescribe lógica ni se renombran clases**. Cada item lista únicamente las superficies a las que se les añadirá la capa oscura.

### 3.1. Layout raíz / Dashboard
- **Archivo:** `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/overview/page.tsx`.
- Añadir `dark:bg-slate-900` al contenedor principal del dashboard.
- Texto base por defecto: añadir `dark:text-slate-100` en el wrapper de mayor jerarquía.
- Verificar que `<body>` o el wrapper externo no fije un `bg-white` que bloquee el navy.

### 3.2. Sidebar
- **Archivo:** `src/components/dashboard/Sidebar.tsx` + tokens en `globals.css`.
- El sidebar **ya tiene una estética oscura por diseño** (tokens `--sidebar-main: #1c252e`). En modo oscuro **se mantiene** ese tono o se ajusta sutilmente para alinear con `slate-900` del lienzo.
- Acciones puntuales:
  - Hover de items: añadir `dark:hover:bg-slate-700/40` si actualmente usa el token `--sidebar-hover` para que la transición de claro→oscuro mantenga jerarquía.
  - Bordes del sidebar (separador con el contenido): añadir `dark:border-slate-700`.
  - Item activo: validar que el acento `--sidebar-accent` (#68d6e3) tenga suficiente contraste con el fondo navy (lo tiene) y mantenerlo idéntico.
  - Iconos: si hoy usan `text-slate-300` o similar, añadir `dark:text-slate-300` (idempotente, refuerza intención).

### 3.3. TopBar
- **Archivo:** `src/components/dashboard/TopBar.tsx`.
- `bg-white` → añadir `dark:bg-slate-800`.
- Borde inferior: `dark:border-slate-700`.
- Texto y avatares: `dark:text-slate-100` / `dark:text-slate-300`.
- Botones de iconos (campana, perfil, etc.): `dark:hover:bg-slate-700`.

### 3.4. Contenedor de iframes (Dashboard Unificado)
- **Archivos:** `src/components/dashboard/DashboardGrid.tsx`, `src/components/dashboard/ReportViewer.tsx`.
- La **tarjeta** que envuelve cada iframe (no el iframe en sí — ver Fase 5):
  - Fondo: `dark:bg-slate-800`.
  - Borde: `dark:border-slate-700`.
  - Sombra: reducir o reemplazar por `dark:shadow-black/30`.
  - Header de la card (título del reporte, badges, etc.): `dark:text-slate-100` y `dark:bg-slate-800`.
- Padding y geometría: **sin cambios**.

### 3.5. Vistas administrativas
- **Archivos:** `src/app/dashboard/admin/**` (audit, reports, users) y `src/components/admin/**`.
- Tablas:
  - `thead`: `dark:bg-slate-800`.
  - Filas: alternancia con `dark:odd:bg-slate-900 dark:even:bg-slate-800/60` si hoy hay zebra striping.
  - Hover de fila: `dark:hover:bg-slate-700/50`.
  - Bordes: `dark:border-slate-700`.
- Modales / drawers: fondo `dark:bg-slate-800`, overlay `dark:bg-black/70`.
- Inputs y selects: `dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500`.
- Botones primarios: revisar que el azul/indigo actual conserve contraste; si no, subir un tono en `dark:`.

### 3.6. Login
- **Archivo:** `src/app/login/**`, `src/components/auth/**`.
- Decisión a tomar (pendiente de aprobación): ¿el login también respeta tema oscuro o queda fijo en claro como pantalla de marca?
- **Recomendación:** que respete el tema (consistencia). En esa línea, aplicar misma estrategia: `dark:bg-slate-900` al fondo, `dark:bg-slate-800` a la card del formulario.

### 3.7. Componentes UI compartidos
- **Carpeta:** `src/components/ui/`.
- Es la carpeta de mayor reutilización. Cada primitivo (botón, input, badge, card) recibe la pareja `dark:` apropiada **una sola vez** y se propaga a todo el sistema.
- Prioridad: atacar primero esta carpeta para minimizar el trabajo en consumidores.

### 3.8. Estrategia de ejecución de la Fase 3
1. Empezar por `components/ui/*` (impacto multiplicador).
2. Layout raíz + dashboard layout (telón de fondo).
3. Sidebar + TopBar (cromo principal).
4. DashboardGrid + ReportViewer (núcleo del producto).
5. Vistas admin (mayor superficie, menor frecuencia de uso).
6. Login (decisión pendiente).

Cada paso es un commit independiente para facilitar revisión y rollback parcial.

---

## 4. Fase 4 — Interfaz de Usuario en "Configuración"

### 4.1. Ubicación
- En el sidebar (`Sidebar.tsx`) ya hay referencia a "Configuración" (verificado por grep). Esa es la única coincidencia de la palabra en el código actual, lo que sugiere que la **vista de Configuración aún no existe** o vive solo como item del menú.
- **Acción:** confirmar con el equipo si ya hay ruta destino. Si no, crear `src/app/dashboard/settings/page.tsx` (o el slug que corresponda al item del sidebar) **en una sub-tarea explícita** de este plan, sin entrar en otras secciones de la página.
- Si la página de Configuración aún no existe, este plan **propone** crearla como contenedor mínimo con un `<section>` "Apariencia" que aloje el toggle. Cualquier otra funcionalidad de Configuración queda fuera de alcance.

### 4.2. Control "Tema"
- Tipo: **grupo de tres opciones segmentado** (no un switch binario), con valores:
  - `Claro` (light)
  - `Oscuro` (dark)
  - `Sistema` (system) ← opción por defecto.
- Visual: tarjeta con título "Apariencia" / "Tema", descripción corta, y un control segmentado de 3 botones con icono (☀️ / 🌙 / 🖥️) y label. Estado activo resaltado con el acento del proyecto.
- Accesibilidad:
  - `role="radiogroup"` y `role="radio"` con `aria-checked`.
  - Navegable por teclado (←/→).
  - Etiqueta visible y `aria-label` en cada opción.

### 4.3. Integración con `next-themes`
- Hook `useTheme()` provee `theme`, `setTheme`, `resolvedTheme`, `systemTheme`.
- Para evitar mismatch de hidratación: el componente debe ser `"use client"` y **renderizar un placeholder** hasta que `mounted === true` (patrón estándar documentado por `next-themes`).
- Persistencia: `next-themes` escribe automáticamente en `localStorage` con la `storageKey` definida. **No se requiere lógica adicional**.
- La opción "Sistema" delega en la media query `prefers-color-scheme` del navegador; si el SO cambia de tema en caliente, la app responde sin recarga.

### 4.4. Criterios de aceptación de la Fase 4
- [ ] Cambiar a "Oscuro" tiñe inmediatamente la app sin recarga.
- [ ] Cambiar a "Claro" restablece el aspecto original idéntico (regla de oro).
- [ ] Cambiar a "Sistema" sigue al SO al instante.
- [ ] Refrescar la página preserva la elección.
- [ ] No hay flash de tema incorrecto al cargar (FOUC).

---

## 5. Fase 5 — Manejo de iFrames (Looker Studio)

### 5.1. Premisa
El contenido **interno** de cada iframe lo renderiza Google Looker Studio. **No tenemos control** sobre los colores, paletas ni temas dentro de ese iframe a través de CSS desde nuestra app (el navegador aísla el documento por origen cruzado).

### 5.2. Alcance del modo oscuro respecto a los iframes
- ✅ **Sí controlamos:** la **tarjeta contenedora**, su fondo, borde, padding, sombra, y el chrome alrededor del iframe (header con el título del reporte, badges, botones de acción).
- ❌ **No controlamos:** colores internos del dashboard de Looker Studio.

### 5.3. Estrategia
1. **Marco oscuro elegante:** la card que envuelve cada iframe usa `dark:bg-slate-800` y `dark:border-slate-700`. Esto integra el iframe visualmente aunque su interior sea claro.
2. **Sin overlay encima del iframe:** se descartan filtros CSS tipo `filter: invert()` u overlays con `mix-blend-mode` porque distorsionan colores institucionales (logos, semáforos de KPI) y rompen la legibilidad del reporte.
3. **Recomendación a stakeholders (acción paralela, no bloqueante):** publicar en Looker Studio una **versión del reporte con tema oscuro** (Looker Studio permite definir tema en el editor) y conmutar la URL del `src` del iframe en función del `resolvedTheme`. Esta optimización es **opcional** y queda fuera del alcance del MVP del plan 19; se documenta como posible Fase 6.
4. **Margen de transición:** un breve `padding` interno en la card para que el borde del iframe blanco quede enmarcado por el navy de la card y no haya un corte abrupto.
5. **Loading skeleton del iframe:** si existe (revisar `ReportViewer.tsx`), su placeholder también recibe `dark:bg-slate-800` para no mostrar un cuadro blanco mientras carga.

### 5.4. Posible Fase 6 (futura, fuera de alcance)
- Mantener un **mapeo `reporteId → { lightUrl, darkUrl }`** y alternar `iframe.src` según `resolvedTheme`. Requiere que el equipo de datos publique las dos versiones en Looker Studio y mantenga la paridad. Se evaluará tras estabilizar la Fase 1–5.

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| FOUC al cargar (parpadeo claro→oscuro) | Media | Alto (UX) | `next-themes` con `attribute="class"` y `suppressHydrationWarning` en `<html>`. |
| Algún componente con estilo inline (`style={{}}`) que ignore `dark:` | Media | Medio | Auditoría con `grep` de `style={` en `src/`. Migrar a clases o duplicar el inline detrás de `useTheme`. |
| Contraste insuficiente en alguna pantalla | Media | Alto (accesibilidad) | Checklist WCAG AA por pantalla antes del merge. |
| Sombras grises que se ven feas sobre navy | Alta | Bajo | Tabla de paleta ya prevé `dark:shadow-black/30` o suprimir sombra. |
| Iframes de Looker se ven como un parche blanco | Alta (esperado) | Medio | Marco oscuro elegante + recomendación a equipo de datos para tema oscuro nativo en Looker. |
| Login fuera de tema | Baja | Bajo | Decisión explícita en 3.6. |
| Tailwind v4 sin `tailwind.config.ts` confunde a quien implemente | Alta | Bajo | Sección 0.1 de este plan lo aclara. |

---

## 7. Validación / QA antes de cerrar

- [ ] **Modo claro idéntico al actual:** comparar capturas antes/después en las páginas: dashboard, overview, sidebar abierto, modal admin, tabla admin, login. Cero diferencias visuales.
- [ ] **Modo oscuro completo:** ningún elemento queda con fondo blanco huérfano (excepto iframes Looker, que es esperado).
- [ ] **Persistencia:** elección sobrevive a recarga y cierre/apertura de pestaña.
- [ ] **Sistema:** cambiar el tema del SO en caliente refleja el cambio si la opción "Sistema" está activa.
- [ ] **Sin FOUC** en build de producción (`next build` + `next start`).
- [ ] **Sin warnings de hidratación** en consola.
- [ ] **Lighthouse Accessibility ≥ 95** en ambas vistas.

---

## 8. Entregables del plan

1. Este documento (`plan-19-modo-oscuro.md`).
2. Aprobación explícita del usuario antes de pasar a implementación.
3. Una vez aprobado, la implementación se dividirá en **commits secuenciales** alineados con las fases (3.8 sugiere el orden), permitiendo revisión incremental y rollback granular.

---

## 9. Pendientes de decisión (requieren input del usuario)

1. **Login:** ¿respeta tema o queda fijo en claro? (recomendación: respeta).
2. **Página de "Configuración":** ¿ya existe la ruta? Si no, ¿slug deseado? (`/dashboard/settings`, `/dashboard/configuracion`, otro).
3. **`storageKey`** para `next-themes`: ¿valor preferido? (sugerido: `dataroom-theme`).
4. **Tema por defecto en primera visita:** `system` (recomendado) o `light` forzado.
5. **Fase 6 (URLs duales de Looker para tema oscuro nativo):** ¿se contempla a futuro o se descarta?

---

**Fin del plan 19.** Esperando aprobación para proceder con la Fase 1.
