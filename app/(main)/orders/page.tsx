import { PageContainer } from "@/components/layout/page-container"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
    return (
        <PageContainer>
            <main dir="rtl" className="min-h-screen">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowRight className="size-3.5" />
                        بازگشت به فروشگاه
                    </Link>

                    <div className="mt-4 mb-12 max-w-xl sm:mb-16">
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            لیست سفارشات
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                            در این صفحه لیست همه سفارشات ثبت شده قرار گرفته.
                        </p>
                    </div>
                </div>
            </main>
        </PageContainer>
    )
}
