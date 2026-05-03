import { matchPath } from "react-router-dom";

/**
 * مسارات تتطلب صلاحية عند تفعيل `ENABLE_PATH_PERMISSION_CHECK`.
 * المسارات غير المذكورة هنا: أي مستخدم مسجّل يمكنه فتحها (اعتماد تدريجي).
 * ضع الأنماط الأكثر تحديدًا أولًا.
 *
 * ---------------------------------------------------------------------------
 * عقد إضافة ميزة تصل لمسار جديد أو لبيانات جديدة (قبل أن يصعب التراجع):
 *
 * 1) **المسار**: عرّف `path` في الملف المناسب تحت `src/app/routes/` وادمجه
 *    في `protectedChildRoutes` عبر ذلك الملف.
 * 2) **القائمة**: إن أضفت رابطاً في `src/navigation/mainNav.ts`، شغّل
 *    `npm run check:nav` (أو انتظر CI) للتأكد أن `to` يطابق الراوتر.
 * 3) **صلاحية المسار**: إن كان يجب تقييد الوصول، أضف قاعدة هنا
 *    (`pathPattern` + `anyOf`) واطّلع على `src/config/accessPolicy.ts`
 *    (`ENABLE_PATH_PERMISSION_CHECK`).
 * 4) **الصلاحيات في DB**: أكواد `anyOf` يجب أن تُمنح للأدوار عبر هجرات
 *    أو إدارة الأدوار — وإلا سيُوجّه المستخدم إلى `access-denied`.
 * 5) **الأمان الفعلي للبيانات**: RLS وسياسات Postgres و`GRANT` على الجداول
 *    والدوال؛ الواجهة لا تحمي البيانات وحدها.
 * 6) **طبقة الواجهة**: استدعاءات `src/api/` يجب أن تتوافق مع ما يسمح به
 *    الدور في الخلفية (سياسات + دوال).
 *
 * قالب PR: `.github/pull_request_template.md`
 * ---------------------------------------------------------------------------
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
