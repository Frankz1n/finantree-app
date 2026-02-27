import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { TransactionService } from "@/services/transactions"
import { Transaction } from "@/types/finance"
import { SummaryCards } from "@/components/transactions/SummaryCards"
import { TransactionList } from "@/components/transactions/TransactionList"
import { AddTransactionModal } from "@/components/modals/AddTransactionModal"
import { TransactionModal } from "@/components/modals/TransactionModal"
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal"
import { Search, Plus, Calendar, Filter, Repeat, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

export default function Extract() {
    const { user } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [summary, setSummary] = useState({ spent: 0, income: 0, saved: 0 })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingTx, setEditingTx] = useState<Transaction | null>(null)
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
    const [categories, setCategories] = useState<any[]>([])


    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    // Filter States (Synced with URL)
    const typeFilter = searchParams.get('type') || 'all'
    const categoryIds = searchParams.getAll('categories')
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    // Load available categories
    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await TransactionService.getCategories();
            setCategories(cats || []);
        }
        fetchCategories();
    }, []);

    // Sync debounce to URL
    useEffect(() => {
        if (debouncedSearchTerm) {
            searchParams.set('q', debouncedSearchTerm)
        } else {
            searchParams.delete('q')
        }
        setSearchParams(searchParams)
    }, [debouncedSearchTerm])


    useEffect(() => {
        if (user) {
            loadTransactions()
        }

        const handleTransactionUpdate = () => {
            if (user) loadTransactions()
        }
        window.addEventListener('transaction_updated', handleTransactionUpdate)

        return () => {
            window.removeEventListener('transaction_updated', handleTransactionUpdate)
        }
    }, [user, searchParams])

    const loadTransactions = async () => {
        if (!user) return

        const filters: any = { searchTerm: searchParams.get('q') || '' }
        if (typeFilter !== 'all') filters.type = typeFilter
        if (categoryIds.length > 0) filters.categoryIds = categoryIds
        if (startDate && endDate) {
            filters.startDate = startDate
            filters.endDate = endDate
        }

        const data = await TransactionService.getTransactions(user.id, filters)
        setTransactions(data)


        const spent = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
        const income = data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
        const saved = income - spent

        setSummary({ spent, income, saved })
    }


    const handleTypeFilter = (type: string) => {
        if (type === 'all') searchParams.delete('type')
        else searchParams.set('type', type)
        setSearchParams(searchParams)
    }

    const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
        if (value) searchParams.set(key, value)
        else searchParams.delete(key)
        setSearchParams(searchParams)
    }

    const handleEdit = (t: Transaction) => {
        setEditingTx(t)
        setIsEditModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setTransactionToDelete(id)
    }

    const confirmDelete = async () => {
        if (!transactionToDelete) return
        try {
            await TransactionService.deleteTransaction(transactionToDelete)
            toast.success('Transação excluída com sucesso!')
            loadTransactions()
        } catch (error) {
            toast.error('Erro ao excluir a transação.')
        } finally {
            setTransactionToDelete(null)
        }
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            { }
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Extrato</h1>
                    <p className="text-slate-500 font-medium">Seu histórico financeiro, simplificado.</p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    { }
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar transações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full lg:w-64 rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-2 w-full lg:w-auto">
                        <Button
                            onClick={() => navigate('/parcelamentos')}
                            variant="outline"
                            className="rounded-full border-slate-200 text-slate-900 hover:bg-slate-50 w-full text-xs sm:text-sm px-2 cursor-pointer"
                        >
                            <ShoppingBag size={16} className="mr-1 sm:mr-2" /> Parceladas
                        </Button>
                        <Button
                            onClick={() => navigate('/assinaturas')}
                            variant="outline"
                            className="rounded-full border-slate-200 text-slate-900 hover:bg-slate-50 w-full text-xs sm:text-sm px-2 cursor-pointer"
                        >
                            <Repeat size={16} className="mr-1 sm:mr-2" /> Assinaturas
                        </Button>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="col-span-2 lg:col-span-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 w-full cursor-pointer"
                        >
                            <Plus size={18} className="mr-2" /> Nova Transação
                        </Button>
                    </div>
                </div>
            </div>

            { }
            <SummaryCards spent={summary.spent} income={summary.income} saved={summary.saved} />

            { }
            <div className="space-y-4">

                { }
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center w-full">

                    { }
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full lg:w-auto">
                        {['Todos', 'Entradas', 'Saídas', 'Investimentos'].map((typeLabel) => {
                            const typeMap: Record<string, string> = {
                                'Todos': 'all',
                                'Entradas': 'income',
                                'Saídas': 'expense',
                                'Investimentos': 'investment'
                            };
                            const typeValue = typeMap[typeLabel];
                            const isActive = typeFilter === typeValue;

                            return (
                                <button
                                    key={typeLabel}
                                    onClick={() => handleTypeFilter(typeValue)}
                                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${isActive
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {typeLabel}
                                </button>
                            )
                        })}
                    </div>

                    { }
                    <div className="flex w-full lg:w-auto items-center gap-1 sm:gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm overflow-hidden">
                        <div className="relative flex-1 flex items-center min-w-0">
                            <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                                className="h-9 w-full rounded-full border-none bg-transparent pl-7 sm:pl-9 pr-1 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-600 outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <span className="text-slate-300 shrink-0">|</span>
                        <div className="relative flex-1 flex items-center min-w-0">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                                className="h-9 w-full rounded-full border-none bg-transparent px-1 sm:px-2 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-600 outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                { }
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Filtrar por Categoria</p>
                    <div className="relative">
                        <select
                            value={categoryIds.length === 1 ? categoryIds[0] : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    searchParams.delete('categories');
                                    searchParams.append('categories', val);
                                } else {
                                    searchParams.delete('categories');
                                }
                                setSearchParams(searchParams);
                            }}
                            className="h-10 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-10 text-xs font-bold text-slate-600 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                            <option value="">Todas as Categorias</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon || '🏷️'} {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Filter size={14} />
                        </div>
                    </div>
                </div>
            </div>

            { }
            <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            { }
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={() => {
                    setIsAddModalOpen(false)
                    loadTransactions()
                }}
            />

            {editingTx && (
                <TransactionModal
                    isOpen={isEditModalOpen}
                    type={editingTx.type as 'income' | 'expense'}
                    initialData={editingTx}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setEditingTx(null)
                    }}
                    onSuccess={() => {
                        setIsEditModalOpen(false)
                        setEditingTx(null)
                        loadTransactions()
                    }}
                />
            )}

            <ConfirmDeleteModal
                isOpen={!!transactionToDelete}
                title="Excluir Transação"
                description="Tem certeza que deseja excluir esta transação de forma permanente? Esta ação não pode ser desfeita."
                onConfirm={confirmDelete}
                onClose={() => setTransactionToDelete(null)}
            />
        </div>
    )
}
