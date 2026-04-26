import EmployeesBanksTable from "../../features/employees/employeesBanks/EmployeesBanksTable";

export default function EmployeesBanksPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الحسابات البنكية للموظفين
      </span>

      <EmployeesBanksTable />
    </>
  );
}
