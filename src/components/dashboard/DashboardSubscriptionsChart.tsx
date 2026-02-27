import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { mockSubscriptions } from '@/mocks/subscriptions';
import { formatCurrency } from '@/lib/utils';
import { Repeat } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function DashboardSubscriptionsChart() {
    const chartData = useMemo(() => {
        const activeSubscriptions = mockSubscriptions.filter(s => s.status === 'active');

        const categoryTotals = activeSubscriptions.reduce((acc: Record<string, number>, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        return Object.entries(categoryTotals)
            .map(([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);
    }, []);

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

    return (
        <Card className="rounded-[32px] border-none bg-white p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-6 px-2 text-center lg:text-left flex items-center justify-center lg:justify-start gap-2">
                <Repeat size={18} className="text-slate-400" />
                Assinaturas
            </h3>

            <div className="w-full flex items-center justify-center h-[300px]">
                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3 text-center">
                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl">
                            🔄
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Nenhuma assinatura.</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Simulação Open Finance</p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
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
    );
}
