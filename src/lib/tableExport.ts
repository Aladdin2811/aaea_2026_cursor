import { escapeHtml } from "./tableUtils";

/** تنزيل CSV بترميز UTF-8 مع BOM ليفتح بشكل صحيح في Excel. */
export function downloadUtf8Csv(
  filename: string,
  headers: string[],
  rows: string[][],
): void {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const printTableStyles = `body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}`;

/** طباعة جدول RTL؛ تُهرب كل الخلايا تلقائيًا. */
export function printRtlTable(options: {
  documentTitle: string;
  caption: string;
  headers: string[];
  rows: string[][];
}): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;

  const { documentTitle, caption, headers, rows } = options;
  const rowsHtml = rows
    .map(
      (cells) =>
        `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`,
    )
    .join("");

  popup.document.open();
  popup.document.write(
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>${escapeHtml(documentTitle)}</title><style>${printTableStyles}</style></head><body><table><caption>${escapeHtml(caption)}</caption><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`,
  );
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

/** تنزيل ملف XLS (HTML table) متوافق مع Excel دون مكتبات إضافية. */
export function downloadExcelXls(options: {
  filename: string;
  sheetName: string;
  headers: string[];
  rows: string[][];
}): void {
  const { filename, sheetName, headers, rows } = options;
  const thead = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map((cells) => `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><caption>${escapeHtml(sheetName)}</caption><thead>${thead}</thead><tbody>${tbody}</tbody></table></body></html>`;
  const blob = new Blob(["\uFEFF", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.toLowerCase().endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
