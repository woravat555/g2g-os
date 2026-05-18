# G2G OS · Master Hub

ศูนย์บัญชาการกลาง G2G (Gov2Global) · บริหาร 7 verticals · AI Teams · LINE OA Network

**Live:** https://g2g-os.fly.dev (after first deploy)
**Stack:** static HTML · nginx:alpine · Fly.io sin region · GitHub Actions
**Pattern:** mirrors [NK Law](https://nklaw-os.fly.dev) proven template (40 pages production)

---

## Structure (15 หน้า)

```
src/
├── index.html                     · Hero + 8 portals
├── about.html                     · ภารกิจ · วิสัยทัศน์ · timeline
├── internal-os.html               · Staff + AI Team + Iron Rules
├── team.html                      · CEO + Executive + AI Team
├── news.html                      · ข่าวสาร · 6 entries
├── contact.html                   · 4 channels + form
├── careers.html                   · 4 ตำแหน่งเปิดรับ
├── privacy.html                   · PDPA compliant
├── verticals/
│   ├── agritech.html              · A · 9 AI Agents
│   ├── phat-plat.html             · B · 36 Hero Apps
│   ├── imperial-fruitia.html      · C · Sapphire Valley
│   ├── aim-clinic.html            · D · LIVE link out
│   ├── le-phaya.html              · E · LIVE link out
│   ├── corporate-holding.html     · F · Org structure
│   └── nk-law.html                · + sibling brand link
└── components/
    ├── _tokens.css                · Design system (royal navy + gold)
    └── _base.css                  · Utilities + shared nav/footer
```

## Design System

- **Palette:** royal navy `#0A1628` + champagne gold `#C9A961` (inherited from NK Law, swapped maroon→navy)
- **Fonts:** Cormorant Garamond (display) + Inter (body) + Sarabun (Thai)
- **Spacing:** 4px base · 12 steps
- **Radius:** max 12px (no pills except badges)
- **Components:** `.btn` `.card` `.badge` `.g2g-nav` `.g2g-foot` `.section-hero`

## Local Preview

```bash
cd src
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

See [DEPLOY.md](./DEPLOY.md) for step-by-step CEO instructions (5 commands · ~10 min).

## Verticals integrated

| # | Vertical | Status | URL |
|---|----------|--------|-----|
| A | AgriTech Marketplace | Skeleton | `/verticals/agritech.html` |
| B | PHAT/PLAT Super-App | Skeleton + link | `phat-token-mesh-staging.fly.dev` |
| C | Imperial Fruitia + Sapphire Valley | Skeleton | `/verticals/imperial-fruitia.html` |
| D | AIM Clinic | LIVE | `g2g-ai-os.fly.dev` |
| E | Le Phaya Jewelry | LIVE | `lephaya-demo.fly.dev` |
| F | Corporate Holding | Skeleton | `/verticals/corporate-holding.html` |
| G | Internal OS | Skeleton | `/internal-os.html` |
| + | NK Law (sibling) | LIVE | `nklaw-os.fly.dev` |

---

*Built 18 พ.ค. 2026 · v0.1 skeleton · 1-2 hr sprint · CEO Woravat*
