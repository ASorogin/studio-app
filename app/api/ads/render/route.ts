// app/api/ads/render/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildAdHtml, FORMAT_DIMENSIONS } from "@/lib/render-ad";

const BUCKET = "business-photos";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "לא נמצא משתמש" }, { status: 401 });
  }

  const { businessId, photoId, headline, caption, format, textMode, eventId } = await request.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) {
    return NextResponse.json({ error: "תמונה לא נמצאה" }, { status: 404 });
  }

  const dims = FORMAT_DIMENSIONS[format as string] ?? FORMAT_DIMENSIONS.feed;
  const html = buildAdHtml({
    photoUrl: photo.originalUrl,
    headline,
    caption,
    business,
    width: dims.width,
    height: dims.height,
  });

  let browser;
  try {
    if (process.env.NODE_ENV === "production") {
      const chromium = (await import("@sparticuz/chromium")).default;
      const { chromium: playwrightChromium } = await import("playwright-core");
      browser = await playwrightChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      const { chromium: playwrightChromium } = await import("playwright");
      browser = await playwrightChromium.launch();
    }

    const page = await browser.newPage({ viewport: { width: dims.width, height: dims.height } });
    await page.setContent(html, { waitUntil: "networkidle" });
    const screenshot = await page.screenshot({ type: "png" });
    await browser.close();

    const admin = createAdminClient();
    const path = `${dbUser.agencyId}/${businessId}/ads/${Date.now()}.png`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, screenshot, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);

    const ad = await prisma.ad.create({
      data: {
        businessId,
        photoId,
        format,
        headline,
        caption,
        textMode: textMode ?? "auto",
        outputImageUrl: publicUrlData.publicUrl,
        eventId: eventId ?? null,
      },
    });

    await prisma.photo.update({ where: { id: photoId }, data: { status: "used" } });

    return NextResponse.json({ ok: true, ad });
  } catch (err) {
    console.error("שגיאה ברינדור הפרסומת:", err);
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json({ error: "שגיאה ברינדור הפרסומת" }, { status: 500 });
  }
}