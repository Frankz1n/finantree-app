import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StreakContextType {
    streak: number;
    hasInteractedToday: boolean;
    loading: boolean;
    registerMeaningfulInteraction: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [hasInteractedToday, setHasInteractedToday] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setStreak(0);
            setHasInteractedToday(false);
            setLoading(false);
            return;
        }

        const fetchStreak = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_streaks')
                    .select('current_streak, last_interaction_date')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching streak:", error);
                }

                if (data) {
                    setStreak(data.current_streak);

                    if (data.last_interaction_date) {
                        const lastDate = new Date(data.last_interaction_date);
                        const today = new Date();
                        const isToday =
                            lastDate.getDate() === today.getDate() &&
                            lastDate.getMonth() === today.getMonth() &&
                            lastDate.getFullYear() === today.getFullYear();

                        setHasInteractedToday(isToday);
                    }
                }
            } catch (err) {
                console.error("Critical error in fetchStreak:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStreak();
    }, [user]);

    const registerMeaningfulInteraction = async () => {
        if (!user || hasInteractedToday) return;

        try {
            // Optimistic UI Update
            setHasInteractedToday(true);
            setStreak(prev => prev + 1);

            const { error } = await supabase
                .from('user_streaks')
                .upsert(
                    {
                        user_id: user.id,
                        current_streak: streak + 1,
                        last_interaction_date: new Date().toISOString()
                    },
                    { onConflict: 'user_id' }
                )
                .select()
                .single();

            if (error) {
                // Rollback optimistic update on failure
                setHasInteractedToday(false);
                setStreak(prev => prev - 1);
                console.error("Error registering interaction:", error);
                return;
            }

            toast.success("🔥 Sequência mantida! Você gerenciou suas finanças hoje!", {
                style: {
                    background: '#ffedd5', // orange-100
                    color: '#ea580c', // orange-600
                    borderColor: '#fed7aa', // orange-200
                },
                icon: "🔥"
            });

        } catch (err) {
            console.error("Error in registerMeaningfulInteraction:", err);
            setHasInteractedToday(false);
            setStreak(prev => prev - 1);
        }
    };

    return (
        <StreakContext.Provider value={{ streak, hasInteractedToday, loading, registerMeaningfulInteraction }}>
            {children}
        </StreakContext.Provider>
    );
};

export const useStreak = () => {
    const context = useContext(StreakContext);
    if (context === undefined) {
        throw new Error('useStreak must be used within a StreakProvider');
    }
    return context;
};
