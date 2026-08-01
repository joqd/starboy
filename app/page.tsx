import ScrollVelocityGallery from "@/components/scroll-velocity-gallery"
import { getLatestProducts } from "@/lib/api/product"

export default async function Home() {
    const latestProducts = await getLatestProducts()
	console.log(latestProducts)

    return (
        <main dir="rtl">
            <ScrollVelocityGallery items={latestProducts.results} className="z-50" />
        </main>
    )
}
