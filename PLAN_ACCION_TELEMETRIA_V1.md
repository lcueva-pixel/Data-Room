# PLAN DE ACCIÓN — Telemetría de Tiempo de Visualización de Reportes
**Proyecto:** LockerStudio
**Fecha:** 2026-03-30
**Estado:** PENDIENTE DE APROBACIÓN

---

## Contexto del Estado Actual

| Elemento | Estado Actual |
|---|---|
| `schema.prisma` | Tiene `AuditAccess` (accesos) y `LogActivity` (actividades genéricas). Ninguna tabla registra tiempo de visualización de reportes. |
| `ReportViewer.tsx` | Renderiza el iframe. Recibe `titulo` y `urlIframe`. **No recibe `reportId`** — esto debe corregirse. |
| `dashboard/page.tsx` | Pasa `selectedReport.titulo` y `selectedReport.urlIframe` al `ReportViewer`, pero no `selectedReport.id`. |
| `AuditController` | Usa `@UseGuards(JwtAuthGuard, AdminGuard)` a nivel de controlador — usuarios normales no pueden llamar a ningún endpoint de auditoría. |
| `PrismaService` | Patrón de composición con getters explícitos. Cada nuevo modelo requiere agregar un getter. |

---

## Decisiones de Diseño

### ¿Nuevo modelo o reutilizar `LogActivity`?

Se crea un **modelo dedicado** `ReportViewLog` en lugar de reutilizar `LogActivity`.

**Razón:** `LogActivity.detalle` es `String?` — almacenar la duración como texto pierde el tipo, impide queries analíticas (`SUM`, `AVG`, `ORDER BY`) y mezcla semánticas distintas. Una tabla dedicada con `duracion Int` permite queries como "top reportes por tiempo promedio" o "ranking de usuarios más activos" en el futuro.

### ¿Cómo garantizar el envío al cerrar la pestaña/navegador?

Se usa `fetch` con `keepalive: true` (no `sendBeacon`).

**Razón:** `Navigator.sendBeacon` no soporta cabeceras personalizadas (`Authorization`). Aunque el proyecto usa cookies para JWT (que sí viajan con `sendBeacon`), `fetch` con `keepalive: true` es más flexible, soporta JSON nativo y es la estrategia moderna recomendada para este caso. El comportamiento garantizado es idéntico: el navegador completa la petición HTTP incluso si la página ya se ha desmontado.

### ¿Duración mínima a registrar?

Se ignoran visualizaciones menores a **3 segundos** para evitar ruido (clicks accidentales, navegación rápida entre reportes).

---

## Resumen de Fases

| Fase | Área | Descripción |
|---|---|---|
| 1 | Backend — Prisma | Agregar modelo `ReportViewLog` al schema |
| 2 | Backend — Prisma | Ejecutar `prisma db push` para sincronizar la BD |
| 3 | Backend — Prisma | Agregar getter `reportViewLog` al `PrismaService` |
| 4 | Backend — DTO | Crear `create-report-view.dto.ts` |
| 5 | Backend — Service | Agregar `registerReportView()` al `AuditService` |
| 6 | Backend — Controller | Agregar `POST /audit/report-time` sin `AdminGuard` |
| 7 | Frontend — Types | Actualizar `ReportViewerProps` para recibir `reportId` |
| 8 | Frontend — Page | Pasar `selectedReport.id` al `ReportViewer` |
| 9 | Frontend — Hook | Crear `useReportTracking` con lógica de tiempo |
| 10 | Frontend — Component | Integrar hook en `ReportViewer` |

---

## FASE 1 — Backend: Nuevo modelo `ReportViewLog` en `schema.prisma`

**Archivo a modificar:** `BACKEND/prisma/schema.prisma`

### 1.1 — Agregar modelo

```prisma
model ReportViewLog {
  id        Int      @id @default(autoincrement())
  usuarioId Int      @map("usuario_id")
  reporteId Int      @map("reporte_id")
  duracion  Int      @map("duracion_segundos")   // duración en segundos enteros
  fechaHora DateTime @default(now()) @map("fecha_hora") @db.Timestamptz

  usuario User   @relation(fields: [usuarioId], references: [id])
  reporte Report @relation(fields: [reporteId], references: [id])

  @@map("cex_log_visualizaciones")
}
```

### 1.2 — Actualizar modelos relacionados

**`User`** — agregar relación inversa:
```prisma
reportViewLogs ReportViewLog[]
```

**`Report`** — agregar relación inversa:
```prisma
reportViewLogs ReportViewLog[]
```

---

## FASE 2 — Backend: Migración de Base de Datos

**Comando a ejecutar** (desde `BACKEND/`):

```bash
npx prisma db push
```

Este comando:
1. Crea la tabla `cex_log_visualizaciones` con las columnas definidas
2. Agrega las FKs hacia `cex_usuarios` y `cex_reportes`
3. Regenera automáticamente el cliente Prisma en `src/generated/prisma`

> **Nota:** No se usa `migrate dev` porque el proyecto no tiene historial de migraciones — el workflow establecido es `db push`.

---

## FASE 3 — Backend: Getter en `PrismaService`

**Archivo a modificar:** `BACKEND/src/prisma/prisma.service.ts`

Agregar el getter para el nuevo modelo (patrón de composición ya establecido en el proyecto):

```typescript
get reportViewLog() {
  return this.client.reportViewLog;
}
```

---

## FASE 4 — Backend: DTO `CreateReportViewDto`

**Archivo a crear:** `BACKEND/src/audit/dto/create-report-view.dto.ts`

```typescript
export class CreateReportViewDto {
  @IsInt()
  @Min(1)
  reporteId: number;

  @IsInt()
  @Min(1)             // mínimo 1 segundo — el filtro de 3s se aplica en el frontend
  duracion: number;
}
```

**Decoradores a usar:** `@IsInt()`, `@Min()` de `class-validator`, `@Type(() => Number)` de `class-transformer`.

---

## FASE 5 — Backend: Método `registerReportView` en `AuditService`

**Archivo a modificar:** `BACKEND/src/audit/audit.service.ts`

### 5.1 — Importar el DTO

```typescript
import { CreateReportViewDto } from './dto/create-report-view.dto';
```

### 5.2 — Nuevo método

```typescript
async registerReportView(usuarioId: number, dto: CreateReportViewDto) {
  // Verificar que el reporte existe antes de guardar
  await this.prisma.report.findUniqueOrThrow({ where: { id: dto.reporteId } });

  return this.prisma.reportViewLog.create({
    data: {
      usuarioId,
      reporteId: dto.reporteId,
      duracion: dto.duracion,
    },
  });
}
```

**Comportamiento de `findUniqueOrThrow`:** Si el reporte no existe, Prisma lanza `PrismaClientKnownRequestError` con código `P2025`, que NestJS convierte automáticamente en una respuesta 500. Para devolver un 404 semántico, el controlador puede capturarlo con un `try/catch` y lanzar `NotFoundException`.

---

## FASE 6 — Backend: Endpoint `POST /audit/report-time` en `AuditController`

**Archivo a modificar:** `BACKEND/src/audit/audit.controller.ts`

### 6.1 — Problema con el guard actual

Actualmente `@UseGuards(JwtAuthGuard, AdminGuard)` está a nivel de **clase** — todos los endpoints del controlador requieren rol de Administrador. El nuevo endpoint debe ser accesible por **cualquier usuario autenticado** (usuarios normales también visualizan reportes).

**Solución:** Mover los guards al nivel de **método** en lugar del controlador.

### 6.2 — Estructura del controlador actualizado

```typescript
@Controller('audit')
@UseGuards(JwtAuthGuard)               // JWT requerido para TODOS los endpoints
export class AuditController {

  @Get()
  @UseGuards(AdminGuard)               // Solo admin puede ver el listado
  findAll() {
    return this.auditService.findAll();
  }

  @Post('report-time')
  // Sin AdminGuard: cualquier usuario autenticado puede registrar su tiempo
  async registerReportTime(
    @Req() req: any,
    @Body() dto: CreateReportViewDto,
  ) {
    try {
      await this.auditService.registerReportView(req.user.sub, dto);
      return { ok: true };
    } catch {
      throw new NotFoundException('Reporte no encontrado');
    }
  }
}
```

**`req.user.sub`:** El payload del JWT contiene `{ sub: userId, rol_id: rolId }` — `sub` es el ID del usuario autenticado.

**Imports adicionales:** `Post`, `Body`, `Req`, `NotFoundException` de `@nestjs/common`.

---

## FASE 7 — Frontend: Actualizar `ReportViewerProps`

**Archivo a modificar:** `frontend/src/components/dashboard/ReportViewer.tsx`

La interfaz de props debe incluir `reportId`:

```typescript
interface ReportViewerProps {
  reportId: number;       // NUEVO — necesario para registrar el tiempo
  titulo: string;
  urlIframe: string;
}
```

---

## FASE 8 — Frontend: Pasar `selectedReport.id` desde `dashboard/page.tsx`

**Archivo a modificar:** `frontend/src/app/dashboard/page.tsx`

En el JSX donde se renderiza `<ReportViewer>`, agregar la nueva prop:

```tsx
<ReportViewer
  reportId={selectedReport.id}    // NUEVO
  titulo={selectedReport.titulo}
  urlIframe={selectedReport.urlIframe}
/>
```

> `selectedReport` es de tipo `Report` que ya tiene `id: number` — no requiere cambios en los tipos.

---

## FASE 9 — Frontend: Hook `useReportTracking`

**Archivo a crear:** `frontend/src/hooks/useReportTracking.ts`

Este es el núcleo de la funcionalidad. El hook encapsula toda la lógica de tiempo para mantener `ReportViewer` limpio.

### 9.1 — Firma del hook

```typescript
export function useReportTracking(reportId: number): void
```

No devuelve nada — es un efecto de "fire and forget".

### 9.2 — Lógica completa

```typescript
'use client';

import { useEffect, useRef } from 'react';

const MIN_DURATION_SECONDS = 3;

export function useReportTracking(reportId: number): void {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Reiniciar el timer cuando cambia el reporte
    startTimeRef.current = Date.now();

    const computeDuration = (): number =>
      Math.round((Date.now() - startTimeRef.current) / 1000);

    const sendDuration = (duration: number): void => {
      if (duration < MIN_DURATION_SECONDS) return;

      const payload = JSON.stringify({ reporteId: reportId, duracion: duration });

      // fetch con keepalive: true garantiza envío incluso durante page unload
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit/report-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        credentials: 'include',   // envía cookies (JWT httpOnly)
        keepalive: true,           // clave para el escenario de cierre de pestaña
      }).catch(() => {
        // Silenciar errores de red — la telemetría nunca debe romper la UI
      });
    };

    // Escenario B: cierre de pestaña o navegador
    const handleBeforeUnload = () => {
      sendDuration(computeDuration());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Escenario A: navegación dentro de la app (desmontaje del componente)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendDuration(computeDuration());
    };
  }, [reportId]);  // El efecto se re-ejecuta cuando cambia el reporte
}
```

### 9.3 — Análisis de los dos escenarios

| Escenario | Mecanismo | Por qué funciona |
|---|---|---|
| **A — Navegación interna** | Función `return` del `useEffect` (cleanup) | React llama al cleanup sincrónicamente al desmontar el componente o al re-ejecutar el efecto por cambio de `reportId`. La petición `fetch` normal se completa. |
| **B — Cierre de pestaña/navegador** | `beforeunload` + `fetch` con `keepalive: true` | El navegador pone en cola la petición antes de cerrar la página. `keepalive: true` le indica al browser que mantenga la conexión abierta para completar la request incluso sin documento activo. |

### 9.4 — ¿Por qué `useRef` para el `startTime`?

`useRef` persiste el valor entre renders **sin** causar re-renders ni crear closures problemáticas. Si se usara una variable local dentro del `useEffect`, el cleanup capturaría siempre el mismo valor inicial por closure. Con `useRef`, `startTimeRef.current` siempre apunta al valor más reciente.

### 9.5 — Manejo del cambio de reporte (caso especial)

Cuando el usuario cambia de reporte en el Sidebar:
1. `reportId` cambia → React ejecuta el **cleanup** del efecto anterior → envía la duración del reporte anterior
2. React ejecuta el **efecto** nuevamente con el nuevo `reportId` → `startTimeRef.current = Date.now()` → comienza a contar para el nuevo reporte

Este comportamiento es automático gracias al array de dependencias `[reportId]`.

### 9.6 — Variable de entorno

El hook usa `process.env.NEXT_PUBLIC_API_URL` para construir la URL del backend. Verificar que esta variable esté definida en `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Nota:** Si el proyecto ya usa un cliente axios centralizado (`@/lib/axios`) que maneja la base URL, se puede refactorizar para usarlo en lugar del `fetch` directo — pero solo para el **escenario A** (navegación interna). Para el **escenario B** se debe mantener el `fetch` nativo con `keepalive: true`, ya que axios no soporta la opción `keepalive`.

---

## FASE 10 — Frontend: Integrar el hook en `ReportViewer`

**Archivo a modificar:** `frontend/src/components/dashboard/ReportViewer.tsx`

### 10.1 — Importar y llamar el hook

```typescript
import { useReportTracking } from '@/hooks/useReportTracking';

export function ReportViewer({ reportId, titulo, urlIframe }: ReportViewerProps) {
  useReportTracking(reportId);   // ÚNICA línea nueva — encapsula toda la lógica

  const [isLoaded, setIsLoaded] = useState(false);

  // ... resto del componente sin cambios
}
```

El componente no necesita ningún otro cambio — toda la complejidad está encapsulada en el hook.

---

## Resumen de Archivos Afectados

### Backend

| Archivo | Acción |
|---|---|
| `prisma/schema.prisma` | MODIFICAR — agregar `ReportViewLog` + relaciones en `User` y `Report` |
| `src/prisma/prisma.service.ts` | MODIFICAR — agregar getter `reportViewLog` |
| `src/audit/dto/create-report-view.dto.ts` | CREAR |
| `src/audit/audit.service.ts` | MODIFICAR — agregar `registerReportView()` |
| `src/audit/audit.controller.ts` | MODIFICAR — mover guards a nivel de método, agregar `POST 'report-time'` |

### Frontend

| Archivo | Acción |
|---|---|
| `src/components/dashboard/ReportViewer.tsx` | MODIFICAR — agregar `reportId` a props + llamar `useReportTracking` |
| `src/app/dashboard/page.tsx` | MODIFICAR — pasar `selectedReport.id` al `ReportViewer` |
| `src/hooks/useReportTracking.ts` | CREAR |

**Total: 8 archivos** (3 nuevos, 5 modificados)

---

## Consideraciones y Riesgos

| Riesgo | Mitigación |
|---|---|
| El `prisma db push` puede fallar si hay conflictos de constraints | Verificar que `cex_log_visualizaciones` no exista ya en la BD antes de ejecutar |
| `fetch` con `keepalive` tiene un límite de cuerpo de 64KB por petición | El payload es ~50 bytes — sin riesgo |
| Si el usuario está desconectado (JWT expirado), el POST devolverá 401 | El hook hace `.catch(() => {})` — se pierde el registro silenciosamente, que es el comportamiento correcto para telemetría |
| El `beforeunload` puede ejecutarse cuando el cleanup ya se ejecutó (si el componente se desmontó antes) | El `removeEventListener` en el cleanup garantiza que no se envíe dos veces |
| Doble envío si el componente se desmonta Y el evento `beforeunload` dispara al mismo tiempo | El `removeEventListener` en el cleanup del efecto desregistra `handleBeforeUnload` antes de llamar `sendDuration` — evita el doble envío |
| `NEXT_PUBLIC_API_URL` no definida en producción | Verificar `.env.local` y `.env.production` antes del despliegue |

---

*Plan generado el 2026-03-30. Pendiente de aprobación antes de ejecutar.*
