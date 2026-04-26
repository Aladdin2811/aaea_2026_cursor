import { useEffect, useState } from "react";
import AccountTypeSelect from "../components/select/AccountTypeSelect";
import ActiveYearSelect from "../components/select/ActiveYearSelect";
import GeneralAccountSelect from "../components/select/GeneralAccountSelect";
import BabSelect from "../components/select/BabSelect";
import BandSelect from "../components/select/BandSelect";
import No3Select from "../components/select/No3Select";
import DetailedSelect from "../components/select/DetailedSelect";
import ProgramsSelect from "../components/select/ProgramsSelect";

/**
 * صفحة مؤقتة لاختبار مكوّنات الـ select — يُرجى حذفها لاحقاً مع المسار `test` من الراوتر.
 */
export default function Test() {
  const [yearId, setYearId] = useState<number | null>(null);
  const [programId, setProgramId] = useState<number | null>(null);
  const [accountTypeId, setAccountTypeId] = useState<number | null>(null);
  const [generalAccountId, setGeneralAccountId] = useState<number | null>(null);
  const [babId, setBabId] = useState<number | null>(null);
  const [bandId, setBandId] = useState<number | null>(null);
  const [no3Id, setNo3Id] = useState<number | null>(null);
  const [detailedId, setDetailedId] = useState<number | null>(null);

  useEffect(() => {
    setProgramId(null);
  }, [yearId]);

  useEffect(() => {
    setGeneralAccountId(null);
    setBabId(null);
    setBandId(null);
    setNo3Id(null);
    setDetailedId(null);
  }, [accountTypeId]);

  useEffect(() => {
    setBabId(null);
    setBandId(null);
    setNo3Id(null);
    setDetailedId(null);
  }, [generalAccountId]);

  useEffect(() => {
    setBandId(null);
    setNo3Id(null);
    setDetailedId(null);
  }, [babId]);

  useEffect(() => {
    setNo3Id(null);
    setDetailedId(null);
  }, [bandId]);

  useEffect(() => {
    setDetailedId(null);
  }, [no3Id]);

  useEffect(() => {
    setProgramId(null);
  }, [babId, bandId, detailedId]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6" dir="rtl">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          اختبار Select (مؤقت)
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          ProgramsSelect: سنة + أحد (باب / بند / حساب تفصيلي) ثم البرنامج — وباقي
          السلسلة للاختبار — مواضع التسمية: فوق، بجانب، بدون.
        </p>
        <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
          yearId: {yearId === null ? "null" : yearId} — programId:{" "}
          {programId === null ? "null" : programId} — accountTypeId:{" "}
          {accountTypeId === null ? "null" : accountTypeId} — generalAccountId:{" "}
          {generalAccountId === null ? "null" : generalAccountId} — babId:{" "}
          {babId === null ? "null" : babId} — bandId:{" "}
          {bandId === null ? "null" : bandId} — no3Id:{" "}
          {no3Id === null ? "null" : no3Id} — detailedId:{" "}
          {detailedId === null ? "null" : detailedId}
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">تسمية فوق الحقل</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
          <ActiveYearSelect
            value={yearId}
            onChange={setYearId}
            labelPosition="above"
          />
          <AccountTypeSelect
            value={accountTypeId}
            onChange={setAccountTypeId}
            labelPosition="above"
          />
          <GeneralAccountSelect
            accountTypeId={accountTypeId}
            value={generalAccountId}
            onChange={setGeneralAccountId}
            labelPosition="above"
          />
          <BabSelect
            generalAccountId={generalAccountId}
            value={babId}
            onChange={setBabId}
            labelPosition="above"
          />
          <BandSelect
            babId={babId}
            value={bandId}
            onChange={setBandId}
            labelPosition="above"
          />
          <No3Select
            bandId={bandId}
            value={no3Id}
            onChange={setNo3Id}
            labelPosition="above"
          />
          <DetailedSelect
            no3Id={no3Id}
            value={detailedId}
            onChange={setDetailedId}
            labelPosition="above"
          />
          <ProgramsSelect
            yearId={yearId}
            babId={babId}
            bandId={bandId}
            detailedId={detailedId}
            value={programId}
            onChange={setProgramId}
            labelPosition="above"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">تسمية بجانب الحقل</h2>
        <div className="flex flex-col gap-4">
          <ActiveYearSelect
            value={yearId}
            onChange={setYearId}
            labelPosition="inline"
          />
          <AccountTypeSelect
            value={accountTypeId}
            onChange={setAccountTypeId}
            labelPosition="inline"
          />
          <GeneralAccountSelect
            accountTypeId={accountTypeId}
            value={generalAccountId}
            onChange={setGeneralAccountId}
            labelPosition="inline"
          />
          <BabSelect
            generalAccountId={generalAccountId}
            value={babId}
            onChange={setBabId}
            labelPosition="inline"
          />
          <BandSelect
            babId={babId}
            value={bandId}
            onChange={setBandId}
            labelPosition="inline"
          />
          <No3Select
            bandId={bandId}
            value={no3Id}
            onChange={setNo3Id}
            labelPosition="inline"
          />
          <DetailedSelect
            no3Id={no3Id}
            value={detailedId}
            onChange={setDetailedId}
            labelPosition="inline"
          />
          <ProgramsSelect
            yearId={yearId}
            babId={babId}
            bandId={bandId}
            detailedId={detailedId}
            value={programId}
            onChange={setProgramId}
            labelPosition="inline"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-slate-800">بدون تسمية مرئية</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <ActiveYearSelect
            value={yearId}
            onChange={setYearId}
            labelPosition="none"
          />
          <AccountTypeSelect
            value={accountTypeId}
            onChange={setAccountTypeId}
            labelPosition="none"
          />
          <GeneralAccountSelect
            accountTypeId={accountTypeId}
            value={generalAccountId}
            onChange={setGeneralAccountId}
            labelPosition="none"
          />
          <BabSelect
            generalAccountId={generalAccountId}
            value={babId}
            onChange={setBabId}
            labelPosition="none"
          />
          <BandSelect
            babId={babId}
            value={bandId}
            onChange={setBandId}
            labelPosition="none"
          />
          <No3Select
            bandId={bandId}
            value={no3Id}
            onChange={setNo3Id}
            labelPosition="none"
          />
          <DetailedSelect
            no3Id={no3Id}
            value={detailedId}
            onChange={setDetailedId}
            labelPosition="none"
          />
          <ProgramsSelect
            yearId={yearId}
            babId={babId}
            bandId={bandId}
            detailedId={detailedId}
            value={programId}
            onChange={setProgramId}
            labelPosition="none"
          />
        </div>
      </section>
    </div>
  );
}
