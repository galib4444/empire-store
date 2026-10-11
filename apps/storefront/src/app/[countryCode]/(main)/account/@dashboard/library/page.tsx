import { Metadata } from "next"

import { listLibrary } from "@lib/data/digital-products"
import DigitalDownloads from "@modules/order/components/digital-downloads"

export const metadata: Metadata = {
  title: "Library",
  description: "Everything you have bought, ready to download.",
}

export default async function Library() {
  const products = await listLibrary()

  return (
    <div className="w-full" data-testid="library-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Library</h1>
        <p className="text-base-regular">
          Everything you have bought, ready to download again at any time.
        </p>
      </div>
      {products.length ? (
        <DigitalDownloads products={products} />
      ) : (
        <p className="text-base-regular text-ui-fg-subtle">
          Nothing here yet. Your downloads appear after your first order.
        </p>
      )}
    </div>
  )
}
