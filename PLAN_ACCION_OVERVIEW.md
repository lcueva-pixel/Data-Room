# Plan de Acción — Vista Overview (Portal Construex)

> **Estado:** Pendiente de aprobación
> **Versión:** 1.0
> **Alcance:** `frontend/src/` — Solo planificación. Ningún archivo se toca hasta recibir luz verde.

---

## Estado de la Arquitectura Actual

| Archivo | Estado | Relevancia |
|---------|--------|------------|
| `src/components/dashboard/Sidebar.tsx` | ✅ Funciona | ⚠️ Se modifica — agregar botón Overview |
| `src/app/dashboard/page.tsx` | ✅ Funciona | ✅ Sin cambios |
| `src/app/dashboard/layout.tsx` | ✅ Funciona (solo AuthProvider) | ✅ Sin cambios |
| `src/app/dashboard/admin/layout.tsx` | ✅ Funciona (shell completo) | ✅ Sin cambios |
| `src/components/dashboard/TopBar.tsx` | ✅ Funciona | ✅ Sin cambios |

---

## Diagnóstico de Brechas

| # | Requerimiento | Brecha actual | Archivos afectados |
|---|---------------|---------------|--------------------|
| 1 | Botón "Overview" en sidebar | Sidebar no tiene ítem estático en la cabecera de la nav | `Sidebar.tsx` |
| 2 | Ruta `/dashboard/overview` | No existe página ni ruta | Nuevo `overview/page.tsx` |
| 3 | Componente `OverviewCard` reutilizable | No existe | Nuevo archivo |
| 4 | Datos estáticos para las 9 tarjetas | No existen | Definidos en la propia página o en `src/data/` |

---

## Decisiones Arquitecturales

### A — Ruta elegida: `/dashboard/overview`

Se crea como ruta **hija del dashboard** (`src/app/dashboard/overview/page.tsx`). Esto es coherente con la estructura actual del proyecto donde:
- `/dashboard` → visor de reportes
- `/dashboard/admin/*` → panel de administración
- `/dashboard/overview` → vista de bienvenida/resumen

### B — Shell de la página Overview

La página Overview necesita Sidebar + TopBar. Actualmente `dashboard/layout.tsx` no provee el shell (solo inyecta `AuthProvider`). El patrón ya establecido en el proyecto es que cada página incluya su propio Sidebar + TopBar cuando los necesita (como `dashboard/page.tsx`).

> **Decisión:** La página Overview incluirá su propio Sidebar + TopBar directamente, siguiendo exactamente el patrón de `dashboard/page.tsx`. No se requiere crear un layout compartido para este alcance.

### C — Botón Overview en el Sidebar

El botón Overview será un `<Link href="/dashboard/overview">` (no un `<button>`) colocado **encima de la etiqueta "REPORTES"** y de los botones dinámicos. Su estado activo se detecta con `pathname === '/dashboard/overview'`.

### D — Datos de las tarjetas: array estático

Las tarjetas se alimentan de un array de objetos definido dentro del propio `overview/page.tsx` (sin llamada al backend). Esto se puede migrar a API en el futuro.

---

## Estructura Objetivo de Archivos

```
frontend/src/
├── components/
│   ├── dashboard/
│   │   └── Sidebar.tsx              ← MODIFICAR: agregar botón Overview
│   └── overview/
│       └── OverviewCard.tsx         ← NUEVO: tarjeta reutilizable
│
└── app/
    └── dashboard/
        └── overview/
            └── page.tsx             ← NUEVO: página Overview completa
```

**Archivos creados:** 2 (`OverviewCard.tsx`, `overview/page.tsx`)
**Archivos modificados:** 1 (`Sidebar.tsx`)

---

## Fase 1 — Modificar el Sidebar

**Objetivo:** Agregar el botón estático "Overview" al inicio de la navegación, por encima de la sección "REPORTES".

### Paso 1.1 — Diseño del botón Overview en el Sidebar

```
┌──────────────────────────┐
│  CONSTRUEX logo          │
│ ──────────────────       │
│                          │
│  □ Overview         ← NUEVO (Link a /dashboard/overview)
│                          │
│  REPORTES                │  ← etiqueta existente
│  □ [Reporte 1]           │
│  □ [Reporte 2]           │
│  ...                     │
│                          │
│  ADMINISTRACIÓN (admin)  │
│  □ Gestión de Reportes   │
│  □ Auditoría             │
│  □ Usuarios              │
│                          │
│  ⚙ Configuración         │
│  ⬅ Cerrar sesión         │
└──────────────────────────┘
```

**Cambios planificados en `Sidebar.tsx`:**

```typescript
// ANTES: la nav arranca directamente con la etiqueta "REPORTES"
<nav ...>
  <p className="...">Reportes</p>
  {/* botones dinámicos */}

// DESPUÉS: se agrega el Link Overview antes de la etiqueta
<nav ...>
  <Link
    href="/dashboard/overview"
    className={clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-3',
      pathname === '/dashboard/overview'
        ? 'bg-white/15 text-white font-semibold'
        : 'text-blue-200 hover:bg-white/10 hover:text-white',
    )}
  >
    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
    <span>Overview</span>
  </Link>

  <p className="...">Reportes</p>
  {/* botones dinámicos */}
```

**Icono planificado:** `LayoutDashboard` (ya disponible en `lucide-react`, sin dependencia nueva).

**Impacto:** Solo se agrega el bloque del Link Overview. Todo lo demás del Sidebar queda intacto.

---

## Fase 2 — Componente `OverviewCard`

**Objetivo:** Crear la tarjeta reutilizable que se repite en el grid de 9 módulos.

**Archivo:** `src/components/overview/OverviewCard.tsx`

### Paso 2.1 — Props del componente

```typescript
interface OverviewCardProps {
  title: string;
  description: string;
  icon: LucideIcon;  // Icono de lucide-react pasado como prop
}
```

### Paso 2.2 — Diseño visual planificado

```
┌─────────────────────────────────────┐
│                                [🔗] │  ← icono alineado a la derecha
│                                     │
│  Investment Memo                    │  ← título (font-semibold, slate-800)
│  Lorem ipsum dolor sit amet...      │  ← descripción (text-sm, slate-500)
│                                     │
└─────────────────────────────────────┘
```

**Estilos Tailwind planificados:**
- Contenedor: `bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer`
- Título: `text-base font-semibold text-slate-800 mt-3`
- Descripción: `text-sm text-slate-500 mt-1`
- Icono: `w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center`

---

## Fase 3 — Página `dashboard/overview/page.tsx`

**Objetivo:** Construir la vista Overview completa con todas sus secciones.

### Paso 3.1 — Estructura general de la página

La página sigue el mismo patrón de shell que `dashboard/page.tsx`:

```typescript
export default function OverviewPage() {
  // Mismos hooks/estado que dashboard/page.tsx para montar el shell
  const { logout } = useAuth();
  const { reports, isLoading } = useReports();
  const rolId = getRolId();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar ... />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar activeTitle="Overview" rolId={rolId} onLogout={logout} />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Contenido de la Overview */}
        </main>
      </div>
    </div>
  );
}
```

> **Nota:** `selectedReport` es siempre `null` en esta página. En el Sidebar, `onReportSelect` navegará a `/dashboard` (igual que en `admin/layout.tsx`), donde el reporte se auto-selecciona.

### Paso 3.2 — Sección 1: Breadcrumb/Header de página

Ubicado en la parte superior del `<main>`, antes del contenedor de bienvenida:

```
Portal Construex  >  Overview
```

**Planificación:**
```typescript
<div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
  <span>Portal Construex</span>
  <ChevronRight className="w-4 h-4" />
  <span className="text-slate-800 font-medium">Overview</span>
</div>
```

### Paso 3.3 — Sección 2: Contenedor de Bienvenida

Estructura visual planificada:

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome to the Construex Portal                            │
│                                                             │
│  Lorem ipsum dolor sit amet, consectetur adipiscing elit.  │
│  Sed do eiusmod tempor incididunt ut labore et dolore magna │
│  aliqua.                                                    │
│                                                             │
│  ┌─ ⚠️  Strictly Confidential ──────────────────────────┐  │
│  │  Lorem ipsum dolor sit amet, consectetur adipiscing. │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ 🛡️  Important Notice ──────────────────────────────┐  │
│  │  Lorem ipsum dolor sit amet, consectetur adipiscing. │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Estilos Tailwind planificados:**

| Elemento | Clases Tailwind |
|----------|-----------------|
| Contenedor principal | `bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6` |
| Título "Welcome to..." | `text-3xl font-bold text-slate-800 mb-3` |
| Párrafo de descripción | `text-slate-500 text-base leading-relaxed mb-6` |
| Alerta amarilla (contenedor) | `bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3` |
| Alerta amarilla (título) | `font-semibold text-amber-800 flex items-center gap-2 mb-1` |
| Alerta amarilla (texto) | `text-amber-700 text-sm` |
| Alerta amarilla (icono) | `AlertTriangle` de lucide-react, `w-4 h-4` |
| Alerta roja (contenedor) | `bg-red-50 border border-red-200 rounded-xl p-4` |
| Alerta roja (título) | `font-semibold text-red-800 flex items-center gap-2 mb-1` |
| Alerta roja (texto) | `text-red-700 text-sm` |
| Alerta roja (icono) | `ShieldAlert` de lucide-react, `w-4 h-4` |

### Paso 3.4 — Sección 3: Grid de Tarjetas (9 módulos)

**Grid CSS planificado:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {OVERVIEW_CARDS.map((card) => (
    <OverviewCard key={card.title} {...card} />
  ))}
</div>
```

**Array de datos estático planificado** (9 tarjetas):

```typescript
import {
  FileText, DollarSign, BarChart2, Users,
  TrendingUp, Briefcase, PieChart, ShieldCheck, Globe
} from 'lucide-react';

const OVERVIEW_CARDS = [
  { title: 'Investment Memo',    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: FileText    },
  { title: 'Financial Records',  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: DollarSign  },
  { title: 'Operational Reports',description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: BarChart2   },
  { title: 'HR Dashboard',       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: Users       },
  { title: 'Sales Analytics',    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: TrendingUp  },
  { title: 'Project Status',     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: Briefcase   },
  { title: 'Budget Overview',    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: PieChart    },
  { title: 'Compliance Reports', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: ShieldCheck },
  { title: 'Market Analysis',    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.', icon: Globe       },
];
```

---

## Resumen de Archivos Afectados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/dashboard/Sidebar.tsx` | MODIFICAR | Agregar `<Link>` Overview con icono `LayoutDashboard` antes de la sección "REPORTES" |
| `src/components/overview/OverviewCard.tsx` | CREAR | Tarjeta reutilizable con `title`, `description`, `icon` |
| `src/app/dashboard/overview/page.tsx` | CREAR | Página completa con shell, breadcrumb, welcome container, alertas y grid de 9 tarjetas |

**Total:** 2 archivos nuevos · 1 modificación · 0 eliminaciones · 0 dependencias nuevas

---

## Diagrama de Flujo de Navegación

```
Login
  └─→ /dashboard              (auto-selecciona primer reporte → ReportViewer)
        │
        ├─→ click "Overview"  → /dashboard/overview  (esta nueva página)
        │
        ├─→ click [Reporte N] → setSelectedReport()  (reemplaza iframe)
        │
        └─→ /dashboard/admin/* (solo rol_id=1)
```

Desde Overview, si el usuario hace clic en un reporte del sidebar → navega a `/dashboard` y el `useEffect` auto-selecciona el primer reporte. Para seleccionar un reporte específico desde Overview, el usuario primero va a `/dashboard` y luego lo elige.

---

## Notas Finales

- **Sin nuevas dependencias:** Todos los iconos necesarios (`LayoutDashboard`, `AlertTriangle`, `ShieldAlert`, etc.) ya están disponibles en `lucide-react` que está instalado.
- **Sin cambios de rutas protegidas:** `/dashboard/overview` queda cubierto automáticamente por el matcher existente en `proxy.ts` (`/dashboard/:path*`). Un usuario sin token es redirigido al login.
- **Escalabilidad de las tarjetas:** En el futuro el array `OVERVIEW_CARDS` puede migrar a un endpoint del backend sin cambiar el componente `OverviewCard`.
