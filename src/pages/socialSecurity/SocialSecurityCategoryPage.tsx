import SocialSecurityCategoryTable from "../../features/socialSecurity/socialSecurityCategory/SocialSecurityCategoryTable";
import SocialSecurityClassificationTable from "../../features/socialSecurity/socialSecurityClassification/SocialSecurityClassificationTable";

export default function SocialSecurityCategoryPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        فئات الموظفين في الضمان الإجتماعي
      </span>

      <SocialSecurityCategoryTable />

      <span className="block min-w-0 text-lg font-bold text-slate-900">
        تصنيف المستفيدين من الضمان الإجتماعي
      </span>

      <SocialSecurityClassificationTable />
    </>
  );
}
