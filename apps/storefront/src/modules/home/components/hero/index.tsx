import { brand } from "@lib/brand"
import { Button, Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="w-full border-b border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container flex flex-col items-center text-center gap-6 py-24 small:py-32">
        <Heading
          level="h1"
          className="text-4xl small:text-5xl leading-tight text-ui-fg-base font-normal max-w-3xl"
        >
          {brand.home.headline}
        </Heading>
        <p className="text-large-regular text-ui-fg-subtle max-w-xl">
          {brand.home.subhead}
        </p>
        <LocalizedClientLink href="/store">
          <Button variant="primary" size="large">
            {brand.home.cta}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
