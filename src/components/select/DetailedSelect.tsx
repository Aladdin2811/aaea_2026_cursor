import { useId, useMemo } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import type { DetailedWithRelations } from "../../api/apiDetailed";
import { useDetailedSelect } from "../../features/accounts/detailed/useDetailed";
import { REACT_SELECT_MENU_Z_INDEX } from "./reactSelectMenuZIndex";

type DetailedOption = { value: number; label: string };

function optionLabel(row: DetailedWithRelations): string {
  const name = row.detailed_name?.trim() ?? "";
  if (name !== "") return name;
  return `حساب تفصيلي #${row.id}`;
}

function toOptions(rows: DetailedWithRelations[]): DetailedOption[] {
  return rows.map((r) => ({
    value: r.id,
    label: optionLabel(r),
  }));
}

function createSelectStyles(
  fullWidth: boolean,
): StylesConfig<DetailedOption, false, GroupBase<DetailedOption>> {
  return {
    container: (base) => ({
      ...base,
      display: fullWidth ? "block" : "inline-block",
      width: fullWidth ? "100%" : "auto",
      maxWidth: "100%",
    }),
  control: (base, state) => ({
    ...base,
    minHeight: 40,
      minWidth: fullWidth ? "100%" : "18rem",
      width: fullWidth ? "100%" : "max-content",
      maxWidth: fullWidth ? "100%" : "min(100%, 20rem)",
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
    zIndex: REACT_SELECT_MENU_Z_INDEX,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: REACT_SELECT_MENU_Z_INDEX,
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
}

export type DetailedSelectLabelPosition = "above" | "inline" | "none";

export type DetailedSelectProps = {
  value: number | null;
  onChange: (detailedId: number | null) => void;
  /** يُحمَّل عبر `getForSelect(no3Id)` — عند `null` يبقى الحقل غير فعّال */
  no3Id: number | null;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  labelPosition?: DetailedSelectLabelPosition;
};

/**
 * قائمة اختيار للحسابات التفصيلية المفعّلة (`getForSelect` يفلتر `status === true`) للنوع (no3) المحدّد.
 */
export default function DetailedSelect({
  value,
  onChange,
  no3Id,
  fullWidth = false,
  disabled = false,
  className = "",
  placeholder,
  "aria-label": ariaLabel = "الحساب التفصيلي",
  labelPosition = "above",
}: DetailedSelectProps) {
  const reactSelectId = useId();
  const { isLoading, data, isError, error } = useDetailedSelect(
    no3Id ?? undefined,
  );

  const options = useMemo(() => toOptions(data ?? []), [data]);
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const handleChange = (opt: SingleValue<DetailedOption>) => {
    onChange(opt?.value ?? null);
  };

  const hasNo3 = no3Id != null;
  const effectivePlaceholder =
    placeholder ??
    (hasNo3 ? "اختر الحساب التفصيلي" : "اختر النوع أولاً");

  const isDisabled =
    disabled || !hasNo3 || isLoading || options.length === 0;

  const isInline = labelPosition === "inline";
  const showLabel = labelPosition !== "none";
  const rootClass = [
    fullWidth ? "w-full max-w-full" : "w-fit max-w-full",
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
          الحساب التفصيلي
        </label>
      ) : null}
      <Select<DetailedOption, false>
        inputId={reactSelectId}
        instanceId={reactSelectId}
        aria-label={ariaLabel}
        isRtl
        isSearchable={true}
        isClearable={false}
        isLoading={isLoading && hasNo3}
        isDisabled={isDisabled}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={effectivePlaceholder}
        noOptionsMessage={() =>
          hasNo3
            ? "لا توجد حسابات تفصيلية مفعّلة لهذا النوع"
            : "اختر النوع أولاً"
        }
        loadingMessage={() => "جاري التحميل…"}
        menuPosition="fixed"
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        styles={createSelectStyles(fullWidth)}
      />
      {isError ? (
        <p
          className={`text-sm text-destructive ${fullWidthRowClass}`.trim()}
          role="alert"
        >
          {error instanceof Error
            ? error.message
            : "تعذّر تحميل قائمة الحسابات التفصيلية"}
        </p>
      ) : null}
      {!isLoading && !isError && hasNo3 && options.length === 0 ? (
        <p className={`text-sm text-slate-600 ${fullWidthRowClass}`.trim()}>
          لا توجد حسابات تفصيلية مفعّلة لهذا النوع.
        </p>
      ) : null}
    </div>
  );
}
