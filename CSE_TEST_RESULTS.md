# 🔍 G2G CSE v2 Test Results · 2026-05-19

**CSE ID**: `73eb0b9edffc0456c` · 50 sites · publicURL: `cse.google.com/cse?cx=73eb0b9edffc0456c`

---

## ✅ Test 1: "ราคาทุเรียน" (agricultural pricing)

- **Results**: 15,100,000 hits (0.58s)
- **Quality**: ⭐⭐⭐⭐⭐ Excellent
- **Top sources**: talaadthai.com (ตลาดไท), suratthani.moc.go.th (พาณิชย์จังหวัด), plan.doae.go.th, Thai PBS
- **Verdict**: ครอบคลุมแหล่งราคาทางการ + ตลาดจริง · zero spam

## ✅ Test 2: "นโยบายเกษตรกรรม 2569" (government policy)

- **Results**: 6,280,000 hits (0.47s)
- **Quality**: ⭐⭐⭐⭐⭐ Excellent
- **Top sources**: doae.go.th (กรมส่งเสริมการเกษตร), esc.doae.go.th, Thai PBS, yasothon.doae.go.th (PDF แผนปฏิบัติราชการ)
- **Verdict**: เจอเอกสารราชการต้นทาง · เหมาะกับเกษตรกรมาก

## ⚠️ Test 3: "พยากรณ์อากาศ แพร่" (weather forecast)

- **Results**: 250,000 hits (0.45s)
- **Quality**: ⭐⭐ Weak
- **Top sources**: mahidol.ac.th (PM2.5), Thai PBS (น้ำท่วม), wikipedia (การแพร่สัญญาณ)
- **Issue**: ❌ ไม่มี tmd.go.th (กรมอุตุฯ) ใน 50 sites · ผลลัพธ์ misinterpret "แพร่" เป็น "การแพร่"
- **Action**: เพิ่ม `tmd.go.th` แทน site ที่ใช้น้อย

## ✅ Test 4: "ราคาลำไย" (agricultural pricing 2)

- **Results**: 5,220,000 hits (0.50s)
- **Quality**: ⭐⭐⭐⭐⭐ Excellent
- **Top**: ตลาดไท (ลำไยอีดอ/พวงทอง), Thai PBS (ชาวสวนเหนือเดือด), ข่าวลำไยนอกฤดู
- **Verdict**: ตรงประเด็นเกษตรกร · ครอบคลุมราคาตลาดจริง + บริบทข่าว

## ✅ Test 5: "สิทธิบัตรทอง รักษาฟรี" (healthcare rights)

- **Results**: 626,000 hits (0.49s)
- **Quality**: ⭐⭐⭐⭐⭐ Excellent
- **Top**: Policy Watch, Thai PBS (30 บาทรักษาทุกที่ 46 จังหวัด, UCEP 6 อาการฉุกเฉิน), บัตรทอง 2569
- **Verdict**: เจอแหล่งข้อมูลสิทธิราชการคุณภาพดี + อัปเดตล่าสุด

---

## 📊 Summary

**Strong domains** (CSE ดีกว่า raw Google):
- เกษตร · ราคาผลผลิต
- นโยบายรัฐ · เอกสารราชการ
- ข่าวคุณภาพ (Thai PBS, BBC)
- การศึกษา (chula, ku, mahidol)

**Weak domains** (ขาด site ที่ควรเพิ่ม):
- พยากรณ์อากาศ → ขาด `tmd.go.th`
- ราคาทอง → ขาด `goldtraders.or.th`
- แผนที่/ทิศทาง → maps.google.com มีแล้วแต่ผลน้อย
- กฎหมาย → ขาด `krisdika.go.th`

---

## 🔧 Recommended adjustments (Phase 2)

ลบ 4 sites ที่ใช้น้อย เพิ่ม 4 ที่จำเป็น:

| ลบ | เพิ่ม |
|----|------|
| ed.ted.com | tmd.go.th (พยากรณ์อากาศ) |
| jstor.org | krisdika.go.th (กฎหมาย) |
| ft.com (paywall) | goldtraders.or.th (ราคาทอง) |
| maps.google.com | nesdc.go.th (สภาพัฒน์) |

(ทำหลัง CEO deploy เสร็จ — เพราะ CSE ID stable แล้วใน Apps Script Properties)
