import { Transaction } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Pencil, Trash2 } from "lucide-react"

interface TransactionListProps {
    transactions: Transaction[]
    onEdit?: (transaction: Transaction) => void
    onDelete?: (id: string) => void
}

const TransactionList = ({ transactions, onEdit, onDelete }: TransactionListProps) => {

    const groupedTransactions = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {} as Record<string, any[]>);

    const getCategoryColor = (type: string) => {
        return type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500';
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-[32px] bg-white p-12 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-3xl">
                    🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhuma transação encontrada</h3>
                <p className="text-sm text-slate-500">Tente ajustar seus filtros ou busca.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, items]) => (
                <div key={date} className="rounded-[32px] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between px-2">
                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Calendar size={14} /> {date}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{items.length}</span>
                    </div>

                    <div className="space-y-6">
                        {items.map((t) => (
                            <div key={t.id} className="group flex items-center gap-4 relative">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getCategoryColor(t.type)}`}>
                                    { }
                                    <span className="text-xl">{t.categories?.icon || '📄'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{t.description}</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">
                                            {t.status === 'completed' ? 'APROVADO' : 'PENDENTE'}
                                        </p>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <p className="text-[10px] font-bold text-slate-400 capitalize truncate">
                                            {t.categories?.name || 'Geral'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-2 gap-1.5">
                                    <div className={`text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                        {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                    </div>

                                    {(onEdit || onDelete) && (
                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(t)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(t.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export { TransactionList }
