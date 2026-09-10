export interface Gateway {
    id: number
    title: string
    badge: string
    is_installment: boolean
    description: string
    min_amount: number | null
    max_amount: number | null
}
