# Tabla: cex_roles

**Modelo Prisma:** `Role`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_roles` almacena los roles de usuario del sistema Data Room. Cada rol define un nivel de acceso y permisos dentro de la plataforma. Los roles determinan que reportes puede visualizar un usuario y si tiene acceso a las funcionalidades administrativas del sistema.

Actualmente el sistema opera con un esquema de roles simple donde el **rol con ID 1 es el Administrador**, que tiene acceso completo a todas las funcionalidades incluyendo gestion de usuarios, reportes y auditoria.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `id` | `id` | `INTEGER` | Si | No | Si (PK) | No | `autoincrement()` | Identificador unico del rol, generado automaticamente |
| `rol_descripcion` | `rolDescripcion` | `VARCHAR(50)` | No | No | Si | No | - | Nombre descriptivo del rol (ej: "Administrador", "Analista"). Debe ser unico en el sistema |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Descripcion |
|----------|------------------|------|----------|-------------|
| `usuarios` | `cex_usuarios` (User) | Uno a Muchos (1:N) | `User.rol_id` | Un rol puede estar asignado a multiples usuarios |
| `reportesRoles` | `cex_reportes_roles` (ReportRole) | Uno a Muchos (1:N) | `ReportRole.rol_id` | Un rol puede tener acceso a multiples reportes a traves de la tabla intermedia |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY | `id` | Clave primaria autoincremental |
| UNIQUE | `rol_descripcion` | No pueden existir dos roles con el mismo nombre |

---

## Notas de Negocio

- El rol con `id = 1` esta hardcodeado como **Administrador** en el `AdminGuard` del backend.
- Los roles se utilizan para filtrar los reportes visibles: un usuario solo ve los reportes asignados a su rol (excepto el administrador que ve todos).
- La eliminacion de un rol provoca eliminacion en cascada de los registros en `cex_reportes_roles` asociados.
