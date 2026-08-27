import { getCollections } from "@/lib/api/collection"
import CollectionsGrid from "@/components/collection/collections-grid"

export const revalidate = 300

export default async function CollectionsPage() {
    const collections = await getCollections()

    return (
        <main dir="rtl" className="w-full">
            <CollectionsGrid items={collections.results} />
        </main>
    )
}
