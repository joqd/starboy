import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowIcon, InstagramIcon, TelegramIcon } from "./home-icons"

// ---------------------------------------------------------------------------
// Footer — shared by both mobile-home.tsx and desktop-home.tsx (single
// component, responsive via Tailwind breakpoints rather than two separate
// files, since a footer's structure doesn't really change shape the way
// the hero/product sections did — it just goes from stacked to a
// four-column row). Kept in the same quiet, brand-first voice as the rest
// of the redesign: the manifesto line reappears here instead of a generic
// tagline, and the link columns are short and plain-spoken.
//
// The newsletter form below is presentational only — wire its `action` /
// onSubmit to whatever the project uses for email capture.
// ---------------------------------------------------------------------------

const shopLinks = [
    { label: "همه محصولات", href: "/shop" },
    { label: "کالکشن‌ها", href: "/collections" },
    { label: "جدیدترین‌ها", href: "/shop?sort=new" },
]

const brandLinks = [
    { label: "داستان ما", href: "/about" },
    { label: "مجله", href: "/blog" },
    { label: "تماس با ما", href: "/contact" },
]

const helpLinks = [
    { label: "سوالات متداول", href: "/faq" },
    { label: "ارسال و مرجوعی", href: "/shipping-returns" },
    { label: "حریم خصوصی", href: "/privacy" },
]

export default function Footer({ className = "" }: { className?: string }) {
    return (
        <footer className={cn("border-t border-border bg-muted/30", className)}>
            <div className="mx-auto max-w-295 px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    <FooterColumn title="فروشگاه" links={shopLinks} />
                    <FooterColumn title="برند" links={brandLinks} />
                    <FooterColumn title="راهنما" links={helpLinks} />
                </div>

                {/* Bottom bar */}
                <div className="mt-14 flex flex-col-reverse items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} استاربوی. تمام حقوق محفوظ است.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link
                            href="/privacy"
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            حریم خصوصی
                        </Link>
                        <Link
                            href="/terms"
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            قوانین و مقررات
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterColumn({
    title,
    links,
}: {
    title: string
    links: { label: string; href: string }[]
}) {
    return (
        <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {title}
            </p>
            <ul role="list" className="mt-4 space-y-3">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm text-foreground/90 transition-colors hover:text-muted-foreground"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
