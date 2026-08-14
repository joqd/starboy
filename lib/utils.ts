import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(value: number | string): string {
    return new Intl.NumberFormat("fa-IR").format(Number(value))
}

export function formatPostDate(isoDate: string) {
    return new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(isoDate))
}
