import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct } from "@/lib/api/product"
import ProductView from "@/components/product-view"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) return {}

    const image = product.images.find((i) => i.is_primary)?.image ?? product.images[0]?.image

    return {
        title: product.title,
        description: product.short_description || product.description?.slice(0, 160),
        openGraph: {
            title: product.title,
            description: product.short_description,
            images: image ? [{ url: image }] : undefined,
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params
    const product = await getProduct(slug)

    console.log(product)

    if (!product) notFound()

    return (
        <div>
            <ProductView product={product} />
        </div>
    )
}
