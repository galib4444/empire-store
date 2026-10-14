const fs = require("fs")
const path = require("path")
const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * The active brand lives in `brand/<name>/brand.json` at the repository root.
 * Its public parts (name, tagline, theme, home copy) are passed to the app as
 * NEXT_PUBLIC_BRAND, and its logo files are copied to `public/brand/`.
 */
const BRAND_ROOT = process.env.BRAND_DIR || path.resolve(__dirname, "../../brand")
const BRAND_NAME =
  process.env.BRAND ||
  fs.readFileSync(path.join(BRAND_ROOT, ".active"), "utf8").trim()
const BRAND_DIR = path.join(BRAND_ROOT, BRAND_NAME)
const brand = JSON.parse(
  fs.readFileSync(path.join(BRAND_DIR, "brand.json"), "utf8")
)

const publicBrandDir = path.join(__dirname, "public", "brand")
fs.mkdirSync(publicBrandDir, { recursive: true })
for (const [key, file] of Object.entries(brand.logo || {})) {
  fs.copyFileSync(
    path.join(BRAND_DIR, file),
    path.join(publicBrandDir, `${key}${path.extname(file)}`)
  )
}

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  turbopack: { root: path.resolve(__dirname, "../..") },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BRAND: JSON.stringify({
      name: brand.name,
      tagline: brand.tagline,
      contactEmail: brand.contactEmail,
      theme: brand.theme,
      home: brand.home,
      logo: Object.fromEntries(
        Object.entries(brand.logo || {}).map(([key, file]) => [
          key,
          `/brand/${key}${path.extname(file)}`,
        ])
      ),
    }),
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
