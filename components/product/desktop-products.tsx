import { ProductListItem } from "@/types/product"
import { HeroImage } from "../layout/hero-image"
import { ScrollVelocityGalleryWrapper } from "./scroll-velocity-gallery-wrapper"

interface DesktopProductsProps {
    products: ProductListItem[]
    className?: string
}

export default function DesktopProducts({ products, className = "" }: DesktopProductsProps) {
    return (
        <div className={className}>
            <div>
                <ScrollVelocityGalleryWrapper items={products} className="z-50 overflow-hidden" />
            </div>

            <div className="absolute bottom-0 left-0">
                <HeroImage priority={false} />
            </div>
        </div>
    )
}
