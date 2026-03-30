# Guía de Despliegue - Data Room (Construex)

## 📚 Índice de Documentación

### Guías de Despliegue

1. **[DEPLOY_EC2.md](DEPLOY_EC2.md)** - Configuración completa del servidor EC2 (Amazon Linux 2023)
   - Instalación de dependencias (Node.js, PM2, NGINX)
   - Configuración del servidor
   - Variables de entorno
   - Comandos útiles

2. **[DEPLOY_GITHUB.md](DEPLOY_GITHUB.md)** - Despliegue desde GitHub
   - Configuración SSH keys
   - Clonar repositorio
   - Deploy inicial y actualizaciones
   - Script de deploy rápido

3. **[DEPLOY_HTTPS.md](DEPLOY_HTTPS.md)** - Configuración HTTPS con Let's Encrypt
   - Configurar dominio y DNS
   - Instalar y configurar Certbot
   - Generar certificado SSL
   - Renovación automática

### Archivos de Configuración

- **[ecosystem.config.js](ecosystem.config.js)** - PM2 process manager
- **[nginx/dataroom.conf](nginx/dataroom.conf)** - NGINX reverse proxy
- **[frontend/.env.production](frontend/.env.production)** - Variables de entorno del frontend (producción)
- **[frontend/.env.development](frontend/.env.development)** - Variables de entorno del frontend (desarrollo)

---

## 🚀 Quick Start (Resumen)

### En tu servidor EC2 (Amazon Linux 2023):

```bash
# 1. Actualizar sistema
sudo dnf update -y

# 2. Instalar dependencias
# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20

# PM2
npm install -g pm2

# NGINX
sudo dnf install nginx -y
sudo systemctl enable nginx --now

# Build tools
sudo dnf groupinstall "Development Tools" -y

# 3. Clonar repositorio
git clone git@github.com:TU_USUARIO/TU_REPO.git Data-Room

# 4. Configurar .env
nano ~/Data-Room/BACKEND/.env
# (agregar DATABASE_URL, JWT_SECRET, etc.)

# 5. Build y deploy
cd ~/Data-Room
cd BACKEND && npm install && npx prisma generate && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
mkdir -p logs

# 6. Configurar NGINX
sudo cp nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf
sudo sed -i '/server {/,/^}/s/^/#/' /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl restart nginx

# 7. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 startup  # y ejecutar el comando que muestra
pm2 save
```

---

## 🏗️ Arquitectura

```
Internet (puerto 80)
        │
        ▼
   NGINX (:80)
        │
        ├─── /api/*  ──► Backend NestJS (:3000) ──► Supabase PostgreSQL
        │
        └─── /*      ──► Frontend Next.js (:3001)
```

### Servicios PM2

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `dataroom-backend` | 3000 | API NestJS con Prisma |
| `dataroom-frontend` | 3001 | Next.js App Router |

---

## 🔐 Variables de Entorno Requeridas

### Backend (`BACKEND/.env`)

```env
DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres"
DIRECT_URL="postgresql://USER:PASS@HOST:5432/postgres?schema=public"
JWT_SECRET="secret-generado-con-openssl"
PORT=3000
CORS_ORIGIN="http://TU_IP_EC2"
```

### Frontend

En producción usa `.env.production` (ya configurado):
```env
NEXT_PUBLIC_API_URL=/api
```

En desarrollo usa `.env.development` (ya configurado):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## ⚙️ Diferencias Clave: Amazon Linux 2023

Amazon Linux 2023 tiene algunas diferencias importantes respecto a Ubuntu:

| Aspecto | Amazon Linux 2023 | Ubuntu 22.04 |
|---------|-------------------|--------------|
| **Package Manager** | `dnf` | `apt` |
| **Usuario default** | `ec2-user` | `ubuntu` |
| **NGINX config** | `/etc/nginx/conf.d/` | `/etc/nginx/sites-enabled/` |
| **Firewall** | `firewalld` | `ufw` |
| **Build tools** | `dnf groupinstall "Development Tools"` | `apt install build-essential` |

---

## 📦 Comandos Útiles

### PM2
```bash
pm2 status              # Ver estado de servicios
pm2 logs                # Ver logs en tiempo real
pm2 restart all         # Reiniciar todos los servicios
pm2 monit               # Monitor interactivo
```

### NGINX
```bash
sudo systemctl status nginx     # Estado del servicio
sudo nginx -t                   # Verificar configuración
sudo systemctl restart nginx    # Reiniciar
sudo tail -f /var/log/nginx/dataroom_error.log  # Ver logs
```

### Despliegue
```bash
cd ~/Data-Room
git pull origin main
cd BACKEND && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart all
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
cd BACKEND
npx prisma generate
npm run build
pm2 restart dataroom-backend
```

### Error: "502 Bad Gateway" en NGINX
```bash
# Verificar que los servicios PM2 estén corriendo
pm2 status
pm2 logs

# Verificar que los puertos estén abiertos
curl http://localhost:3000/api/auth
curl http://localhost:3001
```

### Error: NGINX no inicia
```bash
# Ver el error específico
sudo nginx -t
sudo journalctl -u nginx -n 50

# Verificar que no haya conflicto de puertos
sudo lsof -i :80
```

---

## 📞 Soporte

Para más detalles, consulta las guías completas:
- [DEPLOY_EC2.md](DEPLOY_EC2.md) - Setup completo del servidor
- [DEPLOY_GITHUB.md](DEPLOY_GITHUB.md) - Deploy y actualizaciones
