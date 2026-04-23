import MonthsTable from "../../features/months/MonthsTable";

export default function MonthsPage() {
  return (
    <>
      <MonthsTable />

      <div className="mt-4 text-sm text-slate-700">
        الشهر (1) مصر والسودان واليمن ودول الخليج العربي
        <br />
        الشهر (2) تونس والجزائر
        <br />
        الشهر (3) العراق وسوريا و لبنان والأردن وفلسطين
        <br />
        الشهر (4) المغرب
        <br />
        الشهر (5) موريتانيا
      </div>
    </>
  );
}
