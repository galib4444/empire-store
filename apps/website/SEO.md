# Promptugraphy search setup

Updated November 3, 2026. Primary website: https://promptugraphy.com.

## Published changes

- Descriptive, distinct search titles and descriptions across the site, with the established visual headlines retained.
- One canonical HTTPS origin. Both `www.promptugraphy.com` and `promptugraphy.vercel.app` permanently redirect to the same paths on the primary domain.
- Connected Organization, WebSite, WebPage, Product/Book, VideoObject, Article, ItemList, and BreadcrumbList entities. The help page's question markup matches its visible answers.
- Accurate product facts: Day is a 47-page PDF with 17 prompts; Focus is a 99-page PDF with 24 prompts. Both cost $19.99 USD through Gumroad. No invented ratings, reviews, ISBNs, or testimonials.
- A visible comparison table, book-specific social sharing images, practical guides with complete sample prompts, and links between relevant products and guides.
- A sitemap covering 12 indexable pages, with fixed content-modification dates, image information, and the two existing book videos. The 404 response is not indexed.
- Public content is present in the initial HTML. Googlebot, bingbot, and OAI-SearchBot user-agent requests returned the guide content with HTTP 200 in live checks. This tests the site's responses, not every crawler's network address.
- Fonts load directly from the document head instead of through a CSS import. Asset versions prevent an older stylesheet from hiding published updates.

## Search intent

| Page | Main purpose |
| --- | --- |
| `/` | AI prompt books for productivity and focus |
| `/books` | Compare daily-planning and focus prompt books |
| `/books/deliberate-day` | The Deliberate Day; AI daily planning prompts |
| `/books/deliberate-focus` | The Deliberate Focus; AI focus prompts |
| `/samples` | Free AI prompts to try before buying |
| `/guides/ai-daily-planning-prompt` | Use an AI daily planning prompt, with a worked example |
| `/guides/ai-prompt-to-start-a-task` | Use an AI prompt to begin an avoided task |
| `/about` | Establish the publisher's identity and official shop |
| `/help` | Purchase, download, and license questions |

## Indexing and measurement

- Google Search Console: domain property `sc-domain:promptugraphy.com`, verified through a Namecheap TXT record under `promptugraphy@gmail.com`. Keep that record in place. The same public verification token is also included in page metadata.
- Sitemap: https://promptugraphy.com/sitemap.xml, submitted through Search Console. Google reported **Success**, with **12 discovered pages and 2 discovered videos** on November 3, 2026. Discovered is not the same as indexed.
- IndexNow: 12 canonical URLs submitted on November 4, 2026 at 01:26:50 UTC. Response HTTP 202 means received with key validation pending. It does not mean indexed. The verification file is generated from `seo.config.json`.
- No search-ranking or AI-citation results are claimed at launch. Inspect Search Console after Google begins collecting data: indexed pages, queries, impressions, clicks, CTR, and landing pages. Compare the two product pages and guides before changing titles or adding more content.
- The owner confirmed on November 3, 2026 that Promptugraphy has no Instagram or YouTube page and currently uses only Gumroad. Instagram account linking was stopped before login. Google also reported no YouTube channels for `promptugraphy@gmail.com`.
- The official Gumroad profile is linked visibly in the footer and in the Organization's `sameAs` field. Add social links only when actual Promptugraphy profiles exist. No Facebook profile URL was supplied; Facebook is not a supported Search Console platform property.

## Guidance used

- [Google's generative AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): useful original content and ordinary SEO remain the foundation; no special AI schema or `llms.txt` file is required.
- [Google product snippet documentation](https://developers.google.com/search/docs/appearance/structured-data/product-snippet): match structured data to the real product and offer.
- [Google video guidance](https://developers.google.com/search/docs/appearance/video): expose real videos and accessible media. Product previews are supplementary; their presence does not guarantee video-search eligibility.
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): OAI-SearchBot governs automatic search crawling separately from model training.
- [IndexNow documentation](https://www.indexnow.org/documentation): host the verification file before submitting canonical URLs.
- [Google platform-property documentation](https://support.google.com/webmasters/answer/17148418): supported platforms currently include Instagram, TikTok, X, and YouTube. Facebook is not offered as a Search Console platform property.
