# Guia de Testes - ARPS-SUPEL

## Requisitos

- Backend rodando em `http://localhost:3001`
- PostgreSQL com banco `arps_supel` criado
- Ferramenta para testar API (curl, Postman, Insomnia, ou http.client do VS Code)

## Testando com cURL

### 1. Health Check

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "timestamp": "2026-01-20T10:30:00.000Z"
}
```

### 2. Criar uma Ata

```bash
curl -X POST http://localhost:3001/api/atas \
  -H "Content-Type: application/json" \
  -d '{
    "nup": "123456789",
    "modalidade": "CC 001/2025",
    "arpNumero": "001/2025",
    "orgaoGerenciador": "MCTIC",
    "objeto": "Aquisição de equipamentos de TI para a pasta",
    "vigenciaFinal": "2025-12-31T23:59:59Z",
    "valorTotal": 100000.00
  }'
```

Resposta esperada (201):
```json
{
  "success": true,
  "data": {
    "id": "ata-uuid-aqui",
    "nup": "123456789",
    "modalidade": "CC 001/2025",
    "arpNumero": "001/2025",
    "orgaoGerenciador": "MCTIC",
    "objeto": "Aquisição de equipamentos de TI para a pasta",
    "vigenciaFinal": "2025-12-31T23:59:59.000Z",
    "valorTotal": "100000.00",
    "valorAdesao": "200000.00",
    "saldoDisponivel": "200000.00",
    "ativa": true,
    "adesoes": [],
    "criadoEm": "2026-01-20T10:30:00.000Z",
    "atualizadoEm": "2026-01-20T10:30:00.000Z"
  }
}
```

### 3. Listar Atas

```bash
curl http://localhost:3001/api/atas
```

Adicionar paginação:
```bash
curl "http://localhost:3001/api/atas?page=1&limit=10"
```

Adicionar filtros:
```bash
curl "http://localhost:3001/api/atas?orgaoGerenciador=MCTIC&ativa=true"
```

### 4. Obter Ata Específica

```bash
# Substituir {ata-id} pelo ID da ata criada
curl http://localhost:3001/api/atas/{ata-id}
```

### 5. Atualizar Ata

```bash
curl -X PATCH http://localhost:3001/api/atas/{ata-id} \
  -H "Content-Type: application/json" \
  -d '{
    "objeto": "Aquisição de equipamentos de TI - versão atualizada",
    "valorTotal": 120000.00
  }'
```

Obs: Quando `valorTotal` é alterado, `valorAdesao` e `saldoDisponivel` são recalculados automaticamente.

### 6. Criar uma Adesão

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

Resposta esperada (201):
```json
{
  "success": true,
  "data": {
    "id": "adesao-uuid",
    "ataId": "{ata-id}",
    "numeroIdentificador": "ADESAO-001",
    "data": "2026-01-20T10:30:00.000Z",
    "orgaoAderente": "MEC",
    "valorAderido": "50000.00",
    "criadoEm": "2026-01-20T10:30:00.000Z",
    "atualizadoEm": "2026-01-20T10:30:00.000Z"
  }
}
```

### 7. Listar Adesões

```bash
# Todas as adesões
curl http://localhost:3001/api/adesoes

# Adesões de uma ata específica
curl http://localhost:3001/api/adesoes/ata/{ata-id}

# Com paginação
curl "http://localhost:3001/api/adesoes?page=1&limit=10"
```

### 8. Atualizar Adesão

```bash
curl -X PATCH http://localhost:3001/api/adesoes/{adesao-id} \
  -H "Content-Type: application/json" \
  -d '{
    "valorAderido": 60000.00
  }'
```

### 9. Deletar Adesão

```bash
curl -X DELETE http://localhost:3001/api/adesoes/{adesao-id}
```

Resposta esperada (200):
```json
{
  "success": true,
  "message": "Adesão deletada com sucesso"
}
```

### 10. Dashboard

```bash
# Overview geral
curl http://localhost:3001/api/dashboard

# Atas com saldo crítico
curl http://localhost:3001/api/dashboard/saldo-critico

# Atas vencendo
curl http://localhost:3001/api/dashboard/vencendo

# Resumos por órgão
curl http://localhost:3001/api/dashboard/resumos-orgao
```

## Testando Validações

### Erro: Valor individual acima do limite

```bash
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d '{
    "ataId": "{ata-id}",
    "numeroIdentificador": "ADESAO-002",
    "orgaoAderente": "MJ",
    "valorAderido": 60000.00
  }'
```

Resposta esperada (400):
```json
{
  "success": false,
  "error": {
    "message": "Valor da adesão (R$ 60.000,00) excede o limite de 50% do valor total (R$ 50.000,00)"
  }
}
```

### Erro: Soma total acumulada

Após criar uma adesão de 50.000, tentar criar outra de 150.000:

```bash
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d '{
    "ataId": "{ata-id}",
    "numeroIdentificador": "ADESAO-003",
    "orgaoAderente": "MIDR",
    "valorAderido": 150000.00
  }'
```

Resposta esperada (400):
```json
{
  "success": false,
  "error": {
    "message": "Soma das adesões (R$ 200.000,00) excede o limite de 200% do valor total (R$ 200.000,00)"
  }
}
```

## Cenário Completo de Teste

### 1. Criar uma ata com 100.000

```bash
ATA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/atas \
  -H "Content-Type: application/json" \
  -d '{
    "nup": "987654321",
    "modalidade": "PE 002/2025",
    "arpNumero": "002/2025",
    "orgaoGerenciador": "MCTIC",
    "objeto": "Contratação de serviços",
    "vigenciaFinal": "2025-12-31T23:59:59Z",
    "valorTotal": 100000
  }')

ATA_ID=$(echo $ATA_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "Ata criada com ID: $ATA_ID"
```

### 2. Criar 3 adesões

```bash
# Adesão 1: 40.000
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d "{
    \"ataId\": \"$ATA_ID\",
    \"numeroIdentificador\": \"ADESAO-001\",
    \"orgaoAderente\": \"MEC\",
    \"valorAderido\": 40000
  }"

# Adesão 2: 50.000
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d "{
    \"ataId\": \"$ATA_ID\",
    \"numeroIdentificador\": \"ADESAO-002\",
    \"orgaoAderente\": \"MJ\",
    \"valorAderido\": 50000
  }"

# Adesão 3: 110.000
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d "{
    \"ataId\": \"$ATA_ID\",
    \"numeroIdentificador\": \"ADESAO-003\",
    \"orgaoAderente\": \"MIDR\",
    \"valorAderido\": 110000
  }"
```

### 3. Verificar Dashboard

```bash
curl http://localhost:3001/api/dashboard
```

Esperado:
- totalAtasAtivas: 1
- totalAdesoes: 3
- saldoTotalDisponivel: 0 (200.000 - 40.000 - 50.000 - 110.000 = 0)
- atasComSaldoCritico: 1

### 4. Obter Ata e Verificar Saldo

```bash
curl http://localhost:3001/api/atas/$ATA_ID
```

## Usando Prisma Studio

Para visualizar dados diretamente no banco:

```bash
cd backend
npm run prisma:studio
```

Abrirá interface em `http://localhost:5555`

## Exportar Dados (opcional)

### Backup do banco

```bash
# PostgreSQL
pg_dump arps_supel > backup.sql
```

### Restaurar

```bash
psql arps_supel < backup.sql
```

## Testes com Insomnia/Postman

Importar arquivo de requisições (criar arquivo `.json`):

```json
{
  "client": "Thunder Client",
  "collectionName": "ARPS-SUPEL",
  "dateExport": "2026-01-20",
  "version": "1.1",
  "folders": [
    {
      "name": "Atas",
      "requests": [
        {
          "name": "Listar Atas",
          "url": "{{BASE_URL}}/api/atas",
          "method": "GET"
        },
        {
          "name": "Criar Ata",
          "url": "{{BASE_URL}}/api/atas",
          "method": "POST",
          "body": {
            "raw": "{...}"
          }
        }
      ]
    }
  ]
}
```

## Observações

- Variáveis de ambiente: `BASE_URL=http://localhost:3001`
- Todos os valores monetários são Decimal(15,2)
- Datas em formato ISO 8601
- IDs são gerados automaticamente (CUID)
- Timestamps criados/atualizados são automáticos
