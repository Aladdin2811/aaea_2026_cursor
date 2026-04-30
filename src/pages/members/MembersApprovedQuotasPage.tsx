import MembersApprovedQuotasTable from "../../features/members/membersApprovedQuotas/MembersApprovedQuotasTable";

export default function MembersApprovedQuotasPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        حصص المساهمات المعتمدة
      </span>
      <MembersApprovedQuotasTable />
    </>
  );
}
