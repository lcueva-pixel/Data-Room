# Modulo: Auditoria (Audit)

---

## Archivos del Modulo

| Archivo | Proposito |
|---------|-----------|
| `src/audit/audit.module.ts` | Declaracion del modulo (exporta AuditService) |
| `src/audit/audit.controller.ts` | 2 endpoints |
| `src/audit/audit.service.ts` | Logica de auditoria unificada |
| `src/audit/dto/create-report-view.dto.ts` | DTO de registro de visualizacion |
| `src/audit/types/audit.types.ts` | Tipos internos |

---

## Endpoints

### GET /api/audit

**Guard:** JwtAuthGuard + AdminGuard

**Descripcion:** Obtener registros de auditoria unificados (accesos + visualizaciones).

**Query Params (PaginationQueryDto):**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Pagina actual |
| `limit` | number | 5 | Items por pagina |
| `search` | string | - | Busca en nombre y email del usuario |

**Logica del servicio (`findAll`):**
1. Ejecuta en paralelo dos queries:
   - `prisma.auditAccess.findMany()` - Registros de acceso
   - `prisma.reportViewLog.findMany()` - Registros de visualizacion
2. Mapea cada registro al formato `UnifiedAuditEntry`:
   - Accesos: `{ tipo: 'ACCESO', usuario, fechaHora }`
   - Visualizaciones: `{ tipo: 'VISUALIZACION', usuario, reporte, duracion, fechaHora }`
3. Si hay busqueda, filtra por `usuario.nombreCompleto` o `usuario.email` (case-insensitive)
4. Combina y ordena por `fechaHora` descendente
5. Aplica paginacion manual (slice)
6. Retorna `PaginatedResponse<UnifiedAuditEntry>`

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": 1,
      "tipo": "ACCESO",
      "fechaHora": "2026-03-31T09:30:00.000Z",
      "usuario": { "nombreCompleto": "Admin", "email": "admin@admin.com" }
    },
    {
      "id": 5,
      "tipo": "VISUALIZACION",
      "fechaHora": "2026-03-31T09:35:00.000Z",
      "usuario": { "nombreCompleto": "Admin", "email": "admin@admin.com" },
      "reporte": { "titulo": "Reporte Financiero" },
      "duracion": 120
    }
  ],
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

### POST /api/audit/report-time

**Guard:** JwtAuthGuard (sin AdminGuard - accesible para todos los usuarios autenticados)

**Descripcion:** Registrar el tiempo de visualizacion de un reporte.

**Body (CreateReportViewDto):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| `reporteId` | number | @IsInt, @Min(1) |
| `duracion` | number | @IsInt, @Min(1), en segundos |

**Logica:**
1. Lee `req.user.userId` del token JWT
2. Valida que el reporte exista: `prisma.report.findUniqueOrThrow()`
3. Crea registro: `prisma.reportViewLog.create({ usuarioId, reporteId, duracion })`
4. Si el reporte no existe: lanza `NotFoundException`

---

## Tipos Internos

**Archivo:** `src/audit/types/audit.types.ts`

```typescript
AuditAccessRecord {
  usuarioId: number
  ipAddress?: string
  userAgent?: string
}

UnifiedAuditEntry {
  id: number
  tipo: 'ACCESO' | 'VISUALIZACION'
  fechaHora: Date
  usuario: { nombreCompleto: string; email: string }
  reporte?: { titulo: string }
  duracion?: number
}
```

---

## Metodo Auxiliar: registerAccess

**No expuesto via endpoint.** Usado internamente por `AuthService` al hacer login.

```typescript
registerAccess(record: AuditAccessRecord): Promise<AuditAccess>
```

Crea un registro en `cex_auditoria_accesos` con el `usuarioId` y `userAgent`.
