import { supabase } from '@/lib/supabase';

export const SavingBoxService = {
    async create(data: {
        user_id: string;
        name: string;
        target_amount: number;
    }) {
        const { data: result, error } = await supabase
            .from('saving_boxes')
            .insert([{
                user_id: data.user_id,
                name: data.name,
                target_amount: data.target_amount,
                current_amount: 0,
                is_verified_by_bank: false,
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating saving box:', error);
            throw error;
        }

        return result;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('saving_boxes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<{ name: string; target_amount: number }>) {
        const { data, error } = await supabase
            .from('saving_boxes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        // Need to delete transactions first due to foreign key constraints if not cascaded
        await supabase.from('saving_box_transactions').delete().eq('saving_box_id', id);

        const { error } = await supabase
            .from('saving_boxes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async deposit(boxId: string, userId: string, amount: number) {
        // 1. Get current box
        const box = await this.getById(boxId);

        // 2. Insert transaction
        const { error: txError } = await supabase
            .from('saving_box_transactions')
            .insert([{
                saving_box_id: boxId,
                user_id: userId,
                amount: amount,
                type: 'deposit'
            }]);

        if (txError) throw txError;

        // 3. Update current amount
        const newAmount = Number(box.current_amount) + Number(amount);
        return await this.updateAmount(boxId, newAmount);
    },

    async withdraw(boxId: string, userId: string, amount: number) {
        // 1. Get current box
        const box = await this.getById(boxId);

        if (Number(box.current_amount) < amount) {
            throw new Error('Saldo insuficiente no cofrinho.');
        }

        // 2. Insert transaction
        const { error: txError } = await supabase
            .from('saving_box_transactions')
            .insert([{
                saving_box_id: boxId,
                user_id: userId,
                amount: amount,
                type: 'withdrawal'
            }]);

        if (txError) throw txError;

        // 3. Update current amount
        const newAmount = Number(box.current_amount) - Number(amount);
        return await this.updateAmount(boxId, newAmount);
    },

    async updateAmount(id: string, newAmount: number) {
        const { data, error } = await supabase
            .from('saving_boxes')
            .update({ current_amount: newAmount })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getTransactions(boxId: string) {
        const { data, error } = await supabase
            .from('saving_box_transactions')
            .select('*')
            .eq('saving_box_id', boxId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
