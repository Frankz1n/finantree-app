export interface InstallmentHistory {
    currentInstallment: number;
    dueDate: string;
    amount: number;
    status: 'paid' | 'pending';
}

export interface Installment {
    id: string;
    banco: string;          // Ex: 'Nubank', 'Itaú', 'Inter'
    nomeCompra: string;     // Ex: 'MacBook Pro', 'Passagem Aérea'
    valorParcela: number;   // Monthly amount
    parcelaAtual: number;   // Current installment number (e.g. 3)
    totalParcelas: number;  // Total installments (e.g. 12)
    dataCompra: string;     // ISO date
    installmentsHistory: InstallmentHistory[];
}

const generateHistory = (
    dataCompra: string,
    valorParcela: number,
    totalParcelas: number,
    parcelaAtual: number
): InstallmentHistory[] => {
    const history: InstallmentHistory[] = [];
    const baseDate = new Date(dataCompra);

    // Assumindo vencimento 1 mês após a data da compra para iniciar
    for (let i = 1; i <= totalParcelas; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        history.push({
            currentInstallment: i,
            dueDate: dueDate.toISOString(),
            amount: valorParcela,
            status: i <= parcelaAtual ? 'paid' : 'pending'
        });
    }
    return history;
};

export const mockInstallments: Installment[] = [
    {
        id: 'inst-1',
        banco: 'Nubank',
        nomeCompra: 'MacBook Pro M3',
        valorParcela: 1250.00,
        parcelaAtual: 3,
        totalParcelas: 12,
        dataCompra: '2025-11-15T14:30:00.000Z',
        installmentsHistory: generateHistory('2025-11-15T14:30:00.000Z', 1250.00, 12, 3)
    },
    {
        id: 'inst-2',
        banco: 'Nubank',
        nomeCompra: 'Seguro do Carro',
        valorParcela: 350.50,
        parcelaAtual: 8,
        totalParcelas: 10,
        dataCompra: '2025-06-10T09:00:00.000Z',
        installmentsHistory: generateHistory('2025-06-10T09:00:00.000Z', 350.50, 10, 8)
    },
    {
        id: 'inst-3',
        banco: 'Itaú',
        nomeCompra: 'Passagens Aéreas - Férias',
        valorParcela: 480.00,
        parcelaAtual: 1,
        totalParcelas: 6,
        dataCompra: '2026-01-20T16:45:00.000Z',
        installmentsHistory: generateHistory('2026-01-20T16:45:00.000Z', 480.00, 6, 1)
    },
    {
        id: 'inst-4',
        banco: 'Inter',
        nomeCompra: 'Geladeira Brastemp',
        valorParcela: 299.90,
        parcelaAtual: 11,
        totalParcelas: 12,
        dataCompra: '2025-03-05T11:15:00.000Z',
        installmentsHistory: generateHistory('2025-03-05T11:15:00.000Z', 299.90, 12, 11)
    },
    {
        id: 'inst-5',
        banco: 'Nubank',
        nomeCompra: 'Curso de Inglês (Anual)',
        valorParcela: 199.00,
        parcelaAtual: 5,
        totalParcelas: 12,
        dataCompra: '2025-09-01T10:00:00.000Z',
        installmentsHistory: generateHistory('2025-09-01T10:00:00.000Z', 199.00, 12, 5)
    },
    {
        id: 'inst-6',
        banco: 'Itaú',
        nomeCompra: 'IPVA 2026',
        valorParcela: 600.00,
        parcelaAtual: 2,
        totalParcelas: 5,
        dataCompra: '2026-01-10T08:30:00.000Z',
        installmentsHistory: generateHistory('2026-01-10T08:30:00.000Z', 600.00, 5, 2)
    }
];
