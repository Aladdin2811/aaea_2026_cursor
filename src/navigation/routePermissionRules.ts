import { matchPath } from "react-router-dom";

/**
 * مسارات تتطلب صلاحية عند تفعيل `ENABLE_PATH_PERMISSION_CHECK`.
 * المسارات غير المذكورة هنا: أي مستخدم مسجّل يمكنه فتحها (اعتماد تدريجي).
 * ضع الأنماط الأكثر تحديدًا أولًا.
 */
export type RoutePermissionRule = {
  pathPattern: string;
  end?: boolean;
  /** يكفي أن يملك المستخدم واحدة من هذه الأكواد */
  anyOf: readonly string[];
};

export const routePermissionRules: readonly RoutePermissionRule[] = [
  {
    pathPattern: "/financial_management/transfers",
    end: true,
    anyOf: ["page.financial.transfers"],
  },
  {
    pathPattern: "/financial_management/budgets",
    end: true,
    anyOf: ["page.financial.budgets"],
  },
  {
    pathPattern: "/financial_management/approved_budgets",
    end: true,
    anyOf: ["page.financial.approved_budgets"],
  },
  {
    pathPattern: "/members/contributions",
    end: true,
    anyOf: ["page.members.contributions"],
  },
  {
    pathPattern: "/members",
    end: true,
    anyOf: ["page.members.root"],
  },
  {
    pathPattern: "/settings/users",
    end: true,
    anyOf: ["page.settings.users"],
  },
  {
    pathPattern: "/settings/roles",
    end: true,
    anyOf: ["page.settings.roles"],
  },
];

export function requiredPermissionCodesForPath(
  pathname: string,
): readonly string[] | null {
  for (const rule of routePermissionRules) {
    const m = matchPath(
      { path: rule.pathPattern, end: rule.end ?? false },
      pathname,
    );
    if (m != null) return rule.anyOf;
  }
  return null;
}
