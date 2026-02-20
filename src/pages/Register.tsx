import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, TreeDeciduous, MailCheck, ArrowLeft } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AuthService } from "@/services/auth"

const registerSchema = z.object({
    fullName: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function Register() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterValues) {
        setLoading(true)
        setError(null)

        try {
            await AuthService.signUp(data.email, data.password, data.fullName)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-[400px] space-y-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                            <MailCheck size={40} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Verifique seu e-mail</h1>
                        <p className="text-muted-foreground">
                            Enviamos um link de confirmação para <br />
                            <span className="font-semibold text-foreground">{getValues("email")}</span>.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full mt-6"
                        onClick={() => navigate("/login")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-[400px] space-y-6">
                {}
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white shadow-lg">
                        <TreeDeciduous size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Crie sua conta</h1>
                    <p className="text-sm text-muted-foreground">Comece a controlar suas finanças hoje.</p>
                </div>

                {}
                <Card className="border-border/40 shadow-xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Seu nome"
                                    {...register("fullName")}
                                    className={errors.fullName ? "border-red-500" : ""}
                                />
                                {errors.fullName && (
                                    <p className="text-xs text-red-500">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">E-mail</Label>
                                <Input
                                    id="email"
                                    placeholder="seu@email.com"
                                    {...register("email")}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className={errors.password ? "border-red-500" : ""}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-5"
                                disabled={loading}
                            >
                                {loading ? "Criando conta..." : "Cadastrar →"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {}
                <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="font-semibold text-green-500 hover:text-green-600 hover:underline">
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
