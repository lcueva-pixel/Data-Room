# Capa de Datos: Prisma Service

---

## Archivos

| Archivo | Proposito |
|---------|-----------|
| `src/prisma/prisma.module.ts` | Modulo global que exporta PrismaService |
| `src/prisma/prisma.service.ts` | Wrapper sobre PrismaClient con getters tipados |
| `prisma/schema.prisma` | Esquema de la base de datos |
| `prisma.config.ts` | Configuracion de Prisma |
| `src/generated/prisma/` | Cliente Prisma generado automaticamente |

---

## PrismaModule

**Archivo:** `src/prisma/prisma.module.ts`

```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
```

- Decorado con `@Global()`: Disponible en todos los modulos sin necesidad de importarlo
- Exporta `PrismaService` para inyeccion de dependencias

---

## PrismaService

**Archivo:** `src/prisma/prisma.service.ts`

### Implementacion

```typescript
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new PrismaClient();

  // Getters tipados para cada modelo
  get user()           { return this.client.user; }
  get role()           { return this.client.role; }
  get report()         { return this.client.report; }
  get auditAccess()    { return this.client.auditAccess; }
  get logActivity()    { return this.client.logActivity; }
  get reportRole()     { return this.client.reportRole; }
  get reportViewLog()  { return this.client.reportViewLog; }

  async onModuleInit()    { await this.client.$connect(); }
  async onModuleDestroy() { await this.client.$disconnect(); }
}
```

### Ciclo de Vida
| Evento | Accion | Descripcion |
|--------|--------|-------------|
| `onModuleInit` | `$connect()` | Conecta a PostgreSQL al iniciar la aplicacion |
| `onModuleDestroy` | `$disconnect()` | Desconecta al detener la aplicacion |

### Modelos Expuestos

| Getter | Modelo Prisma | Tabla BD | Descripcion |
|--------|--------------|----------|-------------|
| `user` | User | cex_usuarios | Usuarios del sistema |
| `role` | Role | cex_roles | Roles de acceso |
| `report` | Report | cex_reportes | Reportes de Looker Studio |
| `auditAccess` | AuditAccess | cex_auditoria_accesos | Log de accesos |
| `logActivity` | LogActivity | cex_log_actividades | Log de actividades |
| `reportRole` | ReportRole | cex_reportes_roles | Relacion reporte-rol |
| `reportViewLog` | ReportViewLog | cex_log_visualizaciones | Log de visualizaciones |

---

## Uso en Servicios

Todos los servicios inyectan `PrismaService` y acceden a los modelos via getters:

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ include: { rol: true } });
  }
}
```

---

## Generacion del Cliente

El cliente Prisma se genera en `src/generated/prisma/` (configurado en `schema.prisma`):

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

Para regenerar despues de cambios en el esquema:
```bash
npx prisma generate
```

---

## Conexion a Base de Datos

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

La URL de conexion se lee de la variable de entorno `DATABASE_URL`:
```
postgresql://postgres:admin@localhost:5432/cex_LookerStudio?schema=public
```

### Comandos Utiles de Prisma
| Comando | Descripcion |
|---------|-------------|
| `npx prisma generate` | Regenera el cliente Prisma |
| `npx prisma migrate dev` | Aplica migraciones en desarrollo |
| `npx prisma studio` | Abre panel web para explorar la BD |
| `npx prisma db push` | Sincroniza esquema sin migraciones |
