import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <main dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-4xl font-bold">۴۰۴</h1>
            <h2 className="text-2xl font-semibold">صفحه پیدا نشد</h2>
            <p className="text-muted-foreground">
                صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
            </p>

            <Link href="/">
                <Button>
					صفحه اصلی
				</Button>
            </Link>
        </main>
    )
}
