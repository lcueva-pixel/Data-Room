# Despliegue desde GitHub - Data Room (Construex)

> Guía para configurar acceso SSH a GitHub desde el servidor EC2 (Amazon Linux 2023) y desplegar el proyecto.

---

## 1. Generar Clave SSH en el Servidor EC2

Conectarse al servidor y ejecutar:

```bash
# Generar clave SSH (presionar Enter en todas las preguntas para usar defaults)
ssh-keygen -t ed25519 -C "dataroom-ec2-deploy"

# Cuando pregunte:
#   Enter file: [presionar Enter para usar default]
#   Enter passphrase: [presionar Enter para dejar vacío]
```

---

## 2. Copiar la Clave Pública

```bash
# Mostrar la clave pública
cat ~/.ssh/id_ed25519.pub
```

**Copiar TODO el contenido** que se muestra (empieza con `ssh-ed25519 ...`).

---

## 3. Agregar la Clave en GitHub

### Opción A: Deploy Key (Recomendado - acceso solo a este repo)

1. Ir a **GitHub → Tu Repositorio → Settings → Deploy Keys**
2. Click en **"Add deploy key"**
3. **Title:** `EC2 Data Room Production`
4. **Key:** Pegar la clave pública copiada
5. **Allow write access:** ☐ Dejar desmarcado (solo necesitas lectura)
6. Click **"Add key"**

### Opción B: SSH Key de usuario (acceso a todos tus repos)

1. Ir a **GitHub → Settings (perfil) → SSH and GPG keys**
2. Click en **"New SSH key"**
3. **Title:** `EC2 Data Room Production`
4. **Key type:** Authentication Key
5. **Key:** Pegar la clave pública copiada
6. Click **"Add SSH key"**

> **Recomendación:** Usar **Deploy Key** para producción (principio de menor privilegio).

---

## 4. Verificar Conexión SSH a GitHub

```bash
# Probar la conexión
ssh -T git@github.com

# Debe responder algo como:
# "Hi username! You've successfully authenticated..."
# o "Hi username/repo-name! You've successfully authenticated..."
```

Si pide confirmar la huella digital del host, escribir `yes`.

---

## 5. Clonar el Repositorio

```bash
# Ir al directorio home
cd ~

# Clonar usando SSH (reemplazar con tu URL)
git clone git@github.com:TU_USUARIO/TU_REPO.git Data-Room

# Verificar
cd Data-Room
ls -la
```

> **Nota:** Reemplaza `TU_USUARIO/TU_REPO` con la URL real de tu repositorio.
> La URL SSH la encuentras en GitHub → Code → SSH.

---

## 6. Primer Despliegue Completo

```bash
cd ~/Data-Room

# ══════════════════════════════════════
# 1. BACKEND - Instalar y construir
# ══════════════════════════════════════
cd BACKEND
npm install

# Crear archivo .env con las variables de producción
nano .env
# (ver sección "Variables de Entorno" en DEPLOY_EC2.md)

# Generar cliente Prisma
npx prisma generate

# Sincronizar esquema con la base de datos (si es necesario)
npx prisma db push

# Compilar TypeScript
npm run build

# Verificar que se creó la carpeta dist/
ls dist/

cd ..

# ══════════════════════════════════════
# 2. FRONTEND - Instalar y construir
# ══════════════════════════════════════
cd frontend
npm install

# Build de producción (usa .env.production automáticamente)
npm run build

cd ..

# ══════════════════════════════════════
# 3. Crear directorio de logs
# ══════════════════════════════════════
mkdir -p logs

# ══════════════════════════════════════
# 4. Configurar NGINX
# ══════════════════════════════════════
# Para Amazon Linux 2023:
sudo cp nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf
sudo sed -i '/server {/,/^}/s/^/#/' /etc/nginx/nginx.conf

# Verificar y reiniciar
sudo nginx -t
sudo systemctl restart nginx

# ══════════════════════════════════════
# 5. Levantar servicios con PM2
# ══════════════════════════════════════
pm2 start ecosystem.config.js
pm2 save

# ══════════════════════════════════════
# 6. Verificar
# ══════════════════════════════════════
pm2 status
curl http://localhost/api/auth
```

---

## 7. Actualizar el Proyecto (Deploys Posteriores)

Cuando haya cambios en el repositorio, ejecutar:

```bash
cd ~/Data-Room

# ══════════════════════════════════════
# 1. Traer cambios de GitHub
# ══════════════════════════════════════
git pull origin main

# ══════════════════════════════════════
# 2. Reconstruir Backend (si hubo cambios)
# ══════════════════════════════════════
cd BACKEND
npm install
npx prisma generate
npm run build
cd ..

# ══════════════════════════════════════
# 3. Reconstruir Frontend (si hubo cambios)
# ══════════════════════════════════════
cd frontend
npm install
npm run build
cd ..

# ══════════════════════════════════════
# 4. Reiniciar servicios
# ══════════════════════════════════════
pm2 restart all

# Verificar
pm2 status
pm2 logs --lines 20
```

---

## 8. Script de Deploy Rápido (Opcional)

Puedes crear un script para automatizar los deploys posteriores:

```bash
# Crear el script
nano ~/deploy.sh
```

Contenido de `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "  DEPLOY - Data Room (Construex)"
echo "═══════════════════════════════════════"

cd ~/Data-Room

echo ">> Pulling latest changes..."
git pull origin main

echo ">> Building Backend..."
cd BACKEND
npm install --production=false
npx prisma generate
npm run build
cd ..

echo ">> Building Frontend..."
cd frontend
npm install --production=false
npm run build
cd ..

echo ">> Restarting PM2 services..."
pm2 restart all

echo ">> Updating NGINX config..."
sudo cp nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "═══════════════════════════════════════"
echo "  DEPLOY COMPLETADO"
echo "═══════════════════════════════════════"
pm2 status
```

Dar permisos de ejecución:

```bash
chmod +x ~/deploy.sh
```

Usar:

```bash
~/deploy.sh
```

---

## 9. Troubleshooting

### Error: "Permission denied (publickey)"
```bash
# Verificar que la clave SSH existe
ls -la ~/.ssh/

# Verificar que el agente SSH está cargando la clave
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Probar de nuevo
ssh -T git@github.com
```

### Error: "Port 80 already in use"
```bash
# Ver qué proceso usa el puerto 80
sudo lsof -i :80
# Generalmente es Apache, desinstalarlo si NGINX es el elegido
sudo systemctl stop apache2
sudo apt remove apache2 -y
```

### Error: PM2 no inicia después de reboot
```bash
# Reconfigurar PM2 startup
pm2 unstartup
pm2 startup
# Ejecutar el comando que muestra
pm2 start ecosystem.config.js
pm2 save
```

### Error: "EACCES permission denied" en npm install
```bash
# Nunca usar sudo con npm. Verificar que nvm está configurado
nvm use 20
which node  # debe apuntar a ~/.nvm/...
```

### Frontend muestra error de API
```bash
# Verificar que el backend está corriendo
pm2 status
curl http://localhost:3000/api/auth

# Verificar NGINX
sudo nginx -t
sudo tail -20 /var/log/nginx/dataroom_error.log
```

---

## Resumen de Configuración en GitHub

| Configuración | Ubicación | Valor |
|---|---|---|
| **Deploy Key** | Repo → Settings → Deploy Keys | Clave pública SSH del EC2 |
| **Branch protegido** | Repo → Settings → Branches | Proteger `main` (opcional) |
| **Visibilidad** | Repo → Settings → General | Private (recomendado) |
