# Contexto del Proyecto Data Room

## Descripción General

Este proyecto está compuesto por un backend (NestJS + Prisma) y un frontend (Next.js). Su objetivo es gestionar usuarios, roles y reportes, permitiendo la visualización y auditoría de información relevante para la organización.

---

## Estructura del Proyecto

- **BACKEND/**: API RESTful construida con NestJS y Prisma ORM.
- **frontend/**: Aplicación web construida con Next.js.
- **Docs/**: Documentación técnica y funcional.
- **nginx/**: Configuración de servidor web.

---

## Funcionamiento General

### Backend
- Expone endpoints para autenticación, gestión de usuarios, roles, reportes y auditoría.
- Utiliza Prisma para interactuar con la base de datos PostgreSQL.
- Los módulos principales son: `auth`, `users`, `roles`, `reports`, `audit`, `log`.

### Frontend
- Consume la API del backend para mostrar y gestionar la información.
- Implementa autenticación, dashboards, gestión de usuarios y reportes.

---

## Generación y Jerarquía de Reportes

### ¿Cómo funciona la creación y almacenamiento de reportes?
El sistema de reportes es jerárquico y flexible, y su información se almacena en la base de datos PostgreSQL usando Prisma. La tabla principal es `Report`, que tiene los siguientes campos clave:

- **id**: Identificador único del reporte.
- **titulo** y **descripcion**: Información básica del reporte.
- **urlIframe**: Aquí se almacena el link del gráfico de Looker Studio que se mostrará embebido en el sistema. Cada reporte puede tener su propio gráfico.
- **padreId**: Permite la relación jerárquica entre reportes. Si es null, el reporte es un padre; si tiene valor, es hijo de otro reporte.
- **activo** y **fechaRegistro**: Control de estado y auditoría.

#### Jerarquía y relaciones
- Un **reporte padre** puede tener múltiples hijos (campo `children`).
- Un **reporte hijo** referencia a su padre mediante `padreId`.
- Los permisos de acceso se gestionan con las tablas intermedias `ReportRole` (por rol) y `ReportUserAccess` (por usuario).

#### Proceso de creación de un reporte
1. Un usuario administrador accede a la sección de reportes y elige “Crear reporte”.
2. Completa los datos: título, descripción, URL del iframe (gráfico de Looker Studio), roles y usuarios con acceso, y opcionalmente selecciona un reporte padre.
3. El backend valida la existencia del padre (si aplica) y que no haya ciclos en la jerarquía.
4. El reporte se guarda en la base de datos con su relación padre-hijo y el link del gráfico.
5. La acción queda registrada en el log de auditoría.

#### Visualización y navegación
- El backend expone endpoints que devuelven la jerarquía completa de reportes como un árbol.
- El frontend muestra este árbol, permitiendo navegar desde los reportes padres hasta los hijos y visualizar los gráficos embebidos (usando el campo `urlIframe`).
- Al seleccionar un reporte, se muestra su gráfico de Looker Studio y se pueden explorar sus hijos.

#### Ejemplo didáctico de flujo
1. El usuario ve el “Reporte General de Accesos” (padre).
2. Al hacer clic, se despliegan los reportes hijos: “Accesos por Usuario”, “Accesos por Fecha”.
3. Si selecciona “Accesos por Usuario”, puede ver hijos aún más específicos, como “Detalle de Accesos de Juan Pérez”.
4. Cada reporte muestra su propio gráfico de Looker Studio embebido.

#### Seguridad y permisos
- Los reportes pueden ser visibles solo para ciertos roles o usuarios, definidos en las tablas de relación.
- El backend filtra los reportes según el rol y usuario autenticado, mostrando solo los permitidos.

#### Resumen técnico
- La jerarquía se almacena mediante el campo `padreId` en la tabla de reportes.
- Los links de los gráficos de Looker Studio se guardan en el campo `urlIframe`.
- El backend arma el árbol de reportes en memoria y lo expone al frontend.
- La creación y edición de reportes valida que no existan ciclos en la jerarquía.
- Todo cambio queda registrado en el log de auditoría.

Este diseño permite crear estructuras de reportes tan profundas y ramificadas como se necesite, cada una con su propio gráfico de Looker Studio, facilitando la organización y el acceso seguro a la información visual.

---

## Auditoría y Logs
- El sistema registra todas las acciones relevantes (accesos, modificaciones, visualizaciones) en los módulos de `audit` y `log`.
- Estos logs pueden ser consultados mediante reportes específicos para auditoría.

---

## Seguridad
- Autenticación basada en JWT.
- Roles y permisos gestionados desde el backend.
- Protección de endpoints sensibles y validación de datos.

---

## Documentación
- La carpeta `Docs/` contiene diagramas, descripciones de módulos, flujos de autenticación y propuestas de mejora.

---

## Despliegue
- El backend puede desplegarse en EC2, GitHub Actions o HTTPS siguiendo las guías en los archivos `DEPLOY_*.md`.
- El frontend se despliega como aplicación Next.js.
- Nginx se utiliza como proxy reverso y para servir archivos estáticos.

---

## Resumen
Este proyecto está diseñado para ser modular, seguro y auditable, permitiendo la gestión eficiente de información y usuarios, así como la generación flexible de reportes y auditorías.
