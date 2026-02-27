import { useState, useEffect } from 'react';
import { GamificationService } from '@/services/gamification';
import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/contexts/StreakContext';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon_name: string;
}

export interface UserAchievement {
    achievement_id: string;
    created_at: string;
}

export const useAchievements = () => {
    const { user } = useAuth();
    const { streak } = useStreak();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    useEffect(() => {
        if (user && !loading) {
            checkRules();
        }
    }, [user, streak, loading, userAchievements]);

    const loadData = async () => {
        try {
            const [all, owned] = await Promise.all([
                GamificationService.getAchievements(),
                GamificationService.getUserAchievements(user!.id)
            ]);
            setAchievements(all);
            setUserAchievements(owned);
        } catch (err) {
            console.error("Error loading achievements:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkRules = async () => {
        if (!user || loading) return;

        let hasUpdates = false;
        const newAchievements: UserAchievement[] = [];


        const hasFirstSteps = userAchievements.some(ua => ua.achievement_id === 'first_steps');
        if (!hasFirstSteps) {
            const unlocked = await GamificationService.unlockAchievement(user.id, 'first_steps');
            if (unlocked) {
                newAchievements.push({ achievement_id: 'first_steps', created_at: new Date().toISOString() });
                hasUpdates = true;
            }
        }


        const hasStreakMaster = userAchievements.some(ua => ua.achievement_id === 'streak_master');
        if (streak >= 7 && !hasStreakMaster) {
            const unlocked = await GamificationService.unlockAchievement(user.id, 'streak_master');
            if (unlocked) {
                newAchievements.push({ achievement_id: 'streak_master', created_at: new Date().toISOString() });
                hasUpdates = true;
            }
        }


        if (hasUpdates) {
            setUserAchievements(prev => [...prev, ...newAchievements]);
        }
    };

    return { achievements, userAchievements, loading };
};
