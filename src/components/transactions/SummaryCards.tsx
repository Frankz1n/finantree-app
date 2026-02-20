import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface SummaryCardsProps {
    spent: number
    income: number
    saved: number
}

export function SummaryCards({ spent, income, saved }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Gasto Total</p>
                <h3 className="text-2xl md:text-xl lg:text-3xl font-bold text-slate-900 truncate" title={formatCurrency(spent)}>{formatCurrency(spent)}</h3>
            </Card>

            <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Receita Total</p>
                <h3 className="text-2xl md:text-xl lg:text-3xl font-bold text-slate-900 truncate" title={formatCurrency(income)}>{formatCurrency(income)}</h3>
            </Card>

            <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-1">Guardado</p>
                <h3 className="text-2xl md:text-xl lg:text-3xl font-bold text-slate-900 truncate" title={formatCurrency(saved)}>{formatCurrency(saved)}</h3>
            </Card>
        </div>
    )
}
