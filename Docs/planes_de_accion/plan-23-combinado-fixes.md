# Plan de Acción #23 — Fixes Combinados: Session Loop + Parent Report Empty State

**Fecha:** 2026-05-06
**Rama:** `fix/correccion-codigo-040526`
**Archivos afectados (lectura previa completada):**
- `frontend/src/auth.config.ts`
- `frontend/src/auth.ts`
- `frontend/src/lib/axios.ts`
- `frontend/src/types/next-auth.d.ts`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/components/dashboard/DashboardGrid.tsx`
- `frontend/src/components/dashboard/ReportViewer.tsx`

---

## Diagnóstico Técnico

### Bug 1 — Bucle de redirección por JWT expirado

**Causa raíz identificada en `frontend/src/lib/axios.ts` (líneas 19-28):**

El interceptor de respuesta usa `window.location.href = '/login'` al detectar un 401. Este mecanismo redirige al navegador hacia `/login`, pero la **cookie de sesión de NextAuth sigue viva**. Cuando el middleware de NextAuth (`auth.config.ts → authorized`) evalúa la ruta `/login` con una sesión activa, ejecuta `Response.redirect('/dashboard/overview')`. El ciclo se repite hasta que la cookie de NextAuth muere por tiempo.

El problema secundario es que `auth.config.ts` **no almacena ni verifica la expiración del JWT del backend**. El token de NextAuth puede estar "vivo" meses después de que el `access_token` de NestJS expiró, porque NextAuth usa su propia `maxAge` de sesión independiente.

### Bug 2 — "Cara triste" en Reportes Padre sin URL

**Causa raíz identificada en la intersección de `DashboardGrid.tsx` y `dashboard/page.tsx`:**

La lógica `esDashboard = Boolean(selectedReport?.children && selectedReport.children.length > 0)` es correcta. El `DashboardGrid` ya guarda el `ParentBanner` con `{parent.urlIframe && <ParentBanner />}`.

Sin embargo, hay **dos rutas de error** que producen el icono de "cara triste" del navegador:

1. **Ruta A:** Un reporte padre tiene un `urlIframe` almacenado en base de datos que NO es `null` (puede ser una URL inválida, un placeholder, o una URL de entorno local que en producción retorna `ERR_CONNECTION_REFUSED`). La guarda `parent.urlIframe &&` evalúa este string truthy y renderiza `ParentBanner`, que dispara el iframe. El navegador muestra su página de error nativa dentro del contenedor del iframe, que es el "ícono de cara triste".

2. **Ruta B:** Un reporte padre que **no tiene hijos visibles** (por filtro `activo` o porque nunca se asignaron) y tiene `urlIframe` con un valor truthy-pero-inválido llega a `ReportViewer`. El `if (!urlIframe)` en `ReportViewer` no captura un string no-vacío-pero-roto. El iframe se renderiza con esa URL inválida.

La **corrección también tiene un requerimiento de diseño**: incluso cuando el estado vacío funciona técnicamente (URL null), el mensaje actual ("Este reporte no tiene gráfico configurado.") es de desarrollo, no de producción, y no sigue la estética Navy/Slate del Dark Mode.

---

## Fase 1 — Sincronización de Sesión y Fix de Login

### 1.1 — Extracción de `exp` del JWT de backend (`auth.ts`)

**Archivo:** `frontend/src/auth.ts`
**Función:** `authorize()` dentro del provider `Credentials`

Después de recibir el `data.access_token` del backend, se debe decodificar el payload del JWT sin librerías externas (el JWT es base64url, decodificable nativamente):

```
// Pseudocódigo conceptual — NO implementar todavía
const rawPayload = data.access_token.split('.')[1];
const decodedPayload = JSON.parse(
  Buffer.from(rawPayload, 'base64url').toString('utf-8')
);
const backendTokenExp = decodedPayload.exp; // Unix timestamp en segundos
```

El objeto retornado por `authorize` debe incluir el campo `backendTokenExp`:

```
return {
  id: String(data.user.id),
  email: data.user.email,
  name: data.user.nombreCompleto,
  rol_id: data.user.rol_id,
  backendToken: data.access_token,
  backendTokenExp: backendTokenExp,   // ← NUEVO
};
```

### 1.2 — Actualización de los tipos de NextAuth (`next-auth.d.ts`)

**Archivo:** `frontend/src/types/next-auth.d.ts`

Agregar los campos necesarios a las tres interfaces:

| Interface | Campo nuevo | Tipo |
|-----------|------------|------|
| `User` | `backendTokenExp` | `number` |
| `JWT` | `backendTokenExp` | `number` |
| `JWT` | `error` | `string \| undefined` |
| `Session` | `error` | `string \| undefined` |

### 1.3 — Callbacks `jwt()` y `session()` (`auth.config.ts`)

**Archivo:** `frontend/src/auth.config.ts`

**Callback `jwt()` — modificación:**

```
// Pseudocódigo conceptual — NO implementar todavía
async jwt({ token, user }) {
  // Primer login: guardar datos del backend
  if (user) {
    token.rol_id = Number(user.rol_id);
    token.backendToken = user.backendToken;
    token.userId = user.id;
    token.backendTokenExp = user.backendTokenExp; // ← NUEVO
  }

  // En TODA llamada subsiguiente: verificar expiración del backend JWT
  if (token.backendTokenExp && Date.now() > token.backendTokenExp * 1000) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',   // ← SEÑAL DE EXPIRACIÓN
    };
  }

  return token;
}
```

**Nota crítica:** El `jwt()` callback de NextAuth se ejecuta en CADA request que necesita validar sesión, no solo al login. Esta verificación corre server-side (en el middleware o en `getServerSession`), de forma continua.

**Callback `session()` — modificación:**

```
// Pseudocódigo conceptual — NO implementar todavía
async session({ session, token }) {
  if (session.user) {
    session.user.rol_id = Number(token.rol_id);
    session.user.id = token.userId as string;
  }
  (session as any).backendToken = token.backendToken;
  session.error = token.error;   // ← PROPAGAR ERROR AL CLIENTE
  return session;
}
```

---

## Fase 2 — Client-Side Session Guard (Eliminar el Bucle)

### 2.1 — Fix inmediato en el interceptor Axios (`lib/axios.ts`)

**Archivo:** `frontend/src/lib/axios.ts`

**Problema actual (línea 23):**
```typescript
window.location.href = '/login';   // ← CAUSA DEL BUCLE
```

**Sustitución requerida:**
```
// Pseudocódigo conceptual — NO implementar todavía
import { signOut } from 'next-auth/react';

// En el interceptor de error:
if (error.response?.status === 401) {
  if (typeof window !== 'undefined') {
    signOut({ callbackUrl: '/login' });   // ← LIMPIA LA COOKIE ANTES DE REDIRIGIR
  }
}
```

**Por qué funciona:** `signOut()` de NextAuth v5 realiza un `POST` a `/api/auth/signout` que invalida y elimina la cookie de sesión del servidor **antes** de ejecutar la redirección. La cookie muerta hace que el middleware `authorized` deje pasar al usuario hacia `/login` sin redirigir de vuelta.

**Advertencia:** Una vez llamado `signOut()`, no se debe también hacer `window.location.href`. El `callbackUrl` en `signOut` se encarga de la navegación.

### 2.2 — Componente `SessionGuard` (defensa en profundidad)

**Archivo a crear:** `frontend/src/components/auth/SessionGuard.tsx`

Este componente actúa como segunda línea de defensa: incluso si el interceptor Axios no alcanza a dispararse (por ejemplo, en rutas sin llamadas API), detecta el `error` propagado por el callback `session()` y fuerza el logout.

**Especificación del componente:**

```
// Pseudocódigo conceptual — NO implementar todavía
'use client';

// Usa useSession() de next-auth/react
// En un useEffect que depende de [session.error, status]:
//   - Si status === 'authenticated' Y session.error === 'RefreshAccessTokenError'
//   - → Llamar signOut({ callbackUrl: '/login' })
// Renderiza simplemente {children} sin modificar el árbol DOM
```

**Dónde integrarlo:** En `frontend/src/app/dashboard/page.tsx`, envolver el componente `DashboardPageInner` (o el `return` principal) con `<SessionGuard>`. El `layout.tsx` del dashboard actualmente es un pass-through (`return <>{children}</>`), por lo que es el candidato ideal si se prefiere proteger todas las rutas del dashboard desde un solo punto.

**Eliminar lógica antigua:** Una vez implementado el `SessionGuard`, revisar si en `dashboard/page.tsx` o en algún hook existe algún `useEffect` que haga `window.location.reload()` ante errores de sesión. Eliminarlo completamente.

---

## Fase 3 — Renderizado Condicional de Reportes Padre (Fix del Error de Iframe)

### 3.1 — Corrección de la guarda en `DashboardGrid.tsx`

**Archivo:** `frontend/src/components/dashboard/DashboardGrid.tsx`

**Problema:** La guarda actual `{parent.urlIframe && <ParentBanner />}` evalúa cualquier string truthy como válido, incluyendo URLs inválidas o URLs de entorno local que en producción retornan `ERR_CONNECTION_REFUSED`.

**Corrección de la guarda:**

Antes de condicionar el `ParentBanner`, validar que la URL no solo sea truthy sino también una URL semánticamente válida para un iframe embebido:

```
// Pseudocódigo conceptual — NO implementar todavía
const urlValida = Boolean(
  parent.urlIframe &&
  parent.urlIframe.trim() !== '' &&
  (parent.urlIframe.startsWith('https://') || parent.urlIframe.startsWith('http://'))
);
```

Con esta guarda, una URL vacía, con espacios, o sin protocolo válido no renderizará el `ParentBanner`. Para el caso de producción donde solo se usan URLs de Looker Studio (siempre `https://`), esta validación elimina todos los falsos positivos.

### 3.2 — Diseño del estado vacío de Reporte Padre (`ParentEmptyHeader`)

Cuando un reporte padre seleccionado NO tiene URL válida, el espacio donde iría el `ParentBanner` debe mostrar un bloque de estado vacío **limpio, sin iconos de error, integrado con el Dark Mode**.

**Especificación visual:**

| Propiedad | Valor Light | Valor Dark |
|-----------|------------|------------|
| Fondo | `bg-white` | `bg-sidebar-hover` |
| Borde | `border border-dashed border-slate-200` | `border border-dashed border-white/10` |
| Borde radius | `rounded-xl` | `rounded-xl` |
| Alto | No fijado — solo `padding` generoso (`py-8 px-6`) | Igual |
| Texto principal | `text-slate-500` | `text-gray-400` |
| Tamaño texto | `text-sm` | `text-sm` |
| Iconografía | **Ninguna** — solo texto sutil | Igual |
| Mensaje sugerido | `"Dashboard Principal — Seleccione un sub-reporte para visualizar los datos"` | Igual |

**Criterio de diseño:** No debe existir ningún elemento que el usuario pueda confundir con un estado de error. Sin bordes rojos, sin íconos de triángulo, sin texto en colores de alerta. Es un espacio vacío intencional, no un error.

**Estructura JSX aproximada (sin código real):**
```
// Pseudocódigo de estructura — NO implementar todavía
<div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10
                bg-white dark:bg-sidebar-hover
                py-8 px-6 flex items-center justify-center">
  <p className="text-sm text-slate-500 dark:text-gray-400 text-center">
    Dashboard Principal — Seleccione un sub-reporte para visualizar los datos
  </p>
</div>
```

Este bloque reemplaza visualmente al `ParentBanner` cuando no hay URL. No tiene altura fija (`h-[300px]`) para no crear un espacio muerto grande. Solo usa padding para respirar.

### 3.3 — Comportamiento del Grid sin `ParentBanner`

Cuando el `ParentBanner` no se renderiza (porque el padre no tiene URL), el `DashboardGrid` muestra directamente:

1. `<header>` con título y descripción del padre
2. Grid de tarjetas hijo (`ChildCard[]`)

**Sin `ParentBanner`:** El grid de hijos **sube naturalmente** porque el layout es `flex flex-col gap-6`. No hay ningún cambio adicional necesario en el layout, dado que el `ParentBanner` ya está encapsulado en su propio bloque condicional.

**Con el nuevo `ParentEmptyHeader`:** Si se decide mostrar el bloque de estado vacío (opción recomendada para coherencia visual), se inserta entre el `<header>` y el grid de hijos, con el mismo `gap-6` del flex container. El resultado es que el grid de hijos **no sube hasta el tope** — hay un espacio de "categoría/contexto" antes del grid, lo cual es visualmente más limpio que un salto brusco.

### 3.4 — Fix del estado vacío en `ReportViewer.tsx`

**Archivo:** `frontend/src/components/dashboard/ReportViewer.tsx`

El estado vacío actual (líneas 17-35) funciona técnicamente pero tiene mensajes orientados al administrador. Cuando un usuario final ve "Si es un reporte principal, agrégale sub-reportes", se confunde.

**Mejora del mensaje para el usuario final:**

Cambiar la descripción a algo que el usuario final pueda entender sin contexto de administración:
- Eliminar: `"Si es un reporte principal, agrégale sub-reportes para verlos como dashboard."`
- Agregar: `"Este reporte está siendo configurado. Contacte al administrador si necesita acceso."`

Adicionalmente, la guarda `if (!urlIframe)` debe ser más estricta, igual que en `DashboardGrid`:
```
// Pseudocódigo conceptual — NO implementar todavía
const urlEsValida = urlIframe && urlIframe.trim() !== '' && urlIframe.startsWith('http');

if (!urlEsValida) {
  // Renderizar estado vacío
}
```

---

## Resumen de Cambios por Archivo

| Archivo | Tipo de cambio | Fase |
|---------|---------------|------|
| `frontend/src/auth.ts` | Decodificar JWT, extraer `exp`, incluir en retorno de `authorize` | 1.1 |
| `frontend/src/types/next-auth.d.ts` | Añadir `backendTokenExp`, `error` a las interfaces | 1.2 |
| `frontend/src/auth.config.ts` | Modificar callbacks `jwt()` y `session()` | 1.3 |
| `frontend/src/lib/axios.ts` | Reemplazar `window.location.href` por `signOut()` en interceptor 401 | 2.1 |
| `frontend/src/components/auth/SessionGuard.tsx` | Crear componente nuevo | 2.2 |
| `frontend/src/app/dashboard/page.tsx` | Envolver con `SessionGuard`, eliminar lógica antigua de reload | 2.2 |
| `frontend/src/components/dashboard/DashboardGrid.tsx` | Mejorar guarda de URL, añadir `ParentEmptyHeader` | 3.1 / 3.2 / 3.3 |
| `frontend/src/components/dashboard/ReportViewer.tsx` | Mejorar guarda de URL, actualizar mensajes del estado vacío | 3.4 |

---

## Orden de Implementación Recomendado

1. **Primero:** `next-auth.d.ts` — los tipos deben existir antes de modificar los callbacks.
2. **Segundo:** `auth.ts` — decodificar el JWT y agregar `backendTokenExp` al retorno.
3. **Tercero:** `auth.config.ts` — los callbacks consumen los tipos del paso 1.
4. **Cuarto:** `lib/axios.ts` — fix independiente, menor riesgo.
5. **Quinto:** `SessionGuard.tsx` + integración en `page.tsx`.
6. **Sexto:** `DashboardGrid.tsx` + `ReportViewer.tsx` — pueden hacerse en paralelo.

**Prueba de regresión mínima:**
- [ ] Login correcto: sesión funciona normalmente
- [ ] JWT expirado (simulado): se ejecuta `signOut` y llega a `/login` sin bucle
- [ ] Reporte padre con URL válida: muestra `ParentBanner` normalmente
- [ ] Reporte padre sin URL (`null`): muestra `ParentEmptyHeader`, grid de hijos visible
- [ ] Reporte padre con URL inválida/local: muestra `ParentEmptyHeader`, NO muestra iframe
- [ ] Reporte hoja con URL: `ReportViewer` muestra iframe normalmente
- [ ] Reporte hoja sin URL: `ReportViewer` muestra estado vacío sin "cara triste"
