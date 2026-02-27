import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { SavingBox } from "@/types/finance"
import { GardenOnboardingModal } from "@/components/modals/GardenOnboardingModal"
import { GoalModal } from "@/components/modals/GoalModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Sprout, MoreVertical, Edit2, Trash2, Droplets, Sparkles, X, Leaf } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { SavingBoxService } from "@/services/savingBoxes"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GoalTransactionModal } from "@/components/modals/GoalTransactionModal"

export default function Garden() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [savingBoxes, setSavingBoxes] = useState<SavingBox[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [showGoalModal, setShowGoalModal] = useState(false)
    const [showOracleToast, setShowOracleToast] = useState(false)

    // Transaction Modal State
    const [transactionModalConfig, setTransactionModalConfig] = useState<{
        isOpen: boolean;
        boxId: string;
        type: 'deposit' | 'withdrawal';
        currentAmount: number;
        initialAmount?: number;
    }>({ isOpen: false, boxId: '', type: 'deposit', currentAmount: 0 })

    useEffect(() => {
        if (user) {
            checkOnboarding()
            loadSavingBoxes()
        }

        const handleTransactionUpdate = () => {
            if (user) loadSavingBoxes()
        }
        window.addEventListener('transaction_updated', handleTransactionUpdate)

        return () => {
            window.removeEventListener('transaction_updated', handleTransactionUpdate)
        }
    }, [user])

    const checkOnboarding = async () => {
        if (!user) return
        const { data, error } = await supabase
            .from('profiles')
            .select('has_seen_garden_onboarding')
            .eq('id', user.id)
            .single()

        if (!error && data && !data.has_seen_garden_onboarding) {
            setShowOnboarding(true)
        }
    }

    const loadSavingBoxes = async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('saving_boxes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setSavingBoxes(data || [])

            // Trigger Oracle Toast se houver metas em atraso
            if (mockedData.some(b => b.status === 'delayed')) {
                setTimeout(() => setShowOracleToast(true), 1200);
            }
        } catch (error) {
            console.error("Error loading saving boxes:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const calculateProgress = (current: number, target: number) => {
        if (target <= 0) return 0
        const progress = (current / target) * 100
        return Math.min(Math.round(progress), 100)
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (window.confirm("Tem certeza que deseja deletar esta meta e todo seu histórico permanentemente?")) {
            try {
                await SavingBoxService.delete(id)
                toast.success("Meta deletada com sucesso!")
                loadSavingBoxes()
            } catch (error) {
                toast.error("Erro ao deletar meta.")
            }
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8 pb-24 md:pb-8">
                <header className="flex items-center justify-between">
                    <div>
                        <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
                        <div className="h-5 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-[32px] bg-slate-100 animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-24 md:pb-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Meu Jardim</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        Veja seus sonhos crescerem <Sprout size={16} className="text-emerald-500" />
                    </p>
                </div>
                <Button
                    onClick={() => setShowGoalModal(true)}
                    className="h-12 w-12 rounded-full bg-slate-900 p-0 shadow-lg hover:bg-slate-800 transition-transform hover:scale-105"
                >
                    <Plus size={24} className="text-white" />
                </Button>
            </header>

            {/* O Oráculo Tip - Aviso Gamificado Restrito */}
            <AnimatePresence>
                {showOracleToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-amber-500 to-orange-600 p-5 shadow-lg shadow-orange-500/30 text-white"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Sparkles size={64} />
                        </div>

                        <div className="relative z-10 flex gap-4 pr-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner backdrop-blur-md">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <div className="flex-1 space-y-1 text-left">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    Oráculo <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">Atenção</span>
                                </h3>
                                <p className="text-orange-100 text-sm leading-relaxed">
                                    O seu jardim está a secar! Se você não regar (depositar) este mês, a sua meta vai atrasar em 2 meses. <strong className="font-bold text-white">Pegue o regador</strong> ao lado da sua planta e recupere o ritmo!
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowOracleToast(false)}
                            className="absolute top-4 right-4 text-orange-200 hover:text-white transition-colors bg-white/10 rounded-full p-1"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savingBoxes.map((box, index) => {
                    const progress = calculateProgress(box.current_amount, box.target_amount)
                    const isDelayed = box.status === 'delayed'

                    return (
                        <motion.div
                            key={box.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                onClick={() => navigate(`/jardim/${box.id}`)}
                                className={cn(
                                    "group relative overflow-hidden rounded-[32px] border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                                    isDelayed ? "border-orange-200 bg-orange-50/30" : "border-slate-100"
                                )}
                            >
                                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-100 p-1">
                                            <DropdownMenuItem
                                                onClick={(e) => { e.stopPropagation(); toast.info("Edição virá em breve!") }}
                                                className="flex items-center gap-2 cursor-pointer font-medium rounded-lg"
                                            >
                                                <Edit2 size={14} /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleDelete(e, box.id)}
                                                className="flex items-center gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-medium rounded-lg"
                                            >
                                                <Trash2 size={14} /> Deletar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex justify-between items-start mb-8 pt-2 relative">
                                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm", isDelayed ? "bg-orange-100 text-orange-600" : "bg-emerald-50 text-emerald-600")}>
                                        {isDelayed ? <Leaf size={24} className="opacity-70" /> : (box.icon || getInitials(box.name))}
                                    </div>

                                    {isDelayed && (
                                        <div
                                            className="absolute -top-1 left-9 z-20 cursor-pointer animate-pulse"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTransactionModalConfig({
                                                    isOpen: true,
                                                    boxId: box.id,
                                                    type: 'deposit',
                                                    currentAmount: box.current_amount,
                                                    initialAmount: box.monthly_target || 0
                                                });
                                                setShowOracleToast(false);
                                            }}
                                            title="Regar planta (Depositar meta mensal)"
                                        >
                                            <div className="bg-sky-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center hover:bg-sky-400 transition-colors">
                                                <Droplets size={16} fill="currentColor" />
                                            </div>
                                        </div>
                                    )}

                                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold mr-8", isDelayed ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500")}>
                                        {progress}%
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 truncate pr-6" title={box.name}>{box.name}</h3>
                                    <p className="text-xs font-medium text-slate-400">
                                        <span className="text-slate-600">{formatCurrency(box.current_amount)}</span> / {formatCurrency(box.target_amount)}
                                    </p>
                                    {isDelayed && (
                                        <p className="text-[10px] font-bold text-orange-500 mt-2">⚠️ Necessita ser regada este mês.</p>
                                    )}
                                </div>

                                <div className={cn("h-2 w-full rounded-full overflow-hidden", isDelayed ? "bg-orange-200" : "bg-slate-100")}>
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", isDelayed ? "bg-orange-500" : "bg-emerald-500")}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: savingBoxes.length * 0.1 }}
                >
                    <button
                        onClick={() => setShowGoalModal(true)}
                        className="w-full h-full min-h-[220px] rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-slate-300 hover:text-slate-500 hover:bg-slate-100/50 transition-all group"
                    >
                        <Plus size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Nova Meta</span>
                    </button>
                </motion.div>
            </div>

            <GardenOnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
            />

            <GoalModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                onSuccess={() => { loadSavingBoxes() }}
            />

            <GoalTransactionModal
                isOpen={transactionModalConfig.isOpen}
                onClose={() => setTransactionModalConfig(prev => ({ ...prev, isOpen: false }))}
                onSuccess={() => { loadSavingBoxes() }}
                boxId={transactionModalConfig.boxId}
                type={transactionModalConfig.type}
                currentAmount={transactionModalConfig.currentAmount}
                initialAmount={transactionModalConfig.initialAmount}
            />
        </div>
    )
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
}
