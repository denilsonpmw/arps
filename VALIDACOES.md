# Arquitetura de Validações - ARPS-SUPEL

## Regras de Negócio

### 1. Cálculos Automáticos

#### Valor de Adesão
```
VALOR_ADESAO = (VALOR_TOTAL * 0.5) * 4 = VALOR_TOTAL * 2
```

Representa o total máximo que pode ser aderido de uma ata (200% do valor total).

#### Saldo Disponível
```
SALDO_DISPONIVEL = VALOR_ADESAO - Soma(VALOR_ADERIDO de todas as adesões)
```

Atualizado automaticamente ao criar/editar/deletar adesões.

### 2. Validações de Adesão

#### Valor Individual
- Máximo permitido: 50% do VALOR_TOTAL
- Fórmula: `valorAdesao <= VALOR_TOTAL * 0.5`
- Erro: "Valor da adesão excede o limite de 50% do valor total"

#### Soma Total de Adesões
- Máximo permitido: VALOR_ADESAO (200% do VALOR_TOTAL)
- Fórmula: `Soma(valorAderido) <= VALOR_ADESAO`
- Erro: "Soma das adesões excede o limite de 200% do valor total"

#### Saldo Insuficiente
- Não permitir adesão se: `SALDO_DISPONIVEL < valorAdesao`
- Erro: "Saldo disponível insuficiente para esta adesão"

### 3. Alertas Visuais

#### Saldo Crítico
- Condição: `SALDO_DISPONIVEL < (VALOR_ADESAO * 0.2)`
- Cor: Vermelho
- Prioridade: Alta

#### Vigência Próxima
- Condição: Data final está no mês atual
- Cor: Amarelo
- Prioridade: Média

## Implementação

### Backend (`src/utils/calculos.ts`)

```typescript
// Calcula valor de adesão
export function calcularValorAdesao(valorTotal: number): number {
  return valorTotal * 2;
}

// Valida adesão
export function validarAdesao(
  valorAdesao: number,
  valorIndividual: number,
  valorTotalAtual: number
): ValidacaoAdesao {
  // Verifica limite individual (50%)
  if (valorIndividual > valorAdesao / 2) {
    return { valido: false, motivo: "Excede limite individual" };
  }
  
  // Verifica soma total (200%)
  if (valorTotalAtual + valorIndividual > valorAdesao) {
    return { valido: false, motivo: "Excede limite total" };
  }
  
  return { valido: true };
}

// Verifica saldo crítico
export function isSaldoCritico(saldo: number, valorAdesao: number): boolean {
  return saldo < (valorAdesao * 0.2);
}

// Verifica vigência próxima
export function isVigenciaProxima(vigenciaFinal: Date): boolean {
  const hoje = new Date();
  return hoje.getFullYear() === vigenciaFinal.getFullYear() &&
         hoje.getMonth() === vigenciaFinal.getMonth();
}
```

### Frontend (`src/utils/format.ts`)

```typescript
// Mesmas funções para uso na interface
export function isSaldoCritico(saldo: number, valorAdesao: number): boolean {
  return saldo < (valorAdesao * 0.2);
}

export function isVigenciaProxima(vigenciaFinal: string | Date): boolean {
  // ... implementação
}
```

## Fluxo de Criação de Adesão

1. **Frontend** - Usuário preenche formulário
2. **Frontend** - Validação de cliente (opcional)
3. **API** - Recebe dados em POST /api/adesoes
4. **Backend** - Valida schema com Zod
5. **Backend** - Busca ata e todas suas adesões
6. **Backend** - Calcula total atual de adesões
7. **Backend** - Executa validações de negócio
8. **Backend** - Se válido, cria adesão no banco
9. **Backend** - Recalcula SALDO_DISPONIVEL da ata
10. **Backend** - Atualiza ata no banco
11. **API** - Retorna adesão criada (201)
12. **Frontend** - Exibe sucesso e atualiza lista

## Fluxo de Atualização de Saldo

Ao criar/editar/deletar adesão:

```
1. Buscar ata com todas as adesões
2. Calcular total de todas as adesões (excluindo a que está sendo editada/deletada)
3. Calcular novo saldo: VALOR_ADESAO - total
4. Atualizar ata no banco
5. Retornar resposta
```

## Exemplos de Validação

### Exemplo 1: Adesão Válida
```
Ata:
- VALOR_TOTAL = 100.000
- VALOR_ADESAO = 200.000 (100.000 * 2)
- SALDO_DISPONIVEL = 200.000 (inicial)

Adesão:
- VALOR_INDIVIDUAL = 50.000 (50% de 100.000) ✓
- Soma total após = 50.000 (< 200.000) ✓
- Saldo após = 150.000 (não crítico) ✓

Resultado: ✓ VÁLIDO
```

### Exemplo 2: Adesão com Valor Muito Alto
```
Ata:
- VALOR_TOTAL = 100.000
- VALOR_ADESAO = 200.000
- SALDO_DISPONÍVEL = 200.000

Adesão:
- VALOR_INDIVIDUAL = 60.000 (> 50% de 100.000) ✗

Resultado: ✗ INVÁLIDO
Erro: "Valor da adesão excede o limite de 50% do valor total"
```

### Exemplo 3: Soma Total Acumulada
```
Ata:
- VALOR_TOTAL = 100.000
- VALOR_ADESAO = 200.000
- Adesões existentes: 180.000

Nova adesão:
- VALOR_INDIVIDUAL = 30.000
- Soma total = 180.000 + 30.000 = 210.000 (> 200.000) ✗

Resultado: ✗ INVÁLIDO
Erro: "Soma das adesões excede o limite de 200% do valor total"
```

### Exemplo 4: Saldo Crítico
```
Ata:
- VALOR_TOTAL = 100.000
- VALOR_ADESAO = 200.000
- SALDO_DISPONÍVEL = 35.000 (17.5% de 200.000)

Status: ⚠️ SALDO CRÍTICO (< 20%)
```

## Endpoints de Validação

### Criar Adesão
```
POST /api/adesoes
Content-Type: application/json

{
  "ataId": "ata-123",
  "numeroIdentificador": "ADESAO-001",
  "orgaoAderente": "MEC",
  "valorAderido": 50000
}
```

Validações executadas:
1. Schema Zod
2. Ata existe
3. Valor individual <= 50% do VALOR_TOTAL
4. Soma total <= VALOR_ADESAO
5. Saldo disponível > 0

### Atualizar Adesão
```
PATCH /api/adesoes/adesao-123
Content-Type: application/json

{
  "valorAderido": 60000
}
```

Validações: Idem criação

### Deletar Adesão
```
DELETE /api/adesoes/adesao-123
```

Ações:
1. Remove adesão
2. Recalcula SALDO_DISPONÍVEL
3. Atualiza ata

## Dashboard - Alertas

O dashboard exibe automaticamente:

```
GET /api/dashboard

{
  "totalAtasAtivas": 15,
  "saldoTotalDisponivel": 750000,
  "totalAdesoes": 42,
  "adesoesvencendo": 5,
  "atasComSaldoCritico": 2,
  "atasAlerta": [
    {
      "id": "ata-456",
      "arpNumero": "002/2025",
      "saldoDisponivel": 35000,
      "saldoCritico": true,
      "vigenciaProxima": true
    }
  ]
}
```

## Testes Recomendados

### Testes Unitários
- `validarAdesao()` com vários cenários
- `calcularValorAdesao()` com valores variados
- `calcularSaldoDisponivel()`
- `isSaldoCritico()`
- `isVigenciaProxima()`

### Testes de Integração
- Criar ata e validar cálculos
- Criar múltiplas adesões e validar soma
- Deletar adesão e validar recalculo
- Atualizar valor de adesão

### Testes E2E
- Fluxo completo: criar ata → criar adesões → verificar alertas
- Validar erros de negócio na UI
- Verificar atualização de saldo em tempo real
