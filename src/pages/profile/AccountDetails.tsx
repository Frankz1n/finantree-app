import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, Plus, Unplug, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AccountDetails() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [wantsReports, setWantsReports] = useState(true)
    const [wantsTips, setWantsTips] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single()

                if (error) throw error

                if (data) {
                    setFullName(data.full_name || user.user_metadata?.full_name || "")
                    setPhone(data.phone || "")
                    setBirthDate(data.birth_date || "")
                    setWantsReports(data.wants_reports ?? true)
                    setWantsTips(data.wants_tips ?? true)
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            }
        }
        fetchProfile()
    }, [user])

    const handleSave = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    phone: phone,
                    birth_date: birthDate,
                    wants_reports: wantsReports,
                    wants_tips: wantsTips,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id)

            if (error) throw error
            toast.success("Perfil atualizado com sucesso! 🌳")
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Erro ao atualizar o perfil. Tente novamente.")
        } finally {
            setIsSaving(false)
        }
    }

    const initials = fullName ? fullName.charAt(0) : (user?.user_metadata?.full_name?.charAt(0) || "U")

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Detalhes da Conta</h1>
            </div>

            <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8 px-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-4xl font-bold text-white shadow-xl ring-4 ring-white">
                                {initials}
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <CardTitle className="text-xl">Foto de Perfil</CardTitle>
                            <Button variant="outline" className="rounded-xl font-bold hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                                Personalizar Avatar ✨
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid gap-6 max-w-2xl mx-auto align-top">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">E-mail</label>
                            <Input
                                defaultValue={user?.email || ''}
                                disabled
                                className="h-12 rounded-xl bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-400 mt-1 font-medium">O e-mail foi verificado e não pode ser alterado por aqui.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Celular / WhatsApp</label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Data de Nascimento</label>
                                <Input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Comunicações</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={wantsReports}
                                        onChange={(e) => setWantsReports(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                                    <svg viewBox="0 0 14 14" fill="none" className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Receber relatórios semanais do meu progresso</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={wantsTips}
                                        onChange={(e) => setWantsTips(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                                    <svg viewBox="0 0 14 14" fill="none" className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Receber dicas financeiras e alertas do Oráculo</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center md:justify-end max-w-2xl mx-auto">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold w-full md:w-auto"
                        >
                            {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : "Salvar Alterações"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-6">
                <div className="mb-6 max-w-2xl mx-auto md:max-w-none">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-slate-400" size={20} />
                        Instituições Conectadas
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Gerencie os bancos sincronizados com o seu Finantree via Open Finance.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Mock: Nubank */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                N
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Nubank</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sincronizado</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <Unplug size={18} />
                        </Button>
                    </div>

                    {/* Mock: Itaú */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                it
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Itaú</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sincronizado</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <Unplug size={18} />
                        </Button>
                    </div>

                    {/* New Connection Button */}
                    <button
                        onClick={() => toast.info('Integração bancária (Open Finance) em breve!')}
                        className="rounded-2xl p-5 border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all text-slate-400 h-[104px] group"
                    >
                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Vincular Nova Conta</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
