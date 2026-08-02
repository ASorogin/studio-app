// lib/mock-data.ts
// Mock data for Stage 1 — mirrors the Prisma schema fields from PROJECT_SPEC.md §3
// so the swap to a real DB in Stage 2 doesn't require changing UI types.

export type PlanTier = "free" | "pro" | "max";

export type Agency = {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  createdAt: string;
};

export type UserRole = "owner" | "editor";

export type AppUser = {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Business = {
  id: string;
  agencyId: string;
  name: string;
  industry: string;
  logoUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  fontFamily: string;
  keywords: string[];
  createdAt: string;
};

export type PhotoShoot = {
  id: string;
  businessId: string;
  label: string;
  shootDate: string;
  createdAt: string;
};

export type PhotoStatus = "available" | "used";

export type Photo = {
  id: string;
  shootId: string;
  originalUrl: string;
  thumbUrl: string;
  label: string;
  status: PhotoStatus;
  uploadedAt: string;
};

export type AdFormat = "feed" | "story" | "reel";
export type TextMode = "auto" | "manual";

export type Ad = {
  id: string;
  businessId: string;
  photoId: string;
  format: AdFormat;
  caption: string;
  headline: string;
  textMode: TextMode;
  outputImageUrl: string;
  eventId?: string;
  createdAt: string;
};

export type EventType = "holiday" | "international-day";

export type StudioEvent = {
  id: string;
  name: string;
  emoji: string;
  type: EventType;
  month: number; // 1-12
  day: number;
  categories: string[];
  isCustom?: boolean;
  agencyId?: string;
};

export type CalendarStatus = "ready" | "planned" | "empty";

export type CalendarEntry = {
  id: string;
  businessId: string;
  date: string; // ISO date
  status: CalendarStatus;
  adId?: string;
};

// ---------------------------------------------------------------------------
// Agency + Users
// ---------------------------------------------------------------------------

export const mockAgency: Agency = {
  id: "agency_1",
  name: "פיקסל סטודיו — סוכנות דיגיטל",
  email: "hello@pixel-agency.co.il",
  plan: "pro",
  createdAt: "2025-11-02T09:00:00.000Z",
};

export const mockUsers: AppUser[] = [
  { id: "user_1", agencyId: "agency_1", name: "אייל שרון", email: "eyal@pixel-agency.co.il", role: "owner" },
  { id: "user_2", agencyId: "agency_1", name: "נועה כהן", email: "noa@pixel-agency.co.il", role: "editor" },
];

// ---------------------------------------------------------------------------
// Businesses — 14 across varied industries
// ---------------------------------------------------------------------------

export const mockBusinesses: Business[] = [
  {
    id: "biz_1", agencyId: "agency_1", name: "טרטופו — פסטה בר",
    industry: "מסעדה", logoUrl: null,
    colorPrimary: "#8C3B2E", colorSecondary: "#F4E9DE", fontFamily: "Rubik",
    keywords: ["פסטה טרייה", "יין איטלקי", "ערב רומנטי", "שף אורח"],
    createdAt: "2025-11-05T10:00:00.000Z",
  },
  {
    id: "biz_2", agencyId: "agency_1", name: "קפה מרפא",
    industry: "בית קפה", logoUrl: null,
    colorPrimary: "#5C4033", colorSecondary: "#EFE3D0", fontFamily: "Assistant",
    keywords: ["קפה שחור", "עבודה מהמחשב", "קרואסון חמאה", "וויפי חינם"],
    createdAt: "2025-11-06T10:00:00.000Z",
  },
  {
    id: "biz_3", agencyId: "agency_1", name: "סטודיו לין",
    industry: "מספרה", logoUrl: null,
    colorPrimary: "#1C1620", colorSecondary: "#FFC53D", fontFamily: "Rubik",
    keywords: ["תספורת גברים", "צביעה", "פן ערב", "טיפולי קרטין"],
    createdAt: "2025-11-07T10:00:00.000Z",
  },
  {
    id: "biz_4", agencyId: "agency_1", name: "GLOW — קליניקת אסתטיקה",
    industry: "מכון יופי", logoUrl: null,
    colorPrimary: "#D998A0", colorSecondary: "#2B2024", fontFamily: "Assistant",
    keywords: ["טיפולי פנים", "בוטוקס", "עור זוהר", "ייעוץ חינם"],
    createdAt: "2025-11-08T10:00:00.000Z",
  },
  {
    id: "biz_5", agencyId: "agency_1", name: "ד״ר לוי — מרפאת שיניים",
    industry: "קליניקה", logoUrl: null,
    colorPrimary: "#2E5D64", colorSecondary: "#EAF4F3", fontFamily: "IBM Plex Sans Hebrew",
    keywords: ["הלבנת שיניים", "יישור שקוף", "טיפול ילדים", "חירום 24/7"],
    createdAt: "2025-11-09T10:00:00.000Z",
  },
  {
    id: "biz_6", agencyId: "agency_1", name: "IRON YARD — חדר כושר",
    industry: "כושר", logoUrl: null,
    colorPrimary: "#FF5A46", colorSecondary: "#1C1620", fontFamily: "Rubik",
    keywords: ["אימון פונקציונלי", "מנוי חודשי", "מאמן אישי", "קבוצתי"],
    createdAt: "2025-11-10T10:00:00.000Z",
  },
  {
    id: "biz_7", agencyId: "agency_1", name: "נשימה — סטודיו יוגה",
    industry: "יוגה ופילאטיס", logoUrl: null,
    colorPrimary: "#4E4376", colorSecondary: "#F1EEF7", fontFamily: "Assistant",
    keywords: ["יוגה בוקר", "מדיטציה", "שיעור מתחילים", "רטריט סופ״ש"],
    createdAt: "2025-11-11T10:00:00.000Z",
  },
  {
    id: "biz_8", agencyId: "agency_1", name: "מוראל — אופנת נשים",
    industry: "חנות בגדים", logoUrl: null,
    colorPrimary: "#B08968", colorSecondary: "#FAF6F0", fontFamily: "Rubik",
    keywords: ["קולקציה חדשה", "סייל סוף עונה", "מידות גדולות", "סטיילינג אישי"],
    createdAt: "2025-11-12T10:00:00.000Z",
  },
  {
    id: "biz_9", agencyId: "agency_1", name: "זהב ותכלת — תכשיטים",
    industry: "תכשיטנות", logoUrl: null,
    colorPrimary: "#8C6A2F", colorSecondary: "#FFF8E7", fontFamily: "Assistant",
    keywords: ["טבעות אירוסין", "תכשיט מותאם אישית", "כסף 925", "מתנה לזוגיות"],
    createdAt: "2025-11-13T10:00:00.000Z",
  },
  {
    id: "biz_10", agencyId: "agency_1", name: "פרחי השדה",
    industry: "חנות פרחים", logoUrl: null,
    colorPrimary: "#3B8764", colorSecondary: "#EAF6EF", fontFamily: "Rubik",
    keywords: ["זר יום הולדת", "עיצוב אירועים", "משלוח באותו יום", "פרחי בר"],
    createdAt: "2025-11-14T10:00:00.000Z",
  },
  {
    id: "biz_11", agencyId: "agency_1", name: "מוסך האחים כהן",
    industry: "רכב", logoUrl: null,
    colorPrimary: "#22303B", colorSecondary: "#E7ECEF", fontFamily: "IBM Plex Sans Hebrew",
    keywords: ["טסט מוכן", "בדיקה לפני קנייה", "החלפת שמן", "רכב חלופי"],
    createdAt: "2025-11-15T10:00:00.000Z",
  },
  {
    id: "biz_12", agencyId: "agency_1", name: "החצר האחורית — בר",
    industry: "פאב/בר", logoUrl: null,
    colorPrimary: "#1C1620", colorSecondary: "#FFC53D", fontFamily: "Rubik",
    keywords: ["הפי אאוור", "מוזיקה חיה", "קוקטייל חתימה", "ערב טריוויה"],
    createdAt: "2025-11-16T10:00:00.000Z",
  },
  {
    id: "biz_13", agencyId: "agency_1", name: "INK & CO — סטודיו קעקועים",
    industry: "קעקועים", logoUrl: null,
    colorPrimary: "#111111", colorSecondary: "#FF5A46", fontFamily: "Rubik",
    keywords: ["עיצוב מותאם אישית", "קעקוע קטן", "פגישת ייעוץ", "סטריליות מלאה"],
    createdAt: "2025-11-17T10:00:00.000Z",
  },
  {
    id: "biz_14", agencyId: "agency_1", name: "פיצה נאפולי",
    industry: "פיצרייה", logoUrl: null,
    colorPrimary: "#B3261E", colorSecondary: "#FFF3E0", fontFamily: "Assistant",
    keywords: ["פיצה בטאבון", "משלוחים", "בצק שמור 48 שעות", "ערב משפחות"],
    createdAt: "2025-11-18T10:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Photo shoots + photos — sample data for the first 3 businesses
// ---------------------------------------------------------------------------

export const mockPhotoShoots: PhotoShoot[] = [
  { id: "shoot_1", businessId: "biz_1", label: "צילומי תפריט חורף", shootDate: "2026-01-12", createdAt: "2026-01-12T08:00:00.000Z" },
  { id: "shoot_2", businessId: "biz_2", label: "צילומי בוקר בבית קפה", shootDate: "2026-02-03", createdAt: "2026-02-03T08:00:00.000Z" },
  { id: "shoot_3", businessId: "biz_3", label: "לוקים לפני-אחרי", shootDate: "2026-03-18", createdAt: "2026-03-18T08:00:00.000Z" },
];

export const mockPhotos: Photo[] = [
  { id: "photo_1", shootId: "shoot_1", originalUrl: "/mock/photos/pasta-1.jpg", thumbUrl: "/mock/photos/pasta-1-thumb.jpg", label: "פסטה טרטופו", status: "used", uploadedAt: "2026-01-12T09:00:00.000Z" },
  { id: "photo_2", shootId: "shoot_1", originalUrl: "/mock/photos/pasta-2.jpg", thumbUrl: "/mock/photos/pasta-2-thumb.jpg", label: "שולחן זוגי", status: "available", uploadedAt: "2026-01-12T09:02:00.000Z" },
  { id: "photo_3", shootId: "shoot_2", originalUrl: "/mock/photos/cafe-1.jpg", thumbUrl: "/mock/photos/cafe-1-thumb.jpg", label: "לאטה ארט", status: "available", uploadedAt: "2026-02-03T09:00:00.000Z" },
  { id: "photo_4", shootId: "shoot_3", originalUrl: "/mock/photos/hair-1.jpg", thumbUrl: "/mock/photos/hair-1-thumb.jpg", label: "צביעת בלייג׳", status: "used", uploadedAt: "2026-03-18T09:00:00.000Z" },
];

// ---------------------------------------------------------------------------
// Events — Israeli holidays + international days relevant to small businesses
// ---------------------------------------------------------------------------

export const mockEvents: StudioEvent[] = [
  { id: "evt_1", name: "ראש השנה", emoji: "🍎", type: "holiday", month: 9, day: 14, categories: ["מסעדה", "חנות בגדים", "תכשיטנות"] },
  { id: "evt_2", name: "יום האהבה", emoji: "❤️", type: "international-day", month: 2, day: 14, categories: ["מסעדה", "תכשיטנות", "חנות פרחים"] },
  { id: "evt_3", name: "פורים", emoji: "🎭", type: "holiday", month: 3, day: 3, categories: ["חנות בגדים", "פאב/בר"] },
  { id: "evt_4", name: "יום האישה הבינלאומי", emoji: "💐", type: "international-day", month: 3, day: 8, categories: ["מכון יופי", "חנות פרחים", "יוגה ופילאטיס"] },
  { id: "evt_5", name: "פסח", emoji: "🌿", type: "holiday", month: 4, day: 2, categories: ["מסעדה", "פיצרייה"] },
  { id: "evt_6", name: "יום הכושר הבינלאומי", emoji: "💪", type: "international-day", month: 4, day: 6, categories: ["כושר", "יוגה ופילאטיס"] },
  { id: "evt_7", name: "יום הקפה הבינלאומי", emoji: "☕", type: "international-day", month: 10, day: 1, categories: ["בית קפה"] },
  { id: "evt_8", name: "בלאק פריידי", emoji: "🛍️", type: "international-day", month: 11, day: 27, categories: ["חנות בגדים", "תכשיטנות", "מכון יופי"] },
  { id: "evt_9", name: "חנוכה", emoji: "🕎", type: "holiday", month: 12, day: 15, categories: ["מסעדה", "פיצרייה", "חנות בגדים"] },
  { id: "evt_10", name: "סילבסטר", emoji: "🎉", type: "international-day", month: 12, day: 31, categories: ["פאב/בר", "מסעדה"] },
];

// ---------------------------------------------------------------------------
// Ads — history sample across a few businesses
// ---------------------------------------------------------------------------

export const mockAds: Ad[] = [
  {
    id: "ad_1", businessId: "biz_1", photoId: "photo_1", format: "feed",
    headline: "לילה איטלקי אמיתי", caption: "פסטה טרייה, יין נבחר, ואווירה שמזכירה את רומא. הערב אצלנו.",
    textMode: "auto", outputImageUrl: "/mock/ads/ad-1.jpg", createdAt: "2026-01-13T12:00:00.000Z",
  },
  {
    id: "ad_2", businessId: "biz_3", photoId: "photo_4", format: "story",
    headline: "לוק חדש לקיץ", caption: "תור לצביעת בלייג׳ נפתח השבוע — מוזמנות.",
    textMode: "manual", outputImageUrl: "/mock/ads/ad-2.jpg", createdAt: "2026-03-19T12:00:00.000Z",
  },
  {
    id: "ad_3", businessId: "biz_2", photoId: "photo_3", format: "feed",
    headline: "הבוקר שלך מתחיל כאן", caption: "לאטה חם, שקט, ופינה לעבודה. פתוח מ-7:00.",
    textMode: "auto", outputImageUrl: "/mock/ads/ad-3.jpg", eventId: "evt_7", createdAt: "2026-02-04T12:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Calendar entries — current-ish month sample for biz_1
// ---------------------------------------------------------------------------

export const mockCalendarEntries: CalendarEntry[] = [
  { id: "cal_1", businessId: "biz_1", date: "2026-08-03", status: "ready", adId: "ad_1" },
  { id: "cal_2", businessId: "biz_1", date: "2026-08-07", status: "planned" },
  { id: "cal_3", businessId: "biz_1", date: "2026-08-12", status: "empty" },
  { id: "cal_4", businessId: "biz_1", date: "2026-08-20", status: "planned" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getBusinessesByAgency(agencyId: string): Business[] {
  return mockBusinesses.filter((b) => b.agencyId === agencyId);
}

export function getBusinessById(id: string): Business | undefined {
  return mockBusinesses.find((b) => b.id === id);
}

export function getPhotosByBusiness(businessId: string): Photo[] {
  const shootIds = mockPhotoShoots.filter((s) => s.businessId === businessId).map((s) => s.id);
  return mockPhotos.filter((p) => shootIds.includes(p.shootId));
}

export function getAdsByBusiness(businessId: string): Ad[] {
  return mockAds.filter((a) => a.businessId === businessId);
}