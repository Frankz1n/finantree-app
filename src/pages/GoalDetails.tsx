import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SavingBoxService } from '@/services/savingBoxes';
import { SavingBox, SavingBoxTransaction } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, Minus, Target } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { GoalTransactionModal } from '@/components/modals/GoalTransactionModal';
import { supabase } from '@/lib/supabase';

export default function GoalDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [box, setBox] = useState<SavingBox | null>(null);
    const [transactions, setTransactions] = useState<SavingBoxTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'deposit' | 'withdrawal';
    }>({ isOpen: false, type: 'deposit' });

    const fetchData = async () => {
        if (!user || !id) return;
        setIsLoading(true);
        try {
            const fetchedBox = await SavingBoxService.getById(id);
            setBox(fetchedBox);

            const fetchedTx = await SavingBoxService.getTransactions(id);
            setTransactions(fetchedTx);
        } catch (error) {
            console.error("Error fetching goal details:", error);
            navigate('/garden'); // fallback
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, user]);

    // Supabase Realtime Subscription
    useEffect(() => {
        if (!user || !id) return;

        const channel = supabase
            .channel(`saving_box_${id}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'saving_box_transactions',
                    filter: `saving_box_id=eq.${id}`,
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user]);

    const chartData = useMemo(() => {
        if (!box || transactions.length === 0) return [];

        // Transações vêm ordenadas por data decrescente do banco. Precisamos delas crescentes para a timeline.
        const sortedTx = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const firstDate = new Date(box.created_at.split('T')[0]);
        const today = new Date();

        // Garante que se o last day for < first day (bug de time), ajustamos para pelomenos 1 dia
        if (today < firstDate) today.setDate(firstDate.getDate() + 1);

        const daysInterval = eachDayOfInterval({ start: firstDate, end: today });

        let currentBalance = 0;
        let txIndex = 0;

        return daysInterval.map(day => {
            // Processa transações que ocorreram neste dia ou antes (até esvaziar o array para este step)
            while (txIndex < sortedTx.length) {
                const tx = sortedTx[txIndex];
                const txDate = new Date(tx.created_at.split('T')[0]);

                // Zera as horas pra bater só o dia no calendário local
                txDate.setHours(0, 0, 0, 0);
                const loopDay = new Date(day);
                loopDay.setHours(0, 0, 0, 0);

                if (txDate.getTime() <= loopDay.getTime()) {
                    if (tx.type === 'deposit') {
                        currentBalance += Number(tx.amount);
                    } else {
                        currentBalance -= Number(tx.amount);
                    }
                    txIndex++;
                } else {
                    break;
                }
            }

            return {
                data: format(day, 'dd/MMM', { locale: ptBR }),
                fullDate: day,
                saldo: currentBalance
            };
        });

    }, [transactions, box]);

    const calculateProgress = (current: number, target: number) => {
        if (target <= 0) return 0;
        const progress = (current / target) * 100;
        return Math.min(Math.round(progress), 100);
    };

    if (isLoading || !box) {
        return (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 size={32} className="animate-spin text-slate-300" />
                <span className="text-sm font-bold uppercase tracking-wider">Carregando detalhes da meta...</span>
            </div>
        );
    }

    const progress = calculateProgress(box.current_amount, box.target_amount);

    return (
        <div className="space-y-6 md:space-y-8 pb-24 md:pb-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/garden')}
                        className="h-12 w-12 rounded-full hover:bg-slate-100"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center text-2xl font-bold text-orange-500 shadow-sm border border-orange-100">
                            {box.icon || box.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{box.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Target size={14} className="text-slate-400" />
                                <span className="text-sm font-medium text-slate-500">
                                    Meta: {formatCurrency(box.target_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Mini Card */}
                <Card className="p-4 rounded-2xl border-none shadow-sm md:w-64 shrink-0 bg-white">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Acumulado</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(box.current_amount)}</p>
                        </div>
                        <span className="text-2xl font-black text-emerald-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* Hero Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => setModalConfig({ isOpen: true, type: 'deposit' })}
                    className="h-auto py-6 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-1 flex flex-col items-center gap-2"
                >
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Plus size={24} />
                    </div>
                    <span className="text-sm md:text-base font-bold">Guardar Dinheiro</span>
                </Button>

                <Button
                    onClick={() => setModalConfig({ isOpen: true, type: 'withdrawal' })}
                    className="h-auto py-6 rounded-3xl bg-rose-50 hover:bg-rose-100 text-rose-600 border-none shadow-sm transition-transform hover:-translate-y-1 flex flex-col items-center gap-2"
                >
                    <div className="h-10 w-10 rounded-full bg-rose-200/50 flex items-center justify-center text-rose-600">
                        <Minus size={24} />
                    </div>
                    <span className="text-sm md:text-base font-bold">Resgatar</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Evolution Chart */}
                <Card className="lg:col-span-8 rounded-[32px] border-none bg-white p-6 md:p-8 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-6">Evolução da Meta</h3>

                    {chartData.length <= 1 && box.current_amount === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <span className="text-4xl opacity-50">🌱</span>
                            <span className="text-sm font-bold text-slate-500">Seu gráfico aparecerá após o primeiro depósito.</span>
                        </div>
                    ) : (
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="data"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                        dy={10}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                        tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <RechartsTooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[150px]">
                                                        <p className="text-sm font-bold text-slate-500 mb-2">{label}</p>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-sm font-medium text-slate-600">Saldo</span>
                                                            <span className="text-lg font-black text-emerald-500">{formatCurrency(payload[0].value as number)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="saldo"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorSaldo)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>

                {/* History List */}
                <Card className="lg:col-span-4 rounded-[32px] border-none bg-white p-6 shadow-sm flex flex-col max-h-[400px]">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-6">Histórico</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-2">
                                <p className="text-sm font-medium">Nenhuma transação ainda.</p>
                            </div>
                        ) : (
                            transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg",
                                            tx.type === 'deposit' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                        )}>
                                            {tx.type === 'deposit' ? <Plus size={18} strokeWidth={3} /> : <Minus size={18} strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {tx.type === 'deposit' ? 'Depósito' : 'Resgate'}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500 uppercase">
                                                {format(parseISO(tx.created_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-black text-right",
                                        tx.type === 'deposit' ? "text-emerald-500" : "text-slate-900"
                                    )}>
                                        {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            <GoalTransactionModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onSuccess={() => fetchData()}
                boxId={box.id}
                type={modalConfig.type}
                currentAmount={box.current_amount}
            />
        </div>
    );
}
