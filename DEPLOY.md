# G2G OS v0.4 · Deploy Guide

ระบบครบ: Master Hub (43 หน้า) + Internal OS (13 ERP modules) + Memory v3 Dreaming

---

## ส่วนที่ 1 · Memory v3 Backend ✅ DEPLOYED

- Apps Script project: **dreamingMemory** (woravat.a@gmail.com)
- Web App URL: `https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec`
- Nightly trigger: 03:00 BKK · ทำ daily consolidation อัตโนมัติ
- Endpoint summary: load_chat_v3, listFacts, listThemes, listHotIndex, runDream, erpDashboard, erpListStaff, erpTab, erpAppend

ถ้ามีการเพิ่ม endpoint ใหม่ใน dreamingMemory.gs:
1. Paste code ทับใน Apps Script editor + Save
2. การทำให้ใช้งานได้ → จัดการ → ✏️ → เวอร์ชั่นใหม่ → Deploy
3. URL คงเดิม

## ส่วนที่ 2 · Static Site Deploy (g2g-os.fly.dev)

CEO เปิด Terminal แล้วรัน:

```bash
cd ~/g2g-os  # หรือ path ที่ clone repo

# Push code ใหม่
git pull origin main
git add -A
git commit -m "v0.4: complete ERP wired to Memory v3 + 43 pages"
git push

# Deploy ไป Fly.io
flyctl deploy --remote-only
```

ใช้เวลา ~2-3 นาที · ตรวจที่ https://g2g-os.fly.dev

## ส่วนที่ 3 · ทดสอบระบบ

```bash
# Test 1: Public site
open https://g2g-os.fly.dev

# Test 2: Admin login
open https://g2g-os.fly.dev/admin/login.html
# Login: name + PIN 999999 → เข้า dashboard

# Test 3: Dashboard ดู KPI ที่ live จาก Google Sheet
open https://g2g-os.fly.dev/admin/
# ควรเห็น Staff: 14, Farmers: 2650, Tasks: 37, Agents: 42, LineOA: 6

# Test 4: แต่ละ module ดู data จริง
# - /admin/staff.html → StaffRegistry + Staff tables
# - /admin/tasks.html → MasterTaskList + Agents
# - /admin/sales.html → Orders + Buyers + Products + MarketPrices
# - /admin/marketing.html → LINE OAs + Conversations + ContentLog
# - /admin/production.html → BusinessUnits + CropActivities + FarmerRegistry
# - /admin/clients.html → UnifiedProfiles + BuyerContacts
# - /admin/accounting.html → Accounting + Finance + Inventory
# - /admin/general.html → FILE_REGISTRY + ProblemTracker + SystemHealth + AILessons
# - /admin/settings.html → Settings + ConnectionRegistry + TechRegistry + Directives

# Test 5: Memory endpoint
curl "https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec?action=erpDashboard"
```

## โครงสร้างไฟล์ทั้งหมด

```
g2g-os/
├── Dockerfile, fly.toml, nginx.conf  (nginx:alpine · 256MB · sin region)
├── DEPLOY.md, README.md
├── .github/workflows/fly-deploy.yml  (auto-deploy on push to main)
├── backend/AdminAuth.gs              (login backend · paste in Apps Script)
└── src/                              (43 HTML pages + components)
    ├── components/
    │   ├── _tokens.css               (brand: navy + champagne gold)
    │   └── _base.css                 (utility · navbar · footer · TOC)
    │
    ├── index.html                    (5-pillar hero: Platform · AI · Commerce · Token · Products)
    ├── about.html                    (5-pillar model + flywheel)
    ├── enter.html                    (cover splash)
    ├── team.html                     (12 พนักงาน + ฝ่าย)
    ├── platform.html                 (Platform-as-a-Service · ขายลูกค้า)
    ├── token.html                    (Token Economy · 6 tiers)
    ├── pricing.html                  (PHAT/PLAT pricing)
    ├── partner.html                  (พันธมิตร)
    ├── branches.html                 (สำนักงาน · Bangkok, Phrae, Denchai)
    ├── contact.html                  (form)
    ├── faq.html, terms.html, privacy.html, disclosure.html, status.html
    ├── news.html, careers.html       (placeholder)
    ├── toc.html                      (สารบัญ)
    ├── internal-os.html              (redirect → admin/login)
    │
    ├── verticals/  (8 pages — products + clients)
    │   ├── imperial-fruitia.html, le-phaya.html, physical-products.html  ← G2G OWN
    │   ├── agritech.html, phat-plat.html, corporate-holding.html         ← G2G OWN
    │   └── aim-clinic.html, nk-law.html  ← CLIENTS (redirect)
    │
    └── admin/  (Internal OS · ERP · 13 หน้า · live data จาก Google Sheet)
        ├── _admin.css                (shared styles)
        ├── _admin.js                 (auth + ERP fetch + render helpers)
        │                              Endpoint = Memory v3 URL
        ├── login.html                (LINE + PIN auth)
        ├── index.html                (Dashboard · 8 KPIs จาก erpDashboard)
        ├── staff.html                (StaffRegistry + Staff tables)
        ├── tasks.html                (MasterTaskList + TaskDelegation + Agents)
        ├── sales.html                (Orders + Buyers + Products + MarketPrices)
        ├── marketing.html            (LINE_OA_Registry + Conversations + ContentLog)
        ├── production.html           (BusinessUnits + CropActivities + FarmerRegistry)
        ├── clients.html              (UnifiedProfiles + BuyerContacts + Groups)
        ├── accounting.html           (Accounting + Finance + Inventory)
        ├── tax.html                  (tax filing tracker · static template)
        ├── social-security.html      (สปส static template)
        ├── general.html              (FILE_REGISTRY + ProblemTracker + SystemHealth + AILessons)
        └── settings.html             (Settings + Connections + Tech + Directives + Memory v3 info)
```

## v0.4 Changelog

- ✅ Wire ทุก admin/ page ให้ fetch real data จาก Google Sheet ผ่าน Memory v3 endpoint
- ✅ ใช้ existing 100+ tabs ใน "AI Memory — เกษตรกรแพร่" sheet
- ✅ Generic erpTab endpoint อ่าน tab ใดก็ได้
- ✅ erpAppend สำหรับ POST row ใหม่
- ✅ erpDashboard ให้ KPI counts ครบ 15 entities
- ✅ ระบบบริหารพร้อมใช้งานจริง · ทุก KPI live จาก G2G master data

## Source data tabs ที่ใช้

จาก sheet `1-lqcruGtJiMzKFS2MK5gqcxaerzt9PiOTxmdTLqe_eM` (AI Memory):
- **People:** StaffRegistry (14), Staff (6), StaffIdentity (12), AliasLookup (38), UnifiedProfiles (9), Profiles (6), BuyerContacts (13)
- **Operations:** MasterTaskList (37), TaskDelegation (8), SharedTasks (15), Tasks (9), Agents (42)
- **Production:** FarmerRegistry (2,650), CropActivities (417), HarvestCalendar (892), BusinessUnits (7)
- **Sales:** Orders (3), Buyers (6), Products (8), MarketPrices (71)
- **Marketing:** LINE_OA_Registry (6), Conversations (280), ContentLog (9), Groups (7)
- **Finance:** Accounting, Finance, Inventory, CredentialTracker (5)
- **System:** Settings (31), ConnectionRegistry (16), TechRegistry (76), Directives (5), AILessons (15)
- **Memory v3:** HotIndex, Themes (23), Facts (145), Patterns, DreamLog

## หมายเหตุ

- ทุก admin/ page โหลด real data live · refresh เพียง refresh browser
- Memory v3 dreaming worker รัน 03:00 BKK ทุกคืน · ทำ data consolidation ใหม่
- ทุก endpoint cors-allowed · Anyone-access (ระวัง — endpoint นี้เปิด public)
- การเพิ่ม data: ใช้ erpAppend หรือ edit Google Sheet ตรงๆ
- การ debug: ใช้ /admin/settings.html → ดู endpoint URL + counts

---

**Build date:** 2026-05-18
**Version:** v0.4 — full ERP + Memory v3 production ready
