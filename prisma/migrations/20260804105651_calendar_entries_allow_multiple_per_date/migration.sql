-- DropIndex
DROP INDEX "CalendarEntry_businessId_date_key";

-- CreateIndex
CREATE INDEX "CalendarEntry_businessId_date_idx" ON "CalendarEntry"("businessId", "date");
