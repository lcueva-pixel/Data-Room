# Modulo: Roles

---

## Archivos del Modulo

| Archivo | Proposito |
|---------|-----------|
| `src/roles/roles.module.ts` | Declaracion del modulo |
| `src/roles/roles.controller.ts` | 1 endpoint GET |
| `src/roles/roles.service.ts` | Consulta de roles |

---

## Configuracion

**Guard global del controller:** `@UseGuards(JwtAuthGuard, AdminGuard)`  
Solo administradores pueden consultar los roles.

---

## Endpoint

### GET /api/roles

**Guard:** JwtAuthGuard + AdminGuard

**Descripcion:** Obtener la lista completa de roles del sistema.

**Logica:** `prisma.role.findMany()`

**Respuesta (200):**
```json
[
  { "id": 1, "rolDescripcion": "Administrador" },
  { "id": 2, "rolDescripcion": "Empleado" }
]
```

---

## Rol Especial: Administrador

El rol con `id = 1` tiene un significado especial en el sistema:

| Contexto | Comportamiento |
|----------|---------------|
| `AdminGuard` | Verifica `rol_id === 1` para acceso a rutas admin |
| `ReportsService.findByRole()` | Si `rolId = 1`, retorna todos los reportes sin filtrar por asignacion |
| Frontend `proxy.ts` | Verifica `rol_id === '1'` para acceso a rutas `/dashboard/admin/*` |
| Frontend `Sidebar` | Muestra seccion de administracion solo si `rolId === 1` |
| Frontend `TopBar` | Muestra "Administrador" como label del rol |

Este valor esta **hardcodeado** en multiples puntos del sistema. Un cambio en la estructura de roles requeriria actualizar estos archivos.
