import assert from "node:assert/strict"

const origin = process.argv[2] || "https://promptugraphy.vercel.app"
const paths = ["/", "/books", "/books/deliberate-day", "/books/deliberate-focus", "/samples", "/about", "/help", "/privacy", "/terms", "/robots.txt", "/sitemap.xml", "/assets/site.js", "/assets/site.css", "/assets/social.jpg"]
await Promise.all(paths.map(async path => {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200, `${path}: ${response.status}`)
  assert.equal(response.headers.get("x-content-type-options"), "nosniff", `${path}: missing response headers`)
  if (response.headers.get("content-type")?.includes("text/html")) {
    const html = await response.text()
    assert.ok(html.includes("Promptugraphy"), `${path}: incorrect website`)
    assert.ok(!html.includes("Authentication Required"), `${path}: visitors cannot access site`)
  }
}))
const missing = await fetch(`${origin}/this-page-does-not-exist`, { signal: AbortSignal.timeout(15000) })
assert.equal(missing.status, 404)
assert.ok((await missing.text()).includes("Let’s turn"), "Custom 404 is missing")
console.log(`${paths.length} deployed routes/assets returned 200 with expected headers. Public access and custom 404 verified at ${origin}.`)
