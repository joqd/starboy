"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, UserPen } from "lucide-react"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import {
    fetchCurrentUser,
    logout as logoutRequest,
    requestLoginOtp,
    verifyLoginOtp,
} from "@/lib/api/auth"
import type { User as UserType } from "@/types/user"
import { ApiError } from "@/lib/api/client"

const PHONE_REGEX = /^09\d{9}$/
const OTP_LENGTH = 5

type Step = "phone" | "otp"

export function LoginDialog() {
    // ---- session state -------------------------------------------------
    const [user, setUser] = useState<UserType | null>(null)
    const [checkingSession, setCheckingSession] = useState(true)

    // ---- dialog / form state --------------------------------------------
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<Step>("phone")
    const [phone, setPhone] = useState("")
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Check for an existing session (sessionid cookie) once on mount.
    useEffect(() => {
        let cancelled = false

        fetchCurrentUser()
            .then((currentUser) => {
                if (!cancelled) setUser(currentUser)
            })
            .catch(() => {
                if (!cancelled) setUser(null)
            })
            .finally(() => {
                if (!cancelled) setCheckingSession(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const validatePhone = () => {
        if (!PHONE_REGEX.test(phone)) {
            setError("شماره موبایل وارد شده صحیح نیست.")
            return false
        }
        return true
    }

    const requestCode = async () => {
        setError("")
        if (!validatePhone()) return

        setLoading(true)
        try {
            await requestLoginOtp(phone)
            setStep("otp")
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "خطایی رخ داد. دوباره تلاش کنید.")
        } finally {
            setLoading(false)
        }
    }

    const verifyCode = async () => {
        setError("")

        if (code.length !== OTP_LENGTH) {
            setError(`کد تایید باید ${OTP_LENGTH} رقم باشد.`)
            return
        }

        setLoading(true)
        try {
            await verifyLoginOtp(phone, code)
            const currentUser = await fetchCurrentUser()

            setUser(currentUser)
            setOpen(false)
            setStep("phone")
            setPhone("")
            setCode("")

            toast.add({
                type: "success",
                description: "ورود با موفقیت انجام شد",
            })
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "کد وارد شده صحیح نیست.")
        } finally {
            setLoading(false)
        }
    }

    // Lets the user go back and fix a mistyped phone number without losing
    // the fact that they were mid-verification.
    const editPhone = () => {
        setStep("otp" === step ? "phone" : step)
        setCode("")
        setError("")
    }

    // NOTE: we deliberately do NOT reset step/phone/code here. If the user
    // accidentally dismisses the dialog while on the OTP step, reopening it
    // (e.g. via the login button) should resume right where they left off.
    const handleOpenChange = (value: boolean) => {
        setOpen(value)
        if (value) setError("")
    }

    const handleLogout = async () => {
        try {
            await logoutRequest()
        } catch {
            // Even if the request fails (e.g. session already expired
            // server-side), there's nothing meaningful to do locally except
            // drop the client-side user state below.
        } finally {
            setUser(null)
            toast.add({
                type: "success",
                description: "از حساب خود خارج شدید",
            })
        }
    }

    // ---- authenticated: avatar + menu -----------------------------------
    if (!checkingSession && user) {
        const initials = (user.full_name?.trim() || user.phone).slice(0, 2)

        return (
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button variant="outline" size="icon" >
                            <Avatar className="h-[1.8rem] w-[1.8rem]">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    }
                />

                <DropdownMenuContent className={"w-48"} dir="rtl" align="end">
                    <DropdownMenuItem className={"cursor-pointer"} disabled>
                        <UserPen className="ml-2 h-4 w-4" />
                        ویرایش اطلاعات
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className={"cursor-pointer"} onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />
                        خروج از حساب
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // ---- unauthenticated / still checking: login button + dialog --------
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button variant="outline" size="icon" disabled={checkingSession}>
                        <User className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                }
            />

            <DialogContent dir="rtl" className="sm:max-w-sm ">
                {step === "phone" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">ورود به حساب</DialogTitle>

                            <DialogDescription>
                                برای ورود یا ثبت نام، شماره موبایل خود را وارد کنید
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <Label htmlFor="phone">شماره موبایل</Label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    dir="ltr"
                                    autoFocus
                                    className="font-inter"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && requestCode()}
                                    placeholder="09123456789"
                                />
                            </Field>
                        </FieldGroup>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <DialogFooter>
                            <Button
                                className="w-full font-bold"
                                onClick={requestCode}
                                disabled={loading}
                            >
                                {loading ? "در حال ارسال..." : "دریافت کد تایید"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                وارد کردن کد تایید
                            </DialogTitle>

                            <DialogDescription>
                                کد ارسال شده به شماره{" "}
                                <span className="font-inter font-semibold">{phone}</span> را وارد
                                کنید
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup>
                            <Field>
                                <Label htmlFor="code">کد تایید</Label>

                                <Input
                                    id="code"
                                    type="tel"
                                    dir="ltr"
                                    autoFocus
                                    maxLength={OTP_LENGTH}
                                    value={code}
                                    className="font-inter"
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                    onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                                    placeholder="12345"
                                />
                            </Field>
                        </FieldGroup>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <DialogFooter className="flex-col gap-2 sm:flex-col">
                            <Button
                                className="w-full font-bold"
                                onClick={verifyCode}
                                disabled={loading}
                            >
                                {loading ? "در حال بررسی..." : "تایید و ورود"}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full font-normal"
                                onClick={editPhone}
                                disabled={loading}
                            >
                                ویرایش شماره موبایل
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
