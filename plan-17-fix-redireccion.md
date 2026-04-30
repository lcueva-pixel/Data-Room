# Plan 17 — Fix de redirección forzada al Reporte 1

> **Tipo:** Plan de acción (no implementación).
> **Stack tocado:** Next.js (App Router) + React state.
> **Síntoma:** Tras login, al hacer clic en cualquier reporte distinto al primero (ej. Reporte 3) desde el Sidebar, el sistema termina mostrando el Reporte 1.

---

## 0. Hipótesis inicial vs. realidad

El enunciado describe el bug como una "condición de carrera" donde alguna lógica de inicialización pisa la selección del usuario. Tras un primer rastreo (sin modificar nada), confirmo que **no es exactamente una race condition**: es un **bug de propagación de intent**. El `Sidebar`, cuando se invoca desde la página de Overview o desde las páginas de Admin, **descarta cuál reporte clickeó el usuario** y solo navega a `/dashboard`. Luego, en `/dashboard`, un `useEffect` auto-selecciona `reports[0]` por diseño.

Llamarlo "race condition" es razonable desde la perspectiva del usuario (algo se sobreescribe), pero el fix correcto no es un `setTimeout` ni un guard temporal — es **propagar el ID del reporte clickeado a través de la navegación** y consumirlo en el destino.

> Esta distinción importa porque guía el tipo de fix: no es "evita que el efecto pise tu selección" sino "haz que tu selección llegue al efecto".

---

## 1. Fase 1 — Rastreo del bug

### 1.1 Archivos a auditar (lista priorizada)

Por orden de probabilidad de contener el origen:

| # | Archivo | Por qué importa |
|---|---|---|
| 1 | [frontend/src/app/dashboard/page.tsx](frontend/src/app/dashboard/page.tsx) | Aquí vive `selectedReport` local + el `useEffect` que auto-selecciona `reports[0]`. |
| 2 | [frontend/src/app/dashboard/overview/page.tsx](frontend/src/app/dashboard/overview/page.tsx) | Renderiza el Sidebar fuera de `/dashboard`. Sospechoso de no propagar el ID. |
| 3 | [frontend/src/app/dashboard/admin/layout.tsx](frontend/src/app/dashboard/admin/layout.tsx) | Igual que el anterior — Sidebar embebido en sección admin. |
| 4 | [frontend/src/components/dashboard/Sidebar.tsx](frontend/src/components/dashboard/Sidebar.tsx) | Solo invoca el callback `onReportSelect(report)`; el bug no está aquí. |
| 5 | [frontend/src/hooks/useReports.ts](frontend/src/hooks/useReports.ts) | Para descartar que `setReports` reset al árbol cause re-firing del efecto. |

### 1.2 Patrones a buscar (con grep)

- `router.push` y `router.replace` que apunten a `/dashboard` **sin** pasar el ID del reporte.
- Asignaciones a `selectedReport` con `reports[0]`.
- `useEffect` con dependencias `[reports, selectedReport]` que asignen el primer elemento.
- `setSelectedReport(null)` o cualquier punto donde `selectedReport` pueda volverse `null` después del primer click.

### 1.3 Hallazgos del rastreo (resumen, ya ejecutado)

Un grep cruzado de `onReportSelect` y `setSelectedReport` revela el patrón problemático:

- **`/dashboard/overview/page.tsx:106`** — `onReportSelect={() => router.push('/dashboard')}` — el callback **descarta el `report` que recibe**.
- **`/dashboard/admin/layout.tsx:34`** — mismo patrón: `onReportSelect={() => router.push('/dashboard')}`.
- **`/dashboard/page.tsx:39-43`** — el efecto:
  ```text
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0]);
    }
  }, [reports, selectedReport]);
  ```

### 1.4 Reconstrucción del flujo del bug

1. Usuario hace login → aterriza en `/dashboard/overview`.
2. Hace clic en "Reporte 3" en el Sidebar.
3. El Sidebar invoca `onReportSelect(reporte3)`.
4. **El callback en `overview/page.tsx` ignora ese argumento** y ejecuta `router.push('/dashboard')`.
5. `/dashboard` se monta. `useReports` arranca el fetch. `selectedReport` empieza en `null`.
6. Cuando los reportes cargan, el efecto detecta `!selectedReport` y asigna `reports[0]`.
7. Usuario ve Reporte 1. Bug.

El mismo flujo ocurre desde cualquier ruta `/dashboard/admin/*`.

**Por qué funciona "bien" estando ya en `/dashboard`:** ahí el callback es `handleReportSelect(report)` ([page.tsx:88](frontend/src/app/dashboard/page.tsx#L88)) que sí usa el argumento y llama a `setSelectedReport(report)`. No hay navegación, no hay remount, el estado local se respeta.

---

## 2. Fase 2 — Análisis del estado y los efectos

### 2.1 ¿Hay un gestor de estado global?

**No.** El proyecto no usa Zustand, Redux ni Context para `selectedReport`. La selección vive como estado local de `/dashboard/page.tsx` (`useState`). Esto es relevante porque significa que **al navegar entre rutas el estado se pierde** — no porque haya un "reset", sino porque el componente que lo guarda se desmonta.

NextAuth no toca nada relacionado con la selección de reportes. No hay efecto colateral por ahí.

### 2.2 Sobre el `useEffect` de auto-selección

Aislado, ese efecto **no es el bug**. Es una decisión de UX legítima: "si el usuario llega a `/dashboard` sin un reporte seleccionado, muéstrale el primero". El problema es que **se está activando cuando el usuario sí tenía intent**, porque ese intent se perdió en la navegación.

Sin embargo, el efecto tiene una **fragilidad latente** que conviene documentar y mitigar al pasar:

- La condición `!selectedReport` se vuelve `true` cualquier vez que `selectedReport` sea `null`. Si en el futuro algún flujo limpia la selección (por ejemplo, "deseleccionar"), el efecto la pisaría. La condición correcta para un default-once es **`mounted` + un flag de "ya se inicializó"** o ejecutar la lógica solo en el primer render con `reports` poblado.

### 2.3 ¿Es realmente una race condition?

Estrictamente no. Si fuera carrera entre dos `setState`, el síntoma sería intermitente. Acá es **determinista**: si vienes de Overview o Admin, vas a Reporte 1, sin importar lo que clickeaste. Es un bug de diseño, no de timing.

Aun así, hay un **factor temporal que da apariencia de carrera**: la primera carga de `useReports` puede tardar. Si el usuario fuera ágil y aterrizara en `/dashboard` con un ID de query string (en una solución futura) y `useReports` aún no resolvió, el efecto que haga match por ID **antes** de que llegue la lista podría no encontrar el reporte y caer al default. Eso sí sería una race real y hay que prevenirla en la solución (ver 3.2).

---

## 3. Fase 3 — Propuesta de solución

### 3.1 Decisión arquitectónica: ¿cómo se propaga el "intent"?

El plan menciona dos pistas: `usePathname` y "params de Next.js". Eso sugiere que la URL debe reflejar la selección. Hay tres niveles de invasividad:

| Opción | URL resultante | Cambios | Soporta deep-link |
|---|---|---|---|
| **A. Search param** | `/dashboard?reportId=3` | Mínimos: 3-4 archivos | Sí |
| **B. Ruta dinámica** | `/dashboard/3` | Refactor: nueva ruta `[reportId]` y revisión de toda la página | Sí |
| **C. URL hash** | `/dashboard#3` | Mínimos | Parcial (no se envía al server) |

**Recomendación:** **Opción A — search param**. Razones:

1. Soluciona el bug con cambios localizados (no toca la arquitectura del dashboard).
2. La URL sigue reflejando la selección (el usuario puede compartir/marcar `/dashboard?reportId=3`).
3. Es trivialmente compatible con el flujo de "auto-select primer reporte si no hay intent": ausencia de `reportId` → default; presencia → respeta.
4. Si en el futuro quieres pasar a Opción B (rutas dinámicas), la API queda igual — solo cambia el lugar de donde sale el ID.

Opción B es más "Next.js-idiomática" pero requiere mover la lógica de `/dashboard/page.tsx` a `/dashboard/[reportId]/page.tsx`, decidir qué hace `/dashboard` sin ID (redirect al primero o estado vacío), y migrar tracking de selección. **Eso amerita un Plan 18 dedicado**, no se debería hacer mezclado con un fix.

### 3.2 Plan de implementación (Opción A)

#### 3.2.1 Sidebar callbacks externos al dashboard

Cambiar los dos call-sites que descartan el `report`:

- **`overview/page.tsx:106`** → en lugar de `router.push('/dashboard')`, hacer `router.push(\`/dashboard?reportId=${report.id}\`)`.
- **`admin/layout.tsx:34`** → mismo cambio.

Tipo del callback: `onReportSelect: (report: Report) => void` ya recibe el reporte. El cambio es de una línea cada uno.

#### 3.2.2 Lectura del search param en `/dashboard/page.tsx`

Usar el hook `useSearchParams` de `next/navigation`. La lógica de selección queda:

```text
const searchParams = useSearchParams();
const reportIdFromUrl = searchParams.get('reportId');

useEffect(() => {
  if (!reports.length) return;          // espera a que cargue la lista
  if (reportIdFromUrl) {
    const found = findInTree(reports, Number(reportIdFromUrl));
    if (found) {
      setSelectedReport(found);
      return;
    }
    // ID inválido: caer al default sin romper UX
  }
  if (!selectedReport) {
    setSelectedReport(reports[0]);
  }
}, [reports, reportIdFromUrl]);
```

Detalles importantes:

- **Esperar a `reports.length > 0`**: previene la race real (3.2.3 más abajo).
- **`findInTree`**: el reporte puede ser un nodo profundo, no un raíz. Hay que recorrer el árbol entero. Ya existe `findParent` en `dashboard/page.tsx`; conviene extraer un util `findById` reutilizable.
- **Manejo de ID inválido**: si el search param apunta a un reporte que el usuario no tiene permiso de ver, o uno que ya no existe, **fallback al primero** (no romper la pantalla).
- **No remover `selectedReport` de las dependencias**: si el usuario clickea otro reporte en el Sidebar (estando ya en `/dashboard`), la URL no cambia pero `selectedReport` sí — y el efecto no debería re-disparar el match-by-id.

> **Decisión de diseño:** una vez que el usuario está en `/dashboard`, los clicks del Sidebar siguen actualizando solo el estado local (no la URL). Esto preserva el comportamiento actual y evita historial de navegación basura. El search param solo se usa como **mecanismo de transferencia de intent al entrar a `/dashboard`**, no como fuente de verdad continua.

> **Alternativa:** si quieres que la URL siempre refleje la selección (mejor para compartir/refresh), `handleReportSelect` puede hacer `router.replace(\`/dashboard?reportId=\${id}\`, { scroll: false })`. Tradeoff: añade entradas al historial salvo que se use `replace`. Recomendación: **no por ahora**, dejarlo para Plan 18 si se decide ir a rutas dinámicas.

#### 3.2.3 Prevenir la race real

La race que sí puede ocurrir: el usuario llega a `/dashboard?reportId=3` directamente (refresh, deep link, login que redirige), y el efecto corre dos veces — una con `reports = []` y otra con la lista cargada.

- Primera corrida: `reports.length === 0`, no hace nada (el guard nuevo).
- Segunda corrida: `reports` poblado, hace match por ID, asigna correctamente.

Sin el guard `if (!reports.length) return`, la primera corrida caería al `setSelectedReport(reports[0])` por la falla del match — y al re-correr el efecto con la lista llena, `!selectedReport` ya sería `false`, así que la rama del search param no volvería a evaluarse. Resultado: bug exactamente igual al original. Por eso el guard es **obligatorio**, no opcional.

#### 3.2.4 Respeto del intent de "no hay reporte seleccionado"

Caso borde: si en el futuro alguien quiere mostrar `/dashboard` sin ningún reporte seleccionado (estado vacío deliberado), el efecto actual lo rompería. Solución: introducir un flag local `didInitialize`:

```text
const [didInitialize, setDidInitialize] = useState(false);

useEffect(() => {
  if (didInitialize || !reports.length) return;
  // ... lógica de match-by-id o default ...
  setDidInitialize(true);
}, [reports, reportIdFromUrl, didInitialize]);
```

Esto convierte la auto-selección en "default-once" en lugar de "default-while-null". Es la corrección correcta del `useEffect` original (Fase 2.2).

### 3.3 Verificación esperada

Casos de prueba a recorrer manualmente tras el fix:

1. Login → aterriza en Overview → click en Reporte 3 → debería ver Reporte 3 (no Reporte 1).
2. Login → aterriza en Overview → click en Reporte 1 → ve Reporte 1 (default por search param).
3. En `/dashboard` viendo Reporte 5, click en Reporte 7 desde el Sidebar → cambia a Reporte 7 inmediatamente, sin navegación.
4. Refresh de `/dashboard?reportId=3` → carga directamente Reporte 3.
5. Acceder a `/dashboard?reportId=99999` (id inválido) → fallback a Reporte 1, sin pantalla rota.
6. Click en sub-reporte (hoja de un padre con dashboard) desde Overview → debería abrir el dashboard del padre con el hijo destacado (Plan 15 sigue funcionando — el `handleReportSelect` de `dashboard/page.tsx` maneja esa lógica).

### 3.4 Lo que NO cambia

- La estructura de `useReports` queda igual.
- El comportamiento de `Sidebar` queda igual (sigue invocando `onReportSelect(report)`).
- La auto-selección del primer reporte sigue siendo el default — solo deja de pisarse cuando hay intent explícito.
- Las rutas admin (`/dashboard/admin/*`) y Overview (`/dashboard/overview`) siguen siendo páginas separadas.

---

## 4. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El search param queda en la URL para siempre | Alta (cosmético) | Bajo | Aceptar; si molesta, hacer `router.replace('/dashboard')` después de aplicar el match |
| Click en sub-reporte desde Overview rompe la lógica del Plan 15 (highlight + scroll) | Media | Medio | Pasar también el "scrollTo" como search param, o redirigir al ID del padre — auditar `findParent` en el destino |
| `useSearchParams` requiere Suspense boundary en algunas configuraciones de Next 16 | Baja | Bajo | Si Next se queja, envolver el contenido de `/dashboard/page.tsx` en `<Suspense>` |
| Reporte buscado por ID no es visible para el usuario actual (permisos) | Baja | Bajo | Fallback a `reports[0]` documentado en 3.2.2 |

---

## 5. Plan de implementación por orden de ejecución

1. **Extraer `findById(tree, id)`** a un util reutilizable (puede vivir junto a `findParent` en `dashboard/page.tsx` o en `lib/reports.ts`).
2. **Modificar `/dashboard/page.tsx`** — añadir `useSearchParams`, refactorizar el `useEffect` de auto-select según 3.2.2 + 3.2.4.
3. **Modificar `/dashboard/overview/page.tsx:106`** — pasar `report.id` en el push.
4. **Modificar `/dashboard/admin/layout.tsx:34`** — pasar `report.id` en el push.
5. **QA manual** — recorrer los 6 casos de 3.3.

---

## 6. Fuera de alcance

- Migrar a rutas dinámicas `/dashboard/[reportId]` — Plan 18 si se decide.
- Persistir la última selección entre sesiones (localStorage) — feature aparte.
- Sincronizar la selección desde el dashboard hacia la URL en tiempo real — fuera del scope del fix.
- Mejorar UX cuando un reporte solicitado por URL no existe (mostrar mensaje específico vs. fallback silencioso).

---

## 7. Métricas de éxito

- [ ] Click en Reporte 3 desde Overview → muestra Reporte 3.
- [ ] Click en Reporte 3 desde Admin → muestra Reporte 3.
- [ ] Refresh de `/dashboard?reportId=N` → carga el reporte N directamente.
- [ ] Sin search param, comportamiento del default-first preservado.
- [ ] Cero regresiones en el flujo del Plan 15 (dashboard de padres + scroll a hijos).

---

**Fin del plan.**
