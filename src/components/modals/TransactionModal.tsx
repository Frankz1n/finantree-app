import { X, Check, Loader2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TransactionService } from "@/services/transactions"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useStreak } from "@/contexts/StreakContext"
import { CurrencyInput } from "@/components/ui/CurrencyInput"

interface TransactionModalProps {
    isOpen: boolean
    type: 'income' | 'expense'
    onClose: () => void
    onSuccess: () => void
    initialData?: any
}

interface Category {
    id: string
    name: string
    icon: string
    type: 'income' | 'expense'
}

export function TransactionModal({ isOpen, type, onClose, onSuccess, initialData }: TransactionModalProps) {
    const { user } = useAuth()
    const { registerMeaningfulInteraction } = useStreak()
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
    const [isLoadingCats, setIsLoadingCats] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isIncome = type === 'income'
    const accentColor = isIncome ? 'emerald' : 'red'


    useEffect(() => {
        if (!isOpen) return
        const load = async () => {
            setIsLoadingCats(true)
            const data = await TransactionService.getCategories(type)
            setCategories(data as Category[])
            setIsLoadingCats(false)
        }
        load()
    }, [type, isOpen])


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setAmount(initialData.amount.toString())
                setDescription(initialData.description)
                setSelectedCategory(initialData.category_id)
                setDate(new Date(initialData.due_date).toISOString().split('T')[0])
            } else {
                setAmount('')
                setDescription('')
                setSelectedCategory(null)
                setDate(new Date().toISOString().split('T')[0])
            }
            setIsSubmitting(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!user) return

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Por favor, insira um valor válido.")
            return
        }
        if (!description.trim()) {
            toast.error("Por favor, insira uma descrição.")
            return
        }
        if (!selectedCategory) {
            toast.error("Por favor, selecione uma categoria.")
            return
        }

        try {
            setIsSubmitting(true)
            const dueDate = new Date(date + 'T12:00:00').toISOString()

            if (initialData?.id) {
                await TransactionService.updateTransaction(initialData.id, {
                    amount: Number(amount),
                    description: description.trim(),
                    category_id: selectedCategory,
                    due_date: dueDate,
                    payment_date: dueDate,
                })
                toast.success(isIncome ? "Receita atualizada com sucesso!" : "Despesa atualizada com sucesso!")
            } else {
                await TransactionService.createTransaction({
                    user_id: user.id,
                    amount: Number(amount),
                    type,
                    description: description.trim(),
                    category_id: selectedCategory,
                    due_date: dueDate,
                    payment_date: dueDate,
                    status: 'completed',
                })
                toast.success(isIncome ? "Receita adicionada com sucesso!" : "Despesa adicionada com sucesso!")
            }

            registerMeaningfulInteraction()
            window.dispatchEvent(new CustomEvent('transaction_updated'))
            onSuccess()
            onClose()
        } catch {
            toast.error("Erro ao salvar transação. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                { }
                <div className={cn(
                    "h-1.5 w-full",
                    isIncome ? "bg-emerald-500" : "bg-red-500"
                )} />

                { }
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className={cn(
                        "text-xl font-bold",
                        isIncome ? "text-emerald-600" : "text-red-600"
                    )}>
                        {initialData ? (isIncome ? "Editar Receita" : "Editar Despesa") : (isIncome ? "Nova Receita" : "Nova Despesa")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 pt-2 space-y-6">
                    { }
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Valor</label>
                        <div className="mt-2">
                            <CurrencyInput
                                value={amount}
                                onChange={setAmount}
                                className="border-none bg-transparent text-3xl font-bold text-slate-900 shadow-none outline-none focus-visible:ring-0 placeholder:text-slate-200 px-0"
                                autoFocus
                            />
                        </div>
                    </div>

                    { }
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Descrição</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                            placeholder={isIncome ? "Ex: Salário, Freelance" : "Ex: Uber, Supermercado"}
                        />
                    </div>

                    { }
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Categoria</label>
                        {isLoadingCats ? (
                            <div className="mt-4 flex justify-center py-4">
                                <Loader2 className="animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="mt-2 max-h-48 overflow-y-auto scrollbar-hide">
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 rounded-2xl p-3 transition-all active:scale-95 border",
                                                selectedCategory === cat.id
                                                    ? `bg-${accentColor}-500 text-white border-${accentColor}-500 shadow-md`
                                                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                            )}
                                            style={selectedCategory === cat.id ? {
                                                backgroundColor: isIncome ? '#10b981' : '#ef4444',
                                                borderColor: isIncome ? '#10b981' : '#ef4444',
                                                color: 'white',
                                            } : undefined}
                                        >
                                            <span className="text-2xl">{cat.icon}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide truncate w-full text-center">
                                                {cat.name}
                                            </span>
                                        </button>
                                    ))}
                                    {categories.length === 0 && (
                                        <div className="col-span-3 py-8 text-center text-sm text-slate-400">
                                            Nenhuma categoria encontrada.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    { }
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Data</label>
                        <div className="mt-2 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                            <Calendar size={18} className="text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                            />
                        </div>
                    </div>

                    { }
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={cn(
                            "h-14 w-full gap-2 rounded-[24px] text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02]",
                            isIncome
                                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                                : "bg-red-500 hover:bg-red-600 shadow-red-200"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                        {isSubmitting ? "Salvando..." : initialData ? "Salvar Alterações" : `Adicionar ${isIncome ? 'Receita' : 'Despesa'}`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
