# LINE Personal OA per Staff · Setup Guide

## ภาพรวม

ทุกพนักงาน G2G มี LINE OA ส่วนตัวของตัวเอง 1 channel · ใช้สำหรับ:
- รับ-ส่งคำสั่งงานจากมือถือ
- ดูดวงรายวันส่วนตัว (ผ่าน push 07:00 BKK)
- รับ alert จาก G2G system
- chat กับ AI Tutor ส่วนตัว

## Strategy

**Pattern เดียวกันทั้ง 11 ตัว · ใช้ Provider เดียว · webhook เดียว (g2g-platform.fly.dev) · routing ด้วย channel ID**

| Channel name | สำหรับ | webhook path |
|--------------|--------|-------------|
| `@g2g-game` (ID: TBD) | เกมส์ | `/webhook/line/game` |
| `@g2g-baipare` | ใบแพร | `/webhook/line/baipare` |
| `@g2g-som` | ส้ม | `/webhook/line/som` |
| `@g2g-wan` | วรรณ | `/webhook/line/wan` |
| `@g2g-aui` | อุ้ย | `/webhook/line/aui` |
| `@g2g-bank` | แบ้งค์ | `/webhook/line/bank` |
| `@g2g-sombat` | สมบัติ | `/webhook/line/sombat` |
| `@g2g-ainam` | ไอน้ำ | `/webhook/line/ainam` |
| `@g2g-cat` | แคท | `/webhook/line/cat` |
| `@g2g-phim` | พิมลรัตน์ | `/webhook/line/phim` |
| `@g2g-yui` | ยุ้ย | `/webhook/line/yui` |

## ขั้นตอนสร้าง 1 Channel (ทำซ้ำ 11 ครั้ง)

### A. ที่ LINE Developers Console

1. เข้า https://developers.line.biz/console/
2. เลือก Provider **"Thai Premium Fruit AI"** (มีอยู่แล้ว) — ไม่สร้าง provider ใหม่
3. กด **"Create new channel"**
4. เลือก **"Messaging API"**
5. กรอก:
   - **Channel name:** `G2G · {nickname}` เช่น `G2G · เกมส์`
   - **Channel description:** `LINE OA ส่วนตัวของ {nickname} พนักงาน G2G`
   - **Category:** Business
   - **Subcategory:** Consulting and Education
   - **Email:** contact@gov2global.com
   - **Region:** Thailand
6. ยอมรับ Terms → กด Create
7. หลังสร้างเสร็จ:
   - Copy **Channel ID** + **Channel Secret** + **Channel Access Token (long-lived)**
   - บันทึกใน Google Sheet tab `LINE_OA_Registry`

### B. ตั้ง Webhook

1. ใน channel ที่สร้างใหม่ → tab **"Messaging API"**
2. **Webhook URL:** `https://g2g-platform.fly.dev/webhook/line/{slug}`
   เช่น `https://g2g-platform.fly.dev/webhook/line/game`
3. **Use webhook:** ON
4. **Auto-reply messages:** OFF
5. **Greeting messages:** ON (จะตั้งใน OA Manager)

### C. ตั้ง OA Manager

1. เข้า https://manager.line.biz/
2. เลือก channel ที่เพิ่งสร้าง
3. **Response settings:**
   - Chat: ON
   - Auto-response: OFF  
   - Greeting message: ON
   - Webhooks: ON
4. **Greeting message:** ใส่ template:
   ```
   สวัสดี {nickname} ครับ · นี่คือ LINE OA ส่วนตัวจาก G2G
   ใช้สั่งงาน ดูดวง หรือคุยกับ AI ได้เลย
   พิมพ์ "help" เพื่อดูคำสั่งทั้งหมด
   ```

### D. Add bot เป็นเพื่อน

1. เปิด **QR code** ใน OA Manager (ที่ home page ของ channel)
2. ส่งให้พนักงานคนนั้น scan แอด

## ขั้นสุดท้าย · บันทึกใน G2G System

หลังสร้างครบ 11 channels รันใน Apps Script:

```js
function bootstrapPersonalOAs() {
  const channels = [
    { slug: 'game',    channel_id: 'XXXXXXXXX', secret: '...', token: '...' },
    { slug: 'baipare', channel_id: '...', secret: '...', token: '...' },
    // ... 11 entries
  ];
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('LINE_OA_Registry');
  for (const c of channels) {
    sh.appendRow([c.slug, c.channel_id, c.secret, c.token, 'personal', new Date()]);
  }
}
```

## Mobile Command Channel (มีอยู่แล้ว · ไม่ต้องสร้างใหม่)

**@execcopilot** (channel 2007782514) ใช้สำหรับ:
- CEO สั่งงานเข้าระบบ ผ่าน mobile
- ทีมงาน claim งานผ่าน LINE
- รับ broadcast แจ้งเตือนทั่ว

Webhook: `https://g2g-platform.fly.dev/webhook/line` (existing)
ต้อง update handler เพิ่มเรียก `mobileCommand` endpoint ของ Memory v3

---

## Cost estimate

- ตอนนี้: LINE Verified Account 888 baht/year/channel + VAT = **~1,000 บาท × 11 = 11,000 บาท/ปี**
- ตอนแรกใช้ Unverified (ฟรี) ก่อน ทดสอบเดือนนึง · verify ค่อยจ่ายหลัง

## Implementation status

- [x] backend `mobileCommand` endpoint รองรับ command parsing
- [x] webhook URL pattern กำหนด
- [ ] g2g-platform.fly.dev/webhook/line/{slug} handler · ต้อง deploy update
- [ ] CEO สร้าง 11 channels ใน LINE Developers
- [ ] Bootstrap LINE_OA_Registry ใน Sheet
- [ ] Test ส่งข้อความหา bot แต่ละตัว

---

**ขั้นต่อไป (ผมจะทำให้):**

1. ผมเตรียม handler script สำหรับ g2g-platform `/webhook/line/{slug}` route
2. CEO เริ่มสร้าง 1 channel ทดสอบ (เริ่มของเกมส์ก่อน) — ส่ง Channel ID + Secret + Token มาให้ผม
3. ผม test webhook + push message
4. ถ้า work เริ่มสร้างที่เหลือ 10 channels
