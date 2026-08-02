// app/(dashboard)/billing/page.tsx
"use client";

import { Check } from "lucide-react";
import { mockAgency, mockBusinesses } from "@/lib/mock-data";
import type { PlanTier } from "@/lib/mock-data";

const plans: {
  id: PlanTier;
  name: string;
  price: string;
  businessLimit: string;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: "₪0",
    businessLimit: "עד 2 עסקים",
    features: ["יצירת פרסומות בסיסית", "טקסט אוטומטי מוגבל", "ללא תמיכה מועדפת"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₪149 / חודש",
    businessLimit: "עד 15 עסקים",
    features: ["יצירת פרסומות ללא הגבלה", "טקסט אוטומטי מלא", "תכנון תוכן חודשי", "תמיכה מועדפת"],
  },
  {
    id: "max",
    name: "Max",
    price: "₪349 / חודש",
    businessLimit: "עסקים ללא הגבלה",
    features: ["כל מה שיש ב-Pro", "Batch generation", "גישה מוקדמת לפיצ׳רים חדשים", "מנהל לקוח ייעודי"],
  },
];

export default function BillingPage() {
  const currentPlan = mockAgency.plan;
  const businessCount = mockBusinesses.filter((b) => b.agencyId === mockAgency.id).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">תשלום ומנוי</h2>
        <p className="font-util text-sm text-ink/60">
          המסלול הנוכחי: <span className="font-semibold text-ink">{currentPlan}</span> · {businessCount} עסקים פעילים
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`flex flex-col gap-4 rounded-card border p-6 shadow-card ${
                isCurrent ? "border-flash bg-flash/5" : "border-border bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-sm bg-flash px-2 py-0.5 font-util text-[10px] font-semibold text-flash-ink">
                      פעיל
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-ink">{plan.price}</p>
                <p className="font-util text-xs text-ink/50">{plan.businessLimit}</p>
              </div>

              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body text-sm text-ink/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent}
                className="mt-auto rounded-sm bg-flash px-4 py-2 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isCurrent ? "המסלול הנוכחי" : "שדרוג למסלול זה"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h3 className="mb-3 font-display text-base font-semibold text-ink">פרטי חיוב</h3>
        <p className="font-body text-sm text-ink/50">
          אין אמצעי תשלום מחובר עדיין — חיבור ל-Stripe מתוכנן לשלב 6.
        </p>
      </div>
    </div>
  );
}