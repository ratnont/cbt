export type Lang = 'th' | 'en'

export const strings = {
  th: {
    appTitle: 'บันทึกความคิด',
    appSubtitle: 'Thought Record',
    addEntry: 'เพิ่มบันทึก',
    editEntry: 'แก้ไขบันทึก',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    confirmDelete: 'ยืนยันการลบ?',
    confirmDeleteMsg: 'บันทึกนี้จะถูกลบอย่างถาวร ไม่สามารถกู้คืนได้',
    yes: 'ใช่ ลบเลย',
    no: 'ยกเลิก',

    // Fields
    datetime: 'วันที่ / เวลา',
    situation: 'เหตุการณ์',
    situationHint: 'เกิดอะไรขึ้น ที่ไหน อยู่กับใคร',
    thoughts: 'ความคิด',
    thoughtsHint: 'มีอะไรป๊อปอั๊พขึ้นมาบ้าง',
    emotions: 'อารมณ์',
    emotionsHint: 'เพิ่มอารมณ์และให้คะแนน 0–10',
    addEmotion: 'เพิ่มอารมณ์',
    emotionName: 'ชื่ออารมณ์',
    intensity: 'ความรุนแรง',
    physical: 'อาการทางกาย',
    physicalHint: 'รู้สึกอะไรในร่างกายบ้าง',
    behaviors: 'พฤติกรรมที่แสดงออก',
    behaviorsHint: 'ทำอะไรไปบ้าง',

    // Emotion chips
    emotionChips: ['โกรธ', 'เศร้า', 'กังวล', 'กลัว', 'อาย', 'ผิดหวัง', 'เหงา', 'มีความสุข'],
    customEmotion: 'อื่นๆ...',

    // List / Filter
    search: 'ค้นหา...',
    filterDate: 'กรองตามวันที่',
    filterEmotion: 'กรองตามอารมณ์',
    from: 'ตั้งแต่',
    to: 'ถึง',
    clearFilter: 'ล้างตัวกรอง',
    entriesCount: (n: number) => `${n} บันทึก`,
    noEntries: 'ยังไม่มีบันทึก',
    noEntriesMsg: 'กดปุ่มด้านล่างเพื่อเพิ่มบันทึกแรกของคุณ',
    noResults: 'ไม่พบบันทึกที่ตรงกัน',
    noResultsMsg: 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง',

    // Export
    export: 'ส่งออก',
    exportCSV: 'ดาวน์โหลด CSV',
    exportCSVHint: 'เปิด Google Sheets → ไฟล์ → นำเข้า → อัปโหลดไฟล์นี้',
    downloadJSON: 'สำรองข้อมูล JSON',
    importJSON: 'นำเข้าข้อมูล JSON',
    importJSONConfirm: 'การนำเข้าจะแทนที่ข้อมูลทั้งหมดในปัจจุบัน ต้องการดำเนินการต่อหรือไม่?',
    importSuccess: 'นำเข้าข้อมูลสำเร็จ',
    importError: 'ไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์สำรองข้อมูล JSON ของแอปนี้',

    // Google Sheets push
    settings: 'ตั้งค่า',
    sheetsUrl: 'Google Apps Script URL',
    sheetsUrlHint: 'วาง URL ของ Web App ที่ deploy จาก Google Apps Script',
    pushToSheets: 'ส่งข้อมูลไปยัง Google Sheet',
    pushSuccess: 'ส่งแล้ว ✓ — ตรวจสอบใน Sheet ของคุณ',
    pushNote: 'แอปไม่สามารถยืนยันได้โดยตรง กรุณาตรวจสอบใน Sheet',
    save_settings: 'บันทึกการตั้งค่า',

    // Privacy
    privacy: 'ข้อมูลถูกเก็บในเบราว์เซอร์นี้เท่านั้น การล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนอุปกรณ์จะทำให้ข้อมูลหาย ดาวน์โหลด JSON เพื่อสำรองข้อมูล',

    // View toggle
    viewCards: 'การ์ด',
    viewTable: 'ตาราง',

    // Table column headers (match worksheet exactly)
    colDatetime: 'วันที่ / เวลา',
    colSituation: 'เหตุการณ์\nเกิดอะไรขึ้น ที่ไหน อยู่กับใคร',
    colThoughts: 'ความคิด\nมีอะไรป็อปอั๊พขึ้นมาบ้าง',
    colEmotions: 'ชื่ออารมณ์ คะแนน0–10\n(เช่น โกรธ 4/10)',
    colPhysical: 'อาการทางกาย',
    colBehaviors: 'พฤติกรรมที่แสดงออก',

    // CSV columns
    csvDatetime: 'วันที่/เวลา',
    csvSituation: 'เหตุการณ์',
    csvThoughts: 'ความคิด',
    csvEmotions: 'อารมณ์',
    csvPhysical: 'อาการทางกาย',
    csvBehaviors: 'พฤติกรรม',
  },
  en: {
    appTitle: 'Thought Record',
    appSubtitle: 'CBT Worksheet',
    addEntry: 'Add Entry',
    editEntry: 'Edit Entry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDelete: 'Confirm delete?',
    confirmDeleteMsg: 'This entry will be permanently deleted and cannot be recovered.',
    yes: 'Yes, delete',
    no: 'Cancel',

    // Fields
    datetime: 'Date / Time',
    situation: 'Situation',
    situationHint: 'What happened, where, with whom',
    thoughts: 'Thoughts',
    thoughtsHint: 'What thoughts popped up',
    emotions: 'Emotions',
    emotionsHint: 'Add emotions and rate 0–10',
    addEmotion: 'Add emotion',
    emotionName: 'Emotion name',
    intensity: 'Intensity',
    physical: 'Physical symptoms',
    physicalHint: 'What did you feel in your body',
    behaviors: 'Behaviors',
    behaviorsHint: 'What did you do',

    // Emotion chips
    emotionChips: ['Angry', 'Sad', 'Anxious', 'Scared', 'Ashamed', 'Disappointed', 'Lonely', 'Happy'],
    customEmotion: 'Other...',

    // List / Filter
    search: 'Search...',
    filterDate: 'Filter by date',
    filterEmotion: 'Filter by emotion',
    from: 'From',
    to: 'To',
    clearFilter: 'Clear filters',
    entriesCount: (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
    noEntries: 'No entries yet',
    noEntriesMsg: 'Tap the button below to add your first entry.',
    noResults: 'No matching entries',
    noResultsMsg: 'Try a different search or clear your filters.',

    // Export
    export: 'Export',
    exportCSV: 'Download CSV',
    exportCSVHint: 'Open Google Sheets → File → Import → Upload this file',
    downloadJSON: 'Backup as JSON',
    importJSON: 'Restore from JSON',
    importJSONConfirm: 'This will replace all current data. Continue?',
    importSuccess: 'Data imported successfully',
    importError: 'Invalid file. Please use a JSON backup from this app.',

    // Google Sheets push
    settings: 'Settings',
    sheetsUrl: 'Google Apps Script URL',
    sheetsUrlHint: 'Paste the Web App URL deployed from Google Apps Script',
    pushToSheets: 'Send all entries to Google Sheet',
    pushSuccess: 'Sent ✓ — check your Sheet',
    pushNote: 'The app cannot confirm delivery directly. Check your Sheet.',
    save_settings: 'Save settings',

    // Privacy
    privacy: 'Data is stored only in this browser on this device. Clearing browser data or switching devices will erase it. Download a JSON backup to keep a copy.',

    // View toggle
    viewCards: 'Cards',
    viewTable: 'Table',

    // Table column headers
    colDatetime: 'Date / Time',
    colSituation: 'Situation\nWhat happened, where, with whom',
    colThoughts: 'Thoughts\nWhat popped up',
    colEmotions: 'Emotions & score 0–10\n(e.g. Angry 4/10)',
    colPhysical: 'Physical symptoms',
    colBehaviors: 'Behaviors',

    // CSV columns
    csvDatetime: 'Date/Time',
    csvSituation: 'Situation',
    csvThoughts: 'Thoughts',
    csvEmotions: 'Emotions',
    csvPhysical: 'Physical symptoms',
    csvBehaviors: 'Behaviors',
  },
} as const

export type Strings = typeof strings['th'] | typeof strings['en']
