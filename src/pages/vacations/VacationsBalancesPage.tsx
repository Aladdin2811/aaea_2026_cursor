import VacationsBalancesTable from "../../features/vacations/vacationsBalances/VacationsBalancesTable";

export default function VacationsBalancesPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        أرصدة الإجازات
      </span>
      <VacationsBalancesTable />;
    </>
  );
}
