# DTOs y Validaciones

---

## DTO Base: PaginationQueryDto

**Archivo:** `src/common/dto/pagination-query.dto.ts`

Base reutilizable para todos los endpoints con paginacion.

| Campo | Tipo | Default | Decoradores | Descripcion |
|-------|------|---------|-------------|-------------|
| `page` | number | 1 | @IsOptional, @Type(Number), @IsInt, @Min(1) | Pagina actual |
| `limit` | number | 5 | @IsOptional, @Type(Number), @IsInt, @Min(1), @Max(100) | Items por pagina |
| `search` | string | - | @IsOptional, @IsString | Texto de busqueda |
| `sortBy` | string | - | @IsOptional, @IsString | Campo de ordenamiento |
| `order` | string | 'asc' | @IsOptional, @IsIn(['asc','desc']) | Direccion del orden |

---

## Respuesta Paginada: PaginatedResponse\<T\>

**Archivo:** `src/common/dto/paginated-response.dto.ts`

```typescript
{
  data: T[],
  meta: {
    total: number,      // Total de registros
    page: number,       // Pagina actual
    limit: number,      // Items por pagina
    totalPages: number  // Total de paginas
  }
}
```

---

## Auth DTOs

### LoginDto

**Archivo:** `src/auth/dto/login.dto.ts`

| Campo | Tipo | Decoradores | Descripcion |
|-------|------|-------------|-------------|
| `email` | string | @IsEmail | Correo electronico del usuario |
| `password` | string | @IsString, @MinLength(6) | Contrasena (min 6 caracteres) |

---

## Users DTOs

### CreateUserDto

**Archivo:** `src/users/dto/create-user.dto.ts`

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `nombreCompleto` | string | Si | @IsString | Nombre completo |
| `email` | string | Si | @IsEmail | Correo electronico |
| `password` | string | Si | @IsString, @MinLength(6) | Contrasena |
| `rolId` | number | Si | @IsInt | ID del rol |
| `activo` | boolean | No | @IsOptional | Estado activo (default: true) |

### UpdateUserDto

**Archivo:** `src/users/dto/update-user.dto.ts`

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `nombreCompleto` | string | No | @IsString, @IsOptional | Nombre completo |
| `email` | string | No | @IsEmail, @IsOptional | Correo electronico |
| `password` | string | No | @IsString, @MinLength(6), @IsOptional | Contrasena (se re-hashea) |
| `rolId` | number | No | @IsInt, @IsOptional | ID del rol |
| `activo` | boolean | No | @IsBoolean, @IsOptional | Estado activo |

### ListUsersQueryDto

**Archivo:** `src/users/dto/list-users-query.dto.ts`  
**Extiende:** PaginationQueryDto

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `rolId` | number | No | @IsOptional, @Type(Number), @IsInt, @Min(1) | Filtrar por rol |
| `activo` | boolean | No | @IsOptional, @Transform, @IsBoolean | Filtrar por estado |

La transformacion de `activo` convierte strings `'true'`/`'false'` a booleanos (necesario porque query params son siempre strings).

---

## Reports DTOs

### CreateReportDto

**Archivo:** `src/reports/dto/create-report.dto.ts`

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `titulo` | string | Si | @IsString | Titulo del reporte |
| `descripcion` | string | No | @IsString, @IsOptional | Descripcion opcional |
| `urlIframe` | string | Si | @IsString | URL del iframe de Looker Studio |
| `rolesIds` | number[] | Si | @IsArray, @IsInt({each}), @ArrayMinSize(1) | Roles con acceso (min 1) |
| `activo` | boolean | No | @IsBoolean, @IsOptional | Estado activo |
| `padreId` | number \| null | No | @IsInt, @IsOptional | ID del reporte padre |

### UpdateReportDto

**Archivo:** `src/reports/dto/update-report.dto.ts`

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `titulo` | string | No | @IsString, @IsOptional | Titulo |
| `urlIframe` | string | No | @IsString, @IsOptional | URL del iframe |
| `descripcion` | string | No | @IsString, @IsOptional | Descripcion |
| `rolesIds` | number[] | No | @IsArray, @IsInt({each}), @IsOptional | Roles con acceso |
| `activo` | boolean | No | @IsBoolean, @IsOptional | Estado activo |
| `padreId` | number \| null | No | @IsInt, @IsOptional | ID del padre |

### ListReportsQueryDto

**Archivo:** `src/reports/dto/list-reports-query.dto.ts`  
**Extiende:** PaginationQueryDto

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `activo` | boolean | No | @IsOptional, @Transform, @IsBoolean | Filtrar por estado |

---

## Audit DTOs

### CreateReportViewDto

**Archivo:** `src/audit/dto/create-report-view.dto.ts`

| Campo | Tipo | Requerido | Decoradores | Descripcion |
|-------|------|:---------:|-------------|-------------|
| `reporteId` | number | Si | @IsInt, @Min(1), @Type(Number) | ID del reporte visualizado |
| `duracion` | number | Si | @IsInt, @Min(1), @Type(Number) | Duracion en segundos |

---

## Comportamiento del ValidationPipe Global

Configurado en `main.ts`:

```typescript
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

| Opcion | Efecto |
|--------|--------|
| `whitelist: true` | Remueve propiedades que no tienen decoradores de validacion |
| `forbidNonWhitelisted: true` | Lanza error 400 si el body contiene propiedades no definidas en el DTO |
| `transform: true` | Convierte automaticamente los payloads al tipo de la clase DTO |

### Ejemplo de Error de Validacion (400)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```
