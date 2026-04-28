import SocialSecurityBandLimitTable from "../../features/socialSecurity/socialSecurityBandLimit/SocialSecurityBandLimitTable";

export default function SocialSecurityBandLimitPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        أسقف التعويض لبنود الضمان الإجتماعي
      </span>

      <SocialSecurityBandLimitTable />
    </>
  );
}
