type DateConverterProps = {
  dateString: string | null | undefined;
  fallback?: string;
  className?: string;
  locale?: string;
  format?: "short" | "long";
};

function parseDateValue(value: string): Date | null {
  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]) - 1;
    const d = Number(dateOnly[3]);
    return new Date(Date.UTC(y, m, d));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateArabic(
  value: string | null | undefined,
  fallback: string,
  locale: string,
  format: "short" | "long",
): string {
  if (!value || String(value).trim() === "") return fallback;
  const d = parseDateValue(String(value));
  if (!d) return fallback;

  if (format === "short") {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

const DateConverter = ({
  dateString,
  fallback = "—",
  className,
  locale = "ar-TN-u-ca-gregory-nu-latn",
  format = "short",
}: DateConverterProps) => {
  const formattedDate = formatDateArabic(dateString, fallback, locale, format);
  return <span className={className}>{formattedDate}</span>;
};

export default DateConverter;
