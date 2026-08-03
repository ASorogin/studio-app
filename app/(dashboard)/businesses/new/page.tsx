// app/(dashboard)/businesses/new/page.tsx
import { BusinessCreateForm } from "@/components/business-create-form";

export default function NewBusinessPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">הוספת עסק חדש</h2>
        <p className="font-util text-sm text-ink/60">מלאי את הפרטים הבסיסיים כדי להתחיל</p>
      </div>
      <BusinessCreateForm />
    </div>
  );
}