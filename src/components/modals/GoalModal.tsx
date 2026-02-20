import { X, Check, Loader2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { CurrencyInput } from "@/components/ui/CurrencyInput"
import { SavingBoxService } from "@/services/savingBoxes"

interface GoalModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function GoalModal({ isOpen, onClose, onSuccess }: GoalModalProps) {
    const { user } = useAuth()
    const [name, setName] = useState('')
    const [targetAmount, setTargetAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setName('')
            setTargetAmount('')
            setIsSubmitting(false)
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!user) return

        if (!name.trim()) {
            toast.error("Por favor, insira o nome da meta.")
            return
        }
        if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
            toast.error("Por favor, insira um valor alvo válido.")
            return
        }

        try {
            setIsSubmitting(true)

            await SavingBoxService.create({
                user_id: user.id,
                name: name.trim(),
                target_amount: Number(targetAmount),
            })

            toast.success("Meta criada com sucesso! 🌱")
            onSuccess()
            onClose()
        } catch {
            toast.error("Erro ao criar meta. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {}
                <div className="h-1.5 w-full bg-violet-500" />

                {}
                <div className="flex items-center justify-between p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                            <Target size={20} className="text-violet-600" />
                        </div>
                        <h2 className="text-xl font-bold text-violet-600">Nova Meta</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 pt-2 space-y-6">
                    {}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Nome da Meta</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Viagem a Málaga, Reserva de Emergência"
                            autoFocus
                        />
                    </div>

                    {}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Valor Alvo</label>
                        <div className="mt-2">
                            <CurrencyInput
                                value={targetAmount}
                                onChange={setTargetAmount}
                                className="border-none bg-transparent text-3xl font-bold text-slate-900 shadow-none outline-none focus-visible:ring-0 placeholder:text-slate-200 px-0"
                            />
                        </div>
                    </div>

                    {}
                    <div className="rounded-2xl bg-violet-50 px-4 py-3 border border-violet-100">
                        <p className="text-xs font-medium text-violet-600">
                            💡 Sua meta aparecerá no Jardim. O valor guardado começa em R$ 0,00 e poderá ser atualizado a qualquer momento.
                        </p>
                    </div>

                    {}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={cn(
                            "h-14 w-full gap-2 rounded-[24px] text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02]",
                            "bg-violet-500 hover:bg-violet-600 shadow-violet-200"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                        {isSubmitting ? "Criando..." : "Criar Meta"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
