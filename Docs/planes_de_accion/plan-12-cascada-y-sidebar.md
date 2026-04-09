# Plan 12: Desactivacion en Cascada y Mejora UX del Sidebar

**Alcance:** Corregir la logica de desactivacion de reportes padres (backend) y mejorar la legibilidad del menu lateral con sub-reportes anidados (frontend)  
**Dependencias a instalar:** Ninguna  
**Archivos afectados:** ~4 (0 creados, 4 modificados)

---

## Descripcion de los Problemas

### Problema 1 — Reportes huerfanos al desactivar un padre

Cuando un administrador desactiva un reporte padre (`activo: false`), sus hijos permanecen activos en la base de datos. Esto genera:

- **Hijos huerfanos:** Reportes activos cuyo padre esta inactivo. La funcion `buildTree()` los promociona a raices porque su `padreId` apunta a un reporte que ya no esta en la lista de activos.
- **Inconsistencia visual:** Un sub-reporte aparece de repente como reporte principal en el Sidebar de usuarios no-admin.
- **Datos fantasma:** La tabla admin muestra hijos "activos" vinculados a un padre "inactivo", confundiendo al administrador.

**Codigo actual afectado:**

```typescript
// reports.service.ts — toggleActivo (linea 214)
async toggleActivo(id: number, executorId: number) {
  const report = await this.prisma.report.findUniqueOrThrow({ where: { id } });
  const updated = await this.prisma.report.update({
    where: { id },
    data: { activo: !report.activo },  // <-- Solo cambia el padre, hijos intactos
    include: REPORT_INCLUDE_ADMIN,
  });
  // ...
}

// reports.service.ts — remove (linea 231)
async remove(id: number, executorId: number) {
  await this.prisma.report.update({
    where: { id },
    data: { activo: false },  // <-- Solo cambia el padre
  });
  // ...
}
```

### Problema 2 — Texto ilegible en sub-reportes del Sidebar

El padding izquierdo acumulativo (`12 + depth * 16px`) mas el margen del contenedor de hijos (`ml-5 = 20px`) aplasta progresivamente el texto disponible:

| Nivel | Padding Left | Espacio ocupado por indentacion | Espacio restante (~240px sidebar) |
|:-----:|:------------:|:-------------------------------:|:---------------------------------:|
| 0 (raiz) | 12px | 12px | ~228px |
| 1 (hijo) | 28px + 20px ml | 48px | ~192px |
| 2 (nieto) | 44px + 40px ml | 84px | ~156px |
| 3 (bisnieto) | 60px + 60px ml | 120px | ~120px |
| 4+ | 76px + 80px ml | 156px | **~84px** (ilegible) |

A partir del nivel 3, los nombres se truncan con `...` y el icono + chevron consumen ~50px mas, dejando ~34px utiles para texto — apenas 3-4 caracteres visibles.

---

## Fase 1: Logica Backend — Desactivacion en Cascada

### 1.1 — Nuevo metodo privado: `getDescendantIds()`

| Archivo | Ruta |
|---------|------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` |

**Proposito:** Dado un `reportId`, obtener recursivamente los IDs de todos sus descendientes (hijos, nietos, bisnietos...) sin limite de profundidad.

**Pseudocodigo:**

```
funcion getDescendantIds(reportId):
  hijos = prisma.report.findMany(where: { padreId: reportId })
  ids = []
  por cada hijo en hijos:
    ids.push(hijo.id)
    ids.push(...getDescendantIds(hijo.id))  // recursion
  retornar ids
```

**Alternativa eficiente (iterativa, una sola query):**

```
funcion getDescendantIds(reportId):
  todos = prisma.report.findMany(select: { id, padreId })  // query plana de TODOS
  construir mapa: padreId -> [hijoId, hijoId, ...]
  BFS o DFS desde reportId recorriendo el mapa
  retornar ids encontrados
```

La alternativa iterativa es preferible porque ejecuta **una sola query** a la BD en vez de N queries recursivas. Es el mismo patron que `buildTree()` ya existente.

### 1.2 — Actualizar `toggleActivo()` para cascada

| Archivo | Ruta | Lineas |
|---------|------|--------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` | 214-229 |

**Logica a implementar:**

```
funcion toggleActivo(id, executorId):
  reporte = buscar reporte por id
  nuevoEstado = !reporte.activo

  SI nuevoEstado es FALSE (desactivando):
    descendientes = getDescendantIds(id)
    SI hay descendientes:
      prisma.report.updateMany(
        where: { id IN descendientes },
        data: { activo: false }
      )
      registrar log: "Desactivados en cascada: N descendientes del reporte id=X"

  actualizar el reporte padre con activo = nuevoEstado
  registrar log del toggle principal
  retornar reporte actualizado
```

**Comportamiento al REACTIVAR (activo: true):**
- **NO reactivar hijos en cascada.** La reactivacion debe ser manual, reporte por reporte. Razon: el admin puede haber desactivado algunos hijos intencionalmente antes de desactivar el padre. Reactivar en cascada los forzaria a todos a `true`, pisando la decision previa.

### 1.3 — Actualizar `remove()` para cascada

| Archivo | Ruta | Lineas |
|---------|------|--------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` | 231-242 |

**Misma logica:** `remove()` es un soft-delete (`activo: false`), asi que debe desactivar descendientes con la misma cascada que `toggleActivo()` cuando desactiva.

**Pseudocodigo:**

```
funcion remove(id, executorId):
  descendientes = getDescendantIds(id)
  idsADesactivar = [id, ...descendientes]

  prisma.report.updateMany(
    where: { id IN idsADesactivar },
    data: { activo: false }
  )

  registrar log: "Reporte id=X desactivado con N descendientes"
  retornar mensaje de exito
```

### 1.4 — Impacto en el `REPORT_INCLUDE_ADMIN`

| Archivo | Ruta | Lineas |
|---------|------|--------|
| `reports.service.ts` | `BACKEND/src/reports/reports.service.ts` | 20-25 |

**Sin cambios necesarios.** El include admin ya trae `_count: { children }` y la tabla admin muestra el estado `activo` de cada reporte. Despues de la cascada, la tabla reflejara correctamente todos los hijos como inactivos.

---

## Fase 2: Frontend UI/UX — Mejora del Sidebar

### 2.1 — Tooltips nativos en todos los items del menu

| Archivo | Ruta | Lineas |
|---------|------|--------|
| `Sidebar.tsx` | `frontend/src/components/dashboard/Sidebar.tsx` | 70-85 |

**Estrategia:** Usar el atributo HTML `title` nativo en el `<button>` de cada reporte. Es la solucion mas ligera, sin dependencias, y funciona universalmente.

**Pseudocodigo del cambio en `SidebarReportItem`:**

```
<button
  onClick={() => onSelect(report)}
  title={report.titulo}            // <-- AGREGAR: tooltip nativo
  className={...}
  style={...}
>
  <BarChart2 ... />
  <span className="truncate flex-1">{report.titulo}</span>
  {hasChildren && <ChevronDown ... />}
</button>
```

**Por que `title` nativo y no un componente Tooltip:**
- No requiere instalar Shadcn/Radix (el proyecto no los usa actualmente).
- El sidebar es una zona de interaccion rapida — un tooltip nativo con delay del navegador (~500ms) es menos intrusivo que un tooltip React que aparece inmediatamente y puede tapar otros items.
- Si en el futuro se quiere un tooltip mas estilizado, el cambio seria reemplazar `title` por un componente `<Tooltip>` wrapeando el `<button>`.

### 2.2 — Ajuste dinamico de sangrado (padding + margen reducidos)

| Archivo | Ruta | Lineas |
|---------|------|--------|
| `Sidebar.tsx` | `frontend/src/components/dashboard/Sidebar.tsx` | 73, 88 |

**Estado actual (dos fuentes de indentacion):**

1. **`paddingLeft`** en el `<button>` (linea 73): `12 + Math.min(depth, 5) * 16px`
2. **`ml-5`** en el contenedor de hijos (linea 88): `margin-left: 20px` fijo por nivel

Ambos se acumulan, consumiendo `36px` por nivel (16px padding + 20px margen).

**Nuevo esquema propuesto — sangrado degresivo:**

```
// Nuevo padding-left: el incremento se reduce en niveles profundos
// Nivel 0: 12px, Nivel 1: 22px, Nivel 2: 30px, Nivel 3: 36px, Nivel 4+: 40px
funcion getPaddingLeft(depth):
  base = 12
  SI depth == 0: retornar base
  SI depth == 1: retornar base + 10
  SI depth == 2: retornar base + 18
  SI depth >= 3: retornar base + 24 + Math.min(depth - 3, 2) * 4
  // Maximo: 12 + 32 = 44px en nivel 5+
```

**Tabla de espacio con nuevo esquema:**

| Nivel | Padding Left | Margen contenedor | Total acumulado | Espacio restante |
|:-----:|:------------:|:-----------------:|:---------------:|:----------------:|
| 0 | 12px | 0px | 12px | ~228px |
| 1 | 22px | 12px | 34px | ~206px |
| 2 | 30px | 24px | 54px | ~186px |
| 3 | 36px | 36px | 72px | ~168px |
| 4+ | 40px | 48px | 88px | **~152px** (legible) |

**Cambio en el contenedor de hijos:**
```
// Actual (linea 88):
<div className="border-l border-white/10 ml-5">

// Nuevo — margen reducido:
<div className="border-l border-white/10 ml-3">
```

Reducir de `ml-5` (20px) a `ml-3` (12px) ahorra 8px por nivel. En nivel 4, eso son 32px recuperados.

**Pseudocodigo del estilo del boton refactorizado:**

```jsx
// Dentro de SidebarReportItem
const paddingLeft = depth === 0 ? 12
  : depth === 1 ? 22
  : depth === 2 ? 30
  : 12 + 24 + Math.min(depth - 3, 2) * 4;

<button
  title={report.titulo}
  onClick={() => onSelect(report)}
  className={clsx(
    NAV_BASE,
    'w-full text-left',
    isActive ? NAV_ACTIVE : NAV_INACTIVE
  )}
  style={{ paddingLeft: `${paddingLeft}px` }}
>
  <BarChart2
    className={clsx(
      'flex-shrink-0',
      depth === 0 ? 'w-4 h-4'
        : depth <= 2 ? 'w-3.5 h-3.5'
        : 'w-3 h-3'
    )}
  />
  <span className="truncate flex-1">{report.titulo}</span>
  {hasChildren && (
    <ChevronDown
      className={clsx(
        'w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0',
        isExpanded && 'rotate-180',
      )}
    />
  )}
</button>

{/* Contenedor de hijos con margen reducido */}
{hasChildren && isExpanded && (
  <div className="border-l border-white/10 ml-3">
    {report.children!.map((child) => (
      <SidebarReportItem
        key={child.id}
        report={child}
        {...otrasProps}
        depth={depth + 1}
      />
    ))}
  </div>
)}
```

### 2.3 — Filtro frontend: no renderizar hijos de padres inactivos

| Archivo | Ruta | Lineas |
|---------|------|--------|
| `Sidebar.tsx` | `frontend/src/components/dashboard/Sidebar.tsx` | 87-101 |

**Contexto:** El backend ya filtra `activo: true` en `findByRole()`. Sin embargo, como doble seguridad, el frontend debe filtrar hijos inactivos antes de renderizarlos.

**Pseudocodigo:**

```
// En la seccion de renderizado de hijos
{hasChildren && isExpanded && (
  <div className="border-l border-white/10 ml-3">
    {report.children!
      .filter((child) => child.activo !== false)  // <-- Filtro de seguridad
      .map((child) => (
        <SidebarReportItem key={child.id} report={child} ... />
      ))}
  </div>
)}
```

**Tambien aplicar en la raiz del Sidebar** (donde se mapean los reportes principales):

```
// En el mapeo principal (lineas 232-241)
{reports
  .filter((report) => report.activo !== false)
  .map((report) => (
    <SidebarReportItem key={report.id} report={report} ... />
  ))}
```

**Nota:** La comparacion `activo !== false` (en vez de `activo === true`) es intencional — si el campo no existe o es `undefined` por algun edge case, el reporte se muestra en vez de ocultarse silenciosamente.

---

## Resumen de Archivos Afectados

| # | Archivo | Capa | Accion |
|:-:|---------|------|--------|
| 1 | `BACKEND/src/reports/reports.service.ts` | Backend | Nuevo metodo `getDescendantIds()`. Actualizar `toggleActivo()` y `remove()` con desactivacion en cascada. |
| 2 | `frontend/src/components/dashboard/Sidebar.tsx` | Frontend | Agregar `title` tooltip. Refactorizar padding degresivo. Reducir `ml-5` a `ml-3`. Filtro `activo !== false` en hijos y raices. |

**Total: 2 archivos modificados, 0 archivos creados.**

---

## Orden de Implementacion

| Paso | Tarea | Dependencia |
|:----:|-------|:-----------:|
| 1 | Implementar `getDescendantIds()` en reports.service | Ninguna |
| 2 | Actualizar `toggleActivo()` con cascada | Paso 1 |
| 3 | Actualizar `remove()` con cascada | Paso 1 |
| 4 | Agregar `title` tooltip en SidebarReportItem | Ninguna |
| 5 | Refactorizar padding degresivo + reducir ml | Ninguna |
| 6 | Agregar filtro `activo !== false` en Sidebar | Ninguna |

Los pasos 4, 5 y 6 del frontend son independientes entre si y pueden implementarse en paralelo.

---

## Checklist de Verificacion

### Cascada Backend
- [ ] Desactivar padre con 3 hijos → los 3 hijos quedan `activo: false` en BD
- [ ] Desactivar padre con hijos anidados (A → B → C) → B y C quedan inactivos
- [ ] Reactivar padre → hijos **NO** se reactivan automaticamente
- [ ] Log de auditoria registra la cantidad de descendientes desactivados
- [ ] Endpoint `DELETE /reports/:id` desactiva padre + descendientes
- [ ] Endpoint `PATCH /reports/:id/toggle` (desactivar) desactiva padre + descendientes
- [ ] La tabla admin refleja todos los cambios despues de la cascada

### Sidebar UX
- [ ] Hover sobre cualquier item truncado muestra tooltip con nombre completo
- [ ] Sub-reporte de nivel 4 tiene texto legible (>100px disponibles)
- [ ] La linea vertical de indentacion (border-l) se mantiene alineada
- [ ] Los iconos reducen tamanio progresivamente sin desaparecer
- [ ] Si un reporte inactivo llega al frontend por error, no se renderiza en el Sidebar
- [ ] El filtro de seguridad no oculta reportes con campo `activo` indefinido
