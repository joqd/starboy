import { HeroImage } from "@/components/layout/hero-image"
import ScrollVelocityGallery from "@/components/product/scroll-velocity-gallery"
import MobileProductSlider from "@/components/product/mobile-product-slider"
import { getLatestProducts } from "@/lib/api/product"

export default async function Home() {
    const latestProducts = await getLatestProducts()

    return (
        <main dir="rtl">
            <ScrollVelocityGallery
                items={latestProducts.results}
                className="z-50 hidden lg:block"
            />
            <MobileProductSlider items={latestProducts.results} className="lg:hidden" />

            <div className="absolute bottom-0 left-0 hidden xl:block">
                <HeroImage />
            </div>
        </main>
    )
}
