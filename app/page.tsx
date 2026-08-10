import { HeroImage } from "@/components/layout/hero-image"
import ScrollVelocityGallery from "@/components/product/scroll-velocity-gallery"
import MobileHome from "@/components/product/mobile-home"
import { getLatestProducts } from "@/lib/api/product"

export const dynamic = "force-dynamic"

export default async function Home() {
    const latestProducts = await getLatestProducts()

    return (
        // h-screen + overflow-hidden only apply from lg up, where the
        // animated gallery renders and needs a locked, full-screen canvas.
        // Below lg, MobileHome is a normal scrollable editorial page — it's
        // several sections tall by design, so the page needs to scroll.
        <main dir="rtl" className="relative w-screen lg:h-screen lg:overflow-hidden">
            <ScrollVelocityGallery
                items={latestProducts.results}
                className="z-50 hidden lg:block"
            />
            <MobileHome recentProducts={latestProducts.results} className="lg:hidden" />
            <div className="absolute bottom-0 left-0 hidden xl:block">
                <HeroImage />
            </div>
        </main>
    )
}
