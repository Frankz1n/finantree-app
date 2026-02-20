import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

export const GamificationService = {
    triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    },

    async checkAchievements(userId: string, currentStreak: number) {

        if (currentStreak >= 7) {
            await this.unlockAchievement(userId, 'streak_master');
        }
    },

    async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_achievements')
                .insert([{ user_id: userId, achievement_id: achievementId }]);

            if (!error) {
                this.triggerConfetti();
                return true;
            }


            if (error.code === '23505') {

                return false;
            }

            console.error("Error unlocking achievement:", error);
            return false;
        } catch (error) {
            console.error("Error unlocking achievement:", error);
            return false;
        }
    },

    async getAchievements() {

        const { data } = await supabase.from('achievements').select('*');
        return data || [];
    },

    async getUserAchievements(userId: string) {

        const { data } = await supabase
            .from('user_achievements')
            .select('achievement_id, created_at')
            .eq('user_id', userId);
        return data || [];
    }
};
