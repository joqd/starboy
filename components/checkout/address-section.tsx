import { MapPin, Pencil, Plus, Trash2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import type { AddressListItem } from "@/types/address"
import { InlineFieldError } from "@/components/checkout/checkout-states"

export function AddressSection({
    addresses,
    loading,
    error,
    selectedAddressId,
    deletingAddressId,
    onSelect,
    onEdit,
    onDelete,
    onAddNew,
}: {
    addresses: AddressListItem[]
    loading: boolean
    error: string | null
    selectedAddressId: number | null
    deletingAddressId: number | null
    onSelect: (id: number) => void
    onEdit: (address: AddressListItem) => void
    onDelete: (id: number) => void
    onAddNew: () => void
}) {
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
            </div>
        )
    }

    if (error) {
        return <InlineFieldError message={error} />
    }

    if (addresses.length === 0) {
        return (
            <button
                type="button"
                onClick={onAddNew}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 px-6 py-10 text-center transition-colors hover:border-foreground/40"
            >
                <MapPin className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                    هنوز آدرسی ثبت نکرده‌اید
                </span>
                <span className="text-xs text-muted-foreground">
                    برای ادامه، یک آدرس تحویل اضافه کنید
                </span>
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <RadioGroup
                value={selectedAddressId ? String(selectedAddressId) : undefined}
                onValueChange={(value) => onSelect(Number(value))}
                className="flex flex-col gap-3"
            >
                {addresses.map((address) => (
                    <AddressCard
                        key={address.id}
                        address={address}
                        deleting={deletingAddressId === address.id}
                        onEdit={() => onEdit(address)}
                        onDelete={() => onDelete(address.id)}
                    />
                ))}
            </RadioGroup>

            <button
                type="button"
                onClick={onAddNew}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 p-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
                <Plus className="size-3.5" />
                افزودن آدرس جدید
            </button>
        </div>
    )
}

function AddressCard({
    address,
    deleting,
    onEdit,
    onDelete,
}: {
    address: AddressListItem
    deleting: boolean
    onEdit: () => void
    onDelete: () => void
}) {
    const fieldId = `address-${address.id}`

    return (
        <Label
            htmlFor={fieldId}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-4 font-normal transition-colors has-[[data-state=checked]]:border-foreground/60 has-[[data-state=checked]]:bg-white/80 dark:has-[[data-state=checked]]:bg-accent"
        >
            <RadioGroupItem value={String(address.id)} id={fieldId} className="sr-only" />

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
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    onClick={(e) => {
                        // Prevent the click from bubbling up to the <label>,
                        // which would otherwise (re)select this radio item.
                        e.preventDefault()
                        e.stopPropagation()
                        onEdit()
                    }}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    aria-label="ویرایش آدرس"
                >
                    <Pencil className="size-3.5" />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDelete()
                    }}
                    disabled={deleting}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-destructive disabled:opacity-40"
                    aria-label="حذف آدرس"
                >
                    {deleting ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                </button>
            </div>
        </Label>
    )
}
