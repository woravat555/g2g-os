# Anthropic Solution Partner · Application Package

**Applicant**: G2G AgriTech · Gov2Global Private Co., Ltd. (Thailand)
**Contact**: g2g@gov2global.com
**Apply at**: https://www.anthropic.com/partners

---

## 1 · Executive Summary

G2G AgriTech is a Thai private company building **two production AI platforms** powered by Claude, serving 4 active enterprise customers and rapidly scaling to consumer mass adoption.

**Live products today:**
- **PHAT** (g2g-os.fly.dev) — Thai-localized AI assistant via LINE OA + LIFF · targets 1K-10M citizens
- **PLAT** (g2g-platform.fly.dev) — Multi-vertical platform for farmers / buyers / students / teachers / parents · targets ministry pilots

**Why G2G fits Solution Partner**:
- Production deployment on Claude API (Haiku 4.5 + Sonnet 4.6)
- Multi-tenant architecture serving 4 enterprise clients
- Thai market specialist · PDPA-ready · LINE-native
- Aggressive scale plan (10K citizens in 30 days, 1M in 12 months)

---

## 2 · Customer Case Studies

### 2.1 · AIM Clinic
- **Vertical**: Healthcare · cosmetic clinic
- **Stack**: LINE OA + LIFF + Claude Sonnet
- **Use case**: 24/7 appointment booking, post-treatment care, voice memos (Niwat/Premwadee TTS)
- **Status**: Live · daily active patients
- **URL**: aim-clinic.g2g-os.fly.dev (via verticals page)

### 2.2 · NK Law
- **Vertical**: Legal firm
- **Stack**: Custom LIFF + Claude Sonnet + Drive integration
- **Use case**: AI legal consult, case tracking, document drafting, TOC budget tracking
- **Status**: Live · production · daily active lawyers

### 2.3 · Le Phaya Jewelry
- **Vertical**: Luxury retail · gem appraisal
- **Stack**: LIFF + Tier system + Personal memory per VIP client
- **Use case**: VIP client app, daily fortune, subscription tier, payment integration
- **Status**: Live · Enterprise tier

### 2.4 · G2G Citizen (PHAT)
- **Vertical**: B2C mass-market AI assistant
- **Stack**: LINE OA + LIFF + Apps Script + Claude Haiku 4.5
- **Use case**: AI for every Thai citizen · free Tier · viral referral · 50-token gift onboarding
- **Status**: Live · 8 pilot citizens · scaling to 10K in 30 days

---

## 3 · Technical Architecture

```
┌────────────────────────────────────────────────┐
│ PHAT · g2g-os.fly.dev                          │
├────────────────────────────────────────────────┤
│ Frontend: Static (nginx) + LIFF                │
│ Backend: Google Apps Script (4623 LOC)         │
│   ├─ 70+ endpoints                             │
│   ├─ R-DISCOVERY 6-tier profiling              │
│   ├─ Multi-AI consensus (Claude+GPT+Perplexity)│
│   └─ Google CSE 50 curated sites               │
│ AI Layer:                                      │
│   ├─ Claude Haiku 4.5 (LINE chat)              │
│   ├─ Claude Sonnet 4.6 (Pro tier)              │
│   └─ Tavily Search + Perplexity Sonar          │
│ Memory: Sheets + CacheService 60s TTL          │
│ Persona: 12 occupation-specific personas       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ PLAT · g2g-platform.fly.dev                    │
├────────────────────────────────────────────────┤
│ Frontend: 5 LIFF apps (a/b/s/t/p)              │
│ Backend: TypeScript Express + Inngest          │
│ Database: Supabase 28 tables · RLS             │
│ Edge Functions: 11 (advisor · order · weather) │
│ AI Layer: Claude API via Edge Functions        │
│ Auth: LINE Login OAuth                         │
└────────────────────────────────────────────────┘
```

---

## 4 · Claude API Usage

| Metric | Current | 6-month projection |
|--------|---------|-------------------|
| Daily Claude API calls | ~500 | 50,000 |
| Models used | Haiku 4.5, Sonnet 4.6 | + Opus on enterprise |
| Token consumption / month | ~2M | ~200M |
| Active end users | 50 (staff + pilot) | 100,000 |
| Enterprise customer count | 4 | 50 |

---

## 5 · Partnership Ask

### What G2G needs from Anthropic
1. **Solution Partner badge** (co-marketing credibility in Thai market)
2. **API credits** to support free-tier consumer growth (10K citizens)
3. **Early access** to new models (Opus 5 · Sonnet 5)
4. **Partner manager** for technical Q&A + scale planning
5. **Featured customer story** opportunity on Anthropic blog

### What G2G gives Anthropic
1. **First Thai Solution Partner** · positioning in SEA market
2. **Customer case studies** (4 verticals across healthcare, legal, retail, government)
3. **Production reference architecture** (Apps Script + LIFF + Claude · low-cost mass deployment)
4. **Multi-vertical PLAT** = ministry pilot pipeline (DGA / MOAC / MOE / MOPH)
5. **Localization showcase** · Claude works beautifully in Thai language with proper persona engineering

---

## 6 · Team

- **CEO**: G2G (gov2global.com)
- **Tech / AI**: Claude-augmented development (CEO + AI agent system)
- **Operations**: 12+ AI agents (each as named virtual staff)
- **Customer base**: AIM Clinic, NK Law, Le Phaya Jewelry, G2G Citizen pilot

---

## 7 · Why Now

Thailand has ~50M LINE users and growing AI demand · no Thai-localized Claude-powered platform exists at scale. G2G is positioned to be:
- **First mover** in Thai-localized AI assistant (PHAT)
- **First ministry-grade** multi-vertical platform (PLAT)
- **First Anthropic Solution Partner** in Thailand

Approval timeline preferred: within 30 days · to coordinate with our PHAT public launch.

---

## 8 · Appendix · Live URLs

- PHAT landing: https://g2g-os.fly.dev/start.html
- PHAT for Business: https://g2g-os.fly.dev/business.html
- PHAT Products dashboard: https://g2g-os.fly.dev/admin/products.html
- PHAT invite system: https://g2g-os.fly.dev/admin/invite.html
- R-DISCOVERY 6-tier console: https://g2g-os.fly.dev/admin/discovery.html
- PLAT a-farmer: https://g2g-platform.fly.dev/apps/a-farmer/
- LINE OA @PHAT: https://line.me/R/ti/p/@280ezsqs

---

**ส่งใบสมัครที่**: https://www.anthropic.com/partners

**กรอกข้อมูล:**
- Company: G2G AgriTech · Gov2Global Private Co., Ltd.
- Country: Thailand
- Partner type: **Solution Partner**
- Stage: Production (4 paying customers + consumer launch)
- Use case: Multi-vertical AI platform (B2B + B2C) · LINE-native · Thai-localized
- ปะ link to this doc: https://g2g-os.fly.dev/anthropic-application.md (TODO upload)
