// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
// import { useState, useEffect } from "react"
// import { TransactionService } from "@/services/transactions"

export interface FilterState {
    categoryIds: string[]
    startDate?: string
    endDate?: string
    status?: 'all' | 'pending' | 'completed'
}

interface FilterSheetProps {
    onApplyFilters: (filters: FilterState) => void
    initialFilters: FilterState
}

export function FilterSheet({ onApplyFilters, initialFilters }: FilterSheetProps) {
    // Trick to avoid typescript unused warnings on props since we mocked the UI
    console.log("Mocked FilterSheet component loaded", !!onApplyFilters, !!initialFilters);

    return (
        <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900">
            <Filter size={18} />
        </Button>
    )
}
