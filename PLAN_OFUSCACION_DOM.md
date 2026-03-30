# Plan de Ofuscacion DOM: Barreras contra Inspeccion de iframe Looker Studio

## Objetivo

Implementar multiples capas de ofuscacion en el frontend (Next.js/React) para dificultar que un usuario promedio encuentre la URL del iframe de Looker Studio al usar "Inspeccionar Elemento", "Ver codigo fuente" o atajos de DevTools.

**Premisa:** Estas tecnicas NO son seguridad real. Son barreras disuasorias contra usuarios no tecnicos. Un usuario avanzado siempre podra encontrar la URL en la pestana Network. El valor esta en elevar significativamente la barrera de entrada.

---

## Nivel 1 - Impacto alto, esfuerzo bajo, sin afectacion a UX

### 1.1 Inyeccion dinamica del `src` via JavaScript

**Que hacer:**
- Nunca renderizar el iframe con el atributo `src` directamente en JSX
- Crear el iframe via `document.createElement('iframe')` dentro de un `useEffect`
- Insertar el elemento en un contenedor `div` referenciado con `useRef`
- Asignar el `src` programaticamente despues de montar el elemento

**Por que funciona:**
- El HTML original (View Source) no contiene la URL
- React DevTools no muestra el `src` como prop del componente
- El inspector de elementos si lo muestra al expandir el DOM, pero requiere que el usuario navegue activamente hasta el nodo

**Impacto en UX:** Ninguno. El usuario ve el dashboard exactamente igual.

**Archivos involucrados:**
- `frontend/src/components/dashboard/ReportViewer.tsx` — reescribir la logica de renderizado del iframe

---

### 1.2 Eliminar el link "Abrir en nueva pestana"

**Que hacer:**
- Eliminar completamente el bloque `<a href={urlIframe} target="_blank">` del componente `ReportViewer`
- Este link expone la URL en texto plano en el DOM, en el hover del navegador, y al hacer clic derecho > Copiar direccion del enlace

**Por que funciona:**
- Elimina la via mas obvia y facil de obtener la URL
- Un usuario casual no necesita ir a DevTools: actualmente solo necesita hacer clic derecho sobre el link

**Impacto en UX:** Minimo. Se pierde una conveniencia menor. Si se requiere, se puede reemplazar con un boton que abra el dashboard en fullscreen dentro de la misma aplicacion.

**Archivos involucrados:**
- `frontend/src/components/dashboard/ReportViewer.tsx` — eliminar el bloque del enlace externo

---

### 1.3 Ocultar `urlIframe` de la respuesta del API

**Que hacer:**
- Modificar el endpoint `GET /reports` del backend para que NO incluya el campo `urlIframe` en la respuesta JSON para usuarios normales
- Crear un endpoint separado `GET /reports/:id/embed-url` que devuelva la URL solo cuando se necesite cargar el iframe, con validacion de JWT y rol
- Mantener `urlIframe` solo en el endpoint admin `GET /reports/admin` para gestion

**Por que funciona:**
- Actualmente, al abrir la pestana Network y buscar la respuesta de `/reports`, la URL aparece en el JSON
- Con este cambio, la URL solo aparece en una request separada que el usuario tendria que identificar entre muchas

**Impacto en UX:** Ninguno.

**Archivos involucrados:**
- `BACKEND/src/reports/reports.service.ts` — nuevo metodo que excluya `urlIframe` del select
- `BACKEND/src/reports/reports.controller.ts` — nuevo endpoint para obtener URL individual
- `frontend/src/hooks/useReports.ts` — adaptar para no esperar `urlIframe` en la lista
- `frontend/src/types/report.types.ts` — hacer `urlIframe` opcional o eliminarlo del tipo

---

## Nivel 2 - Impacto medio-alto, esfuerzo medio, afectacion minima a UX

### 2.1 Encapsulamiento con Shadow DOM

**Que hacer:**
- Crear un Web Component personalizado (clase que extiende `HTMLElement`) que encapsule el iframe dentro de un Shadow DOM cerrado (`attachShadow({ mode: 'closed' })`)
- Registrarlo con `customElements.define()` (ej: `secure-frame`)
- En React, renderizar `<secure-frame>` y pasar el `reportId` como atributo
- Dentro del Shadow DOM cerrado, el Web Component crea el iframe programaticamente

**Por que funciona:**
- `mode: 'closed'` impide que `element.shadowRoot` retorne el contenido del shadow tree desde JavaScript externo
- El inspector de elementos de Chrome SI permite expandir el shadow DOM, pero:
  - El usuario necesita saber que existe un Shadow DOM
  - Necesita expandir multiples niveles para llegar al iframe
  - No aparece en la vista plana del DOM como un iframe normal
- React DevTools no muestra nada dentro del Web Component

**Consideracion importante:**
- Chrome DevTools tiene la opcion "Show user agent shadow DOM" que puede revelar el contenido. Esto es configurable por el usuario, no por la pagina. Pero un usuario promedio no sabe que esta opcion existe.
- El shadow DOM cerrado bloquea acceso programatico (`document.querySelector('iframe')` no lo encontrara)

**Impacto en UX:** Ninguno si se implementa correctamente. El iframe se ve y funciona identico.

**Archivos involucrados:**
- `frontend/src/components/dashboard/SecureFrame.ts` — nuevo: definicion del Web Component
- `frontend/src/components/dashboard/ReportViewer.tsx` — usar `<secure-frame>` en lugar de `<iframe>`

---

### 2.2 Ofuscacion de la URL en memoria

**Que hacer:**
- El backend devuelve la URL codificada (ej: base64, o cifrada con una clave rotativa por sesion)
- El frontend decodifica la URL en runtime justo antes de asignarla al iframe
- Nunca almacenar la URL decodificada en una variable de estado de React ni en el DOM como string plano
- Decodificar, asignar al `src` del iframe (dentro del Shadow DOM), y descartar inmediatamente la referencia

**Por que funciona:**
- Si el usuario intercepta la respuesta del API en Network, ve un string codificado, no una URL reconocible
- No puede hacer copy-paste directo del valor
- Requiere que el usuario entienda el esquema de codificacion para decodificarlo

**Limitacion:** Base64 es trivial de decodificar para alguien tecnico. Un cifrado con clave de sesion es mas robusto pero agrega complejidad. Evaluar segun el perfil de usuarios.

**Impacto en UX:** Ninguno.

**Archivos involucrados:**
- `BACKEND/src/reports/reports.service.ts` — codificar/cifrar la URL antes de enviarla
- `frontend/src/lib/decode.ts` — nuevo: funcion de decodificacion
- `frontend/src/components/dashboard/SecureFrame.ts` — decodificar antes de asignar src

---

### 2.3 Bloqueo de clic derecho sobre el area del iframe

**Que hacer:**
- Colocar un `div` overlay transparente sobre el iframe que intercepte el clic derecho (`onContextMenu`) y lo anule con `preventDefault()`
- El overlay debe tener `pointer-events: none` por defecto para que el iframe sea interactivo
- Activar `pointer-events: all` en el overlay SOLO cuando se detecte clic derecho (via `mousedown` con `button === 2`)
- Desactivar nuevamente despues de un breve timeout

**Por que funciona:**
- Impide "Inspeccionar elemento" directamente sobre el iframe via clic derecho
- El menu contextual del navegador no aparece sobre el area del dashboard

**Limitacion:** El usuario puede hacer clic derecho fuera del area del iframe y luego navegar manualmente al nodo en el inspector.

**Impacto en UX:** Bajo. Los usuarios de dashboards rara vez necesitan clic derecho sobre el contenido. Los controles del dashboard (filtros, etc.) funcionan con clic izquierdo.

**Archivos involucrados:**
- `frontend/src/components/dashboard/ReportViewer.tsx` — agregar overlay con logica de intercepcion

---

## Nivel 3 - Impacto medio, esfuerzo medio, afectacion moderada a UX

### 3.1 Bloqueo de atajos de teclado de DevTools

**Que hacer:**
- Agregar un event listener global en `keydown` que intercepte y anule:
  - `F12` — abre DevTools directamente
  - `Ctrl+Shift+I` / `Cmd+Option+I` — abre DevTools
  - `Ctrl+Shift+J` / `Cmd+Option+J` — abre consola
  - `Ctrl+Shift+C` / `Cmd+Option+C` — inspector de elementos
  - `Ctrl+U` / `Cmd+U` — ver codigo fuente
- Usar `event.preventDefault()` y `event.stopPropagation()` en cada caso
- Implementar como un hook de React (`useDevToolsBlocker`) activado solo en produccion

**Por que funciona:**
- La mayoria de usuarios casuales usan F12 o clic derecho como unica via para abrir DevTools
- Si ambos estan bloqueados, el usuario promedio no sabra como acceder

**Limitaciones conocidas:**
- El usuario puede abrir DevTools desde el menu del navegador (tres puntos > Mas herramientas > Herramientas para desarrolladores)
- Puede abrir Chrome con `--auto-open-devtools-for-tabs`
- Puede abrir DevTools en otra pestana y luego navegar
- Algunas extensiones del navegador pueden abrir DevTools
- **Firefox y Safari tienen sus propios atajos que difieren**

**Impacto en UX:** Moderado. Si algun usuario legitimo necesita F12 para otra razon (poco probable en un data room), se frustrara. Considerar aplicar el bloqueo solo en las paginas del dashboard, no en toda la aplicacion.

**Archivos involucrados:**
- `frontend/src/hooks/useDevToolsBlocker.ts` — nuevo: hook con la logica de intercepcion
- `frontend/src/components/dashboard/ReportViewer.tsx` — activar el hook
- Condicionar con `process.env.NODE_ENV === 'production'` para no afectar desarrollo

---

### 3.2 Deteccion de DevTools abiertas y destruccion del iframe

**Que hacer:**
- Implementar deteccion heuristica de DevTools abiertas usando una o mas tecnicas:
  - **Tecnica del `debugger`:** Ejecutar periodicamente (`setInterval`) un bloque con la instruccion `debugger`. Si DevTools estan cerradas, se ignora. Si estan abiertas, la ejecucion se pausa y el tiempo transcurrido entre antes y despues del `debugger` es significativamente mayor (>100ms)
  - **Tecnica de tamaño de ventana:** Comparar `window.outerWidth - window.innerWidth` y `window.outerHeight - window.innerHeight`. Un delta grande (>160px) sugiere que DevTools estan acopladas al costado o abajo
  - **Tecnica del `console.log` con getter:** Crear un objeto con un getter personalizado en una propiedad (ej: `toString` o `id`) y pasarlo a `console.log()`. El getter solo se ejecuta si la consola esta activamente renderizando, es decir, si DevTools estan abiertas
- Al detectar DevTools abiertas:
  - Desmontar inmediatamente el iframe (eliminarlo del DOM / Shadow DOM)
  - Mostrar un mensaje: "Por razones de seguridad, el dashboard no esta disponible mientras las herramientas de desarrollo esten abiertas"
  - Registrar el evento en el backend (audit log) via `POST /audit/devtools-detected`
- Al detectar que DevTools se cerraron: remontar el iframe automaticamente

**Por que funciona:**
- Incluso si el usuario logra abrir DevTools, el iframe ya no existe en el DOM para ser inspeccionado
- La URL desaparece de la memoria del navegador al desmontar el elemento
- El mensaje disuade al usuario de continuar intentando

**Limitaciones:**
- La tecnica del tamaño no funciona si DevTools estan en ventana flotante (undocked)
- La tecnica del `debugger` puede causar leves pausas en el rendimiento
- La tecnica del `console.log` con getter no funciona en todos los navegadores
- Se recomienda combinar al menos dos tecnicas para mayor fiabilidad
- Usuarios avanzados pueden deshabilitar breakpoints o usar extensiones anti-deteccion

**Impacto en UX:** Moderado-Alto. Si un usuario abre DevTools por cualquier razon (no necesariamente maliciosa), pierde acceso al dashboard temporalmente. Justificable en un data room.

**Archivos involucrados:**
- `frontend/src/hooks/useDevToolsDetector.ts` — nuevo: hook con logica de deteccion
- `frontend/src/components/dashboard/SecureFrame.ts` — reaccionar a la deteccion desmontando el iframe
- `frontend/src/components/dashboard/ReportViewer.tsx` — mostrar mensaje cuando DevTools detectadas
- `BACKEND/src/audit/audit.controller.ts` — nuevo endpoint para registrar evento
- `BACKEND/src/audit/audit.service.ts` — persistir evento en BD

---

### 3.3 Destruccion del iframe al perder foco la ventana

**Que hacer:**
- Escuchar el evento `visibilitychange` del documento
- Cuando `document.visibilityState` cambie a `'hidden'`, desmontar el iframe
- Cuando vuelva a `'visible'`, remontar el iframe (volvera a cargar el dashboard)

**Analisis critico antes de implementar:**

Esta tecnica tiene un **problema grave de UX** que debe evaluarse cuidadosamente:

- Se activa si el usuario cambia de pestana (Alt+Tab a otra app, cambiar a otra tab del navegador)
- Se activa si el usuario abre cualquier ventana sobre el navegador (un chat, un email, una notificacion)
- El iframe se recarga completamente cada vez que el usuario vuelve, perdiendo el estado del dashboard (filtros aplicados, scroll, selecciones)
- En un data room donde el usuario necesita consultar datos y simultaneamente trabajar en otro documento, esta tecnica destruye la experiencia

**Alternativa recomendada:** En lugar de destruir el iframe al perder foco, combinarlo SOLO con la deteccion de DevTools (3.2). Destruir el iframe unicamente cuando se detecta que DevTools esta abierta, no por cualquier cambio de foco.

**Si se decide implementar de todos modos:**
- Agregar un delay de 2-3 segundos antes de desmontar (para evitar falsos positivos por cambios rapidos de ventana)
- Mostrar un overlay "Sesion pausada" en lugar de destruir silenciosamente
- Remontar automaticamente al volver

**Impacto en UX:** Alto. Puede frustrar significativamente a usuarios legitimos.

**Archivos involucrados:**
- `frontend/src/hooks/useVisibilityGuard.ts` — nuevo: hook con logica de visibilidad
- `frontend/src/components/dashboard/ReportViewer.tsx` — integrar con el ciclo de montaje/desmontaje

---

## Nivel 4 - Medidas complementarias

### 4.1 CSS: Deshabilitar seleccion y arrastre sobre el area del dashboard

**Que hacer:**
- Aplicar `user-select: none` y `-webkit-user-drag: none` al contenedor del iframe
- Esto impide que el usuario seleccione texto o arrastre elementos que pudieran revelar la URL

**Impacto en UX:** Ninguno en el contexto de un dashboard.

---

### 4.2 Desactivar console.log de la URL

**Que hacer:**
- Asegurar que en produccion ningun `console.log`, `console.debug`, ni similar imprima la URL del iframe
- Revisar que las herramientas de debugging no expongan la URL
- Considerar sobrescribir `console.log` en produccion para suprimir output (controversial pero efectivo)

**Impacto en UX:** Ninguno.

---

### 4.3 Watermark visual sobre el iframe

**Que hacer:**
- Superponer un div semi-transparente con el nombre/email del usuario logueado sobre el area del dashboard
- Usar CSS `pointer-events: none` para que no interfiera con la interaccion del dashboard
- Rotar el texto y repetirlo en patron diagonal

**Por que funciona:**
- No impide ver la URL, pero disuade capturas de pantalla y screenshots
- Si el usuario comparte una captura, se puede rastrear quien la hizo

**Impacto en UX:** Bajo-Moderado. El watermark es visible pero no bloquea la lectura de datos.

**Archivos involucrados:**
- `frontend/src/components/dashboard/Watermark.tsx` — nuevo: componente de watermark
- `frontend/src/components/dashboard/ReportViewer.tsx` — posicionar watermark sobre el iframe

---

## Orden de implementacion recomendado

| Prioridad | Tecnica | Esfuerzo | Impacto seguridad | Riesgo UX |
|:---------:|---------|:--------:|:-----------------:|:---------:|
| 1 | 1.2 Eliminar link externo | 5 min | Alto | Ninguno |
| 2 | 1.3 Ocultar urlIframe del API | 1 hora | Alto | Ninguno |
| 3 | 1.1 Inyeccion dinamica del src | 30 min | Alto | Ninguno |
| 4 | 2.2 Ofuscacion de URL en memoria | 1 hora | Medio | Ninguno |
| 5 | 2.3 Bloqueo clic derecho sobre iframe | 30 min | Medio | Bajo |
| 6 | 2.1 Shadow DOM cerrado | 2 horas | Alto | Ninguno |
| 7 | 3.1 Bloqueo atajos DevTools | 1 hora | Medio | Moderado |
| 8 | 3.2 Deteccion DevTools + destruccion | 3 horas | Alto | Moderado |
| 9 | 4.1 CSS anti-seleccion | 5 min | Bajo | Ninguno |
| 10 | 4.3 Watermark | 1 hora | Disuasorio | Bajo |
| 11 | 3.3 Destruccion por foco | 1 hora | Medio | **Alto** |

**Recomendacion final:** Implementar del 1 al 8. Evaluar el 11 (destruccion por foco) solo si el perfil de usuarios del data room lo justifica, ya que el impacto en UX es significativo.

---

## Lo que estas barreras NO resuelven

Estas medidas son eficaces contra el ~90% de usuarios (los que solo saben hacer F12 o clic derecho). Sin embargo, no protegen contra:

- Pestana Network de DevTools (si logran abrirla por otra via)
- Extensiones de navegador que capturan trafico HTTP
- Herramientas de proxy como Fiddler, Charles Proxy o Wireshark
- Usuarios que deshabilitan JavaScript
- Grabacion de pantalla o screenshots (parcialmente mitigado por watermark)

Para proteccion real contra estos vectores, consultar el `PLAN_SEGURIDAD_LOOKER.md` (opciones D2: Looker Signed Embedding, o E: charts propios sin iframe).
