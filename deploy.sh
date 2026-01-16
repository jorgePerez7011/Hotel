#!/bin/bash

# Script de Despliegue Automático para Hosttiger
# Uso: bash deploy.sh

set -e  # Salir si hay error

echo "🚀 Iniciando despliegue de Hotel Management System..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_PATH=$(pwd)
BACKUP_DIR="$PROJECT_PATH/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${YELLOW}📦 Paso 1: Backup de los archivos actuales${NC}"
if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
fi
cp -r "$PROJECT_PATH" "$BACKUP_DIR/backup_$TIMESTAMP"
echo -e "${GREEN}✅ Backup creado: backup_$TIMESTAMP${NC}"

echo -e "${YELLOW}📥 Paso 2: Actualizar código${NC}"
git pull origin main
echo -e "${GREEN}✅ Código actualizado${NC}"

echo -e "${YELLOW}📦 Paso 3: Instalar dependencias${NC}"
npm install --production
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

echo -e "${YELLOW}🏗️  Paso 4: Build del proyecto${NC}"
npm run build
echo -e "${GREEN}✅ Build completado${NC}"

echo -e "${YELLOW}🔄 Paso 5: Reiniciar servicios${NC}"
if command -v pm2 &> /dev/null; then
  pm2 restart all --update-env
  echo -e "${GREEN}✅ Servicios reiniciados con PM2${NC}"
elif command -v systemctl &> /dev/null; then
  sudo systemctl restart hotel-app
  echo -e "${GREEN}✅ Servicio reiniciado con systemctl${NC}"
else
  echo -e "${RED}⚠️  No se pudo reiniciar automaticamente. Reinicia manualmente.${NC}"
fi

echo -e "${YELLOW}🧪 Paso 6: Verificar salud de la aplicación${NC}"
sleep 3
if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend operativo${NC}"
else
  echo -e "${RED}❌ Frontend no responde${NC}"
fi

if curl -f http://localhost:4000/api > /dev/null 2>&1; then
  echo -e "${GREEN}✅ API operativa${NC}"
else
  echo -e "${RED}❌ API no responde${NC}"
fi

echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
echo -e "${YELLOW}Logs: pm2 logs${NC}"
