import SocialSecurityCurrencyTable from "../../features/socialSecurity/socialSecurityCurrency/SocialSecurityCurrencyTable";

export default function SocialSecurityCurrencyPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        العملات المتعامل بها في الضمان الإجتماعي
      </span>

      <SocialSecurityCurrencyTable />
    </>
  );
}
