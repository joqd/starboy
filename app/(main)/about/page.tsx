"use client"

import { motion } from "motion/react"
import { Link } from "next-view-transitions"
import { Sparkles, Shirt, Scissors } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const VALUES = [
    {
        icon: Sparkles,
        title: "پارچه منتخب",
        description:
            "کار هر لباس از انتخاب پارچه شروع می‌شه؛ پارچه‌ای که از نظر کیفیت، فرم و حس پوشیدن مناسب باشه.",
    },
    {
        icon: Scissors,
        title: "فرم اختصاصی",
        description:
            "لباس‌ها با الگو و اندازه‌های مخصوص خودمون تولید می‌شن تا فرم نهایی، بخشی از هویت هر مدل باشه.",
    },
    {
        icon: Shirt,
        title: "طراحی متفاوت",
        description:
            "بعد از آماده شدن لباس، طرح‌ها با چاپ یا دوخت روی اون اجرا می‌شن؛ درست همون‌جایی که ایده تبدیل به لباس می‌شه.",
    },
]

const TIMELINE = [
    {
        year: "۱۴۰۵",
        title: "شروع استاربوی",
        description:
            "استاربوی با چند ایده، انتخاب پارچه و اولین لباس‌هایی که با اندازه‌های خودمون تولید کردیم شروع شد.",
    },
    {
        year: "امروز",
        title: "در حال ساختن",
        description:
            "هنوز در ابتدای مسیر هستیم؛ مدل‌های جدید می‌سازیم، امتحان می‌کنیم و قدم‌به‌قدم استایل استاربوی رو شکل می‌دیم.",
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
                        لباس‌هایی که از ایده
                        <br />
                        تا تن، متفاوت ساخته می‌شن
                    </motion.h1>

                    <motion.p
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.1 }}
                        className="max-w-lg text-[13px] leading-relaxed text-muted-foreground lg:text-sm"
                    >
                        استاربوی با یک ایده ساده شروع شد: لباس‌هایی بسازیم که از انتخاب پارچه تا طرح
                        نهایی، چیزی بیشتر از یک محصول آماده باشن.
                    </motion.p>

                    <motion.div
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: 0.15 }}
                        className="mt-4 flex w-fit flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-muted/40 px-5 py-3 text-center"
                    >
                        <div>
                            <p className="text-lg font-bold text-foreground">۱۴۰۵</p>
                            <p className="text-[10px] tracking-wide text-muted-foreground">
                                شروع برند
                            </p>
                        </div>

                        <Separator orientation="vertical" className="h-8" />

                        <div>
                            <p className="text-lg font-bold text-foreground">۱۰۰٪</p>
                            <p className="text-[10px] tracking-wide text-muted-foreground">
                                طراحی و تولید داخلی
                            </p>
                        </div>

                        <Separator orientation="vertical" className="h-8" />

                        <div>
                            <p className="text-lg font-bold text-foreground">محدود</p>
                            <p className="text-[10px] tracking-wide text-muted-foreground">
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
                    />

                    <motion.div {...fadeUp} className="flex flex-col justify-center gap-5">
                        <h2 className="text-xl font-bold tracking-tight text-primary uppercase lg:text-2xl">
                            چطور شروع شد
                        </h2>

                        <p className="text-[13px] leading-7 text-muted-foreground lg:text-sm">
                            استاربوی تازه شروع شده، اما از همون اول قرار نبود فقط لباس آماده بخریم و
                            با اسم خودمون بفروشیم. تصمیم گرفتیم مسیر تولید رو خودمون شکل بدیم.
                        </p>

                        <p className="text-[13px] leading-7 text-muted-foreground lg:text-sm">
                            اول پارچه‌ای رو انتخاب می‌کنیم که کیفیت و فرم مناسبی داشته باشه. بعد
                            لباس با الگو و اندازه‌های مخصوص خودمون دوخته می‌شه و در نهایت طرح
                            موردنظر، با چاپ یا دوخت، روی لباس اجرا می‌شه.
                        </p>

                        <p className="text-[13px] leading-7 text-muted-foreground lg:text-sm">
                            نتیجه قرار نیست شبیه چیزی باشه که همه‌جا می‌بینی. هر مدل حاصل چند انتخاب
                            مشخصه؛ از پارچه و فرم لباس تا آخرین جزئیات طراحی.
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
                        چیزی که برای ما مهمه
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
                        از همین‌جا شروع کنیم
                    </h2>

                    <p className="max-w-md text-[12.5px] leading-6 text-muted-foreground">
                        کالکشن فعلی استاربوی رو ببین و اولین انتخابت رو پیدا کن.
                    </p>

                    <Link href="/p">
                        <Button>مشاهده فروشگاه</Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    )
}
