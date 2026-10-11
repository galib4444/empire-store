import { brand } from "@lib/brand"
import { Heading } from "@modules/common/components/ui"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">Need help?</Heading>
      <div className="text-base-regular my-2">
        <a
          href={`mailto:${brand.contactEmail}`}
          className="text-ui-fg-interactive hover:underline"
        >
          {brand.contactEmail}
        </a>
      </div>
    </div>
  )
}

export default Help
