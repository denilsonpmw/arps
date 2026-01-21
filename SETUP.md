# Setup Guide - ARPS-SUPEL

## 1. Pré-requisitos

- Node.js 18+ (download em https://nodejs.org)
- PostgreSQL 12+ (download em https://www.postgresql.org)
- Git

## 2. Configuração do Banco de Dados

### MacOS (usando Homebrew)

```bash
# Instalar PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Criar banco de dados
createdb arps_supel

# (Opcional) Criar usuário específico
createuser -P arps_supel_user
psql arps_supel -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO arps_supel_user;"
```

### Windows

1. Baixe o PostgreSQL em https://www.postgresql.org/download/windows/
2. Execute o installer e siga as instruções
3. Crie um novo banco de dados chamado `arps_supel`

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb arps_supel
```

## 3. Setup Backend

```bash
cd backend

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas credenciais do banco
# DATABASE_URL="postgresql://user:password@localhost:5432/arps_supel"

# Instalar dependências
npm install

# Executar migrations
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## 4. Setup Frontend

```bash
cd frontend

# Copiar arquivo de ambiente
cp .env.example .env

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 5. Testando a Aplicação

### Via API (curl)

```bash
# Health check
curl http://localhost:3001/health

# Criar uma ata
curl -X POST http://localhost:3001/api/atas \
  -H "Content-Type: application/json" \
  -d '{
    "nup": "123456789",
    "modalidade": "CC 001/2025",
    "arpNumero": "001/2025",
    "orgaoGerenciador": "MCTIC",
    "objeto": "Aquisição de equipamentos",
    "vigenciaFinal": "2025-12-31",
    "valorTotal": 100000
  }'

# Listar atas
curl http://localhost:3001/api/atas

# Dashboard
curl http://localhost:3001/api/dashboard
```

### Via Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Abrirá uma interface visual para gerenciar dados em `http://localhost:5555`

## 6. Documentação

- **Backend**: Ver `backend/README.md` para endpoints e documentação da API
- **Frontend**: Ver `frontend/README.md` para estrutura e componentes

## 7. Estrutura de Pastas

```
arps-supel/
├── backend/                 # API REST Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Definição de rotas
│   │   ├── schemas/         # Validação com Zod
│   │   ├── middleware/      # Middlewares
│   │   ├── utils/           # Utilitários
│   │   └── lib/             # Configurações
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   └── package.json
│
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── services/        # Serviços de API
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilitários
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
│
├── README.md
└── SETUP.md (este arquivo)
```

## 8. Troubleshooting

### Erro: "DATABASE_URL is invalid"
- Verifique se PostgreSQL está rodando
- Verifique string de conexão em `.env`
- Para PostgreSQL local: `postgresql://postgres:password@localhost:5432/arps_supel`

### Erro: "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Erro: "Cannot find module 'react'"
```bash
cd frontend
npm install
```

### Porta 3001 já está em uso
```bash
# Matar processo que está usando a porta
lsof -ti:3001 | xargs kill -9
```

### Porta 3000 já está em uso
```bash
# Matar processo que está usando a porta
lsof -ti:3000 | xargs kill -9
```

## 9. Build para Produção

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Arquivos estáticos em dist/
```

## 10. Próximas Etapas

- [ ] Configurar autenticação (JWT)
- [ ] Adicionar testes
- [ ] Configurar CI/CD
- [ ] Deploy em servidor
- [ ] Adicionar backup automático

## Suporte

Para dúvidas ou problemas, consulte:
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Documentação do Prisma: https://www.prisma.io/docs/
- Documentação do Express: https://expressjs.com
- Documentação do React: https://react.dev
