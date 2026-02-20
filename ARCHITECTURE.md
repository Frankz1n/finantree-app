ARCHITECTURE.md - Finantree
1. Visão Geral e DNA
O Finantree é um "Dashboard de Performance Financeira" focado em desenvolvedores e profissionais de tecnologia. Diferente de gerenciadores comuns, ele trata finanças como um sistema lógico, priorizando dados, automação e clareza visual (estilo terminal).
Princípios de Arquitetura:
• Single Source of Truth: O Schema do banco de dados (Supabase) dita a tipagem (TypeScript) e a validação (Zod).
• Segurança por Padrão: Todo acesso a dados é protegido por Row Level Security (RLS).
• Type Safety: Tipagem estrita de ponta a ponta (Banco -> API -> Client).

--------------------------------------------------------------------------------
2. Schema do Banco de Dados (Supabase/PostgreSQL)
O banco de dados atua como a fonte da verdade. Utilizamos recursos nativos do Postgres (Enums, Foreign Keys e RLS) para garantir a integridade.
2.1. Enums e Tipos Customizados
Para suportar a categorização híbrida e os status definidos nas regras de negócio.
-- Tipos de Transação (Regra de Negócio: Investimento é transferência de patrimônio, não gasto)
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'investment');

-- Status da Transação
CREATE TYPE transaction_status AS ENUM ('pending', 'completed');

-- Tipo de Categoria (Regra de Negócio: Separação Fixo vs Variável para cálculo de saldo real)
CREATE TYPE category_budget_type AS ENUM ('fixed', 'variable');
2.2. Definição das Tabelas
profiles
Espelho público da tabela auth.users do Supabase.
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  currency text DEFAULT 'BRL', -- Suporte a múltiplas moedas (Persona Dev que recebe em USD/EUR)
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
-- RLS: Usuários podem ver e editar apenas seu próprio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
categories
Categorias personalizáveis pelo usuário para agrupar gastos.
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text, -- Armazena string do ícone (ex: lucide-react name)
  color text, -- Hex code para UI
  budget_limit numeric DEFAULT 0, -- Limite estipulado para "resumo de saúde"
  budget_type category_budget_type DEFAULT 'variable', -- Fixo vs Variável
  created_at timestamptz DEFAULT now()
);
-- RLS: Isolamento total por user_id
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can crud own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
transactions
O registro central financeiro.
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  
  description text NOT NULL,
  amount numeric NOT NULL, -- Valores positivos. O tipo define entrada/saída.
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'completed',
  
  due_date timestamptz NOT NULL DEFAULT now(), -- Data de vencimento ou competência
  payment_date timestamptz, -- Data efetiva do pagamento (para fluxo de caixa)
  
  created_at timestamptz DEFAULT now()
);
-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can crud own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
3. Padrões de Tipagem (TypeScript)
A tipagem é gerada automaticamente via Supabase CLI para garantir sincronia com o banco. Não tipamos interfaces manualmente para entidades do banco.
3.1. Geração de Tipos
Comando a ser rodado no CI/CD ou localmente após migrações:
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/types/database.types.ts
3.2. Helpers e Inferência
Utilizamos helpers para extrair tipos limpos para o frontend.
// src/types/supabase.ts
import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Exemplos de uso na aplicação:
export type Transaction = Tables<'transactions'>;
export type Category = Tables<'categories'>;
export type TransactionType = Enums<'transaction_type'>;

--------------------------------------------------------------------------------
4. Regras de Validação (Zod)
O Zod atua como a camada de segurança de dados no cliente (formulários) e validação de runtime. As regras abaixo refletem as especificações de negócio do Finantree.
4.1. Schema de Transação
import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(2, "Descrição deve ter no mínimo 2 caracteres"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  
  // Regra: Investimentos são tratados diferentemente de despesas
  type: z.enum(['income', 'expense', 'investment']),
  
  status: z.enum(['pending', 'completed']),
  category_id: z.string().uuid("Categoria inválida"),
  
  // Datas são cruciais para o cálculo de "Saldo Disponível Real"
  due_date: z.date({ required_error: "Data de vencimento é obrigatória" }),
  payment_date: z.date().optional().nullable(),
}).refine((data) => {
  // Regra de Negócio: Se está 'completed', deve ter data de pagamento
  if (data.status === 'completed' && !data.payment_date) {
    return false;
  }
  return true;
}, {
  message: "Data de pagamento é obrigatória para transações concluídas",
  path: ["payment_date"],
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
4.2. Schema de Categoria (Health Check)
export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  // Regra visual: Cores hexadecimais para os gráficos Recharts
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inválida"),
  icon: z.string().optional(),
  
  // Regra de Negócio: Categorização Híbrida (Fixo vs Variável)
  budget_type: z.enum(['fixed', 'variable']),
  
  // Regra: Limite estipulado para o "resumo de saúde" semanal
  budget_limit: z.coerce.number().nonnegative(),
});

--------------------------------------------------------------------------------
5. Fluxo de Autenticação e Segurança
A autenticação gerencia o acesso ao dashboard, garantindo que o usuário veja apenas seus dados.
1. Auth Provider: Supabase GoTrue (Email/Password, GitHub, Google).
2. JWT: O token JWT contém o sub (User ID).
3. RLS Enforcement: Cada query ao banco envia o JWT. O Postgres verifica a política auth.uid() = user_id.
4. Trigger de Perfil Automático: Ao criar um usuário na tabela auth.users, um trigger SQL popula automaticamente a tabela public.profiles.
-- Trigger para criar perfil automaticamente
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

--------------------------------------------------------------------------------
6. Lógica de Cálculo (Business Logic)
Estas lógicas devem ser implementadas em Hooks (useFinancialMetrics) ou Edge Functions se a carga for alta, para manter o frontend leve.
Cálculo do Saldo Disponível Real
Conforme especificação do Finantree, o saldo não é apenas Entradas - Saídas.
Fórmula: Saldo Atual (Banco) - Despesas Fixas Pendentes do Mês
// Exemplo lógico em TypeScript
const calculateRealBalance = (
  currentBalance: number, 
  pendingFixedExpenses: Transaction[]
) => {
  // Filtra apenas despesas fixas (ex: Aluguel, SaaS) que vencem este mês e estão 'pending'
  const blockedAmount = pendingFixedExpenses.reduce((acc, txn) => acc + txn.amount, 0);
  
  return currentBalance - blockedAmount;
};
Resumo de Saúde Semanal
Comparativo entre Gasto Real vs budget_limit da categoria.
• Status Verde: Gasto < 70% do limite.
• Status Amarelo: Gasto > 70% e < 100%.
• Status Vermelho: Gasto > 100% (Estouro de orçamento).