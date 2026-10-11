import { HttpTypes } from "@medusajs/types"

/**
 * True when at least one item has to be delivered. A cart of only digital
 * products needs no delivery step and no shipping method.
 */
export function cartNeedsShipping(
  cart: Pick<HttpTypes.StoreCart, "items"> | null | undefined
): boolean {
  return (cart?.items ?? []).some((item) => item.requires_shipping)
}

/** The delivery step is done: a method is chosen, or none is needed. */
export function shippingStepDone(
  cart: Pick<HttpTypes.StoreCart, "items" | "shipping_methods">
): boolean {
  return !cartNeedsShipping(cart) || (cart.shipping_methods?.length ?? 0) > 0
}
