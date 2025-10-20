#!/bin/bash

# Script para iniciar Next.js en modo standalone
# Copia archivos estáticos necesarios antes de iniciar el servidor

echo "🚀 Preparando modo standalone..."

# Copiar archivos estáticos
if [ -d ".next/static" ]; then
  echo "📁 Copiando .next/static..."
  cp -r .next/static .next/standalone/.next/
fi

if [ -d "public" ]; then
  echo "📁 Copiando public..."
  cp -r public .next/standalone/
fi

echo "✅ Archivos copiados"
echo "🌐 Iniciando servidor standalone..."

# Iniciar servidor
cd .next/standalone
node server.js
