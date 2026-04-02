# Plan 01: Seguridad del Backend

**Alcance:** JWT_SECRET, proteccion .env, prevencion XSS en iframe  
**Dependencias a instalar:** Ninguna  
**Archivos afectados:** 6

---

## 1. JWT_SECRET Robusto

### Problema Actual

El secreto JWT tiene un fallback inseguro en dos archivos y un valor debil en el `.env`:

- **`src/auth/jwt.strategy.ts` linea 11:** `secretOrKey: process.env.JWT_SECRET || 'supersecret'`
- **`src/auth/auth.module.ts` linea 12:** `secret: process.env.JWT_SECRET || 'supersecret'`
- **`BACKEND/.env` linea 2:** `JWT_SECRET=supersecret`

Si la variable de entorno no se carga (error de configuracion, deploy sin .env), la app arranca con un secreto conocido publicamente. Cualquier atacante puede forjar tokens JWT validos.

### Archivos a Modificar

#### 1.1 `BACKEND/src/auth/jwt.strategy.ts`

**Estado actual (18 lineas):**
```typescript
// linea 1-3: imports
// linea 7: constructor() {
// linea 11: secretOrKey: process.env.JWT_SECRET || 'supersecret',
```

**Cambios:**

- **Linea 1:** Agregar import de `ConfigService` desde `@nestjs/config`
- **Linea 7:** Cambiar `constructor()` por `constructor(private readonly configService: ConfigService)` para inyectar ConfigService
- **Dentro del constructor, ANTES de `super()`:** Extraer el secreto con `configService.get<string>('JWT_SECRET')` y lanzar `Error('JWT_SECRET no esta configurado')` si es `undefined` o vacio
- **Linea 11:** Reemplazar `process.env.JWT_SECRET || 'supersecret'` por la variable local que contiene el secreto validado

**Resultado esperado:** El constructor queda asi:
```typescript
constructor(private readonly configService: ConfigService) {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET no esta configurado en las variables de entorno');
  }
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: secret,
  });
}
```

#### 1.2 `BACKEND/src/auth/auth.module.ts`

**Estado actual (20 lineas):**
```typescript
// lineas 11-14:
JwtModule.register({
  secret: process.env.JWT_SECRET || 'supersecret',
  signOptions: { expiresIn: '8h' },
}),
```

**Cambios:**

- **Linea 1-2:** Agregar imports de `ConfigModule` y `ConfigService` desde `@nestjs/config`
- **Lineas 11-14:** Reemplazar `JwtModule.register({...})` por `JwtModule.registerAsync({...})` usando factory con inyeccion de `ConfigService`

**Resultado esperado:**
```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '8h' },
  }),
}),
```

**Nota:** `ConfigModule` ya esta importado como global en `app.module.ts` (linea 13), por lo que `ConfigService` esta disponible para inyeccion en todos los modulos.

#### 1.3 `BACKEND/.env`

**Estado actual (linea 2):** `JWT_SECRET=supersecret`

**Cambio:** Reemplazar por un secreto generado con:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

El valor resultante sera un string hexadecimal de 128 caracteres.

---

## 2. Proteccion de Variables de Entorno

### Estado Actual del .gitignore

El `.gitignore` raiz del proyecto **ya excluye** los archivos `.env`:
```
# lineas 19-24 del .gitignore raiz:
.env
.env.local
.env.production.local
.env.development.local
**/.env
**/.env.local
```

Esto es correcto. No se requieren cambios en `.gitignore`.

### Archivo a Crear

#### 2.1 `BACKEND/.env.example`

**Accion:** Crear archivo nuevo con la estructura de variables pero sin valores sensibles.

**Contenido:**
```env
# ============================================================
# Data Room CEX — Variables de Entorno (Backend)
# ============================================================
# Copia este archivo como .env y completa los valores.
# NUNCA subas el archivo .env al repositorio.
# ============================================================

# Conexion a PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_bd?schema=public"

# Secreto para firma de JWT (OBLIGATORIO)
# Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=

# Puerto del servidor
PORT=3001

# Origenes permitidos para CORS (separados por coma)
CORS_ORIGIN=http://localhost:3000
```

### Verificacion Adicional

Ejecutar para confirmar que `.env` no esta trackeado:
```bash
git ls-files --cached BACKEND/.env
```
Si retorna algo, ejecutar `git rm --cached BACKEND/.env` para destrackearlo.

---

## 3. Prevencion XSS en URL del Iframe

### Problema Actual

En ambos DTOs de reportes, el campo `urlIframe` solo valida `@IsString()`:

- **`src/reports/dto/create-report.dto.ts` lineas 11-12:**
  ```typescript
  @IsString()
  urlIframe: string;
  ```

- **`src/reports/dto/update-report.dto.ts` lineas 8-10:**
  ```typescript
  @IsString()
  @IsOptional()
  urlIframe?: string;
  ```

Esto permite que un atacante envie directamente a la API valores como:
- `javascript:alert(document.cookie)`
- `data:text/html,<script>...</script>`
- `http://sitio-malicioso.com` (sin HTTPS)

La URL se carga en un `<iframe src={urlIframe}>` en el frontend sin sanitizacion adicional.

### Archivos a Modificar

#### 3.1 `BACKEND/src/reports/dto/create-report.dto.ts`

**Estado actual (linea 1):**
```typescript
import { IsString, IsBoolean, IsOptional, IsArray, IsInt, ArrayMinSize } from 'class-validator';
```

**Cambios:**

- **Linea 1:** Agregar `Matches` al import de `class-validator`
- **Lineas 11-12:** Agregar decorador `@Matches()` despues de `@IsString()` con regex que fuerce protocolo HTTPS

**Resultado para el campo urlIframe:**
```typescript
@IsString()
@Matches(/^https:\/\//, {
  message: 'La URL del iframe debe comenzar con https://',
})
urlIframe: string;
```

#### 3.2 `BACKEND/src/reports/dto/update-report.dto.ts`

**Estado actual (linea 1):**
```typescript
import { IsString, IsBoolean, IsOptional, IsArray, IsInt } from 'class-validator';
```

**Cambios:**

- **Linea 1:** Agregar `Matches` al import
- **Lineas 8-10:** Agregar `@Matches()` entre `@IsString()` y `@IsOptional()`

**Resultado para el campo urlIframe:**
```typescript
@IsString()
@Matches(/^https:\/\//, {
  message: 'La URL del iframe debe comenzar con https://',
})
@IsOptional()
urlIframe?: string;
```

### Por que `@Matches()` y no `@IsUrl()`

| Opcion | Problema |
|--------|---------|
| `@IsUrl()` | Acepta `http://`, `ftp://`, `javascript:` y otros protocolos. Demasiado permisivo |
| `@Matches(/^https:\/\//)` | Solo acepta strings que comiencen con `https://`. Alineado con la validacion del frontend (Zod: `startsWith('https://')`) |

---

## Resumen de Archivos

| # | Archivo | Accion | Cambio principal |
|:-:|---------|--------|-----------------|
| 1 | `BACKEND/src/auth/jwt.strategy.ts` | Modificar | Inyectar ConfigService, eliminar fallback |
| 2 | `BACKEND/src/auth/auth.module.ts` | Modificar | JwtModule.registerAsync con ConfigService |
| 3 | `BACKEND/.env` | Modificar | Generar JWT_SECRET robusto (128 chars hex) |
| 4 | `BACKEND/.env.example` | **Crear** | Template de variables sin valores sensibles |
| 5 | `BACKEND/src/reports/dto/create-report.dto.ts` | Modificar | Agregar @Matches HTTPS a urlIframe |
| 6 | `BACKEND/src/reports/dto/update-report.dto.ts` | Modificar | Agregar @Matches HTTPS a urlIframe |

---

## Orden de Ejecucion

```
1. Generar nuevo JWT_SECRET y actualizar .env
2. Crear .env.example
3. Modificar auth.module.ts (JwtModule.registerAsync)
4. Modificar jwt.strategy.ts (inyectar ConfigService)
5. Modificar create-report.dto.ts (@Matches)
6. Modificar update-report.dto.ts (@Matches)
7. Reiniciar backend y verificar que arranca con el nuevo secreto
```
