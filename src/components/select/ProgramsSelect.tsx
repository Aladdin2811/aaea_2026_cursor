import { useId, useMemo } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import type { ProgramsWithRelations } from "../../api/apiPrograms";
import {
  PROGRAMS_SELECT_BAB_REQUIRES_BAND_ID,
  programsSelectScopeReady,
  useProgramsSelect,
} from "../../features/programs/programs/usePrograms";
import { REACT_SELECT_MENU_Z_INDEX } from "./reactSelectMenuZIndex";

type ProgramOption = { value: number; label: string };

/** مطابقة لـ `TO_CHAR(..., 'DD-MM-YYYY')` لقيم تاريخ من القاعدة */
function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "";
  const part = String(value).trim().slice(0, 10);
  const bits = part.split("-");
  if (bits.length === 3 && bits[0].length === 4) {
    const [y, m, d] = bits;
    return `${d}-${m}-${y}`;
  }
  return "";
}

function pickFirst<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

/**
 * نفس منطق عرض الاسم في SQL (عن بعد / المدينة والدولة / بتاريخ أو فترة).
 */
function buildProgramDisplayLabel(row: ProgramsWithRelations): string {
  const name = row.program_name?.trim() ?? "";
  const city = row.city?.trim() ?? "";
  const wc = pickFirst(row.world_countries);
  const country = wc?.world_country_name?.trim() ?? "";
  const from = formatDateDdMmYyyy(row.from_date);
  const hasEndDate = row.to_date != null && String(row.to_date).trim() !== "";

  if (row.remotely === true) {
    if (!hasEndDate) {
      return `${name} - عن بعد - بتاريخ : ${from}`;
    }
    const to = formatDateDdMmYyyy(row.to_date);
    return `${name} - عن بعد - خلال الفترة : ${from} إلى ${to}`;
  }

  const datePart = !hasEndDate
    ? ` - بتاريخ : ${from}`
    : ` - خلال الفترة : ${from} إلى ${formatDateDdMmYyyy(row.to_date)}`;

  const built = `${name} - ${city} - ${country}${datePart}`;
  const meaningful =
    name !== "" || city !== "" || country !== "" || from !== "" || hasEndDate;
  return meaningful ? built : `برنامج #${row.id}`;
}

function optionLabel(row: ProgramsWithRelations): string {
  return buildProgramDisplayLabel(row);
}

function toOptions(rows: ProgramsWithRelations[]): ProgramOption[] {
  return rows.map((r) => ({
    value: r.id,
    label: optionLabel(r),
  }));
}

const selectStyles: StylesConfig<
  ProgramOption,
  false,
  GroupBase<ProgramOption>
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
    minWidth: "40rem",
    width: "max-content",
    maxWidth: "min(100%, 40rem)",
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

export type ProgramsSelectLabelPosition = "above" | "inline" | "none";

export type ProgramsSelectProps = {
  value: number | null;
  onChange: (programId: number | null) => void;
  /** مُعرّف السنة في جدول `years` (كما في ActiveYearSelect) */
  yearId: number | null;
  /**
   * أحد مستويات الحساب مع السنة — يُفلتر بـ `detailed_id` إن وُجد، وإلا `band_id`،
   * وإلا `bab_id`؛ عند `bab_id = 8` يُشترط `band_id` (أو تفصيلي) قبل الجلب.
   */
  babId?: number | null;
  bandId?: number | null;
  detailedId?: number | null;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  labelPosition?: ProgramsSelectLabelPosition;
};

/**
 * قائمة اختيار للبرامج ذات `status === true` حسب العام + (باب | بند | حساب تفصيلي).
 */
export default function ProgramsSelect({
  value,
  onChange,
  yearId,
  babId = null,
  bandId = null,
  detailedId = null,
  disabled = false,
  className = "",
  placeholder,
  "aria-label": ariaLabel = "البرنامج",
  labelPosition = "above",
}: ProgramsSelectProps) {
  const reactSelectId = useId();
  const selectScope = useMemo(
    () => ({
      yearId: yearId ?? undefined,
      babId: babId ?? undefined,
      bandId: bandId ?? undefined,
      detailedId: detailedId ?? undefined,
    }),
    [yearId, babId, bandId, detailedId],
  );
  const { isLoading, data, isError, error } = useProgramsSelect(selectScope);

  const rowsForSelect = useMemo(
    () => (data ?? []).filter((r) => r.status === true),
    [data],
  );
  const options = useMemo(() => toOptions(rowsForSelect), [rowsForSelect]);
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const handleChange = (opt: SingleValue<ProgramOption>) => {
    onChange(opt?.value ?? null);
  };

  const hasYear = yearId != null;
  const hasScope = programsSelectScopeReady(selectScope);
  const waitingBandForSpecialBab =
    hasYear &&
    babId === PROGRAMS_SELECT_BAB_REQUIRES_BAND_ID &&
    bandId == null &&
    detailedId == null;

  const effectivePlaceholder =
    placeholder ??
    (!hasYear
      ? "اختر العام المالي أولاً"
      : waitingBandForSpecialBab
        ? "اختر البند لهذا الباب"
        : !hasScope
          ? "اختر الباب أو البند أو الحساب التفصيلي"
          : "اختر البرنامج");

  const isDisabled =
    disabled || !hasYear || !hasScope || isLoading || options.length === 0;

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
          البرنامج
        </label>
      ) : null}
      <Select<ProgramOption, false>
        inputId={reactSelectId}
        instanceId={reactSelectId}
        aria-label={ariaLabel}
        isRtl
        isSearchable={true}
        isClearable={false}
        isLoading={isLoading && hasYear && hasScope}
        isDisabled={isDisabled}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={effectivePlaceholder}
        noOptionsMessage={() =>
          !hasYear
            ? "اختر العام المالي أولاً"
            : waitingBandForSpecialBab
              ? "اختر البند لهذا الباب"
              : !hasScope
                ? "اختر الباب أو البند أو الحساب التفصيلي"
                : "لا توجد برامج مفعّلة لهذا التحديد"
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
          {error instanceof Error ? error.message : "تعذّر تحميل قائمة البرامج"}
        </p>
      ) : null}
      {!isLoading && !isError && hasYear && hasScope && options.length === 0 ? (
        <p className={`text-sm text-slate-600 ${fullWidthRowClass}`.trim()}>
          لا توجد برامج مفعّلة لهذا التحديد (السنة والباب/البند/التفصيلي).
        </p>
      ) : null}
    </div>
  );
}
