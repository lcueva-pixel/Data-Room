# Plan de Acción #24 — Fix: `npm run build` — Missing Script

**Fecha:** 2026-05-06
**Rama:** `fix/correccion-codigo-040526`
**Error reportado:** `npm error Missing script: "build"`
**Ruta donde se ejecutó el comando:** `C:\Users\nando\Desktop\Chamba\Data-Room`

---

## Diagnóstico Ejecutado (Pre-Plan)

Antes de redactar este documento se auditaron los archivos del proyecto. Los hallazgos son definitivos:

| Ruta | ¿Tiene `package.json`? | ¿Tiene script `"build"`? |
|------|----------------------|--------------------------|
| `C:\Users\nando\Desktop\Chamba\Data-Room\` | **NO** — no existe ningún `package.json` en la raíz | N/A |
| `C:\Users\nando\Desktop\Chamba\Data-Room\frontend\` | **SÍ** | **SÍ** — `"build": "next build"` |
| `C:\Users\nando\Desktop\Chamba\Data-Room\BACKEND\` | **SÍ** | **SÍ** — `"build": "tsc -p tsconfig.json"` |

**Causa raíz confirmada:** El comando `npm run build` se ejecutó desde la carpeta raíz `Data-Room`, que **no tiene un `package.json`**. npm sube por el árbol de directorios buscando uno; al no encontrar el script `"build"` en ningún `package.json` accesible desde esa ruta, devuelve `Missing script: "build"`. El script sí existe y está correcto — solo se está ejecutando desde el directorio equivocado.

**No se necesita modificar ningún archivo.** El `package.json` del frontend ya tiene el script correcto.

---

## Fase 1 — Diagnóstico del Entorno y Directorios

### 1.1 — Estructura real del proyecto

```
Data-Room/                        ← Aquí se ejecutó el comando (incorrecto)
├── BACKEND/
│   └── package.json              ← Scripts del backend NestJS
├── frontend/
│   └── package.json              ← Scripts del frontend Next.js ← AQUÍ hay "build"
├── Docs/
└── (sin package.json en la raíz)
```

### 1.2 — Por qué ocurre el error exactamente

Cuando npm no encuentra un `package.json` en el directorio actual, busca hacia arriba en el árbol de carpetas. Si en ese recorrido encuentra alguno sin el script solicitado, o si no encuentra ninguno relevante, responde con `Missing script: "build"`. En este caso, la raíz `Data-Room` no tiene `package.json` propio.

### 1.3 — Confirmación de la solución

El frontend vive en el **subdirectorio `/frontend`**. La instrucción de navegación correcta antes de ejecutar cualquier comando de Next.js es:

```powershell
cd C:\Users\nando\Desktop\Chamba\Data-Room\frontend
```

O de forma relativa si ya estás en `Data-Room`:

```powershell
cd frontend
```

---

## Fase 2 — Auditoría del `package.json` del Frontend

### 2.1 — Bloque `"scripts"` actual (ya verificado)

El archivo `frontend/package.json` contiene lo siguiente en su bloque de scripts:

```json
"scripts": {
  "dev":   "next dev -p 3001",
  "build": "next build",
  "start": "next start",
  "lint":  "eslint"
}
```

**Estado:** ✅ El script `"build": "next build"` **ya existe y es correcto**. No se debe agregar ni modificar nada.

### 2.2 — Versión de Next.js

El proyecto usa `"next": "16.2.1"`. El comando `next build` es válido y compatible con esa versión.

---

## Fase 3 — Corrección y Prueba

### 3.1 — Corrección (solo cambio de directorio)

No se necesita tocar ningún archivo. La única acción requerida es situarse en el directorio correcto antes de lanzar el build:

```powershell
# Desde cualquier ubicación:
cd C:\Users\nando\Desktop\Chamba\Data-Room\frontend
npm run build
```

### 3.2 — Qué esperar al ejecutar el build

Next.js 16 ejecuta el compilador y muestra una salida similar a:

```
▲ Next.js 16.2.1

   Creating an optimized production build ...
   Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages ...
   Finalizing page optimization ...

Route (app)                              Size     First Load JS
...
✓ Build completed
```

Si el build termina con `✓ Build completed`, el proceso fue exitoso.

### 3.3 — Errores adicionales posibles durante el build (no del script)

Una vez en el directorio correcto, el build de producción puede revelar errores de TypeScript o ESLint que en modo `dev` se ignoraban. Los más comunes en este proyecto:

| Error potencial | Causa probable | Resolución |
|----------------|---------------|------------|
| TypeScript type errors | Tipos `any` sin declarar o interfaces incompletas | Corregir los tipos o agregar `// @ts-ignore` puntual |
| ESLint warnings as errors | Reglas estrictas de `next/core-web-vitals` | Revisar el output y corregir o ajustar `.eslintrc` |
| Variables de entorno faltantes | `.env.local` no está en producción | Verificar que `NEXT_PUBLIC_API_URL` y `NEXTAUTH_SECRET` estén definidas |

Estos errores son independientes del `Missing script` y se abordarían en un plan separado si aparecen.

---

## Resumen Ejecutivo

| Paso | Acción | Archivo afectado |
|------|--------|-----------------|
| 1 | Navegar a `cd frontend` | Ninguno |
| 2 | Ejecutar `npm run build` | Ninguno |
| 3 | Verificar output `✓ Build completed` | Ninguno |

**El `package.json` del frontend no necesita ninguna modificación.** El script `"build"` existe y es correcto. El error era únicamente de directorio.
