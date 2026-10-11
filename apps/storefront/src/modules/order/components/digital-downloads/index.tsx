import { OwnedDigitalProduct } from "@lib/data/digital-products"
import { Heading } from "@modules/common/components/ui"

type DigitalDownloadsProps = {
  products: OwnedDigitalProduct[]
  title?: string
}

const DigitalDownloads = ({ products, title }: DigitalDownloadsProps) => {
  if (!products.length) {
    return null
  }

  return (
    <div
      className="flex flex-col gap-y-4 border border-ui-border-base rounded-rounded p-6 bg-ui-bg-subtle"
      data-testid="digital-downloads"
    >
      {title && (
        <Heading level="h2" className="text-2xl">
          {title}
        </Heading>
      )}
      <ul className="flex flex-col gap-y-4">
        {products.map((product) => (
          <li key={product.id} className="flex flex-col gap-y-2">
            <span className="txt-medium-plus text-ui-fg-base">
              {product.name}
            </span>
            {product.files.map((file) => (
              <a
                key={file.id}
                href={file.download_url}
                className="flex items-center justify-between gap-x-4 txt-medium text-ui-fg-interactive hover:underline"
                data-testid="digital-download-link"
              >
                <span>Download {file.filename ?? "file"}</span>
                {file.version > 1 && (
                  <span className="txt-small text-ui-fg-subtle">
                    Edition {file.version}
                  </span>
                )}
              </a>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DigitalDownloads
