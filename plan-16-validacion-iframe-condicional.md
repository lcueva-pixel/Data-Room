# Plan 16 — Validación Condicional de `urlIframe` (Padre vs Hijo)

> **Tipo:** Plan de acción (no implementación).
> **Stack tocado:** Prisma + NestJS (`class-validator`) + Next.js + React Hook Form + Zod.
> **Origen:** Tras el Plan 15 (Dashboard Unificado), un reporte padre puede tener `urlIframe` vacío (es solo contenedor). Hoy el sistema lo exige siempre, lo cual ya no refleja la semántica.

---

## 0. Resumen ejecutivo

| Caso | Hoy | Después de este plan |
|---|---|---|
| Crear/editar **padre** (`padreId == null`) | `urlIframe` obligatorio | `urlIframe` opcional. Si se llena, se usa como banner del dashboard (Plan 15). Si se omite, el dashboard arranca con la grilla de hijos. |
| Crear/editar **hijo** (`padreId != null`) | `urlIframe` obligatorio | `urlIframe` obligatorio (sin cambios funcionales). |
| Validación de formato (`https://`) | Aplica si está presente | Sin cambios — sigue aplicando solo cuando se proporcione un valor. |

La regla queda: **"opcional si es padre, requerido si es hijo"**, alineada con el modelo mental del Plan 15.

---

## 1. Hallazgos de auditoría previos al plan

Antes de codear hay que ser explícito sobre el estado actual, porque el enunciado del requerimiento asume un dropdown de "Reporte Padre" que **no existe**:

1. **`schema.prisma`** ([BACKEND/prisma/schema.prisma:43](BACKEND/prisma/schema.prisma#L43)) — `urlIframe String @map("url_iframe")` está como **NOT NULL**.
2. **`CreateReportDto`** ([BACKEND/src/reports/dto/create-report.dto.ts:11-15](BACKEND/src/reports/dto/create-report.dto.ts#L11-L15)) — siempre obligatorio.
3. **`UpdateReportDto`** ([BACKEND/src/reports/dto/update-report.dto.ts:8-13](BACKEND/src/reports/dto/update-report.dto.ts#L8-L13)) — opcional vía `@IsOptional`, pero no valida en función de `padreId`.
4. **`ReportForm.tsx`** — no tiene dropdown de padre. La paternidad se determina por:
   - `lockedParentId` (prop, viene desde [ChildReportsSection.tsx:107](frontend/src/components/admin/ChildReportsSection.tsx#L107) cuando se crea un sub-reporte).
   - `initialValues.padreId` (cuando se edita un reporte existente).
5. **Datos en BD** — al ser hoy `urlIframe` NOT NULL, **todos los reportes existentes tienen URL**. No hay registros "huérfanos" que rompan al migrar a NULL.

Conclusión: la lógica condicional del frontend se basa en lo que el form ya conoce (`lockedParentId` + `initialValues.padreId`). **No hace falta un dropdown nuevo** para satisfacer el requerimiento; sí hay que decidir si se añade uno (sección 3.4).

---

## 2. Fase 1 — Base de datos y Backend

### 2.1 Prisma — relajar la columna a NULL

**Cambio:** en [schema.prisma:43](BACKEND/prisma/schema.prisma#L43):

```text
urlIframe String? @map("url_iframe")
```

**Migración:**

- Comando: `npx prisma migrate dev --name optional_url_iframe` (genera SQL `ALTER COLUMN url_iframe DROP NOT NULL`).
- Riesgo de migración: **mínimo**. Pasar de NOT NULL a NULL nunca rompe registros existentes; solo permite nuevos NULL.
- Compatibilidad descendente: cualquier consulta existente que devuelva `urlIframe` ahora puede recibir `null` → ver Fase 3 para el manejo en frontend.

**Atención al cliente Prisma generado:**

- El cliente está en `BACKEND/src/generated/prisma` (ver `schema.prisma:3`). Después de migrar, el tipo `Report.urlIframe` pasa a `string | null`, lo que va a romper compilación TypeScript en el `service`/`controller` que asuman string. Hay que hacer `tsc --noEmit` después de la migración para encontrar todos los call-sites.

### 2.2 DTOs — validación condicional con `@ValidateIf`

`class-validator` no tiene un decorator "required if" nativo, pero `@ValidateIf((o) => condicion)` aplica el resto de validators **solo cuando la condición es verdadera**. Esa es la herramienta correcta.

**`CreateReportDto`** ([create-report.dto.ts](BACKEND/src/reports/dto/create-report.dto.ts)):

Reglas a definir:

- Si `padreId` está presente y no es `null` → `urlIframe` debe existir y empezar con `https://`.
- Si `padreId` es `null` o `undefined` → `urlIframe` es opcional, pero **si se proporciona** debe seguir empezando con `https://`.

Esquema mental del decorador (no es código a copiar, es la forma):

```text
@ValidateIf((o) => o.padreId != null)        // hijo → required + format
@IsString()
@Matches(/^https:\/\//, { message: '...' })

@ValidateIf((o) => o.padreId == null && o.urlIframe !== undefined && o.urlIframe !== '')
@IsString()                                   // padre → solo valida formato si llegó algo
@Matches(/^https:\/\//, { message: '...' })

@IsOptional()                                 // padre → admite ausencia
urlIframe?: string;
```

**Trampa común:** `class-validator` evalúa los decoradores en orden inverso al declarado. Hay que verificar el comportamiento real con un test: enviar payload sin `urlIframe` y `padreId=null` debe pasar; enviar payload sin `urlIframe` y `padreId=5` debe fallar con mensaje claro.

**Alternativa más simple (recomendada):** un solo `@ValidateIf` que cubra ambos casos y un `@IsString` + `@Matches` que solo se evalúa si el campo está presente o si es hijo:

```text
@ValidateIf((o) => o.padreId != null || (o.urlIframe !== undefined && o.urlIframe !== ''))
@IsString({ message: 'La URL es obligatoria para sub-reportes' })
@Matches(/^https:\/\//, { message: 'La URL debe comenzar con https://' })
@IsOptional()
urlIframe?: string;
```

Esa expresión: "valida formato si es hijo, **o** si el padre rellenó la URL voluntariamente".

**`UpdateReportDto`** — más sutil. Hay tres escenarios:

| Escenario | Comportamiento esperado |
|---|---|
| Update donde `padreId` no se envía y `urlIframe` no se envía | OK, no validar nada (PATCH semántico) |
| Update donde `urlIframe = null/""` y el reporte existente es hijo | **Rechazar** — un hijo no puede quedarse sin URL |
| Update que cambia un reporte de hoja a padre (`padreId: x → null`) | El frontend puede limpiar la URL — debería permitirse |
| Update que cambia un padre a hijo (`padreId: null → y`) y la URL viene vacía | **Rechazar** — al volverse hijo, debe tener URL |

**Decisión de plan:** las validaciones a nivel DTO solo cubren el payload entrante. Los casos que dependen del **estado actual en BD** (escenarios 2-4) deben validarse en `reports.service.ts` consultando el reporte antes de actualizar:

- Cargar el reporte actual.
- Calcular el `padreId` resultante: `dto.padreId !== undefined ? dto.padreId : current.padreId`.
- Calcular el `urlIframe` resultante: `dto.urlIframe !== undefined ? dto.urlIframe : current.urlIframe`.
- Si `padreId resultante != null && (urlIframe resultante == null || == '')` → `BadRequestException('Un sub-reporte debe tener URL de Looker Studio')`.

Esta validación **no** puede vivir en el DTO, va en el service. Documentarlo así en el plan.

### 2.3 Mensajes de error — cohesión con el frontend

Hoy los mensajes son genéricos. Para que el form pueda mapearlos correctamente a campos, definir mensajes consistentes:

- `'La URL es obligatoria para sub-reportes'` (cuando es hijo y falta).
- `'La URL debe comenzar con https://'` (formato).
- `'Un sub-reporte debe tener URL de Looker Studio'` (caso de update que rompe la regla).

El frontend ya hace `error?.response?.data?.message` ([useAdminReports.ts:55-57](frontend/src/hooks/useAdminReports.ts#L55-L57)) y muestra el mensaje en toast. No requiere cambios en el cliente.

### 2.4 Tests sugeridos (backend)

No hay infra de tests evidente en el repo, pero si la hay (o cuando se añada), los casos mínimos a cubrir:

1. POST `/reports` sin `urlIframe`, sin `padreId` → 201.
2. POST `/reports` sin `urlIframe`, con `padreId` → 400 con mensaje específico.
3. POST `/reports` con `urlIframe='ftp://...'`, sin `padreId` → 400 (formato).
4. PUT `/reports/:id` que cambia un padre con URL a hijo y limpia URL → 400.
5. PUT `/reports/:id` que convierte un hijo en padre y limpia URL → 200.

---

## 3. Fase 2 — Frontend y Formularios

### 3.1 Refactor del esquema Zod en `ReportForm.tsx`

Hoy ([ReportForm.tsx:12-22](frontend/src/components/admin/ReportForm.tsx#L12-L22)):

```text
urlIframe: z.string().min(1, '...').startsWith('https://', '...')
```

Pasa a un esquema **discriminado** por la información que el form tiene del padre. La forma limpia con Zod es construir el resolver en función de un flag `esHijo` calculado al render:

```text
function buildSchema(esHijo: boolean) {
  const url = esHijo
    ? z.string().min(1, 'La URL es obligatoria para sub-reportes')
        .startsWith('https://', 'La URL debe comenzar con https://')
    : z.union([
        z.literal(''),
        z.string().startsWith('https://', 'La URL debe comenzar con https://'),
      ]).optional();
  return z.object({ titulo: ..., urlIframe: url, ... });
}
```

Y `useForm({ resolver: zodResolver(buildSchema(esHijo)) })`.

`esHijo` se calcula así dentro del componente:

```text
const esHijo = lockedParentId != null || initialValues?.padreId != null;
```

**Cuidado con el reactivity:** si `lockedParentId` o `initialValues.padreId` no cambian durante el ciclo de vida del modal (que es el caso real — se monta y desmonta por cada operación), no hace falta re-construir el schema dinámicamente. Si en el futuro se agrega el dropdown (sección 3.4), sí.

### 3.2 Payload — limpiar URL vacía antes de enviar

En `onSubmit` ([ReportForm.tsx:60-77](frontend/src/components/admin/ReportForm.tsx#L60-L77)):

- Si `esHijo === false` y `data.urlIframe === ''`, enviar `urlIframe: undefined` (no `''`) para que el backend no lo trate como string vacío y aplique correctamente `@IsOptional`.
- Una solución equivalente: no incluir el campo en el payload cuando esté vacío y no es requerido.

Documentarlo explícitamente en el plan: el string vacío y `null` deben tratarse como "no enviado" cuando el campo es opcional.

### 3.3 Mejoras de UX

| Antes | Después |
|---|---|
| Label fija: `URL de Looker Studio *` (asterisco rojo siempre) | Label dinámica: `URL de Looker Studio *` solo si `esHijo`; si no, `URL de Looker Studio (opcional)` |
| Sin pista del comportamiento | Helper text bajo el input cuando es padre: *"Opcional. Si se proporciona, se usa como gráfico-resumen del dashboard."* |
| Placeholder genérico | Placeholder cambia: `https://lookerstudio.google.com/...` para ambos, pero el helper text aclara |

Cambios visuales concretos a planificar en [ReportForm.tsx:101-111](frontend/src/components/admin/ReportForm.tsx#L101-L111):

1. Reemplazar el `<span className="text-red-500">*</span>` por una expresión condicional.
2. Añadir un párrafo `<p className="text-xs text-slate-500 mt-1">` debajo del input cuando `!esHijo` con el helper.
3. (Opcional) si es padre y el input está vacío, suprimir el error de "campo requerido" — Zod ya lo hace si el schema lo permite, no hay UI extra.

### 3.4 Decisión arquitectónica: ¿agregar dropdown de "Reporte Padre"?

El requerimiento original menciona *"si el usuario ha seleccionado un Reporte Padre en el dropdown"*, pero hoy ese dropdown no existe — la paternidad se infiere del flujo (modal "Agregar Sub-reporte" vs creación raíz). Hay dos caminos:

#### Camino A — Mantener el modelo actual (recomendado para Plan 16)

- No agregar dropdown.
- `esHijo` se calcula desde `lockedParentId` / `initialValues.padreId`.
- **Pros:** cero cambios de UX, scope acotado, riesgo bajo.
- **Contras:** un admin que crea un reporte raíz no puede convertirlo en hijo desde el form principal — debe ir al padre y usar "Agregar Sub-reporte". Esa restricción ya existe hoy.

#### Camino B — Agregar dropdown opcional "Reporte Padre"

- Nuevo `Controller` con `<select>` que liste todos los reportes activos como posibles padres.
- `esHijo` se vuelve **reactivo**: `useWatch({ name: 'padreId' })` y reconstruir el schema con cada cambio (o usar `z.refine` global).
- Validación anti-ciclo: si se está editando, excluir el reporte actual y todos sus descendientes de la lista de padres posibles.
- **Pros:** flexibilidad de re-asignar jerarquía sin salir del form.
- **Contras:** scope creep para Plan 16; requiere endpoint que devuelva la lista de candidatos a padre, manejo de ciclos (ya hay validación en backend en `reports.service.ts:160-182` pero hay que reflejarla en UI), y complejidad reactiva del schema.

**Recomendación:** ir con **Camino A** en este plan. Reservar Camino B para un Plan 17 si surge la necesidad real.

### 3.5 ChildReportsSection — sin cambios funcionales

[ChildReportsSection.tsx](frontend/src/components/admin/ChildReportsSection.tsx) ya pasa `lockedParentId` correctamente. Como el form sabrá interpretar esa señal y exigir URL, no requiere cambios.

---

## 4. Fase 3 — Consistencia de datos y robustez del rendering

### 4.1 Estado de los datos existentes

Como `urlIframe` hoy es NOT NULL, **no hay reportes con URL vacía en BD**. Tras la migración:

- Todos los reportes pre-existentes seguirán teniendo URL. Cero impacto.
- Los reportes nuevos podrán crearse con URL nula **solo si son padres**.

No hace falta un script de "limpieza retroactiva" ni backfill. Esto es importante de declarar para evitar trabajo inventado.

### 4.2 Renderizado defensivo en frontend

El tipo `Report.urlIframe` en [report.types.ts:21](frontend/src/types/report.types.ts#L21) hoy es `string`. Hay que **cambiarlo a `string | null`** para reflejar la realidad post-migración. Eso forzará a TypeScript a reportar todos los lugares que asumen string no-nulo. Inventario esperado de call-sites a auditar:

1. **`DashboardGrid.tsx`** — ya maneja `parent.urlIframe` con `parent.urlIframe && <ParentBanner>`, y la card hija con `Boolean(child.urlIframe)`. **Ya es compatible.** El plan solo requiere ajustar el tipo en `ParentBanner` y `ChildCard` para aceptar `string | null` y mantener el guard.
2. **`ReportViewer.tsx`** — recibe `urlIframe: string` en sus props. Si se pasa un padre como hoja (no debería ocurrir tras Plan 15, pero defensivo), renderizaría iframe vacío. Acciones:
   - Cambiar la prop a `string | null`.
   - Añadir un early-return: si `!urlIframe`, mostrar un estado vacío amigable (ej. *"Este reporte no tiene gráfico configurado"*) en vez de un iframe roto.
3. **`page.tsx` del dashboard** — la lógica `selectedReport && esDashboard ? <DashboardGrid> : <ReportViewer>` ya cubre el flujo normal. Pero queda un edge case: **un nodo con `children.length === 0` y `urlIframe === null`** (alguien creó un padre sin hijos y sin URL). Caer en `ReportViewer` con URL vacía. La salida elegante: mostrar el estado vacío del punto 2.
4. **`ChildReportsSection.tsx`** — solo lista títulos, no usa URL. Sin impacto.
5. **`ReportForm.tsx`** — al editar, `defaultValues.urlIframe` debe pasar a `initialValues.urlIframe ?? ''` para no romper React Hook Form (que espera string en input controlado).

### 4.3 Reglas de invariante post-migración

Para evitar drift entre frontend y backend, dejar declaradas las invariantes que siempre deben cumplirse:

1. `padreId != null` ⇒ `urlIframe != null && urlIframe.startsWith('https://')`.
2. `padreId == null && urlIframe != null` ⇒ `urlIframe.startsWith('https://')`.
3. `padreId == null && urlIframe == null` ⇒ válido (padre puro).

Estas tres invariantes son la "verdad" del sistema y deberían quedar mencionadas como comentario al tope de `reports.service.ts` o en un README de modelo de dominio.

### 4.4 Migración de un padre que tenía URL y queda sin hijos

Un caso límite: un admin promovió un reporte a padre (le agregó hijos), llenó URL como banner, luego eliminó todos los hijos. El reporte queda como **hoja con URL**, y al renderizarse va por `ReportViewer` (correcto). No hay problema porque la URL existe.

Caso inverso: un padre sin URL al que se le quitan los hijos → queda como hoja **sin URL**. Ese es el escenario que justifica el estado vacío del punto 4.2.2. Documentarlo y manejarlo, no es un bug — es esperado.

---

## 5. Plan de implementación por orden de ejecución

> Orden sugerido. Cada paso es verificable de forma aislada.

1. **Prisma migration** — `String?` + `migrate dev`. Verificar que `tsc --noEmit` en backend señala los call-sites afectados.
2. **`reports.service.ts`** — añadir validación de invariante en `update` (Fase 2.2 punto 4). Tests manuales con Postman/Insomnia.
3. **DTOs** — `@ValidateIf` en `CreateReportDto`. `UpdateReportDto` queda mayormente igual; la lógica de "no permitir vaciar URL si queda como hijo" vive en el service.
4. **Tipo frontend** — actualizar `Report.urlIframe: string | null` en `report.types.ts`. Correr `tsc --noEmit`. Resolver call-sites uno por uno (esperados: 4-5 lugares).
5. **`ReportViewer.tsx`** — early-return cuando `!urlIframe`.
6. **`page.tsx` del dashboard** — verificar que el flujo `hoja sin URL` cae en `ReportViewer` con estado vacío (y no en algo peor).
7. **`ReportForm.tsx`** — calcular `esHijo`, schema dinámico, label condicional, helper text, normalizar payload (no enviar `''`).
8. **QA manual** — recorrer los 5 escenarios de la sección 2.4 desde la UI real.

---

## 6. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| `@ValidateIf` se evalúa en orden inesperado | Media | Medio | Test manual con payloads adversos antes de mergear |
| Algún call-site del backend asume `urlIframe` no-nulo y revienta en runtime | Baja | Alto | `tsc --noEmit` post-migración encuentra todos; la migración no se hace en producción hasta que el código compile limpio |
| El form envía `''` y el backend lo interpreta como "URL vacía" → 400 inesperado | Media | Bajo | Normalizar `''` → `undefined` en el payload (Fase 3.2) |
| Un admin convierte un padre sin URL a hijo en un solo update y se rechaza | Baja | Bajo | Mensaje de error claro: "para convertirlo en sub-reporte, agrega primero la URL" |
| React Hook Form se queja por valor `null` en input controlado | Media | Bajo | Usar `initialValues.urlIframe ?? ''` en `defaultValues`, normalizar de vuelta en submit |

---

## 7. Métricas de éxito

- [ ] Crear un reporte padre sin URL desde el form → guarda OK, aparece en Sidebar, dashboard muestra "Sin sub-reportes asociados" o el grid si tiene hijos.
- [ ] Crear un sub-reporte sin URL → bloqueado en frontend (Zod) y en backend (DTO).
- [ ] Editar un sub-reporte y vaciar la URL → bloqueado en service con mensaje claro.
- [ ] Editar un padre y agregarle URL → guarda OK, banda superior aparece en dashboard.
- [ ] `tsc --noEmit` limpio en backend y frontend tras todos los cambios.
- [ ] Reportes existentes (todos con URL) siguen renderizando como antes — regresión cero.

---

## 8. Fuera de alcance (para futuros planes)

- **Dropdown "Reporte Padre"** dinámico en `ReportForm` (Camino B de la sección 3.4) — Plan 17 si se pide.
- **Validación de URL contra el dominio de Looker Studio** específicamente (hoy solo se valida `https://`, no que sea `lookerstudio.google.com`).
- **Auto-promoción de reportes**: si un padre se queda sin hijos, ¿debería volver a exigir URL? Decisión: no, mantener flexibilidad. Documentado pero no implementado.
- **UI para "convertir hoja en padre"** sin tener que ir a "Agregar Sub-reporte" desde otro flujo.
- **Validación cross-field anti-ciclos en frontend** (ya existe en backend, no urge replicarla).

---

**Fin del plan.**
