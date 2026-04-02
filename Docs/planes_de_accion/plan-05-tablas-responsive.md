# Plan 05: Tablas de Administracion Responsivas

**Alcance:** Scroll horizontal amigable + indicador visual + accesibilidad tactil  
**Dependencias a instalar:** Ninguna  
**Archivos afectados:** 3

---

## Problema Actual

Las tres tablas de administracion (UserTable, ReportTable, AuditTable) muestran **todas las columnas en mobile**, lo que provoca:

1. **Scroll horizontal sin indicador:** El usuario no sabe que puede deslizar
2. **Botones de accion pequenos:** El boton de editar tiene `p-1.5` (~30x30px), menor al minimo tactil de 44x44px
3. **Sin ocultamiento de columnas secundarias:** Columnas como ID o Email ocupan espacio innecesario en pantallas pequenas

### Estado actual de los contenedores de tabla:

| Archivo | Linea | Contenedor actual |
|---------|:-----:|------------------|
| UserTable.tsx | 247 | `<div className="overflow-x-auto">` |
| ReportTable.tsx | 279 | `<div className="overflow-x-auto">` |
| AuditTable.tsx | 172 | `<div className="overflow-x-auto">` |

Ya tienen `overflow-x-auto` pero sin indicador visual, sin ancho minimo en la tabla, y sin optimizacion mobile.

---

## Cambio 1: Contenedor con Indicador de Scroll

### Enfoque

Envolver el `<div className="overflow-x-auto">` existente con un contenedor `relative` que incluya un **gradiente a la derecha** visible solo en mobile. Este gradiente indica visualmente que hay mas contenido hacia la derecha.

### Aplicar en los 3 archivos

#### UserTable.tsx (lineas 246-300)

**ANTES (linea 247):**
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
```

**DESPUES:**
```tsx
<div className="relative">
  {/* Indicador de scroll — solo visible en mobile */}
  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-sidebar-hover to-transparent pointer-events-none z-10 lg:hidden" />
  
  <div className="overflow-x-auto">
    <table className="w-full text-sm min-w-[700px]">
```

**Cierre:** Agregar `</div>` de cierre del contenedor `relative` despues del cierre existente del `overflow-x-auto`.

**Explicacion de clases:**
| Clase | Efecto |
|-------|--------|
| `relative` | Posiciona el gradiente respecto al contenedor |
| `absolute right-0 top-0 bottom-0 w-6` | Gradiente pegado al borde derecho, altura completa |
| `bg-gradient-to-l from-white to-transparent` | Degradado de blanco a transparente (indica "hay mas") |
| `dark:from-sidebar-hover` | Color correcto en dark mode |
| `pointer-events-none` | No bloquea clicks ni scroll |
| `z-10` | Se superpone sobre la tabla |
| `lg:hidden` | Se oculta en pantallas grandes (no necesario) |
| `min-w-[700px]` | Fuerza ancho minimo en la tabla para evitar compresion excesiva |

#### ReportTable.tsx (lineas 278-332)

**Mismo patron.** Envolver el `overflow-x-auto` existente (linea 279):
- Agregar contenedor `relative` con gradiente
- Agregar `min-w-[700px]` a la `<table>`

#### AuditTable.tsx (lineas 171-238)

**Mismo patron.** Envolver el `overflow-x-auto` existente (linea 172):
- Agregar contenedor `relative` con gradiente
- Agregar `min-w-[750px]` a la `<table>` (la tabla de auditoria tiene 6 columnas, necesita mas ancho)

---

## Cambio 2: Ocultar Columnas Secundarias en Mobile

### UserTable.tsx

**Columna ID (lineas 135-138):** Ocultar en pantallas < `sm` (640px).

- **En el `<th>` del header:** El header se renderiza dinamicamente con `flexRender`, por lo que el ocultamiento se aplica via la celda. Agregar al CSS de la columna ID en la definicion de `columnHelper.accessor('id', {...})`:

  ```typescript
  columnHelper.accessor('id', {
    header: 'ID',
    meta: { className: 'hidden sm:table-cell' },  // Metadata custom
    cell: (info) => <span className="text-slate-400 dark:text-gray-500">{info.getValue()}</span>,
  }),
  ```

- **Aplicar la clase en el render de `<th>` y `<td>`:** Modificar el render loop de headers y celdas para leer `column.columnDef.meta?.className` y aplicarlo como clase adicional.

  En la seccion de `<th>` (linea 255):
  ```tsx
  <th
    key={header.id}
    className={clsx(
      isSortable ? thSortable : thBase,
      header.column.columnDef.meta?.className,
    )}
  ```

  En la seccion de `<td>` (linea 291):
  ```tsx
  <td
    key={cell.id}
    className={clsx('px-6 py-3', cell.column.columnDef.meta?.className)}
  >
  ```

- **Import `clsx`:** Ya esta disponible en el proyecto (`frontend/package.json` linea 16).

**Columnas a ocultar en UserTable:**
| Columna | Breakpoint | Clase |
|---------|-----------|-------|
| ID | < sm (640px) | `hidden sm:table-cell` |

### ReportTable.tsx

| Columna | Breakpoint | Clase |
|---------|-----------|-------|
| ID | < sm (640px) | `hidden sm:table-cell` |

**Mismo enfoque:** Agregar `meta: { className: 'hidden sm:table-cell' }` al column accessor de ID y aplicar la clase en el render.

### AuditTable.tsx

**Esta tabla no usa React Table** (headers hardcodeados). El enfoque es mas directo:

| Columna | Breakpoint | Clase |
|---------|-----------|-------|
| Correo | < md (768px) | `hidden md:table-cell` |
| Duracion | < sm (640px) | `hidden sm:table-cell` |

**Cambio en `<th>` (lineas 178, 181):**
```tsx
// Correo - agregar hidden md:table-cell
<th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium hidden md:table-cell">Correo</th>

// Duracion - agregar hidden sm:table-cell
<th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium hidden sm:table-cell">Duración</th>
```

**Cambio en `<td>` correspondientes (lineas 213-214, 224-231):**
```tsx
// Correo (linea 213)
<td className="px-6 py-3 text-slate-600 dark:text-gray-300 hidden md:table-cell">

// Duracion (linea 224)
<td className="px-6 py-3 hidden sm:table-cell">
```

**Tambien en los skeleton de carga** (linea 188): Reducir el `Array.from({ length: 6 })` o agregar las mismas clases de visibilidad a los td del skeleton.

---

## Cambio 3: Area Tactil Minima de 44x44px

### Botones de Editar

**Estado actual en UserTable (lineas 168-174):**
```tsx
<button
  onClick={() => onEdit(info.row.original)}
  className="p-1.5 text-slate-400 ..."
  title="Editar"
>
  <Pencil className="w-4 h-4" />
</button>
```

`p-1.5` = 6px padding. Con icono de 16x16px, el boton tiene ~28x28px. Insuficiente para tactil.

**Cambio en UserTable (linea 170), ReportTable (linea 198):**
```tsx
<button
  onClick={() => onEdit(info.row.original)}
  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-sidebar-accent hover:bg-sidebar-accent/10 rounded transition-colors"
  title="Editar"
>
  <Pencil className="w-4 h-4" />
</button>
```

**Clases clave:**
| Clase | Efecto |
|-------|--------|
| `min-w-[44px] min-h-[44px]` | Garantiza area tactil minima de 44x44px |
| `flex items-center justify-center` | Centra el icono dentro del area tactil |

### ToggleSwitch

**Estado actual del componente (ToggleSwitch.tsx):**
- Tamano `sm`: `h-5 w-10` (20x40px)
- Tamano `md`: `h-6 w-12` (24x48px)

El switch en si es pequeno pero el area de toque incluye el `<button>` contenedor. Sin embargo, la altura es menor a 44px.

**Solucion:** No modificar el componente ToggleSwitch directamente (afectaria todos los usos). En su lugar, envolver el ToggleSwitch en las tablas con un contenedor que expanda el area de toque:

```tsx
// En la definicion de la columna 'activo' de UserTable y ReportTable:
cell: (info) => (
  <div className="flex items-center min-h-[44px]">
    <ToggleSwitch
      checked={info.getValue()}
      onChange={() => setConfirmUser(info.row.original)}
    />
  </div>
),
```

Esto asegura que la fila tenga al menos 44px de alto en la zona del toggle, facilitando el toque sin alterar el componente base.

### Botones de Paginacion

**Estado actual (UserTable lineas 67-97):**
```tsx
<button className="px-2 py-1 rounded ...">←</button>
<button className="px-2.5 py-1 rounded ...">1</button>
```

`py-1` = 4px padding vertical. Con texto de ~16px, el boton tiene ~24px de alto.

**Cambio:** Agregar `min-h-[44px]` a los botones de paginacion:
```tsx
<button className="px-2 py-1 min-h-[44px] rounded ...">←</button>
<button className="px-2.5 py-1 min-h-[44px] rounded ...">1</button>
```

Aplicar en las 3 tablas (cada una tiene su propio componente `PaginationBar`).

---

## Resumen de Cambios por Archivo

### UserTable.tsx

| Cambio | Lineas afectadas | Descripcion |
|--------|:---------------:|-------------|
| Contenedor + gradiente | 247 | Envolver overflow-x-auto con relative + gradiente |
| min-w tabla | 248 | Agregar min-w-[700px] a table |
| Ocultar ID | 135-138 | meta className hidden sm:table-cell |
| Render th/td con meta | 255, 291 | Leer meta.className con clsx |
| Boton editar 44px | 170 | min-w-[44px] min-h-[44px] |
| Toggle wrapper 44px | 158 | Envolver ToggleSwitch en div min-h-[44px] |
| Paginacion 44px | 67-97 | min-h-[44px] en botones |
| Import clsx | 3 | Agregar import si no existe |

### ReportTable.tsx

| Cambio | Lineas afectadas | Descripcion |
|--------|:---------------:|-------------|
| Contenedor + gradiente | 279 | Envolver overflow-x-auto |
| min-w tabla | 280 | min-w-[700px] |
| Ocultar ID | 134-137 | hidden sm:table-cell |
| Render th/td con meta | 287, 323 | Leer meta.className |
| Boton editar 44px | 198 | min-w-[44px] min-h-[44px] |
| Toggle wrapper 44px | 186 | Envolver ToggleSwitch |
| Paginacion 44px | 67-97 | min-h-[44px] |

### AuditTable.tsx

| Cambio | Lineas afectadas | Descripcion |
|--------|:---------------:|-------------|
| Contenedor + gradiente | 172 | Envolver overflow-x-auto |
| min-w tabla | 173 | min-w-[750px] |
| Ocultar Correo | 178, 213 | hidden md:table-cell |
| Ocultar Duracion | 181, 224 | hidden sm:table-cell |
| Skeleton ajustado | 188 | Aplicar clases de visibilidad |
| Paginacion 44px | 84-114 | min-h-[44px] |

---

## Resumen

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/src/components/admin/UserTable.tsx` | Modificar |
| 2 | `frontend/src/components/admin/ReportTable.tsx` | Modificar |
| 3 | `frontend/src/components/admin/AuditTable.tsx` | Modificar |

## Orden de Ejecucion

```
1. Modificar UserTable.tsx (contenedor + gradiente + ocultar ID + areas tactiles)
2. Modificar ReportTable.tsx (mismo patron)
3. Modificar AuditTable.tsx (mismo patron + ocultar Correo y Duracion)
4. Verificar en navegador con responsive mode:
   - 360px (mobile): Gradiente visible, ID oculto, botones tocables
   - 768px (tablet): Gradiente oculto, todas las columnas visibles
   - 1024px+ (desktop): Sin cambios visuales
```
