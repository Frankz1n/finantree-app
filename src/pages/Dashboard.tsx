import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, TrendingUp, ShoppingCart, Clapperboard, Briefcase, Car, Flame } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { TransactionService } from "@/services/transactions"
import { Transaction } from "@/types/finance"
import { TransparencyConsentModal } from "@/components/modals/TransparencyConsentModal"
import { TransactionModal } from "@/components/modals/TransactionModal"
import { GoalModal } from "@/components/modals/GoalModal"
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics"

export default function Dashboard() {
    const { user, streak, efficiencyScore } = useAuth()
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "Usuário"

    const [balance, setBalance] = useState(0)
    const [dailyNet, setDailyNet] = useState(0)
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])


    const [showTransparencyModal, setShowTransparencyModal] = useState(false)
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
    const [showGoalModal, setShowGoalModal] = useState(false)


    const scorePercentage = Math.min(Math.max(efficiencyScore / 10, 0), 100);
    const dashOffset = 251.2 - (251.2 * scorePercentage) / 100;

    const refreshData = useCallback(() => {
        if (!user) return
        TransactionService.getBalance(user.id).then(setBalance)
        TransactionService.getTodaySavings(user.id).then(setDailyNet)
        TransactionService.getRecentTransactions(user.id).then(setRecentTransactions)
    }, [user])

    useEffect(() => {
        refreshData()
    }, [refreshData])

    const openTransactionModal = (type: 'income' | 'expense') => {
        setTransactionType(type)
        setShowTransactionModal(true)
    }

    const handleConfirmTransparency = () => {
        console.log("User consented to share all data")

        setShowTransparencyModal(false)
        localStorage.setItem('hasSeenTransparencyModal', 'true')
    }

    const handleDeclineTransparency = () => {
        console.log("User declined, sharing only goals")

        setShowTransparencyModal(false)
        localStorage.setItem('hasSeenTransparencyModal', 'true')
    }

    const getCategoryIcon = (categoryName: string) => {

        const lower = categoryName.toLowerCase();
        if (lower.includes('mercado') || lower.includes('food')) return <ShoppingCart size={20} />;
        if (lower.includes('netflix') || lower.includes('entertainment')) return <Clapperboard size={20} />;
        if (lower.includes('freelance') || lower.includes('salary')) return <Briefcase size={20} />;
        if (lower.includes('uber') || lower.includes('transport')) return <Car size={20} />;
        return <Wallet size={20} />;
    }

    const getCategoryColor = (type: string) => {
        return type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500';
    }

    return (
        <>
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        Olá, {firstName}!
                        <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Vamos cultivar sua riqueza.</p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-orange-600 border border-orange-100 shadow-sm">
                    <Flame size={18} fill="currentColor" className="text-orange-500" />
                    <span className="text-sm font-bold">Sequência de {streak} dias</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                { }
                <div className="lg:col-span-8 space-y-6 md:space-y-8">

                    { }
                    <Card className="relative overflow-hidden rounded-[32px] md:rounded-[40px] border-none bg-white p-6 md:p-8 shadow-sm">
                        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                            { }
                            <div className="flex h-24 w-24 md:h-32 md:w-32 shrink-0 items-center justify-center rounded-full bg-green-50">
                                { }
                                <div className="text-5xl md:text-6xl">🌳</div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Saldo Disponível</h3>
                                    <div className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{formatCurrency(balance)}</div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className={`rounded-full px-4 py-2 text-xs font-bold border ${dailyNet >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        {dailyNet >= 0 ? `No caminho! +${formatCurrency(dailyNet)} hoje` : `Gasto hoje: ${formatCurrency(Math.abs(dailyNet))}`}
                                    </span>
                                    <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-bold text-purple-600 border border-purple-100">
                                        IA: Economizar {formatCurrency(10)} hoje?
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    { }
                    <div>
                        <h3 className="mb-4 text-base md:text-lg font-bold text-slate-900">Ações Rápidas</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3 md:gap-4">
                            <Button
                                onClick={() => openTransactionModal('expense')}
                                className="w-full h-auto aspect-square lg:w-32 lg:h-32 flex-col gap-2 md:gap-3 rounded-[24px] md:rounded-[32px] bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:scale-105 transition-transform p-4"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                    <Plus size={24} />
                                </div>
                                <span className="text-xs font-bold">Nova Despesa</span>
                            </Button>

                            <Button
                                onClick={() => openTransactionModal('income')}
                                className="w-full h-auto aspect-square lg:w-32 lg:h-32 flex-col gap-2 md:gap-3 rounded-[24px] md:rounded-[32px] bg-[#00C980] hover:bg-[#00b372] text-white shadow-lg shadow-emerald-200/50 hover:scale-105 transition-transform p-4"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                    <Wallet size={24} />
                                </div>
                                <span className="text-xs font-bold">Nova Receita</span>
                            </Button>

                            <Button
                                onClick={() => setShowGoalModal(true)}
                                className="w-full h-auto aspect-square lg:w-32 lg:h-32 flex-col gap-2 md:gap-3 rounded-[24px] md:rounded-[32px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-violet-200/50 hover:scale-105 transition-transform p-4"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-xs font-bold">Nova Meta</span>
                            </Button>
                        </div>
                    </div>
                </div>

                { }
                <div className="lg:col-span-4 space-y-6 md:space-y-8">

                    { }
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-base md:text-lg font-bold text-slate-900">Atividade Recente</h3>
                            <button className="text-xs font-bold text-[#00C980] hover:underline">Ver tudo</button>
                        </div>

                        <Card className="rounded-[32px] border-none bg-white p-4 md:p-6 shadow-sm space-y-5 md:space-y-6">
                            {recentTransactions.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-4">Nenhuma atividade recente.</p>
                            ) : (
                                recentTransactions.map((t) => (
                                    <div key={t.id} className="flex items-center gap-3 md:gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getCategoryColor(t.type)}`}>
                                            {getCategoryIcon(t.description)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900 truncate">{t.description}</h4>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">
                                                {new Date(t.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                        <div className={`text-sm font-bold ${t.type === 'income' ? 'text-[#00C980]' : 'text-slate-900'}`}>
                                            {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </Card>
                    </div>

                    { }
                    <Card className="rounded-[32px] border-none bg-white p-6 md:p-8 shadow-sm text-center">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Pontuação de Eficiência</h3>

                        <div className="relative mx-auto h-32 w-32 flex items-center justify-center">
                            { }
                            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="40" fill="transparent" stroke="#00C980" strokeWidth="8"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-slate-900">{efficiencyScore}</span>
                            </div>
                        </div>

                        <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {efficiencyScore > 800 ? "Excelente!" : efficiencyScore > 500 ? "Bom Trabalho" : "Continue Melhorando"}
                        </p>
                    </Card>

                </div>
            </div>

            <div className="mt-8 mb-4">
                <DashboardAnalytics />
            </div>

            <TransparencyConsentModal
                isOpen={showTransparencyModal}
                onClose={() => setShowTransparencyModal(false)}
                onConfirm={handleConfirmTransparency}
                onDecline={handleDeclineTransparency}
                hostName="Franklyn"
            />

            <TransactionModal
                isOpen={showTransactionModal}
                type={transactionType}
                onClose={() => setShowTransactionModal(false)}
                onSuccess={refreshData}
            />

            <GoalModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                onSuccess={refreshData}
            />

        </>
    )
}
