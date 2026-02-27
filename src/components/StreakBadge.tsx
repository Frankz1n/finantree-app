import React from 'react';
import { Flame } from 'lucide-react';
import { useStreak } from '@/contexts/StreakContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const StreakBadge: React.FC = () => {
    const { streak, hasInteractedToday, loading } = useStreak();

    if (loading) {
        return (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full animate-pulse border border-slate-200 h-8 w-32">
            </div>
        );
    }

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={hasInteractedToday ? 'active' : 'inactive'}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-all duration-500",
                    hasInteractedToday
                        ? "bg-orange-100 text-orange-600 border-orange-200 shadow-orange-500/10"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                )}
                title={hasInteractedToday ? "Fogo diário garantido!" : "Faça uma ação (ex: adicionar despesa) para acender o fogo."}
            >
                <div className={cn("flex items-center justify-center p-0.5 rounded-full", hasInteractedToday ? "bg-orange-500" : "bg-slate-300")}>
                    <Flame size={12} className={hasInteractedToday ? "text-white" : "text-white"} fill="currentColor" />
                </div>
                <span>{hasInteractedToday ? `${streak} Dias no Fogo!` : `Sequência de ${streak}`}</span>
            </motion.div>
        </AnimatePresence>
    );
};
