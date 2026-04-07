# Plan 04: UX/UI — Alertas y Notificaciones

**Alcance:** Confirmaciones destructivas + Toasts globales (Shadcn/ui)  
**Dependencia a instalar:** `sonner` (componente de toast compatible con Shadcn/ui)  
**Archivos afectados:** 10

---

## Parte A: Confirmaciones de Acciones Destructivas

### Problema Actual

Los `ToggleSwitch` en las tablas de usuarios y reportes ejecutan la accion **inmediatamente** al hacer click, sin pedir confirmacion. Un click accidental puede desactivar un usuario o reporte sin aviso.

**Ubicaciones del problema:**
- `UserTable.tsx` lineas 158-161: `onChange={() => onToggleActivo(info.row.original)}`
- `ReportTable.tsx` lineas 186-189: `onChange={() => onToggleActivo(info.row.original)}`

### Archivos a Crear/Modificar

#### A.1 Crear `frontend/src/components/ui/ConfirmDialog.tsx`

**Archivo nuevo.** Componente reutilizable de dialogo de confirmacion.

**Props del componente:**

| Prop | Tipo | Descripcion |
|------|------|-------------|
| `isOpen` | boolean | Controla visibilidad |
| `title` | string | Titulo del dialogo (ej: "Confirmar accion") |
| `message` | string | Mensaje descriptivo (ej: "¿Desactivar al usuario X?") |
| `confirmLabel` | string | Texto del boton de confirmar (ej: "Desactivar") |
| `variant` | `'danger' \| 'warning'` | Color del boton: rojo o amarillo |
| `onConfirm` | `() => void` | Callback al confirmar |
| `onCancel` | `() => void` | Callback al cancelar |

**Estructura visual:**
```
+---------------------------------------+
|  [!] Confirmar accion                  |
|                                        |
|  ¿Estas seguro de que deseas           |
|  desactivar al usuario Juan Perez?     |
|  Esta accion impedira que el usuario   |
|  acceda al sistema.                    |
|                                        |
|           [Cancelar]  [Desactivar]     |
+---------------------------------------+
```

**Enfoque tecnico:**
- Reutilizar el patron del componente `Modal.tsx` existente (overlay, escape, click fuera)
- **No** usar el componente `Modal` directamente porque el ConfirmDialog es mas pequeno y tiene layout de botones en footer
- Icono `AlertTriangle` de Lucide en el header
- Boton de cancelar: gris, sin borde prominente
- Boton de confirmar: `bg-red-600 hover:bg-red-700` (danger) o `bg-amber-500 hover:bg-amber-600` (warning)
- Ambos botones con `min-h-[44px]` para accesibilidad tactil
- Soporte dark mode
- Cerrar con Escape y click fuera del panel

#### A.2 Modificar `frontend/src/components/admin/UserTable.tsx`

**Estado actual relevante:**
- Lineas 155-162: Columna `activo` con `ToggleSwitch` que ejecuta `onToggleActivo` directamente

**Cambios:**

1. **Imports:** Agregar `import { ConfirmDialog } from '@/components/ui/ConfirmDialog';`
2. **Agregar estado local** dentro del componente `UserTable`:
   ```typescript
   const [confirmUser, setConfirmUser] = useState<User | null>(null);
   ```
3. **Cambiar el handler del ToggleSwitch** (linea 160):
   ```typescript
   // ANTES:
   onChange={() => onToggleActivo(info.row.original)}
   // DESPUES:
   onChange={() => setConfirmUser(info.row.original)}
   ```
4. **Agregar ConfirmDialog** al final del JSX retornado (antes del cierre del `<div>` raiz):
   ```tsx
   <ConfirmDialog
     isOpen={!!confirmUser}
     title="Confirmar cambio de estado"
     message={
       confirmUser
         ? `¿Deseas ${confirmUser.activo ? 'desactivar' : 'activar'} al usuario "${confirmUser.nombreCompleto}"?`
         : ''
     }
     confirmLabel={confirmUser?.activo ? 'Desactivar' : 'Activar'}
     variant={confirmUser?.activo ? 'danger' : 'warning'}
     onConfirm={() => {
       if (confirmUser) onToggleActivo(confirmUser);
       setConfirmUser(null);
     }}
     onCancel={() => setConfirmUser(null)}
   />
   ```

#### A.3 Modificar `frontend/src/components/admin/ReportTable.tsx`

**Cambio identico** en patron al UserTable:

1. Importar `ConfirmDialog`
2. Agregar estado `confirmReport` de tipo `Report | null`
3. Cambiar handler del ToggleSwitch (linea 188) a `setConfirmReport(info.row.original)`
4. Agregar `ConfirmDialog` con mensaje adaptado:
   ```
   "¿Deseas ${report.activo ? 'desactivar' : 'activar'} el reporte '${report.titulo}'?"
   ```

---

## Parte B: Notificaciones Globales (Toast)

### Problema Actual

- Solo `UserForm` muestra un banner de exito al crear usuario (estado local, desaparece a los 3s)
- Las mutaciones de toggle, delete, create reporte NO dan feedback visual
- Los errores de API se silencian en la mayoria de los hooks

### Dependencia

```bash
cd frontend
npm install sonner
```

**Nota sobre Shadcn/ui:** `sonner` es el componente de toast **recomendado oficialmente por Shadcn/ui** (documentado en ui.shadcn.com/docs/components/sonner). Es la implementacion mas ligera sin necesidad de instalar toda la suite Shadcn. La API es identica: `toast.success('Mensaje')`.

### Archivos a Modificar

#### B.1 `frontend/src/components/Providers.tsx`

**Estado actual (29 lineas):**
```typescript
// linea 3: import { ThemeProvider } from 'next-themes';
// linea 26: <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
```

**Cambios:**

- **Agregar import:**
  ```typescript
  import { Toaster } from 'sonner';
  ```

- **Agregar `<Toaster>` como ultimo hijo** dentro del `<QueryClientProvider>` (despues de `{children}`, antes del cierre):
  ```tsx
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster position="top-right" richColors closeButton />
  </QueryClientProvider>
  ```

**Props de Toaster:**
| Prop | Valor | Efecto |
|------|-------|--------|
| `position` | `"top-right"` | Toasts aparecen arriba a la derecha |
| `richColors` | `true` | Colores diferenciados por tipo (verde exito, rojo error, amarillo warning) |
| `closeButton` | `true` | Boton X para cerrar manualmente |

#### B.2 `frontend/src/hooks/useUsers.ts`

**Estado actual:**
- Lineas 45-49: `createMutation` con `onSuccess: invalidate`
- Lineas 51-55: `updateMutation` con `onSuccess: invalidate`
- Lineas 57-61: `toggleMutation` con `onSuccess: invalidate`

**Cambios:**

- **Agregar import:**
  ```typescript
  import { toast } from 'sonner';
  ```

- **Agregar `onSuccess` y `onError` a cada mutacion:**

  ```typescript
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      api.post('/users', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      api.put(`/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al actualizar usuario');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) =>
      api.patch<User>(`/users/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Estado del usuario actualizado');
    },
    onError: () => {
      toast.error('Error al cambiar estado del usuario');
    },
  });
  ```

#### B.3 `frontend/src/hooks/useAdminReports.ts`

**Mismo patron.** Agregar `import { toast } from 'sonner'` y modificar las 4 mutaciones:

| Mutacion | Toast de exito | Toast de error |
|----------|---------------|----------------|
| `createMutation` | "Reporte creado exitosamente" | Error del backend o generico |
| `updateMutation` | "Reporte actualizado exitosamente" | Error del backend o generico |
| `toggleMutation` | "Estado del reporte actualizado" | "Error al cambiar estado del reporte" |
| `deleteMutation` | "Reporte eliminado exitosamente" | "Error al eliminar reporte" |

#### B.4 `frontend/src/components/admin/UserForm.tsx`

**Estado actual:** Tiene un banner de exito con estado local (`showSuccess`) que se muestra 3 segundos.

**Cambio:** Eliminar el banner de exito local y reemplazar por `toast.success()` que ya se dispara desde el hook. Esto simplifica el componente.

- Eliminar estado `showSuccess` y el `useEffect` que lo controla
- Eliminar el JSX del banner verde de exito
- El toast se dispara automaticamente desde `useUsers.createMutation.onSuccess`

#### B.5 `frontend/src/components/admin/ReportForm.tsx`

**Mismo enfoque:** Si tiene banner de exito local, reemplazar por el toast del hook. Si no tiene, no requiere cambio adicional (el toast viene del hook).

---

## Mensajes Completos de Toast

| Accion | Tipo | Mensaje |
|--------|:----:|---------|
| Crear usuario | success | "Usuario creado exitosamente" |
| Actualizar usuario | success | "Usuario actualizado exitosamente" |
| Toggle usuario | success | "Estado del usuario actualizado" |
| Crear reporte | success | "Reporte creado exitosamente" |
| Actualizar reporte | success | "Reporte actualizado exitosamente" |
| Toggle reporte | success | "Estado del reporte actualizado" |
| Eliminar reporte | success | "Reporte eliminado exitosamente" |
| Error 400 (validacion) | error | Mensajes del backend concatenados |
| Error generico | error | "Error al {accion}" |

---

## Resumen de Archivos

| # | Archivo | Accion |
|:-:|---------|--------|
| 1 | `frontend/src/components/ui/ConfirmDialog.tsx` | **Crear** |
| 2 | `frontend/src/components/admin/UserTable.tsx` | Modificar (ConfirmDialog antes de toggle) |
| 3 | `frontend/src/components/admin/ReportTable.tsx` | Modificar (ConfirmDialog antes de toggle) |
| 4 | `frontend/src/components/Providers.tsx` | Modificar (agregar Toaster de sonner) |
| 5 | `frontend/src/hooks/useUsers.ts` | Modificar (toast en onSuccess/onError) |
| 6 | `frontend/src/hooks/useAdminReports.ts` | Modificar (toast en onSuccess/onError) |
| 7 | `frontend/src/components/admin/UserForm.tsx` | Modificar (eliminar banner local) |
| 8 | `frontend/src/components/admin/ReportForm.tsx` | Modificar (si aplica) |
| 9 | `frontend/package.json` | Modificar (agregar sonner) |

## Orden de Ejecucion

```
1. npm install sonner
2. Modificar Providers.tsx (agregar <Toaster>)
3. Crear ConfirmDialog.tsx
4. Modificar UserTable.tsx (ConfirmDialog)
5. Modificar ReportTable.tsx (ConfirmDialog)
6. Modificar useUsers.ts (toasts)
7. Modificar useAdminReports.ts (toasts)
8. Modificar UserForm.tsx (eliminar banner local)
9. Verificar flujo completo en navegador
```
