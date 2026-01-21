# Padrões de Componentes - ARPS-SUPEL

## 📋 Índice

1. [Convenções](#convenções)
2. [Componentes Base](#componentes-base)
3. [Hooks](#hooks)
4. [Padrões de Página](#padrões-de-página)
5. [Classes Tailwind Customizadas](#classes-tailwind-customizadas)
6. [Padrões de Validação](#padrões-de-validação)
7. [Performance](#performance)
8. [Acessibilidade](#acessibilidade)

## Convenções

### Estrutura de Componentes

```typescript
import React from 'react';
import { IconName } from 'lucide-react';

interface ComponentProps {
  prop1: string;
  prop2?: boolean;
  onEvent: () => void;
}

export function ComponentName({ prop1, prop2 = false, onEvent }: ComponentProps) {
  return (
    <div>
      {prop1}
    </div>
  );
}
```

### Naming
- **Componentes**: PascalCase (`FormAta.tsx`)
- **Props Interface**: `ComponentNameProps`
- **Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

## Componentes Base

### Modal

Modal genérica reutilizável para formulários, confirmações, etc.

**Props:**
- `isOpen: boolean` - Controla visibilidade
- `onClose: () => void` - Callback para fechamento
- `title: string` - Título do modal
- `children: ReactNode` - Conteúdo
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Tamanho (padrão: md)

**Exemplo:**
```typescript
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título"
  size="md"
>
  Conteúdo aqui
</Modal>
```

### FormField

Campo de formulário com validação em tempo real.

**Props:**
- `label: string` - Rótulo do campo
- `name: string` - Nome do campo
- `type?: string` - Tipo de entrada (padrão: 'text')
- `placeholder?: string` - Placeholder
- `value: string | number` - Valor atual
- `onChange: (e) => void` - Handler de mudança
- `error?: string` - Mensagem de erro
- `required?: boolean` - Obrigatório
- `disabled?: boolean` - Desabilitado
- `as?: 'input' | 'textarea' | 'select'` - Tipo (padrão: 'input')
- `children?: ReactNode` - Para options do select
- `min?, max?, step?` - Para inputs numéricos

**Exemplo:**
```typescript
<FormField
  label="Nome"
  name="nome"
  placeholder="Digite seu nome"
  value={values.nome}
  onChange={handleChange}
  error={errors.nome}
  required
/>
```

### FormAta

Formulário para criar/editar atas com validações.

**Props:**
- `isOpen: boolean` - Controla visibilidade
- `onClose: () => void` - Callback para fechamento
- `onSubmit: (data) => Promise<void>` - Handler de envio
- `initialData?: Ata` - Dados iniciais (para edição)
- `isLoading?: boolean` - Estado de carregamento

**Validações:**
- NUP obrigatório e único
- Vigência deve ser data futura
- Valor positivo

### FormAdesao

Formulário para criar/editar adesões com validações customizadas.

**Props:**
- `isOpen: boolean` - Controla visibilidade
- `onClose: () => void` - Callback para fechamento
- `onSubmit: (data) => Promise<void>` - Handler de envio
- `ata?: Ata` - Ata pré-selecionada
- `initialData?: Adesao` - Dados iniciais (para edição)
- `isLoading?: boolean` - Estado de carregamento

**Validações:**
- ✅ Valor não pode exceder 50% do valor total da ata
- ✅ Saldo disponível deve ser suficiente
- ✅ Alertas visuais em tempo real

## Hooks

### useForm

Hook para gerenciar estado de formulários com validação Zod.

**Assinatura:**
```typescript
useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
  schema?: z.ZodSchema
)
```

**Retorno:**
- `values: T` - Valores dos campos
- `errors: FormErrors` - Erros de validação por campo
- `isLoading: boolean` - Se está enviando
- `handleChange: (e) => void` - Handler onChange para inputs
- `handleSubmit: (e) => Promise<void>` - Handler onSubmit para form
- `reset: () => void` - Função para resetar valores

**Exemplo:**
```typescript
const { values, errors, handleChange, handleSubmit, reset } = useForm(
  initialValues,
  onSubmitHandler,
  validationSchema
);
```

## Padrões de Página

### Estrutura Básica

```typescript
export default function NomePagina() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setIsLoading(true);
      const data = await service.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Conteúdo */}
    </div>
  );
}
```

### Padrão de CRUD

```typescript
// Criar/Editar
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingItem, setEditingItem] = useState<Item | undefined>();

async function handleSubmit(data: Partial<Item>) {
  if (editingItem) {
    await service.update(editingItem.id, data);
  } else {
    await service.create(data as Item);
  }
  await loadItems();
}

function openForm(item?: Item) {
  setEditingItem(item);
  setIsFormOpen(true);
}

// Deletar
async function handleDelete(id: string) {
  if (confirm('Tem certeza?')) {
    await service.delete(id);
    await loadItems();
  }
}
```

## Classes Tailwind Customizadas

### Botões

```html
<button className="btn btn-primary">Primário</button>
<button className="btn btn-secondary">Secundário</button>
<button className="btn btn-danger">Perigo</button>
<button className="btn btn-success">Sucesso</button>
<button className="btn btn-warning">Aviso</button>
<button className="btn btn-xs">Extra Pequeno</button>
<button className="btn btn-sm">Pequeno</button>
```

**Implementação:**
```css
.btn {
  @apply px-4 py-2 rounded font-medium transition-colors font-sans;
}

.btn-primary {
  @apply btn bg-blue-600 text-white hover:bg-blue-700;
}
```

### Alertas

```html
<div className="alert alert-danger">Erro</div>
<div className="alert alert-warning">Aviso</div>
<div className="alert alert-success">Sucesso</div>
<div className="alert alert-info">Informação</div>
```

**Implementação:**
```css
.alert {
  @apply p-4 rounded-lg mb-4;
}

.alert-danger {
  @apply alert bg-red-50 border border-red-200 text-red-800;
}
```

### Badges

```html
<span className="badge badge-danger">Crítico</span>
<span className="badge badge-warning">Atenção</span>
<span className="badge badge-success">Ok</span>
<span className="badge badge-info">Info</span>
```

**Implementação:**
```css
.badge {
  @apply inline-block px-2 py-1 text-xs font-semibold rounded;
}

.badge-danger {
  @apply badge bg-red-100 text-red-800;
}
```

### Tabelas

```html
<table className="table table-compact w-full">
  <thead>
    <tr className="bg-gray-100">
      <th className="text-left px-6 py-3">Coluna</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">Dado</td>
    </tr>
  </tbody>
</table>
```

### Cards

```html
<div className="card">
  Conteúdo do card
</div>
```

**Implementação:**
```css
.card {
  @apply bg-white rounded-lg shadow p-6;
}
```

## Padrões de Validação

### Com Zod

```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  valor: z.coerce.number().positive('Valor deve ser positivo'),
  data: z.string().refine(
    (date) => new Date(date) > new Date(),
    'Data deve ser no futuro'
  ),
});
```

### No Formulário

```typescript
const { values, errors, handleSubmit } = useForm(
  initialValues,
  onSubmit,
  validationSchema
);

// No template
{errors.nome && <span className="text-red-500">{errors.nome}</span>}
```

### Validações Customizadas

Para validações complexas que dependem de múltiplos campos ou estado do server:

```typescript
const schema = z.object({
  valor: z.coerce.number().positive(),
  total: z.coerce.number().positive(),
}).refine(
  (data) => data.valor <= data.total * 0.5,
  { message: 'Valor não pode exceder 50% do total', path: ['valor'] }
);
```

## Performance

### Memoização de Componentes

```typescript
// Para componentes pesados
export const HeavyComponent = React.memo(function HeavyComponent(props) {
  return <div>{props.children}</div>;
});

// Comparação customizada
export const MyComponent = React.memo(
  (props) => <div>{props.value}</div>,
  (prevProps, nextProps) => prevProps.value === nextProps.value
);
```

### Callbacks Memoizados

```typescript
const memoCallback = useCallback(() => {
  // ...
}, [dependency]);
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const FormAta = lazy(() => import('./components/FormAta'));

<Suspense fallback={<div>Carregando...</div>}>
  <FormAta />
</Suspense>
```

## Acessibilidade

### Boas Práticas

- ✅ Usar `htmlFor` em labels para associar com inputs
- ✅ Atributos `aria-*` apropriados
- ✅ Suportar navegação por teclado
- ✅ Contraste de cores adequado
- ✅ Alt text em imagens
- ✅ Semântica HTML correta
- ✅ WCAG 2.1 AA como mínimo

### Exemplo

```typescript
<label htmlFor="nup">NUP</label>
<input
  id="nup"
  name="nup"
  aria-label="Número Único de Processo"
  aria-invalid={!!errors.nup}
  aria-describedby={errors.nup ? "nup-error" : undefined}
/>
{errors.nup && <span id="nup-error" role="alert">{errors.nup}</span>}
```

## Estrutura de Pastas

```
frontend/src/
├── components/              # Componentes reutilizáveis
│   ├── Modal.tsx
│   ├── FormField.tsx
│   ├── FormAta.tsx
│   └── FormAdesao.tsx
├── hooks/                   # Custom hooks
│   └── useForm.ts
├── pages/                   # Páginas da aplicação
│   ├── Dashboard.tsx
│   ├── Atas.tsx
│   └── Adesoes.tsx
├── services/                # Serviços de API
│   └── api.ts
├── schemas/                 # Schemas de validação
│   └── validation.ts
├── types/                   # Tipos TypeScript
│   └── index.ts
├── utils/                   # Funções utilitárias
│   ├── format.ts
│   └── alertas.ts
├── App.tsx                  # Componente principal
├── main.tsx                 # Entrada
└── index.css                # Estilos globais
```

---

**Última atualização**: 20 de janeiro de 2026  
**Status**: ✅ Documentação completa
