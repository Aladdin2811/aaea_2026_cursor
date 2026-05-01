import type { NavGroup } from "./mainNav";
import { ENABLE_PATH_PERMISSION_CHECK } from "../config/accessPolicy";
import { navLinkPermissionCodes } from "./linkPermissionMap";

/** يخفي عناصر القائمة التي لا يملك المستخدم أي صلاحية من المطلوبة لها */
export function filterNavGroupsForPermissions(
  groups: readonly NavGroup[],
  codeSet: ReadonlySet<string>,
): NavGroup[] {
  if (!ENABLE_PATH_PERMISSION_CHECK) {
    return [...groups];
  }

  return groups
    .map((g) => ({
      ...g,
      children: g.children.filter((c) => {
        const req = navLinkPermissionCodes(c.to);
        if (req == null || req.length === 0) return true;
        return req.some((code) => codeSet.has(code));
      }),
    }))
    .filter((g) => g.children.length > 0);
}
