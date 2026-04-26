import { useId, useMemo } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import type { AllEmployeesWithRelations } from "../../api/apiAllEmployees";
import { useFetchAllEmployees } from "../../features/employees/allEmployees/useEmployees";

type Option = { value: number; label: string };

function sortKeyNullableId(v: number | null): number {
  if (v == null || !Number.isFinite(v)) return Number.POSITIVE_INFINITY;
  return v;
}

function compareHiringDate(a: string | null, b: string | null): number {
  const aEmpty = a == null || a === "";
  const bEmpty = b == null || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  return a.localeCompare(b);
}

/** موظفون بحالة فعّالة (`status === true`) — مرتبون كما في جداول شؤون الموظفين. */
function toSortedActiveEmployees(
  rows: AllEmployeesWithRelations[],
): AllEmployeesWithRelations[] {
  const filtered = rows.filter((r) => r.status === true);
  return [...filtered].sort((a, b) => {
    const c =
      sortKeyNullableId(a.job_category_id) -
      sortKeyNullableId(b.job_category_id);
    if (c !== 0) return c;
    const g =
      sortKeyNullableId(a.job_grade_id) - sortKeyNullableId(b.job_grade_id);
    if (g !== 0) return g;
    const h = compareHiringDate(a.hiring_date, b.hiring_date);
    if (h !== 0) return h;
    return a.id - b.id;
  });
}

function toOptions(rows: AllEmployeesWithRelations[]): Option[] {
  return rows.map((r) => {
    const name = r.employee_name?.trim() || "—";
    return {
      value: r.id,
      label: name,
    };
  });
}

const selectStyles: StylesConfig<Option, false, GroupBase<Option>> = {
  container: (base) => ({
    ...base,
    display: "inline-block",
    width: "auto",
    maxWidth: "100%",
  }),
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    minWidth: "18rem",
    width: "max-content",
    maxWidth: "min(100%, 24rem)",
    borderRadius: 8,
    borderColor: state.isFocused ? "#94a3b8" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 1px #94a3b8" : "none",
    backgroundColor: "#fff",
    cursor: state.isDisabled ? "not-allowed" : "default",
  }),
  valueContainer: (base) => ({
    ...base,
    paddingInline: "0.5rem 0.25rem",
    flexWrap: "nowrap",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
    zIndex: 50,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 50,
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
  input: (base) => ({ ...base, color: "#0f172a", margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#475569" : "#94a3b8",
  }),
};

export type CurrentEmployeesSelectLabelPosition = "above" | "inline" | "none";

export type CurrentEmployeesSelectProps = {
  value: number | null;
  onChange: (employeeId: number | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  labelPosition?: CurrentEmployeesSelectLabelPosition;
};

/**
 * اختيار من جميع الموظفين ذوي الحالة المفعّلة (`status === true`) — التسمية: الاسم فقط.
 */
export default function CurrentEmployeesSelect({
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder = "اختر الموظف",
  "aria-label": ariaLabel = "الموظف",
  labelPosition = "inline",
}: CurrentEmployeesSelectProps) {
  const reactSelectId = useId();
  const { isLoading, data, isError, error } = useFetchAllEmployees();

  const options = useMemo(
    () => toOptions(toSortedActiveEmployees(data ?? [])),
    [data],
  );

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const handleChange = (opt: SingleValue<Option>) => {
    onChange(opt?.value ?? null);
  };

  const isDisabled = disabled || isLoading;

  const isInline = labelPosition === "inline";
  const showLabel = labelPosition !== "none";
  const rootClass = [
    "w-fit max-w-full",
    isInline
      ? "inline-flex flex-row flex-wrap items-center gap-x-3 gap-y-1"
      : "flex flex-col gap-1",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = isInline
    ? "shrink-0 text-sm font-medium text-slate-700"
    : "block text-sm font-medium text-slate-700";

  const fullWidthRowClass = isInline
    ? "w-full min-w-0 shrink-0 basis-full"
    : "";

  return (
    <div className={rootClass.trim()} dir="rtl">
      {showLabel ? (
        <label htmlFor={reactSelectId} className={labelClass}>
          الموظف
        </label>
      ) : null}
      <Select<Option, false>
        inputId={reactSelectId}
        instanceId={reactSelectId}
        aria-label={ariaLabel}
        isRtl
        isSearchable
        isClearable
        isLoading={isLoading}
        isDisabled={isDisabled}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => "لا يوجد موظفون مطابقون"}
        loadingMessage={() => "جاري التحميل…"}
        menuPosition="fixed"
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        formatOptionLabel={(opt) => (
          <span className="min-w-0" title={opt.label}>
            {opt.label}
          </span>
        )}
        styles={selectStyles}
      />
      {isError ? (
        <p
          className={`text-sm text-destructive ${fullWidthRowClass}`.trim()}
          role="alert"
        >
          {error instanceof Error
            ? error.message
            : "تعذّر تحميل قائمة الموظفين"}
        </p>
      ) : null}
      {!isLoading && !isError && options.length === 0 ? (
        <p className={`text-sm text-slate-600 ${fullWidthRowClass}`.trim()}>
          لا يوجد موظفون بحالة فعّالة للاختيار.
        </p>
      ) : null}
    </div>
  );
}
