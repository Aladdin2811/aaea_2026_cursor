import { AllEmployeesSegmentTable } from "../AllEmployeesSegmentTable";
import { ALL_EMPLOYEES_JOB_NATURE_ID } from "../allEmployeesJobNatureIds";

export default function ExpertsTable() {
  return (
    <AllEmployeesSegmentTable
      jobNatureId={ALL_EMPLOYEES_JOB_NATURE_ID.expert}
      caption="جدول الخبراء الحاليين"
      emptyMessage="لا يوجد خبراء مطابقون للعرض."
      loadingMessage="جاري تحميل بيانات الخبراء…"
    />
  );
}
