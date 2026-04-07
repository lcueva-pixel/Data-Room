# Modulo: Reportes (Reports)

---

## Archivos del Modulo

| Archivo | Proposito |
|---------|-----------|
| `src/reports/reports.module.ts` | Declaracion del modulo |
| `src/reports/reports.controller.ts` | 7 endpoints |
| `src/reports/reports.service.ts` | Logica con jerarquia padre-hijo |
| `src/reports/dto/create-report.dto.ts` | DTO de creacion |
| `src/reports/dto/update-report.dto.ts` | DTO de actualizacion |
| `src/reports/dto/list-reports-query.dto.ts` | DTO de query params |

---

## Endpoints

### GET /api/reports

**Guard:** JwtAuthGuard (sin AdminGuard - accesible para todos los usuarios autenticados)

**Descripcion:** Obtener reportes accesibles segun el rol del usuario.

**Logica:**
- Lee `req.user.rol_id` del token JWT
- **Si rol_id = 1 (admin):** Retorna TODOS los reportes raiz (`padreId = null`) activos, con hijos anidados hasta 2 niveles de profundidad
- **Si rol_id != 1:** Retorna solo reportes raiz activos que estan asignados al rol del usuario via `cex_reportes_roles`, con hijos filtrados por el mismo rol

**Includes anidados:** El query incluye `children` recursivamente (2 niveles) con `reportesRoles` y datos del rol en cada nivel.

---

### GET /api/reports/admin

**Guard:** JwtAuthGuard + AdminGuard

**Descripcion:** Obtener todos los reportes para administracion (paginado).

**Query Params (ListReportsQueryDto):**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Pagina actual |
| `limit` | number | 5 | Items por pagina |
| `search` | string | - | Busca en titulo y descripcion |
| `sortBy` | string | - | Campo: id, titulo, fechaRegistro |
| `order` | string | 'asc' | Direccion |
| `activo` | boolean | - | Filtrar por estado |

**Respuesta:** `PaginatedResponse` con reportes incluyendo `reportesRoles` con datos del rol, conteo de hijos (`_count.children`), y datos del padre.

---

### GET /api/reports/:id/children

**Guard:** JwtAuthGuard + AdminGuard

**Descripcion:** Obtener los sub-reportes directos de un reporte padre.

**Params:** `id` (number)

**Logica:** `prisma.report.findMany({ where: { padreId: id } })` con includes de roles y conteo de hijos propios.

---

### POST /api/reports

**Guard:** JwtAuthGuard + AdminGuard

**Body (CreateReportDto):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| `titulo` | string | @IsString |
| `descripcion` | string | @IsOptional |
| `urlIframe` | string | @IsString |
| `rolesIds` | number[] | @IsArray, @IsInt({each}), @ArrayMinSize(1) |
| `activo` | boolean | @IsOptional |
| `padreId` | number \| null | @IsOptional, @IsInt |

**Logica:**
1. Si `padreId` esta presente, valida que el reporte padre exista
2. Crea el reporte con `prisma.report.create()`
3. Crea registros en `cex_reportes_roles` para cada `rolId` en `rolesIds`
4. Retorna `{ message: 'Reporte creado correctamente' }`

---

### PUT /api/reports/:id

**Guard:** JwtAuthGuard + AdminGuard

**Body (UpdateReportDto):** Todos los campos opcionales.

**Logica:**
1. Construye objeto `data` con campos presentes (titulo, urlIframe, descripcion, activo, padreId)
2. **Validacion anti-circular:** Si se cambia `padreId`, recorre la cadena de ancestros para verificar que no se cree un ciclo
3. Ejecuta `prisma.report.update()`
4. Si `rolesIds` esta presente: elimina todos los `ReportRole` existentes y crea los nuevos
5. Retorna `{ message: 'Reporte actualizado correctamente' }`

### Validacion de Dependencias Circulares
```
Si id=3 quiere tener padreId=7:
  1. Busca padre de id=7 -> padreId=5
  2. Busca padre de id=5 -> padreId=3  <-- CIRCULAR!
  3. Lanza error: no se permite
```

---

### PATCH /api/reports/:id/toggle

**Guard:** JwtAuthGuard + AdminGuard

**Logica:** Invierte `activo` del reporte. Retorna reporte actualizado con roles.

---

### DELETE /api/reports/:id

**Guard:** JwtAuthGuard + AdminGuard

**Logica:** Soft delete: `activo = false`. Retorna `{ message: 'Reporte desactivado' }`.
