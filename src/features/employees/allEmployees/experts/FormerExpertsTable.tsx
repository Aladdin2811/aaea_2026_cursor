import { AllEmployeesSegmentTable } from "../AllEmployeesSegmentTable";
import { ALL_EMPLOYEES_JOB_NATURE_ID } from "../allEmployeesJobNatureIds";

export default function FormerExpertsTable() {
  return (
    <AllEmployeesSegmentTable
      jobNatureId={ALL_EMPLOYEES_JOB_NATURE_ID.expert}
      listKind="former"
      caption="جدول الخبراء السابقين"
      emptyMessage="لا يوجد خبراء سابقون مطابقون للعرض."
      loadingMessage="جاري تحميل بيانات الخبراء السابقين…"
    />
  );
}
