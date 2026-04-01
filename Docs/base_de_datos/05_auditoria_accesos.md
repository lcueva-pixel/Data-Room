# Tabla: cex_auditoria_accesos

**Modelo Prisma:** `AuditAccess`  
**Esquema:** public  
**Base de datos:** PostgreSQL

---

## Proposito

La tabla `cex_auditoria_accesos` registra cada inicio de sesion exitoso en el sistema. Funciona como un log de auditoria de accesos que permite rastrear cuando y desde donde accedio cada usuario. Almacena la informacion del navegador (User-Agent) para identificar el dispositivo utilizado.

---

## Estructura de Columnas

| Columna BD | Campo Prisma | Tipo de Dato | PK | FK | Unico | Opcional | Default | Descripcion |
|-----------|-------------|-------------|:--:|:--:|:-----:|:--------:|---------|-------------|
| `id` | `id` | `INTEGER` | Si | No | Si (PK) | No | `autoincrement()` | Identificador unico del registro de acceso |
| `usuario_id` | `usuarioId` | `INTEGER` | No | Si | No | No | - | FK al usuario que inicio sesion |
| `fecha_hora` | `fechaHora` | `TIMESTAMPTZ` | No | No | No | No | `now()` | Fecha y hora exacta del inicio de sesion con zona horaria |
| `user_agent` | `userAgent` | `TEXT` | No | No | No | Si | `null` | Cadena User-Agent del navegador del usuario. Permite identificar navegador, sistema operativo y dispositivo |

---

## Relaciones

| Relacion | Tabla Relacionada | Tipo | Campo FK | Descripcion |
|----------|------------------|------|----------|-------------|
| `usuario` | `cex_usuarios` (User) | Muchos a Uno (N:1) | `usuario_id -> User.id` | Referencia al usuario que realizo el acceso |

---

## Indices y Restricciones

| Tipo | Columna(s) | Descripcion |
|------|-----------|-------------|
| PRIMARY KEY | `id` | Clave primaria autoincremental |
| FOREIGN KEY | `usuario_id` | Referencia a `cex_usuarios.id` |

---

## Flujo de Registro

1. El usuario envia sus credenciales al endpoint `POST /api/auth/login`.
2. El `AuthService.validateUser()` verifica email y password.
3. Si la autenticacion es exitosa, se crea automaticamente un registro en esta tabla con:
   - `usuarioId`: ID del usuario autenticado
   - `userAgent`: Extraido del header `User-Agent` de la peticion HTTP
   - `fechaHora`: Generado automaticamente por la BD
4. Este registro se muestra en la vista de auditoria del administrador con tipo `ACCESO`.

---

## Notas de Negocio

- Solo se registran accesos **exitosos**. Los intentos fallidos de login no generan registro en esta tabla.
- Los registros son de solo escritura; no se actualizan ni eliminan.
- En la vista de auditoria del frontend, estos registros se muestran con un badge de tipo "ACCESO" y un icono de LogIn.
- La tabla crece de forma continua y no tiene mecanismo de purgado automatico.
- Actualmente la información de la columna `user_agent` no se muestra en ninguna tabla del frontend
