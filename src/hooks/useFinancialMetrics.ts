import { useMemo } from 'react';
import { Transaction, Category } from '../types/finance';

export const useFinancialMetrics = (
    transactions: Transaction[],
    categories: Category[],
    currentBalance: number
) => {
    const realBalance = useMemo(() => {

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const pendingFixedExpenses = transactions.filter(txn => {
            const txnDate = new Date(txn.due_date);


            const category = categories.find(c => c.id === txn.category_id);
            const isFixed = category?.budget_type === 'fixed';

            return (
                txn.type === 'expense' &&
                txn.status === 'pending' &&
                isFixed &&
                txnDate.getMonth() === currentMonth &&
                txnDate.getFullYear() === currentYear
            );
        });

        const blockedAmount = pendingFixedExpenses.reduce((acc, txn) => acc + Number(txn.amount), 0);

        return currentBalance - blockedAmount;
    }, [transactions, categories, currentBalance]);

    return {
        realBalance
    };
};
