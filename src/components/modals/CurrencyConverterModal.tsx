import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRightLeft, Loader2, Globe } from "lucide-react"

interface CurrencyConverterModalProps {
    isOpen: boolean
    onClose: () => void
}

const CURRENCIES = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'USD', name: 'Dólar Americano', symbol: 'US$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'ARS', name: 'Peso Argentino', symbol: 'ARS$' },
]

export function CurrencyConverterModal({ isOpen, onClose }: CurrencyConverterModalProps) {
    const [amount, setAmount] = useState<string>('1')
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('BRL')
    const [rates, setRates] = useState<Record<string, number> | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && !rates) {
            fetchRates()
        }
    }, [isOpen, rates])

    const fetchRates = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,ARS-BRL')
            if (!response.ok) throw new Error('Falha ao obter taxas de câmbio')
            const data = await response.json()

            setRates({
                BRL: 1,
                USD: parseFloat(data.USDBRL.bid),
                EUR: parseFloat(data.EURBRL.bid),
                GBP: parseFloat(data.GBPBRL.bid),
                ARS: parseFloat(data.ARSBRL.bid),
            })
        } catch (err) {
            setError('Não foi possível carregar as taxas de câmbio. Tente novamente mais tarde.')
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
        if (!rates || !amount) return null
        const numAmount = Number(amount)
        if (isNaN(numAmount)) return null
        if (fromCurrency === toCurrency) return numAmount

        const amountInBRL = numAmount * rates[fromCurrency]
        const result = amountInBRL / rates[toCurrency]
        return result
    }

    const result = calculateResult()
    const targetCurrencyInfo = CURRENCIES.find(c => c.code === toCurrency)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Globe className="text-[#00C980]" />
                        Conversor de Moedas
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-slate-500 font-bold uppercase text-xs tracking-wider">Valor a Converter</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-2xl font-bold h-14 rounded-2xl border-slate-200"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Currency Selectors */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-2 mt-4 lg:mt-0">
                            <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">De</Label>
                            <select
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00C980] focus:border-transparent transition-all"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-6">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSwap}
                                className="rounded-full h-10 w-10 border-slate-200 text-slate-400 hover:text-[#00C980] hover:border-[#00C980] transition-colors"
                            >
                                <ArrowRightLeft size={16} />
                            </Button>
                        </div>

                        <div className="flex-1 space-y-2 mt-4 lg:mt-0">
                            <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Para</Label>
                            <select
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                                className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00C980] focus:border-transparent transition-all"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Result Display */}
                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 mt-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-4 text-[#00C980]">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Obtendo taxas...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-sm font-medium py-4">
                                {error}
                                <Button variant="link" onClick={fetchRates} className="text-[#00C980] px-1">Tentar novamente</Button>
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-sm font-medium text-slate-500 mb-1">Resultado da Conversão</p>
                                <div className="text-4xl font-bold text-slate-900 tracking-tight break-all">
                                    {targetCurrencyInfo?.symbol} {result !== null ? result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                </div>
                                {rates && fromCurrency !== toCurrency && (
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3 select-none">
                                        1 {fromCurrency} = {(rates[fromCurrency] / rates[toCurrency]).toLocaleString('pt-BR', { maximumFractionDigits: 4 })} {toCurrency}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        className="w-full h-14 rounded-2xl bg-[#00C980] hover:bg-[#00b372] text-white font-bold text-lg shadow-lg shadow-emerald-200/50 transition-all"
                        onClick={onClose}
                    >
                        Concluído
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
