
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sprout } from "lucide-react"

interface GardenOnboardingModalProps {
    isOpen: boolean
    onClose: () => void
}

export function GardenOnboardingModal({ isOpen, onClose }: GardenOnboardingModalProps) {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const handleClose = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ has_seen_garden_onboarding: true })
                .eq('id', user.id)

            if (error) throw error

            onClose()
        } catch (error) {
            console.error("Error updating onboarding status:", error)
            onClose()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px] border-none bg-white/90 backdrop-blur-xl shadow-2xl rounded-[32px]">
                <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-6">
                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                        <Sprout size={32} className="text-emerald-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                        Bem-vindo ao seu Jardim Financeiro 🌱
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 text-base leading-relaxed">
                        Para que o nosso sistema consiga regar suas metas automaticamente lendo os dados do seu banco, existe uma regra de ouro:
                        <br /><br />
                        <span className="font-bold text-slate-900">O nome precisa ser idêntico.</span>
                        <br /><br />
                        Por exemplo, se você criar uma meta aqui chamada <span className="italic text-emerald-600 font-bold">'Málaga'</span>, vá no aplicativo do seu banco (Nubank, Inter, Itaú, etc.) e crie uma Caixinha/Cofrinho com o nome exato de <span className="italic text-emerald-600 font-bold">'Málaga'</span>.
                        <br /><br />
                        O Oráculo fará o resto!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-6 pb-2">
                    <Button
                        onClick={handleClose}
                        className="w-full rounded-2xl bg-slate-900 h-12 text-base font-bold hover:bg-slate-800 transition-all hover:scale-[1.02]"
                        disabled={isLoading}
                    >
                        {isLoading ? "Salvando..." : "Entendi, vamos cultivar!"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
