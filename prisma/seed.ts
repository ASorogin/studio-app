// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // הערה: seed.ts משמש כרגע רק לנתוני-ייחוס אמיתיים (אירועים/חגים) —
  // לא ליצירת עסקים/תמונות/פרסומות מזויפים. אלה נוצרים אך ורק דרך
  // האפליקציה בפועל (signup, /businesses/new, upload אמיתי וכו').

  const events = [
    // חגי ישראל
    { id: "evt_1", name: "ראש השנה", emoji: "🍎", type: "holiday" as const, month: 9, day: 11, categories: [] as string[] },
    { id: "evt_11", name: "יום כיפור", emoji: "🕯️", type: "holiday" as const, month: 9, day: 20, categories: [] as string[] },
    { id: "evt_12", name: "סוכות", emoji: "🌿", type: "holiday" as const, month: 9, day: 25, categories: [] as string[] },
    { id: "evt_13", name: "שמחת תורה", emoji: "📜", type: "holiday" as const, month: 10, day: 4, categories: [] as string[] },
    { id: "evt_9", name: "חנוכה", emoji: "🕎", type: "holiday" as const, month: 12, day: 4, categories: [] as string[] },
    { id: "evt_14", name: "ט\"ו בשבט", emoji: "🌳", type: "holiday" as const, month: 2, day: 1, categories: [] as string[] },
    { id: "evt_18", name: "יום המשפחה", emoji: "👨‍👩‍👧‍👦", type: "holiday" as const, month: 2, day: 17, categories: [] as string[] },
    { id: "evt_3", name: "פורים", emoji: "🎭", type: "holiday" as const, month: 3, day: 3, categories: [] as string[] },
    { id: "evt_5", name: "פסח", emoji: "🌿", type: "holiday" as const, month: 4, day: 2, categories: [] as string[] },
    { id: "evt_15", name: "יום העצמאות", emoji: "🇮🇱", type: "holiday" as const, month: 4, day: 22, categories: [] as string[] },
    { id: "evt_16", name: "ל\"ג בעומר", emoji: "🔥", type: "holiday" as const, month: 5, day: 5, categories: [] as string[] },
    { id: "evt_17", name: "שבועות", emoji: "🧀", type: "holiday" as const, month: 5, day: 22, categories: [] as string[] },

    // חגים אמריקאים / בינלאומיים עם מודעות רחבה
    { id: "evt_23", name: "ראש השנה האזרחית", emoji: "🎊", type: "international_day" as const, month: 1, day: 1, categories: [] as string[] },
    { id: "evt_2", name: "יום האהבה", emoji: "❤️", type: "international_day" as const, month: 2, day: 14, categories: [] as string[] },
    { id: "evt_4", name: "יום האישה הבינלאומי", emoji: "💐", type: "international_day" as const, month: 3, day: 8, categories: [] as string[] },
    { id: "evt_6", name: "יום הכושר הבינלאומי", emoji: "💪", type: "international_day" as const, month: 4, day: 6, categories: [] as string[] },
    { id: "evt_7", name: "יום הקפה הבינלאומי", emoji: "☕", type: "international_day" as const, month: 10, day: 1, categories: [] as string[] },
    { id: "evt_19", name: "האלווין", emoji: "🎃", type: "international_day" as const, month: 10, day: 31, categories: [] as string[] },
    { id: "evt_20", name: "חג ההודיה", emoji: "🦃", type: "international_day" as const, month: 11, day: 26, categories: [] as string[] },
    { id: "evt_8", name: "בלאק פריידי", emoji: "🛍️", type: "international_day" as const, month: 11, day: 27, categories: [] as string[] },
    { id: "evt_21", name: "סייבר מאנדיי", emoji: "💻", type: "international_day" as const, month: 11, day: 30, categories: [] as string[] },
    { id: "evt_22", name: "חג המולד", emoji: "🎄", type: "international_day" as const, month: 12, day: 25, categories: [] as string[] },
    { id: "evt_10", name: "סילבסטר", emoji: "🎉", type: "international_day" as const, month: 12, day: 31, categories: [] as string[] },
  ];

  for (const e of events) {
    await prisma.event.upsert({ where: { id: e.id }, update: e, create: e });
  }
  console.log(`✔ ${events.length} אירועים`);

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