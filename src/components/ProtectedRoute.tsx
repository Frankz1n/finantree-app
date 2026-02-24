import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();


    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-emerald-50/50 dark:bg-emerald-950/20">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
        );
    }


    if (!user) {
        return <Navigate to="/login" replace />;
    }


    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};
