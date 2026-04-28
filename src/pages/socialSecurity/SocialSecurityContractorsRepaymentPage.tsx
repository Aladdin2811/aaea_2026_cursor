import SocialSecurityContractorsRepaymentTable from "../../features/socialSecurity/socialSecurityContractorsRepayment/SocialSecurityContractorsRepaymentTable";

export default function SocialSecurityContractorsRepaymentPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        نسبه تعويض المتعاقدين في الضمان الإجتماعي
      </span>

      <SocialSecurityContractorsRepaymentTable />
    </>
  );
}
