import type { ReactNode } from "react";

export type DecimalConverterProps = {
  number: number | string | null | undefined;
  /** عدد خانات عشرية عندما لا يُمرَّر min/max منفصلان */
  decimalPlaces?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** افتراضي: أرقام لاتينية 0–9 */
  locale?: string;
  /** عند null أو NaN أو فراغ */
  emptyDisplay?: ReactNode;
  className?: string;
};

/**
 * عرض رقم بتنسيق لاتيني (مناسب بجانب واجهة عربية).
 * يعرض الصفر؛ القيم غير الرقمية تعرض `emptyDisplay`.
 */
export default function DecimalConverter({
  number,
  decimalPlaces = 2,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
  emptyDisplay = "—",
  className,
}: DecimalConverterProps) {
  if (number === "" || number == null) {
    return (
      <span className={className ?? "tabular-nums"}>{emptyDisplay}</span>
    );
  }

  const numberValue =
    typeof number === "string" ? Number.parseFloat(number) : number;

  if (!Number.isFinite(numberValue)) {
    return (
      <span className={className ?? "tabular-nums"}>{emptyDisplay}</span>
    );
  }

  const min =
    minimumFractionDigits ??
    (maximumFractionDigits != null ? 0 : decimalPlaces);
  const max = maximumFractionDigits ?? decimalPlaces;

  const formatted = numberValue.toLocaleString(locale, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

  return <span className={className ?? "tabular-nums"}>{formatted}</span>;
}
