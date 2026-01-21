#!/bin/bash

# ARPS-SUPEL - Quick Start Script
# Execute este script para setup inicial rápido

echo "==============================================="
echo "ARPS-SUPEL - Sistema de Controle de Adesões"
echo "==============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "${YELLOW}[1/5]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "${RED}✗ Node.js não encontrado. Instale em https://nodejs.org${NC}"
    exit 1
fi
echo "${GREEN}✓ Node.js $(node -v)${NC}"

# Verificar PostgreSQL
echo ""
echo "${YELLOW}[2/5]${NC} Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "${RED}✗ PostgreSQL não encontrado. Instale em https://www.postgresql.org${NC}"
    exit 1
fi
echo "${GREEN}✓ PostgreSQL encontrado${NC}"

# Setup Backend
echo ""
echo "${YELLOW}[3/5]${NC} Configurando Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "   Criando arquivo .env..."
    cp .env.example .env
    echo "${RED}   ⚠ Edite backend/.env com suas credenciais do banco${NC}"
fi

echo "   Instalando dependências..."
npm install > /dev/null 2>&1

echo "${GREEN}✓ Backend configurado${NC}"
cd ..

# Setup Frontend
echo ""
echo "${YELLOW}[4/5]${NC} Configurando Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "   Criando arquivo .env..."
    cp .env.example .env
fi

echo "   Instalando dependências..."
npm install > /dev/null 2>&1

echo "${GREEN}✓ Frontend configurado${NC}"
cd ..

# Setup Banco de Dados
echo ""
echo "${YELLOW}[5/5]${NC} Setup do Banco de Dados..."
cd backend

if [ -f ".env" ]; then
    echo "   Executando migrations..."
    npm run prisma:migrate > /dev/null 2>&1
    echo "${GREEN}✓ Banco de dados criado${NC}"
else
    echo "${RED}✗ Arquivo .env não encontrado. Configure primeiro.${NC}"
fi

cd ..

# Resumo
echo ""
echo "==============================================="
echo "${GREEN}✓ Setup concluído com sucesso!${NC}"
echo "==============================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Terminal 1 - Iniciar Backend:"
echo "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "2. Terminal 2 - Iniciar Frontend:"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Abrir no navegador:"
echo "   Frontend: ${YELLOW}http://localhost:3000${NC}"
echo "   Backend Health: ${YELLOW}http://localhost:3001/health${NC}"
echo ""
echo "4. (Opcional) Visualizar dados:"
echo "   ${YELLOW}cd backend && npm run prisma:studio${NC}"
echo "   Prisma Studio: ${YELLOW}http://localhost:5555${NC}"
echo ""
echo "Documentação:"
echo "   - Setup completo: ${YELLOW}cat SETUP.md${NC}"
echo "   - Guia de testes: ${YELLOW}cat TESTES.md${NC}"
echo "   - Validações: ${YELLOW}cat VALIDACOES.md${NC}"
echo "   - Backend API: ${YELLOW}cat backend/README.md${NC}"
echo "   - Frontend: ${YELLOW}cat frontend/README.md${NC}"
echo ""
echo "==============================================="
