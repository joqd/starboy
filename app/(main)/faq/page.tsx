"use client"

import { useState } from "react"
import { Link } from "next-view-transitions"
import { motion } from "motion/react"
import { ChevronDown, CreditCard, Package, Ruler, RotateCcw, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Content — edit here, layout below stays untouched.
// ---------------------------------------------------------------------------
const CATEGORIES = [
    {
        id: "order",
        title: "سفارش و پرداخت",
        icon: CreditCard,
        items: [
            {
                q: "چطور سفارش بدم؟",
                a: "محصول رو انتخاب کن، سایز و تعداد رو مشخص کن و بزن «افزودن به سبد خرید». بعد از تسویه‌حساب، پیامک تأیید سفارش برات ارسال می‌شه.",
            },
            {
                q: "چه روش‌های پرداختی رو پشتیبانی می‌کنید؟",
                a: "پرداخت آنلاین از طریق درگاه بانکی معتبره. پرداخت در محل فعلاً فقط برای برخی شهرها فعاله که موقع ثبت سفارش نمایش داده می‌شه.",
            },
            {
                q: "میشه بعد از ثبت، سفارش رو لغو یا ویرایش کنم؟",
                a: "تا قبل از خروج از انبار، امکان لغو یا تغییر سفارش هست. کافیه هر چه زودتر از طریق تماس با ما اطلاع بدی.",
            },
        ],
    },
    {
        id: "sizing",
        title: "سایزبندی",
        icon: Ruler,
        items: [
            {
                q: "چطور سایز مناسب خودم رو پیدا کنم؟",
                a: "زیر هر محصول، جدول سایز اختصاصی همون مدل رو داری. اندازه‌ها بر اساس دور سینه و قد لباس هستن، نه سایز لباس‌های دیگه‌ی خودت.",
            },
            {
                q: "سایزها بین مدل‌های مختلف یکسانن؟",
                a: "نه لزوماً — چون بعضی مدل‌ها فیت آزادتر (oversize) و بعضی فیت معمولی دارن. همیشه جدول سایز همون محصول رو چک کن.",
            },
        ],
    },
    {
        id: "shipping",
        title: "ارسال",
        icon: Package,
        items: [
            {
                q: "ارسال سفارش چقدر طول می‌کشه؟",
                a: "معمولاً ۱ تا ۴ روز کاری بسته به شهر مقصد. جزئیات کامل زمان‌بندی و هزینه‌ها رو در صفحه‌ی ارسال و مرجوعی می‌تونی ببینی.",
            },
            {
                q: "ارسال به همه‌ی شهرها انجام می‌شه؟",
                a: "بله، به سراسر کشور ارسال داریم. برای شهرهای دورافتاده ممکنه زمان تحویل کمی بیشتر بشه.",
            },
        ],
    },
    {
        id: "returns",
        title: "مرجوعی و تعویض",
        icon: RotateCcw,
        items: [
            {
                q: "چند روز برای مرجوعی کالا وقت دارم؟",
                a: "از تاریخ تحویل، ۷ روز فرصت داری تا درخواست مرجوعی یا تعویض بدی، به‌شرط اینکه کالا استفاده یا شسته نشده باشه.",
            },
            {
                q: "هزینه‌ی مرجوعی با کیه؟",
                a: "اگه دلیل مرجوعی مشکل از طرف ماست (نقص کالا، ارسال اشتباه)، هزینه‌ی برگشت با ماست. در غیر این‌صورت هزینه‌ی ارسال برعهده‌ی مشتریه.",
            },
        ],
    },
]

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 }

function AccordionItem({
    q,
    a,
    isOpen,
    onToggle,
}: {
    q: string
    a: string
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <div className="border-b border-border/60 last:border-b-0">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-4 text-right text-[13px] font-medium text-foreground"
            >
                {q}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <p className="pb-4 text-[12.5px] leading-6 text-muted-foreground">{a}</p>
                </div>
            </div>
        </div>
    )
}

export default function FaqPage() {
    // "category:index" so opening a question in one category never affects
    // another — and only one question per category is open at a time.
    const [openKey, setOpenKey] = useState<string | null>(null)

    return (
        <div dir="rtl" className="relative w-full bg-background text-foreground">
            <section className="border-b border-border/60 pt-28 pb-14 lg:pt-40 lg:pb-20">
                <div className="mx-auto flex max-w-295 flex-col gap-4 px-4 sm:px-6 xl:px-10">
                    <span className="w-fit rounded-full border border-border/70 bg-muted/70 px-2.5 py-0.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                        راهنما
                    </span>
                    <h1 className="text-[30px] leading-[1.05] font-bold tracking-tight text-primary uppercase lg:text-[42px]">
                        سوالات متداول
                    </h1>
                    <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                        هر چیزی که لازمه قبل و بعد از خرید بدونی، اینجا جمع کردیم.
                    </p>
                </div>
            </section>

            <section className="py-14 lg:py-20">
                <div className="mx-auto flex max-w-295 flex-col gap-12 px-4 sm:px-6 lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-16 xl:px-10">
                    {/* Category nav — desktop only, mirrors the ids below */}
                    <nav className="hidden flex-col gap-1 lg:sticky lg:top-24 lg:flex">
                        {CATEGORIES.map((cat) => (
                            <a
                                key={cat.id}
                                href={`#${cat.id}`}
                                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                            >
                                <cat.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                                {cat.title}
                            </a>
                        ))}
                    </nav>

                    <div className="flex flex-col gap-10">
                        {CATEGORIES.map((cat, ci) => (
                            <motion.div
                                key={cat.id}
                                id={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ ...springTransition, delay: ci * 0.04 }}
                                className="scroll-mt-24"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <cat.icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                                    <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                                        {cat.title}
                                    </h2>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-muted/20 px-4">
                                    {cat.items.map((item, i) => {
                                        const key = `${cat.id}:${i}`
                                        return (
                                            <AccordionItem
                                                key={key}
                                                q={item.q}
                                                a={item.a}
                                                isOpen={openKey === key}
                                                onToggle={() =>
                                                    setOpenKey((prev) =>
                                                        prev === key ? null : key
                                                    )
                                                }
                                            />
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-border/60 py-14 lg:py-20">
                <div className="mx-auto flex max-w-295 flex-col items-center gap-4 px-4 text-center sm:px-6 xl:px-10">
                    <MessageCircle className="h-5 w-5 text-primary" strokeWidth={1.8} />
                    <h2 className="text-lg font-bold tracking-tight text-primary uppercase">
                        پاسخ سوالت رو پیدا نکردی؟
                    </h2>
                    <p className="max-w-sm text-[12.5px] leading-6 text-muted-foreground">
                        تیم پشتیبانی استاربوی همیشه در دسترسه.
                    </p>
                    <Link
                        href="/contact"
                        className="mt-1 flex items-center justify-center rounded-lg border bg-primary px-6 py-2.5 text-[13px] font-bold text-primary-foreground transition active:scale-[0.98]"
                    >
                        ارتباط با ما
                    </Link>
                </div>
            </section>
        </div>
    )
}
