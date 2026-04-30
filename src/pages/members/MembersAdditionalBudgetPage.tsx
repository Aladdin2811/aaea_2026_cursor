import MembersAdditionalBudgetTable from "../../features/members/additionalBudget/MembersAdditionalBudgetTable";

export default function MembersAdditionalBudgetPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الموازنة الإضافية المعتمدة
      </span>
      <MembersAdditionalBudgetTable />
    </>
  );
}
