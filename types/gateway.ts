export interface Gateway {
    id: number
    title: string
    badge: string
    is_installment: boolean
    description: string
    min_amount: number | null
    max_amount: number | null
}

/**
 * Splits gateways the same way everywhere they're used:
 *  - `primary`: the first non-installment (regular bank) gateway, by the
 *    order returned from the API. This is the one shown first and selected
 *    by default.
 *  - `installment`: the first installment gateway, if any.
 *  - `others`: the remaining non-installment gateways, hidden by default
 *    behind "show other gateways" so the user isn't overwhelmed with
 *    options.
 */
export function partitionGateways(gateways: Gateway[]) {
    const paymentGateways = gateways.filter((gateway) => !gateway.is_installment)
    const installment = gateways.find((gateway) => gateway.is_installment)
    const [primary, ...others] = paymentGateways

    return { primary, installment, others }
}
