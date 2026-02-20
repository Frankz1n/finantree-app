import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/finance';

export const TransactionService = {
    async getBalance(_userId: string) {

        const { data, error } = await supabase.rpc('get_dashboard_balance');

        if (error) {
            console.error('Error fetching balance RPC:', error);
            return 0;
        }

        return data || 0;
    },

    async getRecentTransactions(userId: string, limit = 5) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: false }) 
            .limit(limit);

        if (error) {
            console.error('Error fetching recent transactions:', error);
            return [];
        }

        return data as Transaction[];
    },

    async getTodaySavings(userId: string) {


        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('due_date', today); 

        if (error) return 0;

        const dailyNet = data.reduce((acc, curr) => {
            if (curr.type === 'income') return acc + curr.amount;
            if (curr.type === 'expense') return acc - curr.amount;
            return acc;
        }, 0);

        return dailyNet;
    },

    async getTransactions(userId: string, filters?: {
        type?: 'income' | 'expense' | 'investment',
        categoryIds?: string[], 
        month?: Date,
        searchTerm?: string,
        status?: 'pending' | 'completed',
        startDate?: string,
        endDate?: string
    }) {
        let query = supabase
            .from('transactions')
            .select('*, categories(*)') 
            .eq('user_id', userId)
            .order('due_date', { ascending: false });

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.categoryIds && filters.categoryIds.length > 0) {
            query = query.in('category_id', filters.categoryIds);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.month) {
            const startOfMonth = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1).toISOString();
            const endOfMonth = new Date(filters.month.getFullYear(), filters.month.getMonth() + 1, 0).toISOString();
            query = query.gte('due_date', startOfMonth).lte('due_date', endOfMonth);
        } else if (filters?.startDate && filters?.endDate) {
            query = query.gte('due_date', filters.startDate).lte('due_date', filters.endDate);
        }

        if (filters?.searchTerm) {

            query = query.ilike('description', `%${filters.searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return data as Transaction[];
    },

    async getCategories(type?: 'income' | 'expense') {
        let query = supabase
            .from('categories')
            .select('*');

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return data;
    },

    async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'status'> & { status?: string }) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                ...transaction,
                status: transaction.status || 'completed'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }

        return data;
    },

    async updateTransaction(id: string, transaction: Partial<Transaction>) {
        const { data, error } = await supabase
            .from('transactions')
            .update(transaction)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }

        return data;
    },

    async deleteTransaction(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }

        return true;
    }
};
