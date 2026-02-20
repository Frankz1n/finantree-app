import { X, Users, Shield, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransparencyConsentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    onDecline: () => void
    hostName: string
}

export function TransparencyConsentModal({
    isOpen,
    onClose,
    onConfirm,
    onDecline,
    hostName
}: TransparencyConsentModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {}
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    {}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#00C980]">
                        <Users size={32} strokeWidth={2.5} />
                    </div>

                    {}
                    <h2 className="mb-3 text-2xl font-bold text-slate-900">
                        Entrar na Família de {hostName}?
                    </h2>

                    {}
                    <p className="mb-8 text-sm leading-relaxed text-slate-500">
                        {hostName} definiu este grupo com transparência <span className="font-bold text-[#00C980]">ABERTA</span>.
                        <br />
                        Você deseja compartilhar seu histórico de transações?
                    </p>

                    {}
                    <div className="flex w-full flex-col gap-3">
                        <Button
                            onClick={onConfirm}
                            className="h-12 w-full gap-2 rounded-full bg-[#00C980] text-sm font-bold text-white hover:bg-[#00b372] shadow-lg shadow-emerald-200/50"
                        >
                            <ShieldCheck size={18} />
                            Sim, Compartilhar Tudo
                        </Button>

                        <Button
                            onClick={onDecline}
                            variant="ghost"
                            className="h-12 w-full gap-2 rounded-full bg-slate-50 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                            <Shield size={18} />
                            Não, Manter Privado
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
