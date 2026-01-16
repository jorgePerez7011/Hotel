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

-- Verificar que la tabla fue creada o ya existe
SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'companies' AND TABLE_SCHEMA = DATABASE();
