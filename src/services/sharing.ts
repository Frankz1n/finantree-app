import { supabase } from '@/lib/supabase';
import { SharingPermission } from '@/types/finance';

export const SharingService = {
    async inviteMember(ownerId: string, email: string) {

        const { data: existing } = await supabase
            .from('sharing_permissions')
            .select('*')
            .eq('owner_id', ownerId)
            .eq('shared_with_email', email)
            .single();

        if (existing) {
            if (existing.status === 'pending') throw new Error('Convite já enviado.');
            if (existing.status === 'accepted') throw new Error('Usuário já é membro.');
        }

        const { data, error } = await supabase
            .from('sharing_permissions')
            .insert([{
                owner_id: ownerId,
                shared_with_email: email,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async checkInvites(userEmail: string) {


        const { data, error } = await supabase
            .from('sharing_permissions')
            .select('*, profiles:owner_id(full_name, email)')
            .eq('shared_with_email', userEmail)
            .eq('status', 'pending');

        if (error) {
            console.error('Error checking invites:', error);
            return [];
        }
        return data as (SharingPermission & { profiles: { full_name: string, email: string } })[];
    },

    async respondToInvite(inviteId: string, status: 'accepted' | 'rejected') {
        const { error } = await supabase
            .from('sharing_permissions')
            .update({ status })
            .eq('id', inviteId);

        if (error) throw error;
    },

    async getGroupMembers(userId: string) {

        const { data: myMembers, error: error1 } = await supabase
            .from('sharing_permissions')
            .select('shared_with_email, status')
            .eq('owner_id', userId);

        if (error1) throw error1;

        return myMembers;
    }
};
