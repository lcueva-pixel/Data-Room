# Tabla: cex_reportes_roles

**Modelo Prisma:** `ReportRole`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_reportes_roles` es una **tabla intermedia (pivot/junction)** que implementa la relacion de **muchos a muchos (N:M)** entre reportes y roles. Define que roles tienen acceso a que reportes. Un reporte puede estar asignado a multiples roles, y un rol puede tener acceso a multiples reportes.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `reporte_id` | `reporteId` | `INTEGER` | Si (compuesta) | Si | No | No | - | FK al reporte. Parte de la clave primaria compuesta |
| `rol_id` | `rolId` | `INTEGER` | Si (compuesta) | Si | No | No | - | FK al rol. Parte de la clave primaria compuesta |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Regla de Eliminacion | Descripcion |
|----------|------------------|------|----------|---------------------|-------------|
| `reporte` | `cex_reportes` (Report) | Muchos a Uno (N:1) | `reporte_id -> Report.id` | `onDelete: Cascade` | Si el reporte se elimina, se eliminan todas sus asignaciones de roles |
| `rol` | `cex_roles` (Role) | Muchos a Uno (N:1) | `rol_id -> Role.id` | `onDelete: Cascade` | Si el rol se elimina, se eliminan todas sus asignaciones de reportes |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY (compuesta) | `[reporte_id, rol_id]` | Clave primaria compuesta que garantiza unicidad de la combinacion reporte-rol |
| FOREIGN KEY | `reporte_id` | Referencia a `cex_reportes.id` con eliminacion en cascada |
| FOREIGN KEY | `rol_id` | Referencia a `cex_roles.id` con eliminacion en cascada |

---

## Comportamiento en Cascada

- **Eliminacion de Reporte:** Si se elimina un registro de `cex_reportes`, todas las filas de esta tabla con ese `reporte_id` se eliminan automaticamente.
- **Eliminacion de Rol:** Si se elimina un registro de `cex_roles`, todas las filas de esta tabla con ese `rol_id` se eliminan automaticamente.
- **Actualizacion de roles de un reporte:** Cuando se edita un reporte y se cambian sus roles asignados, el backend elimina todas las filas existentes para ese `reporte_id` y crea las nuevas asignaciones.

---

## Notas de Negocio

- Esta tabla no tiene campos propios mas alla de las claves foraneas. Su unica funcion es establecer la relacion N:M.
- Al crear un reporte, se requiere al menos un rol (validado por `@ArrayMinSize(1)` en el DTO).
- El administrador (rol 1) tiene acceso a todos los reportes sin depender de esta tabla; la logica de filtrado se aplica solo a roles no-admin.
