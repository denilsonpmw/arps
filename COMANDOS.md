# Comandos Úteis - ARPS-SUPEL

## Setup Inicial

### macOS/Linux - Setup Rápido
```bash
# Torne o script executável
chmod +x quickstart.sh

# Execute o setup automático
./quickstart.sh
```

### Setup Manual

#### Backend
```bash
cd backend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com credenciais PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/arps_supel"

# Executar migrations
npm run prisma:migrate

# Iniciar servidor em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Iniciar servidor compilado
npm start
```

#### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar servidor em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Preview do build de produção
npm run preview
```

## Banco de Dados

### PostgreSQL - Criar Banco

#### macOS (com Homebrew)
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar serviço
brew services start postgresql@15

# Parar serviço
brew services stop postgresql@15

# Conectar ao PostgreSQL
psql postgres

# Dentro do psql:
CREATE DATABASE arps_supel;
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Conectar
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE arps_supel;
```

#### Windows
```cmd
# Após instalar PostgreSQL via installer
# Abrir PostgreSQL Shell (psql)

# Dentro do psql:
CREATE DATABASE arps_supel;
```

### Gerenciamento com Prisma

```bash
cd backend

# Visualizar interface gráfica (Prisma Studio)
npm run prisma:studio

# Criar nova migration
npm run prisma:migrate

# Gerar cliente Prisma
npm run prisma:generate

# Reset banco (delete all data)
npx prisma migrate reset
```

## Desenvolvimento

### Backend

```bash
cd backend

# Iniciar em modo desenvolvimento com auto-reload
npm run dev

# Compilar TypeScript
npm run build

# Verificar linting
npm run lint

# Corrigir linting automaticamente
npm run lint -- --fix

# Executar testes (quando implementados)
npm run test
```

### Frontend

```bash
cd frontend

# Iniciar em modo desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Preview do build
npm run preview

# Verificar linting
npm run lint

# Corrigir linting automaticamente
npm run lint -- --fix
```

## Testes de API

### Testar com cURL

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Criar Ata
```bash
curl -X POST http://localhost:3001/api/atas \
  -H "Content-Type: application/json" \
  -d '{
    "nup": "123456789",
    "modalidade": "CC 001/2025",
    "arpNumero": "001/2025",
    "orgaoGerenciador": "MCTIC",
    "objeto": "Aquisição de equipamentos",
    "vigenciaFinal": "2025-12-31T23:59:59Z",
    "valorTotal": 100000.00
  }'
```

#### Listar Atas
```bash
curl http://localhost:3001/api/atas
curl "http://localhost:3001/api/atas?page=1&limit=10"
curl "http://localhost:3001/api/atas?orgaoGerenciador=MCTIC&ativa=true"
```

#### Obter Ata
```bash
curl http://localhost:3001/api/atas/{id}
```

#### Atualizar Ata
```bash
curl -X PATCH http://localhost:3001/api/atas/{id} \
  -H "Content-Type: application/json" \
  -d '{"objeto": "Nova descrição"}'
```

#### Deletar Ata
```bash
curl -X DELETE http://localhost:3001/api/atas/{id}
```

#### Criar Adesão
```bash
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d '{
    "ataId": "{ata-id}",
    "numeroIdentificador": "ADESAO-001",
    "orgaoAderente": "MEC",
    "valorAderido": 50000.00
  }'
```

#### Dashboard
```bash
curl http://localhost:3001/api/dashboard
curl http://localhost:3001/api/dashboard/saldo-critico
curl http://localhost:3001/api/dashboard/vencendo
curl http://localhost:3001/api/dashboard/resumos-orgao
```

### Testar com Postman/Insomnia

1. Importar coleção de requisições
2. Configurar variável `BASE_URL=http://localhost:3001`
3. Executar requisições

Ver `TESTES.md` para exemplos completos.

## Troubleshooting

### Porta Já em Uso

#### Backend (3001)
```bash
# Verificar processo
lsof -i :3001

# Matar processo
kill -9 <PID>

# Ou usar outra porta (editar .env ou vite.config)
PORT=3002 npm run dev
```

#### Frontend (3000)
```bash
# Verificar processo
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### PostgreSQL Não Conecta

```bash
# Verificar se está rodando
brew services list

# Iniciar
brew services start postgresql@15

# Conectar manualmente
psql postgres

# Se pedir senha, verificar em .env
# Padrão: postgresql://postgres:password@localhost:5432/arps_supel
```

### Erro: "Cannot find module"

```bash
# Backend
cd backend
npm install
npm run prisma:generate

# Frontend
cd frontend
npm install
```

### Erro de Banco de Dados

```bash
cd backend

# Reset completo
npx prisma migrate reset

# Ou:
# 1. Deletar banco: DROP DATABASE arps_supel;
# 2. Criar banco: CREATE DATABASE arps_supel;
# 3. Executar: npm run prisma:migrate
```

## Build e Deploy

### Build Backend

```bash
cd backend

# Compilar
npm run build

# Testar build
npm start

# Ou deploy direto:
# - Heroku: git push heroku main
# - Docker: docker build -t arps-backend .
```

### Build Frontend

```bash
cd frontend

# Compilar
npm run build

# Saída em: dist/
# Deploy a pasta dist/ em CDN ou servidor web
```

## Scripts Úteis

### Resetar Tudo (desenvolvimento)

```bash
cd backend
npm run prisma:migrate -- --reset
npm run dev
```

```bash
cd frontend
npm run dev
```

### Limpeza

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Atualizar Dependências

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

## Git

### Inicial

```bash
git init
git add .
git commit -m "Initial commit: ARPS-SUPEL project structure"
git remote add origin <seu-repositorio>
git push -u origin main
```

### Desenvolvimento

```bash
# Verificar alterações
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push
git push

# Pull
git pull
```

## Documentação

### Ver Documentação

```bash
# Visão geral
cat README.md

# Setup detalhado
cat SETUP.md

# Resumo da implementação
cat RESUMO.md

# Validações e regras de negócio
cat VALIDACOES.md

# Guia de testes
cat TESTES.md

# Lista de arquivos criados
cat ARQUIVOS.md

# Backend API
cat backend/README.md

# Frontend
cat frontend/README.md
```

## Ambiente

### Variáveis de Ambiente - Backend

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/arps_supel"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### Variáveis de Ambiente - Frontend

```env
# .env
VITE_API_URL=http://localhost:3001
```

## Dicas

1. **Sempre** executar `npm install` após clonar projeto
2. **Verificar** `.env` antes de iniciar
3. **Usar** Prisma Studio (`npm run prisma:studio`) para debug de dados
4. **Checar** logs do console para erros
5. **Consultar** documentação antes de modificar schemas

## Recursos

- Node.js: https://nodejs.org
- Express: https://expressjs.com
- Prisma: https://www.prisma.io
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org
- PostgreSQL: https://www.postgresql.org

## Contato

Para dúvidas ou problemas:
1. Consulte a documentação (README.md, SETUP.md, etc)
2. Verifique TESTES.md para exemplos
3. Consulte logs de erro
4. Verifique VALIDACOES.md para regras de negócio
