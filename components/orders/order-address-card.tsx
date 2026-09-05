import { MapPin } from "lucide-react"

import type { AddressListItem } from "@/types/address"

export function OrderAddressCard({ address }: { address: AddressListItem }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                <MapPin className="size-[1.15rem] text-foreground" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{address.title}</span>
                <span className="text-xs text-muted-foreground">
                    {address.recipient_name} · {address.phone}
                </span>
                <span className="text-xs text-muted-foreground">
                    {address.province.name}، {address.city.name} — {address.address_line}
                </span>
                <span className="text-xs text-muted-foreground">
                    کد پستی: {address.postal_code}
                </span>
            </div>
        </div>
    )
}
