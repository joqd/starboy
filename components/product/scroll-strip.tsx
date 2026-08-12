import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Same native scroll-snap strip used on the mobile home page (see
// mobile-home.tsx's local ScrollStrip). Pulled out here so the blog's
// related-products UI doesn't duplicate it — mobile-home.tsx can switch to
// importing this one too next time it's touched, instead of keeping its
// own copy.
// ---------------------------------------------------------------------------
export function ScrollStrip({
    children,
    className = "",
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <ul
            role="list"
            className={cn(
                "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1",
                "scroll-px-4 overscroll-x-contain",
                "scrollbar-none [&::-webkit-scrollbar]:hidden",
                className
            )}
        >
            {children}
        </ul>
    )
}
