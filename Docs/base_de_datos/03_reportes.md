# Tabla: cex_reportes

**Modelo Prisma:** `Report`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_reportes` almacena los reportes de Looker Studio que se visualizan en el portal Data Room. Cada reporte contiene un titulo, descripcion opcional y la URL del iframe de Looker Studio que se renderiza en el visor del dashboard. Los reportes soportan una estructura jerarquica (padre-hijo) para organizar sub-reportes.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `id` | `id` | `INTEGER` | Si | No | Si (PK) | No | `autoincrement()` | Identificador unico del reporte |
| `titulo` | `titulo` | `VARCHAR(100)` | No | No | No | No | - | Titulo del reporte que se muestra en el sidebar y tablas de administracion |
| `descripcion` | `descripcion` | `TEXT` | No | No | No | Si | `null` | Descripcion opcional del contenido o proposito del reporte |
| `url_iframe` | `urlIframe` | `TEXT` | No | No | No | No | - | URL completa del iframe de Looker Studio que se renderiza en el visor de reportes |
| `activo` | `activo` | `BOOLEAN` | No | No | No | No | `true` | Indica si el reporte esta activo y visible para los usuarios. Se usa para soft delete |
| `fecha_registro` | `fechaRegistro` | `TIMESTAMPTZ` | No | No | No | No | `now()` | Fecha y hora de creacion del reporte con zona horaria |
| `padre_id` | `padreId` | `INTEGER` | No | Si | No | Si | `null` | FK auto-referencial al reporte padre. Si es `null`, el reporte es de nivel raiz |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Regla de Eliminacion | Descripcion |
|----------|------------------|------|----------|---------------------|-------------|
| `padre` | `cex_reportes` (Report) | Muchos a Uno (N:1) | `padre_id -> Report.id` | `onDelete: SetNull` | Referencia al reporte padre. Si el padre se elimina, este campo se establece en `null` |
| `children` | `cex_reportes` (Report) | Uno a Muchos (1:N) | `Report.padre_id` | - | Reportes hijos que dependen de este reporte padre |
| `reportesRoles` | `cex_reportes_roles` (ReportRole) | Uno a Muchos (1:N) | `ReportRole.reporte_id` | `Cascade` | Roles que tienen acceso a este reporte |
| `reportViewLogs` | `cex_log_visualizaciones` (ReportViewLog) | Uno a Muchos (1:N) | `ReportViewLog.reporte_id` | - | Registros de visualizacion de este reporte |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY | `id` | Clave primaria autoincremental |
| FOREIGN KEY | `padre_id` | Referencia a `cex_reportes.id` (auto-referencial), nullable, onDelete SetNull |

---

## Jerarquia de Reportes

La tabla soporta una estructura jerarquica auto-referencial:

```
Reporte Padre (padre_id = null)
  |-- Sub-reporte 1 (padre_id = id del padre)
  |-- Sub-reporte 2 (padre_id = id del padre)
```

- Los reportes con `padre_id = null` son reportes de nivel raiz y aparecen en el primer nivel del sidebar.
- Los reportes con `padre_id` apuntando a otro reporte son sub-reportes y se muestran anidados bajo su padre en el sidebar con expand/collapse.
- El backend valida dependencias circulares al actualizar el `padreId` (un reporte no puede ser hijo de si mismo ni de sus descendientes).
- Si un reporte padre se elimina, los hijos quedan con `padre_id = null` (pasan a nivel raiz) gracias a `onDelete: SetNull`.

---

## Notas de Negocio

- **Soft Delete:** Los reportes no se eliminan fisicamente. Se desactivan con `activo = false`.
- **Acceso por roles:** Un reporte solo es visible para los usuarios cuyo rol esta asociado en la tabla `cex_reportes_roles`. Excepcion: el administrador (rol 1) ve todos los reportes.
- **Visualizacion:** La URL del iframe se carga directamente en un `<iframe>` en el componente ReportViewer del frontend.
