import { z } from 'zod';


export type TransactionType = 'income' | 'expense' | 'investment';
export type TransactionStatus = 'pending' | 'completed';
export type CategoryBudgetType = 'fixed' | 'variable';


export const transactionSchema = z.object({
    description: z.string().min(2, "Descrição deve ter no mínimo 2 caracteres"),
    amount: z.coerce.number().positive("O valor deve ser positivo"),


    type: z.enum(['income', 'expense', 'investment']),

    status: z.enum(['pending', 'completed']),
    category_id: z.string().uuid("Categoria inválida"),


    due_date: z.date({ required_error: "Data de vencimento é obrigatória" }),
    payment_date: z.date().optional().nullable(),
}).refine((data) => {

    if (data.status === 'completed' && !data.payment_date) {
        return false;
    }
    return true;
}, {
    message: "Data de pagamento é obrigatória para transações concluídas",
    path: ["payment_date"],
});

export const categorySchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),

    color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inválida"),
    icon: z.string().optional(),


    budget_type: z.enum(['fixed', 'variable']),


    budget_limit: z.coerce.number().nonnegative(),
});


export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;


export interface Transaction {
    id: string;
    user_id: string;
    category_id: string | null;
    description: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    due_date: string;
    payment_date: string | null;
    created_at: string;
    categories?: {
        name: string;
        icon: string | null;
    } | null;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    icon: string | null;
    color: string | null;
    budget_limit: number;
    budget_type: CategoryBudgetType;
    created_at: string;
}

export type PlanType = 'individual' | 'duo' | 'group';

export interface SharingPermission {
    id: string;
    owner_id: string;
    shared_with_email: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}


export interface SavingBox {
    id: string
    user_id: string
    name: string
    target_amount: number
    current_amount: number
    icon: string
    color: string
    created_at: string
}

export interface SavingBoxTransaction {
    id: string
    saving_box_id: string
    user_id: string
    amount: number
    type: 'deposit' | 'withdrawal'
    created_at: string
}

export interface LeagueRanking {
    user_id: string
    full_name: string
    avatar_url: string | null
    current_league: string
    xp: number
    position: number
}
