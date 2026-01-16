#!/bin/bash

# Script para crear la tabla de empresas en la base de datos Hotel Sol

echo "🏨 Hotel Sol - Creación de tabla de empresas"
echo "============================================"

# Configuración de conexión
MYSQL_USER="root"
MYSQL_PASSWORD=""
MYSQL_HOST="localhost"
MYSQL_DB="hotelsol"

echo "📊 Conectando a la base de datos: $MYSQL_DB"

# Ejecutar el script SQL
mysql -u $MYSQL_USER -h $MYSQL_HOST "$MYSQL_DB" <<EOF

-- Crear tabla de empresas si no existe
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nit VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de identificación tributaria',
  name VARCHAR(255) NOT NULL COMMENT 'Nombre de la empresa',
  description TEXT COMMENT 'Descripción o notas sobre la empresa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  INDEX idx_nit (nit),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla para almacenar información de empresas';

-- Insertar empresas de ejemplo si la tabla está vacía
INSERT IGNORE INTO companies (nit, name, description) VALUES
('800000000-0', 'SERINCO DRILLING', 'Empresa de perforación'),
('800000001-1', 'ERAZO VALENCIA', 'Asesoría y consultoría'),
('800000002-2', 'GRANTIERRA', 'Empresa agrícola'),
('800000003-3', 'AMBIENCIQ', 'Gestión ambiental'),
('800000004-4', 'BUREAU VERITAS', 'Auditoría y certificación');

-- Verificar que la tabla fue creada
SELECT 'Tabla de empresas creada correctamente' as status;
SELECT COUNT(*) as total_empresas FROM companies;

EOF

if [ $? -eq 0 ]; then
  echo "✅ Tabla de empresas creada exitosamente"
else
  echo "❌ Error al crear la tabla de empresas"
  exit 1
fi
