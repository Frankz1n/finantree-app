import { Sidebar } from "./Sidebar"
import { BottomBar } from "./BottomBar"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <BottomBar />
            <main className="min-h-screen p-4 pb-24 md:ml-64 md:p-8 lg:p-12">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
