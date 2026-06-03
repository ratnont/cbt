# Thought Record — CBT Worksheet

A private, mobile-first CBT Thought Record tracker. All data lives in your browser's `localStorage` — nothing is ever sent to a server unless you explicitly export it.

**Features**
- Add, edit, delete thought records with Thai/English UI
- Six fields matching the CBT worksheet: situation, thoughts, emotions (rated 0–10), physical symptoms, behaviors
- Quick-pick emotion chips + free-text
- Filter by date range, emotion, and full-text search
- CSV export (UTF-8 with BOM — opens correctly in Google Sheets and Excel)
- JSON backup and restore
- Optional one-click push to a Google Sheet via Apps Script

---

## Local development

```bash
npm install
npm run dev
# opens at http://localhost:5173
```

## Build

```bash
npm run build
# output in dist/
```

---

## Deployment

### Cloudflare Pages / Netlify / Vercel (recommended)

Connect the repo, set:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |

No other configuration needed.

### GitHub Pages

1. In `.github/workflows/deploy.yml`, change `BASE_URL` to match your repo name:
   ```yaml
   BASE_URL: /your-repo-name/
   ```

2. In your repo settings → Pages, set source to **GitHub Actions**.

3. Push to `main`. The workflow builds and deploys automatically.

---

## Sharing with your therapist

### CSV (simplest)

1. Open the app → Export → **ดาวน์โหลด CSV**
2. In Google Sheets: File → Import → Upload → select the file → "Replace current sheet" or "Create new sheet"
3. Share the Sheet with your therapist as usual.

The CSV is encoded UTF-8 with BOM, so Thai text renders correctly on import.

### Optional: one-click push to Google Sheet

This lets you push all entries to a Sheet your therapist already has access to, without downloading anything.

#### Step 1 — Create the Apps Script

1. Open [script.google.com](https://script.google.com) → **New project**
2. Replace the default code with:

```javascript
function doPost(e) {
  var entries = JSON.parse(e.postData.contents);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Thought Records') || ss.insertSheet('Thought Records');

  // Rewrite the sheet from scratch each push
  sheet.clearContents();

  var headers = [
    'วันที่/เวลา', 'เหตุการณ์', 'ความคิด', 'อารมณ์', 'อาการทางกาย', 'พฤติกรรม'
  ];
  sheet.appendRow(headers);

  entries.forEach(function(entry) {
    var emotions = (entry.emotions || [])
      .map(function(e) { return e.name + ' ' + e.score + '/10'; })
      .join('; ');
    sheet.appendRow([
      new Date(entry.datetime).toLocaleString('th-TH'),
      entry.situation || '',
      entry.thoughts || '',
      emotions,
      entry.physical || '',
      entry.behaviors || ''
    ]);
  });

  return ContentService
    .createTextOutput('ok')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. **Deploy** → New deployment → **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the Web App URL.

#### Step 2 — Connect the app

1. In the app → **ตั้งค่า / Settings**
2. Paste the Web App URL → Save
3. Export → **ส่งข้อมูลไปยัง Google Sheet**

> The app fires a POST and shows "Sent ✓" immediately. It cannot confirm delivery — check your Sheet to verify the rows appeared.

---

## Privacy

Data is stored only in this browser on this device. Clearing browser storage or switching devices will erase it. Use **Export → สำรองข้อมูล JSON** regularly to keep a copy.

No analytics, no tracking, no external requests except the optional Google Sheet push you configure yourself.
