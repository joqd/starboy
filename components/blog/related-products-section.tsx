import { getRelatedProducts } from "@/lib/api/related-products"
import { ScrollStrip } from "@/components/product/scroll-strip"
import { ProductTile } from "@/components/product/product-tile"

// ---------------------------------------------------------------------------
// The "closing" related-products moment — a full strip after the article
// ends, same shape as FeaturedSection on the home page so a reader who
// scrolls to the end lands somewhere familiar. This is deliberately
// separate from InlineProductSlot (different title, no mid-read framing)
// even though both currently call the same data source, because the two
// placements will likely want different selection logic later (e.g. "more
// like this" here vs. "mentioned in this section" inline).
// ---------------------------------------------------------------------------
export async function RelatedProductsSection({ postSlug }: { postSlug: string }) {
    const items = await getRelatedProducts(postSlug)
    if (items.length === 0) return null

    return (
        <section className="mt-12">
            <div className="mb-3 px-4">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                    محصولات مرتبط
                </h2>
            </div>
            <ScrollStrip>
                {items.map((item, idx) => (
                    <li key={item.slug} className="w-36 shrink-0 snap-start">
                        <ProductTile item={item} eager={idx < 2} />
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}
