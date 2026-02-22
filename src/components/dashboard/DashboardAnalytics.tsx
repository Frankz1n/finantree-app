import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TransactionService } from '@/services/transactions';
import { Transaction, Category } from '@/types/finance';
import { Card } from '@/components/ui/card';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { subDays, subMonths, subYears, startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

type TimeFilter = '24h' | '7d' | '1m' | '3m' | '6m' | '1y';

const EXPENSE_PIE_COLORS = ['#334155', '#4f46e5', '#e11d48', '#d97706', '#0891b2', '#10b981', '#8b5cf6'];
const INCOME_PIE_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#84cc16', '#3b82f6', '#8b5cf6', '#f59e0b'];

export function DashboardAnalytics() {
    const { user } = useAuth();

    const [timeFilter, setTimeFilter] = useState<TimeFilter>('1m');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Busca Bruta: Traz todas as transações para filtrar localmente no Typescript
            const data = await TransactionService.getTransactions(user.id);
            setTransactions(data);

            const cats = await TransactionService.getCategories();
            if (cats) setCategories(cats);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load Initial e Escuta do TimeFilter (apenas no React)
    useEffect(() => {
        fetchData();
    }, [user]);

    // Supabase Realtime Subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('dashboard_analytics_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Compute Local Date Filtering (À Prova de Balas Timezone)
    const { filteredTransactions, startDate, endDate } = useMemo(() => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (timeFilter) {
            case '24h': start = subDays(now, 1); break;
            case '7d': start = subDays(now, 6); break;
            case '1m':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case '3m': start = subMonths(now, 3); break;
            case '6m': start = subMonths(now, 6); break;
            case '1y': start = subYears(now, 1); break;
        }

        const filtered = transactions.filter(txn => {
            const dateStr = txn.payment_date || txn.due_date || txn.created_at;
            if (!dateStr) return false;

            // Extrai a parte "YYYY-MM-DD" e usa construct local ignorando o T/UTC
            const datePart = dateStr.split('T')[0].split(' ')[0];
            const [year, month, day] = datePart.split('-');
            const txnDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            // Zera as horas para abrangência perfeita local (00:00:00 até 23:59:59)
            const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

            return txnDate >= startMidnight && txnDate <= endMidnight;
        });

        return { filteredTransactions: filtered, startDate: start, endDate: end };
    }, [transactions, timeFilter]);

    // Process AreaChart Data (Cashflow Trend Array Skeleton)
    const areaChartData = useMemo(() => {
        // Cria o esqueleto contínuo de todos os dias do período (mesmo os que não tem gasto)
        const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

        const skeleton = daysInterval.map(day => ({
            data: format(day, 'dd/MM', { locale: ptBR }),
            receitas: 0,
            despesas: 0,
        }));

        filteredTransactions.forEach(txn => {
            const dateStr = txn.payment_date || txn.due_date || txn.created_at;
            if (!dateStr) return;

            const datePart = dateStr.split('T')[0].split(' ')[0];
            const [year, month, day] = datePart.split('-');
            const localTxnDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const formattedDay = format(localTxnDate, 'dd/MM', { locale: ptBR });

            // Merge os valores para a caixinha do array respectivo
            const dayEntry = skeleton.find(entry => entry.data === formattedDay);
            if (dayEntry) {
                if (txn.type === 'income') {
                    dayEntry.receitas += Number(txn.amount);
                } else if (txn.type === 'expense') {
                    dayEntry.despesas += Number(txn.amount);
                }
            }
        });

        return skeleton;
    }, [filteredTransactions, startDate, endDate]);

    // Process PieChart Data (Expenses)
    const expensePieData = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'expense');

        const categoryTotals = expenses.reduce((acc: Record<string, number>, curr) => {
            const cat = categories.find(c => c.id === curr.category_id);
            const catName = cat?.name || 'Outros';
            acc[catName] = (acc[catName] || 0) + Number(curr.amount);
            return acc;
        }, {});

        return Object.entries(categoryTotals)
            .map(([name, value], index) => ({
                name,
                value,
                color: EXPENSE_PIE_COLORS[index % EXPENSE_PIE_COLORS.length]
            }))
            .sort((a, b) => b.value - a.value); // Ordena maior para menor
    }, [filteredTransactions, categories]);

    // Process PieChart Data (Incomes)
    const incomePieData = useMemo(() => {
        const incomes = filteredTransactions.filter(t => t.type === 'income');

        const categoryTotals = incomes.reduce((acc: Record<string, number>, curr) => {
            const cat = categories.find(c => c.id === curr.category_id);
            const catName = cat?.name || 'Outros';
            acc[catName] = (acc[catName] || 0) + Number(curr.amount);
            return acc;
        }, {});

        return Object.entries(categoryTotals)
            .map(([name, value], index) => ({
                name,
                value,
                color: INCOME_PIE_COLORS[index % INCOME_PIE_COLORS.length]
            }))
            .sort((a, b) => b.value - a.value); // Ordena maior para menor
    }, [filteredTransactions, categories]);


    // Custom Tooltips UI
    const AreaTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[150px]">
                    <p className="text-sm font-bold text-slate-500 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm font-medium text-slate-600 capitalize">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-1 items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{payload[0].name}</span>
                    <span className="text-lg font-bold text-slate-900" style={{ color: payload[0].payload.color }}>
                        {formatCurrency(payload[0].value)}
                    </span>
                </div>
            );
        }
        return null;
    };

    const FilterButton = ({ value, label }: { value: TimeFilter, label: string }) => (
        <button
            onClick={() => setTimeFilter(value)}
            className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                timeFilter === value
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 lg:space-y-8 min-h-[400px]">

            {/* Area Chart - Cashflow Trend (Full width) */}
            <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm flex flex-col w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-2">
                    <h3 className="text-base md:text-lg font-bold text-slate-900">Fluxo de Caixa</h3>

                    {/* Time Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                        <FilterButton value="24h" label="24h" />
                        <FilterButton value="7d" label="7 Dias" />
                        <FilterButton value="1m" label="1 Mês" />
                        <FilterButton value="3m" label="3 Meses" />
                        <FilterButton value="6m" label="6 Meses" />
                        <FilterButton value="1y" label="1 Ano" />
                    </div>
                </div>

                {/* ALTURA FIXA AQUI h-[320px] PARA O GRÁFICO DE FLUXO */}
                <div className="w-full h-[320px] mt-4">
                    {isLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Loader2 size={32} className="animate-spin text-slate-300" />
                            <span className="text-xs font-bold uppercase tracking-wider">Carregando dados...</span>
                        </div>
                    ) : areaChartData.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="text-3xl">📉</div>
                            <span className="text-sm font-bold">Sem dados no período.</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="data"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                    tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                />
                                <RechartsTooltip content={<AreaTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="receitas"
                                    name="Receitas"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorReceitas)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="despesas"
                                    name="Despesas"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDespesas)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>

            {/* Grid for Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Donut Chart - Incomes by Category */}
                <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm flex flex-col">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-6 px-2 text-center lg:text-left">Receitas por Categoria</h3>

                    {/* ALTURA FIXA AQUI h-[300px] PARA OS DONUTS */}
                    <div className="w-full flex items-center justify-center h-[300px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Loader2 size={32} className="animate-spin text-slate-300" />
                            </div>
                        ) : incomePieData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-3 text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl">
                                    💰
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500">Nenhuma receita.</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">No período selecionado</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={incomePieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {incomePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<PieTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-bold text-slate-600 ml-1">{value}</span>}
                                        wrapperStyle={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', paddingTop: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Donut Chart - Expenses by Category */}
                <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm flex flex-col">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-6 px-2 text-center lg:text-left">Despesas por Categoria</h3>

                    {/* ALTURA FIXA AQUI h-[300px] PARA OS DONUTS */}
                    <div className="w-full flex items-center justify-center h-[300px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Loader2 size={32} className="animate-spin text-slate-300" />
                            </div>
                        ) : expensePieData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-3 text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl">
                                    🍕
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500">Nenhuma despesa.</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">No período selecionado</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expensePieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {expensePieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<PieTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-bold text-slate-600 ml-1">{value}</span>}
                                        wrapperStyle={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', paddingTop: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}