import ProductsExplorer from "@/components/product/products-explorer"
import { getFeaturedProducts } from "@/lib/api/product"
import { getCollections } from "@/lib/api/collection"

export default async function ProductsPage() {
    const [featuredRes, collections] = await Promise.all([getFeaturedProducts(), getCollections()])

    return (
        <main dir="rtl" className="relative">
            <ProductsExplorer
                initialFeatured={featuredRes.results}
                collections={collections.results ?? collections}
            />
        </main>
    )
}
