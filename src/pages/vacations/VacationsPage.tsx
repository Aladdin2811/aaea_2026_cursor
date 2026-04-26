import VacationsTable from "../../features/vacations/vacations/VacationsTable";

export default function VacationsPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الإجازات الممنوحة
      </span>
      <VacationsTable />
    </>
  );
}
