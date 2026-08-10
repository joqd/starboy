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

import { User } from "lucide-react"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { requestLoginOtp, verifyLoginOtp, resendOtp, fetchCurrentUser } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { useCart } from "@/hooks/use-cart"
import UserProfileDialog from "@/components/user/user-menu"

const PHONE_REGEX = /^09\d{9}$/
const OTP_LENGTH = 5
const RESEND_COOLDOWN_SECONDS = 60

type Step = "phone" | "otp"

export function LoginDialog() {
    // ---- session state (shared across the app) --------------------------
    const { user, checkingSession, isLoginOpen, setLoginOpen, completeLogin, logout } = useAuth()

    // ---- dialog / form state --------------------------------------------
    const [step, setStep] = useState<Step>("phone")
    const [phone, setPhone] = useState("")
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    const { resetCart } = useCart()

    // Ticks the resend cooldown down once a second. Depending on the
    // boolean (not the number itself) means we only tear down/recreate the
    // interval when the countdown starts or ends, not on every tick.
    useEffect(() => {
        if (resendCooldown <= 0) return

        const timer = setInterval(() => {
            setResendCooldown((prev) => Math.max(prev - 1, 0))
        }, 1000)

        return () => clearInterval(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resendCooldown > 0])

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
            setResendCooldown(RESEND_COOLDOWN_SECONDS)
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "خطایی رخ داد. دوباره تلاش کنید.")
        } finally {
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        if (resendCooldown > 0 || resending) return

        setError("")
        setResending(true)
        try {
            await resendOtp(phone)
            setCode("")
            setResendCooldown(RESEND_COOLDOWN_SECONDS)
            toast.add({
                type: "success",
                description: "کد تایید مجدداً ارسال شد",
            })
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "خطایی رخ داد. دوباره تلاش کنید.")
        } finally {
            setResending(false)
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

            resetCart()
            setStep("phone")
            setPhone("")
            setCode("")

            toast.add({
                type: "success",
                description: "ورود با موفقیت انجام شد",
            })

            // Sets the user, closes the dialog, and runs whatever action
            // (e.g. checkout) was waiting on login — in that order.
            completeLogin(currentUser)
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
        setResendCooldown(0)
    }

    // NOTE: we deliberately do NOT reset step/phone/code here. If the user
    // accidentally dismisses the dialog while on the OTP step, reopening it
    // (e.g. via the login button, or by triggering the checkout guard)
    // should resume right where they left off.
    const handleOpenChange = (value: boolean) => {
        setLoginOpen(value)
        if (value) setError("")
    }

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            toast.add({
                type: "success",
                description: "از حساب خود خارج شدید",
            })
        }
    }

    const { changeName, changeAvatar } = useUser()

    // ---- authenticated: avatar + menu -----------------------------------
    if (!checkingSession && user) {
        return (
            <UserProfileDialog
                user={user}
                onNameChange={changeName}
                onAvatarChange={changeAvatar}
                onLogout={handleLogout}
            />
        )
    }

    // ---- unauthenticated / still checking: login button + dialog --------
    return (
        <Dialog open={isLoginOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button variant="ghost" size="icon" disabled={checkingSession}>
                        <User className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                }
            />

            <DialogContent dir="rtl" className="sm:max-w-sm">
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

                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <span>کد را دریافت نکردید؟</span>

                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendCooldown > 0 || resending || loading}
                                className="inline-flex items-center gap-1 font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-70"
                            >
                                {resending ? (
                                    "در حال ارسال..."
                                ) : (
                                    <>
                                        <span>ارسال مجدد کد</span>

                                        {/* عرض ثابت + tabular-nums تا با تغییر رقم
                                            (مثلاً ۴۵ به ۹) هیچ‌چیزی جابجا نشه */}
                                        {resendCooldown > 0 && (
                                            <span
                                                dir="ltr"
                                                className="font-inter inline-block w-9 text-center tabular-nums"
                                            >
                                                ({resendCooldown})
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>

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
