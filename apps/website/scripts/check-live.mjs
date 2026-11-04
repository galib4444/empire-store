import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"

const origin = process.argv[2] || "https://promptugraphy.com"
const root = path.resolve(import.meta.dirname, "..")
const sitemap = await fs.readFile(path.join(root, "dist/sitemap.xml"), "utf8")
const config = JSON.parse(await fs.readFile(path.join(root, "seo.config.json"), "utf8"))
const pagePaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname)
const paths = [...pagePaths, "/robots.txt", "/sitemap.xml", `/${config.indexNowKey}.txt`, "/assets/site.js", "/assets/site.css", "/assets/social.jpg", "/assets/day-social.jpg", "/assets/focus-social.jpg", "/assets/day-video-poster.jpg", "/assets/focus-video-poster.jpg"]
await Promise.all(paths.map(async path => {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200, `${path}: ${response.status}`)
  assert.equal(response.headers.get("x-content-type-options"), "nosniff", `${path}: missing response headers`)
  if (response.headers.get("content-type")?.includes("text/html")) {
    const html = await response.text()
    assert.ok(html.includes("Promptugraphy"), `${path}: incorrect website`)
    assert.ok(!html.includes("Authentication Required"), `${path}: visitors cannot access site`)
    assert.ok(html.includes(`rel="canonical" href="https://promptugraphy.com${path === "/" ? "" : path}"`), `${path}: wrong canonical domain`)
    assert.ok(html.includes('"@graph"'), `${path}: structured data missing`)
  } else await response.body?.cancel()
}))
await Promise.all(["day", "focus"].map(async book => {
  const response = await fetch(`${origin}/assets/${book}-preview.mp4`, { headers: { Range: "bytes=0-1023" }, signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 206, `${book}: video range requests must work`)
  assert.ok(response.headers.get("content-type")?.startsWith("video/mp4"))
  assert.equal((await response.arrayBuffer()).byteLength, 1024)
}))
const missing = await fetch(`${origin}/this-page-does-not-exist`, { signal: AbortSignal.timeout(15000) })
assert.equal(missing.status, 404)
assert.ok((await missing.text()).includes("Let’s turn"), "Custom 404 is missing")
for (const host of ["https://www.promptugraphy.com", "https://promptugraphy.vercel.app"]) {
  const response = await fetch(`${host}/guides/ai-daily-planning-prompt`, { redirect: "manual", signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 308, `${host}: missing permanent canonical redirect`)
  assert.equal(response.headers.get("location"), "https://promptugraphy.com/guides/ai-daily-planning-prompt")
  await response.body?.cancel()
}
for (const agent of ["Googlebot", "bingbot", "OAI-SearchBot"]) {
  const response = await fetch(`${origin}/guides/ai-daily-planning-prompt`, { headers: { "User-Agent": agent }, signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200, `${agent}: page access failed`)
  assert.ok((await response.text()).includes("You are my Chief of Staff"), `${agent}: primary content needs JavaScript`)
}
console.log(`${paths.length} live pages/assets pass. Canonical redirects, static content with search crawler user agents, video byte ranges, public access, and custom 404 verified at ${origin}.`)
