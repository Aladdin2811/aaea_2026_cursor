import JobCategoryTable from "../../features/jobs/jobCategory/JobCategoryTable";
import JobGradeTable from "../../features/jobs/jobGrade/JobGradeTable";
import JobNatureTable from "../../features/jobs/jobNature/JobNatureTable";
import JobTitleTable from "../../features/jobs/jobTitle/JobTitleTable";

export default function JobsPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        أنواع الوظائف
      </span>

      <JobNatureTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        الفئات الوظيفة
      </span>

      <JobCategoryTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        الدرجات الوظيفة
      </span>

      <JobGradeTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        المسميات الوظيفية
      </span>

      <JobTitleTable />
    </>
  );
}
