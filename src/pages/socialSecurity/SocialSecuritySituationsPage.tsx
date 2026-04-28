import SocialSecuritySituationsTable from "../../features/socialSecurity/socialSecuritySituations/SocialSecuritySituationsTable";

export default function SocialSecuritySituationsPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الأوضاع الإجتماعية في الضمان الإجتماعي
      </span>

      <SocialSecuritySituationsTable />
    </>
  );
}
