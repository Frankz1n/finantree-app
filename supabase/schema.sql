-- 1. Enums e Tipos Customizados
-- Tipos de Transação (Regra de Negócio: Investimento é transferência de patrimônio, não gasto)
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'investment');

-- Status da Transação
CREATE TYPE transaction_status AS ENUM ('pending', 'completed');

-- Tipo de Categoria (Regra de Negócio: Separação Fixo vs Variável para cálculo de saldo real)
CREATE TYPE category_budget_type AS ENUM ('fixed', 'variable');

-- 2. Definição das Tabelas

-- profiles
-- Espelho público da tabela auth.users do Supabase.
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

-- categories
-- Categorias personalizáveis pelo usuário para agrupar gastos.
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

-- transactions
-- O registro central financeiro.
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

-- 3. Triggers

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
