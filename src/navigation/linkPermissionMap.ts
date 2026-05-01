/**
 * ربط روابط القائمة (`NavChild.to`) بأكواد صلاحية (أي واحدة تكفي).
 * الروابط غير المذكورة: تظهر لكل مسجّل عند تفعيل التصفية إن لم يُفرض عليها قاعدة في `routePermissionRules`.
 */
export const navLinkRequiredPermissions: Readonly<
  Record<string, readonly string[]>
> = {
  "/financial_management/transfers": ["page.financial.transfers"],
  "/financial_management/budgets": ["page.financial.budgets"],
  "/financial_management/approved_budgets": ["page.financial.approved_budgets"],
  "/members/contributions": ["page.members.contributions"],
  "/members": ["page.members.root"],
  "/settings/users": ["page.settings.users"],
  "/settings/roles": ["page.settings.roles"],
};

export function navLinkPermissionCodes(to: string): readonly string[] | null {
  return navLinkRequiredPermissions[to] ?? null;
}
