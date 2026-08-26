import { Suspense } from "react"
import ProductsExplorer from "@/components/product/products-explorer"
import { getFeaturedProducts } from "@/lib/api/product"
import { getCollections } from "@/lib/api/collection"

export default async function ProductsPage() {
    const [featuredRes, collections] = await Promise.all([getFeaturedProducts(), getCollections()])

    return (
        <main dir="rtl" className="relative">
            <Suspense fallback={<ProductsExplorerFallback />}>
                <ProductsExplorer
                    initialFeatured={featuredRes.results}
                    collections={collections.results ?? collections}
                />
            </Suspense>
        </main>
    )
}

function ProductsExplorerFallback() {
    return (
        <div className="mt-15 px-5 lg:mx-auto lg:max-w-7xl lg:px-8">
            <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="aspect-3/4 animate-pulse rounded-xl bg-muted" />
                ))}
            </ul>
        </div>
    )
}
