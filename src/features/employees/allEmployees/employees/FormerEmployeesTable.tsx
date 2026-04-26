import { AllEmployeesSegmentTable } from "../AllEmployeesSegmentTable";
import { ALL_EMPLOYEES_JOB_NATURE_ID } from "../allEmployeesJobNatureIds";

export default function FormerEmployeesTable() {
  return (
    <AllEmployeesSegmentTable
      jobNatureId={ALL_EMPLOYEES_JOB_NATURE_ID.employee}
      listKind="former"
      caption="جدول الموظفين السابقين"
      emptyMessage="لا يوجد موظفون سابقون مطابقون للعرض."
      loadingMessage="جاري تحميل بيانات الموظفين السابقين…"
    />
  );
}
