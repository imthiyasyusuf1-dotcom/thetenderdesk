"""Crawl every internal page, href and asset from a base URL; report 404s and off-site links."""
import re, sys, urllib.request, urllib.parse, html

BASE = sys.argv[1].rstrip("/")
HOST = urllib.parse.urlparse(BASE).netloc
ALLOWED_EXT = ("fonts.googleapis.com", "fonts.gstatic.com", "www.find-tender.service.gov.uk", "images.unsplash.com",
               "maps.google.com", "crumbleandcodesserts.co.uk", "www.instagram.com", "commons.wikimedia.org",
               "upload.wikimedia.org", "thetenderdesk.co.uk")
seen, status, external, queue = set(), {}, set(), [BASE + "/"]
ATTR = re.compile(r'\b(href|src|content|poster|srcset)\s*=\s*"([^"]+)"', re.I)
CSSURL = re.compile(r'url\(["\']?([^"\')]+)')
JSIMP = re.compile(r'(?:import|from)\s+["\'](\.[^"\']+)["\']')

def fetch(u):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "td-crawl"}), timeout=20) as r:
            return r.status, r.headers.get("content-type", ""), r.read()
    except urllib.error.HTTPError as e:
        return e.code, "", b""

while queue:
    u = queue.pop()
    u = u.split("#")[0]
    if u in seen: continue
    seen.add(u)
    code, ctype, body = fetch(u)
    status[u] = code
    if code != 200: continue
    text = body.decode("utf-8", "ignore")
    refs = []
    if "html" in ctype:
        text = re.sub(r"<script>(?!.*?import).*?</script>", "", text, flags=re.S) if False else text
        for a, m in ATTR.findall(text):
            m = html.unescape(m).strip()
            if a.lower() == "content" and not m.startswith(("http", "/")): continue
            parts = m.split(",") if a.lower() == "srcset" else [m]
            refs += [x.strip().split(" ")[0] for x in parts]
    if "css" in ctype or "html" in ctype: refs += CSSURL.findall(text)
    if "javascript" in ctype: refs += JSIMP.findall(text)
    for r in refs:
        if not r or r.startswith(("mailto:", "tel:", "data:", "javascript:", "#", "${")) or "${" in r: continue
        if not re.match(r"^(https?:)?/|^\.|^[\w-]+[/.]", r): continue
        a = urllib.parse.urljoin(u, r)
        p = urllib.parse.urlparse(a)
        if p.scheme not in ("http", "https"): continue
        if p.netloc == HOST:
            queue.append(a)
        elif p.netloc == "thetenderdesk.co.uk" and HOST != "thetenderdesk.co.uk":
            queue.append(BASE + p.path)  # check canonical/OG targets exist locally
        else:
            external.add(p.netloc)

bad = {u: c for u, c in status.items() if c != 200}
print(f"checked {len(status)} internal URLs; failures: {len(bad)}")
for u, c in sorted(bad.items()): print("  ", c, u)
print("external hosts:", sorted(external))
print("unexpected external:", sorted(h for h in external if h not in ALLOWED_EXT))
