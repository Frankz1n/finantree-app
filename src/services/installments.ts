import { supabase } from '@/lib/supabase'
import { Installment } from '@/types/finance'

export const InstallmentService = {
    async getUserInstallments(userId: string): Promise<Installment[]> {
        const { data, error } = await supabase
            .from('installments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching installments:', error)
            return []
        }
        return data as Installment[]
    },

    async createInstallment(installmentData: Omit<Installment, 'id' | 'created_at'>): Promise<Installment | null> {
        const { data, error } = await supabase
            .from('installments')
            .insert([installmentData])
            .select()
            .single()

        if (error) {
            console.error('Error creating installment:', error)
            throw error
        }
        return data as Installment
    },

    async updateInstallmentProgress(id: string, newCurrentInstallment: number): Promise<boolean> {
        const { error } = await supabase
            .from('installments')
            .update({ current_installment: newCurrentInstallment })
            .eq('id', id)

        if (error) {
            console.error('Error updating installment progress:', error)
            throw error
        }
        return true
    },

    async deleteInstallment(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('installments')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting installment:', error)
            throw error
        }
        return true
    }
}
