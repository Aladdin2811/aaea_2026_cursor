import TransfersTable from "../../features/financialManagement/budgets/transfers/TransfersTable";

export default function TransfersPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        المناقلات المنفذة
      </span>
      <TransfersTable />
    </>
  );
}
