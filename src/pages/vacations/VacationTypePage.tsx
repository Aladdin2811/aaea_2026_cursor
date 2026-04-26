import VacationTypeTable from "../../features/vacations/vacationType/VacationTypeTable";

export default function VacationTypePage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        أنواع الإجازات
      </span>
      <div>
        <VacationTypeTable />
      </div>
    </>
  );
}
