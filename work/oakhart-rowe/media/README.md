# Hero media slot

Files go in this folder. Once they are here, set `data-on="1"` on `.hero-media` in index.html.
The SVG/CSS scroll animation stays on top, so a dark scene under a shade works best.

| File | Size | Used on |
|---|---|---|
| hero-portrait.mp4 | 1080x1920 (9:16), H.264, muted loop, under 4 MB | phones / portrait |
| hero-portrait.jpg | 1080x1920 poster (first frame) | poster + reduced motion |
| hero-landscape.mp4 | 1920x1080 (16:9), H.264, muted loop, under 6 MB | desktop / landscape |
| hero-landscape.jpg | 1920x1080 poster | poster + reduced motion |

A still only: add the .jpg files and skip the .mp4 files. The loader falls back to the still.
