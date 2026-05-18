# 🚀 G2G Deploy Now · Quick Checklist

> CEO รัน 2 commands ในเครื่อง (sandbox ใช้ไม่ได้ + Apps Script API ต้อง local auth · จุดที่ AI ทำไม่ได้)

## 📦 Step 1 · Apps Script Push (1 command)

```bash
cd /Users/maew/g2g-ai-os/skills/memory-dreaming && clasp push --force && clasp deployments
```

ผลลัพธ์ที่ควรเห็น:
```
└─ dreamingMemory.gs
└─ hideSheets.gs
Pushed 2 files.

# Deployments list
- @HEAD  AKfycb...  Latest
- @42    AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k  G2G Citizen v42
```

ถ้า deployment ID เปลี่ยน → update `APPS_SCRIPT_URL` ใน frontend
ถ้า deployment ID เหมือนเดิม → frontend ใช้ได้ทันที (ดี — recommended)

**Re-deploy เพื่อ refresh code:**
```bash
clasp deploy --deploymentId AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k --description "v42 R-DISCOVERY + multiAI + invite + viral"
```

---

## 🚁 Step 2 · Fly.io Deploy (1 command)

```bash
cd /Users/maew/Desktop/g2g-os && flyctl deploy
```

ผลลัพธ์ที่ควรเห็น:
```
==> Verifying app config
==> Building image
==> Pushing image to fly
==> Creating release
==> Monitoring deployment
1 desired, 1 placed, 1 healthy, 0 unhealthy
v123 deployed successfully
```

---

## ✅ Step 3 · Verify (browser test)

เปิด URLs เหล่านี้ใน browser ดูว่าทำงานครบ:

| URL | คาด | ตรวจ |
|-----|-----|-----|
| `https://g2g-os.fly.dev/start.html` | landing ประชาชน · 12 benefits | hero "AI ผู้ช่วยส่วนตัวของคนไทย" |
| `https://g2g-os.fly.dev/business.html` | landing SaaS · 3 tiers | pricing 990/4900/19900 |
| `https://g2g-os.fly.dev/admin/invite.html` | CEO tool ส่ง invite | form ชื่อ-จังหวัด-อาชีพ |
| `https://g2g-os.fly.dev/admin/discovery.html` | R-DISCOVERY test console | preset "ธิติพร แก้วลังกา" |
| `https://g2g-os.fly.dev/i/{token}` | personal landing | (test หลังสร้าง invite) |

---

## 🧪 Step 4 · Test Endpoints (in browser console)

```javascript
// 1. multiAISearch
fetch('https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec?action=multiAISearch&query=ราคาทุเรียน').then(r=>r.json()).then(console.log)

// 2. googleCSE
fetch('https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec?action=googleCSE&query=ราคาทุเรียน').then(r=>r.json()).then(console.log)

// 3. fullPersonResearch
fetch('https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec?action=fullPersonResearch', {method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({name:'ธิติพร แก้วลังกา'})}).then(r=>r.json()).then(console.log)

// 4. pricingTiers
fetch('https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec?action=pricingTiers').then(r=>r.json()).then(console.log)
```

ทุก endpoint ควร return `{ ok: true, ... }` หลัง deploy

---

## 🆘 Troubleshooting

**clasp push fail · "User has not enabled the Apps Script API"**
→ เปิด https://script.google.com/home/usersettings · เปิด toggle

**clasp push fail · "Could not read manifest"**
→ ตรวจ `cd /Users/maew/g2g-ai-os/skills/memory-dreaming && ls .clasp.json appsscript.json`

**flyctl deploy fail · "auth required"**
→ `flyctl auth login` แล้วลองใหม่

**URLs return 404 หลัง deploy**
→ ตรวจ `flyctl logs` · บางครั้ง CDN cache ค้าง 1-2 นาที

**Endpoint test return "unknown action"**
→ Apps Script ยังไม่ได้ re-deploy · รัน `clasp deploy` อีกครั้ง

---

## 📊 Snapshot (สิ่งที่ AI ทำเสร็จแล้วใน session นี้)

✅ Frontend files synced — `i/index.html`, `admin/invite.html`, `admin/discovery.html`, `start.html`, `business.html`
✅ Admin nav menu — เพิ่ม Invite + Discovery items
✅ CSE v2 ใหม่ ID `73eb0b9edffc0456c` · 50 sites quality (เพดาน Google) · GOOGLE_CSE_ID saved ใน Properties
✅ Iron Rule R-EXECUTE-NOW บันทึกใน skills (g2g-inventory + g2g-discovery)
✅ ทดสอบ CSE ผ่าน public URL · ค้น "ราคาทุเรียน" ได้ 15.1M ผลลัพธ์คุณภาพดี

⏳ รอ CEO รัน Step 1 + Step 2 (5 นาที) เพื่อให้ live ทั้งระบบ

---

## 🔑 Critical IDs

| Key | Value |
|-----|-------|
| Apps Script Project ID | `1i49ACQpjY43fzt0RzQYRxoP72NRp_jfIz0iQiLK9aR9GHZfes2LSMzX3` |
| Apps Script Deployment | `AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k` |
| Master Key | `168147` |
| Google CSE ID (new) | `73eb0b9edffc0456c` |
| LINE OA Citizen | `@280ezsqs` (channel 2010125195) |
| LIFF Citizen | `2010125245-jHBOzS52` |
| Fly app | `g2g-os.fly.dev` |
