"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Spinner } from "@/components/ui/spinner"
import { InlineFieldError } from "@/components/checkout/checkout-states"

import type { Address, AddressListItem } from "@/types/address"
import { createAddress, getCities, getProvinces, updateAddress } from "@/lib/api/address"

type ProvinceOption = { id: number; name: string }
type CityOption = { id: number; name: string }

export function AddressFormDialog({
    open,
    initialAddress,
    onClose,
    onSaved,
}: {
    open: boolean
    initialAddress: AddressListItem | null
    onClose: () => void
    onSaved: (savedId: "new" | number) => void
}) {
    const isEditing = !!initialAddress

    const [title, setTitle] = useState("")
    const [recipientName, setRecipientName] = useState("")
    const [phone, setPhone] = useState("")
    const [provinceId, setProvinceId] = useState<number | "">("")
    const [cityId, setCityId] = useState<number | "">("")
    const [postalCode, setPostalCode] = useState("")
    const [addressLine, setAddressLine] = useState("")

    const [provinces, setProvinces] = useState<ProvinceOption[]>([])
    const [provincesLoading, setProvincesLoading] = useState(false)
    const [cities, setCities] = useState<CityOption[]>([])
    const [citiesLoading, setCitiesLoading] = useState(false)

    // Tracks the province the form was opened with, so the province->city
    // effect below can tell "user changed the province" apart from "we just
    // loaded an existing address" and only clear the city in the first case.
    const initialProvinceIdRef = useRef<number | "">("")

    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Every time the dialog opens, initialize the form from the address
    // being edited (or empty) and (re)fetch the province list.
    useEffect(() => {
        if (!open) return

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormError(null)
        setTitle(initialAddress?.title ?? "")
        setRecipientName(initialAddress?.recipient_name ?? "")
        setPhone(initialAddress?.phone ?? "")
        setPostalCode(initialAddress?.postal_code ?? "")
        setAddressLine(initialAddress?.address_line ?? "")
        setProvinceId(initialAddress?.province.id ?? "")
        setCityId(initialAddress?.city.id ?? "")
        initialProvinceIdRef.current = initialAddress?.province.id ?? ""

        setProvincesLoading(true)
        getProvinces()
            .then((res) => setProvinces(res))
            .catch(() => setFormError("خطا در دریافت لیست استان‌ها"))
            .finally(() => setProvincesLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialAddress?.id])

    // When the province changes, fetch the list of cities for that province.
    // If this was a real change made by the user (not the initial value
    // loaded for an address being edited), clear the previously selected
    // city so a city from the old province can never be submitted by mistake.
    useEffect(() => {
        if (!provinceId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCities([])
            return
        }
        setCitiesLoading(true)
        getCities(provinceId)
            .then((res) => {
                setCities(res)
                if (provinceId !== initialProvinceIdRef.current) {
                    setCityId("")
                }
            })
            .catch(() => setFormError("خطا در دریافت لیست شهرها"))
            .finally(() => setCitiesLoading(false))
    }, [provinceId])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!provinceId || !cityId) {
            setFormError("لطفاً استان و شهر را انتخاب کنید")
            return
        }

        setSubmitting(true)
        setFormError(null)

        const payload: Address = {
            title,
            recipient_name: recipientName,
            phone,
            province: provinceId,
            city: cityId,
            postal_code: postalCode,
            address_line: addressLine,
            is_default: initialAddress?.is_default ?? false,
        }

        try {
            if (isEditing && initialAddress) {
                await updateAddress(initialAddress.id, payload)
                onSaved(initialAddress.id)
            } else {
                await createAddress(payload)
                onSaved("new")
            }
        } catch {
            setFormError("ذخیره آدرس با خطا مواجه شد. دوباره تلاش کنید")
        } finally {
            setSubmitting(false)
        }
    }

    // Combobox items are plain name strings now (not objects), which sidesteps
    // a Base UI Combobox bug where an object passed as `value` sometimes gets
    // rendered raw (e.g. as JSON) inside the input instead of going through
    // itemToStringValue. Selection is resolved back to an id via these maps.
    const provinceNames = provinces.map((p) => p.name)
    const cityNames = cities.map((c) => c.name)

    const selectedProvinceName = provinces.find((p) => p.id === provinceId)?.name ?? null
    const selectedCityName = cities.find((c) => c.id === cityId)?.name ?? null

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent dir="rtl" className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "ویرایش آدرس" : "افزودن آدرس جدید"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel htmlFor="address-title">
                            عنوان آدرس (مثلا خانه، محل کار)
                        </FieldLabel>
                        <Input
                            value={title}
                            autoComplete="off"
                            onChange={(e) => setTitle(e.target.value)}
                            id="address-title"
                            required
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="recipient-name">نام گیرنده</FieldLabel>
                            <Input
                                value={recipientName}
                                autoComplete="off"
                                onChange={(e) => setRecipientName(e.target.value)}
                                id="recipient-name"
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="tel">شماره موبایل گیرنده</FieldLabel>
                            <Input
                                value={phone}
                                autoComplete="off"
                                onChange={(e) => setPhone(e.target.value)}
                                id="tel"
                                dir="ltr"
                                className="font-inter"
                                required
                            />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="province-input">استان</FieldLabel>
                            <Combobox
                                items={provinceNames}
                                value={selectedProvinceName}
                                onValueChange={(name) => {
                                    const found = provinces.find((p) => p.name === name)
                                    setProvinceId(found ? found.id : "")
                                }}
                                disabled={provincesLoading}
                            >
                                <ComboboxInput
                                    id="province-input"
                                    autoComplete="off"
                                    placeholder={
                                        provincesLoading ? "در حال بارگذاری..." : "انتخاب استان"
                                    }
                                />
                                <ComboboxContent dir="rtl" align="end">
                                    <ComboboxEmpty>
                                        {provincesLoading
                                            ? "در حال بارگذاری..."
                                            : "استانی یافت نشد"}
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(name) => (
                                            <ComboboxItem key={name} value={name}>
                                                {name}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="city-input">شهر</FieldLabel>
                            <Combobox
                                items={cityNames}
                                value={selectedCityName}
                                onValueChange={(name) => {
                                    const found = cities.find((c) => c.name === name)
                                    setCityId(found ? found.id : "")
                                }}
                                disabled={!provinceId || citiesLoading}
                            >
                                <ComboboxInput
                                    id="city-input"
                                    autoComplete="off"
                                    placeholder={
                                        !provinceId
                                            ? "ابتدا استان را انتخاب کنید"
                                            : citiesLoading
                                              ? "در حال بارگذاری..."
                                              : "انتخاب شهر"
                                    }
                                />
                                <ComboboxContent dir="rtl" align="end">
                                    <ComboboxEmpty>
                                        {citiesLoading ? "در حال بارگذاری..." : "شهری یافت نشد"}
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(name) => (
                                            <ComboboxItem key={name} value={name}>
                                                {name}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="postal-code">کد پستی</FieldLabel>
                        <Input
                            value={postalCode}
                            autoComplete="off"
                            onChange={(e) => setPostalCode(e.target.value)}
                            id="postal-code"
                            dir="ltr"
                            className="font-inter"
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="address-line">آدرس کامل</FieldLabel>
                        <Textarea
                            value={addressLine}
                            autoComplete="off"
                            id="address-line"
                            onChange={(e) => setAddressLine(e.target.value)}
                            required
                        />
                    </Field>

                    {formError && <InlineFieldError message={formError} />}

                    <DialogFooter className="mt-2 flex-row items-center gap-2 sm:justify-start">
                        <Button type="submit" disabled={submitting} className="flex-1">
                            {submitting && <Spinner className="size-3.5" />}
                            {isEditing ? "ذخیره تغییرات" : "افزودن آدرس"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="shrink-0"
                            onClick={onClose}
                        >
                            انصراف
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
