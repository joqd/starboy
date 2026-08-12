import Link from "next/link"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Store footer — intentionally simple: brand line, a couple of link groups,
// and a copyright row. No newsletter form, no payment badges, no social
// icon grid — keeps it quiet so it doesn't compete with the shop content
// above it. Matches the same rounded / muted-foreground / border-border
// language used throughout the mobile home page.
// ---------------------------------------------------------------------------

const LINK_GROUPS = [
    {
        title: "فروشگاه",
        links: [
            { label: "همه محصولات", href: "/shop" },
            { label: "وبلاگ", href: "/blog" },
        ],
    },
    {
        title: "راهنما",
        links: [
            { label: "درباره ما", href: "/about" },
            { label: "تماس با ما", href: "/contact" },
            { label: "سیاست‌ ها", href: "/terms" },
        ],
    },
]

interface FooterProps {
    className?: string
}

export default function Footer({ className = "" }: FooterProps) {
    const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())

    return (
        <footer className={cn("border-t border-border bg-card px-4 py-8 mt-10", className)}>
            <div className="mb-6">
                <p className="text-sm font-bold text-foreground">استاربوی</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    استایل خودت رو با ما بساز.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {LINK_GROUPS.map((group) => (
                    <div key={group.title}>
                        <p className="text-xs font-semibold text-foreground">{group.title}</p>
                        <ul role="list" className="mt-3 space-y-2">
                            {group.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-xs text-muted-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-8 border-t border-border pt-4">
                <p className="text-[11px] text-muted-foreground">تمامی حقوق محفوظ است © {year}</p>
            </div>
        </footer>
    )
}
