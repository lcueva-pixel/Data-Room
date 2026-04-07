# Modulo: Gestion de Usuarios (Admin)

**Acceso:** Solo administradores (rol_id = 1)  
**Ruta:** `/dashboard/admin/users`

---

## Archivos Involucrados

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| Users Page | `src/app/dashboard/admin/users/page.tsx` | Pagina de gestion de usuarios |
| Admin Layout | `src/app/dashboard/admin/layout.tsx` | Layout con guard de rol admin |
| UserTable | `src/components/admin/UserTable.tsx` | Tabla de usuarios con filtros |
| UserForm | `src/components/admin/UserForm.tsx` | Formulario crear/editar usuario |
| Modal | `src/components/ui/Modal.tsx` | Componente modal reutilizable |
| ToggleSwitch | `src/components/ui/ToggleSwitch.tsx` | Switch de activar/desactivar |
| useUsers | `src/hooks/useUsers.ts` | Hook CRUD con React Query |
| useRoles | `src/hooks/useRoles.ts` | Hook de listado de roles |

---

## Layout Admin (Guard de Rol)

**Archivo:** `src/app/dashboard/admin/layout.tsx`

Antes de renderizar cualquier pagina admin:
1. Lee `rolId` desde cookies con `getRolId()`
2. Si `rolId !== 1`, redirige automaticamente a `/dashboard`
3. Renderiza Sidebar + TopBar + contenido

---

## Pagina de Usuarios

**Archivo:** `src/app/dashboard/admin/users/page.tsx`

### Estados
| Estado | Tipo | Proposito |
|--------|------|-----------|
| `isModalOpen` | boolean | Controla visibilidad del modal |
| `editingUser` | User \| null | Usuario en edicion (null = crear nuevo) |

### Flujo
1. Renderiza `UserTable` con datos del hook `useUsers`
2. Boton "Nuevo usuario" abre el modal con `UserForm` vacio
3. Click en "Editar" en la tabla abre el modal con datos pre-rellenados
4. Al completar la accion (crear/editar), cierra el modal y la tabla se refresca automaticamente

---

## UserTable - Tabla de Usuarios

**Archivo:** `src/components/admin/UserTable.tsx`

### Columnas

| Columna | Campo | Sortable | Descripcion |
|---------|-------|:--------:|-------------|
| ID | `id` | No | Numero identificador |
| Nombre | `nombreCompleto` | Si | Nombre completo con icono de usuario |
| Email | `email` | Si | Correo electronico |
| Rol | `rol.rolDescripcion` | No | Badge con color segun rol |
| Estado | `activo` | No | ToggleSwitch para activar/desactivar |
| Acciones | - | No | Boton de editar (icono Pencil) |

### Funcionalidades

**Busqueda:**
- Campo de texto con debounce de 300ms
- Busca en nombre completo y email (filtrado en backend)
- Resetea la pagina a 1 al buscar

**Filtros:**
- **Filtro por rol:** Dropdown con roles cargados desde `useRoles`
- **Filtro por estado:** Dropdown (Todos / Activos / Inactivos)

**Ordenamiento:**
- Click en cabecera de Nombre o Email para ordenar asc/desc
- Icono ArrowUpDown indica columna sortable

**Paginacion:**
- Muestra "Pagina X de Y"
- Botones Anterior/Siguiente
- Limite fijo de 10 items por pagina

**Loading:**
- Skeleton de 5 filas con animacion pulse durante carga

---

## UserForm - Formulario de Usuario

**Archivo:** `src/components/admin/UserForm.tsx`

### Campos

| Campo | Tipo | Requerido | Validacion |
|-------|------|:---------:|------------|
| Nombre completo | text | Si | Minimo 1 caracter |
| Email | email | Si | Formato email valido |
| Contrasena | password | Solo al crear | Min 6 chars, 1 mayuscula, 1 numero |
| Confirmar contrasena | password | Cuando hay password | Debe coincidir con contrasena |
| Rol | select | Si | Seleccionar de lista |
| Activo | checkbox | No | Default: true |

### Validacion Zod

```
Password:
- Minimo 6 caracteres
- Al menos 1 letra mayuscula (regex: /[A-Z]/)
- Al menos 1 numero (regex: /[0-9]/)
- Mensaje personalizado por cada regla incumplida

Confirm Password:
- Debe ser igual al campo password (refine)
```

### Comportamiento Crear vs Editar

| Aspecto | Modo Crear | Modo Editar |
|---------|-----------|-------------|
| Password | Obligatorio | Opcional (campo vacio = no cambiar) |
| Email | Vacio | Pre-rellenado |
| Rol | Default: primer rol | Pre-seleccionado |
| Activo | Default: true | Estado actual |
| Banner exito | "Usuario creado correctamente" | No se muestra |

### Flujo de Submit
1. Valida con Zod
2. Construye payload (omite password si esta vacio en edicion)
3. Llama `onSubmit(payload)` que ejecuta `createUser` o `updateUser` del hook
4. En creacion exitosa, muestra banner verde por 3 segundos
5. Cierra el modal

---

## Hook: useUsers

**Archivo:** `src/hooks/useUsers.ts`

### Endpoint
`GET /api/users` con query params de paginacion, busqueda, filtros y ordenamiento.

### Estado Interno
| Estado | Default | Descripcion |
|--------|---------|-------------|
| `page` | 1 | Pagina actual |
| `limit` | 10 | Items por pagina |
| `search` | '' | Texto de busqueda |
| `sortBy` | '' | Campo de ordenamiento |
| `order` | 'asc' | Direccion del orden |
| `rolId` | undefined | Filtro por rol |
| `activo` | undefined | Filtro por estado |

### Mutaciones
| Mutacion | Metodo HTTP | Endpoint | Post-accion |
|----------|------------|----------|-------------|
| `createUser` | POST | `/users` | Invalida cache 'users' |
| `updateUser` | PUT | `/users/{id}` | Invalida cache 'users' |
| `toggleActivo` | PATCH | `/users/{id}/toggle` | Invalida cache 'users' |

### Retorno
```typescript
{
  users: User[]
  meta: PaginatedMeta
  isLoadingList: boolean
  query: { page, limit, search, sortBy, order, filters }
  setPage, setSearch, setSorting, setFilters
  createUser, updateUser, toggleActivo
}
```

---

## Hook: useRoles

**Archivo:** `src/hooks/useRoles.ts`

### Endpoint
`GET /api/roles`

### Retorno
| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `roles` | `Role[]` | Lista de roles disponibles |
| `isLoading` | `boolean` | Estado de carga |

Se usa en `UserForm` para el dropdown de seleccion de rol y en `UserTable` para el filtro por rol.
