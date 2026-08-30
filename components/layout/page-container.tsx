import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// PageContainer — the single source of truth for page width + top spacing.
// Every top-level page's <main> should render through this instead of
// hand-writing "mx-auto max-w-295 px-5 pt-16 sm:px-8 xl:px-10" itself.
//
// Why this exists: the blog page and the products page had each grown their
// own slightly different version of these classes (different breakpoints,
// padding applied on <main> in one and on inner <section>s in the other),
// so the two pages ended up with visibly different widths. Centralizing it
// here means every page — current and future — stays in sync by
// construction, not by remembering to copy the right string.
//
// Bottom padding is deliberately NOT baked in here, since that already
// varies by page on purpose (e.g. blog's pb-24 vs products' pb-16) — pass
// it via `className`, it'll override the default via cn()/tailwind-merge.
// ---------------------------------------------------------------------------

const DEFAULT_BOTTOM_PADDING = "pb-16"

interface PageContainerProps {
    children: ReactNode
    className?: string
    /** Override the root element if a page needs something other than <main>
     *  (e.g. a page that already renders its own <main> elsewhere). */
    as?: "main" | "div"
}

export function PageContainer({ children, className, as = "main" }: PageContainerProps) {
    const Tag = as
    return (
        <Tag
            dir="rtl"
            className={cn(
                "mx-auto max-w-295 px-5 pt-16 sm:px-8 xl:px-10",
                DEFAULT_BOTTOM_PADDING,
                className
            )}
        >
            {children}
        </Tag>
    )
}
