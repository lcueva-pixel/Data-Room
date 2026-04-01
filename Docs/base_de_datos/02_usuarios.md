# Tabla: cex_usuarios

**Modelo Prisma:** `User`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_usuarios` almacena la informacion de todos los usuarios registrados en el sistema Data Room. Contiene las credenciales de acceso (email y password hasheado), datos de perfil, la asignacion de rol y el estado de actividad del usuario. Es la tabla central del sistema de autenticacion y autorizacion.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `id` | `id` | `INTEGER` | Si | No | Si (PK) | No | `autoincrement()` | Identificador unico del usuario |
| `nombre_completo` | `nombreCompleto` | `VARCHAR(100)` | No | No | No | No | - | Nombre completo del usuario para visualizacion en la interfaz |
| `email` | `email` | `VARCHAR(150)` | No | No | Si | No | - | Correo electronico del usuario. Sirve como identificador de login. Debe ser unico |
| `password_hash` | `passwordHash` | `TEXT` | No | No | No | No | - | Hash bcrypt (10 rounds) del password del usuario. Nunca se almacena en texto plano |
| `rol_id` | `rolId` | `INTEGER` | No | Si | No | No | - | FK al rol asignado al usuario. Determina sus permisos y reportes visibles |
| `activo` | `activo` | `BOOLEAN` | No | No | No | No | `true` | Indica si el usuario esta activo. Los usuarios inactivos no pueden iniciar sesion. Se usa para soft delete |
| `fecha_creacion` | `fechaCreacion` | `TIMESTAMPTZ` | No | No | No | No | `now()` | Fecha y hora de creacion del registro con zona horaria |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Descripcion |
|----------|------------------|------|----------|-------------|
| `rol` | `cex_roles` (Role) | Muchos a Uno (N:1) | `rol_id -> Role.id` | Cada usuario pertenece a un unico rol |
| `auditAccesses` | `cex_auditoria_accesos` (AuditAccess) | Uno a Muchos (1:N) | `AuditAccess.usuario_id` | Registro de todos los accesos/logins del usuario |
| `logActivities` | `cex_log_actividades` (LogActivity) | Uno a Muchos (1:N) | `LogActivity.usuario_id` | Registro de todas las actividades realizadas por el usuario |
| `reportViewLogs` | `cex_log_visualizaciones` (ReportViewLog) | Uno a Muchos (1:N) | `ReportViewLog.usuario_id` | Registro de todos los reportes visualizados por el usuario con duracion |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY | `id` | Clave primaria autoincremental |
| UNIQUE | `email` | No pueden existir dos usuarios con el mismo email |
| FOREIGN KEY | `rol_id` | Referencia a `cex_roles.id` |

---

## Notas de Negocio

- **Soft Delete:** Los usuarios no se eliminan fisicamente. El campo `activo` se establece en `false` para desactivarlos.
- **Autenticacion:** El `AuthService` busca usuarios con `activo = true` al validar credenciales. Un usuario inactivo no puede iniciar sesion.
- **Password:** Se hashea con bcrypt (10 rounds) al crear o actualizar. El campo `passwordHash` nunca se retorna en las respuestas de la API.
- **Rol:** El `rolId` determina el comportamiento del sistema: si `rolId = 1`, el usuario es administrador y tiene acceso total.
