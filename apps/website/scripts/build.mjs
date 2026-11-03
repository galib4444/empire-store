import fs from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const out = path.join(root, "dist")
const samples = JSON.parse(await fs.readFile(path.join(root, "samples.json"), "utf8"))
const baseUrl = (process.env.SITE_URL || "https://promptugraphy.com").replace(/\/$/, "")
const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
const json = value => JSON.stringify(value).replaceAll("<", "\\u003c")

const books = [
  {
    slug: "deliberate-day", short: "Day", title: "The Deliberate Day", label: "For a day that feels like yours", prompts: 17, pages: 47,
    description: "A clear plan for your day, an inbox that knows its place, and more time for the work that matters.",
    seo: "AI productivity prompts for daily planning, email, decisions and goals. Explore The Deliberate Day, a 47-page PDF for ChatGPT, Claude and Gemini.",
    headline: "A day that feels like yours.",
    intro: "Busy all day, but the important things keep waiting? Use thoughtfully written AI prompts to turn a messy to-do list into a realistic plan, find the words for difficult emails, and decide what deserves your time.",
    contents: [
      ["Run your day", "Plan your morning, pick what matters, protect time for deep work, shut down, and reset each week."],
      ["Tame your inbox", "Sort emails, write in your own voice, turn meeting notes into actions, and follow up politely."],
      ["Think more clearly", "Work through a hard choice, spot what could go wrong, and consider a different point of view."],
      ["Make room for your goals", "Plan your next 90 days, build habits, review the month, and decide what you will leave out."],
    ],
    sample: "The Morning Chief of Staff", sampleDescription: "Turn the tasks in your head into a plan that fits the hours you actually have.",
    fit: "You need help deciding what matters and putting your day in order.",
  },
  {
    slug: "deliberate-focus", short: "Focus", title: "The Deliberate Focus", label: "For the work you keep putting off", prompts: 24, pages: 99,
    description: "Find a smaller first step, stay with one task, and build a workday with fewer distractions.",
    seo: "AI prompts for deep work, procrastination and distractions. Explore The Deliberate Focus, a 99-page PDF for ChatGPT, Claude and Gemini.",
    headline: "Find your way into the work.",
    intro: "You sit down to work, and a minute later you are on your phone. Use a connected set of AI prompts to start the task you have been avoiding, protect your attention, and take breaks that leave you ready to return.",
    contents: [
      ["The Entry", "Find a tiny first step, work through resistance, clear your head, and start without needing a perfect first draft."],
      ["The Hold", "Stay with one task, handle interruptions, park distracting ideas, and find your way back after a break."],
      ["The Environment", "Review your desk, phone, and notifications. Make the next good choice a little easier."],
      ["The Recovery", "Plan a real break, bring a workday to a close, and give your attention time to recover."],
      ["The System", "Schedule focus time, keep a simple record, and review what works across weeks and months."],
    ],
    sample: "The Cold Start", sampleDescription: "Make the first move so small and imperfect that starting feels possible.",
    fit: "You know what needs doing, but starting or staying with it is the hard part.",
  },
]

const faq = [
  ["What am I actually buying?", "A designed PDF book of copy-and-paste AI prompts, with explanations, model tips, and worked examples. The Deliberate Day has 47 pages; The Deliberate Focus has 99. These are digital downloads, not physical books, software, or an AI subscription."],
  ["Do I need a paid AI subscription?", "You can use the prompts with free versions of ChatGPT, Claude, or Gemini. Features and usage limits depend on your chosen tool. Your AI account is separate from the book purchase."],
  ["How do I get my book?", "Buy through the book’s Gumroad link. After successful checkout, Gumroad provides access to your PDF and a receipt email. You can also find purchases in your Gumroad library. Check your spam folder if the receipt is missing, or contact us for help."],
  ["Which book should I start with?", "Choose The Deliberate Day for planning, email, decisions, and goals. Choose The Deliberate Focus if getting started, staying on one task, or handling distractions is the bigger problem. Each book works on its own."],
  ["Can I read it on my phone?", "Yes. Open the PDF on a phone, tablet, or computer using a PDF reader. A computer or tablet can make it easier to copy a prompt and read the worked example alongside your AI chat."],
  ["Can I use the prompts for my own work?", "Yes. Your personal license lets you copy prompts into your own AI tools and adapt them for your own work or business. The book and prompts may not be resold, redistributed, shared, or republished. See the license inside your book."],
  ["What if something goes wrong with my purchase?", 'For missing files, download trouble, or a refund request, email <a href="mailto:hello@promptugraphy.com">hello@promptugraphy.com</a> with your book title and Gumroad order reference. Do not send card details or passwords. Any policy shown at checkout applies to your purchase.'],
]

function header(current = "") {
  const active = name => current === name ? ' aria-current="page"' : ""
  return `<a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header"><div class="container header-inner">
    <a class="wordmark" href="/" aria-label="Promptugraphy home"><img src="/assets/brand-mark.webp" width="43" height="43" alt="">PROMPTUGRAPHY</a>
    <button class="menu-button" type="button" data-menu aria-expanded="false" aria-controls="site-nav">Menu ☰</button>
    <nav id="site-nav" class="site-nav" data-nav aria-label="Main navigation">
      <a href="/books"${active("books")}>The books</a><a href="/samples"${active("samples")}>Try a prompt</a><a href="/about"${active("about")}>Our story</a><a href="/help"${active("help")}>Help</a><a class="nav-shop" href="/books">Find your starting point <span aria-hidden="true">↗</span></a>
    </nav>
  </div></header>`
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-top">
  <div class="footer-brand"><a class="wordmark" href="/">PROMPTUGRAPHY</a><p>Fewer prompts, written properly.</p></div>
  <div class="footer-links"><div><strong>Explore</strong><a href="/books">The books</a><a href="/samples">Free samples</a><a href="/about">Our story</a></div>
  <div><strong>A little help</strong><a href="/help">Buying & downloads</a><a href="/privacy">Privacy</a><a href="/terms">Terms & license</a><a href="mailto:hello@promptugraphy.com">Get in touch ↗</a></div></div></div>
  <div class="footer-bottom"><p>© ${new Date().getFullYear()} Promptugraphy. All rights reserved.</p><span>Digital books. Human judgment. Room to do things your way.</span></div></div></footer>`
}

function layout({ title, description, pathname, body, current = "", schema }) {
  const url = `${baseUrl}${pathname === "/" ? "" : pathname}`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f1e8"><title>${esc(title)} | Promptugraphy</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/assets/site.css"><meta property="og:type" content="${current === "product" ? "product" : "website"}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Promptugraphy"><meta property="og:image" content="${baseUrl}/assets/social.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Promptugraphy: Fewer prompts, written properly."><meta name="twitter:card" content="summary_large_image">${schema ? `<script type="application/ld+json">${json(schema)}</script>` : ""}<script src="/assets/site.js" defer></script></head><body>${header(current)}<main id="main">${body}</main>${footer()}</body></html>`
}

function bookCard(b, heading = "h3") {
  const key = b.short.toLowerCase()
  return `<article class="book-card"><a href="/books/${b.slug}" aria-label="Explore ${b.title}"><div class="book-art ${key}"><img src="/assets/${key}-cover.webp" width="225" height="315" alt="${b.title} floral PDF cover" loading="lazy"></div></a><div class="book-topline"><span>${b.label}</span><span>Digital edition</span></div><a class="book-title" href="/books/${b.slug}"><${heading}>${b.title}</${heading}><span aria-hidden="true">↗</span></a><p class="book-description">${b.description}</p><div class="book-meta"><span>${b.pages}-page PDF</span><span>${b.prompts} connected prompts</span><span>One-time purchase</span></div><div class="book-bottom"><span class="price">$19.99 <small>USD</small></span><a class="text-link" href="/books/${b.slug}">Meet the book <span aria-hidden="true">↗</span></a></div></article>`
}

function choice() {
  return `<div class="choice"><div><h3>Where are you stuck?</h3></div><div class="choice-buttons"><button type="button" class="choice-button" data-choice="day" aria-pressed="false">“My day gets away from me.” <span aria-hidden="true">↗</span></button><button type="button" class="choice-button" data-choice="focus" aria-pressed="false">“I know what to do. I just can’t start.” <span aria-hidden="true">↗</span></button></div><div class="recommendation" data-recommendation aria-live="polite" hidden></div></div>`
}

function faqList(items = faq) {
  return items.map(([q, a]) => `<details><summary>${q}</summary><div>${a}</div></details>`).join("")
}

function sampleCard(b, hidden = false, heading = "h3") {
  const key = b.short.toLowerCase()
  return `<article class="sample-card" id="sample-${key}"${hidden ? " hidden" : ""}><span class="eyebrow">FROM ${b.title.toUpperCase()} · PROMPT 1.1</span><${heading}>${b.sample}</${heading}><p class="sample-note">${b.sampleDescription}</p><pre id="prompt-${key}" tabindex="0" aria-label="${b.sample} prompt text">${esc(samples[key])}</pre><div class="copy-row"><button type="button" data-copy="prompt-${key}">Copy the prompt</button><span role="status" aria-live="polite"></span></div><p class="sample-note">Replace the brackets with your details. Paste into your AI chat. Your input stays in the tool you choose.</p></article>`
}

function sampleSection(mainHeading = false) {
  return `<section class="section" id="sample"><div class="container sample-grid"><div class="sample-intro"><${mainHeading ? "h1" : "h2"}>Try one.</${mainHeading ? "h1" : "h2"}><div class="sample-tabs" aria-label="Choose a sample prompt"><button type="button" data-sample-tab="sample-day" aria-pressed="true">Plan your day</button><button type="button" data-sample-tab="sample-focus" aria-pressed="false">Get started</button></div><div class="mini-features"><div><span aria-hidden="true">✳</span>A clear role, useful context, and a specific result.</div><div><span aria-hidden="true">✳</span>Space for your real life, including the messy parts.</div><div><span aria-hidden="true">✳</span>Every book adds explanations, tips, and worked examples.</div></div><p class="sample-note">AI can get things wrong. Use your own judgment, and leave confidential information out of your chat.</p></div><div>${sampleCard(books[0], false, mainHeading ? "h2" : "h3")}${sampleCard(books[1], true, mainHeading ? "h2" : "h3")}</div></div></section>`
}

function closing() {
  return `<section class="closing"><div class="container"><div><h2>A page. A prompt.<br>A place to begin.</h2></div><a class="button" href="/books">Explore the books <span aria-hidden="true">↗</span></a></div></section>`
}

const home = `<div class="container"><section class="hero"><div class="hero-copy"><h1>Fewer prompts,<br><em>written<br>properly.</em></h1><div class="hero-footnote"><span class="edition-number" aria-hidden="true">P / 01</span><p>AI prompt books for clearer days<br>and work that actually gets done.</p></div><div class="actions"><a class="button" href="/books">Find your book <span aria-hidden="true">↗</span></a><a class="text-link" href="#sample">Try a free prompt <span aria-hidden="true">↓</span></a></div><p class="micro">PDF editions · From $19.99</p></div><div class="hero-visual"><img src="/assets/hero-day.webp" width="1122" height="1402" alt="The Deliberate Day, shown as a black book against vintage botanical prints" fetchpriority="high"><div class="photo-caption"><span>The Deliberate Day</span><span>A digital book, thoughtfully made.</span></div></div></section></div>
<div class="compatibility"><div class="container"><p>Made for the AI you already use.</p><div class="model-list"><span>ChatGPT</span><span>Claude</span><span>Gemini</span></div><p>No new app. No learning curve.</p></div></div>
<section class="section" id="books"><div class="container"><div class="section-heading"><div><h2>The books.</h2></div><p class="collection-index">01 / 02 &nbsp; · &nbsp; The Deliberate Collection</p></div><div class="books-grid">${books.map(b => bookCard(b)).join("")}</div>${choice()}</div></section>
<section class="section dark-section" id="how-it-works"><div class="container how-grid"><div class="how-intro"><h2>Copy.<br>Paste.<br><em>Think it through.</em></h2></div><div class="steps"><div class="step"><span class="step-number">01</span><div><h3>Choose what you need today.</h3><p>Open your PDF and find the prompt that fits. You can start anywhere; there’s no course to finish first.</p></div></div><div class="step"><span class="step-number">02</span><div><h3>Copy, paste, make it yours.</h3><p>Paste into ChatGPT, Claude, or Gemini. Replace the brackets with your tasks, your time, and your situation.</p></div></div><div class="step"><span class="step-number">03</span><div><h3>Have a more useful conversation.</h3><p>Answer a few questions. Refine the response. Leave with a next step that makes sense for your actual life.</p></div></div></div></div></section>
${sampleSection()}
<section class="about-strip"><div class="container"><img src="/assets/brand-mark.webp" alt="" width="100" height="100" loading="lazy"><div><h2>Good questions.<br>Better conversations.</h2></div><div class="about-copy"><p>We’re a small publishing house making useful books for working with AI. Clear prompts, considered explanations, and examples you can actually follow.</p><a class="text-link" href="/about">A little about us <span aria-hidden="true">↗</span></a></div></div></section>
<section class="section"><div class="container faq-grid"><div class="faq-intro"><h2>Questions?</h2><a class="text-link" href="/help">More help <span aria-hidden="true">↗</span></a></div><div>${faqList(faq.slice(0, 4))}</div></div></section>${closing()}`

const catalog = `<section class="section"><div class="container"><div class="section-heading"><div><h1>The books.</h1></div><p class="collection-index">01 / 02 &nbsp; · &nbsp; PDF editions</p></div><div class="books-grid">${books.map(b => bookCard(b, "h2")).join("")}</div>${choice()}</div></section><div class="compatibility"><div class="container"><p>Copy. Paste. Make it yours.</p><div class="model-list"><span>ChatGPT</span><span>Claude</span><span>Gemini</span></div><p>One-time purchase. Instant PDF download.</p></div></div><section class="section"><div class="container faq-grid"><div class="faq-intro"><h2>Before you buy.</h2></div><div>${faqList(faq.slice(0, 4))}</div></div></section>`

function productPage(b) {
  const key = b.short.toLowerCase()
  return `<div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/books">The books</a><span aria-hidden="true">/</span>${b.title}</nav><section class="product-hero"><div class="book-art ${key}"><img src="/assets/${key}-cover.webp" width="295" height="413" alt="${b.title} floral PDF cover" fetchpriority="high"></div><div class="product-copy"><span class="eyebrow">THE DELIBERATE COLLECTION · DIGITAL EDITION</span><h1>${b.title}</h1><p class="lead">${b.intro}</p><span class="price">$19.99 <small>USD · one-time purchase</small></span><a class="button" href="https://promptugraphy.gumroad.com/l/${b.slug}">Get the book on Gumroad <span aria-hidden="true">↗</span></a><p class="buy-note">Checkout and PDF delivery are handled by Gumroad. Any applicable tax is shown at checkout. This is a digital book; no physical item is shipped.</p><div class="book-meta"><span>${b.pages}-page PDF</span><span>${b.prompts} connected prompts</span><span>Instant download after purchase</span><span>Personal-use license</span></div></div></section></div>
  <section class="section included"><div class="container contents-grid"><div><h2>${b.headline}</h2><p class="lead">${b.fit} Every prompt includes the ready-to-copy text, an explanation, model tips, and a worked example.</p></div><div>${b.contents.map(([title, description], i) => `<div class="chapter"><span>${String(i + 1).padStart(2, "0")}</span><div><h3>${title}</h3><p>${description}</p></div></div>`).join("")}</div></div></section>
  <section class="product-preview"><div class="container"><img src="/assets/${key}-page.webp" width="488" height="610" loading="lazy" alt="A real interior page from ${b.title}, shown within its listing artwork"><div><h2>See the page.<br>Try the <em>prompt.</em></h2><p>Designed to be read, copied, and returned to. The sample below is the first prompt from ${b.title}. The full PDF adds the surrounding explanations and worked examples.</p><a class="text-link" href="#book-sample">Try this book’s sample <span aria-hidden="true">↓</span></a></div></div></section>
  <section class="section" id="book-sample"><div class="container sample-grid"><div class="sample-intro"><h2>Meet ${b.sample === "The Cold Start" ? "The Cold<br><em>Start.</em>" : "your Morning<br><em>Chief of Staff.</em>"}</h2><p>${b.sampleDescription} Copy the prompt, fill in the brackets, and paste it into your AI chat.</p><p class="sample-note">No sign-up required. Avoid pasting private or sensitive information into AI tools, and check the results yourself.</p></div>${sampleCard(b)}</div></section>
  <section class="section dark-section"><div class="container closing-inner"><h2>${b.title}.<br>A place to <em>begin.</em></h2><div class="actions"><a class="button light" href="https://promptugraphy.gumroad.com/l/${b.slug}">Get the PDF · $19.99 <span aria-hidden="true">↗</span></a><a class="text-link" href="/books">Compare the books <span aria-hidden="true">↗</span></a></div><p class="sample-note">Educational content. Results vary. Not professional medical, psychological, legal, or financial advice.</p></div></section>`
}

const about = `<section class="container story-hero"><div><h1>Fewer prompts.<br>More <em>thought.</em></h1><p>AI can help with a crowded day, an empty page, or a task you keep putting off. But a vague question often leads to a vague answer.</p><p>Promptugraphy makes thoughtfully written PDF books that give those conversations a little more shape. Useful context. Clear instructions. Room for the AI to ask questions and push back when a plan doesn’t fit.</p><p>Our aim is simple: fewer prompts, written properly.</p></div><img src="/assets/hero-day.webp" alt="The Deliberate Day against a wall of vintage botanical prints" width="1122" height="1402"></section><div class="container story-values"><div><h3>A system you can return to.</h3><p>The prompts are written to work together, while still being useful on their own. Pick the one that helps today. Come back when the problem changes.</p></div><div><h3>More than a line to paste.</h3><p>Each prompt comes with an explanation, model tips, and a worked example. You can see the intended shape of the conversation before trying it yourself.</p></div><div><h3>Your judgment stays yours.</h3><p>AI is a tool for thinking and drafting. Check its answers, change what doesn’t fit, and keep the choices that matter in your own hands.</p></div></div>${closing()}`

const help = `<section class="section"><div class="container faq-grid"><div class="faq-intro"><h1>A little help.</h1><a class="text-link" href="mailto:hello@promptugraphy.com">hello@promptugraphy.com <span aria-hidden="true">↗</span></a><p>For purchase help, include your book title and Gumroad order reference. Never send passwords or card details.</p></div><div>${faqList()}</div></div></section>${closing()}`

const privacy = `<div class="container"><article class="prose"><span class="eyebrow">LAST UPDATED · NOVEMBER 3, 2026</span><h1>Privacy.</h1><p>This notice describes the Promptugraphy public website. Purchases are handled on Gumroad under Gumroad’s own privacy notice and terms.</p><h2>Browsing this website</h2><p>This site does not include advertising pixels, analytics scripts, customer accounts, or newsletter forms. The prompt samples and book recommendations run in your browser. We do not receive the details you add to a prompt or the AI conversations you have elsewhere.</p><p>Vercel hosts the website and may process standard request information such as IP address, browser details, and requested URLs to serve and protect it. Fonts are loaded from Google Fonts; your browser connects to Google to request them.</p><h2>When you buy a book</h2><p>Purchase links take you to Gumroad. Gumroad handles checkout, payment details, receipts, and download access. As the seller, Promptugraphy may receive order information through Gumroad, such as your email address, purchased product, and order reference, to deliver and support your purchase.</p><h2>When you contact us</h2><p>If you email us, we receive your message and any information you include. We use it to respond and help with your question or order. Please do not send card numbers, passwords, or unnecessary sensitive information.</p><h2>Your choices</h2><p>You can browse and copy samples without signing up. You can contact <a href="mailto:hello@promptugraphy.com">hello@promptugraphy.com</a> with a privacy question or a request relating to information held by Promptugraphy. For information held by Gumroad or your chosen AI provider, contact that service.</p></article></div>`

const terms = `<div class="container"><article class="prose"><span class="eyebrow">LAST UPDATED · NOVEMBER 3, 2026</span><h1>Terms &amp; license.</h1><p>These terms describe the Promptugraphy website and its digital books. The full license inside your purchased book and any terms displayed at Gumroad checkout also apply.</p><h2>What you’re buying</h2><p>The Deliberate Day and The Deliberate Focus are PDF ebooks with AI prompts and educational guidance. They are not physical books, software, or subscriptions. Purchases and file delivery are handled by Gumroad. Prices are shown in US dollars; checkout shows the final amount, including applicable taxes or currency conversion.</p><h2>Your personal license</h2><p>You may copy the prompts into your own AI tools and adapt them for your own work or business. You may not resell, redistribute, share, or republish the book or its prompts, in whole or in part. Buying a book does not transfer copyright.</p><h2>Using AI thoughtfully</h2><p>AI tools can produce inaccurate or unsuitable responses. You are responsible for reviewing results and deciding how to use them. These books are educational products and do not provide medical, psychological, legal, or financial advice. Results depend on your situation, chosen tool, and how you use the prompts.</p><h2>Third-party tools</h2><p>ChatGPT, Claude, Gemini, and Gumroad are third-party services. Access, prices, features, privacy practices, and availability are controlled by their providers. Promptugraphy is an independent publisher and is not affiliated with or endorsed by those providers.</p><h2>Downloads, purchase help, and refunds</h2><p>Successful purchases provide PDF access through Gumroad. If a file is missing or will not open, contact <a href="mailto:hello@promptugraphy.com">hello@promptugraphy.com</a> with your book title and order reference. Refund requests can be sent to the same address. The policy displayed at checkout and your applicable consumer rights govern your purchase. This website does not promise lifetime updates or guaranteed results.</p><h2>Questions</h2><p>For licensing or purchase questions, write to <a href="mailto:hello@promptugraphy.com">hello@promptugraphy.com</a>.</p></article></div>`

const pages = [
  { pathname: "/", title: "Fewer prompts, written properly", description: "Thoughtfully written AI prompt books for a clearer day and more focus. Explore PDF guides for ChatGPT, Claude and Gemini, and try a free prompt.", body: home, schema: { "@context": "https://schema.org", "@type": "Organization", name: "Promptugraphy", url: baseUrl, logo: `${baseUrl}/assets/brand-mark.webp`, email: "hello@promptugraphy.com" } },
  { pathname: "/books", title: "AI prompt books for your day and focus", description: "Compare The Deliberate Day and The Deliberate Focus. Thoughtful PDF prompt systems for ChatGPT, Claude and Gemini. $19.99 each, delivered by Gumroad.", body: catalog, current: "books" },
  { pathname: "/samples", title: "Try a free AI prompt", description: "Try a real prompt from The Deliberate Day or The Deliberate Focus. Copy it into ChatGPT, Claude or Gemini. No sign-up required.", body: sampleSection(true) + closing(), current: "samples" },
  { pathname: "/about", title: "Our story", description: "Promptugraphy is a small publishing house making thoughtfully written AI prompt systems as designed PDF books. Fewer prompts, written properly.", body: about, current: "about" },
  { pathname: "/help", title: "Buying, downloads and help", description: "Get help choosing a Promptugraphy book, buying through Gumroad, accessing your PDF, and using your prompts. Contact hello@promptugraphy.com.", body: help, current: "help", schema: { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([name, answer]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer.replace(/<[^>]*>/g, "") } })) } },
  { pathname: "/privacy", title: "Privacy", description: "How the Promptugraphy website, Gumroad purchases, and support messages use your information.", body: privacy },
  { pathname: "/terms", title: "Terms and personal-use license", description: "Learn what is included in a Promptugraphy digital book, how the personal license works, and where to get help with a purchase.", body: terms },
  ...books.map(b => ({ pathname: `/books/${b.slug}`, title: `${b.title}: AI prompts for ${b.short === "Day" ? "productivity" : "deep work"}`, description: b.seo, body: productPage(b), current: "product", schema: { "@context": "https://schema.org", "@type": "Product", name: b.title, description: b.seo, image: `${baseUrl}/assets/${b.short.toLowerCase()}-cover.webp`, brand: { "@type": "Brand", name: "Promptugraphy" }, offers: { "@type": "Offer", url: `https://promptugraphy.gumroad.com/l/${b.slug}`, price: "19.99", priceCurrency: "USD", availability: "https://schema.org/InStock" } } })),
]

await fs.mkdir(out, { recursive: true })
await fs.cp(path.join(root, "assets"), path.join(out, "assets"), { recursive: true })
for (const page of pages) {
  const file = page.pathname === "/" ? "index.html" : `${page.pathname.slice(1)}.html`
  await fs.mkdir(path.dirname(path.join(out, file)), { recursive: true })
  await fs.writeFile(path.join(out, file), layout(page))
}
await fs.writeFile(path.join(out, "404.html"), layout({ title: "Page not found", description: "Find your way back to the Promptugraphy books.", pathname: "/404", body: '<div class="container not-found"><span class="eyebrow">A LITTLE DETOUR · 404</span><h1>Let’s turn<br>the <em>page.</em></h1><p>We couldn’t find that page. Your next chapter is still here.</p><a class="button" href="/books">Find your book ↗</a></div>' }).replace('<meta name="theme-color"', '<meta name="robots" content="noindex"><meta name="theme-color"'))
await fs.writeFile(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /404\nSitemap: ${baseUrl}/sitemap.xml\n`)
await fs.writeFile(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `<url><loc>${baseUrl}${page.pathname === "/" ? "" : page.pathname}</loc></url>`).join("")}</urlset>`)
console.log(`Built ${pages.length} pages, 404, robots.txt and sitemap.xml for ${baseUrl}`)
