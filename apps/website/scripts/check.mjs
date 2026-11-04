import fs from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

const root = path.resolve(import.meta.dirname, "../dist")
const walk = async dir => (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat()
const files = await walk(root)
const htmlFiles = files.filter(file => file.endsWith(".html"))
let links = 0
for (const file of htmlFiles) {
  const html = await fs.readFile(file, "utf8")
  const name = path.relative(root, file)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${name}: expected one main heading`)
  assert.ok(html.includes('<html lang="en">'), `${name}: missing language`)
  assert.ok(html.includes('<meta name="description"'), `${name}: missing description`)
  assert.ok(!html.includes("—"), `${name}: contains an em dash`)
  assert.ok(!/localhost|127\.0\.0\.1|\[YOUR NAME|TODO|undefined/.test(html), `${name}: placeholder or local URL`)
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
  assert.equal(new Set(ids).size, ids.length, `${name}: duplicate IDs`)
  for (const [, src] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(src)) continue
    const parsed = new URL(src, "https://promptugraphy.local")
    const urlPath = src.startsWith("#") ? "" : parsed.pathname
    const hash = decodeURIComponent(parsed.hash.slice(1))
    const target = !urlPath ? file : path.join(root, urlPath === "/" ? "index.html" : path.extname(urlPath) ? urlPath : `${urlPath}.html`)
    await fs.access(target).catch(() => assert.fail(`${name}: broken link ${src}`))
    if (hash) {
      const targetHtml = target === file ? html : await fs.readFile(target, "utf8")
      assert.ok(targetHtml.includes(`id="${hash}"`), `${name}: missing anchor ${src}`)
    }
    links++
  }
  for (const [, source] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) JSON.parse(source)
}
assert.ok(files.every(file => !/\.(pdf|docx|env)$/i.test(file)), "Paid files or secrets must not be in the public output")
for (const slug of ["day", "focus"]) {
  const product = await fs.readFile(path.join(root, `books/deliberate-${slug}.html`), "utf8")
  assert.ok(product.includes(`https://promptugraphy.gumroad.com/l/deliberate-${slug}`), "Missing purchase destination")
}
console.log(`Checked ${htmlFiles.length} pages and ${links} local links/assets; metadata, schemas, anchors, purchase destinations, and private-file boundary pass.`)
