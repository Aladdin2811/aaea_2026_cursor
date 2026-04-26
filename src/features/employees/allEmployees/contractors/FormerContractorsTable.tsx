import { AllEmployeesSegmentTable } from "../AllEmployeesSegmentTable";
import { ALL_EMPLOYEES_JOB_NATURE_ID } from "../allEmployeesJobNatureIds";

export default function FormerContractorsTable() {
  return (
    <AllEmployeesSegmentTable
      jobNatureId={ALL_EMPLOYEES_JOB_NATURE_ID.contractor}
      listKind="former"
      caption="جدول المتعاقدين السابقين"
      emptyMessage="لا يوجد متعاقدون سابقون مطابقون للعرض."
      loadingMessage="جاري تحميل بيانات المتعاقدين السابقين…"
    />
  );
}
