import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Sprout, Leaf, TreeDeciduous, TreePine, PawPrint, Trophy, ArrowUp, ArrowDown, Minus, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { RankingOnboardingModal } from "@/components/modals/RankingOnboardingModal"
import { LeagueRanking } from "@/types/finance"












const LEAGUES = [
    { id: 'seed', label: 'Semente', icon: Sprout, color: 'text-emerald-300' },
    { id: 'sprout', label: 'Broto', icon: Leaf, color: 'text-emerald-400' },
    { id: 'tree', label: 'Árvore', icon: TreeDeciduous, color: 'text-emerald-500' },
    { id: 'forest', label: 'Floresta', icon: TreePine, color: 'text-emerald-600' },
    { id: 'fauna', label: 'Fauna', icon: PawPrint, color: 'text-amber-500' },
]

export default function Ranking() {
    const { user } = useAuth()
    const [currentLeague, setCurrentLeague] = useState('sprout') 
    const [userLeague, setUserLeague] = useState<string>('sprout') 
    const [userXP, setUserXP] = useState<number>(0)
    const [rankingList, setRankingList] = useState<LeagueRanking[]>([])
    const [loading, setLoading] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)

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
                setUserLeague(profile.current_league || 'sprout')
                setUserXP(profile.xp || 0)

                setCurrentLeague(profile.current_league || 'sprout')


                const { data: rankings, error: rankingError } = await supabase
                    .from('league_rankings')
                    .select('*')
                    .eq('current_league', profile.current_league || 'sprout')
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



    const stickyUser: LeagueRanking = currentUserRanking || {
        user_id: user?.id || '',
        full_name: user?.user_metadata?.full_name || 'Usuário',
        avatar_url: user?.user_metadata?.avatar_url || null,
        current_league: userLeague,
        xp: userXP,
        position: 0
    }

    const isLocked = currentLeague !== userLeague

    return (
        <div className="space-y-6 pb-40"> {}
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Ranking</h1>
                <p className="text-slate-500 font-medium">
                    "A competição é a lei da selva, mas a cooperação é a lei da civilização."
                </p>
            </header>

            {}
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

            {}
            {currentLeague === 'fauna' && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-400 p-6 shadow-lg shadow-amber-200/50 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="h-12 w-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Trophy className="text-amber-900" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-900 text-lg">Prêmio da Temporada</h3>
                        <p className="text-amber-800 font-medium text-sm">
                            🏆 Os top 10 da temporada concorrem a <span className="font-bold underline">R$ 500,00!</span>
                        </p>
                    </div>
                </div>
            )}

            {}
            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                        <p className="text-slate-400">Carregando ranking...</p>
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
                            Sua Liga: {LEAGUES.find(l => l.id === userLeague)?.label}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Classificação Atual</h3>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reinicia em 3 dias</span>
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

            {}
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
        </div>
    )
}
