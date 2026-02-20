
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export function StressTestButton() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const generateTransactions = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const descriptions = ['Mercado', 'Uber', 'Pix Recebido', 'Freelance', 'Restaurante', 'Cinema', 'Farmácia', 'Combustível', 'Salário', 'Aluguel']


            const transactions = Array.from({ length: 50 }).map(() => {
                const isExpense = Math.random() > 0.3 
                const type = isExpense ? 'expense' : 'income'
                const amount = Math.floor(Math.random() * 490) + 10 
                const desc = descriptions[Math.floor(Math.random() * descriptions.length)]


                const date = new Date()
                date.setDate(date.getDate() - Math.floor(Math.random() * 30))

                return {
                    user_id: user.id,
                    description: `${desc} (Teste)`,
                    amount,
                    type,
                    status: 'completed',
                    due_date: date.toISOString(),
                    payment_date: date.toISOString(),
                    category_id: null 
                }
            })

            const { error } = await supabase.from('transactions').insert(transactions)

            if (error) throw error

            toast.success("50 Transações geradas com sucesso! 🚀")
            window.location.reload()

        } catch (error) {
            console.error("Erro no stress test:", error)
            toast.error("Erro ao gerar transações.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={generateTransactions}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg rounded-full"
            >
                {isLoading ? "Gerando..." : "💣 Gerar 50 Transações"}
            </Button>
        </div>
    )
}
