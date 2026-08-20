"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { LoginDialog } from "@/components/user/login-dialog"
import { Menu, Rss, Store, X, House } from "lucide-react"
import Cart from "@/components/cart/cart"
import StarboyLogo from "../common/starboy-logo"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Separator } from "../ui/separator"

function BlogButton() {
    return (
        <Link href="/blog" aria-label="مجله">
            <Rss className="w-[1.1rem]" />
        </Link>
    )
}

function HomeButton() {
    return (
        <Link href="/" aria-label="خانه">
            <House className="w-[1.1rem]" />
        </Link>
    )
}

// ---------------------------------------------------------------------------
// Top header
// ---------------------------------------------------------------------------
function Logo() {
    return (
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
            <StarboyLogo className="w-35 h-auto" />
        </Link>
    )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname()
    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href)

    return (
        <Link
            href={href}
            className={cn(
                "transition-colors",
                isActive ? "text-foreground" : "text-foreground/50 hover:text-foreground/80"
            )}
        >
            {children}
        </Link>
    )
}

function MenuRow({
    label,
    href,
    icon: Icon,
    onNavigate,
}: {
    label: string
    href: string
    icon: typeof Store
    onNavigate: () => void
}) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-2 py-4 text-sm font-medium text-foreground sm:px-4"
        >
            <Icon className="size-[1.1rem] text-foreground" />
            {label}
        </Link>
    )
}

function TopHeader({ shopSection }: { shopSection: boolean }) {
    const [open, setOpen] = useState(false)

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-9999 border-b border-border/60 bg-background/80 backdrop-blur-xl",
                shopSection && "lg:hidden"
            )}
        >
            <div
                dir="ltr"
                className="mx-auto flex h-16 max-w-295 items-center justify-between px-4 sm:px-6 xl:px-10"
            >
                <Logo />

                {/* Desktop actions */}
                <div dir="rtl" className="hidden items-center gap-1 lg:flex">
                    <div className="flex space-x-10">
                        <NavLink href="/p">فروشگاه</NavLink>
                        <NavLink href="/blog">مجله</NavLink>
                        <NavLink href="/contact">ارتباط با ما</NavLink>
                    </div>
                </div>

                <div dir="rtl" className="hidden items-center gap-1 lg:flex">
                    <LoginDialog />

                    <Separator orientation="vertical" className={"m-1"} />

                    <div className="flex">
                        <Cart />
                        <ModeToggle />
                    </div>
                </div>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "بستن منو" : "باز کردن منو"}
                    aria-expanded={open}
                    className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent lg:hidden"
                >
                    {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            <div
                className={cn(
                    "grid border-t border-border/60 transition-all duration-300 ease-in-out lg:hidden",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-t-0 opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <nav dir="rtl" className="flex flex-col divide-y divide-border/60 px-4">
                        <MenuRow
                            label="فروشگاه"
                            href="/p"
                            icon={Store}
                            onNavigate={() => setOpen(false)}
                        />
                        <MenuRow
                            label="مجله"
                            href="/blog"
                            icon={Rss}
                            onNavigate={() => setOpen(false)}
                        />

                        <div className="flex items-center justify-between border-t border-border/60 py-4">
                            <div onClickCapture={() => setOpen(false)}>
                                <LoginDialog />
                            </div>
                            <div className="flex items-center">
                                <ModeToggle />
                                <div onClickCapture={() => setOpen(false)}>
                                    <Cart />
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

// ---------------------------------------------------------------------------
// Legacy bottom-right floating dock — kept as-is, desktop-only, and now
// scoped to /p and its sub-routes only.
// ---------------------------------------------------------------------------
function DesktopMenuIcon({ children }: { children: React.ReactNode }) {
    return <div className="flex size-9 shrink-0 items-center justify-center">{children}</div>
}

function ShopFloatingDock() {
    return (
        <div
            dir="ltr"
            className="fixed right-6 bottom-6 z-9999 hidden items-center gap-1.5 rounded-xl bg-accent px-2 py-2 lg:flex"
        >
            <DesktopMenuIcon>
                <Cart />
            </DesktopMenuIcon>
            <DesktopMenuIcon>
                <BlogButton />
            </DesktopMenuIcon>
            <DesktopMenuIcon>
                <HomeButton />
            </DesktopMenuIcon>
            <DesktopMenuIcon>
                <ModeToggle />
            </DesktopMenuIcon>
            <DesktopMenuIcon>
                <LoginDialog />
            </DesktopMenuIcon>
        </div>
    )
}

// ---------------------------------------------------------------------------
export default function FloatingMenu() {
    const pathname = usePathname()
    const shopSection = pathname === "/p" // || pathname?.startsWith("/p/")

    return (
        <div>
            <TopHeader shopSection={shopSection} />
            {shopSection && <ShopFloatingDock />}
        </div>
    )
}
