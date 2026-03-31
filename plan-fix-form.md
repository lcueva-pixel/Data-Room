# Plan de Acción — Fix: `<form>` anidado dentro de `<form>`

## Análisis del problema

El error `In HTML, <form> cannot be a descendant of <form>` ocurre por la siguiente cadena en el DOM:

```
Modal de edición (reports/page.tsx)
  └── <ReportForm> ← FORM #1 (<form onSubmit={...}>)
        ├── campos: título, URL, roles, activo...
        ├── botones: Cancelar / Actualizar
        └── <ChildReportsSection>    ← DENTRO del <form>
              └── Modal secundario (isOpen={showChildForm})
                    └── <ReportForm> ← FORM #2 (<form onSubmit={...}>)
                          └── campos del sub-reporte
```

**Archivo raíz del problema:** `ReportForm.tsx` líneas 185–189.

La sección `<ChildReportsSection>` se renderiza **dentro** de la etiqueta `<form>` de `ReportForm`. Cuando el usuario hace clic en "+ Agregar Sub-reporte", `ChildReportsSection` monta un `<Modal>` que contiene **otro** `<ReportForm>` (con su propio `<form>`).

Aunque el `<Modal>` usa `position: fixed` (visualmente separado), en el DOM sigue siendo hijo del `<form>` padre porque React monta los hijos donde están declarados en JSX, no donde aparecen visualmente.

---

## Solución elegida: Opción A — Sacar `ChildReportsSection` fuera del `<form>`

La solución más simple y limpia es dividir `ReportForm.tsx` en dos zonas:
1. La etiqueta `<form>` con los campos editables
2. La sección de sub-reportes **después** del `</form>`, al mismo nivel

### Estructura JSX resultante

```tsx
// ReportForm.tsx — estructura después del fix
return (
  <>
    {/* ── Zona 1: Formulario del reporte ────────────────── */}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* título, URL, descripción, roles, activo */}
      {/* botones Cancelar / Guardar */}
    </form>

    {/* ── Zona 2: Sub-reportes (FUERA del form) ─────────── */}
    {isEditing && !lockedParentId && (
      <>
        <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4" />
        <ChildReportsSection
          parentId={initialValues.id}
          parentTitle={initialValues.titulo}
        />
      </>
    )}
  </>
);
```

De esta forma el DOM queda:

```
Modal de edición
  └── <div> (body del Modal)
        ├── <form>               ← FORM #1 (edición del padre)
        │     ├── campos...
        │     └── botones
        ├── <hr> separador
        └── <ChildReportsSection> ← FUERA del form
              └── Modal secundario (portal visual, fixed)
                    └── <form>   ← FORM #2 (creación del hijo)
                          └── campos del sub-reporte
```

**No hay `<form>` anidados.** Ambos formularios son hermanos en el DOM.

---

## Pasos de implementación

### Paso 1 — Modificar `ReportForm.tsx`

Mover el bloque `{isEditing && !lockedParentId && (...)}` que contiene `<ChildReportsSection>` **después** del cierre de `</form>`, envolviéndolo todo en un Fragment `<>...</>`:

```
Antes:  <form> ... <ChildReportsSection/> ... </form>
Después: <> <form> ... </form>  <ChildReportsSection/> </>
```

**Archivos afectados:** solo `ReportForm.tsx`.

**Cambio exacto:**
- Línea actual ~185: el separador `<div className="border-t ...">` y `<ChildReportsSection>` están antes de `</form>`.
- Moverlos después de `</form>`.
- El `return` actual devuelve `<form>...</form>`. Cambiarlo a `<>...</>` para poder retornar el form + la sección como hermanos.

### Paso 2 — Verificar que `parentId` sigue llegando

No se requiere cambio: `ChildReportsSection` recibe `parentId` como prop directa, no depende de estar dentro del `<form>`. Al moverlo fuera, las props no cambian.

### Paso 3 — Verificar reactividad del Sidebar

No se requiere cambio: `ChildReportsSection` → `useChildReports` → al crear con éxito invalida `['admin-reports']`, y `ReportForm` ya dispara `window.dispatchEvent(new Event('refresh-reports'))` en `onSuccess`. El Sidebar escucha ese evento para refrescar la lista con los nuevos hijos.

---

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `frontend/src/components/admin/ReportForm.tsx` | Mover `<ChildReportsSection>` fuera del `<form>`, envolver return en Fragment |

**Ningún otro archivo necesita cambios.** El fix es de 1 solo archivo, ~5 líneas movidas de posición.
