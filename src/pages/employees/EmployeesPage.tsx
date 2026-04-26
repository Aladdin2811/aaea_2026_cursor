import ContractorsTable from "../../features/employees/allEmployees/contractors/ContractorsTable";
import FormerContractorsTable from "../../features/employees/allEmployees/contractors/FormerContractorsTable";
import EmployeesTable from "../../features/employees/allEmployees/employees/EmployeesTable";
import FormerEmployeesTable from "../../features/employees/allEmployees/employees/FormerEmployeesTable";
import ExpertsTable from "../../features/employees/allEmployees/experts/ExpertsTable";
import FormerExpertsTable from "../../features/employees/allEmployees/experts/FormerExpertsTable";

export default function EmployeesPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الموظفين الحاليين
      </span>
      <EmployeesTable />

      <span className="mt-6 block min-w-0 text-lg font-bold text-slate-900">
        الخبراء الحاليين
      </span>
      <ExpertsTable />

      <span className="mt-6 block min-w-0 text-lg font-bold text-slate-900">
        المتعاقدين الحاليين
      </span>
      <ContractorsTable />

      <span className="mt-6 block min-w-0 text-lg font-bold text-slate-900">
        الموظفين السابقين
      </span>
      <FormerEmployeesTable />

      <span className="mt-6 block min-w-0 text-lg font-bold text-slate-900">
        الخبراء السابقون
      </span>
      <FormerExpertsTable />

      <span className="mt-6 block min-w-0 text-lg font-bold text-slate-900">
        المتعاقدين السابقين
      </span>
      <FormerContractorsTable />
    </>
  );
}
