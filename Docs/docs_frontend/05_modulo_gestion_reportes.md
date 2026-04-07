# Modulo: Gestion de Reportes (Admin)

**Acceso:** Solo administradores (rol_id = 1)  
**Ruta:** `/dashboard/admin/reports`

---

## Archivos Involucrados

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| Reports Page | `src/app/dashboard/admin/reports/page.tsx` | Pagina de gestion de reportes |
| ReportTable | `src/components/admin/ReportTable.tsx` | Tabla de reportes con filtros |
| ReportForm | `src/components/admin/ReportForm.tsx` | Formulario crear/editar reporte |
| ChildReportsSection | `src/components/admin/ChildReportsSection.tsx` | Gestion de sub-reportes |
| useAdminReports | `src/hooks/useAdminReports.ts` | Hook CRUD con React Query |
| useChildReports | `src/hooks/useChildReports.ts` | Hook de sub-reportes |
| useRoles | `src/hooks/useRoles.ts` | Hook de roles para multi-select |

---

## Pagina de Reportes

**Archivo:** `src/app/dashboard/admin/reports/page.tsx`

### Estados
| Estado | Tipo | Proposito |
|--------|------|-----------|
| `isModalOpen` | boolean | Controla visibilidad del modal de reporte |
| `editingReport` | Report \| null | Reporte en edicion (null = crear nuevo) |

### Flujo
1. Renderiza `ReportTable` con datos paginados
2. Boton "Nuevo reporte" abre modal con `ReportForm` vacio
3. Click en "Editar" abre modal con datos pre-rellenados + `ChildReportsSection`
4. Al guardar, se invalida el cache y se dispara evento `refresh-reports`

---

## ReportTable - Tabla de Reportes

**Archivo:** `src/components/admin/ReportTable.tsx`

### Columnas

| Columna | Campo | Sortable | Descripcion |
|---------|-------|:--------:|-------------|
| ID | `id` | No | Numero identificador |
| Titulo | `titulo` | Si | Titulo con indicador de sub-reporte (flecha) y badge de cantidad de hijos |
| Roles | `reportesRoles` | No | Badges de colores con nombre de cada rol asignado |
| Estado | `activo` | No | ToggleSwitch para activar/desactivar |
| Acciones | - | No | Boton de editar (icono Pencil) |

### Indicadores Visuales en Titulo
- **Sub-reporte:** Muestra simbolo `(hoja)` si el reporte tiene `padreId`
- **Reportes con hijos:** Muestra badge con el conteo de hijos (ej: `3 hijos`)

### Funcionalidades

**Busqueda:**
- Debounce de 300ms
- Busca en titulo y descripcion (backend)
- Resetea pagina a 1

**Filtro por estado:**
- Dropdown: Todos / Activos / Inactivos

**Items por pagina:**
- Selector: 5, 10, 20, 50
- Default: 5

**Paginacion:**
- "Pagina X de Y" con botones Anterior/Siguiente

**Loading:**
- Skeleton de filas con animacion pulse

---

## ReportForm - Formulario de Reporte

**Archivo:** `src/components/admin/ReportForm.tsx`

### Campos

| Campo | Tipo | Requerido | Validacion |
|-------|------|:---------:|------------|
| Nombre del reporte | text | Si | Minimo 1 caracter |
| URL de Looker Studio | text | Si | Debe comenzar con `https://` |
| Descripcion | textarea | No | Texto libre |
| Roles con acceso | checkboxes | Si | Al menos 1 rol seleccionado |
| Activo | checkbox | No | Default: true |

### Validacion Zod
```
titulo: string min 1
urlIframe: string que inicia con "https://"
descripcion: string opcional
rolesIds: array de numeros, minimo 1 elemento
activo: boolean opcional
padreId: numero opcional o null
```

### Multi-Select de Roles
Los roles se muestran como checkboxes individuales. El usuario marca los roles que tendran acceso al reporte. Al menos uno debe estar seleccionado.

### Seccion de Sub-reportes
En modo edicion, debajo del formulario se muestra `ChildReportsSection` que lista los sub-reportes existentes y permite agregar nuevos.

---

## ChildReportsSection - Gestion de Sub-reportes

**Archivo:** `src/components/admin/ChildReportsSection.tsx`

### Elementos
- **Titulo:** "Sub-reportes" con boton "Agregar sub-reporte"
- **Lista de hijos:** Cada hijo muestra titulo con indicador de sub-reporte, badge de hijos propios, toggle de estado y boton editar
- **Modal anidado:** Al crear/editar un sub-reporte, se abre otro modal con `ReportForm`

### Comportamiento
- Al crear un sub-reporte, el `padreId` se establece automaticamente al ID del reporte padre
- Al editar un sub-reporte existente, se permite cambiar el padre
- Tras crear/editar, se invalidan los queries `report-children` y `admin-reports`

---

## Hook: useAdminReports

**Archivo:** `src/hooks/useAdminReports.ts`

### Endpoint
`GET /api/reports/admin` con query params.

### Estado Interno
| Estado | Default | Descripcion |
|--------|---------|-------------|
| `page` | 1 | Pagina actual |
| `limit` | 5 | Items por pagina |
| `search` | '' | Texto de busqueda |
| `sortBy` | '' | Campo de ordenamiento |
| `order` | 'asc' | Direccion |
| `activo` | undefined | Filtro por estado |

### Mutaciones
| Mutacion | Metodo HTTP | Endpoint | Post-accion |
|----------|------------|----------|-------------|
| `createReport` | POST | `/reports` | Invalida cache, dispara `refresh-reports` |
| `updateReport` | PUT | `/reports/{id}` | Invalida cache, dispara `refresh-reports` |
| `toggleActivo` | PATCH | `/reports/{id}/toggle` | Invalida cache, dispara `refresh-reports` |
| `deleteReport` | DELETE | `/reports/{id}` | Invalida cache, dispara `refresh-reports` |

### Evento Global
Tras cada mutacion exitosa, dispara `window.dispatchEvent(new Event('refresh-reports'))` para que el sidebar del dashboard actualice su lista de reportes.

---

## Hook: useChildReports

**Archivo:** `src/hooks/useChildReports.ts`

### Endpoint
`GET /api/reports/{parentId}/children`

### Retorno
| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `children` | `Report[]` | Sub-reportes del padre |
| `isLoading` | `boolean` | Estado de carga |
| `createChild` | `(payload) => Promise` | Crea sub-reporte con padreId fijado |
