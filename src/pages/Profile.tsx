import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { CreditCard, User, Shield, ChevronRight, History, Trophy, Flame, Gift } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Profile() {
    const navigate = useNavigate()
    const { user, streak } = useAuth()
    const [userLeague, setUserLeague] = useState('sprout')
    const [userXP, setUserXP] = useState<number>(0)

    useEffect(() => {
        if (user) {
            fetchUserProfile()
        }
    }, [user])

    const fetchUserProfile = async () => {
        if (!user) return

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('current_league')
                .eq('id', user.id)
                .single()

            if (!profileError && profileData) {
                setUserLeague(profileData.current_league || 'sprout')
            }

            const { data: xpData, error: xpError } = await supabase
                .from('xp_transactions')
                .select('amount')
                .eq('user_id', user.id)

            if (!xpError && xpData) {
                const totalXP = xpData.reduce((acc, curr) => acc + (curr.amount || 0), 0)
                setUserXP(totalXP)
            }
        } catch (error) {
            console.error('Error fetching user profile data:', error)
        }
    }

    const userLevel = Math.floor(userXP / 1000) + 1

    const memberSince = user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>

            { }
            <div className="rounded-[32px] bg-white p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-4xl font-bold text-white shadow-xl ring-4 ring-slate-50">
                        {user?.user_metadata?.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <div className="bg-orange-100 text-orange-600 rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold border border-orange-200">
                            <Flame size={12} fill="currentColor" /> {streak}
                        </div>
                    </div>
                </div>

                <div className="text-center md:text-left space-y-2 flex-1">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{user?.user_metadata?.full_name}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Membro desde {memberSince}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
                            Liga {userLeague}
                        </span>
                        <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-violet-200">
                            Nível {userLevel} ({userXP.toLocaleString()} XP)
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                { }
                <div className="space-y-6">
                    { }
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Minha Conta</h3>
                        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden divide-y divide-slate-50">
                            <button onClick={() => navigate('/profile/account')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <User size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">Detalhes da Conta</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                            <button onClick={() => navigate('/profile/security')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Shield size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">Privacidade e Segurança</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                            <button onClick={() => navigate('/profile/invites')} className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Gift size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">Convide e Ganhe XP</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                        </div>
                    </div>

                    { }
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Preferências</h3>
                        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden divide-y divide-slate-50">
                            <button onClick={() => navigate('/profile/achievements')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Trophy size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">Conquistas</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>

                { }
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Assinatura</h3>
                        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden divide-y divide-slate-50">
                            <button onClick={() => navigate('/profile/plan')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Meu Plano</p>
                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Individual</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                            <button onClick={() => navigate('/profile/billing')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <History size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">Histórico de Pagamentos</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
