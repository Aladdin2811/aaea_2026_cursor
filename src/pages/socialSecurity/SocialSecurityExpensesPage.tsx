import SocialSecurityExpensesWorkspace from "../../features/socialSecurity/socialSecurityExpenses/SocialSecurityExpensesWorkspace";

export default function SocialSecurityExpensesPage() {
  return (
    <>
      <span className="mb-4 block min-w-0 text-lg font-bold text-slate-900">
        مصروفات التعويض الصحي (الضمان الاجتماعي)
      </span>
      <SocialSecurityExpensesWorkspace />
    </>
  );
}
