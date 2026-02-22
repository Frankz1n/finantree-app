import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { CurrencyInput } from "@/components/ui/CurrencyInput"
import { SavingBoxService } from "@/services/savingBoxes"

interface GoalTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    boxId: string
    type: 'deposit' | 'withdrawal'
    currentAmount: number
}

export function GoalTransactionModal({ isOpen, onClose, onSuccess, boxId, type, currentAmount }: GoalTransactionModalProps) {
    const { user } = useAuth()
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setAmount('')
            setIsSubmitting(false)
        }
    }, [isOpen])

    const isDeposit = type === 'deposit'

    const handleSubmit = async () => {
        if (!user) return

        const amountValue = Number(amount)

        if (!amount || isNaN(amountValue) || amountValue <= 0) {
            toast.error("Por favor, insira um valor válido.")
            return
        }

        if (!isDeposit && amountValue > currentAmount) {
            toast.error("O valor de resgate não pode ser maior que o saldo atual.")
            return
        }

        try {
            setIsSubmitting(true)

            if (isDeposit) {
                await SavingBoxService.deposit(boxId, user.id, amountValue)
                toast.success("Depósito realizado com sucesso! 🎉")
            } else {
                await SavingBoxService.withdraw(boxId, user.id, amountValue)
                toast.success("Resgate realizado com sucesso! 💸")
            }

            onSuccess()
            onClose()
        } catch (error: any) {
            console.error("Transaction Error:", error)
            toast.error(error.message || "Ocorreu um erro ao processar a transação.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl transition-all sm:my-8 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDeposit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {isDeposit ? <span className="text-2xl">💰</span> : <span className="text-2xl">💸</span>}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isDeposit ? 'Guardar Dinheiro' : 'Resgatar Valor'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {isDeposit ? 'Aproxime-se do seu objetivo!' : 'Retirar fundos da sua meta.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Valor</label>
                        <CurrencyInput
                            value={amount}
                            onChange={(val) => setAmount(val)}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 md:py-5 text-base md:text-lg focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full rounded-2xl py-6 md:py-7 text-base md:text-lg font-bold shadow-lg transition-transform hover:-translate-y-1 ${isDeposit
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                            : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={24} className="animate-spin" />
                                <span>Processando...</span>
                            </div>
                        ) : (
                            isDeposit ? 'Confirmar Depósito' : 'Confirmar Resgate'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
