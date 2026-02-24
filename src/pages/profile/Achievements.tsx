import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Badges } from "@/components/gamification/Badges"
export default function Achievements() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Conquistas</h1>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm">
                <Badges />
            </div>
        </div>
    )
}
