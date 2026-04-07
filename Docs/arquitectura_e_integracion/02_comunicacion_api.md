# Comunicacion API: Frontend - Backend

---

## Configuracion del Cliente HTTP

### Axios Instance (frontend/src/lib/axios.ts)

```
Base URL:  NEXT_PUBLIC_API_URL = http://localhost:3001/api
Headers:   Content-Type: application/json
```

### Interceptor de Request
Antes de cada peticion, agrega automaticamente:
```
Authorization: Bearer <token_de_cookie>
```

### Interceptor de Response
En caso de error 401:
1. Limpia cookies de sesion
2. Redirige a `/login`

---

## Patrones de Consumo de API

El frontend usa **dos patrones diferentes** para consumir la API:

### Patron 1: React Query (hooks complejos)

Usado en: `useUsers`, `useAdminReports`, `useChildReports`

```
Caracteristicas:
- Cache automatico con staleTime de 30 segundos
- Retry: 1 intento en caso de error
- Invalidacion de cache tras mutaciones exitosas
- Query keys para identificar y refrescar datos
- useMutation para operaciones POST/PUT/PATCH/DELETE
```

**Ejemplo de flujo:**
```
UserTable renderiza
  -> useUsers() ejecuta useQuery('users', fetchFn)
  -> Si cache valido (<30s): retorna datos cacheados
  -> Si cache expirado: fetch GET /api/users?page=1&limit=10
  -> Almacena en cache con key ['users', queryParams]

UserForm submit
  -> useUsers().createUser ejecuta useMutation
  -> POST /api/users con body
  -> onSuccess: queryClient.invalidateQueries(['users'])
  -> useQuery se re-ejecuta automaticamente
  -> UserTable se actualiza
```

### Patron 2: useState + useEffect (hooks simples)

Usado en: `useReports`, `useAudit`, `useRoles`

```
Caracteristicas:
- Estado manual con useState
- Fetch en useEffect al montar
- Sin cache automatico
- Refetch manual via funcion exportada
```

---

## Mapa de Peticiones Frontend -> Backend

### Autenticacion
| Accion Frontend | Hook/Funcion | Metodo | Endpoint Backend |
|-----------------|-------------|--------|-----------------|
| Login | AuthContext.login() | POST | /api/auth/login |

### Usuarios (Admin)
| Accion Frontend | Hook | Metodo | Endpoint Backend |
|-----------------|------|--------|-----------------|
| Listar usuarios | useUsers (query) | GET | /api/users?page=&limit=&search=&sortBy=&order=&rolId=&activo= |
| Crear usuario | useUsers.createUser | POST | /api/users |
| Editar usuario | useUsers.updateUser | PUT | /api/users/:id |
| Toggle activo | useUsers.toggleActivo | PATCH | /api/users/:id/toggle |

### Reportes
| Accion Frontend | Hook | Metodo | Endpoint Backend |
|-----------------|------|--------|-----------------|
| Cargar reportes (sidebar) | useReports | GET | /api/reports |
| Listar reportes (admin) | useAdminReports (query) | GET | /api/reports/admin?page=&limit=&search=&sortBy=&order=&activo= |
| Cargar sub-reportes | useChildReports (query) | GET | /api/reports/:id/children |
| Crear reporte | useAdminReports.createReport | POST | /api/reports |
| Editar reporte | useAdminReports.updateReport | PUT | /api/reports/:id |
| Toggle activo | useAdminReports.toggleActivo | PATCH | /api/reports/:id/toggle |
| Eliminar reporte | useAdminReports.deleteReport | DELETE | /api/reports/:id |
| Crear sub-reporte | useChildReports.createChild | POST | /api/reports |

### Roles
| Accion Frontend | Hook | Metodo | Endpoint Backend |
|-----------------|------|--------|-----------------|
| Cargar roles | useRoles | GET | /api/roles |

### Auditoria
| Accion Frontend | Hook | Metodo | Endpoint Backend |
|-----------------|------|--------|-----------------|
| Cargar auditoria | useAudit | GET | /api/audit?page=&limit=&search= |
| Registrar visualizacion | useReportTracking | POST | /api/audit/report-time |

### Logs
| Accion Frontend | Hook | Metodo | Endpoint Backend |
|-----------------|------|--------|-----------------|
| Cargar logs | (directo) | GET | /api/logs |

---

## Ciclo de Vida de los Datos (React Query)

```
1. Componente monta
   |
2. useQuery ejecuta fetch
   |
3. Datos llegan -> cache (staleTime: 30s)
   |
4. Componente renderiza con datos
   |
5. Usuario navega y vuelve (< 30s)
   |-> Datos del cache (sin fetch)
   |
6. > 30s pasan -> datos "stale"
   |
7. Componente re-monta -> refetch automatico
   |
8. Mutacion exitosa -> invalidateQueries
   |
9. Refetch forzado -> datos frescos
```

---

## Sincronizacion entre Modulos

### Evento Global: refresh-reports

Cuando el admin crea/edita/elimina un reporte:
1. `useAdminReports` dispara `window.dispatchEvent(new Event('refresh-reports'))`
2. `useReports` (en el sidebar del dashboard) escucha este evento
3. Ejecuta `fetchReports()` para actualizar la lista del sidebar

Esto permite que cambios en la gestion de reportes (admin) se reflejen inmediatamente en el sidebar del dashboard sin recargar la pagina.

---

## Estructura de Peticion Tipica

### Request
```http
GET /api/users?page=1&limit=10&search=admin&sortBy=email&order=asc HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Response Exitosa
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [...],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Response de Error
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```
