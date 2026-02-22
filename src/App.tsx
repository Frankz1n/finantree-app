import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Extract from './pages/Extract'
import Profile from './pages/Profile'
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
            <div className="flex h-screen items-center justify-center bg-black text-emerald-500 font-mono">
                <p className="animate-pulse">_carregando_sistema...</p>
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
