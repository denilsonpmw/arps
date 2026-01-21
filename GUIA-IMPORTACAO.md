# Guia de Importação de Processos de RP

## Visão Geral

O sistema ARPS-SUPEL agora possui uma funcionalidade completa de importação de processos de Registro de Preços a partir de arquivos JSON.

## Como Usar

### 1. Interface Web (Frontend)

1. Acesse a página **Atas de Registro de Preços**
2. Clique no botão **"Importar"** (ícone de upload)
3. Selecione o arquivo JSON com os processos
4. Revise o preview com as estatísticas de importação:
   - Total de processos no arquivo
   - Processos válidos para importar
   - Processos inválidos (revogados ou sem valor)
   - NUPs duplicados (que já existem no sistema)
5. Clique em **"Importar"** para executar
6. Aguarde a conclusão e visualize o resultado

### 2. API (Backend)

#### Endpoint: Preview de Importação

```bash
POST /api/import/preview
Content-Type: application/json

{
  "success": true,
  "count": 38,
  "data": [...]
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "totalProcessos": 38,
    "processosValidos": 37,
    "processosInvalidos": 1,
    "nupsDuplicados": 0
  }
}
```

#### Endpoint: Executar Importação

```bash
POST /api/import/executar
Content-Type: application/json

{
  "success": true,
  "count": 38,
  "data": [...]
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "total": 38,
    "importados": 37,
    "ignorados": 1,
    "erros": [],
    "atasImportadas": [
      {
        "nup": "00000.0.062821/2025",
        "arpNumero": "PE 053/2025"
      }
    ]
  }
}
```

### 3. Linha de Comando

```bash
# Preview
curl -X POST http://localhost:3001/api/import/preview \
  -H "Content-Type: application/json" \
  -d @processos_rp_conclusao_2026-01-21.json | jq .

# Executar importação
curl -X POST http://localhost:3001/api/import/executar \
  -H "Content-Type: application/json" \
  -d @processos_rp_conclusao_2026-01-21.json | jq .
```

## Formato do Arquivo JSON

O arquivo deve ter a seguinte estrutura:

```json
{
  "success": true,
  "count": 38,
  "filtros": {
    "rp": true,
    "conclusao": true
  },
  "data": [
    {
      "nup": "00000.0.062821/2025",
      "objeto": "AQUISIÇÃO DE TIRA TESTE...",
      "ug": "SEMUS",
      "modalidade": "PE",
      "numero_ano": "053/2025",
      "situacao": "Finalizado",
      "valor_realizado": 523500,
      "rp": true,
      "conclusao": true
    }
  ]
}
```

### Campos Obrigatórios

- **nup**: Número Único de Processo
- **objeto**: Descrição do objeto da licitação
- **ug**: Unidade Gestora / Órgão Gerenciador
- **modalidade**: Modalidade da licitação (PE, CC, DE, etc.)
- **numero_ano**: Número e ano da licitação (ex: 053/2025)
- **valor_realizado**: Valor total em centavos ou reais
- **rp**: Indica se é Registro de Preços (true)
- **conclusao**: Indica se está concluído (true)

## Regras de Validação

### Processos Válidos

Serão importados processos que atendam **todos** os critérios:

- ✅ `rp === true`
- ✅ `conclusao === true`
- ✅ `situacao !== "Revogado"`
- ✅ `valor_realizado > 0`
- ✅ NUP não existe no sistema

### Processos Ignorados

Serão ignorados processos que:

- ❌ `rp === false`
- ❌ `conclusao === false`
- ❌ `situacao === "Revogado"`
- ❌ `valor_realizado === 0`
- ❌ NUP já existe no sistema

## Mapeamento de Dados

| Campo no JSON       | Campo na Ata          | Observação                           |
|--------------------|-----------------------|--------------------------------------|
| `nup`              | `nup`                 | Identificador único                  |
| `modalidade`       | `modalidade`          | PE, CC, DE, etc.                     |
| `numero_ano`       | Parte de `arpNumero`  | Combinado com modalidade             |
| `ug`               | `orgaoGerenciador`    | Sigla do órgão                       |
| `objeto`           | `objeto`              | Descrição completa                   |
| `valor_realizado`  | `valorTotal`          | Valor em reais                       |
| -                  | `valorAdesao`         | Calculado: 50% do valor total        |
| -                  | `saldoDisponivel`     | Inicial: igual a valorAdesao         |
| -                  | `vigenciaFinal`       | Calculado: 1 ano a partir de hoje    |

## Exemplo de Resultado

Após uma importação bem-sucedida de 38 processos:

```json
{
  "total": 38,
  "importados": 37,
  "ignorados": 1,
  "erros": [],
  "atasImportadas": [
    { "nup": "00000.0.062821/2025", "arpNumero": "PE 053/2025" },
    { "nup": "00000.0.051845/2025", "arpNumero": "DE 115/2025" },
    ...
  ]
}
```

**Estatísticas:**

- ✅ 37 atas criadas com sucesso
- ⚠️ 1 processo ignorado (situação "Revogado")
- ❌ 0 erros durante a importação

## Verificação Pós-Importação

Após a importação, você pode verificar:

```bash
# Total de atas no sistema
curl http://localhost:3001/api/atas | jq '.data | length'

# Visualizar uma ata específica
curl http://localhost:3001/api/atas | jq '.data[] | select(.nup == "00000.0.062821/2025")'

# Dashboard atualizado
curl http://localhost:3001/api/dashboard | jq .
```

## Tratamento de Erros

### Erros Comuns

1. **Arquivo inválido**
   - Mensagem: "Arquivo inválido. Esperado um objeto com propriedade 'data'..."
   - Solução: Verifique a estrutura do JSON

2. **NUP duplicado**
   - Comportamento: Processo é ignorado
   - Registro: Aparece em `nupsDuplicados` no preview

3. **Dados inconsistentes**
   - Comportamento: Processo é adicionado a `erros[]`
   - Detalhes: Mensagem de erro específica para cada processo

## Arquivos Implementados

### Backend

- `backend/src/services/importService.ts` - Lógica de importação
- `backend/src/routes/importRoutes.ts` - Endpoints da API
- `backend/src/index.ts` - Registro da rota `/api/import`

### Frontend

- `frontend/src/services/importService.ts` - Cliente HTTP
- `frontend/src/components/ImportModal.tsx` - Interface de importação
- `frontend/src/pages/Atas.tsx` - Botão de importação

## Teste Realizado

Foi realizado um teste completo com o arquivo `processos_rp_conclusao_2026-01-21.json`:

- ✅ Preview funcionando corretamente
- ✅ Importação executada com sucesso
- ✅ 37 atas criadas no banco de dados
- ✅ Cálculos corretos (valorAdesao = 50% do valorTotal)
- ✅ Dashboard atualizado com novos dados

## Próximos Passos

Possíveis melhorias futuras:

1. **Histórico de Importações**: Registrar log de todas as importações
2. **Importação Parcial**: Permitir selecionar quais processos importar
3. **Validação Avançada**: Verificar datas, valores mínimos, etc.
4. **Rollback**: Permitir desfazer importação
5. **Importação de Adesões**: Adicionar funcionalidade similar para adesões
6. **Formatos Adicionais**: Suportar CSV, Excel, etc.
