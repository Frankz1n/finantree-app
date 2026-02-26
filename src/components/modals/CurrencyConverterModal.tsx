import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRightLeft, Loader2, Globe, Search, ChevronDown, Check } from "lucide-react"
import { CURRENCIES } from "@/constants/currencies"

interface CurrencyConverterModalProps {
    isOpen: boolean
    onClose: () => void
}

function CurrencyCombobox({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    const selected = CURRENCIES.find(c => c.code === value)
    const filtered = CURRENCIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative w-full">
            <Label className="block text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-2">{label}</Label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full h-12 px-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00C980] transition-all"
            >
                {selected ? (
                    <span className="flex items-center gap-2 overflow-hidden pr-2 w-full">
                        <span className="text-xl leading-none shrink-0">{selected.flag}</span>
                        <span className="truncate whitespace-nowrap text-left w-full">{selected.code} - {selected.name}</span>
                    </span>
                ) : 'Selecione...'}
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
                    <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transform transition-all origin-top">
                        <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                            <Search size={16} className="text-slate-400 ml-1 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Pesquisar..."
                                className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700 py-1"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                            {filtered.length > 0 ? (
                                filtered.map(c => (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                            onChange(c.code)
                                            setOpen(false)
                                            setSearch('')
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-slate-100 transition-colors ${value === c.code ? 'bg-emerald-50 text-[#00C980] font-bold' : 'text-slate-600 font-medium'}`}
                                    >
                                        <span className="flex items-center gap-2 overflow-hidden pr-2">
                                            <span className="text-xl leading-none shrink-0">{c.flag}</span>
                                            <span className="truncate whitespace-nowrap text-left">{c.code} - {c.name}</span>
                                        </span>
                                        {value === c.code && <Check size={16} className="shrink-0" />}
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 text-sm py-4">Nenhuma moeda encontrada.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export function CurrencyConverterModal({ isOpen, onClose }: CurrencyConverterModalProps) {
    const [amount, setAmount] = useState<string>('1')
    const [fromCurrency, setFromCurrency] = useState('EUR')
    const [toCurrency, setToCurrency] = useState('BRL')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [ratesCache, setRatesCache] = useState<Record<string, number>>({ BRL: 1 })

    useEffect(() => {
        if (isOpen) {
            fetchRates()
        }
    }, [isOpen, fromCurrency, toCurrency])

    const fetchRates = async () => {
        if (ratesCache[fromCurrency] && ratesCache[toCurrency] && !error) return

        setIsLoading(true)
        setError(null)
        try {
            const pairsToFetch: string[] = []
            if (fromCurrency !== 'BRL' && !ratesCache[fromCurrency]) pairsToFetch.push(`${fromCurrency}-BRL`)
            if (toCurrency !== 'BRL' && fromCurrency !== toCurrency && !ratesCache[toCurrency]) pairsToFetch.push(`${toCurrency}-BRL`)

            if (pairsToFetch.length > 0) {
                const response = await fetch(`https://economia.awesomeapi.com.br/last/${pairsToFetch.join(',')}`)
                if (!response.ok) throw new Error('Falha ao obter taxas')
                const data = await response.json()

                setRatesCache(prev => {
                    const newCache = { ...prev }
                    if (fromCurrency !== 'BRL' && data[`${fromCurrency}BRL`]) {
                        newCache[fromCurrency] = parseFloat(data[`${fromCurrency}BRL`].bid)
                    }
                    if (toCurrency !== 'BRL' && data[`${toCurrency}BRL`]) {
                        newCache[toCurrency] = parseFloat(data[`${toCurrency}BRL`].bid)
                    }
                    return newCache
                })
            }
        } catch (err) {
            setError('Não foi possível carregar as taxas.')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSwap = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    const calculateResult = () => {
        if (!amount) return null
        const numAmount = Number(amount)
        if (isNaN(numAmount)) return null
        if (fromCurrency === toCurrency) return numAmount

        const rateFrom = ratesCache[fromCurrency]
        const rateTo = ratesCache[toCurrency]

        if (!rateFrom || !rateTo) return null

        const amountInBRL = numAmount * rateFrom
        return amountInBRL / rateTo
    }

    const result = calculateResult()
    const targetCurrencyInfo = CURRENCIES.find(c => c.code === toCurrency)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* O segredo da responsividade está aqui: max-h-[90vh] e w-[95vw] blindam contra quebras */}
            <DialogContent className="w-[95vw] sm:max-w-[480px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[24px] p-5 sm:p-6 mx-auto flex flex-col gap-6">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl mt-2">
                        <Globe className="text-[#00C980]" />
                        Conversor de Moedas
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5 w-full">

                    {/* Input Valor */}
                    <div className="w-full space-y-2">
                        <Label htmlFor="amount" className="text-slate-500 font-bold uppercase text-xs tracking-wider">Valor a Converter</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-2xl font-bold h-14 rounded-2xl border-slate-200 w-full"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Seletores de Moeda - Flexbox Blindado */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">
                        <div className="w-full sm:w-[calc(50%-1.5rem)]">
                            <CurrencyCombobox
                                label="De"
                                value={fromCurrency}
                                onChange={setFromCurrency}
                            />
                        </div>

                        <div className="flex-shrink-0 mt-0 sm:mt-6">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSwap}
                                className="rounded-full h-10 w-10 border-slate-200 bg-white shadow-sm text-slate-400 hover:text-[#00C980] hover:border-[#00C980] transition-colors rotate-90 sm:rotate-0"
                            >
                                <ArrowRightLeft size={16} />
                            </Button>
                        </div>

                        <div className="w-full sm:w-[calc(50%-1.5rem)]">
                            <CurrencyCombobox
                                label="Para"
                                value={toCurrency}
                                onChange={setToCurrency}
                            />
                        </div>
                    </div>

                    {/* Display de Resultado */}
                    <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100 w-full">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-4 text-[#00C980]">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Obtendo taxas...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-sm font-medium py-4">
                                {error}
                                <Button variant="link" onClick={fetchRates} className="text-[#00C980] px-1 h-auto mt-1">Tentar novamente</Button>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center">
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Resultado da Conversão</p>
                                <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight break-words w-full px-2">
                                    {targetCurrencyInfo?.symbol} {result !== null ? result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                </div>
                                {ratesCache[fromCurrency] && ratesCache[toCurrency] && fromCurrency !== toCurrency && (
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3 select-none">
                                        1 {fromCurrency} = {(ratesCache[fromCurrency] / ratesCache[toCurrency]).toLocaleString('pt-BR', { maximumFractionDigits: 4 })} {toCurrency}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botão Concluído - Agora garantido de aparecer */}
                    <Button
                        className="w-full h-14 rounded-2xl bg-[#00C980] hover:bg-[#00b372] text-white font-bold text-lg shadow-lg shadow-emerald-200/50 transition-all mt-2"
                        onClick={onClose}
                    >
                        Concluído
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    )
}
