import { ProductListItem } from "./product"

export interface ScrollVelocityGalleryProps {
    items: ProductListItem[]
    /** Eyebrow-style heading, e.g. "HERITAGE" */
    heading?: string
    /** Second line of the heading, e.g. "FW25/26 COLLECTION" */
    subheading?: string
    className?: string
    waveIntensity?: number
}
