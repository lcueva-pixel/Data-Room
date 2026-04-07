# Modulo: Dashboard y Visor de Reportes

---

## Archivos Involucrados

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| Dashboard Page | `src/app/dashboard/page.tsx` | Pagina principal con visor de reportes |
| Dashboard Layout | `src/app/dashboard/layout.tsx` | Layout con AuthProvider |
| Sidebar | `src/components/dashboard/Sidebar.tsx` | Navegacion lateral con arbol de reportes |
| TopBar | `src/components/dashboard/TopBar.tsx` | Barra superior con breadcrumbs y tema |
| ReportViewer | `src/components/dashboard/ReportViewer.tsx` | Iframe para visualizar reportes |
| useReports | `src/hooks/useReports.ts` | Hook de carga de reportes |
| useReportTracking | `src/hooks/useReportTracking.ts` | Tracking de tiempo de visualizacion |

---

## Estructura Visual del Dashboard

```
+----------------------------------------------------------+
|                        TopBar                             |
|  [Menu]  Dashboard > Reporte Activo    [Tema] [Rol] [Salir]
+----------+-----------------------------------------------+
|          |                                                |
| Sidebar  |              ReportViewer                      |
|          |                                                |
| [Overview]|   Titulo del Reporte    [Abrir en nueva tab]  |
|          |   +------------------------------------------+ |
| REPORTES |   |                                          | |
| > Rep 1  |   |         IFRAME Looker Studio             | |
|   > Sub1 |   |                                          | |
|   > Sub2 |   |                                          | |
| > Rep 2  |   |                                          | |
|          |   +------------------------------------------+ |
| ADMIN    |                                                |
| > Reportes|                                               |
| > Audit  |                                                |
| > Usuarios|                                               |
|          |                                                |
| [Config] |                                                |
| [Salir]  |                                                |
+----------+-----------------------------------------------+
```

---

## Dashboard Page

**Archivo:** `src/app/dashboard/page.tsx` (96 lineas)

### Estados
| Estado | Tipo | Proposito |
|--------|------|-----------|
| `selectedReport` | `Report \| null` | Reporte actualmente seleccionado |
| `mounted` | `boolean` | Evita hydration mismatch |
| `rolId` | `number \| null` | Rol del usuario (leido de cookies) |
| `sidebarOpen` | `boolean` | Visibilidad del sidebar en mobile |

### Comportamiento
- **Auto-seleccion:** Al cargar reportes, se selecciona automaticamente el primero si no hay ninguno seleccionado.
- **Estados de carga:** Muestra skeleton animado durante la carga.
- **Estado de error:** Muestra mensaje de error en rojo.
- **Estado vacio:** Muestra icono LayoutDashboard con mensaje "Sin reportes disponibles".

---

## Sidebar - Navegacion Lateral

**Archivo:** `src/components/dashboard/Sidebar.tsx` (291 lineas)

### Secciones del Sidebar

1. **Logo y titulo:** Logo de la empresa + "DATA ROOM"
2. **Overview:** Link a `/dashboard/overview`
3. **Reportes:** Arbol jerarquico de reportes con expand/collapse
4. **Administracion (solo admin):** Links a gestion de reportes, auditoria, usuarios
5. **Zona inferior:** Boton de configuracion + cerrar sesion

### Arbol Jerarquico de Reportes

El sidebar renderiza reportes de forma **recursiva** usando el componente `SidebarReportItem`:

- Reportes raiz (sin `padreId`) se muestran en el primer nivel
- Reportes con `padreId` se anidan bajo su padre
- Cada nivel tiene indentacion progresiva (`paddingLeft: 12 + depth * 16px`)
- Los padres con hijos muestran un icono `ChevronDown` que rota al expandir

### Interaccion de Expand/Collapse
- **Hover:** Expande automaticamente al pasar el mouse sobre un padre
- **Auto-expand:** Al seleccionar un hijo, se expanden todos sus ancestros automaticamente
- **No colapsar hijo seleccionado:** Si un hijo esta seleccionado, el padre no se colapsa al quitar el mouse

### Responsive
- En desktop (`lg:`): El sidebar siempre es visible (posicion relativa)
- En mobile: Se oculta fuera de pantalla con `translate-x-full` y se muestra con overlay oscuro al tocar el hamburguesa

### Links de Administracion (solo `rolId === 1`)
| Link | Ruta | Icono |
|------|------|-------|
| Gestion de Reportes | `/dashboard/admin/reports` | ClipboardList |
| Auditoria | `/dashboard/admin/audit` | ShieldCheck |
| Usuarios | `/dashboard/admin/users` | Users |

---

## TopBar - Barra Superior

**Archivo:** `src/components/dashboard/TopBar.tsx` (82 lineas)

### Elementos
| Posicion | Elemento | Descripcion |
|----------|---------|-------------|
| Izquierda | Menu hamburguesa | Solo visible en mobile, toggle del sidebar |
| Izquierda | Breadcrumbs | "Dashboard > {titulo del reporte activo}" |
| Derecha | Toggle tema | Alterna entre modo claro y oscuro (Sun/Moon) |
| Derecha | Info de usuario | Muestra el label del rol ("Administrador" / "Empleado") |
| Derecha | Boton Salir | Cierra sesion |

### Roles Mostrados
```typescript
ROL_LABELS = { 1: 'Administrador', 2: 'Empleado' }
```

---

## ReportViewer - Visor de Reportes

**Archivo:** `src/components/dashboard/ReportViewer.tsx` (57 lineas)

### Elementos
- **Titulo del reporte** con truncado
- **Link "Abrir en nueva pestana"** que abre la URL del iframe directamente
- **Iframe** que carga la URL de Looker Studio con `loading="lazy"` y `allow="fullscreen"`
- **Spinner de carga** visible hasta que el iframe termine de cargar (`onLoad`)

### Tracking de Visualizacion
El componente invoca `useReportTracking(reportId)` que mide el tiempo que el usuario pasa viendo cada reporte.

---

## Hook: useReports

**Archivo:** `src/hooks/useReports.ts` (45 lineas)

### Endpoint
`GET /api/reports` - Retorna los reportes accesibles segun el rol del usuario.

### Retorno
| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `reports` | `Report[]` | Lista de reportes |
| `isLoading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Mensaje de error |
| `refetch` | `() => void` | Funcion para recargar |

### Evento Global de Refresco
Escucha el evento `window.addEventListener('refresh-reports', handler)`. Cuando otros modulos (como el admin de reportes) disparan este evento, los reportes se recargan automaticamente en el sidebar.

---

## Hook: useReportTracking

**Archivo:** `src/hooks/useReportTracking.ts` (50 lineas)

### Funcionamiento
1. Al montar el componente, registra `Date.now()` como inicio.
2. Al desmontar (cambio de reporte) o cerrar la pestana (`beforeunload`), calcula la duracion.
3. Si la duracion es >= 3 segundos, envia `POST /api/audit/report-time` con:
   ```json
   { "reporteId": 5, "duracion": 45 }
   ```
4. Usa `fetch` con `keepalive: true` para asegurar el envio incluso al cerrar la pestana.
5. Los errores de red se ignoran silenciosamente (telemetria no critica).

### Constantes
| Constante | Valor | Descripcion |
|-----------|-------|-------------|
| `MIN_DURATION_SECONDS` | `3` | Umbral minimo para registrar |
| `API_URL` | `NEXT_PUBLIC_API_URL` | URL base de la API |
