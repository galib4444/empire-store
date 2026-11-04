"""Check generated search metadata against the actual public pages and files."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
from datetime import date
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
CONFIG = json.loads((ROOT / "seo.config.json").read_text())
ORIGIN = "https://promptugraphy.com"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta, self.canonicals, self.graphs, self.text, self.images = {}, [], [], [], []
        self.json_script, self.buffer = False, []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            key = attrs.get("name", attrs.get("property"))
            assert key not in self.meta, f"Duplicate metadata: {key}"
            self.meta[key] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs["href"])
        if tag == "meta" and attrs.get("property") in ("og:image", "twitter:image"):
            self.images.append(attrs["content"])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.json_script, self.buffer = True, []

    def handle_data(self, data):
        if self.json_script:
            self.buffer.append(data)
        else:
            self.text.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.json_script:
            self.graphs.append(json.loads("".join(self.buffer)))
            self.json_script = False


def objects(value):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from objects(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from objects(nested)


def file_for(url):
    parsed = urlparse(url)
    assert f"{parsed.scheme}://{parsed.netloc}" == ORIGIN, f"Non-canonical URL: {url}"
    relative = unquote(parsed.path).lstrip("/")
    return OUT / (relative if Path(relative).suffix else f"{relative}.html" if relative else "index.html")


pages, descriptions = {}, set()
for file in OUT.rglob("*.html"):
    parsed = Page(file.read_text())
    assert len(parsed.canonicals) == 1, f"{file.name}: missing or duplicate canonical"
    canonical = parsed.canonicals[0]
    assert file_for(canonical) == file, f"Canonical mismatch: {file} -> {canonical}"
    assert parsed.meta.get("og:url") == canonical
    assert parsed.meta.get("twitter:title")
    assert len(parsed.graphs) == 1
    if file.name == "404.html":
        assert "noindex" in parsed.meta["robots"]
        continue
    assert "noindex" not in parsed.meta["robots"], f"Unexpected noindex: {canonical}"
    assert "max-image-preview:large" in parsed.meta["robots"]
    assert parsed.meta["description"] not in descriptions, f"Duplicate description: {canonical}"
    descriptions.add(parsed.meta["description"])
    for image in parsed.images:
        assert file_for(image).is_file(), f"Missing sharing image: {image}"
    graph = parsed.graphs[0]
    assert graph["@context"] == "https://schema.org"
    nodes = graph["@graph"]
    definitions = {item["@id"] for item in objects(nodes) if "@id" in item and len(item) > 1}
    for item in objects(nodes):
        if "@id" in item:
            assert item["@id"] in definitions, f"Unresolved schema entity: {item['@id']}"
    text = " ".join(parsed.text)
    for node in nodes:
        if isinstance(node.get("@type"), list) and "Product" in node["@type"]:
            assert node["offers"]["price"] in text
            assert f"{node['numberOfPages']}-page PDF" in text
            assert node["bookFormat"] == "https://schema.org/EBook"
            assert node["offers"]["url"].startswith("https://promptugraphy.gumroad.com/l/")
            assert not any(key in node for key in ("aggregateRating", "review", "gtin", "isbn"))
        if node.get("@type") == "VideoObject":
            for key in ("thumbnailUrl", "contentUrl"):
                assert file_for(node[key]).is_file()
        if node.get("@type") == "Article":
            assert "Written and published by" in text
            assert date.fromisoformat(node["datePublished"]) <= date.fromisoformat(node["dateModified"]) <= date.fromisoformat(CONFIG["contentUpdated"])
    if CONFIG["googleSiteVerification"]:
        assert parsed.meta["google-site-verification"] == CONFIG["googleSiteVerification"]
    pages[canonical] = parsed

tree = ET.parse(OUT / "sitemap.xml")
namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "i": "http://www.google.com/schemas/sitemap-image/1.1", "v": "http://www.google.com/schemas/sitemap-video/1.1"}
urls = [item.text for item in tree.findall("s:url/s:loc", namespace)]
assert len(urls) == len(set(urls))
assert set(urls) == set(pages), "Sitemap does not match indexable pages"
for lastmod in tree.findall("s:url/s:lastmod", namespace):
    assert lastmod.text == CONFIG["contentUpdated"], "Sitemap dates should reflect content edits, not each rebuild"
assert len(tree.findall("s:url/v:video", namespace)) == 2
for media in tree.findall("s:url/i:image/i:loc", namespace) + tree.findall("s:url/v:video/v:content_loc", namespace):
    assert file_for(media.text).is_file()
robots = (OUT / "robots.txt").read_text()
assert f"Sitemap: {ORIGIN}/sitemap.xml" in robots
assert not re.search(r"Disallow:\s*/\s*$", robots, re.M)
assert (OUT / f"{CONFIG['indexNowKey']}.txt").read_text() == CONFIG["indexNowKey"]
print(f"SEO checks pass: {len(pages)} canonical pages, unique descriptions, connected schema entities, book facts, sharing images, media sitemap, crawler access, and IndexNow verification file.")
