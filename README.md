# ARPS-SUPEL - Sistema de Controle de Adesões a Atas de Registro de Preços

Sistema web para gerenciar adesões a atas de registro de preços de acordo com a Lei 14.133/2021.

## Estrutura do Projeto

- **backend**: API REST em Node.js/Express com Prisma ORM
- **frontend**: Aplicação React com TypeScript e Tailwind CSS

## Requisitos Funcionais

### 1. Gestão de Atas de Registro de Preços
- Campos: NUP, MOD/Nº, ARP Nº, ÓRGÃO, OBJETO, VIGÊNCIA, VALOR_TOTAL, VALOR_ADESAO, ADERENTE, VALOR_ADERIDO, SALDO_DISPONIVEL
- CRUD completo
- Cálculos automáticos de valores

### 2. Gestão de Adesões
- Vinculadas a cada ata
- Validações de limite individual (50% do VALOR_TOTAL) e total (200% do VALOR_TOTAL)
- Atualização automática de saldo disponível

### 3. Dashboard
- Total de atas ativas
- Saldo total disponível
- Adesões em andamento
- Adesões vencendo

### 4. Alertas Visuais
- Saldo da ata abaixo de 20%
- Vigência final no mês atual

## Tecnologias

- **Backend**: Node.js, Express, Prisma, Zod, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Autenticação**: A definir
- **Deploy**: A definir

## Instalação

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Documentação da API

Ver `backend/README.md` para detalhes dos endpoints.
