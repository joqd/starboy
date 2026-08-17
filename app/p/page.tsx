import { HeroImage } from "@/components/layout/hero-image"
import ScrollVelocityGallery from "@/components/product/scroll-velocity-gallery"
import MobileProducts from "@/components/product/mobile-products"
import { getLatestProducts, getFeaturedProducts } from "@/lib/api/product"
import { getLatestPosts } from "@/lib/api/post"
import { getCollections } from "@/lib/api/collection"

export default async function Products() {
    const [latestProducts, featuredProducts, , collections] = await Promise.all([
        getLatestProducts(),
        getFeaturedProducts(),
        getLatestPosts(),
        getCollections(),
    ])

    return (
        <main dir="rtl" className="relative">
            <div>
                <ScrollVelocityGallery
                    items={latestProducts.results}
                    className="z-50 hidden overflow-hidden lg:block"
                />
            </div>
            <div className="absolute bottom-0 left-0 hidden xl:block">
                <HeroImage />
            </div>

            {/*
              featuredProducts and collections were already being fetched
              here (just unused before) — now they power the mobile gallery
              spotlight and the collection chip nav. Assumes getFeaturedProducts
              and getCollections both return a `.results` array like
              getLatestProducts does; adjust if their shape differs.
            */}
            <MobileProducts
                products={latestProducts.results}
                featured={featuredProducts.results}
                collections={collections.results}
                className="lg:hidden mt-8"
            />
        </main>
    )
}
