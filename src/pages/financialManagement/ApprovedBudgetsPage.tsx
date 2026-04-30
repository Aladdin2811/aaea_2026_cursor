import ApprovedBudgetsTable from "../../features/financialManagement/budgets/approvedBudgets/ApprovedBudgetsTable";

export default function ApprovedBudgetsPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الموازنات المعتمدة
      </span>
      <ApprovedBudgetsTable />
    </>
  );
}
