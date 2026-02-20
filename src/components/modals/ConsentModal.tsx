import { useState } from "react"
import { ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SharingService } from "@/services/sharing"
import { toast } from "sonner"

interface ConsentModalProps {
    isOpen: boolean
    onClose: () => void
    inviteId: string
    inviterName: string
    onAction: () => void
}

export function ConsentModal({ isOpen, onClose, inviteId, inviterName, onAction }: ConsentModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleAction = async (status: 'accepted' | 'rejected') => {
        try {
            setIsLoading(true)
            await SharingService.respondToInvite(inviteId, status)
            toast.success(status === 'accepted' ? "Convite aceito com sucesso!" : "Convite recusado.")
            onAction()
            onClose()
        } catch (error) {
            toast.error("Erro ao processar convite.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Convite para Grupo</h2>
                    <p className="mt-2 text-slate-500">
                        <strong className="text-slate-900">{inviterName}</strong> convidou você para compartilhar dados financeiros.
                    </p>
                    <p className="mt-4 text-sm text-slate-400">
                        Ao aceitar, vocês poderão ver as transações e metas um do outro. Você pode sair a qualquer momento.
                    </p>

                    <div className="mt-8 flex w-full gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleAction('rejected')}
                            disabled={isLoading}
                            className="flex-1 rounded-full border-slate-200 h-12 font-bold text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                        >
                            Recusar
                        </Button>
                        <Button
                            onClick={() => handleAction('accepted')}
                            disabled={isLoading}
                            className="flex-1 rounded-full bg-slate-900 h-12 font-bold text-white hover:bg-slate-800"
                        >
                            {isLoading ? "Processando..." : "Aceitar e Entrar"}
                        </Button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    )
}
