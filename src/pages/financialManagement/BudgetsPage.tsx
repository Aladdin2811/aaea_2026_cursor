import BudgetsTable from "../../features/financialManagement/budgets/budgets/BudgetsTable";

export default function BudgetsPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الإعتمادات المدرجة
      </span>
      <BudgetsTable />
    </>
  );
}
