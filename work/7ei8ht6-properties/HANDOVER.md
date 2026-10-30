# 7ei8ht6 Properties: moving the new site live on 7ei8ht6properties.com

The new site is plain static files (HTML, CSS, JS, images). It has no database, PHP or plugins. Copy the whole folder, **excluding** `build.py` and this file.

Files: `index.html`, `invest-in-dubai.html`, `services.html`, `areas.html`, `meet-the-team.html`, `contact.html`, `careers.html`, `404.html`, the three redirect stubs (`why-choose-us.html`, `tenants.html`, `landlords.html`), `style.css`, `app.js`, `favicon.svg`, `sitemap.xml`, `img/`.

## Before you start (both options)
1. In `build.py`, set `BASE = "https://7ei8ht6properties.com/"`. Then **remove** the `<meta name="robots" content="noindex">` line so Google indexes the site, and run `python3 build.py`.
2. Back up WordPress: in the hosting control panel (cPanel), download a full backup of `public_html` and export the database from phpMyAdmin (or use the UpdraftPlus plugin). Keep both files safe.
3. Write down the old WordPress URLs (for example `/about/`, `/contact-us/`, `/properties/`) so you can redirect them.

## Option A: the existing host (cPanel `public_html`)
1. In File Manager, create `public_html/_wp_old/` and move every WordPress file into it. If the host allows it, it's cleaner to move them outside `public_html` altogether.
2. Upload the new files straight into `public_html/`.
3. Add a `.htaccess` in `public_html/`:
   ```
   ErrorDocument 404 /404.html
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   Redirect 301 /about/ /index.html
   Redirect 301 /contact-us/ /contact.html
   Redirect 301 /properties/ https://www.bayut.com/companies/7ei8ht6-properties-llc-8883/
   Redirect 301 /tenants/ /services.html
   Redirect 301 /landlords/ /services.html
   <IfModule mod_expires.c>
   ExpiresActive On
   ExpiresByType image/webp "access plus 1 year"
   ExpiresByType text/css "access plus 1 month"
   ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```
4. Rollback: delete the new files and move `_wp_old/*` back.

## Option B: Netlify or Cloudflare Pages, plus DNS
1. **Netlify**: go to app.netlify.com, choose Add site, then Deploy manually, and drag the folder in. **Cloudflare Pages**: choose Create project, then Direct upload.
2. Add the custom domain `7ei8ht6properties.com` and `www`.
3. DNS: wherever the domain's nameservers are, set these records:
   * Netlify: `A @ 75.2.60.5` and `CNAME www <site>.netlify.app`
   * Cloudflare: point the nameservers to Cloudflare, or add `CNAME www <project>.pages.dev` and flatten `@`
4. **Leave the MX and email records exactly as they are**, so info@ email keeps working.
5. Redirects: create a `_redirects` file, for example `/about/ /why-choose-us.html 301`.
6. HTTPS is issued automatically (Let's Encrypt) within minutes of DNS resolving.

## Fixing the expired SSL certificate
The current site shows a certificate error in browsers, which is why visitors see a "Not secure" warning.
* **Option A**: in cPanel go to **SSL/TLS Status**, select the domain and `www`, then click **Run AutoSSL**. If AutoSSL isn't offered, use **Let's Encrypt SSL** (or ask the host to reissue it). Then confirm the new expiry date and keep the HTTPS redirect in `.htaccess` above.
* **Option B**: the platform issues and renews the certificate automatically. Nothing to buy.
* To check it's fixed, open https://7ei8ht6properties.com with no warning, or run `curl -I https://7ei8ht6properties.com` and look for a 200 response with no certificate error.

## After going live
* Test the consultation form on contact.html (five steps). They open the visitor's email app addressed to info@7ei8ht6properties.com.
* Submit `https://7ei8ht6properties.com/sitemap.xml` in Google Search Console.
* To edit the team or copy, change `build.py`, run `python3 build.py`, then upload again.

Designed & built by The Tender Desk, https://thetenderdesk.co.uk


## Version 4: the investor edition (what changed)
* Repositioned as a private property advisory for international buyers: Invest in Dubai, Services, Areas, The Team, Private Consultation.
* Old pages `why-choose-us`, `tenants`, `landlords` now forward to the new pages. The v3 build is kept at `~/Projects/7ei8ht6-properties-v3/`.
* Type: Bodoni Moda (display), Manrope (text), Amiri (Arabic). Palette: ink, sand, champagne gold. The logo is tinted gold with a CSS mask.
* EN / عربي toggle swaps the key headings only; body copy stays English. **Have a native Arabic speaker check the Arabic headings and tagline (شخصي وحصري, "Personal & Exclusive") before launch.**
* Performance: desktop uses Lenis, a light heat-haze WebGL shader over the hero photograph, parallax and a WebGL page wipe. Touch devices get native scroll, no WebGL, no parallax, a CSS wipe and a sticky WhatsApp / Enquire bar. DPR is capped at 1.25.
* Measured (headless Chrome, scripted scroll with a rAF recorder): desktop 1440x900 averages 57.6 to 60 fps per page; mobile 390x844, DPR 3, touch, 4x CPU throttle, 59.1 to 60 fps. No long tasks over 50 ms, no console errors, no horizontal overflow. QA script: `~/Projects/7ei8ht6-properties-shots/qa.mjs`.
* Company numbers used only where they come from the old site: "over 2,000 properties rented and sold in the UAE", the team of 33, RERA 12322. No yields, awards, reviews or deal volumes are claimed.

## Facts on the Invest in Dubai page, with sources (checked September 2026)
| Claim | Source |
|---|---|
| The UAE does not levy income tax on individuals; VAT is 5%; corporate tax applies to businesses | UAE Government portal, Taxation: https://u.ae/en/information-and-services/finance-and-investment/taxation |
| Golden Visa for real estate investors: minimum capital AED 2 million, 5 years, renewable, no sponsor, family can be sponsored | UAE Government portal, Golden visa (updated 28 Jul 2026): https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa |
| Foreign ownership in Dubai permitted in designated freehold areas (Regulation No. 3 of 2006); title deeds issued by the Land Department | UAE Government portal, Expatriates buying a property: https://u.ae/en/information-and-services/moving-to-the-uae/expatriates-buying-a-property-in-the-uae |
| DLD transfer fee of 4% (raised from 2% in 2013) | Wikipedia, Economy of Dubai, citing Bayut news (archived): https://en.wikipedia.org/wiki/Economy_of_Dubai . **Secondary source; confirm the current fee schedule with the DLD (dubailand.gov.ae) before launch.** |
| RERA, part of the DLD, licenses brokers and manages developers' trust (escrow) accounts | Wikipedia, Real Estate Regulatory Agency: https://en.wikipedia.org/wiki/Dubai_Real_Estate_Regulatory_Agency . Law No. 8 of 2007 (escrow accounts) is the underlying law; dubailand.gov.ae was not machine-readable when checked. |

Area copy uses only widely known facts (Burj Khalifa, The Dubai Mall, Marina Walk, JBR, Atlantis, Dubai Water Canal, the Dubai Hills 18-hole course, Mushrif Park, Mirdif City Centre). Languages spoken are not listed because the old site does not state them.

## Photography credits
Unsplash and Pexels block automated downloads, so every photo came from Wikimedia Commons (several are Unsplash/Pexels uploads released under CC0). Converted to WebP at 2200 px and 900 px. CC BY and CC BY-SA images need the credit to stay somewhere public: keep this table, or add a Credits line to the footer on the live domain.

| File | Original | Author | Licence | Page |
|---|---|---|---|---|
| `img/x-hero.webp` (+ `-m`) | Dubai skyline unsplash.jpg | Robert Bock | CC0 | https://commons.wikimedia.org/wiki/File:Dubai_skyline_unsplash.jpg |
| `img/a-downtown.webp` (+ `-m`) | View of Dubai (Unsplash Zf8fagTPYTo).jpg | Robert Bock | CC0 | https://commons.wikimedia.org/wiki/File:View_of_Dubai_(Unsplash_Zf8fagTPYTo).jpg |
| `img/a-marina.webp` (+ `-m`) | Dubai Marina Skyline.jpg | Norlando Pobre | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Dubai_Marina_Skyline.jpg |
| `img/a-palm.webp` (+ `-m`) | Vereinigte Arabische Emirate - Atlantis on Palm Jumeirah - أتلانتيس في نخلة جميرا - panoramio.jpg | giggel | CC BY 3.0 | https://commons.wikimedia.org/wiki/File:Vereinigte_Arabische_Emirate_-_Atlantis_on_Palm_Jumeirah_-_%D8%A3%D8%AA%D9%84%D8%A7%D9%86%D8%AA%D9%8A%D8%B3_%D9%81%D9%8A_%D9%86%D8%AE%D9%84%D8%A9_%D8%AC%D9%85%D9%8A%D8%B1%D8%A7_-_panoramio.jpg |
| `img/a-bbay.webp` (+ `-m`) | Dubai Water Canal Business Bay.jpg | Iwona Rege | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Dubai_Water_Canal_Business_Bay.jpg |
| `img/a-hills.webp` (+ `-m`) | Emirates Hills Montgomerie Lakeside.jpg | Sev6nWiki | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Emirates_Hills_Montgomerie_Lakeside.jpg |
| `img/a-mirdif.webp` (+ `-m`) | Mushrif park, Dubai city, UAE.jpg | Tashmetova808 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Mushrif_park,_Dubai_city,_UAE.jpg |
| `img/x-sunrise.webp` (+ `-m`) | Dubai at sunrise (Unsplash).jpg | Piotr Chrobot chrumo | CC0 | https://commons.wikimedia.org/wiki/File:Dubai_at_sunrise_(Unsplash).jpg |
| `img/x-dunes.webp` (+ `-m`) | Sunset captured on Dubai Dunes (Wide Angle).jpg | iMahesh | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sunset_captured_on_Dubai_Dunes_(Wide_Angle).jpg |
| `img/x-lake.webp` (+ `-m`) | Boat on the Burj Khalifa Lake at night.jpg | Aleksandar Pasaric | CC0 | https://commons.wikimedia.org/wiki/File:Boat_on_the_Burj_Khalifa_Lake_at_night.jpg |
| `img/x-night.webp` (+ `-m`) | Dubai Night Time (Pexels-804915).jpg | Zaib Azhar | CC0 | https://commons.wikimedia.org/wiki/File:Dubai_Night_Time_(Pexels-804915).jpg |

Existing property photos (`h2`, `h3`, `h4`, `banner`) and team portraits come from the old 7ei8ht6 site.
