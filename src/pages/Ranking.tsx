import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Sprout, Leaf, TreeDeciduous, TreePine, PawPrint, Trophy, ArrowUp, ArrowDown, Minus, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { RankingOnboardingModal } from "@/components/modals/RankingOnboardingModal"
import { Skeleton } from "@/components/ui/skeleton"
import { LeagueRanking } from "@/types/finance"
import { useLeagueCycle } from "@/hooks/useLeagueCycle"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"












const dbToUI: Record<string, string> = {
    'semente': 'Semente',
    'broto': 'Broto',
    'arvore': 'Árvore',
    'floresta': 'Floresta',
    'fauna': 'Fauna'
};

const uiToDB: Record<string, string> = {
    'Semente': 'semente',
    'Broto': 'broto',
    'Árvore': 'arvore',
    'Floresta': 'floresta',
    'Fauna': 'fauna'
};

const LEAGUES = [
    { id: 'semente', label: 'Semente', icon: Sprout, color: 'text-emerald-300' },
    { id: 'broto', label: 'Broto', icon: Leaf, color: 'text-emerald-400' },
    { id: 'arvore', label: 'Árvore', icon: TreeDeciduous, color: 'text-emerald-500' },
    { id: 'floresta', label: 'Floresta', icon: TreePine, color: 'text-emerald-600' },
    { id: 'fauna', label: 'Fauna', icon: PawPrint, color: 'text-amber-500' },
]

export default function Ranking() {
    const { user } = useAuth()
    const { timeLeft } = useLeagueCycle()
    const [currentLeague, setCurrentLeague] = useState('semente')
    const [userLeague, setUserLeague] = useState<string>('semente')
    const [userXP, setUserXP] = useState<number>(0)
    const [rankingList, setRankingList] = useState<LeagueRanking[]>([])
    const [loading, setLoading] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [showManualRules, setShowManualRules] = useState(false)

    useEffect(() => {
        if (user) {
            fetchRankingData()
            checkOnboarding()
        }
    }, [user])

    const fetchRankingData = async () => {
        try {
            setLoading(true)
            if (!user) return


            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('current_league, xp')
                .eq('id', user.id)
                .single()

            if (profileError) throw profileError

            if (profile) {
                const fetchedLeague = profile.current_league;
                let finalLeague = fetchedLeague;

                if (!fetchedLeague) {
                    finalLeague = 'semente';

                    // Silent update to fix DB missing value so user is not permanently stuck
                    supabase.from('profiles').update({ current_league: 'semente' }).eq('id', user.id).then();
                }

                setUserLeague(finalLeague)
                setUserXP(profile.xp || 0)

                setCurrentLeague(finalLeague)

                // Triggers Fauna Rules natively if user reached Fauna and hasn't seen the rules yet
                if (finalLeague === 'fauna') {
                    const hasSeenFaunaRules = localStorage.getItem(`has_seen_fauna_rules_${user.id}`);
                    if (!hasSeenFaunaRules) {
                        setShowManualRules(true);
                        localStorage.setItem(`has_seen_fauna_rules_${user.id}`, 'true');
                    }
                }


                const { data: rankings, error: rankingError } = await supabase
                    .from('league_rankings')
                    .select('*')
                    .eq('current_league', finalLeague)
                    .order('position', { ascending: true })

                if (rankingError) throw rankingError

                setRankingList(rankings || [])
            }
        } catch (error) {
            console.error("Error fetching ranking data:", error)
        } finally {
            setLoading(false)
        }
    }

    const checkOnboarding = async () => {
        if (!user) return
        const { data, error } = await supabase
            .from('profiles')
            .select('has_seen_ranking_onboarding')
            .eq('id', user.id)
            .single()

        if (!error && data && !data.has_seen_ranking_onboarding) {
            setShowOnboarding(true)
        }
    }


    const currentUserRanking = rankingList.find(u => u.user_id === user?.id)

    const handleSimulateEndCycle = async () => {
        if (!user || loading) return;

        try {
            setLoading(true);
            let newLeague = userLeague;
            let message = "O ciclo terminou. Sua liga foi mantida e seu XP zerado para a nova semana!";

            if (currentUserRanking) {
                const currentLeagueIndex = LEAGUES.findIndex(l => l.id === userLeague);

                // Promoção: Top 10 e não está na última liga
                if (currentUserRanking.position <= 10 && currentLeagueIndex < LEAGUES.length - 1) {
                    newLeague = LEAGUES[currentLeagueIndex + 1].id;
                    message = "🎉 Parabéns! Você foi promovido de liga! Seu XP foi zerado para a nova semana!";
                }
                // Rebaixamento: Últimos 10 (se mais de 20 usuários) e não está na primeira liga
                else if (rankingList.length > 20 && currentUserRanking.position >= rankingList.length - 10 && currentLeagueIndex > 0) {
                    newLeague = LEAGUES[currentLeagueIndex - 1].id;
                    message = "🔻 Você foi rebaixado de liga. Continue se esforçando! Seu XP foi zerado para a nova semana.";
                }
            }

            // Garante mapping limpo de ENUM (lowercase, no accents)
            const safeLeagueEnum = uiToDB[newLeague] || newLeague;

            const { error } = await supabase
                .from('profiles')
                .update({
                    current_league: safeLeagueEnum,
                    xp: 0
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success(message, { duration: 5000 });

            await fetchRankingData();

        } catch (error) {
            console.error("Error simulating end of cycle:", error);
            toast.error("Erro ao simular fim de ciclo.");
        } finally {
            setLoading(false);
        }
    }

    const stickyUser: LeagueRanking = currentUserRanking || {
        user_id: user?.id || '',
        full_name: user?.user_metadata?.full_name || 'Usuário',
        avatar_url: user?.user_metadata?.avatar_url || null,
        current_league: userLeague,
        xp: userXP,
        position: 0
    }

    const isLocked = currentLeague.toLowerCase() !== userLeague.toLowerCase()

    return (
        <div className="space-y-6 pb-40"> { }
            <header className="space-y-2 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Ranking</h1>
                    <p className="text-slate-500 font-medium">
                        "A competição é a lei da selva, mas a cooperação é a lei da civilização."
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateEndCycle}
                    className="text-xs bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hidden md:flex"
                >
                    Simular Fim da Liga
                </Button>
            </header>

            {/* Mobile simulator button, so it fits properly on small screens too */}
            <div className="md:hidden flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateEndCycle}
                    className="text-xs w-full bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                >
                    Simular Fim da Liga
                </Button>
            </div>

            { }
            <div className="flex justify-end w-full mb-1 px-1">
                <button
                    onClick={() => setShowManualRules(true)}
                    className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-wider"
                >
                    Ver regras
                </button>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {LEAGUES.map((league) => {
                    const Icon = league.icon
                    const isActive = currentLeague === league.id
                    return (
                        <button
                            key={league.id}
                            onClick={() => setCurrentLeague(league.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-2xl transition-all border border-transparent",
                                isActive
                                    ? "bg-white shadow-md border-emerald-100 scale-105"
                                    : "bg-slate-50 hover:bg-white hover:shadow-sm opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                isActive ? "bg-emerald-50" : "bg-white"
                            )}>
                                <Icon size={20} className={cn(isActive ? league.color : "text-slate-400")} />
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                isActive ? "text-slate-900" : "text-slate-400"
                            )}>
                                {league.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            { }
            {currentLeague.toLowerCase() === 'fauna' && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-400 p-6 shadow-lg shadow-amber-200/50 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="h-12 w-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Trophy className="text-amber-900" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-900 text-lg">Prêmio da Temporada</h3>
                        <p className="text-amber-800 font-medium text-sm">
                            🏆 Fique em primeiro lugar e ganhe <span className="font-bold underline">R$ 500,00!</span>
                        </p>
                    </div>
                </div>
            )}

            { }
            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-6 w-6" />
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isLocked ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 space-y-6">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center">
                            <Lock size={48} className="text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Liga Bloqueada</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                Você precisa alcançar esta liga para ver seus competidores. Continue evoluindo!
                            </p>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">
                            Sua Liga: {dbToUI[userLeague] || LEAGUES.find(l => l.id === userLeague)?.label}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
                            <h3 className="font-bold text-slate-900">Classificação Atual</h3>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                                ⏳ Termina em {timeLeft}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {rankingList.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    Ninguém nesta liga ainda. Seja o primeiro!
                                </div>
                            ) : (
                                rankingList.map((u, index) => {
                                    const isMe = u.user_id === user?.id




                                    let trend = 'neutral'
                                    if (u.position <= 10) trend = 'up'
                                    else if (rankingList.length > 20 && index >= rankingList.length - 10) trend = 'down'

                                    const avatarLetter = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'

                                    return (
                                        <div
                                            key={u.user_id}
                                            className={cn(
                                                "flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors",
                                                isMe && "bg-emerald-50/50 hover:bg-emerald-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "font-bold w-6 text-center text-sm",
                                                    u.position <= 3 ? "text-amber-500 text-lg" : "text-slate-400"
                                                )}>
                                                    {u.position}
                                                </span>

                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm overflow-hidden",
                                                    isMe ? "bg-emerald-500" : "bg-slate-200 text-slate-500"
                                                )}>
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt={u.full_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        avatarLetter
                                                    )}
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        isMe ? "text-emerald-700" : "text-slate-700"
                                                    )}>
                                                        {u.full_name || "Usuário"} {isMe && "(Você)"}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        Nível {Math.floor(u.xp / 1000) + 1}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <span className="font-bold text-slate-900 text-sm">
                                                    {u.xp.toLocaleString()} XP
                                                </span>
                                                <div className="w-8 flex justify-center">
                                                    {trend === 'up' && (
                                                        <div className="flex flex-col items-center text-emerald-500" title="Zona de Promoção">
                                                            <ArrowUp size={16} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                    {trend === 'down' && (
                                                        <div className="flex flex-col items-center text-red-400" title="Zona de Rebaixamento">
                                                            <ArrowDown size={16} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                    {trend === 'neutral' && (
                                                        <Minus size={16} className="text-slate-300" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </>
                )}
            </div>

            { }
            {user && !isLocked && !loading && (
                <div className="fixed bottom-0 md:left-64 left-0 right-0 z-20 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] p-4 px-6 animate-in slide-in-from-bottom-full">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow-md ring-4 ring-emerald-50 overflow-hidden">
                                {stickyUser.avatar_url ? (
                                    <img src={stickyUser.avatar_url} alt="Me" className="h-full w-full object-cover" />
                                ) : (
                                    stickyUser.user_id ? (stickyUser.full_name?.charAt(0).toUpperCase() || 'V') : 'V'
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sua Posição</p>
                                <p className="text-lg font-bold text-slate-900">
                                    {stickyUser.position > 0 ? `${stickyUser.position}º Lugar` : '-'}
                                    <span className="text-slate-300 mx-2">|</span>
                                    <span className="text-emerald-500">{stickyUser.xp.toLocaleString()} XP</span>
                                </p>
                            </div>
                        </div>

                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-slate-400">Próxima Liga</p>
                            <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[75%]" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <RankingOnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
            />

            <RankingOnboardingModal
                isOpen={showManualRules}
                onClose={() => setShowManualRules(false)}
                isManualView={true}
            />
        </div>
    )
} 
