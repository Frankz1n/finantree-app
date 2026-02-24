import { useNavigate } from "react-router-dom"
import { ArrowLeft, Gift, Copy, Share2, UserPlus, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Invites() {
    const navigate = useNavigate()
    const inviteLink = "finantree.com/invite/franklyn123"

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink)
        toast.success("Link copiado para a área de transferência!")
    }

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(`Vem pro Finantree gerenciar sua grana comigo! Use meu link e ganhe benefícios: ${inviteLink}`)
        window.open(`https://wa.me/?text=${text}`, '_blank')
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Convide e Ganhe XP</h1>
            </div>

            {/* Painel de Progresso */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-8 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Gift size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">2/5 Amigos Convidados</h2>
                            <p className="text-emerald-100 font-medium mt-1">Faltam 3 para desbloquear o baú épico!</p>
                        </div>
                    </div>

                    <div className="h-3 bg-emerald-900/30 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '40%' }}></div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mb-3">1</div>
                            <h3 className="font-bold text-sm">Convide um amigo</h3>
                            <p className="text-xs text-emerald-100 mt-1">Compartilhe seu link exclusivo.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mb-3">2</div>
                            <h3 className="font-bold text-sm">Ele se cadastra</h3>
                            <p className="text-xs text-emerald-100 mt-1">Ganhe 50% do XP na hora.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mb-3">3</div>
                            <h3 className="font-bold text-sm">Ele assina um plano</h3>
                            <p className="text-xs text-emerald-100 mt-1">Ganhe 100% do XP restante.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Ações de Compartilhamento */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Seu Link de Convite</h3>

                        <div className="flex gap-2 mb-6">
                            <Input
                                readOnly
                                value={inviteLink}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium text-slate-600 focus-visible:ring-emerald-500"
                            />
                            <Button
                                onClick={handleCopyLink}
                                variant="outline"
                                className="h-12 px-4 rounded-xl shrink-0 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                            >
                                <Copy size={18} className="mr-2" />
                                Copiar
                            </Button>
                        </div>

                        <Button
                            onClick={handleWhatsAppShare}
                            className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-base shadow-sm group"
                        >
                            <Share2 size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                            Compartilhar no WhatsApp
                        </Button>
                    </div>
                </div>

                {/* Lista de Convidados */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <UserPlus size={20} className="text-slate-400" />
                        Status dos Convites
                    </h3>

                    <div className="space-y-4">
                        {/* Exemplo 1: Cadastrado */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                                    V
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Victor Z.</h4>
                                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">Conta Criada (+500 XP)</p>
                                </div>
                            </div>
                            <div className="text-emerald-500 flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100/50">
                                <div className="relative">
                                    <Circle size={20} className="text-slate-200" />
                                    <svg className="absolute inset-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12" className="text-emerald-500" strokeDasharray="31.4" strokeDashoffset="15.7" />
                                        <polyline points="22 4 12 14.01 9 11.01" className="text-emerald-500" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Exemplo 2: Assinante */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                    G
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                        Gabriel A.
                                        <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black">Pro</span>
                                    </h4>
                                    <p className="text-xs font-bold text-amber-600 mt-0.5">Assinante (+1000 XP)</p>
                                </div>
                            </div>
                            <div className="text-amber-500 flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                                <CheckCircle2 size={20} className="fill-amber-100" />
                            </div>
                        </div>

                        {/* Exemplo 3: Pendente */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-200 bg-transparent">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                                    ?
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-500 text-sm">Convite Enviado</h4>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">Aguardando cadastro...</p>
                                </div>
                            </div>
                            <div className="text-slate-300">
                                <Circle size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
