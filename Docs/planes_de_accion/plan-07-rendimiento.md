# Plan 07: Rendimiento

**Alcance:** Optimizacion de query de auditoria + limpieza de bundle  
**Dependencias a instalar:** Ninguna  
**Dependencias a desinstalar:** `recharts` (frontend)  
**Archivos afectados:** 4

---

## Parte A: Optimizacion del Endpoint GET /api/audit

### Problema Actual

El `AuditService.findAll()` carga **todos** los registros de ambas tablas en memoria antes de paginar:

**`audit.service.ts` lineas 23-38:**
```typescript
const [accesos, visualizaciones] = await Promise.all([
  this.prisma.auditAccess.findMany({ ... }),      // TODOS los accesos
  this.prisma.reportViewLog.findMany({ ... }),     // TODAS las visualizaciones
]);
```

**Lineas 56-73:** Combina en arrays JS, filtra con `.filter()`, ordena con `.sort()`, pagina con `.slice()`.

Con 10,000 registros de auditoria + 50,000 visualizaciones, cada peticion cargaria 60,000 registros en RAM para retornar solo 10.

### Solucion: UNION ALL con $queryRaw

Reemplazar las dos queries de Prisma + procesamiento en JS por una unica query SQL nativa que combina, filtra, ordena y pagina directamente en PostgreSQL.

### Archivos a Modificar

#### A.1 `BACKEND/src/audit/audit.service.ts`

**Reemplazar el metodo `findAll()` completo (lineas 20-76).**

**Query SQL propuesta:**

```sql
SELECT id, tipo, fecha_hora, usuario_nombre, usuario_email, reporte_titulo, duracion
FROM (
  SELECT
    a.id,
    'ACCESO' AS tipo,
    a.fecha_hora,
    u.nombre_completo AS usuario_nombre,
    u.email AS usuario_email,
    NULL AS reporte_titulo,
    NULL AS duracion
  FROM cex_auditoria_accesos a
  JOIN cex_usuarios u ON u.id = a.usuario_id

  UNION ALL

  SELECT
    v.id,
    'VISUALIZACION' AS tipo,
    v.fecha_hora,
    u.nombre_completo AS usuario_nombre,
    u.email AS usuario_email,
    r.titulo AS reporte_titulo,
    v.duracion_segundos AS duracion
  FROM cex_log_visualizaciones v
  JOIN cex_usuarios u ON u.id = v.usuario_id
  JOIN cex_reportes r ON r.id = v.reporte_id
) AS audit
WHERE (
  $1::text IS NULL
  OR LOWER(usuario_nombre) LIKE '%' || LOWER($1) || '%'
  OR LOWER(usuario_email) LIKE '%' || LOWER($1) || '%'
)
ORDER BY fecha_hora DESC
LIMIT $2 OFFSET $3
```

**Implementacion en Prisma con `$queryRaw`:**

```typescript
async findAll(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;
  const search = query.search || null;

  // Query de datos paginados
  const entries = await this.prisma.$queryRaw<UnifiedAuditEntry[]>`
    SELECT id, tipo, fecha_hora AS "fechaHora", usuario_nombre, usuario_email, reporte_titulo, duracion
    FROM (
      SELECT a.id, 'ACCESO' AS tipo, a.fecha_hora,
             u.nombre_completo AS usuario_nombre, u.email AS usuario_email,
             NULL::text AS reporte_titulo, NULL::int AS duracion
      FROM cex_auditoria_accesos a
      JOIN cex_usuarios u ON u.id = a.usuario_id
      UNION ALL
      SELECT v.id, 'VISUALIZACION' AS tipo, v.fecha_hora,
             u.nombre_completo AS usuario_nombre, u.email AS usuario_email,
             r.titulo AS reporte_titulo, v.duracion_segundos AS duracion
      FROM cex_log_visualizaciones v
      JOIN cex_usuarios u ON u.id = v.usuario_id
      JOIN cex_reportes r ON r.id = v.reporte_id
    ) AS audit
    WHERE (
      ${search}::text IS NULL
      OR LOWER(usuario_nombre) LIKE '%' || LOWER(${search}) || '%'
      OR LOWER(usuario_email) LIKE '%' || LOWER(${search}) || '%'
    )
    ORDER BY fecha_hora DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Query de conteo total (para paginacion)
  const countResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
    SELECT COUNT(*) AS total FROM (
      SELECT a.id, u.nombre_completo AS usuario_nombre, u.email AS usuario_email
      FROM cex_auditoria_accesos a
      JOIN cex_usuarios u ON u.id = a.usuario_id
      UNION ALL
      SELECT v.id, u.nombre_completo AS usuario_nombre, u.email AS usuario_email
      FROM cex_log_visualizaciones v
      JOIN cex_usuarios u ON u.id = v.usuario_id
      JOIN cex_reportes r ON r.id = v.reporte_id
    ) AS audit
    WHERE (
      ${search}::text IS NULL
      OR LOWER(usuario_nombre) LIKE '%' || LOWER(${search}) || '%'
      OR LOWER(usuario_email) LIKE '%' || LOWER(${search}) || '%'
    )
  `;

  const total = Number(countResult[0].total);

  // Mapear resultados al formato UnifiedAuditEntry
  const mapped = entries.map((e: any) => ({
    id: `${e.tipo === 'ACCESO' ? 'acceso' : 'vista'}-${e.id}`,
    tipo: e.tipo,
    fechaHora: e.fechaHora,
    usuario: {
      nombreCompleto: e.usuario_nombre,
      email: e.usuario_email,
    },
    ...(e.reporte_titulo && { reporte: { titulo: e.reporte_titulo } }),
    ...(e.duracion != null && { duracion: e.duracion }),
  }));

  return buildPaginatedResponse(mapped, total, page, limit);
}
```

**Ventajas:**
| Aspecto | Antes | Despues |
|---------|-------|---------|
| Registros cargados en RAM | Todos (N+M) | Solo `limit` (10) |
| Filtrado | JavaScript `.filter()` | PostgreSQL `WHERE LIKE` |
| Ordenamiento | JavaScript `.sort()` | PostgreSQL `ORDER BY` (usa indice) |
| Paginacion | JavaScript `.slice()` | PostgreSQL `LIMIT/OFFSET` |
| Queries ejecutadas | 2 findMany completas | 2 queries optimizadas (datos + conteo) |

**Nota sobre seguridad:** Prisma `$queryRaw` con template literals parametriza automaticamente los valores (`${search}`, `${limit}`, `${offset}`), previniendo SQL injection.

#### A.2 `BACKEND/src/audit/types/audit.types.ts`

**Verificar** que el tipo `UnifiedAuditEntry` sea compatible con el nuevo formato de respuesta. Si el campo `id` cambia de `number` a `string` (ej: `"acceso-5"`), actualizar el tipo.

#### A.3 Indices Recomendados

Agregar en `schema.prisma` para optimizar las queries:

```prisma
model AuditAccess {
  // ... campos existentes ...
  @@index([fechaHora])    // Ya agregado en Plan 03
}

model ReportViewLog {
  // ... campos existentes ...
  @@index([fechaHora])    // Agregar si no existe
}
```

Verificar que los indices de `fecha_hora` ya existen (fueron agregados en el Plan 03 para LogActivity pero no para ReportViewLog). Si no, agregarlos y ejecutar `npx prisma db push`.

---

## Parte B: Limpieza de Bundle (recharts)

### Problema Detectado

**`frontend/package.json` linea 24:** `"recharts": "^3.8.1"`

La libreria `recharts` esta instalada (~200KB gzipped) pero no se usa en ningun componente del frontend. Fue detectada en la auditoria tecnica.

### Verificacion Previa

#### B.1 Buscar usos de recharts en el codigo

Antes de desinstalar, verificar que no hay imports:

```bash
cd frontend
grep -r "recharts" src/ --include="*.tsx" --include="*.ts"
```

Si no retorna resultados, es seguro desinstalar.

#### B.2 Desinstalar

```bash
cd frontend
npm uninstall recharts
```

### Archivo Afectado

| # | Archivo | Cambio |
|:-:|---------|--------|
| 1 | `frontend/package.json` | Se elimina `recharts` de dependencies |

### Impacto Esperado

| Metrica | Antes | Despues |
|---------|-------|---------|
| Bundle size (estimado) | +200KB gzipped | -200KB gzipped |
| Dependencias en node_modules | Incluye recharts + d3 | Eliminadas |
| Funcionalidad | Sin cambios | Sin cambios (no se usaba) |

---

## Resumen de Archivos

| # | Archivo | Accion | Parte |
|:-:|---------|--------|:-----:|
| 1 | `BACKEND/src/audit/audit.service.ts` | Modificar (reescribir findAll con $queryRaw) | A |
| 2 | `BACKEND/src/audit/types/audit.types.ts` | Verificar/actualizar tipo | A |
| 3 | `BACKEND/prisma/schema.prisma` | Verificar indice en ReportViewLog.fechaHora | A |
| 4 | `frontend/package.json` | Desinstalar recharts | B |

## Orden de Ejecucion

```
1. Verificar/agregar indices en schema.prisma + prisma db push
2. Reescribir audit.service.ts con $queryRaw
3. Verificar tipos en audit.types.ts
4. Probar endpoint GET /api/audit con Postman/curl
5. Buscar usos de recharts en el frontend
6. Si no hay usos: npm uninstall recharts
7. Verificar que el frontend compila sin errores
```
