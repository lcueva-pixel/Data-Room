# Modulo: Usuarios (Users)

---

## Archivos del Modulo

| Archivo | Proposito |
|---------|-----------|
| `src/users/users.module.ts` | Declaracion del modulo |
| `src/users/users.controller.ts` | 5 endpoints CRUD |
| `src/users/users.service.ts` | Logica de negocio |
| `src/users/dto/create-user.dto.ts` | DTO de creacion |
| `src/users/dto/update-user.dto.ts` | DTO de actualizacion |
| `src/users/dto/list-users-query.dto.ts` | DTO de query params |

---

## Configuracion del Modulo

**Guard global del controller:** `@UseGuards(JwtAuthGuard, AdminGuard)`  
Todos los endpoints de este modulo requieren autenticacion JWT y rol de administrador.

---

## Endpoints

### GET /api/users

**Descripcion:** Obtener lista paginada de usuarios con filtros y ordenamiento.

**Query Params (ListUsersQueryDto):**
| Parametro | Tipo | Default | Validacion | Descripcion |
|-----------|------|---------|------------|-------------|
| `page` | number | 1 | Min(1) | Pagina actual |
| `limit` | number | 5 | Min(1), Max(100) | Items por pagina |
| `search` | string | - | Opcional | Busca en nombreCompleto y email (case-insensitive) |
| `sortBy` | string | - | Opcional | Campo de orden: id, nombreCompleto, email, fechaCreacion |
| `order` | string | 'asc' | 'asc' \| 'desc' | Direccion del orden |
| `rolId` | number | - | Opcional, Min(1) | Filtrar por rol |
| `activo` | boolean | - | Opcional | Filtrar por estado activo |

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": 1,
      "nombreCompleto": "Admin",
      "email": "admin@admin.com",
      "rolId": 1,
      "activo": true,
      "fechaCreacion": "2026-01-01T00:00:00.000Z",
      "rol": { "id": 1, "rolDescripcion": "Administrador" }
    }
  ],
  "meta": { "total": 15, "page": 1, "limit": 5, "totalPages": 3 }
}
```

**Logica del servicio:**
- Construye `where` con filtros: search (OR sobre nombreCompleto/email con `contains` mode `insensitive`), rolId, activo
- Valida `sortBy` contra campos permitidos (id, nombreCompleto, email, fechaCreacion)
- Ejecuta `findMany` con `skip`, `take`, `include: { rol: true }`
- Ejecuta `count` con mismos filtros
- Retorna `PaginatedResponse`

---

### POST /api/users

**Descripcion:** Crear un nuevo usuario.

**Body (CreateUserDto):**
| Campo | Tipo | Validacion |
|-------|------|------------|
| `nombreCompleto` | string | @IsString |
| `email` | string | @IsEmail |
| `password` | string | @IsString, @MinLength(6) |
| `rolId` | number | @IsInt |
| `activo` | boolean | @IsOptional |

**Logica:**
1. Hashea password con `bcrypt.hash(password, 10)`
2. Crea usuario con `prisma.user.create()`
3. Retorna `{ message: 'Usuario creado correctamente' }`

---

### PUT /api/users/:id

**Descripcion:** Actualizar un usuario existente.

**Params:** `id` (number, ParseIntPipe)  
**Body (UpdateUserDto):** Todos los campos opcionales.

**Logica:**
1. Construye objeto `data` solo con campos presentes
2. Si `password` esta presente, lo hashea con bcrypt
3. Ejecuta `prisma.user.update({ where: { id }, data })`
4. Retorna `{ message: 'Usuario actualizado correctamente' }`

---

### PATCH /api/users/:id/toggle

**Descripcion:** Alternar el estado activo/inactivo de un usuario.

**Params:** `id` (number, ParseIntPipe)

**Logica:**
1. Busca usuario: `prisma.user.findUniqueOrThrow({ where: { id } })`
2. Invierte el booleano: `prisma.user.update({ activo: !user.activo })`
3. Retorna usuario actualizado con datos de rol

---

### DELETE /api/users/:id

**Descripcion:** Desactivar un usuario (soft delete).

**Params:** `id` (number, ParseIntPipe)

**Logica:**
1. Ejecuta `prisma.user.update({ where: { id }, data: { activo: false } })`
2. Retorna `{ message: 'Usuario desactivado' }`

**Nota:** No elimina el registro fisicamente. Solo establece `activo = false`.
