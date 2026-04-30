import AdditionalBudgetPaymentTable from "../../features/members/additionalBudgetPayment/AdditionalBudgetPaymentTable";

export default function MembersAdditionalBudgetPaymentPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        المسدد من الموازنة الإضافية
      </span>
      <AdditionalBudgetPaymentTable />
    </>
  );
}
