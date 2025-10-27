# 📧 Configuración de Email para Hotel Sol

## 🔧 Configuración Necesaria

Para que funcione el sistema de emails, necesitas configurar una **contraseña de aplicación** de Gmail:

### 1. Activar autenticación de dos factores en Gmail
- Ve a tu cuenta de Google: https://myaccount.google.com/
- Seguridad → Verificación en dos pasos
- Activa la verificación en dos pasos

### 2. Generar contraseña de aplicación
- En tu cuenta de Google, ve a Seguridad
- Busca "Contraseñas de aplicaciones" 
- Genera una nueva contraseña para "Correo"
- **IMPORTANTE:** Guarda esta contraseña de 16 caracteres

### 3. Configurar el archivo .env
Edita el archivo `backend/.env` y reemplaza:

```
EMAIL_PASSWORD=your-gmail-app-password-here
```

Por:

```
EMAIL_PASSWORD=tu-contraseña-de-aplicacion-aqui
```

## 📋 Ejemplo de .env completo

```properties
# Puerto del servidor backend
PORT=4000

# Configuración de base de datos
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hotelsol

# Configuración JWT
JWT_SECRET=hotel_management_secret_key_2024

# Environment
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:4321

# Configuración de Email
EMAIL_USER=kokocardenas7011@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # ← Aquí va tu contraseña de aplicación
```

## 🚀 Cómo funciona

1. **Cliente llena formulario** en `/rooms`
2. **Sistema verifica disponibilidad** (simplificado para desarrollo)
3. **Email se envía automáticamente** a `kokocardenas7011@gmail.com`
4. **Recibes notificación** con todos los datos del cliente
5. **Contactas al cliente** usando email o teléfono incluidos

## 📧 Contenido del Email

El email incluye:
- ✅ **Datos del cliente:** Nombre, email, teléfono
- ✅ **Detalles de reserva:** Tipo habitación, fechas, huéspedes
- ✅ **Botones directos:** Para llamar o responder email
- ✅ **Diseño profesional:** HTML responsivo y elegante

## 🔧 Troubleshooting

### Error "Invalid login"
- Verifica que tengas 2FA activado
- Usa contraseña de aplicación, no tu contraseña normal

### Error "EAUTH"
- Revisa el EMAIL_PASSWORD en .env
- Asegúrate que no hay espacios extra

### Emails no llegan
- Revisa spam/promociones
- Verifica que el EMAIL_USER sea correcto

## 📞 Soporte

Si tienes problemas:
1. Verifica la configuración de Gmail
2. Revisa los logs del servidor
3. Prueba con otro email si es necesario

¡Una vez configurado, recibirás todas las solicitudes de reserva automáticamente! 🎉