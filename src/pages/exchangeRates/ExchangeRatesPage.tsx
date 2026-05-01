import { useMemo, useState } from "react";
import ActiveYearSelect from "../../components/select/ActiveYearSelect";
import ExchangeRatesTable from "../../features/exchangeRates/ExchangeRatesTable";
import { useCaptureStbAchatNow } from "../../features/exchangeRates/useExchangeRates";
import { useExchangeRatesYearFromLocation } from "../../features/exchangeRates/useExchangeRatesYearFromLocation";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { REACT_SELECT_MENU_Z_INDEX } from "../../components/select/reactSelectMenuZIndex";

type MonthOption = { value: number; label: string };

const monthOptions: MonthOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Intl.DateTimeFormat("ar-TN-u-ca-gregory-nu-arab", {
    month: "long",
  }).format(new Date(2026, i, 1)),
}));

const monthSelectStyles: StylesConfig<MonthOption, false, GroupBase<MonthOption>> = {
  container: (base) => ({ ...base, minWidth: "12rem" }),
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderRadius: 8,
    borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 1px #94a3b8" : "none",
  }),
  menu: (base) => ({ ...base, zIndex: REACT_SELECT_MENU_Z_INDEX }),
  menuPortal: (base) => ({ ...base, zIndex: REACT_SELECT_MENU_Z_INDEX }),
  indicatorSeparator: () => ({ display: "none" }),
};

export default function ExchangeRatesPage() {
  const { yearId, yearIdFromParam, loadingCurrent, setYearInSearch } =
    useExchangeRatesYearFromLocation();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const captureMutation = useCaptureStbAchatNow();
  const selectedMonthOption = useMemo(
    () => monthOptions.find((m) => m.value === selectedMonth) ?? null,
    [selectedMonth],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4" dir="rtl">
      <div className="flex flex-wrap items-end gap-2">
        <ActiveYearSelect
          value={yearId}
          onChange={(id) => {
            if (id != null) setYearInSearch(id);
          }}
          disabled={yearIdFromParam == null && loadingCurrent}
        />
        <label
          htmlFor="exchange-rates-month-filter"
          className="flex flex-col gap-1 text-sm text-slate-700"
        >
          <span>الشهر</span>
          <Select<MonthOption, false>
            inputId="exchange-rates-month-filter"
            instanceId="exchange-rates-month-filter"
            isRtl
            isSearchable
            isClearable
            options={monthOptions}
            value={selectedMonthOption}
            onChange={(option: SingleValue<MonthOption>) =>
              setSelectedMonth(option?.value ?? null)
            }
            placeholder="اختر الشهر"
            noOptionsMessage={() => "لا توجد خيارات"}
            menuPosition="fixed"
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            styles={monthSelectStyles}
          />
        </label>
        <button
          type="button"
          className="self-end rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          onClick={() => captureMutation.mutate()}
          disabled={captureMutation.isPending}
        >
          {captureMutation.isPending
            ? "جاري الجلب..."
            : "تشغيل الجلب اليدوي الآن"}
        </button>
      </div>
      <ExchangeRatesTable selectedMonth={selectedMonth} />
    </div>
  );
}
