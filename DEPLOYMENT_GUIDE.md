# Guía de Despliegue en Hosttiger - Hotel Management System

## 📌 Prerequisitos
- Cuenta en Hosttiger (con acceso SSH/cPanel)
- Node.js instalado en Hosttiger (generalmente disponible)
- Git instalado
- Acceso a base de datos (MySQL o MongoDB)

## 🚀 Pasos de Despliegue

### 1. Preparar el Proyecto Localmente

```bash
# Instalar dependencias
npm install

# Build del proyecto
npm run build

# Verificar que todo está correcto
npm run preview
```

### 2. Conectarse a Hosttiger vía SSH

```bash
# Cambiar con tus credenciales de Hosttiger
ssh usuario@tudominio.com

# O si usas IP:
ssh usuario@192.168.x.x
```

### 3. En el Servidor Hosttiger

```bash
# Navegar al directorio público
cd public_html

# Clonar o subir el repositorio
git clone https://github.com/tuusuario/hotel-management.git .

# Instalar dependencias
npm install --production

# Crear archivo .env con configuración de producción
nano .env
```

### 4. Configurar Variables de Entorno (.env)

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=hotel_db

# O para MongoDB:
MONGODB_URI=mongodb://usuario:contraseña@localhost:27017/hotel

# Servidor
NODE_ENV=production
PORT=4000
API_URL=https://tudominio.com/api

# JWT
JWT_SECRET=tu_secreto_muy_seguro_aqui

# CORS
CORS_ORIGIN=https://tudominio.com
```

### 5. Iniciar la Aplicación

#### Opción A: Con PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el servidor
pm2 start backend/server.js --name "hotel-api"

# Iniciar Astro en modo producción
pm2 start "npm run preview" --name "hotel-web"

# Guardar configuración de PM2
pm2 save

# Hacer que inicie con el servidor
pm2 startup
```

#### Opción B: Con systemd (Para VPS Linux)

Crear archivo: `/etc/systemd/system/hotel-app.service`

```ini
[Unit]
Description=Hotel Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/usuario/public_html
ExecStart=/usr/bin/node backend/server.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/hotel-app.log
StandardError=append:/var/log/hotel-app-error.log

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hotel-app
sudo systemctl start hotel-app
```

### 6. Configurar Nginx/Apache como Reverse Proxy

#### Con Nginx (VPS):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Con Apache (Shared Hosting):

Crear `.htaccess` en el directorio raíz:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirigir a HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Proxy API a puerto 4000
  RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]
  
  # Todo lo demás va a Astro
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

### 7. Configurar SSL/HTTPS

```bash
# Usando Let's Encrypt (Gratis)
sudo certbot certonly --apache -d tudominio.com -d www.tudominio.com

# O con Nginx
sudo certbot certonly --nginx -d tudominio.com -d www.tudominio.com
```

### 8. Configurar Base de Datos en Producción

#### Para MySQL:

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE hotel_prod;
CREATE USER 'hotel_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON hotel_prod.* TO 'hotel_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Para MongoDB:

```bash
# Crear usuario
use admin
db.createUser({
  user: "hotel_user",
  pwd: "contraseña_segura",
  roles: ["readWrite", { role: "dbOwner", db: "hotel_prod" }]
})

# Conectarse a base de datos
use hotel_prod
```

### 9. Verificar que Todo Funciona

```bash
# Ver estado de PM2
pm2 status

# Ver logs
pm2 logs hotel-api
pm2 logs hotel-web

# Probar API
curl https://tudominio.com/api/bookings

# Probar web
curl https://tudominio.com/
```

### 10. Configurar Auto-Deploy (Opcional)

Crear webhook en GitHub → Hosttiger para auto-actualizar con cada push

```bash
#!/bin/bash
# deploy.sh
cd /home/usuario/public_html
git pull origin main
npm install --production
pm2 restart hotel-api hotel-web
```

## 🔐 Checklist de Seguridad

- [ ] SSL/HTTPS configurado
- [ ] Variables de entorno en .env (no en git)
- [ ] JWT_SECRET cambiado
- [ ] Base de datos con contraseña fuerte
- [ ] Firewall configurado
- [ ] CORS configurado para tu dominio
- [ ] Rate limiting activo
- [ ] Helmet.js activado
- [ ] Backups automáticos configurados

## 📊 Monitoreo

```bash
# Monitorear uso de recursos
pm2 monit

# Ver logs en tiempo real
pm2 logs

# Configurar rotación de logs
pm2 install pm2-logrotate
```

## 🆘 Troubleshooting

**Error: EADDRINUSE port 4000**
```bash
# Puerto ocupado, cambiar puerto en .env
# O matar proceso:
lsof -i :4000
kill -9 <PID>
```

**Error: Cannot find module**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --production
```

**Base de datos no conecta**
```bash
# Verificar credenciales en .env
# Verificar que BD está corriendo
# Verificar permisos de usuario
```

---

**¿Necesitas ayuda con pasos específicos? Comunícame:**
1. Tipo de hosting (Shared/VPS/Cloud)
2. Panel de control (cPanel/Plesk/SSH directo)
3. Base de datos disponible (MySQL/MongoDB)
4. Tu dominio
