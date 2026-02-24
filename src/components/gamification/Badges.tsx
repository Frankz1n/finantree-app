import { Trophy, Star, Shield, TrendingUp, Award, Zap, Target } from "lucide-react"
import { useAchievements } from "@/hooks/useAchievements"
import { Skeleton } from "@/components/ui/skeleton"

const iconMap: Record<string, React.ElementType> = {
    'star': Star,
    'zap': Zap,
    'trophy': Trophy,
    'shield': Shield,
    'trending-up': TrendingUp,
    'award': Award,
    'target': Target
}

export function Badges() {
    const { achievements, userAchievements, loading } = useAchievements()

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex gap-4 overflow-x-hidden pb-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-[140px] min-w-[160px] rounded-[24px]" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Award className="text-slate-900" />
                <h3 className="text-xl font-bold text-slate-900">Conquistas</h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {achievements.map((badge) => {
                    const isUnlocked = userAchievements.some(ua => ua.achievement_id === badge.id)
                    const Icon = iconMap[badge.icon_name] || Star

                    return (
                        <div
                            key={badge.id}
                            className={`flex min-w-[160px] flex-col items-center justify-center p-4 rounded-[24px] border transition-all ${isUnlocked
                                ? 'bg-white border-slate-100 shadow-sm opacity-100'
                                : 'bg-slate-50 border-slate-100 opacity-50 grayscale'
                                }`}
                        >
                            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${isUnlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-200 text-slate-400'}`}>
                                <Icon size={24} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 text-center mb-1">{badge.name}</h4>
                            <p className="text-[10px] text-slate-500 text-center leading-tight">{badge.description}</p>
                        </div>
                    )
                })}

                {achievements.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Nenhuma conquista disponível no momento.</p>
                )}
            </div>
        </div>
    )
}
