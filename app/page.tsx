import { HeroImage } from "@/components/layout/hero-image"
import ScrollVelocityGallery from "@/components/product/scroll-velocity-gallery"
import MobileHome from "@/components/layout/mobile-home"
import { getLatestProducts, getFeaturedProducts } from "@/lib/api/product"
import { getLatestPosts } from "@/lib/api/post"
import { getCollections } from "@/lib/api/collection"

export const dynamic = "force-dynamic"

export default async function Home() {
    const [latestProducts, featuredProducts, latestPosts, collections] = await Promise.all([
        getLatestProducts(),
        getFeaturedProducts(),
        getLatestPosts(),
        getCollections(),
    ])

    return (
        // h-screen + overflow-hidden only apply from lg up, where the
        // animated gallery renders and needs a locked, full-screen canvas.
        // Below lg, MobileHome is a normal scrollable editorial page — it's
        // several sections tall by design, so the page needs to scroll.
        //
        // w-full, not w-screen: 100vw doesn't subtract the vertical
        // scrollbar's width, so on any page tall enough to scroll (which
        // MobileHome always is), w-screen made <main> a few pixels wider
        // than the visible viewport — that's what was causing the whole
        // page to scroll horizontally on mobile. w-full (100% of the
        // already-correctly-sized body) doesn't have that problem.
        <main dir="rtl" className="relative w-full lg:h-screen lg:overflow-hidden">
            <ScrollVelocityGallery
                items={latestProducts.results}
                className="z-50 hidden lg:block"
            />
            <MobileHome
				featuredProducts={featuredProducts.results.slice(0, 4)}
                recentProducts={latestProducts.results.slice(0, 4)}
                recentPosts={latestPosts.results.slice(0, 5)}
                collections={collections.results}
                className="lg:hidden"
            />
            <div className="absolute bottom-0 left-0 hidden xl:block">
                <HeroImage />
            </div>
        </main>
    )
}
