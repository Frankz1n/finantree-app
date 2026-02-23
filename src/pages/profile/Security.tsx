import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldAlert, KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Security() {
    const navigate = useNavigate()
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Preencha os campos de nova senha.')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.')
            return
        }

        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        setIsUpdating(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })

            if (error) throw error

            toast.success('Senha atualizada com sucesso! 🔒')
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            console.error("Error updating password:", error)
            toast.error(error.message || 'Erro ao atualizar a senha.')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteAccount = () => {
        toast.info('Para excluir sua conta e apagar todos os dados, por favor entre em contato com o suporte.')
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Privacidade e Segurança</h1>
            </div>

            <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pt-8 pb-6 px-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                            <KeyRound size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Alterar Senha</CardTitle>
                            <CardDescription className="mt-1">Atualize sua senha para manter sua conta segura</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nova Senha</label>
                            <Input
                                type="password"
                                placeholder="Digite a nova senha"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Confirmar Nova Senha</label>
                            <Input
                                type="password"
                                placeholder="Repita a nova senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-start">
                        <Button
                            onClick={handleUpdatePassword}
                            disabled={isUpdating}
                            className="rounded-xl h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold w-full md:w-auto"
                        >
                            {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : "Atualizar Senha"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[32px] border border-red-100 shadow-sm overflow-hidden bg-red-50/30 mt-6">
                <CardHeader className="border-b border-red-100/50 pt-8 pb-6 px-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-red-700">Zona de Perigo</CardTitle>
                            <CardDescription className="mt-1 text-red-900/60 font-medium">Ações destrutivas e irreversíveis</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-md">
                            <h3 className="font-bold text-slate-900 mb-1">Excluir Minha Conta</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Ao excluir sua conta, você perderá acesso ao seu Jardim, seu histórico de transações e a todas as suas metas. Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            className="rounded-xl h-12 px-6 bg-red-500 hover:bg-red-600 text-white font-bold w-full md:w-auto flex-shrink-0"
                        >
                            Excluir Minha Conta
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
