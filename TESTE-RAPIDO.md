# 🚀 TESTE RÁPIDO - ARPS-SUPEL

## ✅ Status: Sistema Pronto para Testes

**Data:** 20 de janeiro de 2026

---

## 🎯 Quick Start - 5 Minutos

### Passo 1: Verificar se Servidores Estão Rodando

```bash
# Backend
curl -s http://localhost:3001/api/dashboard | head -c 50

# Frontend (abrir navegador)
http://localhost:3000
```

---

## 🧪 Teste Rápido: Criar Ata + Adesão

### No Frontend (UI):

**1. Criar Ata:**
- [ ] Acesse http://localhost:3000
- [ ] Clique em "Atas" no menu
- [ ] Clique "+ Nova Ata"
- [ ] Preencha:
  ```
  NUP:              2026001
  MOD/Nº:           CC 001/2026
  ARP Nº:           001/2026
  Órgão:            MCTIC
  Objeto:           Teste do sistema
  Vigência:         2026-12-31
  Valor Total:      1000000
  ```
- [ ] Clique "Criar"
- [ ] ✅ Ata deve aparecer na tabela com Limite Adesão = 500.000

**2. Criar Adesão:**
- [ ] Clique em "Adesões"
- [ ] Clique "+ Nova Adesão"
- [ ] Selecione a ata criada
- [ ] Preencha:
  ```
  Órgão Aderente:   INEP
  Valor:            300000
  ```
- [ ] ✅ Sem alertas vermelhos/amarelos
- [ ] Clique "Criar"
- [ ] Adesão deve aparecer na tabela

**3. Verificar Atas:**
- [ ] Volte para "Atas"
- [ ] Primeira ata agora mostra:
  ```
  Aderido: 300.000
  Saldo:   200.000 (diminuiu!)
  ```

**4. Testar Validação:**
- [ ] Em Adesões, "+ Nova Adesão"
- [ ] Preencha Valor: 600000 (> 50%)
- [ ] ✅ Alerta vermelho deve aparecer
- [ ] ✅ Botão "Criar" deve ficar desabilitado

### Via cURL (API):

```bash
# 1. Criar Ata
curl -X POST http://localhost:3001/api/atas \
  -H "Content-Type: application/json" \
  -d '{
    "nup": "api2026001",
    "modalidade": "CC 001/2026",
    "arpNumero": "001/2026",
    "orgaoGerenciador": "INEP",
    "objeto": "Teste via API",
    "vigenciaFinal": "2026-12-31",
    "valorTotal": 500000
  }'

# 2. Listar Atas
curl http://localhost:3001/api/atas

# 3. Criar Adesão (use o ID da ata acima)
curl -X POST http://localhost:3001/api/adesoes \
  -H "Content-Type: application/json" \
  -d '{
    "ataId": "ID_DA_ATA_AQUI",
    "orgaoAderente": "MCTIC",
    "valorAderido": 250000
  }'

# 4. Dashboard
curl http://localhost:3001/api/dashboard
```

---

## ✅ Checklist Rápido

```
Frontend:
☐ Página carrega (http://localhost:3000)
☐ Menu de navegação funciona
☐ Página de Atas carrega

CRUD Atas:
☐ Criar ata (salva no banco)
☐ Editar ata (atualiza)
☐ Deletar ata (remove)

CRUD Adesões:
☐ Criar adesão (com validação 50%)
☐ Editar adesão
☐ Deletar adesão (saldo recalcula)

Validações:
☐ Valor > 50% = alerta vermelho
☐ Saldo insuficiente = alerta amarelo
☐ Botão desabilitado com erros

Dashboard:
☐ Métricas aparecem
☐ Alertas aparecem se houver atas críticas
```

---

## 🐛 Se der erro:

### Erro: Página em branco
```bash
# Verificar console (F12)
# Verificar backend está rodando:
curl http://localhost:3001/api/dashboard
```

### Erro: "Não consegue conectar API"
```bash
# Backend não está rodando
cd backend
npm run dev
```

### Erro: "NUP já existe"
```bash
# Usar NUP diferente (cada um deve ser único)
```

---

## 📊 Dados de Teste Sugeridos

```
Ata 1:
  NUP: 2026001
  Valor Total: 1.000.000
  Limite: 500.000
  → Crie 2 adesões de 200.000 e 300.000

Ata 2:
  NUP: 2026002
  Valor Total: 100.000
  Limite: 50.000
  → Crie 1 adesão de 45.000 (saldo crítico!)

Ata 3:
  NUP: 2026003
  Valor Total: 50.000
  Limite: 25.000
  → Não crie adesão (mostra no Dashboard)
```

---

## 🎯 Resultado Esperado

Após executar os testes, você deve ter:

✅ **Backend**
- 3 atas no banco de dados
- 3 adesões no banco de dados
- Saldos calculados corretamente

✅ **Frontend**
- Página Atas mostra 3 atas
- Página Adesões mostra 3 adesões
- Dashboard mostra alertas

✅ **Validações**
- Nenhuma adesão com valor > 50%
- Nenhuma adesão com saldo insuficiente
- Erros aparecem corretamente

---

**Status:** 🟢 **SISTEMA PRONTO PARA USO**

Comece com o Teste Rápido acima e nos próximos passos você pode adicionar:
- Gráficos
- Paginação
- Filtros
- Exportação
- Autenticação

🚀 **Bora testar?**
