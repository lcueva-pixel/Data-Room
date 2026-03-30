# 📘 Diccionario y Arquitectura de Datos: Portal Looker Studio

Esta guía detalla el funcionamiento interno de la base de datos (PostgreSQL 18) para el sistema de visualización de reportes. Está diseñada para que cualquier desarrollador pueda entender el flujo de datos y la lógica de permisos desde cero.

---

## 1. Mapa de Relaciones (ERD)
El sistema se basa en un modelo de **Control de Acceso Basado en Roles (RBAC)**. Los usuarios no tienen permisos directos; los heredan de su rol.



---

## 2. Detalle de Tablas y Columnas

### 🏷️ Tabla: `cex_roles`
Es la tabla maestra que define los niveles de jerarquía.
* **`id`**: Identificador único (Clave primaria). Se usa para relacionar el rol con otras tablas.
* **`rol_descripcion`**: Nombre del nivel (ej. 'administrador'). Tiene una restricción `UNIQUE` para evitar duplicidad de cargos.

### 👤 Tabla: `cex_usuarios`
Contiene la información sensible de acceso.
* **`id`**: Identificador único de usuario.
* **`nombre_completo`**: Nombre para mostrar en la interfaz.
* **`email`**: Identificador de inicio de sesión. Es `UNIQUE` (un solo usuario por correo).
* **`password_hash`**: **Crítico.** Almacena la contraseña cifrada mediante algoritmos de una vía (BCrypt/Argon2). Nunca se guarda la clave real.
* **`rol_id`**: Clave foránea que apunta a `cex_roles`. Determina qué puede hacer el usuario.
* **`activo`**: Booleano (`true`/`false`). Permite "banear" o suspender accesos sin borrar al usuario de la historia.
* **`fecha_creacion`**: Timestamp automático para saber la antigüedad de la cuenta.

### 📊 Tabla: `cex_reportes`
Gestiona los enlaces de Looker Studio que se "inyectarán" en el frontend.
* **`id`**: ID del reporte.
* **`titulo`**: Nombre que el usuario verá en el menú.
* **`url_iframe`**: El link de inserción (embed) generado en Looker Studio.
* **`rol_minimo_id`**: Define el umbral de acceso. Si el reporte pide rol 1 (Admin), un usuario con rol 2 (Empleado) no podrá verlo.
* **`activo`**: Permite ocultar reportes por mantenimiento sin borrarlos de la base de datos.

### 🕵️ Tabla: `cex_auditoria_accesos`
Control de seguridad de entradas.
* **`id`**: ID del registro de acceso.
* **`usuario_id`**: Quién inició sesión.
* **`fecha_hora`**: Momento exacto del login (con zona horaria).
* **`ip_address`**: Dirección IP del cliente. Vital para identificar intentos de hackeo o accesos desde ubicaciones no autorizadas.
* **`user_agent`**: Metadata técnica (si entró desde Chrome, Firefox, un iPhone, etc.).

### 📝 Tabla: `cex_log_actividades`
Trazabilidad de acciones dentro del sistema.
* **`accion`**: Verbo que describe el movimiento (ej. 'VER_REPORTE_VENTAS').
* **`detalle`**: Texto descriptivo (ej. 'El usuario abrió el reporte con ID 5').

---

## 3. Flujos Lógicos Didácticos

### A. El Proceso de Seguridad (Password Hashing)
Cuando un usuario crea una cuenta, el flujo **NO** es `Password -> DB`.
El flujo correcto es:
1. El usuario envía `Clave123`.
2. El Backend la mezcla con una "Sal" (Salt) y la encripta: `Clave123` ➔ `$2b$12$R9h/j...`.
3. Se guarda el **Hash** en la columna `password_hash`.
4. Al loguear, el sistema compara el hash guardado con la nueva entrada del usuario.



### B. El Proceso de Visualización de Reportes
¿Cómo sabe la página qué mostrar?
1. El usuario se identifica. El backend obtiene su `rol_id`.
2. El sistema ejecuta un filtro de seguridad:
   > *"Dame todos los reportes donde el nivel requerido sea mayor o igual al nivel del usuario"*
3. El Backend entrega una lista de URLs al Frontend.
4. El Frontend crea un `<iframe>` por cada URL.

---

## 4. Mejores Prácticas de Mantenimiento
* **Borrado Lógico**: Nunca uses `DELETE` en la tabla de usuarios; cambia la columna `activo` a `false`. Esto mantiene la integridad de las tablas de auditoría.
* **Auditoría**: Revisa semanalmente la tabla `cex_auditoria_accesos` para buscar IPs sospechosas.
* **Actualización de Reportes**: Si Looker Studio cambia una URL, solo actualiza la columna `url_iframe` en la tabla `cex_reportes` y el cambio será instantáneo para todos los usuarios.