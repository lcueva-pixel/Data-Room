# Modulo: Auditoria (Admin)

**Acceso:** Solo administradores (rol_id = 1)  
**Ruta:** `/dashboard/admin/audit`

---

## Archivos Involucrados

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| Audit Page | `src/app/dashboard/admin/audit/page.tsx` | Pagina de auditoria |
| AuditTable | `src/components/admin/AuditTable.tsx` | Tabla de registros de auditoria |
| useAudit | `src/hooks/useAudit.ts` | Hook de datos de auditoria |

---

## Pagina de Auditoria

**Archivo:** `src/app/dashboard/admin/audit/page.tsx`

Pagina simple que renderiza `AuditTable` con los datos del hook `useAudit`. Soporta busqueda, paginacion y selector de items por pagina.

---

## AuditTable - Tabla de Auditoria

**Archivo:** `src/components/admin/AuditTable.tsx`

### Columnas

| Columna | Campo | Descripcion |
|---------|-------|-------------|
| Tipo | `tipo` | Badge con color: azul para "ACCESO", violeta para "VISUALIZACION" |
| Usuario | `usuario.nombreCompleto` | Nombre del usuario con icono diferenciado (LogIn / Monitor) |
| Email | `usuario.email` | Correo electronico del usuario |
| Fecha y Hora | `fechaHora` | Formateado como DD/MM/YYYY HH:MM (locale es-PE) |
| Reporte | `reporte.titulo` | Titulo del reporte (solo para tipo VISUALIZACION, vacio para ACCESO) |
| Duracion | `duracion` | Tiempo de visualizacion formateado |

### Formato de Duracion
```
>= 60 segundos: "Xm Ys" (ej: "2m 15s")
< 60 segundos: "Xs" (ej: "45s")
Sin duracion: "-"
```

### Iconos por Tipo
| Tipo | Icono | Color | Descripcion |
|------|-------|-------|-------------|
| ACCESO | LogIn | Azul | Inicio de sesion del usuario |
| VISUALIZACION | Monitor | Violeta | Visualizacion de un reporte |

### Funcionalidades

**Busqueda:**
- Debounce de 300ms
- Busca por nombre de usuario y email

**Items por pagina:**
- Selector: 5, 10, 20, 50
- Default: 10

**Paginacion:**
- "Pagina X de Y" con botones Anterior/Siguiente

**Loading:**
- Skeleton de filas con animacion pulse

---

## Hook: useAudit

**Archivo:** `src/hooks/useAudit.ts`

### Endpoint
`GET /api/audit` con query params de paginacion y busqueda.

### Estado Interno
| Estado | Default | Descripcion |
|--------|---------|-------------|
| `page` | 1 | Pagina actual |
| `limit` | 10 | Items por pagina |
| `search` | '' | Texto de busqueda |

### Retorno
| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `entries` | `AuditEntry[]` | Registros de auditoria |
| `meta` | `PaginatedMeta` | Metadatos de paginacion |
| `isLoading` | `boolean` | Estado de carga |
| `query` | object | Estado actual de la consulta |
| `setPage` | function | Cambiar pagina |
| `setSearch` | function | Cambiar busqueda |
| `setLimit` | function | Cambiar items por pagina |

### Tipos de Datos

```typescript
AuditEntry {
  id: number
  tipo: 'ACCESO' | 'VISUALIZACION'
  fechaHora: string
  usuario: {
    nombreCompleto: string
    email: string
  }
  reporte?: {
    titulo: string
  }
  duracion?: number  // en segundos, solo para VISUALIZACION
}
```

---

## Flujo de Datos

```
[Login exitoso]
     |
     v
[AuthService registra AuditAccess] --> tipo: ACCESO
     
[Usuario ve reporte >= 3 seg]
     |
     v
[useReportTracking envia duracion] --> [AuditService registra ReportViewLog] --> tipo: VISUALIZACION

     |
     v
[GET /api/audit] --> [AuditService combina ambas fuentes] --> [AuditTable renderiza]
```

Los registros de ambas fuentes se combinan en el backend, se ordenan por fecha descendente, y se paginan antes de enviarlos al frontend.
