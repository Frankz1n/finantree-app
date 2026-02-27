import { useState, useMemo, useEffect } from "react"
import { formatCurrency, cn } from "@/lib/utils"
import { ShoppingBag, ArrowLeft, CreditCard, ChevronDown, ChevronUp, Clock, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { InstallmentService } from "@/services/installments"
import { Installment } from "@/types/finance"
import { useAuth } from "@/hooks/useAuth"

export default function Installments() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<string>("all")
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [installments, setInstallments] = useState<Installment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) return;

        const fetchInstallments = async () => {
            setIsLoading(true);
            try {
                const data = await InstallmentService.getUserInstallments(user.id);
                setInstallments(data);
            } catch (error) {
                console.error("Error fetching installments", error);
                toast.error("Erro ao carregar compras parceladas.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInstallments();
    }, [user]);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    // Derived State
    const { totalRemaining, monthlyCommitment, banks } = useMemo(() => {
        let remaining = 0;
        let monthly = 0;
        const bankSet = new Set<string>();

        installments.forEach(item => {
            bankSet.add(item.bank);
            // Limit current installment mathematically just for safety on visualization
            const currentPeriod = Math.min(item.current_installment, item.total_installments);

            // se a parcela atual for MENOR que o total de parcelas, significa que ele PAGA este mês e nos próximos.
            // Se já for IGUAL, ele não paga mais daqui pra frente, ja quitou ou quita nesse mesmo frame de tempo simulado.
            if (currentPeriod < item.total_installments) {
                monthly += item.amount;
                const remainingInstallments = item.total_installments - currentPeriod;
                remaining += remainingInstallments * item.amount;
            }
        });

        return {
            totalRemaining: remaining,
            monthlyCommitment: monthly,
            banks: Array.from(bankSet).sort()
        };
    }, [installments]);

    const filteredInstallments = useMemo(() => {
        if (activeTab === "all") return installments;
        return installments.filter(item => item.bank === activeTab);
    }, [activeTab, installments]);

    // Helpers
    const getBankColor = (banco: string) => {
        switch (banco) {
            case 'Nubank': return 'bg-purple-100 text-purple-600 border-purple-200';
            case 'Itaú': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'Inter': return 'bg-amber-100 text-amber-600 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    }

    const getBankGradient = (banco: string) => {
        switch (banco) {
            case 'Nubank': return 'from-purple-500 to-purple-600';
            case 'Itaú': return 'from-orange-500 to-orange-600';
            case 'Inter': return 'from-amber-500 to-amber-600';
            default: return 'from-slate-500 to-slate-600';
        }
    }


    return (
        <div className="space-y-6 pb-24 md:pb-8">
            {/* Header */}
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
                    <h1 className="text-3xl font-bold text-slate-900">Compras Parceladas</h1>
                    <p className="text-slate-500 font-medium">Controle seu comprometimento mensal.</p>
                </div>
            </div>

            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-[32px] border-none bg-slate-900 p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <ShoppingBag size={120} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Restante a Pagar</h3>
                    <div className="text-4xl font-bold tracking-tight mb-1">{formatCurrency(totalRemaining)}</div>
                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1">
                        Soma de todas as parcelas futuras
                    </p>
                </Card>

                <Card className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5 text-[#00C980]">
                        <CreditCard size={120} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Comprometimento Mensal</h3>
                    <div className="text-4xl font-bold tracking-tight text-slate-900 mb-1">{formatCurrency(monthlyCommitment)}</div>
                    <p className="text-sm font-bold text-[#00C980] flex items-center gap-1">
                        Impacto direto na sua meta mensal
                    </p>
                </Card>
            </div>

            {/* Institution Tabs */}
            <div className="pt-2">
                <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border border-transparent",
                            activeTab === "all"
                                ? "bg-slate-900 text-white shadow-md"
                                : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                        )}
                    >
                        Todos os Bancos
                    </button>
                    {banks.map(bank => (
                        <button
                            key={bank}
                            onClick={() => setActiveTab(bank)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                                activeTab === bank
                                    ? `bg-slate-900 text-white border-transparent shadow-md`
                                    : `bg-white text-slate-600 border-slate-200 hover:bg-slate-50`
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", getBankColor(bank).split(' ')[0])}></span>
                                {bank}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Installments List */}
            {isLoading ? (
                <div className="flex flex-col gap-4 mt-6">
                    <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-full px-2 mb-2"></div>
                    {[1, 2].map((skeleton) => (
                        <div key={skeleton} className="h-40 w-full rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4">
                        {filteredInstallments.map((item) => {
                            const progressPercentage = (item.current_installment / item.total_installments) * 100;
                            const isFinished = item.current_installment >= item.total_installments;

                            return (
                                <Card
                                    key={item.id}
                                    className={cn("overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow", expandedId === item.id ? "ring-2 ring-slate-100" : "")}
                                >
                                    <div className="p-5 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner text-white", getBankGradient(item.bank))}>
                                                    <ShoppingBag size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", getBankColor(item.bank))}>
                                                            {item.bank}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {new Date(item.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-2 md:gap-1">
                                                    <div className="text-left md:text-right">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Valor Mensal</div>
                                                        <div className="font-bold text-slate-900 text-xl">{formatCurrency(item.amount)}</div>
                                                    </div>
                                                    <div className="md:hidden w-px h-8 bg-slate-100 mx-2"></div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <div>
                                                            <div className="text-[10px] font-bold text-[#00C980] uppercase tracking-wider mb-0.5">Progresso</div>
                                                            <div className="font-bold text-slate-600 text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                                {item.current_installment} de {item.total_installments}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hidden md:flex text-slate-400 ml-2">
                                                    {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Progress Bar */}
                                        <div className="mt-5 w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner flex items-center">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000 ease-out", isFinished ? "bg-[#00C980]" : "bg-[#00C980] bg-opacity-90")}
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>

                                        {isFinished && expandedId !== item.id && (
                                            <p className="mt-3 text-xs font-bold text-[#00C980] text-center w-full">🎉 Compra totalmente quitada!</p>
                                        )}

                                        <div className="md:hidden flex justify-center w-full mt-4 text-slate-400">
                                            {expandedId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>

                                    {/* Area Expandida do Histórico */}
                                    {expandedId === item.id && (
                                        <div className="border-t border-slate-100 bg-slate-50 p-5 md:p-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                                                <Clock size={14} /> Histórico de Parcelas
                                            </h5>

                                            <div className="relative space-y-3 before:absolute before:inset-y-0 before:left-3 before:w-[2px] before:bg-slate-200 ml-1">
                                                {Array.from({ length: item.total_installments }).map((_, idx) => {
                                                    const currentInstallment = idx + 1;
                                                    const isPaid = currentInstallment < item.current_installment;
                                                    const isCurrent = currentInstallment === item.current_installment;

                                                    // Calculate simulated date based on start_date
                                                    const simulatedDate = new Date(item.start_date);
                                                    simulatedDate.setMonth(simulatedDate.getMonth() + idx);

                                                    return (
                                                        <div key={currentInstallment} className="relative flex items-center gap-4">
                                                            {/* Marker */}
                                                            <div className={cn("z-10 flex w-6 h-6 shrink-0 items-center justify-center rounded-full border-2", isPaid ? "border-[#00C980] bg-[#00C980] text-white" : (isCurrent ? "border-amber-400 bg-white" : "border-slate-200 bg-white text-slate-300"))}>
                                                                {isPaid ? <CheckCircle2 size={16} className="text-white" /> : <Clock size={12} className={cn(isCurrent ? "text-amber-500" : "text-slate-300")} />}
                                                            </div>

                                                            {/* Card da parcela */}
                                                            <div className={cn("flex-1 flex justify-between items-center bg-white p-3 md:p-4 rounded-xl border shadow-sm transition-all", isPaid ? "border-slate-100 opacity-60" : "border-slate-200")}>
                                                                <div>
                                                                    <div className={cn("font-bold text-sm", isPaid ? "text-slate-500 line-through decoration-slate-300 decoration-1" : "text-slate-900")}>
                                                                        Parcela {currentInstallment}
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                                        {simulatedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                                <div className={cn("font-bold", isPaid ? "text-slate-500 line-through decoration-slate-300 decoration-1" : "text-slate-900")}>
                                                                    {formatCurrency(item.amount)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>

                    {filteredInstallments.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Nenhum parcelamento encontrado para esta instituição.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
