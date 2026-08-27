import MobileHome from "@/components/layout/mobile-home"
import DesktopHome from "@/components/layout/desktop-home"
import { getLatestProducts, getFeaturedProducts } from "@/lib/api/product"
import { getLatestPosts } from "@/lib/api/post"
import { getCollections } from "@/lib/api/collection"

export const revalidate = 300

export default async function Home() {
    const [latestProducts, featuredProducts, latestPosts, collections] = await Promise.all([
        getLatestProducts(),
        getFeaturedProducts(),
        getLatestPosts(),
        getCollections(),
    ])

    return (
        <main dir="rtl" className="relative w-full">
            <DesktopHome
                featuredProducts={featuredProducts.results.slice(0, 4)}
                recentProducts={latestProducts.results.slice(0, 4)}
                recentPosts={latestPosts.results.slice(0, 5)}
                collections={collections.results}
                className="hidden lg:block"
            />

            <MobileHome
                featuredProducts={featuredProducts.results.slice(0, 4)}
                recentProducts={latestProducts.results.slice(0, 4)}
                recentPosts={latestPosts.results.slice(0, 5)}
                collections={collections.results}
                className="lg:hidden"
            />
        </main>
    )
}
