
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, ArrowUp, Instagram, Calendar } from "lucide-react"

interface RankingOnboardingModalProps {
    isOpen: boolean
    onClose: () => void
}

export function RankingOnboardingModal({ isOpen, onClose }: RankingOnboardingModalProps) {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const handleClose = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ has_seen_ranking_onboarding: true })
                .eq('id', user.id)

            if (error) throw error

            onClose()
        } catch (error) {
            console.error("Error updating onboarding status:", error)
            onClose()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px] border-none bg-white/95 backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />

                <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-6">
                    <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center animate-bounce shadow-inner border-4 border-white">
                        <Trophy size={40} className="text-amber-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-slate-900 px-4">
                        Como dominar o Ranking e ganhar R$ 500 🏆
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 px-2 py-2">
                    <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                            <ArrowUp size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-900 text-sm">1. Suba de Liga</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                Os 10 melhores de cada liga sobem, os 10 piores caem. Mantenha-se no topo para evoluir!
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                            <Trophy size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-amber-900 text-sm">2. O Prêmio Fauna</h4>
                            <p className="text-xs text-amber-700 leading-relaxed mt-1">
                                Chegue na liga Fauna (a mais alta). No último dia do mês, quem estiver no Top 10 estará elegível ao prêmio de <span className="font-bold">R$ 500!</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                            <Instagram size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-900 text-sm">3. As Regras de Ouro</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                Para validar sua participação, tenha uma ofensiva maior que 20 dias, siga o <span className="font-bold text-purple-600">@finantree.plataforma</span>, poste um story marcando o Finantree e lembre-se de deixar o perfil público para verificação da equipe.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-900 text-sm">4. Resultado da Premiação</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                Todo dia 5 sairá o resultado de quem foi o ganhador dos R$500. Será escolhido de forma aleatória pela equipe do Finantree, não é um sorteio.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-2 pb-2">
                    <Button
                        onClick={handleClose}
                        className="w-full rounded-2xl bg-slate-900 h-12 text-base font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] shadow-lg shadow-slate-200"
                        disabled={isLoading}
                    >
                        {isLoading ? "Entrando..." : "Bora pro jogo!"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
