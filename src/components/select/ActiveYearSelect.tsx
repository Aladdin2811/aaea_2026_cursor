import { useId, useMemo } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import type { YearsRow } from "../../api/apiYears";
import { useFetchActivYears } from "../../features/years/year/useYears";

type YearOption = { value: number; label: string };

function toOptions(years: YearsRow[]): YearOption[] {
  return years.map((y) => ({
    value: y.id,
    label:
      y.year_num != null && String(y.year_num).trim() !== ""
        ? String(y.year_num)
        : `سنة #${y.id}`,
  }));
}

const selectStyles: StylesConfig<YearOption, false, GroupBase<YearOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    borderColor: state.isFocused ? "#94a3b8" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 1px #94a3b8" : "none",
    backgroundColor: "#fff",
    cursor: state.isDisabled ? "not-allowed" : "default",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
    zIndex: 20,
  }),
  menuList: (base) => ({ ...base, padding: 4 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#1e293b"
      : state.isFocused
        ? "#f1f5f9"
        : "transparent",
    color: state.isSelected ? "#fff" : "#0f172a",
  }),
  singleValue: (base) => ({ ...base, color: "#0f172a" }),
  placeholder: (base) => ({ ...base, color: "#64748b" }),
  input: (base) => ({ ...base, color: "#0f172a" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#475569" : "#94a3b8",
  }),
};

export type ActiveYearSelectProps = {
  value: number | null;
  onChange: (yearId: number | null) => void;
  /** يوقف التحكم أثناء تهيئة السنة الافتراضية من الصفحة */
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
};

/**
 * قائمة اختيار للسنوات المحاسبية المفعّلة (`status === true`) — مُصمَّمة لإعادة الاستخدام مع `react-select`.
 */
export default function ActiveYearSelect({
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder = "اختر السنة المحاسبية",
  "aria-label": ariaLabel = "السنة المحاسبية",
}: ActiveYearSelectProps) {
  const reactSelectId = useId();
  const { isLoading, data, isError, error } = useFetchActivYears();

  const options = useMemo(() => toOptions(data ?? []), [data]);
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const handleChange = (opt: SingleValue<YearOption>) => {
    onChange(opt?.value ?? null);
  };

  const isDisabled = disabled || isLoading || options.length === 0;

  return (
    <div className={`space-y-1 ${className}`.trim()} dir="rtl">
      <label
        htmlFor={reactSelectId}
        className="block text-sm font-medium text-slate-700"
      >
        السنة المحاسبية
      </label>
      <Select<YearOption, false>
        inputId={reactSelectId}
        instanceId={reactSelectId}
        aria-label={ariaLabel}
        isRtl
        isSearchable={false}
        isClearable={false}
        isLoading={isLoading}
        isDisabled={isDisabled}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => "لا توجد سنوات مفعّلة"}
        loadingMessage={() => "جاري التحميل…"}
        styles={selectStyles}
      />
      {isError ? (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error
            ? error.message
            : "تعذّر تحميل قائمة السنوات"}
        </p>
      ) : null}
      {!isLoading && !isError && options.length === 0 ? (
        <p className="text-sm text-slate-600">
          لا توجد سنوات بحالة مفعّل — راجع إعدادات السنوات.
        </p>
      ) : null}
    </div>
  );
}
