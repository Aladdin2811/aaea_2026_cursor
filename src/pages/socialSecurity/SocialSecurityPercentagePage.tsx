import SocialSecurityPercentageTable from "../../features/socialSecurity/socialSecurityPercentage/SocialSecurityPercentageTable";

export default function SocialSecurityPercentagePage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        نسب التعويض المعمول بها في الضمان الإجتماعي
      </span>

      <SocialSecurityPercentageTable />
    </>
  );
}
