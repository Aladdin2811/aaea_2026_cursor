/**
 * يتحقق من أن مسارات القائمة (mainNav) تطابق أنماطًا معرفة في الراوتر.
 * التشغيل: npm run check:nav
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { matchPath } from "react-router-dom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const navPath = path.join(root, "src", "navigation", "mainNav.ts");
const routesDir = path.join(root, "src", "app", "routes");
const routerPath = path.join(root, "src", "app", "router.tsx");

const navSrc = fs.readFileSync(navPath, "utf8");
const navTos = [...navSrc.matchAll(/to:\s*"([^"]+)"/g)].map((m) => m[1]);

let routesBlob = fs.readFileSync(routerPath, "utf8");
for (const f of fs.readdirSync(routesDir)) {
  if (f.endsWith(".tsx")) {
    routesBlob += fs.readFileSync(path.join(routesDir, f), "utf8");
  }
}

const routePaths = [
  ...routesBlob.matchAll(/path:\s*"([^"]+)"/g),
].map((m) => m[1]);

const hasIndexChild = /\{\s*index:\s*true/.test(routesBlob);

function pathnameForNav(to) {
  if (to === "/" || to === "") return "/";
  const s = to.startsWith("/") ? to : `/${to}`;
  return s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s;
}

function routePatternForMatch(relativePath) {
  if (relativePath === "" || relativePath === "/") return "/";
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
}

let failed = 0;
for (const to of navTos) {
  const pathname = pathnameForNav(to);
  if (pathname === "/") {
    if (!hasIndexChild) {
      console.error(`[check-nav] الرئيسية "/" بدون مسار index في الراوتر.`);
      failed += 1;
    }
    continue;
  }

  const matched = routePaths.some((rp) => {
    if (rp === "*") return false;
    const pattern = routePatternForMatch(rp);
    return (
      matchPath({ path: pattern, end: true }, pathname) != null ||
      matchPath({ path: pattern, end: false }, pathname) != null
    );
  });

  if (!matched) {
    console.error(
      `[check-nav] لا يوجد مسار مطابق لعنصر القائمة: ${to} (pathname=${pathname})`,
    );
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(
  `[check-nav] تم التحقق من ${navTos.length} رابطًا في القائمة الرئيسية.`,
);
