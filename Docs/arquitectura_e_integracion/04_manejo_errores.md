# Manejo de Errores Full-Stack

---

## Errores del Backend (NestJS)

### Excepciones HTTP de NestJS

| Excepcion | Codigo | Donde se usa | Mensaje |
|-----------|:------:|-------------|---------|
| `UnauthorizedException` | 401 | AuthService.validateUser() | "Credenciales invalidas" |
| `ForbiddenException` | 403 | AdminGuard | "Solo el administrador puede realizar esta accion" |
| `NotFoundException` | 404 | AuditController (reporte no existe) | Variable |
| `BadRequestException` | 400 | ValidationPipe (automatico) | Array de mensajes de validacion |

### Errores de Validacion (ValidationPipe)

Cuando el body o query params no cumplen las reglas del DTO:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters",
    "property extraField should not exist"
  ],
  "error": "Bad Request"
}
```

**Disparados por:**
- `whitelist: true` -> Remueve campos no declarados
- `forbidNonWhitelisted: true` -> Lanza error si envian campos extra
- Decoradores: `@IsEmail`, `@MinLength`, `@IsInt`, `@Min`, `@Max`, `@ArrayMinSize`, etc.

### Errores de Prisma

| Error | Escenario | Comportamiento |
|-------|-----------|---------------|
| `findUniqueOrThrow` no encuentra | Toggle/update con ID inexistente | Error 500 (no manejado explicitamente) |
| Unique constraint violation | Email duplicado al crear usuario | Error 500 con mensaje de Prisma |
| Foreign key violation | rolId inexistente | Error 500 con mensaje de Prisma |

**Nota:** Algunos errores de Prisma no estan mapeados a excepciones HTTP especificas y pueden resultar en errores 500 genericos.

---

## Errores del Frontend

### Interceptor de Axios (Global)

**Archivo:** `frontend/src/lib/axios.ts`

| Codigo HTTP | Accion del Interceptor |
|:-----------:|----------------------|
| 401 | `clearSession()` + redirect a `/login` |
| Otros | `Promise.reject(error)` (propaga al caller) |

### Manejo en LoginForm

```typescript
try {
  await login({ email, password });
} catch (err) {
  const msg = err?.response?.data?.message;
  setError(typeof msg === 'string' ? msg : 'Credenciales incorrectas. Intenta de nuevo.');
}
```

- Si el backend retorna un `message` string: lo muestra tal cual
- Si no hay mensaje o es un array: muestra mensaje generico

### Manejo en Hooks con React Query

```typescript
useMutation({
  mutationFn: (payload) => api.post('/users', payload),
  onSuccess: () => {
    queryClient.invalidateQueries(['users']);
  },
  // onError no definido -> error se propaga al componente
})
```

Los errores de mutacion se manejan en el componente que invoca la mutacion (try/catch en el submit handler del formulario).

### Manejo en Hooks con useState

```typescript
try {
  const response = await api.get('/reports');
  setReports(response.data);
} catch {
  setError('No se pudieron cargar los reportes. Verifica tu conexion.');
}
```

Los errores se capturan y se almacenan en estado local para mostrar en la UI.

### Tracking de Reportes (Silencioso)

```typescript
fetch(url, { keepalive: true }).catch(() => {
  // Telemetria silenciosa - los errores no interrumpen la UI
});
```

Los errores de tracking se ignoran porque es telemetria no critica.

---

## Tabla de Codigos HTTP Utilizados

| Codigo | Significado | Origen | Accion del Frontend |
|:------:|------------|--------|-------------------|
| 200 | Exito | Cualquier GET/PUT/PATCH exitoso | Procesa datos normalmente |
| 201 | Creado | POST exitoso | Procesa datos normalmente |
| 400 | Bad Request | ValidationPipe | Muestra errores de validacion |
| 401 | Unauthorized | JwtAuthGuard / Token expirado | Limpia sesion, redirect login |
| 403 | Forbidden | AdminGuard | Muestra error (acceso denegado) |
| 404 | Not Found | Reporte inexistente en audit | Muestra error |
| 500 | Internal Error | Errores no manejados de Prisma | Error generico |

---

## Flujo de Error Tipico

```
Frontend                         Backend                         BD
   |                                |                             |
   | POST /api/users               |                             |
   | { email: "invalido" }         |                             |
   |------------------------------->|                             |
   |                                |                             |
   |                          ValidationPipe                      |
   |                          @IsEmail() falla                    |
   |                                |                             |
   |<-------------------------------|                             |
   | 400 { message: ["email must   |                             |
   |   be an email"] }              |                             |
   |                                |                             |
   | UserForm muestra error         |                             |
   | en campo de email              |                             |
```
