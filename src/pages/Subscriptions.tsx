import { useState, useEffect } from "react"
import { mockSubscriptions } from "@/mocks/subscriptions"
import { formatCurrency } from "@/lib/utils"
import { ChevronDown, ChevronUp, Repeat, CreditCard, ArrowLeft, Sparkles, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { GamificationService } from "@/services/gamification"

export default function Subscriptions() {
    const navigate = useNavigate()
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [subscriptions, setSubscriptions] = useState(mockSubscriptions)
    const [showTip, setShowTip] = useState(false)
    const [isTipDismissed, setIsTipDismissed] = useState(false)

    useEffect(() => {
        if (isTipDismissed) return;

        const timer = setTimeout(() => {
            const hasStreaming = subscriptions.some(s => s.category === 'Streaming');
            if (hasStreaming) {
                setShowTip(true)
            }
        }, 1500)

        return () => clearTimeout(timer)
    }, [isTipDismissed, subscriptions])

    const handleAcceptTip = () => {
        // Find a streaming subscription to "cancel" (e.g. Netflix)
        const subToCancel = subscriptions.find(s => s.category === 'Streaming')

        if (subToCancel) {
            // Remove it from the list visually
            setSubscriptions(prev => prev.filter(s => s.id !== subToCancel.id))
            setShowTip(false)
            setIsTipDismissed(true)

            // Trigger Gamification
            GamificationService.triggerConfetti()
            toast.success(
                <div className="flex flex-col gap-1">
                    <span className="font-bold">🎉 Ótima decisão!</span>
                    <span>Você ganhou <strong className="text-emerald-400">+50 XP do Oráculo</strong> e ajudou a sua Árvore a crescer!</span>
                </div>,
                { duration: 5000 }
            )
        }
    }

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const totalRecurring = subscriptions.reduce((acc, sub) => acc + sub.amount, 0)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'paused': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'canceled': return 'bg-red-50 text-red-600 border-red-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativa'
            case 'paused': return 'Pausada'
            case 'canceled': return 'Cancelada'
            default: return status
        }
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestão de Assinaturas</h1>
                    <p className="text-slate-500 font-medium">Controle suas despesas recorrentes.</p>
                </div>
            </div>

            <Card className="rounded-[32px] border-none bg-slate-900 p-6 shadow-xl text-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Repeat size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Custo Mensal Fixo</h3>
                        <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalRecurring)}</div>
                    </div>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                    Você tem {subscriptions.length} assinaturas ativas monitoradas via Open Finance nesta simulação.
                </p>
            </Card>

            {/* O Oráculo Tip */}
            {showTip && (
                <div className="animate-in slide-in-from-top fade-in duration-500 relative overflow-hidden rounded-[24px] bg-gradient-to-r from-indigo-500 to-purple-600 p-5 shadow-lg shadow-purple-500/30 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                        <Sparkles size={64} />
                    </div>

                    <div className="relative z-10 flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner backdrop-blur-md">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Oráculo <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">Dica Inteligente</span>
                            </h3>
                            <p className="text-purple-100 text-sm leading-relaxed">
                                Notei que você tem várias assinaturas de streaming. Se cancelar uma delas (ex: Netflix), a sua meta de viagem ficará mais próxima! Deseja cancelar e poupar?
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    onClick={handleAcceptTip}
                                    className="bg-white text-purple-600 hover:bg-purple-50 font-bold rounded-full shadow-md"
                                >
                                    Aceitar Dica
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowTip(false);
                                        setIsTipDismissed(true);
                                    }}
                                    variant="ghost"
                                    className="text-purple-200 hover:text-white hover:bg-white/10 rounded-full"
                                >
                                    Ignorar
                                </Button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowTip(false)}
                        className="absolute top-3 right-3 text-purple-200 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 px-2">Suas Assinaturas</h3>
                <div className="grid gap-4">
                    {subscriptions.map((sub) => {
                        const isExpanded = expandedId === sub.id
                        const totalSpent = sub.paymentHistory.reduce((acc, p) => acc + p.amount, 0)

                        return (
                            <Card
                                key={sub.id}
                                className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
                            >
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer"
                                    onClick={() => toggleExpand(sub.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                            <img
                                                src={`https://logo.clearbit.com/${sub.domain}`}
                                                alt={`${sub.name} logo`}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            <span className="hidden text-xl font-bold text-slate-500">
                                                {sub.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{sub.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(sub.status)}`}>
                                                    {getStatusText(sub.status)}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {sub.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900">{formatCurrency(sub.amount)}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">/ {sub.billingCycle === 'monthly' ? 'mês' : 'ano'}</div>
                                        </div>
                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50 p-4 animate-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Gasto</div>
                                                <div className="text-lg font-bold text-slate-900">{formatCurrency(totalSpent)}</div>
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cliente Desde</div>
                                                <div className="text-sm font-bold text-slate-900 mt-1">
                                                    {new Date(sub.startDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                                                <CreditCard size={14} /> Histórico de Pagamentos (Simulado)
                                            </h5>
                                            <div className="space-y-2">
                                                {sub.paymentHistory.map((payment) => (
                                                    <div key={payment.id} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                        <span className="font-bold text-slate-600">
                                                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900">{formatCurrency(payment.amount)}</span>
                                                            {payment.status === 'paid' && (
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
