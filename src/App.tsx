import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Extract from './pages/Extract'
import Profile from './pages/Profile'
import AccountDetails from './pages/profile/AccountDetails'
import Security from './pages/profile/Security'
import MyPlan from './pages/profile/MyPlan'
import BillingHistory from './pages/profile/BillingHistory'
import Achievements from './pages/profile/Achievements'
import Invites from './pages/profile/Invites'
import Garden from './pages/Garden'
import GoalDetails from './pages/GoalDetails'
import Ranking from './pages/Ranking'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'
import { SharingService } from './services/sharing'
import { GamificationService } from './services/gamification'
import { ConsentModal } from './components/modals/ConsentModal'

function App() {
    const { user, loading, streak } = useAuth()
    const [inviteData, setInviteData] = useState<any>(null)

    useEffect(() => {
        const checkInvites = async () => {
            if (user?.email) {

                const invites = await SharingService.checkInvites(user.email)
                if (invites && invites.length > 0) {

                    setInviteData(invites[0])
                }
            }
        }

        if (user) {
            checkInvites()
            GamificationService.checkAchievements(user.id, streak)
        }
    }, [user, streak])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-emerald-500">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                        <img src="/icon.svg" alt="Finantree Logo" className="h-10 w-10 object-contain" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/extract" element={<Extract />} />
                    <Route path="/garden" element={<Garden />} />
                    <Route path="/jardim/:id" element={<GoalDetails />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/account" element={<AccountDetails />} />
                    <Route path="/profile/security" element={<Security />} />
                    <Route path="/profile/plan" element={<MyPlan />} />
                    <Route path="/profile/billing" element={<BillingHistory />} />
                    <Route path="/profile/achievements" element={<Achievements />} />
                    <Route path="/profile/invites" element={<Invites />} />
                </Route>

                <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            </Routes>
            <Toaster />

            { }
            {inviteData && (
                <ConsentModal
                    isOpen={!!inviteData}
                    onClose={() => setInviteData(null)}
                    inviteId={inviteData.id}
                    inviterName={inviteData.profiles?.full_name || 'Alguém'}
                    onAction={() => setInviteData(null)}
                />
            )}
        </Router>
    )
}

export default App
