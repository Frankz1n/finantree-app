import { supabase } from '@/lib/supabase'
import { Subscription } from '@/types/finance'

export const SubscriptionService = {
    async getUserSubscriptions(userId: string): Promise<Subscription[]> {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: false })

        if (error) {
            console.error('Error fetching subscriptions:', error)
            return []
        }
        return data as Subscription[]
    },

    async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at'>): Promise<Subscription | null> {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([subscriptionData])
            .select()
            .single()

        if (error) {
            console.error('Error creating subscription:', error)
            throw error
        }
        return data as Subscription
    },

    async updateSubscriptionStatus(id: string, status: 'active' | 'paused' | 'canceled'): Promise<boolean> {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status })
            .eq('id', id)

        if (error) {
            console.error('Error updating subscription status:', error)
            throw error
        }
        return true
    },

    async deleteSubscription(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting subscription:', error)
            throw error
        }
        return true
    }
}
