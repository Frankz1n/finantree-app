import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-emerald-500 font-mono">
                <p className="animate-pulse">_autenticando_acesso...</p>
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
