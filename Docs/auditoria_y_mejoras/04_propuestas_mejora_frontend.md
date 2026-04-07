# Propuestas de Mejora: Frontend (UX/UI)

---

## Mejoras de UX (Experiencia de Usuario)

### 1. Confirmacion de Acciones Destructivas

**Estado actual:** El toggle de activar/desactivar usuarios y reportes se ejecuta inmediatamente sin confirmacion.

**Problema:** Un click accidental puede desactivar un usuario o reporte sin aviso.

**Recomendacion:** Agregar un dialogo de confirmacion antes de:
- Desactivar/activar usuarios
- Desactivar/activar reportes
- Eliminar reportes

```
Ejemplo:
"¿Estas seguro de que deseas desactivar al usuario Juan Perez?
Esta accion impedira que el usuario acceda al sistema."
[Cancelar] [Desactivar]
```

**Prioridad:** ALTA  
**Esfuerzo:** Bajo

---

### 2. Feedback de Errores Mas Detallado

**Estado actual:** Los errores de API se muestran genericamente o se silencian.

**Problemas detectados:**
- En `UserForm`: Los errores de validacion del backend (400) no se desglosan por campo
- En `ReportForm`: Similar al anterior
- En tablas: Los errores de mutacion no se muestran al usuario

**Recomendacion:**
- Mapear errores 400 del backend a campos especificos del formulario
- Mostrar toast/notificaciones para errores de mutacion en tablas
- Diferenciar mensajes por tipo de error (red, 403, 500)

**Prioridad:** ALTA  
**Esfuerzo:** Medio

---

### 3. Notificaciones Toast

**Estado actual:** Solo el `UserForm` muestra un banner de exito al crear usuario. Las demas acciones no dan feedback visual.

**Recomendacion:** Implementar un sistema de notificaciones toast global:
- Exito: "Reporte creado correctamente" (verde)
- Error: "No se pudo actualizar el usuario" (rojo)
- Info: "Sesion expirando en 5 minutos" (amarillo)

Libreria sugerida: `react-hot-toast` o `sonner`.

**Prioridad:** MEDIA  
**Esfuerzo:** Bajo

---

### 4. Indicador de Sesion Expirando

**Estado actual:** La sesion expira silenciosamente despues de 8 horas. El usuario solo se entera al recibir un 401 y ser redirigido a login, potencialmente perdiendo trabajo en formularios.

**Recomendacion:**
- Mostrar aviso 15 minutos antes de la expiracion
- Ofrecer opcion de extender la sesion (requiere refresh token en backend)

**Prioridad:** MEDIA  
**Esfuerzo:** Medio (requiere cambios en backend para refresh token)

---

### 5. Estado Vacio Mas Informativo

**Estado actual:** Las tablas vacias muestran "No se encontraron resultados" sin contexto.

**Recomendacion:** Diferenciar entre:
- "No hay usuarios registrados" (tabla completamente vacia)
- "No se encontraron usuarios con el filtro 'admin'" (busqueda sin resultados)
- Agregar icono ilustrativo y sugerencia de accion

**Prioridad:** BAJA  
**Esfuerzo:** Bajo

---

## Mejoras de UI (Interfaz de Usuario)

### 6. Responsive en Tablas de Admin

**Estado actual:** Las tablas de admin (usuarios, reportes, auditoria) muestran todas las columnas en mobile, lo que requiere scroll horizontal.

**Recomendacion:**
- En mobile: Ocultar columnas secundarias (ID, fecha de creacion)
- Alternativa: Usar layout de tarjetas en mobile en lugar de tabla
- Agregar indicador visual de "desliza para ver mas" si se mantiene tabla

**Prioridad:** MEDIA  
**Esfuerzo:** Medio

---

### 7. Accesibilidad (a11y)

**Hallazgos actuales:**
| Componente | Estado | Detalle |
|-----------|:------:|--------|
| LoginForm inputs | OK | Labels con `htmlFor` correctos |
| ToggleSwitch | OK | `role="switch"` y `aria-checked` |
| Modal | PARCIAL | Tiene `aria-label` en boton X pero falta `role="dialog"` y `aria-labelledby` |
| Sidebar links | OK | Estructura semantica correcta |
| Tablas | PARCIAL | Sin `aria-label` en la tabla ni `aria-sort` en headers |
| Botones de accion | PARCIAL | Algunos sin `aria-label` descriptivo |

**Recomendacion:**
- Agregar `role="dialog"` y `aria-labelledby` al Modal
- Agregar `aria-label` a las tablas y `aria-sort` a los headers ordenables
- Agregar `aria-label` descriptivos a botones de icono (editar, eliminar)
- Verificar contraste de colores en badges y textos secundarios

**Prioridad:** MEDIA  
**Esfuerzo:** Bajo

---

### 8. Dark Mode Completo

**Estado actual:** Dark mode implementado parcialmente. Algunas paginas (overview, login) no tienen estilos dark.

**Hallazgos:**
- `LoginForm`: Fondo fijo `bg-slate-100` y `bg-white` sin variantes dark
- `OverviewPage`: Alertas y tarjetas con colores fijos
- `PDFViewerModal`: Estilos hardcodeados sin dark mode
- Tablas de admin: Implementacion parcial

**Recomendacion:** Agregar clases `dark:` a todos los componentes para consistencia.

**Prioridad:** BAJA  
**Esfuerzo:** Medio

---

### 9. PDFViewerModal Funcional

**Estado actual:** La paginacion, descarga e impresion del visor de PDF son elementos visuales sin funcionalidad.

**Recomendacion:**
- Si se planea usar documentos reales: integrar libreria `react-pdf` o embeber PDFs via URL
- Si es solo estetico: agregar tooltip "Proximamente" a botones deshabilitados
- Considerar almacenar documentos reales en el backend o S3

**Prioridad:** BAJA (depende de los requerimientos del negocio)  
**Esfuerzo:** Alto (si se implementa funcionalidad real)

---

### 10. Prefetching de Datos

**Estado actual:** Los datos se cargan al montar el componente. No hay precarga.

**Recomendacion:**
- Prefetch de reportes en el sidebar al hacer hover sobre links de admin
- Prefetch de la siguiente pagina en tablas paginadas
- React Query soporta `prefetchQuery` nativamente

```typescript
// En el hover de un link
queryClient.prefetchQuery({
  queryKey: ['admin-reports', { page: 1 }],
  queryFn: () => api.get('/reports/admin?page=1')
});
```

**Prioridad:** BAJA  
**Esfuerzo:** Bajo

---

### 11. Eliminar Dependencia No Utilizada (Recharts)

**Estado actual:** `recharts` (3.8.1) esta en `package.json` pero no se detecta uso en componentes.

**Recomendacion:** Verificar si se usa en algun componente no analizado. Si no se usa, eliminar:
```bash
npm uninstall recharts
```

**Prioridad:** BAJA  
**Esfuerzo:** Bajo

---

## Resumen

| # | Mejora | Area | Prioridad | Esfuerzo |
|:-:|--------|:----:|:---------:|:--------:|
| 1 | Confirmacion de acciones destructivas | UX | ALTA | Bajo |
| 2 | Feedback de errores detallado | UX | ALTA | Medio |
| 3 | Notificaciones toast | UX | MEDIA | Bajo |
| 4 | Indicador sesion expirando | UX | MEDIA | Medio |
| 5 | Estado vacio informativo | UX | BAJA | Bajo |
| 6 | Responsive en tablas | UI | MEDIA | Medio |
| 7 | Accesibilidad (a11y) | UI | MEDIA | Bajo |
| 8 | Dark mode completo | UI | BAJA | Medio |
| 9 | PDFViewerModal funcional | UI | BAJA | Alto |
| 10 | Prefetching de datos | Performance | BAJA | Bajo |
| 11 | Eliminar Recharts si no se usa | Performance | BAJA | Bajo |
