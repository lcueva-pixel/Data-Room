# Modulo: Overview (Pagina de Bienvenida)

**Acceso:** Todos los usuarios autenticados  
**Ruta:** `/dashboard/overview`

---

## Archivos Involucrados

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| Overview Page | `src/app/dashboard/overview/page.tsx` | Pagina de bienvenida |
| OverviewCard | `src/components/overview/OverviewCard.tsx` | Tarjeta individual del grid |
| PDFViewerModal | `src/components/overview/PDFViewerModal.tsx` | Modal visor de documentos |

---

## Pagina de Overview

**Archivo:** `src/app/dashboard/overview/page.tsx` (183 lineas)

### Estructura Visual

```
+----------------------------------------------------------+
| TopBar: Overview                                          |
+----------+-----------------------------------------------+
| Sidebar  | Breadcrumb: Portal Construex > Overview        |
|          |                                                |
|          | +--------------------------------------------+ |
|          | | Welcome to the Construex Portal            | |
|          | | Descripcion...                             | |
|          | |                                            | |
|          | | [!] Strictly Confidential (alerta amarilla) | |
|          | | [!] Important Notice (alerta roja)          | |
|          | +--------------------------------------------+ |
|          |                                                |
|          | +----------+ +----------+ +----------+        |
|          | | Card 1   | | Card 2   | | Card 3   |        |
|          | +----------+ +----------+ +----------+        |
|          | +----------+ +----------+ +----------+        |
|          | | Card 4   | | Card 5   | Card 6   |         |
|          | +----------+ +----------+ +----------+        |
|          | +----------+ +----------+ +----------+        |
|          | | Card 7   | | Card 8   | | Card 9   |        |
|          | +----------+ +----------+ +----------+        |
+----------+-----------------------------------------------+
```

### Seccion de Bienvenida
- Titulo: "Welcome to the Construex Portal"
- Descripcion general del portal
- **Alerta amarilla (Strictly Confidential):** Aviso de confidencialidad con icono AlertTriangle
- **Alerta roja (Important Notice):** Aviso importante con icono ShieldAlert

### Grid de Tarjetas
9 tarjetas organizadas en grid responsive:
- 1 columna en mobile
- 2 columnas en tablet (`sm:`)
- 3 columnas en desktop (`lg:`)

### Tarjetas Disponibles

| Tarjeta | Icono | Descripcion |
|---------|-------|-------------|
| Investment Memo | FileText | Lorem ipsum... |
| Financial Records | DollarSign | Lorem ipsum... |
| Operational Reports | BarChart2 | Lorem ipsum... |
| HR Dashboard | Users | Lorem ipsum... |
| Sales Analytics | TrendingUp | Lorem ipsum... |
| Project Status | Briefcase | Lorem ipsum... |
| Budget Overview | PieChart | Lorem ipsum... |
| Compliance Reports | ShieldCheck | Lorem ipsum... |
| Market Analysis | Globe | Lorem ipsum... |

### Interaccion
Al hacer click en una tarjeta, se abre el `PDFViewerModal` con el titulo de la tarjeta.

---

## OverviewCard - Componente de Tarjeta

**Archivo:** `src/components/overview/OverviewCard.tsx` (28 lineas)

### Props
| Prop | Tipo | Descripcion |
|------|------|-------------|
| `title` | string | Titulo de la tarjeta |
| `description` | string | Descripcion breve |
| `icon` | LucideIcon | Icono de Lucide React |
| `onClick` | () => void | Handler de click |

### Estilo
- Fondo blanco con borde y sombra sutil
- Hover: sombra mas pronunciada
- Icono en badge azul (fondo azul-50, icono azul-600)
- Cursor pointer

---

## PDFViewerModal - Visor de Documentos

**Archivo:** `src/components/overview/PDFViewerModal.tsx` (157 lineas)

### Props
| Prop | Tipo | Descripcion |
|------|------|-------------|
| `title` | string | Titulo del documento |
| `onClose` | () => void | Handler de cierre |

### Estructura Visual

```
+------------------------------------------------+
| Toolbar                                         |
| [icon] Titulo    [<] 1/5 [>]    [Down] [Print] [X] |
+------------------------------------------------+
|                                                |
|          Simulated Document Page                |
|                                                |
|  TITULO DEL DOCUMENTO                          |
|  Construex — Internal Document                 |
|  ────────────────────────────                  |
|                                                |
|  Executive Summary                             |
|  Lorem ipsum dolor sit amet...                 |
|                                                |
|  Financial Overview                            |
|  Sunt in culpa qui officia...                  |
|  [████████████████] skeleton                   |
|                                                |
|  Key Considerations                            |
|  Nemo enim ipsam voluptatem...                 |
|  [████████████████] skeleton                   |
|                                                |
|  Conclusions                                   |
|  Neque porro quisquam est...                   |
|                                                |
+------------------------------------------------+
```

### Toolbar
| Elemento | Posicion | Funcionalidad |
|----------|----------|---------------|
| Icono + Titulo | Izquierda | Identifica el documento |
| Paginacion | Centro | Navegacion simulada "1 / 5" con flechas |
| Descargar | Derecha | Boton con icono Download |
| Imprimir | Derecha | Boton con icono Printer |
| Cerrar | Derecha | Boton X, cierra el modal |

### Contenido
El documento es una simulacion estatica con:
- Secciones de texto con encabezados (Executive Summary, Financial Overview, Key Considerations, Conclusions)
- Skeleton lines (barras grises animadas) simulando contenido aun no disponible
- Estilo de "hoja de papel" (fondo blanco con sombra sobre fondo gris)

### Interaccion
- **Escape:** Cierra el modal
- **Click fuera:** Cierra el modal (overlay)
- **Click dentro:** No cierra (stopPropagation)
- **Body scroll:** Bloqueado mientras el modal esta abierto

### Nota
Actualmente la paginacion, descarga e impresion son **elementos visuales sin funcionalidad real** (botones de UI sin handler). El contenido del documento es placeholder con Lorem Ipsum.
