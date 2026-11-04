export function siteIdentity(baseUrl) {
  return [
    {
      "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "Promptugraphy", url: baseUrl,
      description: "Independent publisher of PDF books with AI prompts for daily planning, productivity, and focus.",
      logo: { "@type": "ImageObject", "@id": `${baseUrl}/#logo`, url: `${baseUrl}/assets/brand-mark.webp` },
      email: "hello@promptugraphy.com", sameAs: ["https://promptugraphy.gumroad.com"],
    },
    { "@type": "WebSite", "@id": `${baseUrl}/#website`, url: baseUrl, name: "Promptugraphy", inLanguage: "en", publisher: { "@id": `${baseUrl}/#organization` } },
  ]
}

export function pageGraph(page, baseUrl, updated) {
  const url = `${baseUrl}${page.pathname === "/" ? "" : page.pathname}`
  const graph = siteIdentity(baseUrl)
  const name = `${page.title} | Promptugraphy`
  const pageType = page.pathname === "/about" ? "AboutPage" : page.pathname === "/books" || page.pathname === "/guides" ? "CollectionPage" : "WebPage"
  const webPage = { "@type": pageType, "@id": `${url}#webpage`, url, name, description: page.description, inLanguage: "en", isPartOf: { "@id": `${baseUrl}/#website` }, publisher: { "@id": `${baseUrl}/#organization` }, dateModified: updated }
  if (page.breadcrumbs) {
    webPage.breadcrumb = { "@id": `${url}#breadcrumbs` }
    graph.push({ "@type": "BreadcrumbList", "@id": `${url}#breadcrumbs`, itemListElement: page.breadcrumbs.map(([label, pathname], index) => ({ "@type": "ListItem", position: index + 1, name: label, item: `${baseUrl}${pathname === "/" ? "" : pathname}` })) })
  }
  if (page.book) {
    const b = page.book
    const productId = `${url}#book`
    const videoId = `${url}#video`
    webPage.mainEntity = { "@id": productId }
    graph.push({
      "@type": ["Product", "Book"], "@id": productId, url, name: b.title, description: b.seo,
      image: `${baseUrl}/assets/${b.short.toLowerCase()}-cover.webp`, bookFormat: "https://schema.org/EBook", numberOfPages: b.pages, inLanguage: "en",
      publisher: { "@id": `${baseUrl}/#organization` }, author: { "@id": `${baseUrl}/#organization` }, brand: { "@id": `${baseUrl}/#organization` },
      sameAs: `https://promptugraphy.gumroad.com/l/${b.slug}`, subjectOf: { "@id": videoId }, mainEntityOfPage: { "@id": `${url}#webpage` },
      offers: { "@type": "Offer", url: `https://promptugraphy.gumroad.com/l/${b.slug}`, price: "19.99", priceCurrency: "USD", availability: "https://schema.org/InStock", seller: { "@id": `${baseUrl}/#organization` } },
    })
    graph.push({ "@type": "VideoObject", "@id": videoId, name: `${b.title}: book-opening preview`, description: `A silent preview of ${b.title} opening to real interior pages. The product is a digital PDF book.`, thumbnailUrl: `${baseUrl}/assets/${b.short.toLowerCase()}-video-poster.jpg`, contentUrl: `${baseUrl}/assets/${b.short.toLowerCase()}-preview.mp4`, duration: "PT15S", uploadDate: "2026-11-03T12:00:00Z", publisher: { "@id": `${baseUrl}/#organization` }, about: { "@id": productId } })
  } else if (page.guide) {
    webPage.mainEntity = { "@id": `${url}#article` }
    graph.push({ "@type": "Article", "@id": `${url}#article`, headline: page.guide.title, description: page.description, url, datePublished: page.guide.published, dateModified: page.guide.updated, inLanguage: "en", author: { "@id": `${baseUrl}/#organization` }, publisher: { "@id": `${baseUrl}/#organization` }, mainEntityOfPage: { "@id": `${url}#webpage` }, image: `${baseUrl}/assets/social.jpg` })
  } else if (page.items) {
    webPage.mainEntity = { "@id": `${url}#items` }
    graph.push({ "@type": "ItemList", "@id": `${url}#items`, numberOfItems: page.items.length, itemListElement: page.items.map(([name, pathname], index) => ({ "@type": "ListItem", position: index + 1, name, url: `${baseUrl}${pathname}` })) })
  }
  if (page.schema?.["@type"] === "FAQPage") {
    webPage["@type"] = "FAQPage"
    webPage.mainEntity = page.schema.mainEntity
  }
  graph.push(webPage)
  return { "@context": "https://schema.org", "@graph": graph }
}

export function sitemap(pages, baseUrl, updated, escape) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pages.map(page => {
  const url = `${baseUrl}${page.pathname === "/" ? "" : page.pathname}`
  const image = page.book ? `${baseUrl}/assets/${page.book.short.toLowerCase()}-cover.webp` : page.pathname === "/" || page.guide ? `${baseUrl}/assets/social.jpg` : null
  const video = page.book ? `<video:video><video:thumbnail_loc>${baseUrl}/assets/${page.book.short.toLowerCase()}-video-poster.jpg</video:thumbnail_loc><video:title>${escape(page.book.title)}: book-opening preview</video:title><video:description>${escape(`A silent preview of ${page.book.title}. The product is a digital PDF book.`)}</video:description><video:content_loc>${baseUrl}/assets/${page.book.short.toLowerCase()}-preview.mp4</video:content_loc><video:duration>15</video:duration><video:publication_date>2026-11-03T12:00:00Z</video:publication_date></video:video>` : ""
  return `<url><loc>${escape(url)}</loc><lastmod>${page.guide?.updated || updated}</lastmod>${image ? `<image:image><image:loc>${escape(image)}</image:loc></image:image>` : ""}${video}</url>`
}).join("\n")}
</urlset>\n`
}
