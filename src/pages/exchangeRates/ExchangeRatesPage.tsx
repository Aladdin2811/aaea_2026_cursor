import ActiveYearSelect from "../../components/select/ActiveYearSelect";
import ExchangeRatesTable from "../../features/exchangeRates/ExchangeRatesTable";
import { useExchangeRatesYearFromLocation } from "../../features/exchangeRates/useExchangeRatesYearFromLocation";

export default function ExchangeRatesPage() {
  const { yearId, yearIdFromParam, loadingCurrent, setYearInSearch } =
    useExchangeRatesYearFromLocation();

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4" dir="rtl">
      <div className="max-w-sm">
        <ActiveYearSelect
          value={yearId}
          onChange={(id) => {
            if (id != null) setYearInSearch(id);
          }}
          disabled={yearIdFromParam == null && loadingCurrent}
        />
      </div>
      <ExchangeRatesTable />
    </div>
  );
}
