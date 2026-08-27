import request from "@/lib/api/client"
import { Gateway } from "@/types/gateway"

export function getGateways(): Promise<Gateway[]> {
    return request<Gateway[]>("/api/checkout/gateways/", {
        method: "GET",
    })
}
