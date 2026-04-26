import { AllEmployeesSegmentTable } from "../AllEmployeesSegmentTable";
import { ALL_EMPLOYEES_JOB_NATURE_ID } from "../allEmployeesJobNatureIds";

export default function EmployeesTable() {
  return (
    <AllEmployeesSegmentTable
      jobNatureId={ALL_EMPLOYEES_JOB_NATURE_ID.employee}
      caption="جدول الموظفين الحاليين"
      emptyMessage="لا يوجد موظفون مطابقون للعرض."
      loadingMessage="جاري تحميل بيانات الموظفين…"
    />
  );
}
