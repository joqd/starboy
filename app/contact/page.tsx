import { Clock, Mail, Rss, MapPin, MessageCircle, Phone, Send } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "ارتباط با ما",
    description: "راه‌های تماس با تیم پشتیبانی و شبکه‌های اجتماعی ما",
}

const CONTACT_INFO = [
    {
        icon: Phone,
        label: "تلفن پشتیبانی",
        value: "۰۲۱-۱۲۳۴۵۶۷۸",
        href: "tel:+982112345678",
    },
    {
        icon: MessageCircle,
        label: "واتساپ",
        value: "۰۹۱۲-۳۴۵۶۷۸۹",
        href: "https://wa.me/989123456789",
    },
    {
        icon: Mail,
        label: "ایمیل",
        value: "support@starboy.com",
        href: "mailto:support@starboy.com",
    },
    {
        icon: MapPin,
        label: "آدرس",
        value: "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۳",
        href: "https://maps.google.com/?q=تهران خیابان ولیعصر",
    },
    {
        icon: Clock,
        label: "ساعات پاسخگویی",
        value: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر",
        href: null,
    },
]

const SOCIAL_LINKS = [
    {
        icon: Rss,
        label: "اینستاگرام",
        handle: "@starboy",
        href: "https://instagram.com/starboy",
    },
    {
        icon: Send,
        label: "تلگرام",
        handle: "@starboy",
        href: "https://t.me/starboy",
    },
    {
        icon: MessageCircle,
        label: "واتساپ",
        handle: "چت مستقیم",
        href: "https://wa.me/989123456789",
    },
]

export default function ContactPage() {
    return (
        <main dir="rtl" className="min-h-screen pt-16">
            <div className="mx-auto max-w-295 px-4 py-14 sm:px-6 sm:py-20 xl:px-10">
                {/* Heading */}
                <div className="mb-12 max-w-xl sm:mb-16">
                    <span className="text-xs font-medium text-muted-foreground">ارتباط با ما</span>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        هر سوالی دارید، همین‌جا در دسترسیم
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                        تیم پشتیبانی استاربوی هر روز هفته پاسخگوی شماست. از راه‌های زیر با ما تماس
                        بگیرید یا در شبکه‌های اجتماعی دنبال‌مان کنید.
                    </p>
                </div>

                {/* Contact info */}
                <div className="grid gap-3 sm:grid-cols-2">
                    {CONTACT_INFO.map((item) => {
                        const Icon = item.icon
                        const content = (
                            <>
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent">
                                    <Icon className="size-[1.15rem] text-foreground" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {item.label}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {item.value}
                                    </span>
                                </div>
                            </>
                        )

                        return item.href ? (
                            <Link
                                key={item.label}
                                href={item.href}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel={
                                    item.href.startsWith("http") ? "noopener noreferrer" : undefined
                                }
                                className="flex items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-accent"
                            >
                                {content}
                            </Link>
                        ) : (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 rounded-xl border border-border/60 p-4"
                            >
                                {content}
                            </div>
                        )
                    })}
                </div>

                {/* Social links */}
                <div className="mt-14 sm:mt-20">
                    <h2 className="text-lg font-bold text-foreground">شبکه‌های اجتماعی</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        تازه‌ترین محصولات و اخبار را اینجا دنبال کنید.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {SOCIAL_LINKS.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-xl bg-accent px-4 py-4 transition-colors hover:bg-accent/70"
                                >
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                                        <Icon className="size-[1.15rem] text-foreground" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-foreground">
                                            {item.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {item.handle}
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </main>
    )
}
