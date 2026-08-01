import { HeroImage } from "@/components/hero-image"
import ScrollVelocityGallery from "@/components/scroll-velocity-gallery"
import { getLatestProducts } from "@/lib/api/product"

export default async function Home() {
    const latestProducts = await getLatestProducts()

    return (
        <main dir="rtl">
            <ScrollVelocityGallery items={latestProducts.results} className="z-50" />
            <div className="absolute bottom-0 left-0 hidden xl:block">
                <HeroImage />
            </div>
        </main>
    )
}
