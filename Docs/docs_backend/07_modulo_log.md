# Modulo: Log de Actividades

---

## Archivos del Modulo

| Archivo | Proposito |
|---------|-----------|
| `src/log/log.module.ts` | Declaracion del modulo (exporta LogService) |
| `src/log/log.controller.ts` | 1 endpoint GET |
| `src/log/log.service.ts` | Consulta y registro de actividades |
| `src/log/types/log.types.ts` | Tipos internos |

---

## Configuracion

**Guard del controller:** `@UseGuards(JwtAuthGuard)`  
Requiere autenticacion pero no requiere rol admin.

**Exports:** `LogService` se exporta para uso desde otros modulos.

---

## Endpoint

### GET /api/logs

**Guard:** JwtAuthGuard

**Descripcion:** Obtener todas las actividades registradas en el sistema.

**Logica:**
```typescript
prisma.logActivity.findMany({
  orderBy: { fechaHora: 'desc' },
  include: {
    usuario: {
      select: { nombreCompleto: true, email: true }
    }
  }
})
```

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "usuarioId": 5,
    "accion": "CREAR_REPORTE",
    "detalle": "Reporte: Dashboard Financiero",
    "fechaHora": "2026-03-31T09:30:00.000Z",
    "usuario": {
      "nombreCompleto": "Admin",
      "email": "admin@admin.com"
    }
  }
]
```

**Nota:** Este endpoint retorna TODOS los registros sin paginacion. Para grandes volumenes de datos, podria requerir paginacion.

---

## Metodo Auxiliar: register

**No expuesto via endpoint.** Disponible para otros modulos via `LogService`.

```typescript
register(record: LogActivityRecord): Promise<LogActivity>
```

Crea un registro en `cex_log_actividades` con:

```typescript
LogActivityRecord {
  usuarioId: number   // ID del usuario que realizo la accion
  accion: string      // Identificador de la accion (max 100 chars)
  detalle?: string    // Informacion adicional opcional
}
```

### Uso desde otros modulos

Cualquier modulo que importe `LogModule` puede inyectar `LogService` y usar `register()` para registrar actividades del usuario.
