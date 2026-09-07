"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { LoginDialog } from "@/components/user/login-dialog"
import { Menu, Rss, Store, X, User, Package, LogOut, CircleUserRound } from "lucide-react"
import Cart from "@/components/cart/cart"
import StarboyLogo from "../common/starboy-logo"
import { useTransitionRouter } from "next-view-transitions"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Link } from "next-view-transitions"
import { Separator } from "../ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// NOTE: adjust this import path to wherever AuthProvider/useAuth actually lives in the project.
import { useAuth } from "@/hooks/use-auth"

function Logo() {
    return (
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
            <StarboyLogo className="h-auto w-35" />
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

// ---------------------------------------------------------------------------
// Profile control: skeleton while checking session, a plain login button
// when signed out, and a dropdown with account actions when signed in.
// No asChild anywhere — the trigger renders its own default button, and
// dropdown items navigate via router.push instead of wrapping a <Link>.
// ---------------------------------------------------------------------------
function ProfileMenu() {
    const { user, checkingSession, openLogin, logout } = useAuth()
    const router = useTransitionRouter()

    if (checkingSession) {
        return <div aria-hidden className="size-9 animate-pulse rounded-full bg-accent" />
    }

    if (!user) {
        return (
            <button
                type="button"
                onClick={() => openLogin()}
                aria-label="ورود"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
            >
                <User className="size-[1.1rem]" />
            </button>
        )
    }

    // Real User fields: id, phone, full_name, avatar.
    const initial = user.full_name?.trim()?.[0]?.toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="حساب کاربری"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors outline-none hover:bg-accent"
            >
                {user.avatar ? (
                    <Image
                        src={user.avatar}
                        alt=""
                        width={28}
                        height={28}
                        className="size-8 rounded-full object-cover"
                    />
                ) : initial ? (
                    <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-medium">
                        {initial}
                    </span>
                ) : (
                    <CircleUserRound className="size-[1.1rem]" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent dir="rtl" align="end" className="z-10000 mt-4 w-48">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal text-foreground/60">
                        {user.full_name || user.phone}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => router.push("/profile")}
                    >
                        <CircleUserRound className="size-4" />
                        پروفایل من
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => router.push("/orders")}
                    >
                        <Package className="size-4" />
                        سفارش‌های من
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        onClick={() => logout()}
                    >
                        <LogOut className="size-4" />
                        خروج از حساب
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ---------------------------------------------------------------------------
export default function SiteMenu() {
    const [open, setOpen] = useState(false)

    return (
        <header className="fixed inset-x-0 top-0 z-9999 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div
                dir="ltr"
                className="mx-auto flex h-16 max-w-295 items-center justify-between px-4 sm:px-6 xl:px-10"
            >
                <Logo />

                {/* Desktop nav */}
                <div dir="rtl" className="hidden items-center gap-1 lg:flex">
                    <div className="flex space-x-10">
                        <NavLink href="/">خانه</NavLink>
                        <NavLink href="/p">فروشگاه</NavLink>
                        <NavLink href="/blog">مجله</NavLink>
                    </div>
                </div>

                {/* Desktop actions */}
                <div dir="rtl" className="hidden items-center gap-1 lg:flex">
                    <ProfileMenu />

                    <Separator orientation="vertical" className={"m-1"} />

                    <div className="flex">
                        <Cart />
                        <ModeToggle />
                    </div>
                </div>

                {/* Mobile: cart stays outside the hamburger menu, always visible */}
                <div className="flex items-center gap-1 lg:hidden">
                    <Cart />

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? "بستن منو" : "باز کردن منو"}
                        aria-expanded={open}
                        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
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
                            <ProfileMenu />
                            <ModeToggle />
                        </div>
                    </nav>
                </div>
            </div>

            {/*
              LoginDialog ships with its own built-in trigger icon. We already
              have our own trigger in ProfileMenu (openLogin()), so we hide
              LoginDialog's default trigger here with display:none — the
              dialog itself still opens correctly because it's controlled by
              isLoginOpen/setLoginOpen from useAuth(), not by this trigger.
            */}
            <div className="hidden">
                <LoginDialog />
            </div>
        </header>
    )
}
