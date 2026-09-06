"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    // Bell,
    // Heart,
    // MapPin,
    Camera,
    ChevronLeft,
    LogOut,
    Package,
    User as UserIcon,
} from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Extensible: add more rows here later (payment history, addresses, ...) —
// each one is just another { href, label, icon } entry.
const ACCOUNT_LINKS = [
    { href: "/orders", label: "سفارش‌های من", icon: Package },
    // { href: "/addresses", label: "آدرس‌های من", icon: MapPin },
    // { href: "/transactions", label: "تاریخچه پرداخت‌ها", icon: MapPin },
    // { href: "/favorites", label: "علاقه‌مندی‌ها", icon: Heart },
    // { href: "/notifications", label: "اعلان‌ها", icon: Bell },
]

export default function ProfilePage() {
    const { user, checkingSession, setUser, logout } = useAuth()
    const { changeName, changeAvatar, isUpdating } = useUser()
    const router = useRouter()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [nameDialogOpen, setNameDialogOpen] = useState(false)
    const [nameInput, setNameInput] = useState("")
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    // Not logged in (and we're done checking) — this page has nothing to
    // show, send them home.
    useEffect(() => {
        if (!checkingSession && !user) {
            router.replace("/")
        }
    }, [checkingSession, user, router])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (user) setNameInput(user.full_name)
    }, [user])

    // Clean up the local object URL used for the instant avatar preview.
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview)
        }
    }, [avatarPreview])

    if (checkingSession || !user) {
        return (
            <div className="mx-auto max-w-md px-4 pt-24 pb-16">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="size-24 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        )
    }

    const avatarSrc = avatarPreview ?? user.avatar

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Show it immediately, don't make the user wait on the network to
        // see feedback that something happened.
        setAvatarPreview(URL.createObjectURL(file))

        const updated = await changeAvatar(file)
        if (updated) setUser(updated)

        e.target.value = ""
    }

    async function handleSaveName() {
        const trimmed = nameInput.trim()
        if (!trimmed || trimmed === user?.full_name) {
            setNameDialogOpen(false)
            return
        }

        const updated = await changeName(trimmed)
        if (updated) setUser(updated)
        setNameDialogOpen(false)
    }

    async function handleLogout() {
        await logout()
        router.push("/")
    }

    return (
        <div dir="rtl" className="mx-auto max-w-md px-4 pt-24 pb-16">
            {/* Avatar + name + phone */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                    <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-accent">
                        {avatarSrc ? (
                            <Image
                                src={avatarSrc}
                                alt=""
                                fill
                                unoptimized={Boolean(avatarPreview)}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <UserIcon className="size-10 text-foreground/40" />
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="تغییر عکس پروفایل"
                        disabled={isUpdating}
                        className="absolute -bottom-1 -left-1 flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
                    >
                        <Camera className="size-4" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setNameDialogOpen(true)}
                    className="mx-auto inline-block cursor-pointer text-lg font-semibold text-foreground outline-none"
                >
                    {user.full_name || "بدون نام"}
                </button>

                <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
                    <DialogContent dir="rtl" className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>ویرایش نام</DialogTitle>
                            <DialogDescription>
                                نام نمایشی حساب کاربری‌ت رو تغییر بده.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-2 py-2">
                            <Label htmlFor="full-name">نام و نام خانوادگی</Label>
                            <Input
                                id="full-name"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="نام خود را وارد کنید"
                            />
                        </div>

                        <DialogFooter dir="ltr">
                            <Button variant="ghost" onClick={() => setNameDialogOpen(false)}>
                                انصراف
                            </Button>
                            <Button onClick={handleSaveName} disabled={isUpdating}>
                                {isUpdating ? "در حال ذخیره..." : "ذخیره"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <p dir="ltr" className="text-sm text-foreground/50">
                    {user.phone}
                </p>
            </div>

            {/* Extensible account links — add new sections to ACCOUNT_LINKS above */}
            <nav className="mt-8 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
                {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        <Icon className="size-[1.1rem] text-foreground/60" />
                        <span className="flex-1">{label}</span>
                        <ChevronLeft className="size-4 text-foreground/30" />
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <Button
                variant="outline"
                onClick={handleLogout}
                className="mt-6 w-full gap-2 text-destructive hover:text-destructive"
            >
                <LogOut className="size-4" />
                خروج از حساب
            </Button>
        </div>
    )
}
