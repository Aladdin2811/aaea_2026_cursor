import MembersTable from "../../features/members/members/MembersTable.tsx";

export function MembersPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الدول الأعضاء ونسب المساهمات
      </span>
      <MembersTable />
    </>
  );
}
