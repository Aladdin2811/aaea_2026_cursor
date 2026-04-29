import { Check } from "lucide-react";
import { cx } from "../../lib/cx";

export type TableStatusTone = "active" | "inactive" | "neutral";

type Parsed =
  | { empty: true }
  | { empty: false; label: string; tone: TableStatusTone };

const POS = new Set([
  "true",
  "yes",
  "y",
  "1",
  "on",
  "active",
  "enable",
  "enabled",
  "ok",
  "نعم",
  "مفعل",
  "مُفعّل",
  "فعال",
  "فعّال",
  "تشغيل",
]);

const NEG = new Set([
  "false",
  "no",
  "n",
  "0",
  "off",
  "inactive",
  "disabled",
  "disable",
  "لا",
  "غير",
  "معطل",
  "مُعطّل",
  "إيقاف",
  "ايقاف",
]);

function parseStatus(
  value: unknown,
  activeLabel: string,
  inactiveLabel: string,
): Parsed {
  if (value == null) return { empty: true };
  if (value === "") return { empty: true };
  if (typeof value === "boolean") {
    return {
      empty: false,
      label: value ? activeLabel : inactiveLabel,
      tone: value ? "active" : "inactive",
    };
  }
  if (typeof value === "number") {
    if (value === 1) {
      return { empty: false, label: activeLabel, tone: "active" };
    }
    if (value === 0) {
      return { empty: false, label: inactiveLabel, tone: "inactive" };
    }
  }
  const raw = String(value).trim();
  if (raw === "") return { empty: true };
  const key = raw.toLowerCase();
  if (POS.has(key)) {
    return { empty: false, label: activeLabel, tone: "active" };
  }
  if (NEG.has(key)) {
    return { empty: false, label: inactiveLabel, tone: "inactive" };
  }
  return { empty: false, label: raw, tone: "neutral" };
}

export type TableStatusBadgeProps = {
  value: unknown;
  /** وصف الحالة الإيجابية (مثال: فعّال / عضو بالهيئة) */
  activeLabel?: string;
  /** وصف الحالة السالبة (مثال: غير فعّال / ليس عضواً) */
  inactiveLabel?: string;
  /** `checkbox`: مربع اختيار بألوان التطبيق · `badge`: شارة نصية */
  variant?: "checkbox" | "badge";
  /** عرض التسمية بجانب الـ checkbox (افتراضي: false) */
  showLabel?: boolean;
  className?: string;
};

/**
 * عرض حالة (منطقية/نصية) بشكل مُوحّد: افتراضياً **checkbox** بألوان فيروز/زمرد،
 * مع تحويل `true`/`1`/`yes`… إلى تسمية عربية.
 */
export function TableStatusBadge({
  value,
  activeLabel = "فعّال",
  inactiveLabel = "غير فعّال",
  variant = "checkbox",
  showLabel = false,
  className,
}: TableStatusBadgeProps) {
  const p = parseStatus(value, activeLabel, inactiveLabel);
  if (p.empty) {
    return <span className="text-slate-400">—</span>;
  }

  if (variant === "badge") {
    return (
      <span
        className={cx(
          "inline-flex min-h-[1.5rem] max-w-full min-w-0 items-center justify-center rounded-lg border px-2.5 py-0.5 text-center text-xs font-medium leading-tight [overflow-wrap:anywhere]",
          p.tone === "active" &&
            "border-emerald-200/90 bg-gradient-to-b from-emerald-50/98 to-teal-50/85 text-emerald-900 shadow-sm shadow-emerald-900/10",
          p.tone === "inactive" &&
            "border-slate-200/90 bg-slate-50/95 text-slate-600",
          p.tone === "neutral" &&
            "border-teal-100/80 bg-gradient-to-b from-white to-teal-50/50 text-slate-800 shadow-sm",
          className,
        )}
      >
        {p.label}
      </span>
    );
  }

  const checked = p.tone === "active";
  const indeterminate = p.tone === "neutral";

  return (
    <div
      className={cx(
        "inline-flex max-w-full min-w-0 items-center justify-center gap-2",
        className,
      )}
      role="checkbox"
      aria-readonly="true"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={p.label}
      title={!showLabel ? p.label : undefined}
    >
      <span
        className={cx(
          "inline-flex size-5 shrink-0 items-center justify-center rounded border-2 transition-[border-color,background-color,box-shadow]",
          checked &&
            "border-emerald-600 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-900/20",
          !checked &&
            !indeterminate &&
            "border-slate-300 bg-white shadow-sm shadow-slate-200/40",
          indeterminate &&
            "border-teal-400/80 bg-gradient-to-b from-teal-50/90 to-white",
        )}
        aria-hidden
      >
        {checked && (
          <Check
            className="size-3.5 stroke-[3] text-white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {indeterminate && (
          <span className="block h-0.5 w-2.5 rounded-full bg-teal-500" />
        )}
      </span>
      {showLabel && (
        <span
          className={cx(
            "min-w-0 text-start text-xs font-medium leading-tight [overflow-wrap:anywhere]",
            p.tone === "active" && "text-emerald-900",
            p.tone === "inactive" && "text-slate-600",
            p.tone === "neutral" && "text-slate-800",
          )}
          aria-hidden
        >
          {p.label}
        </span>
      )}
    </div>
  );
}
