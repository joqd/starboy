// Example: homepage section using hardcoded test data.
//
// The NestJS `/products` endpoint isn't ready yet — swap TEST_PRODUCTS for
// a real fetch once it is (see the "Wiring up the real API later" section
// in the README for the fetch-based version). ScrollVelocityItem is the
// only contract that matters, so nothing in ScrollVelocityGallery needs to
// change when you make that switch.

import ScrollVelocityGallery from "@/components/scroll-velocity-gallery"
import type { ScrollVelocityItem } from "@/types/gallery"

// Swap in real photography before shipping — Unsplash is used here purely
// as placeholder imagery so the layout can be reviewed with real-ish content.
const TEST_PRODUCTS: ScrollVelocityItem[] = [
    {
        id: "1",
        name: "Wool Overcoat",
        meta: "€890",
        image: "https://examples.motion.dev/photos/heritage/8.jpg",
        href: "/products/wool-overcoat",
    },
    {
        id: "2",
        name: "Selvedge Denim",
        meta: "€310",
        image: "https://examples.motion.dev/photos/heritage/14.jpg",
        href: "/products/selvedge-denim",
    },
    {
        id: "3",
        name: "Merino Turtleneck",
        meta: "€210",
        image: "https://examples.motion.dev/photos/heritage/15.jpg",
        href: "/products/merino-turtleneck",
    },
    {
        id: "4",
        name: "Leather Chelsea Boot",
        meta: "€460",
        image: "https://examples.motion.dev/photos/heritage/16.jpg",
        href: "/products/leather-chelsea-boot",
    },
    {
        id: "5",
        name: "Cashmere Scarf",
        meta: "€180",
        image: "https://examples.motion.dev/photos/heritage/1.jpg",
        href: "/products/cashmere-scarf",
    },
    {
        id: "6",
        name: "Tailored Trouser",
        meta: "€245",
        image: "https://examples.motion.dev/photos/heritage/2.jpg",
        href: "/products/tailored-trouser",
    },
    {
        id: "7",
        name: "Silver Anorak",
        meta: "€520",
        image: "https://examples.motion.dev/photos/heritage/3.jpg",
        href: "/products/silver-anorak",
    },
    {
        id: "8",
        name: "Suede Field Jacket",
        meta: "€610",
        image: "https://examples.motion.dev/photos/heritage/4.jpg",
        href: "/products/suede-field-jacket",
    },
    {
        id: "9",
        name: "Raw Denim Trucker",
        meta: "€340",
        image: "https://examples.motion.dev/photos/heritage/5.jpg",
        href: "/products/raw-denim-trucker",
    },
    {
        id: "10",
        name: "Wool Beanie",
        meta: "€65",
        image: "https://examples.motion.dev/photos/heritage/7.jpg",
        href: "/products/wool-beanie",
    },
    {
        id: "11",
        name: "Canvas Weekender",
        meta: "€290",
        image: "https://examples.motion.dev/photos/heritage/8.jpg",
        href: "/products/canvas-weekender",
    },
    {
        id: "12",
        name: "Oxford Shirt",
        meta: "€140",
        image: "https://examples.motion.dev/photos/heritage/9.jpg",
        href: "/products/oxford-shirt",
    },
    {
        id: "13",
        name: "Waxed Field Coat",
        meta: "€480",
        image: "https://examples.motion.dev/photos/heritage/10.jpg",
        href: "/products/waxed-field-coat",
    },
    {
        id: "14",
        name: "Knit Cardigan",
        meta: "€195",
        image: "https://examples.motion.dev/photos/heritage/11.jpg",
        href: "/products/knit-cardigan",
    },
    {
        id: "15",
        name: "Leather Belt",
        meta: "€90",
        image: "https://examples.motion.dev/photos/heritage/12.jpg",
        href: "/products/leather-belt",
    },
]

export default function Home() {
    return (
        <main>
            <ScrollVelocityGallery
                items={TEST_PRODUCTS}
                heading="استاربوی"
                subheading="از صدا تا استایل"
                className="z-50"
            />
        </main>
    )
}
