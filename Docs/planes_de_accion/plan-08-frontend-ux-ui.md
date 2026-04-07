# Plan 08: Frontend UX/UI — Sesion Expirando + Dark Mode Completo

**Alcance:** Indicador de expiracion de sesion + dark mode en 6 componentes  
**Dependencias a instalar:** Ninguna  
**Archivos afectados:** 8

---

## Parte A: Indicador de Sesion Expirando

### Arquitectura

El indicador se conecta con el sistema de Refresh Tokens (Plan 06). Cuando el Access Token esta proximo a expirar (faltan ~2 minutos de los 15 min), se muestra un toast de advertencia. Si el usuario no hace nada, el interceptor de Axios renovara automaticamente el token via `/api/auth/refresh`.

Si no se implementa el Plan 06 (Refresh Tokens), este indicador puede funcionar de forma autonoma con el token de 8h actual, mostrando el aviso 15 minutos antes.

### Enfoque Tecnico

#### A.1 Crear `frontend/src/hooks/useSessionExpiry.ts`

**Archivo nuevo.** Hook que monitorea la expiracion del token.

**Logica:**
1. Al montar, leer la cookie `rol_id` como indicador de sesion activa
2. Calcular el tiempo restante del token. Dos opciones:
   - **Opcion A (con Refresh Token):** El backend puede devolver `expiresAt` en la respuesta de login
   - **Opcion B (sin Refresh Token):** Almacenar `loginTimestamp` en sessionStorage al hacer login y calcular `loginTimestamp + 8h - now`
3. Configurar un `setTimeout` que dispare un toast de advertencia cuando falten 15 minutos
4. El toast tendra un boton "Extender sesion" que:
   - Con Refresh Token: llama a `POST /api/auth/refresh`
   - Sin Refresh Token: redirige al login con mensaje

**Estructura del hook:**
```typescript
export function useSessionExpiry() {
  useEffect(() => {
    const loginTime = sessionStorage.getItem('login_timestamp');
    if (!loginTime) return;

    const expiresAt = Number(loginTime) + 8 * 60 * 60 * 1000; // 8h
    const warningAt = expiresAt - 15 * 60 * 1000; // 15 min antes
    const now = Date.now();

    if (now >= expiresAt) return; // Ya expiro

    const warningDelay = Math.max(0, warningAt - now);

    const timerId = setTimeout(() => {
      toast.warning('Tu sesion expirara en 15 minutos', {
        duration: Infinity, // No se cierra automaticamente
        action: {
          label: 'Extender sesion',
          onClick: () => {
            // Llamar refresh endpoint o redirigir
          },
        },
      });
    }, warningDelay);

    return () => clearTimeout(timerId);
  }, []);
}
```

#### A.2 `frontend/src/context/AuthContext.tsx`

**Cambio en `login()`:** Guardar timestamp del login en sessionStorage:
```typescript
sessionStorage.setItem('login_timestamp', String(Date.now()));
```

**Cambio en `logout()`:** Limpiar el timestamp:
```typescript
sessionStorage.removeItem('login_timestamp');
```

#### A.3 `frontend/src/app/dashboard/layout.tsx`

**Cambio:** Invocar el hook `useSessionExpiry()` en el layout del dashboard para que este activo en todas las paginas protegidas.

**Nota:** El layout actual es un Server Component. Se necesita crear un wrapper Client Component o mover la logica a un componente hijo.

---

## Parte B: Dark Mode Completo

### Estado Actual del Dark Mode

| Componente | Dark Mode | Estado |
|-----------|:---------:|--------|
| Sidebar | Si | Completo |
| TopBar | Si | Completo |
| UserTable | Si | Completo |
| ReportTable | Si | Completo |
| AuditTable | Si | Completo |
| ReportForm | Si | Completo |
| **LoginForm** | **No** | Fondos fijos `bg-slate-100`, `bg-white` |
| **OverviewPage** | **No** | Alertas y tarjetas con colores fijos |
| **OverviewCard** | **No** | `bg-white`, `text-slate-800` fijos |
| **PDFViewerModal** | **No** | Estilos zinc hardcodeados |
| **UserForm** | **No** | Labels y inputs sin variantes dark |
| **Modal** | **No** | Panel `bg-white`, header `border-slate-200` fijos |

### Patron de Clases Dark

El proyecto usa la convencion de Tailwind con `dark:` prefix. Los colores dark del proyecto son:
- Fondos: `dark:bg-sidebar-main`, `dark:bg-sidebar-hover`
- Textos: `dark:text-gray-100` (principal), `dark:text-gray-300` (secundario), `dark:text-gray-400` (terciario), `dark:text-gray-500` (muted)
- Bordes: `dark:border-white/10`, `dark:border-white/20`
- Inputs: `dark:bg-sidebar-main dark:text-gray-200 dark:border-white/20`

### Archivos a Modificar

#### B.1 `frontend/src/components/auth/LoginForm.tsx` (167 lineas)

**Cambios por linea:**

| Linea | Actual | Agregar |
|:-----:|--------|---------|
| 38 | `bg-slate-100` | `dark:bg-sidebar-main` |
| 41 | `bg-white rounded-2xl shadow-xl` | `dark:bg-sidebar-hover` |
| 50 | `text-slate-800` | `dark:text-gray-100` |
| 51 | `text-slate-500` | `dark:text-gray-400` |
| 62 | `text-slate-700` | `dark:text-gray-300` |
| 74 | `border-slate-300 text-slate-800 placeholder-slate-400` | `dark:border-white/20 dark:bg-sidebar-main dark:text-gray-200 dark:placeholder-gray-500` |
| 74 | `focus:ring-blue-500` | `dark:focus:ring-sidebar-accent` |
| 85 | Mismos cambios para el input de password | Mismos dark: |
| 100 | `text-slate-400 hover:text-slate-600` | `dark:text-gray-500 dark:hover:text-gray-300` |
| 114 | `bg-red-50 border-red-200` | `dark:bg-red-900/20 dark:border-red-800` |
| 115 | `text-red-600` | `dark:text-red-400` |
| 123 | `bg-blue-900 hover:bg-blue-800` | `dark:bg-sidebar-accent dark:hover:bg-sidebar-accent/80` |
| 159 | `text-slate-400` | `dark:text-gray-500` |

**Total de cambios:** ~12 clases `dark:` agregadas.

#### B.2 `frontend/src/app/dashboard/overview/page.tsx` (182 lineas)

**Cambios por linea:**

| Linea | Actual | Agregar |
|:-----:|--------|---------|
| 100 | `bg-slate-100` | `dark:bg-sidebar-main` |
| 119 | `text-slate-500` | `dark:text-gray-400` |
| 122 | `text-slate-800` | `dark:text-gray-100` |
| 126 | `bg-white rounded-2xl border border-slate-200` | `dark:bg-sidebar-hover dark:border-white/10` |
| 127 | `text-slate-800` | `dark:text-gray-100` |
| 130 | `text-slate-500` | `dark:text-gray-400` |
| 136 | `bg-amber-50 border border-amber-200` | `dark:bg-amber-900/20 dark:border-amber-800/50` |
| 137 | `text-amber-800` | `dark:text-amber-300` |
| 140 | `text-amber-700` | `dark:text-amber-400` |
| 147 | `bg-red-50 border border-red-200` | `dark:bg-red-900/20 dark:border-red-800/50` |
| 148 | `text-red-800` | `dark:text-red-300` |
| 151 | `text-red-700` | `dark:text-red-400` |

**Total de cambios:** ~12 clases `dark:` agregadas.

#### B.3 `frontend/src/components/overview/OverviewCard.tsx` (27 lineas)

**Cambios:**

| Linea | Actual | Agregar |
|:-----:|--------|---------|
| 13 | `bg-white rounded-xl border border-slate-200 shadow-sm` | `dark:bg-sidebar-hover dark:border-white/10` |
| 13 | `hover:shadow-md` | `dark:hover:shadow-lg dark:hover:shadow-black/20` |
| 18 | `text-slate-800` | `dark:text-gray-100` |
| 19 | `text-slate-500` | `dark:text-gray-400` |
| 21 | `bg-blue-50` | `dark:bg-sidebar-accent/20` |
| 21 | `text-blue-600` | `dark:text-sidebar-accent` |

**Total de cambios:** ~6 clases `dark:`.

#### B.4 `frontend/src/components/overview/PDFViewerModal.tsx` (157 lineas)

Este componente ya usa colores oscuros (zinc) para el toolbar, pero el area de lectura y el documento no tienen variantes dark.

**Cambios:**

| Linea | Actual | Agregar |
|:-----:|--------|---------|
| 37 | `bg-black/60` | Sin cambio (ya es oscuro) |
| 90 | `bg-zinc-200` (area lectura) | `dark:bg-sidebar-main/80` |
| 92 | `bg-white` (hoja de papel) | `dark:bg-sidebar-hover` |
| 95 | `text-slate-900` (titulo doc) | `dark:text-gray-100` |
| 96 | `text-slate-400` (subtitulo) | `dark:text-gray-500` |
| 97 | `border-slate-200` (hr) | `dark:border-white/10` |
| 102 | `text-slate-800` (h3) | `dark:text-gray-200` |
| 103-104 | `text-slate-600` (parrafos) | `dark:text-gray-400` |
| Skeletons | `bg-slate-200` | `dark:bg-white/10` |

**Total de cambios:** ~10 clases `dark:`.

#### B.5 `frontend/src/components/admin/UserForm.tsx` (256 lineas)

**Estado actual:** Labels `text-slate-700`, inputs `border-slate-300`, botones con colores fijos.

**Cambios en las constantes de clase (lineas 106-109):**

```typescript
// ANTES:
const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const errorClass = 'text-red-500 text-xs mt-1';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

// DESPUES:
const inputClass = 'w-full px-3 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-sidebar-main text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-sidebar-accent/60 focus:border-transparent';
const errorClass = 'text-red-500 dark:text-red-400 text-xs mt-1';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1';
```

**Otros cambios:**

| Linea | Actual | Agregar |
|:-----:|--------|---------|
| 140 | `text-slate-400` (opcional) | `dark:text-gray-500` |
| 152 | `text-slate-400 hover:text-slate-600` (toggle pass) | `dark:text-gray-500 dark:hover:text-gray-300` |
| 180 | `text-slate-400` (hint password) | `dark:text-gray-500` |
| 209 | `text-blue-600 focus:ring-blue-500` (checkbox) | `dark:text-sidebar-accent dark:focus:ring-sidebar-accent/60` |
| 211 | `text-slate-700` (label activo) | `dark:text-gray-300` |
| 218 | `bg-red-50` (error global) | `dark:bg-red-900/20` |
| 229 | `border-slate-300 text-slate-700 hover:bg-slate-50` (cancelar) | `dark:border-white/20 dark:text-gray-300 dark:hover:bg-sidebar-main` |
| 245 | `bg-blue-600 hover:bg-blue-700` (submit) | `dark:bg-sidebar-accent dark:hover:bg-sidebar-accent/80` |

**Total de cambios:** ~15 clases `dark:`.

#### B.6 `frontend/src/components/ui/Modal.tsx` (71 lineas)

**Cambios:**

| Linea | Actual | Agregar |
|:-----:|--------|---------|
| 50 | `bg-white rounded-xl shadow-xl` | `dark:bg-sidebar-hover` |
| 54 | `border-b border-slate-200` | `dark:border-white/10` |
| 55 | `text-slate-800` | `dark:text-gray-100` |
| 59 | `text-slate-400 hover:text-slate-600 hover:bg-slate-100` | `dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-sidebar-main` |

**Total de cambios:** ~4 clases `dark:`.

---

## Resumen de Archivos

| # | Archivo | Cambios | Parte |
|:-:|---------|:-------:|:-----:|
| 1 | `frontend/src/hooks/useSessionExpiry.ts` | **Crear** | A |
| 2 | `frontend/src/context/AuthContext.tsx` | Guardar/limpiar timestamp | A |
| 3 | `frontend/src/app/dashboard/layout.tsx` | Invocar hook (wrapper client) | A |
| 4 | `frontend/src/components/auth/LoginForm.tsx` | ~12 clases dark: | B |
| 5 | `frontend/src/app/dashboard/overview/page.tsx` | ~12 clases dark: | B |
| 6 | `frontend/src/components/overview/OverviewCard.tsx` | ~6 clases dark: | B |
| 7 | `frontend/src/components/overview/PDFViewerModal.tsx` | ~10 clases dark: | B |
| 8 | `frontend/src/components/admin/UserForm.tsx` | ~15 clases dark: (constantes + inline) | B |
| 9 | `frontend/src/components/ui/Modal.tsx` | ~4 clases dark: | B |

---

## Orden de Ejecucion

### Parte A: Indicador de Sesion (depende del Plan 06)
```
1. Implementar Plan 06 (Refresh Tokens) primero
2. Crear useSessionExpiry.ts
3. Modificar AuthContext.tsx (guardar timestamp)
4. Crear wrapper client en dashboard layout
5. Probar: login -> esperar (o simular) -> verificar toast
```

### Parte B: Dark Mode (independiente)
```
1. Modificar Modal.tsx (base, afecta todos los modales)
2. Modificar LoginForm.tsx
3. Modificar UserForm.tsx
4. Modificar OverviewCard.tsx
5. Modificar OverviewPage (page.tsx)
6. Modificar PDFViewerModal.tsx
7. Probar: toggle tema en TopBar -> verificar cada pantalla
```

**Nota:** La Parte B puede ejecutarse inmediatamente sin esperar a ninguna otra fase. Es puramente visual y no tiene dependencias de backend.
