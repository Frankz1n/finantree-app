import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ConfirmDeleteModalProps {
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => Promise<void>
    onClose: () => void
}

export function ConfirmDeleteModal({ isOpen, title, description, onConfirm, onClose }: ConfirmDeleteModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
        } finally {
            setIsDeleting(false)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-slate-900">{title}</h2>
                    <p className="mb-8 text-sm text-slate-500 leading-relaxed">{description}</p>

                    <div className="flex w-full flex-col gap-3">
                        <Button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="h-12 w-full rounded-2xl bg-red-500 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98]"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" /> : "Sim, excluir"}
                        </Button>
                        <Button
                            onClick={onClose}
                            disabled={isDeleting}
                            variant="ghost"
                            className="h-12 w-full rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-[0.98]"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
