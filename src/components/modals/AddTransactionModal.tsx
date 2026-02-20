import { X, ArrowUp, ArrowDown, Calendar, Clock, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TransactionService } from "@/services/transactions"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { CurrencyInput } from "@/components/ui/CurrencyInput"

interface AddTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => void
}

interface Category {
    id: string
    name: string
    icon: string
    type: 'income' | 'expense'
}

export function AddTransactionModal({ isOpen, onClose, onSave }: AddTransactionModalProps) {
    const { user } = useAuth()
    const [type, setType] = useState<'income' | 'expense'>('expense')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load categories when type changes
    useEffect(() => {
        const loadCategories = async () => {
            setIsLoading(true)
            const data = await TransactionService.getCategories(type)
            setCategories(data as Category[])
            setIsLoading(false)
            setSelectedCategory(null) // Reset selection on type change
        }
        if (isOpen) {
            loadCategories()
        }
    }, [type, isOpen])

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('')
            setDescription('')
            setSelectedCategory(null)
            setIsSubmitting(false)
        }
    }, [isOpen])

    const handleSave = async () => {
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
            await TransactionService.createTransaction({
                user_id: user.id,
                amount: Number(amount),
                type: type,
                description: description,
                category_id: selectedCategory,
                due_date: new Date().toISOString(), // Using today for now
                payment_date: new Date().toISOString(),
                status: 'completed'
            })

            toast.success("Transação adicionada com sucesso!")
            onSave({}) 
            onClose()
        } catch (error) {
            toast.error("Erro ao salvar transação.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-bold text-slate-900">Nova Transação</h2>
                    <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 pt-2 space-y-6">
                    {}
                    <div className="flex rounded-full bg-slate-100 p-1">
                        <button
                            onClick={() => setType('expense')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-all",
                                type === 'expense' ? "bg-white text-red-500 shadow-sm" : "text-slate-400"
                            )}
                        >
                            <ArrowDown size={18} />
                            Despesa
                        </button>
                        <button
                            onClick={() => setType('income')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-all",
                                type === 'income' ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400"
                            )}
                        >
                            <ArrowUp size={18} />
                            Receita
                        </button>
                    </div>

                    {}
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

                    {}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Descrição</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Compras no Mercado"
                        />
                    </div>

                    {}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Categoria</label>
                        {isLoading ? (
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
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                            )}
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

                    {}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Data</label>
                            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900">
                                <Calendar size={18} className="text-slate-400" />
                                <span className="text-sm font-bold">Hoje</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Hora</label>
                            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900">
                                <Clock size={18} className="text-slate-400" />
                                <span className="text-sm font-bold">Now</span>
                            </div>
                        </div>
                    </div>

                    {}
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className={cn(
                            "h-14 w-full gap-2 rounded-[24px] text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02]",
                            type === 'expense' ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                        {isSubmitting ? "Salvando..." : `Adicionar ${type === 'expense' ? 'Despesa' : 'Receita'}`}
                    </Button>

                </div>
            </div>
        </div>
    )
}
