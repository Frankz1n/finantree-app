import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { SavingBox } from "@/types/finance"
import { GardenOnboardingModal } from "@/components/modals/GardenOnboardingModal"
import { GoalModal } from "@/components/modals/GoalModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Sprout, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { SavingBoxService } from "@/services/savingBoxes"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Garden() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [savingBoxes, setSavingBoxes] = useState<SavingBox[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [showGoalModal, setShowGoalModal] = useState(false)
    // const [editingBox, setEditingBox] = useState<SavingBox | null>(null) // Placeholder para futura edição

    useEffect(() => {
        if (user) {
            checkOnboarding()
            loadSavingBoxes()
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savingBoxes.map((box, index) => {
                    const progress = calculateProgress(box.current_amount, box.target_amount)
                    return (
                        <motion.div
                            key={box.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                onClick={() => navigate(`/jardim/${box.id}`)}
                                className="group relative overflow-hidden rounded-[32px] border-none bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-100">
                                            <DropdownMenuItem
                                                onClick={(e) => { e.stopPropagation(); toast.info("Edição virá em breve!") }}
                                                className="flex items-center gap-2 cursor-pointer font-medium"
                                            >
                                                <Edit2 size={14} /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleDelete(e, box.id)}
                                                className="flex items-center gap-2 cursor-pointer text-rose-600 focus:text-rose-600 font-medium"
                                            >
                                                <Trash2 size={14} /> Deletar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex justify-between items-start mb-8 pt-2">
                                    <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-500">
                                        {box.icon || getInitials(box.name)}
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 mr-8">
                                        {progress}%
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 truncate pr-6" title={box.name}>{box.name}</h3>
                                    <p className="text-xs font-medium text-slate-400">
                                        <span className="text-slate-600">{formatCurrency(box.current_amount)}</span> / {formatCurrency(box.target_amount)}
                                    </p>
                                </div>

                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
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
