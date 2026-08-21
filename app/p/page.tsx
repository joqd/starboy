import { HeroImage } from "@/components/layout/hero-image"
import { ScrollVelocityGalleryWrapper } from "@/components/product/scroll-velocity-gallery-wrapper"
import MobileProducts from "@/components/product/mobile-products"
import { getLatestProducts, getFeaturedProducts } from "@/lib/api/product"
import { getLatestPosts } from "@/lib/api/post"
import { getCollections } from "@/lib/api/collection"
import DesktopProducts from "@/components/product/desktop-products"

export default async function Products() {
    const [latestProducts, featuredProducts, , collections] = await Promise.all([
        getLatestProducts(),
        getFeaturedProducts(),
        getLatestPosts(),
        getCollections(),
    ])

    return (
        <main dir="rtl" className="relative">
            <DesktopProducts products={latestProducts.results} className="hidden lg:block" />

            <MobileProducts
                products={latestProducts.results}
                featured={featuredProducts.results}
                collections={collections.results}
                className="mt-8 lg:hidden"
            />
        </main>
    )
}
