# Mapa Completo de Endpoints: Frontend - Backend

---

## Tabla Cruzada

| # | Endpoint Backend | Metodo | Frontend Hook/Funcion | Componente que lo usa | Guard | Body/Query |
|:-:|-----------------|--------|----------------------|----------------------|-------|------------|
| 1 | `/api/auth/login` | POST | `AuthContext.login()` | LoginForm | Ninguno | Body: LoginDto |
| 2 | `/api/users` | GET | `useUsers` (React Query) | UserTable | JWT+Admin | Query: ListUsersQueryDto |
| 3 | `/api/users` | POST | `useUsers.createUser` | UserForm | JWT+Admin | Body: CreateUserDto |
| 4 | `/api/users/:id` | PUT | `useUsers.updateUser` | UserForm | JWT+Admin | Body: UpdateUserDto |
| 5 | `/api/users/:id/toggle` | PATCH | `useUsers.toggleActivo` | UserTable (ToggleSwitch) | JWT+Admin | - |
| 6 | `/api/reports` | GET | `useReports` (useState) | Sidebar, DashboardPage | JWT | - |
| 7 | `/api/reports/admin` | GET | `useAdminReports` (React Query) | ReportTable | JWT+Admin | Query: ListReportsQueryDto |
| 8 | `/api/reports/:id/children` | GET | `useChildReports` (React Query) | ChildReportsSection | JWT+Admin | - |
| 9 | `/api/reports` | POST | `useAdminReports.createReport` | ReportForm | JWT+Admin | Body: CreateReportDto |
| 10 | `/api/reports/:id` | PUT | `useAdminReports.updateReport` | ReportForm | JWT+Admin | Body: UpdateReportDto |
| 11 | `/api/reports/:id/toggle` | PATCH | `useAdminReports.toggleActivo` | ReportTable (ToggleSwitch) | JWT+Admin | - |
| 12 | `/api/reports/:id` | DELETE | `useAdminReports.deleteReport` | ReportTable | JWT+Admin | - |
| 13 | `/api/roles` | GET | `useRoles` (useState) | UserForm, ReportForm | JWT+Admin | - |
| 14 | `/api/audit` | GET | `useAudit` (useState) | AuditTable | JWT+Admin | Query: PaginationQueryDto |
| 15 | `/api/audit/report-time` | POST | `useReportTracking` (fetch) | ReportViewer | JWT | Body: CreateReportViewDto |
| 16 | `/api/logs` | GET | (directo) | - | JWT | - |

---

## Agrupacion por Modulo

### Autenticacion
```
POST /api/auth/login
  Frontend: AuthContext.login() -> LoginForm
  Backend:  AuthController -> AuthService.validateUser() + login()
  BD:       SELECT cex_usuarios, INSERT cex_auditoria_accesos
```

### Usuarios
```
GET    /api/users          -> useUsers query    -> UserTable
POST   /api/users          -> useUsers.create   -> UserForm (crear)
PUT    /api/users/:id      -> useUsers.update   -> UserForm (editar)
PATCH  /api/users/:id/toggle -> useUsers.toggle -> UserTable (switch)
```

### Reportes
```
GET    /api/reports              -> useReports         -> Sidebar + Dashboard
GET    /api/reports/admin        -> useAdminReports    -> ReportTable
GET    /api/reports/:id/children -> useChildReports    -> ChildReportsSection
POST   /api/reports              -> useAdminReports.create -> ReportForm
PUT    /api/reports/:id          -> useAdminReports.update -> ReportForm
PATCH  /api/reports/:id/toggle   -> useAdminReports.toggle -> ReportTable
DELETE /api/reports/:id          -> useAdminReports.delete -> ReportTable
```

### Roles
```
GET /api/roles -> useRoles -> UserForm (dropdown), ReportForm (checkboxes)
```

### Auditoria
```
GET  /api/audit            -> useAudit           -> AuditTable
POST /api/audit/report-time -> useReportTracking -> ReportViewer (automatico)
```

### Logs
```
GET /api/logs -> (uso directo) -> sin componente dedicado actualmente
```

---

## Flujo de Datos por Funcionalidad

### Login
```
[LoginForm] --(email, password)--> POST /api/auth/login
            <--(access_token, rol_id)--
            --> saveSession(cookies)
            --> redirect /dashboard/overview
```

### Dashboard - Carga de Reportes
```
[DashboardPage] --> useReports --> GET /api/reports
                <-- reports[] (filtrados por rol)
                --> setSelectedReport(reports[0])
                --> [Sidebar] renderiza arbol
                --> [ReportViewer] carga iframe
```

### Admin - CRUD de Usuario
```
[UserTable] --> useUsers --> GET /api/users?page=1&limit=10
            <-- { data: users[], meta }
            --> Renderiza tabla

[UserForm] --> useUsers.createUser --> POST /api/users { body }
           <-- { message: "Usuario creado" }
           --> invalidateQueries('users')
           --> UserTable se refresca automaticamente
```

### Tracking de Visualizacion
```
[ReportViewer monta] --> useReportTracking(reportId)
                      --> startTime = Date.now()

[ReportViewer desmonta o beforeunload]
  --> duracion = (now - startTime) / 1000
  --> if duracion >= 3s:
      --> fetch POST /api/audit/report-time
          { reporteId, duracion }
```

---

## Endpoints No Utilizados Actualmente

| Endpoint | Estado | Nota |
|----------|--------|------|
| `DELETE /api/users/:id` | Definido en backend | El frontend usa `toggleActivo` en lugar de delete |
| `GET /api/logs` | Definido en backend | Sin componente frontend dedicado |
