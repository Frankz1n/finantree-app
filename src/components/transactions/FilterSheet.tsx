import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { useState, useEffect } from "react"
import { TransactionService } from "@/services/transactions"

interface FilterSheetProps {
    onApplyFilters: (filters: FilterState) => void
    initialFilters: FilterState
}

export interface FilterState {
    categoryIds: string[]
    startDate?: string
    endDate?: string
    status?: 'all' | 'pending' | 'completed'
}

export function FilterSheet({ onApplyFilters, initialFilters }: FilterSheetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categoryIds || [])
    const [status, setStatus] = useState<string>(initialFilters.status || 'all')
    const [startDate, setStartDate] = useState<string>(initialFilters.startDate || '')
    const [endDate, setEndDate] = useState<string>(initialFilters.endDate || '')

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await TransactionService.getCategories()
            setCategories(data || [])
        }
        fetchCategories()
    }, [])

    // Sync internal state when prop changes (e.g. URL change)
    useEffect(() => {
        setSelectedCategories(initialFilters.categoryIds || [])
        setStatus(initialFilters.status || 'all')
        setStartDate(initialFilters.startDate || '')
        setEndDate(initialFilters.endDate || '')
    }, [initialFilters])

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const handleApply = () => {
        onApplyFilters({
            categoryIds: selectedCategories,
            status: status as any,
            startDate,
            endDate
        })
        setIsOpen(false)
    }

    const handleClear = () => {
        setSelectedCategories([])
        setStatus('all')
        setStartDate('')
        setEndDate('')
        onApplyFilters({
            categoryIds: [],
            status: 'all',
            startDate: undefined,
            endDate: undefined
        })
        setIsOpen(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900">
                    <Filter size={18} />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Filtros Avançados</SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-8">
                    {}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Período</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500">De</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500">Até</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Status</h3>
                        <div className="flex gap-2">
                            {['all', 'pending', 'completed'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${status === s
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendente' : 'Concluído'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Categorias</h3>
                            {selectedCategories.length > 0 && (
                                <button onClick={() => setSelectedCategories([])} className="text-xs text-red-500 hover:text-red-600 font-medium">
                                    Limpar seleção
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategories.includes(cat.id)
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        }`}
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    {cat.name}
                                    {selectedCategories.includes(cat.id) && <X size={12} className="ml-1" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button variant="outline" className="flex-1" onClick={handleClear}>
                        Limpar Filtros
                    </Button>
                    <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white" onClick={handleApply}>
                        Aplicar Filtros
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
