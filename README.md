# Hotel Management System

Un sistema completo de gestión hotelera desarrollado con tecnologías modernas.

## 🏗️ Stack Tecnológico

### Frontend
- **Astro** - Framework web moderno
- **Vue.js 3** - Framework reactivo (Composition API)
- **Tailwind CSS** - Framework de estilos utilitarios
- **TypeScript** - Tipado estático

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **JWT** - Autenticación con tokens
- **Helmet** - Middleware de seguridad
- **CORS** - Control de acceso de origen cruzado
- **Rate Limiting** - Limitación de velocidad

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **pg** - Cliente PostgreSQL para Node.js

## 📁 Estructura del Proyecto

```
hotel-management-system/
├── src/                          # Frontend (Astro + Vue)
│   ├── components/
│   │   └── vue/                  # Componentes Vue
│   │       ├── HeroSection.vue
│   │       ├── FeaturesSection.vue
│   │       ├── ContactSection.vue
│   │       └── Dashboard.vue
│   ├── layouts/
│   │   └── Layout.astro          # Layout principal
│   └── pages/
│       ├── index.astro           # Página principal
│       └── admin/
│           └── dashboard.astro   # Panel de administración
├── backend/                      # Backend (Node.js + Express)
│   ├── config/
│   │   ├── postgres.js          # Configuración PostgreSQL
│   │   └── mongodb.js           # Configuración MongoDB
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── hotel.js             # Rutas de habitaciones
│   │   └── bookings.js          # Rutas de reservas
│   └── server.js                # Servidor principal
├── package.json                 # Dependencias del proyecto
├── astro.config.mjs            # Configuración de Astro
├── tailwind.config.mjs         # Configuración de Tailwind
├── tsconfig.json               # Configuración TypeScript
└── .env.example                # Variables de entorno de ejemplo
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del servidor
PORT=4000
NODE_ENV=development

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_management
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/hotel_management

# JWT Secret
JWT_SECRET=tu-clave-secreta-jwt-muy-segura

# Configuración CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Base de Datos

#### PostgreSQL
```sql
CREATE DATABASE hotel_management;
```

#### MongoDB
Asegúrate de que MongoDB esté ejecutándose en tu sistema.

### 4. Ejecutar el Proyecto

#### Desarrollo del Frontend (Astro + Vue)
```bash
npm run dev
```

#### Desarrollo del Backend (Express)
```bash
npm run server:dev
```

#### Producción del Backend
```bash
npm run server:start
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil de usuario

### Habitaciones
- `GET /api/hotel/rooms` - Obtener todas las habitaciones
- `GET /api/hotel/rooms/available` - Obtener habitaciones disponibles
- `GET /api/hotel/rooms/:id` - Obtener habitación por ID
- `POST /api/hotel/rooms` - Crear nueva habitación
- `PATCH /api/hotel/rooms/:id/availability` - Actualizar disponibilidad

### Reservas
- `GET /api/bookings` - Obtener todas las reservas
- `POST /api/bookings` - Crear nueva reserva
- `GET /api/bookings/:id` - Obtener reserva por ID
- `PATCH /api/bookings/:id/status` - Actualizar estado de reserva
- `DELETE /api/bookings/:id` - Cancelar reserva

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 🛡️ Características de Seguridad

- **Helmet.js** - Configuración automática de headers de seguridad
- **CORS** - Control de acceso de origen cruzado
- **Rate Limiting** - Limitación de peticiones por IP
- **JWT** - Tokens seguros para autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Validación de entrada** - Sanitización de datos

## 🔧 Tecnologías Destacadas

### Frontend Moderno
- **Astro Islands** - Hidratación selectiva de componentes
- **Vue.js 3** - Composition API para mejor organización del código
- **Tailwind CSS** - Clases utilitarias para diseño rápido
- **TypeScript** - Tipado estático para mejor desarrollo

### Backend Escalable
- **Express.js** - Framework minimalista y flexible
- **Dual Database Support** - Soporte para PostgreSQL y MongoDB
- **Middleware Stack** - Seguridad, logging y rate limiting
- **RESTful API** - Arquitectura estándar de API

## 🌟 Características del Sistema

- ✅ Gestión completa de reservas
- ✅ Panel de administración intuitivo
- ✅ Autenticación JWT segura
- ✅ Soporte dual de bases de datos
- ✅ API REST completa
- ✅ Interfaz responsive
- ✅ Middleware de seguridad
- ✅ Rate limiting
- ✅ Logging de peticiones
- ✅ Validación de datos
- ✅ Manejo de errores

## 🚀 Despliegue

El proyecto está listo para ser desplegado en:

- **Frontend**: Vercel, Netlify, o cualquier hosting estático
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Base de datos**: 
  - PostgreSQL: Supabase, Neon, Railway
  - MongoDB: MongoDB Atlas

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o crea un pull request.

---

**Desarrollado con ❤️ usando tecnologías modernas**