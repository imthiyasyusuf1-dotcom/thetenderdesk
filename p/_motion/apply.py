#!/usr/bin/env python3
"""Add the shared motion kit to /p/ mock-up pages (idempotent).
Usage: python3 p/_motion/apply.py <slug> [<slug> ...]   (all .html in each folder)
Never run on client sites (dorquip, freshspot) or pages that already load their own GSAP/Lenis."""
import pathlib, re, sys

V = "1"
SKIP = {"dorquip", "freshspot", "_motion"}
HEAD = ('<script>/*td-motion*/(function(h){if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&h.dataset.motion!=="off"){'
        'h.classList.add("m-on");setTimeout(function(){h.classList.add("m-ready")},2500)}})(document.documentElement)</script>\n'
        f'<link rel="stylesheet" href="/p/_motion/motion.css?v={V}">\n')
TAIL = ('<!--td-motion-->\n'
        '<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" integrity="sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt" crossorigin="anonymous" defer></script>\n'
        '<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" integrity="sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d" crossorigin="anonymous" defer></script>\n'
        '<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" integrity="sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed" crossorigin="anonymous" defer></script>\n'
        f'<script src="/p/_motion/motion.js?v={V}" defer></script>\n')


def snippet_head():
    return HEAD


def snippet_tail():
    return TAIL


def apply(path: pathlib.Path) -> str:
    s = path.read_text(encoding="utf-8")
    if "td-motion" in s:
        s = re.sub(r"motion\.(css|js)\?v=\d+", lambda m: f"motion.{m.group(1)}?v={V}", s)
        path.write_text(s, encoding="utf-8")
        return "updated"
    if re.search(r"gsap(\.min)?\.js|lenis(\.min)?\.js", s):
        return "skip (own gsap/lenis)"
    s = s.replace("</head>", HEAD + "</head>", 1)
    i = s.rfind("</body>")
    s = s[:i] + TAIL + s[i:]
    path.write_text(s, encoding="utf-8")
    return "added"


if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parent.parent
    for slug in sys.argv[1:]:
        if slug in SKIP:
            print(slug, "SKIP client/protected"); continue
        for f in sorted((root / slug).rglob("*.html")):
            print(f.relative_to(root), apply(f))
