"use client"

import { useState } from "react"
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

export function LoginDialog() {
    const [step, setStep] = useState<"phone" | "otp">("phone")
    const [phone, setPhone] = useState("")
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const validatePhone = () => {
        const regex = /^09\d{9}$/

        if (!regex.test(phone)) {
            setError("شماره موبایل وارد شده صحیح نیست.")
            return false
        }

        return true
    }

    const requestCode = async () => {
        setError("")

        if (!validatePhone()) {
            return
        }

        setLoading(true)

        try {
            // TODO: replace with your endpoint
            await fetch("http://127.0.0.1:8000/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    phone,
                }),
            })

            setStep("otp")
        } catch {
            setError("خطایی رخ داد. دوباره تلاش کنید.")
        } finally {
            setLoading(false)
        }
    }

    const verifyCode = async () => {
        setError("")

        if (code.length !== 5) {
            setError("کد تایید باید ۵ رقم باشد.")
            return
        }

        setLoading(true)

        try {
            // TODO: replace with your endpoint
            await fetch("/api/auth/verify-code", {
                method: "POST",
                body: JSON.stringify({
                    phone,
                    code,
                }),
            })

            setOpen(false)
            setStep("phone")
            setCode("")
        } catch {
            setError("کد وارد شده صحیح نیست.")
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setStep("phone")
        setCode("")
        setError("")
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value)

                if (!value) {
                    reset()
                }
            }}
        >
            <DialogTrigger
                render={
                    <Button variant="outline" size="icon">
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
                                    className="font-inter"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
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
                                    maxLength={6}
                                    value={code}
                                    className="font-inter"
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="12345"
                                />
                            </Field>
                        </FieldGroup>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <DialogFooter>
                            <Button
                                className="w-full font-bold"
                                onClick={verifyCode}
                                disabled={loading}
                            >
                                {loading ? "در حال بررسی..." : "تایید و ورود"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
