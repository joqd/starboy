import { Link } from "next-view-transitions"
import { cn } from "@/lib/utils"
import { getFooterBadges } from "@/lib/api/site"
import type { FooterBadge } from "@/types/site"

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
//
// Footer badges (e.g. Enamad trust seal) are fetched from the backend
// (`/core/footer-badges/`) rather than hardcoded, so new badges can be
// added/removed without a deploy. Each badge ships its own `html` string,
// sorted and rendered by `priority`.
// ---------------------------------------------------------------------------

const shopLinks = [{ label: "همه محصولات", href: "/p" }]

const brandLinks = [
    { label: "مجله", href: "/blog" },
    { label: "داستان ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
]

const helpLinks = [
    { label: "سوالات متداول", href: "/faq" },
    { label: "ارسال و مرجوعی", href: "/shipping-returns" },
]

export default async function Footer({ className = "" }: { className?: string }) {
    const badges = await getFooterBadges().catch(() => [] as FooterBadge[])
    const sortedBadges = [...badges].sort((a, b) => a.priority - b.priority)

    return (
        <footer dir="rtl" className={cn("border-t border-border bg-muted/30 pb-10", className)}>
            <div className="mx-auto max-w-295 px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    <FooterColumn title="فروشگاه" links={shopLinks} />
                    <FooterColumn title="استاربوی" links={brandLinks} />
                    <FooterColumn title="راهنما" links={helpLinks} />
                </div>

                {/* Bottom bar */}
                <div className="mt-14 flex flex-col-reverse items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        © <span className="font-inter font-bold">{new Date().getFullYear()}</span>{" "}
                        استاربوی. تمام حقوق محفوظ است.
                    </p>
                    {sortedBadges.length > 0 && (
                        <div className="flex items-center gap-5">
                            {sortedBadges.map((badge) => (
                                <FooterBadgeItem key={badge.id} badge={badge} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    )
}

function FooterBadgeItem({ badge }: { badge: FooterBadge }) {
    const darkHtml = badge.html_2 ?? badge.html

    return (
        <div className="shrink-0 [&_img]:h-25 [&_img]:w-17.5 [&_img]:cursor-pointer [&_img]:object-contain">
            {/* Light mode variant */}
            <div
                className="block dark:hidden"
                title={badge.title}
                dangerouslySetInnerHTML={{ __html: badge.html }}
            />
            {/* Dark mode variant — falls back to `html` when `html_2` isn't set */}
            <div
                className="hidden dark:block"
                title={badge.title}
                dangerouslySetInnerHTML={{ __html: darkHtml }}
            />
        </div>
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
            <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
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
