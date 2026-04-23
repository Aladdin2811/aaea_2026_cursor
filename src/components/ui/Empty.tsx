import { cx } from "../../lib/cx";

export type EmptyProps = {
  className?: string;
  title?: string;
  description?: string;
};

/**
 * حالة فارغة بسيطة — قابلة لإعادة الاستخدام في الصفحات والجداول.
 */
export function Empty({
  className,
  title = "لا توجد بيانات",
  description,
}: EmptyProps) {
  return (
    <div
      role="status"
      dir="rtl"
      className={cx(
        "flex min-h-[180px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/90 px-4 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? (
        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
