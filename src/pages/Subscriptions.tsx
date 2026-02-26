import { useState } from "react"
import { mockSubscriptions } from "@/mocks/subscriptions"
import { formatCurrency } from "@/lib/utils"
import { ChevronDown, ChevronUp, Repeat, CreditCard, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function Subscriptions() {
    const navigate = useNavigate()
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const totalRecurring = mockSubscriptions.reduce((acc, sub) => acc + sub.amount, 0)

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
                    Você tem {mockSubscriptions.length} assinaturas ativas monitoradas via Open Finance nesta simulação.
                </p>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 px-2">Suas Assinaturas</h3>
                <div className="grid gap-4">
                    {mockSubscriptions.map((sub) => {
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
