# Auditoria de Rendimiento

---

## Backend

### 1. Queries de Base de Datos

#### Endpoint GET /api/audit - Combinacion en memoria

**Severidad:** MEDIA

El `AuditService.findAll()` ejecuta dos queries completas y las combina en memoria:

```
1. prisma.auditAccess.findMany()    -> Todos los accesos
2. prisma.reportViewLog.findMany()  -> Todas las visualizaciones
3. Combina ambos arrays en JS
4. Filtra por search en JS
5. Ordena por fecha en JS
6. Aplica paginacion con slice en JS
```

**Problema:** Para grandes volumenes de datos, cargar TODOS los registros en memoria antes de paginar es ineficiente. Con 100,000 registros de auditoria, cada peticion cargaria todos en memoria para luego retornar solo 10.

**Recomendacion:** 
- Usar una vista de base de datos (VIEW) o una query raw que combine ambas tablas con UNION ALL
- Aplicar filtros, ordenamiento y paginacion directamente en SQL

#### Endpoint GET /api/reports - Includes anidados

**Severidad:** BAJA

El `ReportsService.findByRole()` usa includes de hasta 2 niveles de profundidad:

```
report -> children -> children -> reportesRoles -> rol
```

Con muchos reportes jerarquicos, esto puede generar multiples queries JOIN en cascada.

**Impacto actual:** Bajo, dado que el volumen de reportes es tipicamente pequeno.

#### Endpoint GET /api/logs - Sin paginacion

**Severidad:** MEDIA

`LogService.findAll()` retorna TODOS los registros sin paginacion. A medida que la tabla crece, la respuesta sera cada vez mas pesada.

**Recomendacion:** Agregar paginacion similar a otros endpoints.

---

### 2. Indices de Base de Datos

**Indices existentes (via Prisma):**
| Tabla | Indice | Tipo |
|-------|--------|------|
| cex_roles | id | PK |
| cex_roles | rol_descripcion | UNIQUE |
| cex_usuarios | id | PK |
| cex_usuarios | email | UNIQUE |
| cex_reportes | id | PK |
| cex_reportes_roles | [reporte_id, rol_id] | PK compuesta |

**Indices recomendados (no existentes):**
| Tabla | Columna(s) | Justificacion |
|-------|-----------|---------------|
| cex_usuarios | activo | Filtro frecuente en queries de usuarios |
| cex_usuarios | rol_id | FK usado en JOINs y filtros |
| cex_auditoria_accesos | fecha_hora | Ordenamiento DESC en cada consulta |
| cex_auditoria_accesos | usuario_id | FK usado en JOINs |
| cex_log_actividades | fecha_hora | Ordenamiento DESC en cada consulta |
| cex_log_visualizaciones | fecha_hora | Ordenamiento DESC en cada consulta |
| cex_reportes | padre_id | Filtro en queries jerarquicas |
| cex_reportes | activo | Filtro frecuente |

---

### 3. Hashing de Passwords

**Configuracion actual:** bcrypt con 10 rounds

| Rounds | Tiempo aprox. | Seguridad |
|:------:|:------------:|:---------:|
| 10 | ~100ms | Adecuada para la mayoria de aplicaciones |
| 12 | ~250ms | Recomendada para alta seguridad |
| 14 | ~1000ms | Alta seguridad, impacto en UX |

**Veredicto:** 10 rounds es aceptable para esta aplicacion.

---

## Frontend

### 1. Re-renders

#### AuthContext en Dashboard Layout

`AuthProvider` wrappea todas las paginas del dashboard. Cambios en `session` o `isLoading` provocan re-renders en todo el arbol.

**Impacto:** Bajo, ya que estos estados rara vez cambian durante una sesion.

#### Hooks con useState en tablas

Los hooks `useUsers` y `useAdminReports` usan multiples `setState` que pueden causar renders intermedios.

**Impacto:** Bajo, React 19 agrupa actualizaciones de estado automaticamente.

---

### 2. React Query

**Configuracion actual:**
```typescript
staleTime: 30000,  // 30 segundos
retry: 1           // 1 reintento
```

| Aspecto | Evaluacion |
|---------|-----------|
| staleTime: 30s | Adecuado para datos que cambian moderadamente |
| retry: 1 | Conservador pero correcto para evitar peticiones innecesarias |
| Invalidacion | Correcta: se invalida cache tras cada mutacion |

---

### 3. Lazy Loading

| Componente | Lazy? | Evaluacion |
|-----------|:-----:|-----------|
| Iframe (ReportViewer) | Si | `loading="lazy"` en el iframe |
| Paginas | Si | Next.js App Router divide por ruta automaticamente |
| Componentes admin | No | Se cargan con la pagina. Impacto bajo |

---

### 4. Bundle Size

**Librerias pesadas potenciales:**
| Libreria | Peso estimado | Usada en |
|----------|:----------:|---------|
| Recharts | ~200KB | Importada pero no se detecta uso activo en componentes |
| @tanstack/react-table | ~50KB | Tablas de admin |
| @tanstack/react-query | ~40KB | Hooks de datos |
| axios | ~15KB | Cliente HTTP |
| zod | ~15KB | Validacion |
| lucide-react | Tree-shakeable | Solo se importan iconos usados |

**Observacion:** `Recharts` esta en `package.json` pero no se detecta uso activo en los componentes analizados. Si no se usa, deberia eliminarse para reducir el bundle.

---

### 5. Debounce en Busquedas

Todas las tablas implementan debounce de 300ms en el campo de busqueda, lo que previene peticiones excesivas durante la escritura. Esto es correcto.

---

## Resumen de Hallazgos

| # | Area | Severidad | Hallazgo | Recomendacion |
|:-:|------|:---------:|----------|---------------|
| 1 | Backend | MEDIA | Audit combina datos en memoria | Usar UNION ALL en SQL |
| 2 | Backend | MEDIA | GET /api/logs sin paginacion | Agregar PaginationQueryDto |
| 3 | Backend | BAJA | Sin indices en columnas de filtro/orden | Agregar indices recomendados |
| 4 | Backend | BAJA | Includes anidados en reportes | Aceptable para volumen actual |
| 5 | Frontend | BAJA | Recharts importado sin uso aparente | Verificar y eliminar si no se usa |
| 6 | Frontend | OK | React Query bien configurado | Sin cambios necesarios |
| 7 | Frontend | OK | Debounce en busquedas | Implementado correctamente |
| 8 | Frontend | OK | Lazy loading de iframes | Implementado correctamente |
