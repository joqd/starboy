"use client"

import { PackageCheck } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

interface StockToggleProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
}

// "In stock only" filter — plain shadcn Toggle so it shares the exact same
// primitive, sizing, and pressed-state styling as any other Toggle in the
// app, right next to the Select-based filters.
export function StockToggle({ checked, onCheckedChange }: StockToggleProps) {
    return (
        <Toggle
            aria-label="نمایش فقط کالاهای موجود"
            size="sm"
            variant="outline"
            pressed={checked}
            onPressedChange={onCheckedChange}
        >
            <PackageCheck className="group-aria-pressed/toggle:fill-foreground" />
            فقط کالای موجود
        </Toggle>
    )
}
