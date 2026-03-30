# Configuración del Servidor EC2 - Data Room (Construex)

> Guía completa para configurar una instancia EC2 desde cero para el despliegue del proyecto Data Room.

---

## 1. Requisitos de la Instancia EC2

| Aspecto | Recomendación |
|---------|---------------|
| **AMI** | Amazon Linux 2023 |
| **Tipo** | t3.small (mínimo) o t3.medium (recomendado) |
| **Storage** | 20 GB gp3 mínimo |
| **Security Group** | Puertos 22 (SSH), 80 (HTTP), 443 (HTTPS futuro) |

> **Nota:** Esta guía está optimizada para Amazon Linux 2023. Usuario predeterminado: `ec2-user`

---

## 2. Configuración del Security Group (AWS Console)

Abrir estos puertos en el Security Group de la instancia:

| Tipo | Protocolo | Puerto | Origen |
|------|-----------|--------|--------|
| SSH | TCP | 22 | Tu IP (o 0.0.0.0/0 temporal) |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |

---

## 3. Conectarse al Servidor

```bash
# Desde tu terminal local (con la key .pem de AWS)
# Usuario para Amazon Linux 2023: ec2-user
ssh -i "tu-key.pem" ec2-user@TU_IP_PUBLICA_EC2
```

---

## 4. Actualizar el Sistema

```bash
# Amazon Linux 2023 usa DNF (sucesor de YUM)
sudo dnf update -y
```

---

## 5. Instalar Node.js (v20 LTS)

```bash
# Instalar nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Cargar nvm en la sesión actual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar instalación
node -v    # debe mostrar v20.x.x
npm -v     # debe mostrar 10.x.x
```

---

## 6. Instalar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Configurar PM2 para que se inicie con el sistema
pm2 startup
# ¡IMPORTANTE! Ejecutar el comando que PM2 te muestre en pantalla
# Ejemplo: sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v20.x.x/bin ...

# Verificar
pm2 -v
```

---

## 7. Instalar NGINX

```bash
# Instalar NGINX
sudo dnf install nginx -y

# Habilitar NGINX para iniciar con el sistema
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar que funciona
sudo systemctl status nginx
# También puedes visitar http://TU_IP_PUBLICA en el navegador
```

---

## 8. Instalar Git

```bash
# Git generalmente ya viene instalado en Amazon Linux, verificar:
git --version

# Si no está instalado:
sudo dnf install git -y
```

---

## 9. Instalar Herramientas Adicionales

```bash
# Development tools (necesario para compilar bcrypt y otros módulos nativos)
sudo dnf groupinstall "Development Tools" -y
sudo dnf install python3 python3-pip gcc-c++ make -y
```

---

## 10. Configurar SSH para GitHub y Clonar el Proyecto

Antes de configurar NGINX, necesitas clonar el repositorio:

### 10.1. Generar clave SSH

```bash
# Generar clave SSH (presionar Enter en todas las preguntas)
ssh-keygen -t ed25519 -C "dataroom-ec2-deploy"

# Mostrar la clave pública para copiarla
cat ~/.ssh/id_ed25519.pub
```

### 10.2. Agregar la clave en GitHub

1. Copiar la clave pública que se mostró
2. Ir a **GitHub → Tu Repositorio → Settings → Deploy Keys**
3. Click **"Add deploy key"**
4. **Title:** `EC2 Data Room Production`
5. **Key:** Pegar la clave
6. **Allow write access:** ☐ Dejar desmarcado
7. Click **"Add key"**

### 10.3. Clonar el repositorio

```bash
# Verificar conexión a GitHub
ssh -T git@github.com
# Debe responder: "Hi username! You've successfully authenticated..."

# Clonar el proyecto (reemplazar con tu URL)
cd ~
git clone git@github.com:TU_USUARIO/TU_REPO.git Data-Room

# Verificar
cd Data-Room
ls -la
```

> **Importante:** Reemplaza `TU_USUARIO/TU_REPO` con la URL SSH de tu repositorio.

---

## 11. Configurar NGINX

Ahora que el proyecto está clonado, configura NGINX:

```bash
# Verificar que el archivo existe
ls ~/Data-Room/nginx/dataroom.conf

# Copiar nuestra configuración a conf.d
sudo cp ~/Data-Room/nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf

# Editar /etc/nginx/nginx.conf para comentar el bloque server default
# Buscar la sección "server {" dentro de "http {" y comentarla
sudo sed -i '/server {/,/^}/s/^/#/' /etc/nginx/nginx.conf

# O hacerlo manualmente con:
# sudo nano /etc/nginx/nginx.conf
# Comentar todo el bloque "server { ... }" que está dentro de "http {"

# Verificar configuración
sudo nginx -t

# Si dice "syntax is ok" y "test is successful":
sudo systemctl restart nginx
```

---

## 12. Configurar Variables de Entorno (Backend)

Crear el archivo `.env` en el servidor dentro de la carpeta BACKEND:

```bash
nano ~/Data-Room/BACKEND/.env
```

Contenido del `.env`:

```env
# ═══════════════════════════════════════════════
# PRODUCCIÓN - Data Room Backend
# ═══════════════════════════════════════════════

# Base de datos (Supabase)
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@TU_HOST:5432/postgres"
DIRECT_URL="postgresql://TU_USUARIO:TU_PASSWORD@TU_HOST:5432/postgres?schema=public"

# JWT - CAMBIAR POR UN SECRET SEGURO EN PRODUCCIÓN
JWT_SECRET=GENERA_UN_SECRET_SEGURO_AQUI

# Puerto del servidor
PORT=3000

# CORS - IP pública del servidor EC2
CORS_ORIGIN=http://TU_IP_PUBLICA_EC2
```

> **IMPORTANTE:** Para generar un JWT_SECRET seguro:
> ```bash
> openssl rand -base64 64
> ```

---

## 13. Construir y Levantar el Proyecto

```bash
cd ~/Data-Room

# ── Backend ──
cd BACKEND
npm install
npx prisma generate
npm run build
cd ..

# ── Frontend ──
cd frontend
npm install
npm run build
cd ..

# ── Crear carpeta de logs ──
mkdir -p logs

# ── Levantar con PM2 ──
pm2 start ecosystem.config.js

# Verificar que ambos servicios están corriendo
pm2 status

# Guardar la configuración de PM2 (persistencia entre reinicios)
pm2 save
```

---

## 14. Verificar el Despliegue

```bash
# Ver estado de los servicios
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs del backend
pm2 logs dataroom-backend

# Ver logs del frontend
pm2 logs dataroom-frontend

# Verificar NGINX
sudo systemctl status nginx

# Probar la API directamente
curl http://localhost:3000/api/auth

# Probar vía NGINX
curl http://localhost/api/auth
```

Luego abrir en el navegador: `http://TU_IP_PUBLICA_EC2`

---

## 15. Comandos Útiles de PM2

```bash
# Ver estado
pm2 status

# Reiniciar todo
pm2 restart all

# Reiniciar solo backend
pm2 restart dataroom-backend

# Reiniciar solo frontend
pm2 restart dataroom-frontend

# Detener todo
pm2 stop all

# Ver monitoreo en tiempo real
pm2 monit

# Ver logs en tiempo real
pm2 logs --lines 50
```

---

## 16. Comandos Útiles de NGINX

```bash
# Reiniciar NGINX
sudo systemctl restart nginx

# Recargar configuración sin downtime
sudo systemctl reload nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/dataroom_access.log

# Ver logs de error
sudo tail -f /var/log/nginx/dataroom_error.log

# Verificar configuración
sudo nginx -t
```

---

## 17. Firewall (firewalld) - Opcional pero Recomendado

```bash
# Amazon Linux 2023 usa firewalld (no UFW)
# Los puertos ya están configurados en el Security Group de AWS
# Pero si quieres una capa adicional:

sudo systemctl start firewalld
sudo systemctl enable firewalld

# Abrir puertos
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Recargar firewall
sudo firewall-cmd --reload

# Verificar reglas
sudo firewall-cmd --list-all
```

---

## Resumen de Arquitectura

```
                    ┌──────────────────┐
  Internet ────────►│   NGINX (:80)    │
                    │  Reverse Proxy   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │ /api/*       │ /*           │
              ▼              │              ▼
    ┌─────────────────┐      │    ┌─────────────────┐
    │  Backend NestJS  │      │    │ Frontend Next.js │
    │   PM2 (:3000)    │      │    │   PM2 (:3001)    │
    └────────┬────────┘       │    └─────────────────┘
             │                │
             ▼                │
    ┌─────────────────┐       │
    │   Supabase DB    │      │
    │   (PostgreSQL)   │      │
    └─────────────────┘       │
```
