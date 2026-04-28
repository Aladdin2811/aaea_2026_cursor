import SocialSecurityBandTable from "../../features/socialSecurity/socialSecurityBand/SocialSecurityBandTable";

export default function SocialSecurityBandPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        بنود الضمان الإجتماعي
      </span>

      <SocialSecurityBandTable />
    </>
  );
}
