"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { PaymentResultStatus } from "@/components/orders/payment-result"

// This route only ever receives status=error today — it's where the backend
// sends the user when it couldn't even create a payment attempt, so there's
// no order token to link to yet.
export default function OrderResultPage() {
    return (
        <PageContainer>
            <main dir="rtl" className="min-h-screen">
                <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
                    <PaymentResultStatus kind="error" />

                    <Link href="/orders">
                        <Button>
                            <ArrowRight className="size-4" />
                            بازگشت به لیست سفارش‌ها
                        </Button>
                    </Link>
                </div>
            </main>
        </PageContainer>
    )
}
