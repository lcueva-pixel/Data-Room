# Tabla: cex_log_actividades

**Modelo Prisma:** `LogActivity`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_log_actividades` registra las acciones significativas realizadas por los usuarios dentro del sistema. Funciona como un log de actividad que permite rastrear operaciones como creacion, edicion, eliminacion de reportes, usuarios, y cualquier otra accion relevante para la trazabilidad del sistema.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `id` | `id` | `INTEGER` | Si | No | Si (PK) | No | `autoincrement()` | Identificador unico del registro de actividad |
| `usuario_id` | `usuarioId` | `INTEGER` | No | Si | No | No | - | FK al usuario que realizo la accion |
| `accion` | `accion` | `VARCHAR(100)` | No | No | No | No | - | Descripcion corta de la accion realizada (ej: "CREAR_USUARIO", "EDITAR_REPORTE") |
| `detalle` | `detalle` | `TEXT` | No | No | No | Si | `null` | Informacion adicional sobre la accion. Puede contener datos como el nombre del recurso afectado |
| `fecha_hora` | `fechaHora` | `TIMESTAMPTZ` | No | No | No | No | `now()` | Fecha y hora exacta de la accion con zona horaria |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Descripcion |
|----------|------------------|------|----------|-------------|
| `usuario` | `cex_usuarios` (User) | Muchos a Uno (N:1) | `usuario_id -> User.id` | Referencia al usuario que ejecuto la accion |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY | `id` | Clave primaria autoincremental |
| FOREIGN KEY | `usuario_id` | Referencia a `cex_usuarios.id` |

---

## Uso en el Sistema

- El `LogService` expone un metodo `register()` que puede ser invocado desde cualquier modulo del backend para registrar actividades.
- El endpoint `GET /api/logs` retorna todos los registros ordenados por `fecha_hora` descendente, incluyendo los datos del usuario (nombreCompleto, email).
- Los registros son de solo escritura; no se actualizan ni eliminan.

---

## Notas de Negocio

- El campo `accion` almacena un identificador corto de la operacion (maximo 100 caracteres).
- El campo `detalle` es opcional y permite agregar contexto adicional sobre la accion.
- La tabla crece de forma continua sin mecanismo de purgado automatico.
- El `LogModule` exporta el `LogService` para que otros modulos puedan registrar actividades.
- Actualmente no se esta usando esta tabla dentro del sistema (solo existe)
