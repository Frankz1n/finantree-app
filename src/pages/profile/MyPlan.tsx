import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Users } from "lucide-react"

const plans = [
    {
        id: 'basic',
        name: 'Básico',
        price: 10.00,
        features: ['Gerenciamento de gastos simples', 'Sincronização na nuvem'],
        isShared: false
    },
    {
        id: 'pro',
        name: 'Individual Pro',
        price: 29.90,
        features: ['Todas as features do Básico', 'Objetivos ilimitados no Jardim', 'Categorias customizáveis', 'IA treinada para gestão'],
        isShared: false
    },
    {
        id: 'duo',
        name: 'Dupla',
        price: 49.90,
        features: ['Perfeito para casais', 'Metas compartilhadas', 'Divisão de despesas justa', 'IA treinada para gestão'],
        isShared: true
    },
    {
        id: 'family',
        name: 'Família',
        price: 79.90,
        features: ['Até 4 membros incluídos', 'Controle parental', 'Missões familiares (Gamificação)', 'IA treinada para gestão'],
        isShared: true
    }
]

export default function MyPlan() {
    const navigate = useNavigate()

    // Simulação: usuário atual no plano 'Básico' (index 0)
    const currentPlanIndex = 0

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Meu Plano</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan, index) => {
                    const isCurrentPlan = index === currentPlanIndex
                    const isUpgrade = index > currentPlanIndex

                    // Lógica de desconto progressivo
                    let discountAmount = 0
                    if (isUpgrade) {
                        discountAmount = (index - currentPlanIndex) * 5
                    }

                    const finalPrice = plan.price - discountAmount

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-[32px] p-6 shadow-sm flex flex-col transition-all duration-300 ${isCurrentPlan
                                ? 'ring-2 ring-emerald-500 bg-emerald-50/20 transform scale-[1.02] shadow-md'
                                : 'border border-slate-100'
                                }`}
                        >
                            {isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm">
                                    Seu Plano
                                </div>
                            )}

                            <div className="mb-4 text-center mt-2">
                                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                <div className="mt-4 flex flex-col items-center justify-center min-h-[60px]">
                                    {isUpgrade && discountAmount > 0 ? (
                                        <>
                                            <span className="text-sm font-semibold text-slate-400 line-through mb-1">
                                                de R$ {plan.price.toFixed(2).replace('.', ',')}
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-emerald-600">por</span>
                                                <span className="text-3xl font-black text-slate-900">
                                                    R$ {finalPrice.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-slate-900">
                                                R$ {plan.price.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-slate-500 text-sm font-medium mt-1">por mês</span>
                                </div>
                            </div>

                            {plan.isShared && (
                                <div className="mb-6 bg-violet-50 text-violet-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-violet-100">
                                    <Users size={16} />
                                    <span>+ R$ 10,00/mês por membro adicional</span>
                                </div>
                            )}

                            <div className="flex-1 bg-slate-50 rounded-2xl p-4 mb-6">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                            <div className="bg-emerald-100 rounded-full p-1 shrink-0 mt-0.5">
                                                <Check size={12} className="text-emerald-700 font-bold" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-auto space-y-3">
                                {isCurrentPlan ? (
                                    <>
                                        <button disabled className="w-full py-3.5 px-4 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-sm border-2 border-emerald-200">
                                            Seu Plano Atual
                                        </button>

                                        {/* Este botão aparecerá se testarmos mudando o index atual para um plano compartilhado */}
                                        {plan.isShared && (
                                            <button className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                                                <Users size={16} />
                                                Adicionar Membro (R$ 10,00)
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${isUpgrade
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}>
                                        {isUpgrade ? 'Fazer Upgrade' : 'Rebaixar Plano'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
