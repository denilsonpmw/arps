# ARPS-SUPEL Frontend

Aplicação React com TypeScript para interface do sistema de controle de adesões.

## Setup

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. Instalar dependências:
```bash
npm install
```

2. Criar arquivo `.env` baseado em `.env.example`:
```bash
cp .env.example .env
```

3. Configurar URL da API no `.env`:
```
VITE_API_URL=http://localhost:3001
```

4. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Visualiza build de produção localmente
- `npm run lint` - Verifica linting

## Estrutura

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços de API
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Funções utilitárias
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entrada
│   └── index.css        # Estilos globais
├── index.html           # HTML principal
├── vite.config.ts       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
└── postcss.config.js    # Configuração PostCSS
```

## Páginas

### Dashboard
- Visão geral do sistema
- Total de atas ativas
- Saldo total disponível
- Adesões em andamento
- Alertas de vigência próxima e saldo crítico

### Atas
- Lista de todas as atas de registro de preços
- Filtros por órgão e status
- Indicadores de alerta (saldo crítico, vigência próxima)
- Ações: editar, deletar

### Adesões
- Lista de todas as adesões
- Filtros por ata e órgão
- Ações: editar, deletar

## Estilos

O projeto utiliza Tailwind CSS com classes customizadas em `src/index.css`:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`, `.btn-warning`
- `.alert`, `.alert-danger`, `.alert-warning`, `.alert-success`, `.alert-info`
- `.badge`, `.badge-danger`, `.badge-warning`, `.badge-success`, `.badge-info`
- `.card` - Container padrão
- `.table` - Tabelas estilizadas

## Utilitários

### Formatação (`utils/format.ts`)
- `formatCurrency()` - Formata valores em R$
- `formatDate()` - Formata datas
- `formatDateTime()` - Formata data e hora
- `isSaldoCritico()` - Verifica se saldo está crítico
- `isVigenciaProxima()` - Verifica se vigência é neste mês
- `truncate()` - Trunca strings

## Serviços de API (`services/api.ts`)

### atasService
- `getAll()` - Lista todas as atas
- `getById()` - Obter ata específica
- `create()` - Criar nova ata
- `update()` - Atualizar ata
- `delete()` - Deletar ata

### adesaoService
- `getAll()` - Lista todas as adesões
- `getByAta()` - Listar adesões de uma ata
- `getById()` - Obter adesão específica
- `create()` - Criar nova adesão
- `update()` - Atualizar adesão
- `delete()` - Deletar adesão

### dashboardService
- `getOverview()` - Dados gerais do dashboard
- `getAtasComSaldoCritico()` - Atas com saldo < 20%
- `getAtasVencendo()` - Atas vencendo neste mês
- `getResumosPorOrgao()` - Resumo por órgão gerenciador

## Componentes

### Layout
Componente principal que renderiza sidebar e header. Props:
- `children` - Conteúdo principal
- `currentPage` - Página atual
- `onPageChange` - Callback para mudança de página

## Tipos

Ver `src/types/index.ts` para todos os tipos TypeScript utilizados.

## Próximas Melhorias

- [ ] Formulários completos para criar/editar atas
- [ ] Formulários completos para criar/editar adesões
- [ ] Paginação nas listas
- [ ] Filtros avançados
- [ ] Exportar dados para CSV/Excel
- [ ] Gráficos e estatísticas
- [ ] Temas (claro/escuro)
- [ ] Responsividade melhorada
- [ ] Testes unitários
- [ ] Autenticação
