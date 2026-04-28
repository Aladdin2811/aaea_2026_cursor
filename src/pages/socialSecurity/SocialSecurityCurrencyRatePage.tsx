import SocialSecurityCurrencyRateTable from "../../features/socialSecurity/socialSecurityCurrencyRate/SocialSecurityCurrencyRateTable";

export default function SocialSecurityCurrencyRatePage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        سعر الصرف المتعامل به في الضمان الإجتماعي
      </span>

      <SocialSecurityCurrencyRateTable />
    </>
  );
}
