"use client"

import { motion } from "motion/react"
import { Link } from "next-view-transitions"
import { Sparkles, Users, Shirt } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------------------
// Content — edit here, layout below stays untouched.
// ---------------------------------------------------------------------------
const VALUES = [
    {
        icon: Sparkles,
        title: "مواد درجه‌یک",
        description:
            "هر پارچه قبل از تولید تست می‌شه؛ چیزی که رو تنت میره باید هم خوب بدوزه هم سال‌ها دوام بیاره.",
    },
    {
        icon: Shirt,
        title: "تیراژ محدود",
        description:
            "هر مدل در تعداد مشخص و محدود تولید می‌شه. وقتی تموم شد، تموم شد؛ دیگه تکرار نمی‌کنیم.",
    },
    {
        icon: Users,
        title: "ساخته‌شده با جامعه",
        description:
            "ایده‌ی خیلی از مدل‌ها از پیام‌های همون آدم‌هایی اومده که استاربوی می‌پوشن. اینجا یه طرفه نیست.",
    },
]

const TIMELINE = [
    {
        year: "۱۴۰۵",
        title: "شروع از اتاق خودم",
        description: "اولین سری تیشرت‌ها بسته‌بندی شدن و مستقیم به دست مشتری رسیدن.",
    },
    {
        year: "حالا",
        title: "ببینیم چی میشه 😭😂",
        // description: "استاربوی از یه پروژه‌ی جانبی به یه برند با هویت مشخص و تیم کوچیک تبدیل شد.",
    },
]

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
}

export default function AboutPage() {
    return (
        <div dir="rtl" className="relative w-full bg-background text-foreground">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border/60 pt-28 pb-20 lg:pt-40 lg:pb-28">
                <div className="relative mx-auto flex max-w-295 flex-col gap-5 px-4 sm:px-6 xl:px-10">
                    <motion.span
                        {...fadeUp}
                        className="w-fit rounded-full border border-border/70 bg-muted/70 px-2.5 py-0.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase"
                    >
                        داستان استاربوی
                    </motion.span>

                    <motion.h1
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.05 }}
                        className="max-w-3xl text-[34px] leading-[1.05] font-bold tracking-tight text-primary uppercase lg:text-[56px]"
                    >
                        از یک اتاق کوچیک، تا لباسی که می‌پوشی
                    </motion.h1>

                    <motion.p
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.1 }}
                        className="max-w-lg text-[13px] leading-relaxed text-muted-foreground lg:text-sm"
                    >
                        استاربوی از یه سوال ساده شروع شد: چرا لباس روزمره باید بی‌روح باشه؟ حالا چند
                        ساله که هر تکه رو با همون سوال طراحی می‌کنیم.
                    </motion.p>

                    <motion.div
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.15 }}
                        className="mt-4 flex w-fit flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-muted/40 px-5 py-3 text-center"
                    >
                        <div>
                            <p className="text-lg font-bold text-foreground">۱۳۹۷</p>
                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                سال تأسیس
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div>
                            <p className="text-lg font-bold text-foreground">۱۰۰٪</p>
                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                طراحی و تولید داخلی
                            </p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div>
                            <p className="text-lg font-bold text-foreground">محدود</p>
                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                تیراژ هر مدل
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Story */}
            <section className="border-b border-border/60 py-16 lg:py-24">
                <div className="mx-auto grid max-w-295 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 xl:px-10">
                    <motion.div
                        {...fadeUp}
                        className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-border/60 bg-muted"
                    ></motion.div>

                    <motion.div {...fadeUp} className="flex flex-col justify-center gap-5">
                        <h2 className="text-xl font-bold tracking-tight text-primary uppercase lg:text-2xl">
                            چطور شروع شد
                        </h2>
                        <p className="text-[13px] leading-7 text-muted-foreground lg:text-sm">
                            همه‌چیز از یک اتاق ۱۲ متری شروع شد؛ چند تا طرح، یه چاپخونه‌ی محلی و یه
                            صفحه‌ی اینستاگرام. بین بازار پر از لباس‌های تکراری، دنبال یه چیز دیگه
                            بودیم — چیزی که حس یه شهر بزرگ رو داشته باشه، نه یه کاتالوگ.
                        </p>
                        <p className="text-[13px] leading-7 text-muted-foreground lg:text-sm">
                            هنوز هم همون فلسفه رو داریم: کیفیت رو فدای سرعت نمی‌کنیم. هر مدل قبل از
                            تولید انبوه، چند بار نمونه‌سازی و امتحان می‌شه تا مطمئن بشیم واقعاً ارزش
                            پوشیدن داره.
                        </p>
                        <p className="text-[13px] leading-7 text-muted-foreground lg:text-sm">
                            امروز استاربوی دیگه فقط یه برند لباس نیست؛ جایی‌ست که آدم‌هایی با
                            سلیقه‌ی مشابه دور هم جمع شدن.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="border-b border-border/60 py-16 lg:py-24">
                <div className="mx-auto max-w-295 px-4 sm:px-6 xl:px-10">
                    <motion.h2
                        {...fadeUp}
                        className="mb-10 text-xl font-bold tracking-tight text-primary uppercase lg:text-2xl"
                    >
                        چیزهایی که بهشون پایبندیم
                    </motion.h2>

                    <div className="grid gap-5 sm:grid-cols-3">
                        {VALUES.map((value, i) => (
                            <motion.div
                                key={value.title}
                                {...fadeUp}
                                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-6"
                            >
                                <value.icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
                                <h3 className="text-sm font-bold text-foreground">{value.title}</h3>
                                <p className="text-[12.5px] leading-6 text-muted-foreground">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="border-b border-border/60 py-16 lg:py-24">
                <div className="mx-auto max-w-295 px-4 sm:px-6 xl:px-10">
                    <motion.h2
                        {...fadeUp}
                        className="mb-10 text-xl font-bold tracking-tight text-primary uppercase lg:text-2xl"
                    >
                        مسیر تا امروز
                    </motion.h2>

                    <div className="relative flex flex-col gap-8 border-r border-border/60 pr-6 sm:pr-8">
                        {TIMELINE.map((step, i) => (
                            <motion.div
                                key={step.year}
                                {...fadeUp}
                                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                                className="relative"
                            >
                                <span className="absolute top-1 -right-7.75 h-2.5 w-2.5 rounded-full bg-primary sm:-right-[35px]" />
                                <p className="text-xs font-bold tracking-wide text-primary">
                                    {step.year}
                                </p>
                                <h3 className="mt-1 text-sm font-bold text-foreground">
                                    {step.title}
                                </h3>
                                <p className="mt-1.5 max-w-lg text-[12.5px] leading-6 text-muted-foreground">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-24">
                <motion.div
                    {...fadeUp}
                    className="mx-auto flex max-w-295 flex-col items-center gap-4 px-4 text-center sm:px-6 xl:px-10"
                >
                    <h2 className="text-xl font-bold tracking-tight text-primary uppercase lg:text-2xl">
                        بخشی از این مسیر باش
                    </h2>
                    <p className="max-w-md text-[12.5px] leading-6 text-muted-foreground">
                        آخرین کالکشن رو ببین — قبل از این‌که تیراژش تموم بشه.
                    </p>
                    <Link
                        href="/p"
                        className="mt-2 flex items-center justify-center rounded-lg border bg-primary px-6 py-2.5 text-[13px] font-bold text-primary-foreground transition active:scale-[0.98]"
                    >
                        مشاهده‌ی فروشگاه
                    </Link>
                </motion.div>
            </section>
        </div>
    )
}
