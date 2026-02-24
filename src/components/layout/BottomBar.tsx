import { Home, Wallet, Sparkles, User, Sprout, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate, useLocation } from "react-router-dom"

interface BottomBarItemProps {
    icon: React.ElementType
    label: string
    active?: boolean
    onClick?: () => void
}

const BottomBarItem = ({ icon: Icon, label, active, onClick }: BottomBarItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-1 p-1 transition-all flex-1",
                active
                    ? "text-[#00C980]"
                    : "text-slate-400 hover:text-slate-600"
            )}
        >
            <div className={cn(
                "flex h-8 w-12 items-center justify-center transition-all",
                active ? "bg-green-50 rounded-[14px]" : "bg-transparent"
            )}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={cn("text-[9px] font-medium tracking-tight", active ? "font-bold" : "")}>
                {label}
            </span>
        </button>
    )
}

export function BottomBar() {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        { icon: Home, label: "Início", path: "/dashboard" },
        { icon: Wallet, label: "Extrato", path: "/extract" },
        { icon: Sparkles, label: "Oráculo", path: "/oracle" },
        { icon: Sprout, label: "Jardim", path: "/garden" },
        { icon: Trophy, label: "Ranking", path: "/ranking" },
        { icon: User, label: "Perfil", path: "/profile" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-slate-100 bg-white px-6 pb-2 md:hidden safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {menuItems.map((item) => (
                <BottomBarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                />
            ))}
        </div>
    )
}
