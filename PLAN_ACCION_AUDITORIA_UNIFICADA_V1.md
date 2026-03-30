# PLAN DE ACCIÓN — Fix Lockfiles + Auditoría Unificada
**Proyecto:** LockerStudio
**Fecha:** 2026-03-30
**Estado:** PENDIENTE DE APROBACIÓN

---

## Diagnóstico

### Problema 1: "Module not found: Can't resolve '@/hooks/useReportTracking'"

**El archivo SÍ existe.** `frontend/src/hooks/useReportTracking.ts` está en su lugar correcto.

El error **no es que falte el archivo** — es que Turbopack lo está buscando en el directorio incorrecto.

**Causa raíz:** Existe un `package.json` y un `package-lock.json` espurios en la raíz del monorepo (`LockerStudio/`):

```json
// LockerStudio/package.json (archivo problemático)
{
  "dependencies": {
    "bcrypt": "^6.0.0"
  }
}
```

Este archivo fue creado accidentalmente al ejecutar `npm install bcrypt` desde la carpeta raíz en lugar de desde `BACKEND/`. Turbopack detecta ese `package.json` y asume que `LockerStudio/` es la raíz del proyecto Next.js. Como consecuencia, el alias `@/` se resuelve a `LockerStudio/src/` (que no existe), en lugar de `LockerStudio/frontend/src/` (que sí existe).

**Cadena de errores:**
```
LockerStudio/package.json existe
    ↓
Turbopack elige LockerStudio/ como root
    ↓
@/* resuelve a LockerStudio/src/*
    ↓
LockerStudio/src/hooks/useReportTracking.ts no existe
    ↓
"Module not found"
```

### Problema 2: Warning de múltiples lockfiles

Mismo origen: hay dos `package-lock.json`:
- `LockerStudio/package-lock.json` — espurio, generado por el `npm install bcrypt` accidental
- `LockerStudio/frontend/package-lock.json` — legítimo, el del proyecto Next.js

Turbopack selecciona el de la raíz como autoritativo y advierte del conflicto.

### Requerimiento adicional: Tabla de auditoría unificada

Actualmente la tabla de auditoría solo muestra registros de `cex_auditoria_accesos` (accesos al sistema). Los registros de `cex_log_visualizaciones` (tiempo de visualización de reportes) existen en la BD pero **no se muestran en ninguna tabla del frontend**.

El objetivo es combinar ambas fuentes en **una sola tabla cronológica** con columnas: Tipo de Evento, Usuario, Correo, Fecha/Hora, y Detalle (nombre del reporte + duración formateada para visualizaciones).

---

## Resumen de Fases

| Fase | Área | Descripción |
|---|---|---|
| 1 | Raíz del monorepo | Eliminar `LockerStudio/package.json` y `LockerStudio/package-lock.json` espurios |
| 2 | Backend — Service | Refactorizar `findAll()` para combinar accesos + visualizaciones |
| 3 | Backend — Types | Definir tipo de respuesta unificado `UnifiedAuditEntry` |
| 4 | Frontend — Types | Actualizar `AuditEntry` en `audit.types.ts` con el nuevo shape |
| 5 | Frontend — Hook | Actualizar `useAudit.ts` (sin cambios de lógica, solo el tipo) |
| 6 | Frontend — Component | Reescribir `AuditTable.tsx` con las nuevas columnas |

---

## FASE 1 — Eliminar archivos espurios de la raíz

**Archivos a eliminar:**
- `LockerStudio/package.json`
- `LockerStudio/package-lock.json`

**Acción:** Eliminar ambos archivos con `rm` desde la raíz del monorepo.

**Efecto esperado:**
- Turbopack ya no detectará un proyecto Node en la raíz
- Seleccionará correctamente `LockerStudio/frontend/` como root del proyecto Next.js
- El alias `@/*` resolverá a `frontend/src/*` como se espera
- El warning de múltiples lockfiles desaparecerá
- El error `Module not found: @/hooks/useReportTracking` se resolverá automáticamente

> **¿Qué pasa con `bcrypt`?** `bcrypt` ya está correctamente declarado en `BACKEND/package.json` como dependencia del servidor NestJS. El `package.json` de la raíz no tenía ningún propósito legítimo — era un artefacto accidental sin ningún código que lo consumiera.

---

## FASE 2 — Backend: Refactorizar `findAll()` en `AuditService`

**Archivo a modificar:** `BACKEND/src/audit/audit.service.ts`

### 2.1 — Estrategia de fusión

El método `findAll()` actual solo consulta `cex_auditoria_accesos`. Se reemplaza con una consulta que obtiene **ambas fuentes en paralelo** con `Promise.all`, las mapea a un shape común, las combina en un array y las ordena por `fechaHora` descendente.

### 2.2 — Shape del objeto de respuesta unificado

Cada entrada del array resultante tendrá la siguiente estructura:

```typescript
{
  id: string,           // "acceso-123" o "vista-456" — prefijado para evitar colisiones de ID
  tipo: 'ACCESO' | 'VISUALIZACION',
  fechaHora: string,    // ISO string
  usuario: {
    nombreCompleto: string,
    email: string,
  },
  // Solo presente en tipo === 'VISUALIZACION':
  reporte?: {
    titulo: string,
  },
  duracion?: number,    // segundos, solo en tipo === 'VISUALIZACION'
}
```

### 2.3 — Lógica del servicio

```
// Consulta paralela de ambas fuentes
const [accesos, visualizaciones] = await Promise.all([
  prisma.auditAccess.findMany({
    select: { id, usuarioId, fechaHora, usuario: { nombreCompleto, email } }
  }),
  prisma.reportViewLog.findMany({
    select: { id, usuarioId, fechaHora, duracion, reporte: { titulo }, usuario: { nombreCompleto, email } }
  })
])

// Mapeo a shape unificado
const entriesAcceso = accesos.map(a => ({
  id: `acceso-${a.id}`,
  tipo: 'ACCESO',
  fechaHora: a.fechaHora,
  usuario: a.usuario,
}))

const entriesVista = visualizaciones.map(v => ({
  id: `vista-${v.id}`,
  tipo: 'VISUALIZACION',
  fechaHora: v.fechaHora,
  usuario: v.usuario,
  reporte: { titulo: v.reporte.titulo },
  duracion: v.duracion,
}))

// Fusión y ordenamiento cronológico descendente
return [...entriesAcceso, ...entriesVista]
  .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
```

> **Nota sobre rendimiento:** Para volúmenes pequeños a medianos (< 10,000 registros), ordenar en memoria es adecuado. Para producción a escala, se puede agregar paginación en el futuro.

---

## FASE 3 — Backend: Interfaz TypeScript del servicio (opcional pero recomendado)

**Archivo a modificar:** `BACKEND/src/audit/types/audit.types.ts`

Agregar la interfaz que tipifica la respuesta unificada devuelta por `findAll()`:

```typescript
export interface UnifiedAuditEntry {
  id: string;
  tipo: 'ACCESO' | 'VISUALIZACION';
  fechaHora: Date;
  usuario: {
    nombreCompleto: string;
    email: string;
  };
  reporte?: {
    titulo: string;
  };
  duracion?: number;
}
```

Esto permite que el compilador de TypeScript valide que el servicio devuelve el shape correcto.

---

## FASE 4 — Frontend: Actualizar `AuditEntry` en `audit.types.ts`

**Archivo a modificar:** `frontend/src/types/audit.types.ts`

Reemplazar la interfaz actual:

```typescript
// ANTES
export interface AuditEntry {
  id: number;
  usuarioId: number;
  fechaHora: string;
  userAgent: string | null;
  usuario: { nombreCompleto: string; email: string; };
}
```

Por la nueva interfaz unificada:

```typescript
// DESPUÉS
export interface AuditEntry {
  id: string;                              // "acceso-123" o "vista-456"
  tipo: 'ACCESO' | 'VISUALIZACION';
  fechaHora: string;
  usuario: {
    nombreCompleto: string;
    email: string;
  };
  reporte?: {                              // solo para tipo === 'VISUALIZACION'
    titulo: string;
  };
  duracion?: number;                       // segundos, solo para tipo === 'VISUALIZACION'
}
```

---

## FASE 5 — Frontend: `useAudit.ts` — sin cambios de lógica

**Archivo a verificar:** `frontend/src/hooks/useAudit.ts`

La lógica del hook (fetch a `GET /audit`, manejo de estado loading/error) **no cambia**. El tipo `AuditEntry[]` actualizado en la Fase 4 fluye automáticamente.

No se necesita ninguna modificación a este archivo.

---

## FASE 6 — Frontend: Reescribir `AuditTable.tsx` con columnas unificadas

**Archivo a modificar:** `frontend/src/components/admin/AuditTable.tsx`

### 6.1 — Nuevas columnas de la tabla

| Columna | Fuente | Notas |
|---|---|---|
| **Tipo** | `entry.tipo` | Badge visual: azul para "Acceso al sistema", verde para "Visualización de reporte" |
| **Usuario** | `entry.usuario.nombreCompleto` | |
| **Correo** | `entry.usuario.email` | |
| **Fecha / Hora** | `entry.fechaHora` | Mismo formato `dd/mm/yyyy HH:mm` |
| **Detalle** | `entry.reporte?.titulo` o `'—'` | Solo aplica a visualizaciones |
| **Duración** | `entry.duracion` formateado | Solo aplica a visualizaciones — se muestra como `2m 15s` |

### 6.2 — Función de formato de duración

```typescript
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
```

### 6.3 — Badges de tipo de evento

- **ACCESO:** badge gris/slate — texto "Acceso al sistema" — ícono `LogIn` (lucide-react)
- **VISUALIZACION:** badge azul — texto "Visualización de reporte" — ícono `Monitor` (lucide-react)

### 6.4 — Columna "Detalle + Duración" para visualizaciones

Para las filas de tipo `VISUALIZACION`, la columna Detalle muestra:
```
📊 Nombre del reporte
   Duración: 2m 15s
```

Para las filas de tipo `ACCESO`, la columna Detalle muestra `—`.

### 6.5 — Ajuste de `colSpan`

El skeleton de carga y el estado vacío deben actualizar su `colSpan` de 3 a **6** para abarcar las nuevas columnas.

---

## Resumen de Archivos Afectados

### Eliminar (Fase 1)
| Archivo | Acción |
|---|---|
| `LockerStudio/package.json` | ELIMINAR |
| `LockerStudio/package-lock.json` | ELIMINAR |

### Backend
| Archivo | Acción |
|---|---|
| `BACKEND/src/audit/audit.service.ts` | MODIFICAR — `findAll()` fusiona `AuditAccess` + `ReportViewLog` |
| `BACKEND/src/audit/types/audit.types.ts` | MODIFICAR — agregar interfaz `UnifiedAuditEntry` |

### Frontend
| Archivo | Acción |
|---|---|
| `frontend/src/types/audit.types.ts` | MODIFICAR — nuevo shape de `AuditEntry` |
| `frontend/src/components/admin/AuditTable.tsx` | REESCRIBIR — 6 columnas, badges de tipo, formato de duración |
| `frontend/src/hooks/useAudit.ts` | SIN CAMBIOS |
| `frontend/src/hooks/useReportTracking.ts` | SIN CAMBIOS (ya existe y es correcto) |

---

## Verificación Post-Ejecución

Después de ejecutar las fases:

1. **Fase 1 verificada si:** El servidor `npm run dev` arranca sin el warning de múltiples lockfiles y sin el error `Module not found`.
2. **Fases 2–6 verificadas si:** La tabla de auditoría muestra filas de dos colores/badges — gris para accesos y azul para visualizaciones — y las visualizaciones muestran el nombre del reporte y la duración en el formato `Xm Ys`.

---

*Plan generado el 2026-03-30. Pendiente de aprobación antes de ejecutar.*
