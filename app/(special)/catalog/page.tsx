import { getLatestProducts } from "@/lib/api/product"
import ScrollVelocityGallery from "@/components/product/scroll-velocity-gallery"

export const revalidate = 300

export default async function Home() {
    const [latestProducts] = await Promise.all([getLatestProducts()])

    return (
        <main dir="rtl" className="relative w-full">
            <ScrollVelocityGallery items={latestProducts.results} />
        </main>
    )
}
