import { useId, useMemo } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import type { GeneralAccountWithType } from "../../api/apiGeneralAccount";
import { useGeneralAccountSelect } from "../../features/accounts/generalAccount/useGeneralAccount";

type GeneralAccountOption = { value: number; label: string };

function optionLabel(row: GeneralAccountWithType): string {
  const name = row.general_account_name?.trim() ?? "";
  if (name !== "") return name;
  return `حساب #${row.id}`;
}

function toOptions(rows: GeneralAccountWithType[]): GeneralAccountOption[] {
  return rows.map((r) => ({
    value: r.id,
    label: optionLabel(r),
  }));
}

const selectStyles: StylesConfig<
  GeneralAccountOption,
  false,
  GroupBase<GeneralAccountOption>
> = {
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
    maxWidth: "18rem",
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

export type GeneralAccountSelectLabelPosition = "above" | "inline" | "none";

export type GeneralAccountSelectProps = {
  value: number | null;
  onChange: (generalAccountId: number | null) => void;
  /** يُحمَّل من `getAll(accountTypeId)` — عند `null` يبقى الحقل غير فعّال حتى يُحدَّد النوع */
  accountTypeId: number | null;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  labelPosition?: GeneralAccountSelectLabelPosition;
};

/**
 * قائمة اختيار للحسابات العامة المفعّلة (`status === true`) لنوع حساب محدّد — بنفس نمط AccountTypeSelect.
 */
export default function GeneralAccountSelect({
  value,
  onChange,
  accountTypeId,
  disabled = false,
  className = "",
  placeholder,
  "aria-label": ariaLabel = "الحساب العام",
  labelPosition = "above",
}: GeneralAccountSelectProps) {
  const reactSelectId = useId();
  const { isLoading, data, isError, error } = useGeneralAccountSelect(
    accountTypeId ?? undefined,
  );

  const rowsForSelect = useMemo(
    () => (data ?? []).filter((r) => r.status === true),
    [data],
  );
  const options = useMemo(() => toOptions(rowsForSelect), [rowsForSelect]);
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const handleChange = (opt: SingleValue<GeneralAccountOption>) => {
    onChange(opt?.value ?? null);
  };

  const hasType = accountTypeId != null;
  const effectivePlaceholder =
    placeholder ??
    (hasType ? "اختر الحساب العام" : "اختر نوع الحساب أولاً");

  const isDisabled =
    disabled || !hasType || isLoading || options.length === 0;

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

  const fullWidthRowClass = isInline ? "w-full min-w-0 shrink-0 basis-full" : "";

  return (
    <div className={rootClass.trim()} dir="rtl">
      {showLabel ? (
        <label htmlFor={reactSelectId} className={labelClass}>
          الحساب العام
        </label>
      ) : null}
      <Select<GeneralAccountOption, false>
        inputId={reactSelectId}
        instanceId={reactSelectId}
        aria-label={ariaLabel}
        isRtl
        isSearchable={true}
        isClearable={false}
        isLoading={isLoading && hasType}
        isDisabled={isDisabled}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={effectivePlaceholder}
        noOptionsMessage={() =>
          hasType
            ? "لا توجد حسابات عامة مفعّلة لهذا النوع"
            : "اختر نوع الحساب أولاً"
        }
        loadingMessage={() => "جاري التحميل…"}
        menuPosition="fixed"
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        styles={selectStyles}
      />
      {isError ? (
        <p
          className={`text-sm text-destructive ${fullWidthRowClass}`.trim()}
          role="alert"
        >
          {error instanceof Error
            ? error.message
            : "تعذّر تحميل قائمة الحسابات العامة"}
        </p>
      ) : null}
      {!isLoading &&
      !isError &&
      hasType &&
      options.length === 0 ? (
        <p className={`text-sm text-slate-600 ${fullWidthRowClass}`.trim()}>
          لا توجد حسابات عامة مفعلة لنوع الحساب.
        </p>
      ) : null}
    </div>
  );
}
