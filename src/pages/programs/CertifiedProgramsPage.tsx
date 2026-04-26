import ActiveYearSelect from "../../components/select/ActiveYearSelect";
import CertifiedProgramsTable from "../../features/programs/CertifiedProgramsTable";
import { useCertifiedProgramsYearFromLocation } from "../../features/programs/useCertifiedProgramsYearFromLocation";

export default function CertifiedProgramsPage() {
  const { yearId, yearIdFromParam, loadingCurrent, setYearInSearch } =
    useCertifiedProgramsYearFromLocation();

  return (
    <div
      className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="relative isolate z-[25] max-w-md pb-1">
        <ActiveYearSelect
          value={yearId}
          onChange={(id) => {
            if (id != null) setYearInSearch(id);
          }}
          disabled={yearIdFromParam == null && loadingCurrent}
          labelPosition="inline"
          placeholder="اختر العام المالي"
          aria-label="اختيار العام المالي : لعرض الأنشطة المعتمدة"
        />
      </div>

      <CertifiedProgramsTable
        yearId={yearId}
        loadingYearContext={yearIdFromParam == null && loadingCurrent}
      />
    </div>
  );
}
