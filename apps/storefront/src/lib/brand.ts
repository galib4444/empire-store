/**
 * The active brand: name, tagline, theme and home page copy. It comes from
 * `brand/<name>/brand.json` at the repository root (see next.config.js), so
 * nothing in the storefront names a specific brand.
 */
export type Brand = {
  name: string
  tagline: string
  contactEmail: string
  theme: {
    colors: {
      background: string
      surface: string
      text: string
      muted: string
      border: string
      accent: string
      button: string
      buttonText: string
    }
    fonts: { display: string; body: string }
  }
  home: { headline: string; subhead: string; cta: string }
  logo: { icon?: string; favicon?: string }
}

export const brand: Brand = JSON.parse(process.env.NEXT_PUBLIC_BRAND as string)

/** CSS variables for the theme, set on <html>. Restyle by editing brand.json. */
export function brandCssVariables(): Record<string, string> {
  const { colors, fonts } = brand.theme
  return {
    "--brand-background": colors.background,
    "--brand-surface": colors.surface,
    "--brand-text": colors.text,
    "--brand-muted": colors.muted,
    "--brand-border": colors.border,
    "--brand-accent": colors.accent,
    "--brand-button": colors.button,
    "--brand-button-text": colors.buttonText,
    "--brand-font-display": `"${fonts.display}", Georgia, serif`,
    "--brand-font-body": `"${fonts.body}", -apple-system, "Segoe UI", sans-serif`,
  }
}

/** Google Fonts stylesheet URL for the brand's two typefaces. */
export function brandFontsUrl(): string {
  const { display, body } = brand.theme.fonts
  const family = (name: string, weights: string) =>
    `family=${name.replace(/ /g, "+")}:${weights}`
  return `https://fonts.googleapis.com/css2?${family(
    display,
    "ital,wght@0,400;0,600;1,400"
  )}&${family(body, "wght@400;500;600")}&display=swap`
}
