# Tabla: cex_log_visualizaciones

**Modelo Prisma:** `ReportViewLog`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_log_visualizaciones` registra cada vez que un usuario visualiza un reporte en el portal, incluyendo la duracion en segundos de la visualizacion. Permite al administrador conocer que reportes son mas consultados, por que usuarios y durante cuanto tiempo, proporcionando metricas de uso del sistema.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `id` | `id` | `INTEGER` | Si | No | Si (PK) | No | `autoincrement()` | Identificador unico del registro de visualizacion |
| `usuario_id` | `usuarioId` | `INTEGER` | No | Si | No | No | - | FK al usuario que visualizo el reporte |
| `reporte_id` | `reporteId` | `INTEGER` | No | Si | No | No | - | FK al reporte que fue visualizado |
| `duracion_segundos` | `duracion` | `INTEGER` | No | No | No | No | - | Tiempo en segundos que el usuario estuvo viendo el reporte |
| `fecha_hora` | `fechaHora` | `TIMESTAMPTZ` | No | No | No | No | `now()` | Fecha y hora de la visualizacion con zona horaria |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Descripcion |
|----------|------------------|------|----------|-------------|
| `usuario` | `cex_usuarios` (User) | Muchos a Uno (N:1) | `usuario_id -> User.id` | Referencia al usuario que visualizo el reporte |
| `reporte` | `cex_reportes` (Report) | Muchos a Uno (N:1) | `reporte_id -> Report.id` | Referencia al reporte que fue visualizado |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY | `id` | Clave primaria autoincremental |
| FOREIGN KEY | `usuario_id` | Referencia a `cex_usuarios.id` |
| FOREIGN KEY | `reporte_id` | Referencia a `cex_reportes.id` |

---

## Flujo de Registro

1. El usuario selecciona un reporte en el dashboard.
2. El hook `useReportTracking` en el frontend comienza a contar el tiempo.
3. Cuando el usuario cambia de reporte o cierra la pagina, el hook envia la duracion al backend via `POST /api/audit/report-time`.
4. El `AuditService.registerReportView()` valida que el reporte exista y crea el registro.
5. **Umbral minimo:** Solo se registran visualizaciones de 3 segundos o mas (filtrado en el frontend).

---

## Notas de Negocio

- El campo `duracion` se almacena en **segundos** (entero).
- El frontend usa `navigator.sendBeacon` o `fetch` con `keepalive` para enviar los datos incluso al cerrar la pestana.
- En la vista de auditoria, estos registros se muestran con tipo "VISUALIZACION" y un icono de Monitor.
- La duracion se formatea en el frontend como "Xm Ys" para mejor legibilidad.
- Los registros son de solo escritura; no se actualizan ni eliminan.
