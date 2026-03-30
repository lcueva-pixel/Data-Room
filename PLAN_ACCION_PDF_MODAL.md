# Plan de Acción — Modal Visor PDF Simulado (Overview Cards)

> **Estado:** Pendiente de aprobación
> **Versión:** 1.0
> **Alcance:** `frontend/src/` — Solo planificación. Ningún archivo se toca hasta recibir luz verde.

---

## Estado de la Arquitectura Actual

| Archivo | Estado | Relevancia |
|---------|--------|------------|
| `src/app/dashboard/overview/page.tsx` | ✅ Funciona — ya es `'use client'` | ⚠️ Se modifica: agregar estados + integrar modal |
| `src/components/overview/OverviewCard.tsx` | ✅ Funciona — sin interactividad | ⚠️ Se modifica: agregar prop `onClick` |
| `src/components/overview/PDFViewerModal.tsx` | ❌ No existe | CREAR |

---

## Diagnóstico de Brechas

| # | Requerimiento | Brecha actual | Archivos afectados |
|---|---------------|---------------|--------------------|
| 1 | Estado `isModalOpen` + `selectedDocument` | `overview/page.tsx` no tiene estado para el modal | `overview/page.tsx` |
| 2 | Componente `PDFViewerModal` | No existe | Nuevo archivo |
| 3 | `OverviewCard` con `onClick` | El componente no recibe ni llama `onClick` | `OverviewCard.tsx` |
| 4 | Array `OVERVIEW_CARDS` tipado | Sin campo `id` — necesario para tipado | `overview/page.tsx` |

---

## Decisiones Arquitecturales

### A — Ubicación del estado

El estado `isModalOpen` y `selectedDocument` vivirá en `overview/page.tsx` (el componente padre), siguiendo el patrón de "estado elevado" (_lifting state up_). La página pasa los handlers a las tarjetas como prop `onClick`.

> **Razón:** `overview/page.tsx` ya es `'use client'`, por lo que no requiere ningún cambio de directiva. El modal también se renderiza desde la página, lo que evita problemas de z-index al estar al mismo nivel DOM que el resto del layout.

### B — Tipo `SelectedDocument`

```typescript
interface SelectedDocument {
  title: string;
}
```

Solo se necesita el título por ahora (para mostrarlo en la toolbar del modal). El array `OVERVIEW_CARDS` ya tiene `title` en cada entrada, sin necesidad de agregar un `id`.

### C — `OverviewCard` permanece sin estado propio

`OverviewCard.tsx` recibe un prop `onClick: () => void` adicional. El componente no administra estado internamente — solo delega el evento al padre.

> **Razón:** mantener el componente lo más "tonto" posible (sin lógica de negocio propia).

### D — Bloqueo de scroll del fondo

Cuando el modal se abre, se bloquea el scroll del `<body>` con un `useEffect` dentro del propio `PDFViewerModal`:
```typescript
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, []);
```

### E — Cierre del modal

El modal se puede cerrar de tres formas:
1. Botón `X` de la toolbar → llama `onClose()`
2. Clic en el overlay oscuro (fuera del panel) → llama `onClose()`
3. Tecla `Escape` → `useEffect` con `addEventListener('keydown', ...)` dentro del modal

---

## Estructura Objetivo de Archivos

```
frontend/src/
├── components/
│   └── overview/
│       ├── OverviewCard.tsx          ← MODIFICAR: agregar prop onClick
│       └── PDFViewerModal.tsx        ← CREAR
│
└── app/
    └── dashboard/
        └── overview/
            └── page.tsx              ← MODIFICAR: estados + modal integrado
```

**Archivos creados:** 1 (`PDFViewerModal.tsx`)
**Archivos modificados:** 2 (`OverviewCard.tsx`, `overview/page.tsx`)
**Sin nuevas dependencias**

---

## Fase 1 — Manejo de Estado en `overview/page.tsx`

**Objetivo:** Agregar los dos estados necesarios e importar el modal.

### Paso 1.1 — Nuevo tipo `SelectedDocument`

Se define localmente en la página (no justifica un archivo de tipos separado por ser tan simple):

```typescript
interface SelectedDocument {
  title: string;
}
```

### Paso 1.2 — Nuevos estados con `useState`

```typescript
// AGREGAR al cuerpo del componente OverviewPage:
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);
```

`useState` ya está importado en la página. No requiere cambio de imports.

### Paso 1.3 — Handler `handleCardClick`

```typescript
const handleCardClick = (title: string) => {
  setSelectedDocument({ title });
  setIsModalOpen(true);
};
```

### Paso 1.4 — Handler `handleCloseModal`

```typescript
const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedDocument(null);
};
```

### Paso 1.5 — Pasar `onClick` al mapeo de tarjetas

```typescript
// ANTES:
<OverviewCard
  key={card.title}
  title={card.title}
  description={card.description}
  icon={card.icon}
/>

// DESPUÉS:
<OverviewCard
  key={card.title}
  title={card.title}
  description={card.description}
  icon={card.icon}
  onClick={() => handleCardClick(card.title)}
/>
```

### Paso 1.6 — Renderizar el modal condicionalmente

Al final del JSX de la página, dentro del `<div>` raíz, justo antes del cierre:

```typescript
{isModalOpen && selectedDocument && (
  <PDFViewerModal
    title={selectedDocument.title}
    onClose={handleCloseModal}
  />
)}
```

---

## Fase 2 — Componente `PDFViewerModal.tsx`

**Objetivo:** Crear el visor de PDF simulado completo.

**Archivo:** `src/components/overview/PDFViewerModal.tsx`

### Paso 2.1 — Props del componente

```typescript
interface PDFViewerModalProps {
  title: string;
  onClose: () => void;
}
```

### Paso 2.2 — Efectos (scroll lock + tecla Escape)

```typescript
useEffect(() => {
  // Bloquear scroll del fondo
  document.body.style.overflow = 'hidden';

  // Cerrar con Escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleKeyDown);

  return () => {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [onClose]);
```

### Paso 2.3 — Diseño visual completo

```
┌──────────────────────────────────────────────────────────────┐
│  [overlay negro semi-transparente — clic cierra modal]       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TOOLBAR (bg-zinc-800, h-12)                         │   │
│  │  [📄 Investment Memo]  [◀ 1 / 5 ▶]  [⬇ 🖨 ✕]       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  ÁREA DE LECTURA (bg-zinc-200, overflow-y-auto)      │   │
│  │                                                      │   │
│  │    ┌────────────────────────────────────────────┐    │   │
│  │    │  HOJA DE PAPEL (bg-white, shadow-2xl)      │    │   │
│  │    │                                            │    │   │
│  │    │  INVESTMENT MEMO                           │    │   │
│  │    │  ─────────────────────────────────────     │    │   │
│  │    │                                            │    │   │
│  │    │  Executive Summary                         │    │   │
│  │    │  Lorem ipsum dolor sit amet...             │    │   │
│  │    │                                            │    │   │
│  │    │  Financial Overview                        │    │   │
│  │    │  Lorem ipsum dolor sit amet...             │    │   │
│  │    │  ████████████████ (skeleton line)          │    │   │
│  │    │  ████████████ (skeleton line corta)        │    │   │
│  │    │                                            │    │   │
│  │    │  Key Considerations                        │    │   │
│  │    │  Lorem ipsum dolor sit amet...             │    │   │
│  │    │                                            │    │   │
│  │    └────────────────────────────────────────────┘    │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Paso 2.4 — Especificación de estilos Tailwind por sección

| Sección | Clases Tailwind |
|---------|-----------------|
| **Overlay** | `fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4` |
| **Panel modal** | `flex flex-col w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl` |
| **Toolbar** | `bg-zinc-800 flex items-center justify-between px-4 h-12 flex-shrink-0` |
| Toolbar — título (izq) | `flex items-center gap-2 text-white text-sm font-medium truncate` |
| Toolbar — paginación (centro) | `flex items-center gap-2 text-zinc-300 text-sm` |
| Toolbar — acciones (der) | `flex items-center gap-2` |
| Toolbar — botones icono | `p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors` |
| Toolbar — botón X | `p-1.5 text-zinc-400 hover:text-white hover:bg-red-600 rounded transition-colors` |
| **Área de lectura** | `bg-zinc-200 flex-1 overflow-y-auto p-8 flex justify-center` |
| **Hoja de papel** | `bg-white w-full max-w-2xl shadow-2xl rounded-sm p-12 min-h-[700px]` |

### Paso 2.5 — Contenido simulado dentro de la hoja

Estructurado como reporte formal con texto y skeleton loaders mixtos:

```
TÍTULO DEL DOCUMENTO (h2 bold, text-2xl, uppercase, mb-6)
───────────────────────────────────────── (hr border-slate-200)

Executive Summary (h3 semibold, text-lg, mt-6 mb-2)
[párrafo Lorem ipsum 3 líneas, text-sm text-slate-600 leading-relaxed text-justify]

Financial Overview (h3 semibold, text-lg, mt-6 mb-2)
[párrafo Lorem ipsum 2 líneas]
[skeleton line: h-3 bg-slate-200 rounded animate-pulse w-full mt-3]
[skeleton line: h-3 bg-slate-200 rounded animate-pulse w-4/5 mt-2]
[skeleton line: h-3 bg-slate-200 rounded animate-pulse w-full mt-2]

Key Considerations (h3 semibold, text-lg, mt-6 mb-2)
[párrafo Lorem ipsum 2 líneas]
[skeleton line: h-3 bg-slate-200 rounded animate-pulse w-full mt-3]
[skeleton line: h-3 bg-slate-200 rounded animate-pulse w-3/4 mt-2]

Conclusions (h3 semibold, text-lg, mt-6 mb-2)
[párrafo Lorem ipsum 2 líneas]
```

> **Por qué mezclar texto + skeletons:** Muestra que parte del contenido está "cargado" y parte aún se está procesando, dándole realismo al simulador sin sobrecargar la UI.

### Paso 2.6 — Iconos de la toolbar (todos de `lucide-react`)

| Posición | Icono | Propósito |
|----------|-------|-----------|
| Título izquierda | `FileText` | Icono del documento |
| Paginación | `ChevronLeft`, `ChevronRight` | Navegar páginas (decorativo) |
| Acción 1 | `Download` | Simular descarga |
| Acción 2 | `Printer` | Simular impresión |
| Cerrar | `X` | Cerrar modal |

### Paso 2.7 — Prevenir cierre al clic dentro del panel

El overlay cierra el modal con `onClick`. El panel interior necesita `e.stopPropagation()`:

```typescript
<div
  className="fixed inset-0 bg-black/60 z-50 ..."
  onClick={onClose}          // ← clic en overlay cierra
>
  <div
    className="flex flex-col w-full ..."
    onClick={(e) => e.stopPropagation()}  // ← clic interior NO cierra
  >
    {/* contenido del modal */}
  </div>
</div>
```

---

## Fase 3 — Modificar `OverviewCard.tsx`

**Objetivo:** Agregar el prop `onClick` para que la tarjeta sea clicable.

### Paso 3.1 — Actualizar la interfaz de props

```typescript
// ANTES:
interface OverviewCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

// DESPUÉS:
interface OverviewCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}
```

### Paso 3.2 — Conectar `onClick` al contenedor

```typescript
// ANTES:
<div className="bg-white rounded-xl ... cursor-pointer">

// DESPUÉS:
<div
  className="bg-white rounded-xl ... cursor-pointer"
  onClick={onClick}
>
```

> **Nota:** No se necesita `'use client'` en `OverviewCard.tsx` porque el `onClick` solo pasa como prop y Next.js lo maneja correctamente cuando el padre es Client Component.

---

## Resumen de Cambios

| Archivo | Acción | Cambios concretos |
|---------|--------|-------------------|
| `src/components/overview/OverviewCard.tsx` | MODIFICAR | Agregar prop `onClick: () => void` + conectarlo al `<div>` raíz |
| `src/components/overview/PDFViewerModal.tsx` | CREAR | Componente completo: overlay, toolbar, área de lectura, hoja simulada |
| `src/app/dashboard/overview/page.tsx` | MODIFICAR | Agregar tipo `SelectedDocument`, 2 estados, 2 handlers, prop `onClick` en `OverviewCard`, renderizado condicional del modal |

**Total:** 1 archivo nuevo · 2 modificaciones · 0 dependencias nuevas · 0 eliminaciones

---

## Flujo de Interacción Completo

```
Usuario ve la página Overview
    │
    ├─→ Hace clic en "Investment Memo"
    │       └─→ handleCardClick('Investment Memo')
    │               └─→ setSelectedDocument({ title: 'Investment Memo' })
    │               └─→ setIsModalOpen(true)
    │                       └─→ <PDFViewerModal title="Investment Memo" onClose={...} />
    │                               └─→ document.body.overflow = 'hidden'
    │                               └─→ keydown listener (Escape)
    │
    └─→ Para cerrar el modal:
            ├─→ Clic en botón X         → onClose()
            ├─→ Clic en overlay oscuro  → onClose()
            └─→ Tecla Escape            → onClose()
                    └─→ setIsModalOpen(false)
                    └─→ setSelectedDocument(null)
                    └─→ document.body.overflow = '' (cleanup del useEffect)
```
