import request from "@/lib/api/client"
import type { FooterBadge } from "@/types/site"

export function getFooterBadges(): Promise<FooterBadge[]> {
    return request<FooterBadge[]>("/core/footer-badges/", {
        method: "GET",
    })
}
