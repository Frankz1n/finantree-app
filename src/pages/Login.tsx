import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, TreeDeciduous, Mail, Lock, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AuthService } from "@/services/auth"

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
    })

    async function onSubmit(data: LoginValues) {
        setLoading(true)
        setError(null)
        try {
            await AuthService.signIn(data.email, data.password)
            navigate("/dashboard")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleLogin() {
        try {
            await AuthService.signInWithGoogle()
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans text-slate-900">
            <div className="w-full max-w-[420px] space-y-8">
                {}
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00C980] text-white shadow-lg shadow-emerald-200/50">
                        <TreeDeciduous size={32} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finantree</h1>
                        <p className="text-base text-slate-500 font-medium">Bem-vindo de volta! 🌱</p>
                    </div>
                </div>

                {}
                <Card className="border-none shadow-xl shadow-slate-200/60 rounded-[45px] bg-white overflow-hidden">
                    <CardContent className="p-8 sm:p-10">
                        <Button
                            variant="outline"
                            className="w-full relative py-6 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-all"
                            onClick={handleGoogleLogin}
                        >
                            <div className="absolute left-6">
                                {}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-.63z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            Continuar com Google
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                <span className="bg-white px-3 text-slate-400">
                                    Ou com e-mail
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] uppercase text-slate-400 font-bold tracking-widest pl-4">E-mail</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00C980] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <Input
                                        id="email"
                                        placeholder="seu@email.com"
                                        {...register("email")}
                                        className={`rounded-full bg-slate-50 border-none pl-12 h-12 text-slate-600 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-[#00C980]/20 focus-visible:ring-offset-0 transition-all ${errors.email ? "ring-2 ring-red-100 bg-red-50 text-red-600" : ""}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 pl-4 font-medium">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] uppercase text-slate-400 font-bold tracking-widest pl-4">Senha</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00C980] transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className={`rounded-full bg-slate-50 border-none pl-12 pr-12 h-12 text-slate-600 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-[#00C980]/20 focus-visible:ring-offset-0 transition-all ${errors.password ? "ring-2 ring-red-100 bg-red-50 text-red-600" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500 pl-4 font-medium">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-500 text-center font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 bg-[#00C980] hover:bg-[#00b372] text-white font-bold rounded-full shadow-[0_10px_20px_-5px_rgba(0,201,128,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(0,201,128,0.5)] transition-all transform hover:-translate-y-0.5 text-base"
                                disabled={loading}
                            >
                                {loading ? "Entrando..." : (
                                    <span className="flex items-center gap-2">
                                        Entrar <ArrowRight size={20} />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {}
                <div className="text-center space-y-6">
                    <p className="text-sm text-slate-500 font-medium">
                        ¿Novo por aqui?{" "}
                        <a href="/register" className="font-bold text-[#00C980] hover:text-[#00b372] hover:underline transition-colors">
                            Criar conta grátis
                        </a>
                    </p>

                    <p className="text-[10px] text-slate-300 font-medium max-w-[280px] mx-auto leading-relaxed tracking-wide">
                        AO CONTINUAR, VOCÊ CONCORDA COM NOSSOS <br />
                        TERMOS DE SERVIÇO E POLÍTICA DE PRIVACIDADE
                    </p>
                </div>
            </div>
        </div>
    )
}
