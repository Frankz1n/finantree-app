import { Home, Wallet, Sparkles, Sprout, Trophy, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    active?: boolean
    onClick?: () => void
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                    ? "bg-green-50 text-[#00C980]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {label}
        </button>
    )
}

export function Sidebar() {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        await signOut()
        navigate("/login")
    }

    const menuItems = [
        { icon: Home, label: "Início", path: "/dashboard" },
        { icon: Wallet, label: "Extrato", path: "/extract" },
        { icon: Sparkles, label: "Oráculo", path: "/oracle" },
        { icon: Sprout, label: "Jardim", path: "/garden" },
        { icon: Trophy, label: "Ranking", path: "/ranking" },
        { icon: User, label: "Perfil", path: "/profile" },
    ]

    return (
        <aside className="hidden fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-slate-100 bg-white px-6 py-8 md:flex">
            {/* Logo */}
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                    <Sprout size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Finantree</span>
            </div>

            { }
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </nav>

            { }
            <div className="mt-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-[#F5F3FF] p-5">
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-[#EBE5FF] blur-xl" />
                    <h4 className="relative mb-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                        DICA PRO
                    </h4>
                    <p className="relative text-xs font-medium text-[#7C3AED]/80 leading-relaxed">
                        Falar com o Oráculo diariamente aumenta sua economia em 15%!
                    </p>
                </div>
            </div>

            { }
            <div className="border-t border-slate-100 pt-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-colors"
                >
                    <LogOut size={20} />
                    Sair
                </button>
            </div>
        </aside>
    )
}
