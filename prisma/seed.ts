// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });

  if (!agency) {
    console.error(
      "לא נמצאה אף סוכנות ב-DB. יש להירשם קודם דרך /signup, ורק אז להריץ את ה-seed."
    );
    process.exit(1);
  }

  console.log(`מזריע נתונים לסוכנות: ${agency.name} (${agency.id})`);

  const businesses = [
    { id: "biz_1", name: "טרטופו — פסטה בר", industry: "מסעדה", colorPrimary: "#8C3B2E", colorSecondary: "#F4E9DE", fontFamily: "Rubik", keywords: ["פסטה טרייה", "יין איטלקי", "ערב רומנטי", "שף אורח"] },
    { id: "biz_2", name: "קפה מרפא", industry: "בית קפה", colorPrimary: "#5C4033", colorSecondary: "#EFE3D0", fontFamily: "Assistant", keywords: ["קפה שחור", "עבודה מהמחשב", "קרואסון חמאה", "וויפי חינם"] },
    { id: "biz_3", name: "סטודיו לין", industry: "מספרה", colorPrimary: "#1C1620", colorSecondary: "#FFC53D", fontFamily: "Rubik", keywords: ["תספורת גברים", "צביעה", "פן ערב", "טיפולי קרטין"] },
    { id: "biz_4", name: "GLOW — קליניקת אסתטיקה", industry: "מכון יופי", colorPrimary: "#D998A0", colorSecondary: "#2B2024", fontFamily: "Assistant", keywords: ["טיפולי פנים", "בוטוקס", "עור זוהר", "ייעוץ חינם"] },
    { id: "biz_5", name: "ד״ר לוי — מרפאת שיניים", industry: "קליניקה", colorPrimary: "#2E5D64", colorSecondary: "#EAF4F3", fontFamily: "IBM Plex Sans Hebrew", keywords: ["הלבנת שיניים", "יישור שקוף", "טיפול ילדים", "חירום 24/7"] },
    { id: "biz_6", name: "IRON YARD — חדר כושר", industry: "כושר", colorPrimary: "#FF5A46", colorSecondary: "#1C1620", fontFamily: "Rubik", keywords: ["אימון פונקציונלי", "מנוי חודשי", "מאמן אישי", "קבוצתי"] },
    { id: "biz_7", name: "נשימה — סטודיו יוגה", industry: "יוגה ופילאטיס", colorPrimary: "#4E4376", colorSecondary: "#F1EEF7", fontFamily: "Assistant", keywords: ["יוגה בוקר", "מדיטציה", "שיעור מתחילים", "רטריט סופ״ש"] },
    { id: "biz_8", name: "מוראל — אופנת נשים", industry: "חנות בגדים", colorPrimary: "#B08968", colorSecondary: "#FAF6F0", fontFamily: "Rubik", keywords: ["קולקציה חדשה", "סייל סוף עונה", "מידות גדולות", "סטיילינג אישי"] },
    { id: "biz_9", name: "זהב ותכלת — תכשיטים", industry: "תכשיטנות", colorPrimary: "#8C6A2F", colorSecondary: "#FFF8E7", fontFamily: "Assistant", keywords: ["טבעות אירוסין", "תכשיט מותאם אישית", "כסף 925", "מתנה לזוגיות"] },
    { id: "biz_10", name: "פרחי השדה", industry: "חנות פרחים", colorPrimary: "#3B8764", colorSecondary: "#EAF6EF", fontFamily: "Rubik", keywords: ["זר יום הולדת", "עיצוב אירועים", "משלוח באותו יום", "פרחי בר"] },
    { id: "biz_11", name: "מוסך האחים כהן", industry: "רכב", colorPrimary: "#22303B", colorSecondary: "#E7ECEF", fontFamily: "IBM Plex Sans Hebrew", keywords: ["טסט מוכן", "בדיקה לפני קנייה", "החלפת שמן", "רכב חלופי"] },
    { id: "biz_12", name: "החצר האחורית — בר", industry: "פאב/בר", colorPrimary: "#1C1620", colorSecondary: "#FFC53D", fontFamily: "Rubik", keywords: ["הפי אאוור", "מוזיקה חיה", "קוקטייל חתימה", "ערב טריוויה"] },
    { id: "biz_13", name: "INK & CO — סטודיו קעקועים", industry: "קעקועים", colorPrimary: "#111111", colorSecondary: "#FF5A46", fontFamily: "Rubik", keywords: ["עיצוב מותאם אישית", "קעקוע קטן", "פגישת ייעוץ", "סטריליות מלאה"] },
    { id: "biz_14", name: "פיצה נאפולי", industry: "פיצרייה", colorPrimary: "#B3261E", colorSecondary: "#FFF3E0", fontFamily: "Assistant", keywords: ["פיצה בטאבון", "משלוחים", "בצק שמור 48 שעות", "ערב משפחות"] },
  ];

  for (const b of businesses) {
    await prisma.business.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, agencyId: agency.id, logoUrl: null },
    });
  }
  console.log(`✔ ${businesses.length} עסקים`);

  const photoShoots = [
    { id: "shoot_1", businessId: "biz_1", label: "צילומי תפריט חורף", shootDate: new Date("2026-01-12") },
    { id: "shoot_2", businessId: "biz_2", label: "צילומי בוקר בבית קפה", shootDate: new Date("2026-02-03") },
    { id: "shoot_3", businessId: "biz_3", label: "לוקים לפני-אחרי", shootDate: new Date("2026-03-18") },
  ];
  for (const s of photoShoots) {
    await prisma.photoShoot.upsert({ where: { id: s.id }, update: {}, create: s });
  }
  console.log(`✔ ${photoShoots.length} ימי צילומים`);

  const photos = [
    { id: "photo_1", shootId: "shoot_1", originalUrl: "/mock/photos/pasta-1.jpg", thumbUrl: "/mock/photos/pasta-1-thumb.jpg", label: "פסטה טרטופו", status: "used" as const },
    { id: "photo_2", shootId: "shoot_1", originalUrl: "/mock/photos/pasta-2.jpg", thumbUrl: "/mock/photos/pasta-2-thumb.jpg", label: "שולחן זוגי", status: "available" as const },
    { id: "photo_3", shootId: "shoot_2", originalUrl: "/mock/photos/cafe-1.jpg", thumbUrl: "/mock/photos/cafe-1-thumb.jpg", label: "לאטה ארט", status: "available" as const },
    { id: "photo_4", shootId: "shoot_3", originalUrl: "/mock/photos/hair-1.jpg", thumbUrl: "/mock/photos/hair-1-thumb.jpg", label: "צביעת בלייג׳", status: "used" as const },
  ];
  for (const p of photos) {
    await prisma.photo.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log(`✔ ${photos.length} תמונות`);

  const events = [
    { id: "evt_1", name: "ראש השנה", emoji: "🍎", type: "holiday" as const, month: 9, day: 14, categories: ["מסעדה", "חנות בגדים", "תכשיטנות"] },
    { id: "evt_2", name: "יום האהבה", emoji: "❤️", type: "international_day" as const, month: 2, day: 14, categories: ["מסעדה", "תכשיטנות", "חנות פרחים"] },
    { id: "evt_3", name: "פורים", emoji: "🎭", type: "holiday" as const, month: 3, day: 3, categories: ["חנות בגדים", "פאב/בר"] },
    { id: "evt_4", name: "יום האישה הבינלאומי", emoji: "💐", type: "international_day" as const, month: 3, day: 8, categories: ["מכון יופי", "חנות פרחים", "יוגה ופילאטיס"] },
    { id: "evt_5", name: "פסח", emoji: "🌿", type: "holiday" as const, month: 4, day: 2, categories: ["מסעדה", "פיצרייה"] },
    { id: "evt_6", name: "יום הכושר הבינלאומי", emoji: "💪", type: "international_day" as const, month: 4, day: 6, categories: ["כושר", "יוגה ופילאטיס"] },
    { id: "evt_7", name: "יום הקפה הבינלאומי", emoji: "☕", type: "international_day" as const, month: 10, day: 1, categories: ["בית קפה"] },
    { id: "evt_8", name: "בלאק פריידי", emoji: "🛍️", type: "international_day" as const, month: 11, day: 27, categories: ["חנות בגדים", "תכשיטנות", "מכון יופי"] },
    { id: "evt_9", name: "חנוכה", emoji: "🕎", type: "holiday" as const, month: 12, day: 15, categories: ["מסעדה", "פיצרייה", "חנות בגדים"] },
    { id: "evt_10", name: "סילבסטר", emoji: "🎉", type: "international_day" as const, month: 12, day: 31, categories: ["פאב/בר", "מסעדה"] },
  ];
  for (const e of events) {
    await prisma.event.upsert({ where: { id: e.id }, update: {}, create: e });
  }
  console.log(`✔ ${events.length} אירועים`);

  const ads = [
    { id: "ad_1", businessId: "biz_1", photoId: "photo_1", format: "feed" as const, headline: "לילה איטלקי אמיתי", caption: "פסטה טרייה, יין נבחר, ואווירה שמזכירה את רומא. הערב אצלנו.", textMode: "auto" as const, outputImageUrl: "/mock/ads/ad-1.jpg" },
    { id: "ad_2", businessId: "biz_3", photoId: "photo_4", format: "story" as const, headline: "לוק חדש לקיץ", caption: "תור לצביעת בלייג׳ נפתח השבוע — מוזמנות.", textMode: "manual" as const, outputImageUrl: "/mock/ads/ad-2.jpg" },
    { id: "ad_3", businessId: "biz_2", photoId: "photo_3", format: "feed" as const, headline: "הבוקר שלך מתחיל כאן", caption: "לאטה חם, שקט, ופינה לעבודה. פתוח מ-7:00.", textMode: "auto" as const, outputImageUrl: "/mock/ads/ad-3.jpg", eventId: "evt_7" },
  ];
  for (const a of ads) {
    await prisma.ad.upsert({ where: { id: a.id }, update: {}, create: a });
  }
  console.log(`✔ ${ads.length} פרסומות`);

  const calendarEntries = [
    { id: "cal_1", businessId: "biz_1", date: new Date("2026-08-03"), status: "ready" as const, adId: "ad_1" },
    { id: "cal_2", businessId: "biz_1", date: new Date("2026-08-07"), status: "planned" as const },
    { id: "cal_3", businessId: "biz_1", date: new Date("2026-08-12"), status: "empty" as const },
    { id: "cal_4", businessId: "biz_1", date: new Date("2026-08-20"), status: "planned" as const },
  ];
  for (const c of calendarEntries) {
    await prisma.calendarEntry.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  console.log(`✔ ${calendarEntries.length} רשומות תכנון תוכן`);

  console.log("🎉 Seed הושלם בהצלחה");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });