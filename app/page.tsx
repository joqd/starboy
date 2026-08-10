import { HeroImage } from "@/components/layout/hero-image"
import ScrollVelocityGallery from "@/components/product/scroll-velocity-gallery"
// import MobileProductSlider from "@/components/product/mobile-product-slider"
import { getLatestProducts } from "@/lib/api/product"

export const dynamic = "force-dynamic"

export default async function Home() {
    const latestProducts = await getLatestProducts()

    return (
        <main dir="rtl" className="relative h-screen w-screen overflow-hidden">
            <ScrollVelocityGallery items={latestProducts.results} className="z-50" />
            {/* <MobileProductSlider items={latestProducts.results} className="lg:hidden" /> */}
            <div className="absolute bottom-0 left-0 hidden xl:block">
                <HeroImage />
            </div>
        </main>
    )
}
