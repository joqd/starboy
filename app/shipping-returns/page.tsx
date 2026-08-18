"use client"

import { Link } from "next-view-transitions"
import { motion } from "motion/react"
import {
    ClipboardCheck,
    PackageCheck,
    Truck,
    Home,
    RotateCcw,
    Wallet,
    ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Content — edit here, layout below stays untouched. Prices/times are
// placeholders; swap them for your real shipping policy.
// ---------------------------------------------------------------------------
const SHIPPING_STEPS = [
    { icon: ClipboardCheck, title: "ثبت و تأیید سفارش", time: "همون روز" },
    { icon: PackageCheck, title: "بسته‌بندی در انبار", time: "کمتر از ۲۴ ساعت" },
    { icon: Truck, title: "تحویل به پیک/پست", time: "۱ روز کاری" },
    { icon: Home, title: "تحویل درب منزل", time: "۱ تا ۳ روز کاری" },
]

const DELIVERY_RATES = [
    { zone: "تهران (اکسپرس)", time: "۱ تا ۲ روز کاری", cost: "۴۵٬۰۰۰ تومان" },
    { zone: "کلان‌شهرها", time: "۲ تا ۳ روز کاری", cost: "۶۰٬۰۰۰ تومان" },
    { zone: "سایر شهرها", time: "۳ تا ۵ روز کاری", cost: "۷۵٬۰۰۰ تومان" },
]

const FREE_SHIPPING_THRESHOLD = "۲٬۰۰۰٬۰۰۰ تومان"

const RETURN_CONDITIONS = [
    "حداکثر تا ۷ روز بعد از تحویل، امکان درخواست مرجوعی یا تعویض هست.",
    "کالا نباید پوشیده، شسته یا تغییر داده شده باشه.",
    "اتیکت و بسته‌بندی اصلی باید سالم و همراه کالا باشه.",
    "کالاهای حراج‌شده فقط قابل تعویض هستن، نه مرجوعی وجه.",
]

const RETURN_STEPS = [
    "از طریق صفحه‌ی «ارتباط با ما» یا تماس با پشتیبانی، درخواست مرجوعی رو ثبت کن.",
    "کالا رو در بسته‌بندی اصلی، همراه با فاکتور، تحویل پیک یا پست بده.",
    "بعد از بررسی کالا در انبار (۱ تا ۲ روز کاری)، نتیجه برات پیامک می‌شه.",
    "وجه ظرف ۵ تا ۷ روز کاری به همون روش پرداخت اولیه برمی‌گرده.",
]

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 }
const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: springTransition,
}

export default function ShippingReturnsPage() {
    return (
        <div dir="rtl" className="relative w-full bg-background text-foreground">
            <section className="border-b border-border/60 pt-28 pb-14 lg:pt-40 lg:pb-20">
                <div className="mx-auto flex max-w-295 flex-col gap-4 px-4 sm:px-6 xl:px-10">
                    <span className="w-fit rounded-full border border-border/70 bg-muted/70 px-2.5 py-0.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                        راهنمای خرید
                    </span>
                    <h1 className="text-[30px] leading-[1.05] font-bold tracking-tight text-primary uppercase lg:text-[42px]">
                        ارسال و مرجوعی
                    </h1>
                    <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                        از لحظه‌ای که سفارش می‌دی تا وقتی بسته دستته — و اگه لازم شد، مسیر برگشتش.
                    </p>
                </div>
            </section>

            {/* Process */}
            <section className="border-b border-border/60 py-14 lg:py-20">
                <div className="mx-auto max-w-295 px-4 sm:px-6 xl:px-10">
                    <motion.h2
                        {...fadeUp}
                        className="mb-8 text-sm font-bold tracking-tight text-foreground uppercase"
                    >
                        روند ارسال سفارش
                    </motion.h2>

                    <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {SHIPPING_STEPS.map((step, i) => (
                            <motion.div
                                key={step.title}
                                {...fadeUp}
                                transition={{ ...springTransition, delay: i * 0.06 }}
                                className="relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <step.icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
                                    <span className="font-inter text-[11px] font-bold text-muted-foreground">
                                        {String(i + 1).padStart(2, "۰")}
                                    </span>
                                </div>
                                <h3 className="text-[13px] font-bold text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                                    {step.time}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Delivery rates */}
            <section className="border-b border-border/60 py-14 lg:py-20">
                <div className="mx-auto max-w-295 px-4 sm:px-6 xl:px-10">
                    <motion.div
                        {...fadeUp}
                        className="mb-8 flex flex-wrap items-end justify-between gap-3"
                    >
                        <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                            زمان و هزینه‌ی ارسال
                        </h2>
                        <p className="text-[11.5px] text-muted-foreground">
                            ارسال رایگان برای سفارش‌های بالای{" "}
                            <span className="font-bold text-foreground">
                                {FREE_SHIPPING_THRESHOLD}
                            </span>
                        </p>
                    </motion.div>

                    <motion.div
                        {...fadeUp}
                        className="overflow-hidden rounded-2xl border border-border/60"
                    >
                        <div className="grid grid-cols-3 border-b border-border/60 bg-muted/40 px-5 py-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            <span>منطقه</span>
                            <span className="text-center">زمان تحویل</span>
                            <span className="text-left">هزینه</span>
                        </div>
                        {DELIVERY_RATES.map((rate, i) => (
                            <div
                                key={rate.zone}
                                className={cn(
                                    "grid grid-cols-3 items-center px-5 py-3.5 text-[12.5px]",
                                    i !== DELIVERY_RATES.length - 1 && "border-b border-border/60"
                                )}
                            >
                                <span className="font-medium text-foreground">{rate.zone}</span>
                                <span className="text-center text-muted-foreground">
                                    {rate.time}
                                </span>
                                <span className="text-left text-muted-foreground">
                                    {rate.cost}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Returns */}
            <section className="border-b border-border/60 py-14 lg:py-20">
                <div className="mx-auto grid max-w-295 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 xl:px-10">
                    <motion.div {...fadeUp}>
                        <div className="mb-5 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.8} />
                            <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                                شرایط مرجوعی
                            </h2>
                        </div>
                        <ul className="flex flex-col gap-3">
                            {RETURN_CONDITIONS.map((condition) => (
                                <li
                                    key={condition}
                                    className="flex items-start gap-2.5 text-[12.5px] leading-6 text-muted-foreground"
                                >
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                    {condition}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div {...fadeUp}>
                        <div className="mb-5 flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-primary" strokeWidth={1.8} />
                            <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                                مراحل درخواست مرجوعی
                            </h2>
                        </div>
                        <ol className="flex flex-col gap-4">
                            {RETURN_STEPS.map((step, i) => (
                                <li key={step} className="flex items-start gap-3">
                                    <span className="font-inter flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                        {i + 1}
                                    </span>
                                    <p className="text-[12.5px] leading-6 text-muted-foreground">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-14 lg:py-20">
                <motion.div
                    {...fadeUp}
                    className="mx-auto flex max-w-295 flex-col items-center gap-4 px-4 text-center sm:px-6 xl:px-10"
                >
                    <Wallet className="h-5 w-5 text-primary" strokeWidth={1.8} />
                    <h2 className="text-lg font-bold tracking-tight text-primary uppercase">
                        سوال دیگه‌ای مونده؟
                    </h2>
                    <p className="max-w-sm text-[12.5px] leading-6 text-muted-foreground">
                        سوالات پرتکرار درباره‌ی خرید و ارسال رو یک‌جا جمع کردیم.
                    </p>
                    <Link
                        href="/faq"
                        className="mt-1 flex items-center justify-center rounded-lg border bg-primary px-6 py-2.5 text-[13px] font-bold text-primary-foreground transition active:scale-[0.98]"
                    >
                        سوالات متداول
                    </Link>
                </motion.div>
            </section>
        </div>
    )
}
