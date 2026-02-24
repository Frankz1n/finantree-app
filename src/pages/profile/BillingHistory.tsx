import { useNavigate } from "react-router-dom"
import { ArrowLeft, Download, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react"

const mockInvoices = [
    { id: 'INV-001', date: '10 Fev 2026', plan: 'Individual Pro', amount: 24.90, status: 'paid' },
    { id: 'INV-002', date: '10 Jan 2026', plan: 'Individual Pro', amount: 29.90, status: 'paid' },
    { id: 'INV-003', date: '10 Dez 2025', plan: 'Básico', amount: 10.00, status: 'paid' },
    { id: 'INV-004', date: '10 Nov 2025', plan: 'Básico', amount: 10.00, status: 'pending' },
    { id: 'INV-005', date: '10 Out 2025', plan: 'Básico', amount: 10.00, status: 'failed' },
]

export default function BillingHistory() {
    const navigate = useNavigate()

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-100 text-emerald-700'
            case 'pending':
                return 'bg-amber-100 text-amber-700'
            case 'failed':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle2 size={14} className="mr-1" />
            case 'pending':
                return <Clock size={14} className="mr-1" />
            case 'failed':
                return <AlertCircle size={14} className="mr-1" />
            default:
                return null
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Pago'
            case 'pending':
                return 'Pendente'
            case 'failed':
                return 'Falhou'
            default:
                return status
        }
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Histórico de Pagamentos</h1>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {mockInvoices.map((invoice) => (
                        <div key={invoice.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">

                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                                    <FileText size={24} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm md:text-base">{invoice.plan}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{invoice.date} • {invoice.id}</p>

                                    {/* Mobile only status and amount */}
                                    <div className="md:hidden flex items-center gap-3 mt-2">
                                        <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(invoice.status)}`}>
                                            {getStatusIcon(invoice.status)}
                                            {getStatusLabel(invoice.status)}
                                        </div>
                                        <span className="font-black text-slate-900 text-sm">
                                            R$ {invoice.amount.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Desktop only status and amount */}
                                <div className="hidden md:flex items-center gap-6">
                                    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(invoice.status)}`}>
                                        {getStatusIcon(invoice.status)}
                                        {getStatusLabel(invoice.status)}
                                    </div>
                                    <span className="font-black text-slate-900 text-lg w-28 text-right">
                                        R$ {invoice.amount.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>

                                <button
                                    className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Baixar recibo"
                                >
                                    <Download size={20} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
