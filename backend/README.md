# ARPS-SUPEL Backend

API REST para gerenciar adesões a atas de registro de preços.

## Setup

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+

### Instalação

1. Instalar dependências:
```bash
npm install
```

2. Criar arquivo `.env` baseado em `.env.example`:
```bash
cp .env.example .env
```

3. Configurar banco de dados no `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/arps_supel"
```

4. Executar migrations:
```bash
npm run prisma:migrate
```

5. Iniciar o servidor:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## Scripts

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor compilado
- `npm run prisma:migrate` - Executa migrations do Prisma
- `npm run prisma:studio` - Abre Prisma Studio para gerenciar dados
- `npm test` - Executa testes
- `npm run lint` - Verifica linting

## API Endpoints

### Atas

#### Criar Ata
```
POST /api/atas
Content-Type: application/json

{
  "nup": "123456789",
  "modalidade": "CC 001/2025",
  "arpNumero": "001/2025",
  "orgaoGerenciador": "MCTIC",
  "objeto": "Aquisição de equipamentos de TI",
  "vigenciaFinal": "2025-12-31T23:59:59Z",
  "valorTotal": 100000.00
}
```

#### Listar Atas
```
GET /api/atas?page=1&limit=10&orgaoGerenciador=MCTIC&ativa=true
```

#### Obter Ata
```
GET /api/atas/{id}
```

#### Atualizar Ata
```
PATCH /api/atas/{id}
Content-Type: application/json

{
  "objeto": "Nova descrição",
  "valorTotal": 150000.00
}
```

#### Deletar Ata
```
DELETE /api/atas/{id}
```

### Adesões

#### Criar Adesão
```
POST /api/adesoes
Content-Type: application/json

{
  "ataId": "ata-uuid",
  "numeroIdentificador": "ADESAO001",
  "orgaoAderente": "MEC",
  "valorAderido": 25000.00
}
```

#### Listar Adesões
```
GET /api/adesoes?page=1&limit=10&ataId=ata-uuid&orgaoAderente=MEC
```

#### Listar Adesões por Ata
```
GET /api/adesoes/ata/{ataId}?page=1&limit=10
```

#### Obter Adesão
```
GET /api/adesoes/{id}
```

#### Atualizar Adesão
```
PATCH /api/adesoes/{id}
Content-Type: application/json

{
  "valorAderido": 30000.00
}
```

#### Deletar Adesão
```
DELETE /api/adesoes/{id}
```

### Dashboard

#### Dashboard Geral
```
GET /api/dashboard

Response:
{
  "totalAtasAtivas": 15,
  "saldoTotalDisponivel": 750000.00,
  "totalAdesoes": 42,
  "adesoesvencendo": 5,
  "atasComSaldoCritico": 2,
  "atasAlerta": [...]
}
```

#### Atas com Saldo Crítico
```
GET /api/dashboard/saldo-critico
```

#### Atas Vencendo
```
GET /api/dashboard/vencendo
```

#### Resumos por Órgão
```
GET /api/dashboard/resumos-orgao
```

## Estrutura

```
backend/
├── src/
│   ├── index.ts              # Entrada principal
│   ├── controllers/          # Controladores das rotas
│   ├── services/             # Lógica de negócio
│   ├── routes/               # Definição de rotas
│   ├── schemas/              # Schemas de validação (Zod)
│   ├── middleware/           # Middlewares
│   ├── utils/                # Funções utilitárias
│   └── lib/                  # Configurações (Prisma, etc)
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
└── dist/                     # Arquivos compilados
```

## Validações de Negócio

### Adesão Individual
- Máximo: 50% do VALOR_TOTAL
- Mínimo: Maior que 0

### Saldo Total
- Máximo: 200% do VALOR_TOTAL (equivalente a VALOR_ADESAO)
- Cálculo: (VALOR_TOTAL * 0.5) * 4

### Saldo Disponível
- Fórmula: VALOR_ADESAO - Soma de todas as adesões
- Alerta quando: Saldo < 20% do VALOR_ADESAO

### Vigência
- Alerta quando: Data final é no mês atual

## Erros Comuns

### "Ata não encontrada"
Verificar se o ID da ata está correto.

### "Valor da adesão excede o limite"
Validar se o valor individual está dentro de 50% do VALOR_TOTAL.

### "Soma das adesões excede o limite"
Verificar se a soma total de adesões não excede 200% do VALOR_TOTAL.

## Documentação do Prisma

Para visualizar e gerenciar dados:
```bash
npm run prisma:studio
```

Para criar nova migration:
```bash
npm run prisma:migrate
```
