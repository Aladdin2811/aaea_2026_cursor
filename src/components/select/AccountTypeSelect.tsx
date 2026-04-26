import { useId, useMemo } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import type { AccountTypeRow } from "../../api/apiAccountType";
import { useFetchAccountType } from "../../features/accounts/accountType/useAccountType";

type AccountTypeOption = { value: number; label: string };

function toOptions(rows: AccountTypeRow[]): AccountTypeOption[] {
  return rows.map((r) => ({
    value: r.id,
    label:
      r.account_type_name != null &&
      String(r.account_type_name).trim() !== ""
        ? String(r.account_type_name).trim()
        : `نوع #${r.id}`,
  }));
}

const selectStyles: StylesConfig<
  AccountTypeOption,
  false,
  GroupBase<AccountTypeOption>
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
    maxWidth: "min(100%, 20rem)",
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
    maxWidth: "16rem",
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

/** موضع التسمية المرئية بالنسبة لحقل الاختيار */
export type AccountTypeSelectLabelPosition = "above" | "inline" | "none";

export type AccountTypeSelectProps = {
  value: number | null;
  onChange: (accountTypeId: number | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  /**
   * `above`: التسمية فوق الحقل (افتراضي).
   * `inline`: التسمية بجانب الحقل (مناسب لـ RTL مع `dir="rtl"` على الحاوية).
   * `none`: بدون تسمية مرئية — يُعتمد على `aria-label` و`placeholder` للوصولية.
   */
  labelPosition?: AccountTypeSelectLabelPosition;
};

/**
 * قائمة اختيار لأنواع الحساب ذات الحالة مفعّل (`status === true`) — بنفس نمط ActiveYearSelect مع react-select.
 */
export default function AccountTypeSelect({
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder = "اختر نوع الحساب",
  "aria-label": ariaLabel = "نوع الحساب",
  labelPosition = "above",
}: AccountTypeSelectProps) {
  const reactSelectId = useId();
  const { isLoading, data, isError, error } = useFetchAccountType();

  const rowsForSelect = useMemo(
    () => (data ?? []).filter((r) => r.status === true),
    [data],
  );
  const options = useMemo(() => toOptions(rowsForSelect), [rowsForSelect]);
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const handleChange = (opt: SingleValue<AccountTypeOption>) => {
    onChange(opt?.value ?? null);
  };

  const isDisabled = disabled || isLoading || options.length === 0;

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
          نوع الحساب
        </label>
      ) : null}
      <Select<AccountTypeOption, false>
        inputId={reactSelectId}
        instanceId={reactSelectId}
        aria-label={ariaLabel}
        isRtl
        isSearchable={true}
        isClearable={false}
        isLoading={isLoading}
        isDisabled={isDisabled}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => "لا توجد أنواع حسابات مفعّلة"}
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
            : "تعذّر تحميل قائمة أنواع الحسابات"}
        </p>
      ) : null}
      {!isLoading && !isError && options.length === 0 ? (
        <p className={`text-sm text-slate-600 ${fullWidthRowClass}`.trim()}>
          لا توجد أنواع حسابات بحالة مفعّلة.
        </p>
      ) : null}
    </div>
  );
}
