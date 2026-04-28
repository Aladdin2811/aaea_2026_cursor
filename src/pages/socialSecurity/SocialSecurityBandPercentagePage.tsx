import SocialSecurityBandPercentageTable from "../../features/socialSecurity/socialSecurityBandPercentage/SocialSecurityBandPercentageTable";

export default function SocialSecurityBandPercentagePage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        نسب التعويض لبنود الضمان الإجتماعي
      </span>

      <SocialSecurityBandPercentageTable />
    </>
  );
}
