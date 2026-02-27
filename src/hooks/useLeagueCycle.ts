import { useState, useEffect } from 'react';

export function useLeagueCycle() {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        // We want a fixed 5-day cycle.
        // We use January 1, 2024, 00:00:00 UTC as our base epoch.
        const baseDate = new Date('2024-01-01T00:00:00Z').getTime();
        const cycleDuration = 5 * 24 * 60 * 60 * 1000; // 5 days in ms

        const calculateTimeLeft = () => {
            const now = Date.now();
            const elapsed = now - baseDate;
            const currentCyclePosition = elapsed % cycleDuration;
            const remainingMs = cycleDuration - currentCyclePosition;

            const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

            return `${days}d ${hours}h ${minutes}m`;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every 30 seconds
        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    return { timeLeft };
}
