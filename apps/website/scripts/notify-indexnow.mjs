import fs from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

const root = path.resolve(import.meta.dirname, "..")
const seo = JSON.parse(await fs.readFile(path.join(root, "seo.config.json"), "utf8"))
const sitemap = await fs.readFile(path.join(root, "dist/sitemap.xml"), "utf8")
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll("&amp;", "&"))
assert.ok(urls.length > 0 && urls.length <= 10000)
const origin = new URL(urls[0]).origin
assert.equal(origin, "https://promptugraphy.com")
assert.ok(urls.every(url => new URL(url).origin === origin))
const keyLocation = `${origin}/${seo.indexNowKey}.txt`
const keyFile = await fetch(keyLocation, { signal: AbortSignal.timeout(15000) })
assert.equal(keyFile.status, 200, "Publish the verification file before notifying IndexNow")
assert.equal((await keyFile.text()).trim(), seo.indexNowKey)
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(origin).hostname, key: seo.indexNowKey, keyLocation, urlList: urls }),
  signal: AbortSignal.timeout(30000),
})
const detail = (await response.text()).slice(0, 500)
assert.ok([200, 202].includes(response.status), `IndexNow returned ${response.status}: ${detail}`)
console.log(JSON.stringify({ submittedAt: new Date().toISOString(), host: new URL(origin).hostname, submittedUrls: urls.length, status: response.status, meaning: response.status === 200 ? "Submission received; indexing is not guaranteed" : "Submission received; key validation is pending" }, null, 2))
