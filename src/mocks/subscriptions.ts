export interface PaymentHistory {
    id: string;
    date: string; // ISO date string
    amount: number;
    status: 'paid' | 'pending' | 'failed';
}

export interface Subscription {
    id: string;
    name: string;
    domain: string;
    amount: number;
    startDate: string; // ISO date string
    category: 'Streaming' | 'Software' | 'Academia' | 'Internet' | 'Outros';
    status: 'active' | 'canceled' | 'paused';
    paymentHistory: PaymentHistory[];
    billingCycle: 'monthly' | 'yearly';
}

export const mockSubscriptions: Subscription[] = [
    {
        id: 'sub-1',
        name: 'Netflix',
        domain: 'netflix.com',
        amount: 39.90,
        startDate: '2023-03-15T00:00:00.000Z',
        category: 'Streaming',
        status: 'active',
        billingCycle: 'monthly',
        paymentHistory: [
            { id: 'ph-1-1', date: '2026-02-15T00:00:00.000Z', amount: 39.90, status: 'paid' },
            { id: 'ph-1-2', date: '2026-01-15T00:00:00.000Z', amount: 39.90, status: 'paid' },
            { id: 'ph-1-3', date: '2025-12-15T00:00:00.000Z', amount: 39.90, status: 'paid' },
        ]
    },
    {
        id: 'sub-2',
        name: 'Spotify',
        domain: 'spotify.com',
        amount: 21.90,
        startDate: '2022-08-10T00:00:00.000Z',
        category: 'Streaming',
        status: 'active',
        billingCycle: 'monthly',
        paymentHistory: [
            { id: 'ph-2-1', date: '2026-02-10T00:00:00.000Z', amount: 21.90, status: 'paid' },
            { id: 'ph-2-2', date: '2026-01-10T00:00:00.000Z', amount: 21.90, status: 'paid' },
            { id: 'ph-2-3', date: '2025-12-10T00:00:00.000Z', amount: 21.90, status: 'paid' },
        ]
    },
    {
        id: 'sub-3',
        name: 'Adobe Creative Cloud',
        domain: 'adobe.com',
        amount: 124.00,
        startDate: '2024-01-05T00:00:00.000Z',
        category: 'Software',
        status: 'active',
        billingCycle: 'monthly',
        paymentHistory: [
            { id: 'ph-3-1', date: '2026-02-05T00:00:00.000Z', amount: 124.00, status: 'paid' },
            { id: 'ph-3-2', date: '2026-01-05T00:00:00.000Z', amount: 124.00, status: 'paid' },
            { id: 'ph-3-3', date: '2025-12-05T00:00:00.000Z', amount: 124.00, status: 'paid' },
        ]
    },
    {
        id: 'sub-4',
        name: 'Smart Fit',
        domain: 'smartfit.com.br',
        amount: 119.90,
        startDate: '2023-11-20T00:00:00.000Z',
        category: 'Academia',
        status: 'active',
        billingCycle: 'monthly',
        paymentHistory: [
            { id: 'ph-4-1', date: '2026-02-20T00:00:00.000Z', amount: 119.90, status: 'paid' },
            { id: 'ph-4-2', date: '2026-01-20T00:00:00.000Z', amount: 119.90, status: 'paid' },
        ]
    },
    {
        id: 'sub-5',
        name: 'Github Copilot',
        domain: 'github.com',
        amount: 50.00, // Approx 10 USD
        startDate: '2025-06-01T00:00:00.000Z',
        category: 'Software',
        status: 'active',
        billingCycle: 'monthly',
        paymentHistory: [
            { id: 'ph-5-1', date: '2026-02-01T00:00:00.000Z', amount: 50.00, status: 'paid' },
            { id: 'ph-5-2', date: '2026-01-01T00:00:00.000Z', amount: 50.00, status: 'paid' },
        ]
    }
];
