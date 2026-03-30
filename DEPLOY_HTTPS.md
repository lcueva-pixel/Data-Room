# Configuración HTTPS con Let's Encrypt - Data Room

> Guía para configurar certificado SSL gratuito con Let's Encrypt para `dataroom.construex.com`

---

## 📋 Requisitos Previos

- ✅ Dominio configurado (dataroom.construex.com)
- ✅ DNS apuntando a la IP pública del EC2
- ✅ Puerto 443 abierto en Security Group de AWS
- ✅ NGINX instalado y funcionando

---

## 1️⃣ Configurar DNS (Hacer ANTES de instalar certificado)

En tu proveedor de DNS (ej: Route 53, Cloudflare, GoDaddy):

**Crear registro A:**
```
Type: A
Name: dataroom (o @dataroom si es subdominio)
Value: TU_IP_PUBLICA_EC2
TTL: 300 (o automático)
```

**Verificar que resuelve correctamente:**
```bash
# Desde tu máquina local o el servidor
nslookup dataroom.construex.com

# O con dig
dig dataroom.construex.com +short
# Debe mostrar tu IP pública del EC2
```

⚠️ **IMPORTANTE:** Espera 5-10 minutos para que se propague el DNS antes de continuar.

---

## 2️⃣ Abrir Puerto 443 en AWS Security Group

1. Ve a **AWS Console → EC2 → Security Groups**
2. Selecciona el Security Group de tu instancia
3. Click **"Edit inbound rules"**
4. Click **"Add rule"**:
   - **Type:** HTTPS
   - **Protocol:** TCP
   - **Port range:** 443
   - **Source:** 0.0.0.0/0 (o tu rango específico)
5. **Save rules**

---

## 3️⃣ Instalar Certbot (Let's Encrypt)

```bash
# En Amazon Linux 2023
sudo dnf install -y python3 augeas-libs

# Instalar certbot y plugin de NGINX
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx

# Crear symlink para facilitar el uso
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

**Verificar instalación:**
```bash
certbot --version
# Debe mostrar: certbot 2.x.x
```

---

## 4️⃣ Preparar NGINX para Certificación

**Opción A: Dejar que Certbot configure NGINX automáticamente (Recomendado)**

```bash
# Copiar la configuración actualizada del proyecto
sudo cp ~/Data-Room/nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf

# Verificar sintaxis
sudo nginx -t

# Reiniciar NGINX
sudo systemctl restart nginx
```

**Opción B: Configuración temporal para validación**

Si prefieres una configuración mínima primero:

```bash
# Editar temporalmente para solo servir en puerto 80
sudo nano /etc/nginx/conf.d/dataroom.conf
```

Usa esta configuración temporal:
```nginx
server {
    listen 80;
    server_name dataroom.construex.com;
    
    location / {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5️⃣ Generar Certificado SSL

```bash
# Opción 1: Modo automático (Certbot modifica NGINX)
sudo certbot --nginx -d dataroom.construex.com

# Opción 2: Solo obtener certificado (recomendado)
sudo certbot certonly --nginx -d dataroom.construex.com

# Opción 3: Si NGINX no está corriendo, usa standalone
# (detener NGINX primero: sudo systemctl stop nginx)
# sudo certbot certonly --standalone -d dataroom.construex.com
```

**Durante el proceso te preguntará:**

1. **Email:** Tu email para notificaciones (ej: admin@construex.com)
2. **Términos:** Acepta los términos (Y)
3. **Compartir email:** Opcional (N recomendado)

**Respuesta exitosa:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/dataroom.construex.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/dataroom.construex.com/privkey.pem
```

---

## 6️⃣ Copiar Configuración NGINX Final con SSL

```bash
# Copiar la configuración completa con SSL del proyecto
sudo cp ~/Data-Room/nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf

# Verificar que no hay errores
sudo nginx -t

# Si está correcto, recargar NGINX
sudo systemctl reload nginx
```

---

## 7️⃣ Configurar Renovación Automática

Let's Encrypt emite certificados válidos por **90 días**. Certbot incluye renovación automática.

```bash
# Verificar que el timer está activo
sudo systemctl list-timers | grep certbot

# Si no existe, crear job de renovación
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

# Test de renovación (dry-run)
sudo certbot renew --dry-run
```

**Si el test es exitoso, verás:**
```
Congratulations, all simulated renewals succeeded
```

---

## 8️⃣ Actualizar Variables de Entorno (Backend)

Actualiza el archivo `.env` del backend para usar HTTPS:

```bash
nano ~/Data-Room/BACKEND/.env
```

Cambiar:
```env
# Antes:
CORS_ORIGIN=http://TU_IP_PUBLICA_EC2

# Después:
CORS_ORIGIN=https://dataroom.construex.com
```

**Reiniciar backend:**
```bash
pm2 restart dataroom-backend
```

---

## 9️⃣ Verificar Configuración HTTPS

```bash
# Verificar que el certificado se instaló correctamente
sudo certbot certificates

# Ver detalles del certificado
openssl s_client -connect dataroom.construex.com:443 -servername dataroom.construex.com < /dev/null | openssl x509 -noout -dates

# Probar endpoint desde el servidor
curl https://dataroom.construex.com/api/auth

# Verificar redirección HTTP → HTTPS
curl -I http://dataroom.construex.com
# Debe responder con 301 y Location: https://...
```

**Desde tu navegador:**
1. Ve a `https://dataroom.construex.com`
2. Verifica que aparece el candado 🔒 en la barra de dirección
3. Click en el candado → Debe mostrar "Conexión segura"

---

## 🔥 Testing SSL Quality

Usa herramientas online para verificar la configuración SSL:

- **SSL Labs:** https://www.ssllabs.com/ssltest/analyze.html?d=dataroom.construex.com
- **Security Headers:** https://securityheaders.com/?q=dataroom.construex.com

Objetivo: **Obtener calificación A o A+**

---

## 🆘 Troubleshooting

### Error: "Connection refused" al generar certificado

```bash
# Verificar que NGINX está corriendo
sudo systemctl status nginx

# Verificar que el puerto 80 está abierto
sudo netstat -tlnp | grep :80

# Verificar firewall
sudo firewall-cmd --list-all

# Verificar DNS
dig dataroom.construex.com +short
```

### Error: "Timeout during connect"

Problema: Puerto 80 no accesible desde internet.

**Solución:**
- Verificar Security Group de AWS tiene puerto 80 abierto
- Verificar que el dominio resuelve a la IP correcta

### Error: Certificado no se aplica

```bash
# Ver logs de NGINX
sudo tail -50 /var/log/nginx/error.log

# Verificar rutas del certificado
sudo ls -la /etc/letsencrypt/live/dataroom.construex.com/

# Test de configuración
sudo nginx -t
```

### Browser muestra "Your connection is not private"

**Causas comunes:**
1. El certificado no se generó correctamente
2. NGINX no está usando el certificado correcto
3. Cache del navegador (Ctrl+F5 para refrescar)
4. Reloj del servidor/cliente desincronizado

```bash
# Verificar fecha/hora del servidor
date

# Si está mal, sincronizar
sudo dnf install chrony -y
sudo systemctl start chronyd
sudo systemctl enable chronyd
```

---

## 📝 Comandos de Mantenimiento

```bash
# Ver certificados instalados
sudo certbot certificates

# Renovar manualmente (si falta < 30 días)
sudo certbot renew

# Renovar forzadamente (para testing)
sudo certbot renew --force-renewal

# Revocar certificado
sudo certbot revoke --cert-path /etc/letsencrypt/live/dataroom.construex.com/fullchain.pem

# Eliminar certificado
sudo certbot delete --cert-name dataroom.construex.com
```

---

## ✅ Checklist Final

- [ ] DNS apunta a la IP del EC2
- [ ] Puerto 443 abierto en Security Group
- [ ] Certbot instalado
- [ ] Certificado generado exitosamente
- [ ] NGINX configurado con SSL
- [ ] Backend actualizado con CORS_ORIGIN (HTTPS)
- [ ] Renovación automática configurada
- [ ] Sitio accesible via HTTPS
- [ ] Redirección HTTP → HTTPS funciona
- [ ] SSL Labs calificación A o superior

---

## 🔄 Actualizar Certificado Después de Cambios

Si modificas la configuración de NGINX:

```bash
cd ~/Data-Room
git pull origin main
sudo cp nginx/dataroom.conf /etc/nginx/conf.d/dataroom.conf
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📚 Referencias

- **Let's Encrypt:** https://letsencrypt.org/
- **Certbot:** https://certbot.eff.org/
- **SSL Best Practices:** https://wiki.mozilla.org/Security/Server_Side_TLS
