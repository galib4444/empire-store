import http from "node:http"
import fs from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../dist")
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain" }
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname)
    let file = path.resolve(root, `.${pathname}`)
    if (!file.startsWith(root + path.sep) && file !== root) throw new Error("Invalid path")
    if (!path.extname(file)) file = file === root ? path.join(root, "index.html") : `${file}.html`
    const data = await fs.readFile(file)
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" })
    res.end(data)
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
    res.end(await fs.readFile(path.join(root, "404.html")))
  }
}).listen(4187, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4187"))
