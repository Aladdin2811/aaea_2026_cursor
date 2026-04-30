import MembersContributionsTable from "../../features/members/membersContributions/MembersContributionsTable";

export default function MembersContributionsPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        المساهمات المسددة
      </span>
      <MembersContributionsTable />
    </>
  );
}
