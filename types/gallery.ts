export interface ScrollVelocityItem {
    /** Stable unique id — used as the React key and drag/hover identity */
    id: string
    /** Product name, shown in the hover label */
    name: string
    /** Optional secondary line (price, category, "New season"...) */
    meta?: string
    /** Image URL */
    image: string
    /** Optional link — wrap the plane in an <a> when provided */
    href?: string
}

export interface ScrollVelocityGalleryProps {
    items: ScrollVelocityItem[]
    /** Eyebrow-style heading, e.g. "HERITAGE" */
    heading?: string
    /** Second line of the heading, e.g. "FW25/26 COLLECTION" */
    subheading?: string
    className?: string
	waveIntensity?: number
}
