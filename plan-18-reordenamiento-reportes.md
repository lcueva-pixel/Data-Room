# Plan 18 — Reordenamiento de Reportes (Drag & Drop)

> **Tipo:** Plan de acción (no implementación).
> **Stack tocado:** Prisma + NestJS + Next.js + React + dnd-kit + TanStack Query.
> **Origen:** Los administradores necesitan modificar el orden en el que aparecen los reportes (y sub-reportes) en el Sidebar. La feature vivirá dentro del módulo "Gestión de Reportes" (`/dashboard/admin/reports`).

---

## 0. Resumen ejecutivo

Hoy el Sidebar ordena por `id: 'asc'` en [reports.service.ts:52](BACKEND/src/reports/reports.service.ts#L52). El plan introduce un campo `orderIndex` (Int) en `Report` que es la **única fuente de verdad del orden**. Un nuevo endpoint `PATCH /api/reports/reorder` reasigna esos índices en transacción atómica. El frontend incorpora drag & drop con **dnd-kit** (recomendado sobre las alternativas) en una **vista de modo reordenamiento** dentro de la tabla admin.

**Decisión arquitectónica clave:** el reordenamiento es **scoped por `padreId`** (entre hermanos). Un único campo `orderIndex` global es suficiente porque `buildTree` agrupa por padre y dentro de cada grupo respeta el orden de aparición de la query plana. No se necesita índice compuesto `(padreId, orderIndex)`.

---

## 1. Modelo mental y supuestos

| Concepto | Definición operativa |
|---|---|
| Hermanos | Reportes que comparten `padreId` (incluyendo el caso `padreId == null` → padres raíz). |
| Reordenamiento válido | Mover un reporte entre sus propios hermanos. **No** se permite cambiar de padre con drag & drop (eso es "mover", una feature distinta). |
| Orden global | Un solo `Int` por reporte. La query usa `orderBy: { orderIndex: 'asc' }` y `buildTree` agrupa correctamente. |
| Reasignación | Tras un drop, los hermanos del nivel afectado reciben índices 1, 2, 3, … de forma compacta (no incrementos de 100 ni gaps). |

**Supuestos a validar antes de codear:**

1. **Volumen.** Si un padre tuviera >100 hermanos, el reordenamiento tras cada drop manda 100 updates. En la práctica ese volumen no es realista para reportes administrados manualmente. Si llegara a serlo, hay optimizaciones con `orderIndex` espaciado (ej. 1024, 2048, …) — fuera de scope acá.
2. **Datos heredados.** Los reportes existentes no tienen `orderIndex`. La migración debe asignarles un valor consistente sin romper la jerarquía visible (Fase 1.2).
3. **Concurrencia.** Si dos admins reordenan simultáneamente, el último-en-escribir gana. No hay locking optimista en este plan; se documenta como riesgo aceptado.

---

## 2. Fase 1 — Base de Datos (Prisma)

### 2.1 Cambio en `schema.prisma`

Añadir al modelo `Report` ([schema.prisma:39-57](BACKEND/prisma/schema.prisma#L39-L57)):

```text
orderIndex Int @default(0) @map("order_index")
```

Decisiones:

- **Tipo `Int` (no `BigInt`).** 32 bits son más que suficientes para el universo de reportes administrados.
- **`@default(0)`.** Garantiza que cualquier inserción posterior a la migración tenga un valor definido aunque el código no lo provea explícitamente. El backfill posterior reemplaza estos ceros por valores ordenados (Fase 1.2).
- **Sin índice único.** Como el orden es scoped por padre y un mismo `orderIndex` puede aparecer en distintos niveles, **no se debe** poner `@@unique([padreId, orderIndex])` — eso bloquea el patrón de "swap" donde dos hermanos intercambian temporalmente índices iguales durante el update.
- **Sin índice secundario por ahora.** `orderBy: orderIndex` en una tabla pequeña no requiere índice. Si la tabla creciera mucho, añadir `@@index([orderIndex])` o `@@index([padreId, orderIndex])`.

### 2.2 Backfill de registros existentes

El flujo del proyecto usa `prisma db push` (no migraciones versionadas — heredado del Plan 16, no hay carpeta `prisma/migrations/`). Pasos:

1. **Editar `schema.prisma`** con el campo.
2. **`npx prisma db push --skip-generate`** → emite `ALTER TABLE cex_reportes ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0`. Todos los registros existentes quedan con `0`. **Cero pérdida de datos**.
3. **Backfill SQL** (ejecutado una sola vez, manualmente o vía `prisma db execute`):

   ```sql
   WITH ordered AS (
     SELECT
       id,
       ROW_NUMBER() OVER (
         PARTITION BY COALESCE(padre_id, -1)
         ORDER BY id ASC
       ) AS rn
     FROM cex_reportes
   )
   UPDATE cex_reportes r
   SET    order_index = ordered.rn
   FROM   ordered
   WHERE  r.id = ordered.id;
   ```

   Lo que hace:
   - Particiona por `padre_id` (con coalesce a `-1` para tratar a los padres raíz como un grupo unificado).
   - Asigna `1, 2, 3, …` por nivel basado en el orden actual de creación (`id` ascendente, equivalente a `fechaRegistro` en este proyecto).
   - Resultado: el orden visual del Sidebar después de la migración es **idéntico al de antes** (porque ambos eran "por id ascendente"). Cero impacto perceptible para el usuario, regresión cero.

4. **Regenerar cliente Prisma** una vez detenido el backend NestJS (mismo issue de DLL lock que en Plan 16):
   ```text
   npx prisma generate
   ```

### 2.3 Riesgo conocido: drift con producción

Si la BD de producción está en otro estado que dev (ej. tiene reportes que dev no tiene), el SQL de backfill debe correrse también en producción tras el `db push`. **Documentar como nota operativa** — no es responsabilidad del código.

---

## 3. Fase 2 — Backend (NestJS)

### 3.1 Endpoint nuevo: `PATCH /api/reports/reorder`

#### 3.1.1 Forma del payload

Hay dos formas posibles. Tradeoffs:

| Forma A | Forma B (recomendada) |
|---|---|
| `{ items: [{ id: 1, orderIndex: 1 }, …] }` | `{ padreId: number \| null, orderedIds: [3, 1, 7, 5] }` |
| Cliente decide los índices | Backend asigna 1..N según posición en el array |
| Riesgo de índices duplicados/gaps | Estado siempre canónico tras el update |

**Recomendación: Forma B.** Razones:

1. El cliente solo tiene que decir "este es el nuevo orden de los hermanos del padre X" — no le interesa qué número tiene cada uno.
2. Tras cada operación, los índices quedan compactos (1..N) sin gaps. Si en el futuro hay que mostrar "posición 3 de 10", el dato es directo.
3. Imposible enviar índices duplicados o no-contiguos por error del cliente.

DTO:

```text
class ReorderReportsDto {
  @IsOptional()
  @IsInt()
  padreId?: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  orderedIds: number[];
}
```

#### 3.1.2 Validaciones del service

Antes de tocar la BD, el service debe verificar:

1. **Todos los IDs existen.** `count` con `where: { id: { in: orderedIds } }` debe igualar `orderedIds.length`. Si no, `400 BadRequestException`.
2. **Todos los IDs comparten el mismo `padreId`** que el provisto en el payload. Esto previene mover hermanos entre padres por error. Query: `findMany` con `select: { id: true, padreId: true }` y verificar que todos tengan el `padreId` esperado (incluyendo el caso `null === null` que TypeScript/Prisma maneja como esperado pero hay que cubrir explícito).
3. **No duplicados** en `orderedIds` (hash set check antes de tocar BD).

Si alguna validación falla → `BadRequestException` con mensaje específico, sin escribir nada.

#### 3.1.3 Transacción

```text
await this.prisma.$transaction(
  orderedIds.map((id, idx) =>
    this.prisma.report.update({
      where: { id },
      data: { orderIndex: idx + 1 },
    }),
  ),
);
```

Decisiones:

- **Una transacción para todo el lote.** Si una sola falla, ninguna se aplica.
- **`idx + 1`** (no `idx`): índices arrancan en 1 para legibilidad humana en logs.
- **Sin lock explícito.** Para el volumen esperado (decenas de reportes por nivel), Postgres ya serializa correctamente las escrituras. Si se quisiera defensa contra concurrencia, usar `SELECT … FOR UPDATE` en una transacción más larga — pero fuera de scope.

#### 3.1.4 Auditoría

Al final, registrar en `LogService`:

```text
await this.logService.register({
  usuarioId: executorId,
  accion: 'REORDENAR_REPORTES',
  detalle: `Reordenados ${orderedIds.length} reportes (padre=${padreId ?? 'raíz'})`,
});
```

#### 3.1.5 Guard

`@UseGuards(AdminGuard)` (mismo patrón que `findAllAdmin`, `create`, `update`, etc.). No-admins no pueden reordenar.

### 3.2 Modificación del `findByRole` (Sidebar)

[reports.service.ts:52](BACKEND/src/reports/reports.service.ts#L52):

```text
orderBy: { id: 'asc' }   →   orderBy: { orderIndex: 'asc' }
```

`buildTree` no requiere cambios — agrupa por `padreId` y respeta el orden de aparición de la query plana. Cuando la query plana viene ordenada por `orderIndex`, los hijos de cada padre aparecen ya en el orden correcto y `buildTree` los inserta en sus respectivos `children` arrays en ese mismo orden.

### 3.3 Modificación del `findAllAdmin` (tabla admin)

[reports.service.ts:9](BACKEND/src/reports/reports.service.ts#L9):

- Añadir `'orderIndex'` a `VALID_SORT_FIELDS`.
- Cambiar el default de `toValidSortField`: cuando no se especifica `sortBy`, usar `'orderIndex'` en vez de `'id'`. Esto hace que la tabla admin abra ordenada por defecto en el orden visual del Sidebar (que es lo que un admin espera al "ver el listado").
- Mantener el comportamiento manual: si el admin clickea ordenar por título, sigue funcionando.

### 3.4 Modificación del `findChildren`

[reports.service.ts:82-92](BACKEND/src/reports/reports.service.ts#L82-L92): cambiar `orderBy: { id: 'asc' }` a `{ orderIndex: 'asc' }` por consistencia.

### 3.5 Cuando se crea un reporte nuevo (`create`)

Hoy [reports.service.ts:127](BACKEND/src/reports/reports.service.ts#L127) crea sin asignar `orderIndex`, así que tomaría el `@default(0)`. Eso es un bug latente — el nuevo aparecería al inicio del nivel.

**Fix necesario en el mismo plan:** al crear, calcular el siguiente índice del nivel:

```text
const max = await this.prisma.report.aggregate({
  where: { padreId: dto.padreId ?? null },
  _max: { orderIndex: true },
});
const nextIndex = (max._max.orderIndex ?? 0) + 1;
```

Y pasar `orderIndex: nextIndex` al `create`. Garantiza que los nuevos siempre van al final del nivel — comportamiento esperado.

### 3.6 Tests sugeridos (backend)

1. POST `/reports/reorder` con orderedIds de hermanos válidos → 200, BD refleja nuevo orden.
2. POST con un id que no es hermano de los demás → 400.
3. POST con un id inexistente → 400.
4. POST con duplicados → 400.
5. POST como no-admin → 403.
6. Crear reporte nuevo en un nivel con 5 hermanos → el nuevo tiene `orderIndex = 6`.
7. Sidebar tras reordenar → refleja el nuevo orden sin tocar el frontend.

---

## 4. Fase 3 — Frontend y UX

### 4.1 Elección de librería de drag & drop

Comparativa:

| Librería | Estado | Compatibilidad | Accesibilidad | Recomendación |
|---|---|---|---|---|
| `react-beautiful-dnd` | **Deprecada oficialmente** (Atlassian la archivó) | ⚠️ React 18 OK, React 19 problemático | Buena | ❌ No usar |
| `@hello-pangea/dnd` | Fork mantenido de RBD | React 18/19 ✅ | Buena | ⚠️ Funciona, pero API antigua |
| **`dnd-kit`** | Activamente mantenido | React 18/19 ✅, Next 16 ✅ | **Excelente** (teclado, screen readers) | ✅ **Recomendado** |

**Decisión: `dnd-kit`.** Razones técnicas:

1. **Modular**: solo importas lo que usas (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`). Bundle más pequeño que las alternativas.
2. **Sin requisitos de DOM peculiares**: a diferencia de RBD/hello-pangea que requieren `<Droppable>` envolviendo elementos específicos, `dnd-kit` usa hooks (`useDraggable`, `useSortable`) y funciona en cualquier estructura.
3. **Soporte nativo de teclado** (Space para tomar, flechas para mover, Enter para soltar) — accesibilidad por defecto.
4. **Tipado TypeScript de primer nivel** — no hay `any` espurios.
5. **Compatible con tu stack**: Tailwind, Shadcn UI, TanStack Query — sin fricciones documentadas.

Paquetes a instalar (más adelante, fuera de este plan):
```text
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 4.2 Decisión de UX: ¿drag & drop directo en la tabla o modo reordenamiento?

La tabla admin actual ([ReportTable.tsx](frontend/src/components/admin/ReportTable.tsx)) es **paginada** (5/10/20/50 por página) y **plana** (no muestra estructura padre/hijo, solo un `↳` decorativo). Eso choca con el reordenamiento porque:

- Si el usuario está en la página 2 viendo 5 hermanos, ¿puede arrastrar uno a la página 1?
- Si dos hermanos están separados (uno en página 1, otro en 3), ¿cómo se reordenan?
- Si el orden por defecto es `orderIndex`, pero el usuario lo cambió a "ordenar por título", ¿el drag tiene sentido?

**Recomendación: introducir un "modo reordenamiento" toggleable.**

Diseño:

- Botón **"Reordenar"** en la cabecera de `ReportTable` (junto a "Nuevo Reporte").
- Al activarlo:
  - **Se desactiva la paginación** (muestra todos los reportes).
  - **Se desactiva la búsqueda y los filtros** (mostrar mensaje *"Filtros pausados durante reordenamiento"*).
  - **Los reportes se agrupan visualmente por padre** — un acordeón expandible por nivel de padre, con un sub-grupo "Reportes raíz" en el tope.
  - **Solo se puede arrastrar entre hermanos** (mismo `padreId`). La librería `dnd-kit` permite definir `containers` (un container por nivel) y bloquear drop entre containers.
  - Botones **"Guardar orden"** y **"Cancelar"** en una barra fija inferior. Hasta que el admin no confirma, el orden no se persiste — es local.
- Al salir del modo (guardar o cancelar), volver a la tabla paginada normal.

**Por qué no drag & drop directo en la tabla paginada:**

- Confusión UX: arrastrar entre páginas no es intuitivo en HTML nativo.
- Ambigüedad: si el sort actual no es `orderIndex`, drag no tiene semántica clara.
- Riesgo de errores: arrastrar un reporte cuyo padre no está visible.

El modo dedicado evita los tres problemas.

### 4.3 Componente nuevo: `ReportReorderView`

Estructura:

```text
<ReportReorderView reports={flatList} onSave={...} onCancel={...}>
  <ReorderGroup padreId={null} title="Reportes raíz">
    <SortableItem id={1}>Padre 1</SortableItem>
    <SortableItem id={2}>Padre 2</SortableItem>
  </ReorderGroup>
  <ReorderGroup padreId={1} title="Sub-reportes de Padre 1">
    <SortableItem id={5}>Hijo A</SortableItem>
    <SortableItem id={6}>Hijo B</SortableItem>
  </ReorderGroup>
  …
</ReportReorderView>
```

Cada `ReorderGroup` envuelve un `<DndContext>` independiente (o un solo `<DndContext>` con múltiples `<SortableContext>` — patrón de dnd-kit). El `id` del item es el `report.id`.

Datos: la vista necesita la **lista completa sin paginar**. Eso requiere o (a) un endpoint nuevo que devuelva todo, o (b) reusar `findByRole` (que ya devuelve el árbol entero) — pero eso solo trae reportes activos visibles al usuario. Para admin se necesitan **todos** (incluso desactivados).

**Decisión:** reusar `findAllAdmin` con `limit=9999` o, más limpio, exponer un nuevo endpoint admin `GET /api/reports/admin/all-flat` que devuelva todos sin paginar. Recomendar el segundo — paginación y reordenamiento son mundos distintos y mezclarlos es deuda técnica.

### 4.4 Optimistic update con TanStack Query

Patrón:

1. Usuario suelta un reporte → handler `onDragEnd` calcula el nuevo array `orderedIds` para el nivel afectado.
2. **Actualización optimista del cache local** vía `useMutation.onMutate`:
   - Cancelar fetches en curso de `['admin-reports']` y `['report-tree']` (Sidebar).
   - Snapshot del estado anterior.
   - Mutar el cache: reordenar los items en el árbol/lista.
   - Devolver el snapshot como context.
3. **`mutationFn`** envía `PATCH /api/reports/reorder` con `{ padreId, orderedIds }`.
4. **Si éxito (`onSuccess`)** → invalidar `['admin-reports']` y disparar `window.dispatchEvent(new Event('refresh-reports'))` (mismo patrón que ya usa el proyecto en `useAdminReports.toggleMutation`) para que el Sidebar refetchee.
5. **Si falla (`onError`)** → restaurar el snapshot, mostrar toast de error.

El usuario ve el cambio instantáneo (0ms perceptible) y solo si el servidor rechaza ve el rollback.

### 4.5 Sidebar — comportamiento esperado

[Sidebar.tsx](frontend/src/components/dashboard/Sidebar.tsx) consume `reports` desde [useReports.ts](frontend/src/hooks/useReports.ts) que llama a `/api/reports`. Una vez que `findByRole` ordene por `orderIndex` (Fase 2.2), el Sidebar **respeta automáticamente** el nuevo orden sin requerir cambios.

Verificación esperada en QA:

- Reordenar en `/dashboard/admin/reports` → guardar.
- Cambiar a `/dashboard` → el Sidebar refleja el nuevo orden.
- Si el evento `refresh-reports` está bien wireado (ya lo está), no hace falta refresh manual.

### 4.6 Tipos TypeScript

Añadir en [report.types.ts](frontend/src/types/report.types.ts):

```text
export interface Report {
  …
  orderIndex: number;
}

export interface ReorderReportsPayload {
  padreId: number | null;
  orderedIds: number[];
}
```

Y en `useAdminReports`, una nueva mutation:

```text
const reorderMutation = useMutation({
  mutationFn: (payload: ReorderReportsPayload) =>
    api.patch('/reports/reorder', payload).then((r) => r.data),
  onMutate: async (payload) => { … },  // optimistic
  onError: (err, payload, ctx) => { … },  // rollback
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    window.dispatchEvent(new Event('refresh-reports'));
    toast.success('Orden actualizado');
  },
});
```

---

## 5. Plan de implementación por orden de ejecución

> Orden sugerido. Cada paso verificable de forma aislada.

1. **Schema + backfill**
   - Editar `schema.prisma` con `orderIndex Int @default(0) @map("order_index")`.
   - `npx prisma db push --skip-generate`.
   - Ejecutar el SQL de backfill (sección 2.2).
   - Regenerar cliente: `npx prisma generate` (con backend detenido por el lock de DLL en Windows).
2. **Backend — lectura ordenada**
   - Cambiar `findByRole`, `findAllAdmin`, `findChildren` para usar `orderBy: { orderIndex: 'asc' }`.
   - Verificar que el Sidebar y la tabla admin siguen funcionando (orden idéntico al previo gracias al backfill).
3. **Backend — `create` corregido**
   - Calcular `nextIndex` con `aggregate _max` en `create`. Verificar que crear un reporte nuevo lo deja al final del nivel.
4. **Backend — endpoint `reorder`**
   - DTO + service method + controller con `@UseGuards(AdminGuard)`.
   - Validaciones (existencia, hermandad, no duplicados).
   - Transacción.
   - Auditoría.
5. **Frontend — tipos**
   - `Report.orderIndex: number`.
   - `ReorderReportsPayload`.
   - `useAdminReports.reorder`.
6. **Frontend — endpoint admin `all-flat`** (si se decide)
   - O usar `?limit=9999` como atajo inicial.
7. **Frontend — `ReportReorderView`**
   - Modo toggleable con botón en la cabecera de `ReportTable`.
   - `dnd-kit` con un `<SortableContext>` por nivel.
   - Estado local pendiente de "Guardar"/"Cancelar".
8. **Frontend — optimistic update**
   - Wireado en `useAdminReports.reorderMutation` con `onMutate`/`onError`.
   - Disparo de `refresh-reports` para que el Sidebar reaccione.
9. **QA manual**
   - Reordenar padres raíz, refresh, ver Sidebar — debe coincidir.
   - Reordenar hijos de un padre, ver tarjetas del Plan 15 reordenadas en el dashboard del padre.
   - Crear un reporte nuevo → aparece al final del nivel (ni primero ni en posición arbitraria).
   - Reordenar y refrescar la página antes de guardar → sin cambios persistidos (modo descartable).

---

## 6. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Backfill falla a mitad y deja registros con `orderIndex = 0` | Baja | Medio | El SQL es atómico (un solo UPDATE). Si falla, ninguno se aplica. |
| Dos admins reordenan al mismo tiempo | Baja | Medio | Last-write-wins documentado. Si crece el equipo, considerar lock optimista con `updatedAt`. |
| `dnd-kit` requiere CSS específico que choca con Tailwind | Baja | Bajo | dnd-kit es CSS-agnóstico — no tiene estilos propios. Compatible nativamente con Tailwind. |
| Reordenar muchos hermanos genera N updates lentos | Media | Bajo | Transacción Prisma con todas las updates → un round-trip al pool de conexiones. Para N < 100 es <100ms. |
| Endpoint reorder se invoca desde un cliente malicioso con IDs cruzados de padres distintos | Baja | Alto | Validación de hermandad en el service (sección 3.1.2). |
| Optimistic update queda desincronizado si el servidor rechaza | Media | Bajo | `onError` revierte al snapshot + toast de error. Patrón estándar de TanStack Query. |
| El `findByRole` cambia de orden pero el Sidebar tiene cache obsoleto | Baja | Bajo | Evento `refresh-reports` ya wireado; `useReports` lo escucha. |
| Reordenamiento toca la `fechaRegistro` indirectamente (Prisma `updatedAt`) | N/A | N/A | El modelo `Report` no tiene `updatedAt`. No hay campo que se actualice automáticamente. |

---

## 7. Decisiones registradas

1. **Un solo campo `orderIndex` global**, no compuesto. `buildTree` agrupa por padre y respeta orden de aparición — suficiente.
2. **Forma B del payload** (`{ padreId, orderedIds }`). El backend asigna 1..N en transacción.
3. **dnd-kit** sobre `@hello-pangea/dnd` y `react-beautiful-dnd`. Razones de mantenimiento, accesibilidad y bundle.
4. **Modo "Reordenar" toggleable** en la tabla admin, no drag & drop directo en la tabla paginada.
5. **Reordenamiento scoped a hermanos**, no movimiento entre padres. "Mover a otro padre" es feature aparte.
6. **Backfill basado en `id` ascendente** (= orden actual del Sidebar). Regresión cero al desplegar.
7. **`prisma db push`** sigue siendo el flujo (heredado de Plan 16). Si se decide migrar a migraciones versionadas, es un Plan separado.

---

## 8. Métricas de éxito

- [ ] Tras el backfill, el Sidebar muestra los reportes en el mismo orden que antes (cero cambio visual).
- [ ] Al reordenar y guardar desde admin, el Sidebar refleja el cambio sin refresh manual.
- [ ] Crear un reporte nuevo lo deja al final de su nivel (no en posición 1).
- [ ] El endpoint `reorder` rechaza payloads con IDs de padres distintos.
- [ ] El reordenamiento es accesible por teclado (Space, flechas, Enter — gracias a dnd-kit).
- [ ] Refrescar la página durante el modo "Reordenar" sin guardar → cero persistencia (descartable).
- [ ] Optimistic update se ve instantáneo (<16ms perceptible) y revierte limpiamente si el servidor falla.
- [ ] `tsc --noEmit` limpio en backend y frontend.

---

## 9. Fuera de alcance

- **Mover entre padres con drag & drop** — feature distinta ("re-parent"), requiere validación anti-ciclos en frontend (ya existe en backend, pero la UI necesita feedback inmediato).
- **Drag & drop reordenando árbol completo de un golpe** — dnd-kit lo soporta pero la UX se vuelve compleja con jerarquías profundas.
- **Persistir el orden por usuario** (cada admin tiene su propio orden personalizado) — no es lo pedido, pero es una variación natural si surge.
- **Animaciones avanzadas** (springs, easings custom). dnd-kit trae transiciones razonables por defecto.
- **Reordenamiento masivo desde CSV/JSON import** — out of scope.
- **Migración a migraciones versionadas de Prisma** — sigue siendo `db push`. Si se decide, es Plan aparte.

---

**Fin del plan.**
