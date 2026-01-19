# Link Map - Side Panel Feature

## ✨ คุณสมบัติใหม่

Extension นี้ตอนนี้รองรับ **Side Panel** แล้วครับ! คุณสามารถ:

### 🎯 การใช้งาน

1. **เปิด Side Panel ผ่านปุ่ม Extension**
   - คลิกที่ icon extension บน toolbar
   - Side Panel จะเปิดขึ้นที่ตำแหน่งที่คุณเลือกไว้

2. **ใช้ Keyboard Shortcut**
   - กด `Shift + Ctrl + L` (Windows/Linux)
   - กด `Shift + Command + L` (Mac)
   - Side Panel จะเปิดขึ้นทันที

3. **ตั้งค่าตำแหน่ง Side Panel**
   - คลิกขวาที่ icon extension → เลือก "Options"
   - เลือกตำแหน่งที่ต้องการ: **Left** หรือ **Right**
   - กดปุ่ม "Save Settings"
   - ตั้งแต่นี้ไป Side Panel จะเปิดที่ตำแหน่งที่คุณเลือก

4. **ปรับแต่ง Keyboard Shortcut (ถ้าต้องการ)**
   - เปิด `chrome://extensions/shortcuts`
   - ค้นหา "Link Map"
   - กำหนด shortcut ใหม่ตามที่ต้องการ

### 🔧 การตั้งค่าใน manifest.json

```json
{
  "permissions": ["sidePanel"],
  "side_panel": {
    "default_path": "tree.html"
  },
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "commands": {
    "openLinkMap": {
      "suggested_key": {
        "default": "Shift+Ctrl+L",
        "mac": "Shift+Command+L"
      },
      "description": "Open Link Map Side Panel"
    },
    "_execute_side_panel_action": {
      "suggested_key": {
        "default": "Shift+Ctrl+L",
        "mac": "Shift+Command+L"
      }
    }
  }
}
```

### 📝 หมายเหตุ

- **Fallback Behavior**: หากเบราว์เซอร์ไม่รองรับ Side Panel API (เวอร์ชันเก่า) extension จะเปิดแบบ popup window แทนโดยอัตโนมัติ
- **Position Setting**: การตั้งค่าตำแหน่งจะถูกเก็บไว้ใน `chrome.storage.local` และจะคงอยู่แม้ปิดเปิดเบราว์เซอร์ใหม่
- **Chrome Version**: ต้องใช้ Chrome version 114 ขึ้นไปสำหรับ Side Panel API

### 🚀 Development

ไฟล์ที่เกี่ยวข้องกับ Side Panel feature:

- `src/options/App.tsx` - Options page UI
- `src/options/App.scss` - Options page styling
- `src/background/index.ts` - Side Panel logic
- `extension/manifest.json` - Permissions และ configuration

### 🎨 UI Preview

Options page มี:
- ปุ่มเลือกตำแหน่ง Left/Right พร้อม visual preview
- ปุ่ม Save Settings ที่แสดง feedback เมื่อบันทึกสำเร็จ
- ข้อมูล keyboard shortcut และวิธีการปรับแต่ง
- Design ที่สวยงามด้วย gradient background และ smooth animations

---

Made with ❤️ for better tab management
