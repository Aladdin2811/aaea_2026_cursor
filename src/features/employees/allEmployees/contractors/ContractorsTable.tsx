import { AllEmployeesSegmentTable } from "../AllEmployeesSegmentTable";
import { ALL_EMPLOYEES_JOB_NATURE_ID } from "../allEmployeesJobNatureIds";

export default function ContractorsTable() {
  return (
    <AllEmployeesSegmentTable
      jobNatureId={ALL_EMPLOYEES_JOB_NATURE_ID.contractor}
      caption="جدول المتعاقدين الحاليين"
      emptyMessage="لا يوجد متعاقدون مطابقون للعرض."
      loadingMessage="جاري تحميل بيانات المتعاقدين…"
    />
  );
}
