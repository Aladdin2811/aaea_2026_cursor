import SocialSecurityContractorsContributionTable from "../../features/socialSecurity/socialSecurityContractorsContribution/SocialSecurityContractorsContributionTable";
import SocialSecurityEmployeeContributionTable from "../../features/socialSecurity/socialSecurityEmployeeContribution/SocialSecurityEmployeeContributionTable";
import SocialSecurityOrganizationContributionTable from "../../features/socialSecurity/socialSecurityOrganizationContribution/SocialSecurityOrganizationContributionTable";

export default function SocialSecurityContributionPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        مساهمة الهيئة في الضمان الإجتماعي
      </span>

      <SocialSecurityOrganizationContributionTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        مساهمة الموظفين في الضمان الإجتماعي
      </span>

      <SocialSecurityEmployeeContributionTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        مساهمة المتعاقدين في الضمان الإجتماعي
      </span>

      <SocialSecurityContractorsContributionTable />
    </>
  );
}
