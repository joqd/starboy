import { getRelatedProducts } from "@/lib/api/related-products"
import { ScrollStrip } from "@/components/product/scroll-strip"
import { ProductTile } from "@/components/product/product-tile"

// ---------------------------------------------------------------------------
// A single "break" in the article where 2-3 related products can appear
// mid-read, styled as a quiet inset strip rather than a banner ad. It's a
// real async server component already wired into the content flow (see
// PostContent's section splitting) and already fetching from
// getRelatedProducts — so turning it "on" later is just making that
// function return real data. If it ever comes back empty, it renders
// nothing rather than an empty strip.
// ---------------------------------------------------------------------------
export async function InlineProductSlot({ postSlug }: { postSlug: string }) {
    const items = await getRelatedProducts(postSlug, 3)
    if (items.length === 0) return null

    return (
        <aside className="-mx-4 my-8 border-y border-border bg-muted/40 py-5">
            <p className="mb-3 px-4 text-xs font-semibold text-muted-foreground">
                پیشنهاد مرتبط با این بخش
            </p>
            <ScrollStrip>
                {items.map((item, idx) => (
                    <li key={item.slug} className="w-32 shrink-0 snap-start">
                        <ProductTile item={item} eager={idx === 0} />
                    </li>
                ))}
            </ScrollStrip>
        </aside>
    )
}
