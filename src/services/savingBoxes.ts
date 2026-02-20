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
    }
};
