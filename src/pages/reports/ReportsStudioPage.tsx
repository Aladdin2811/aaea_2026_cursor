import { useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf/dist/jspdf.es.min.js";
import html2canvas from "html2canvas";

type ReportRow = {
  code: string;
  statement: string;
  creditUsd: number;
  debitUsd: number;
  equivalentTnd: number;
};

function formatAmount(n: number) {
  return new Intl.NumberFormat("ar-TN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export default function ReportsStudioPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [voucherNo, setVoucherNo] = useState("13");
  const [voucherDate, setVoucherDate] = useState("2026/04/28");
  const [amountTnd, setAmountTnd] = useState(7130850);
  const [accountNo, setAccountNo] = useState("10404100907724484070");
  const [title, setTitle] = useState("تحويل رقم (3)");
  const [subtitle, setSubtitle] = useState("قيد صرف");
  const [narration, setNarration] = useState(
    "يصرف المبلغ: فقط سبعة أيام ومائة وثلاثون دينار تونسي و8500 مليما لأغير. إلى: السادة الموظفين والمتعاقدين بالهيئة.",
  );
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const [rows, setRows] = useState<ReportRow[]>([
    {
      code: "6-1-01-00-00",
      statement: "ح/ موظفين - صندوق التعويض الصحي",
      creditUsd: 0,
      debitUsd: 0,
      equivalentTnd: 7127754,
    },
    {
      code: "6-4-01-00-00",
      statement: "ح/ مصروفات مختلفة (صندوق الضمان الاجتماعي)",
      creditUsd: 0,
      debitUsd: 0,
      equivalentTnd: 3096,
    },
    {
      code: "6-3-01-01-00",
      statement: "الشركة التونسية للبنك - صندوق الضمان الاجتماعي",
      creditUsd: 0,
      debitUsd: 0,
      equivalentTnd: 7130850,
    },
  ]);

  const totalEquivalent = useMemo(
    () => rows.reduce((sum, row) => sum + row.equivalentTnd, 0),
    [rows],
  );

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { code: "", statement: "", creditUsd: 0, debitUsd: 0, equivalentTnd: 0 },
    ]);
  };

  const handleRowChange = (
    index: number,
    key: keyof ReportRow,
    value: string | number,
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePdf = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/png");

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("dynamic-report.pdf");
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">استوديو التقارير</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            placeholder="رقم القيد"
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={voucherDate}
            onChange={(e) => setVoucherDate(e.target.value)}
            placeholder="التاريخ"
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={String(amountTnd)}
            onChange={(e) => setAmountTnd(Number(e.target.value) || 0)}
            placeholder="المبلغ"
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="رقم الحساب"
          />
          <input
            type="file"
            accept="image/*"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setBackgroundImage(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان التقرير"
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="عنوان فرعي"
          />
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-3"
            rows={2}
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="نص التقرير"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            onClick={handlePrint}
          >
            طباعة فورية
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => void handleSavePdf()}
          >
            حفظ PDF
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            onClick={handleAddRow}
          >
            إضافة صف جدول
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 print:p-0">
        <div
          ref={reportRef}
          className="report-a4 report-base report-font relative mx-auto min-h-[297mm] w-[210mm] bg-white p-[10mm] text-slate-900 shadow print:shadow-none"
        >
          {backgroundImage ? (
            <img
              src={backgroundImage}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
          ) : null}

          <div className="relative z-10">
            <header className="mb-3 border-b border-slate-500 pb-2">
              <div className="flex items-center justify-between text-sm">
                <span>Arab Atomic Energy Agency</span>
                <span>الهيئة العربية للطاقة الذرية</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span>رقم القيد: {voucherNo}</span>
                <span>التاريخ: {voucherDate}</span>
              </div>
            </header>

            <section className="mb-3 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <h2 className="mt-1 text-xl font-bold underline">{subtitle}</h2>
            </section>

            <section className="mb-3 space-y-1 text-sm leading-7">
              <p>
                <strong>المبلغ:</strong> {formatAmount(amountTnd)} دينار تونسي
              </p>
              <p>
                <strong>حساب رقم:</strong> {accountNo}
              </p>
              <p>{narration}</p>
            </section>

            <section>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-500 p-1.5">كود البند</th>
                    <th className="border border-slate-500 p-1.5">البيان</th>
                    <th className="border border-slate-500 p-1.5">دولار أمريكي (له)</th>
                    <th className="border border-slate-500 p-1.5">دولار أمريكي (منه)</th>
                    <th className="border border-slate-500 p-1.5">القيمة المعادلة</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${row.code}-${i}`}>
                      <td className="border border-slate-400 p-1">
                        <input
                          value={row.code}
                          onChange={(e) =>
                            handleRowChange(i, "code", e.target.value)
                          }
                          className="w-full bg-transparent text-xs outline-none"
                        />
                      </td>
                      <td className="border border-slate-400 p-1">
                        <input
                          value={row.statement}
                          onChange={(e) =>
                            handleRowChange(i, "statement", e.target.value)
                          }
                          className="w-full bg-transparent text-xs outline-none"
                        />
                      </td>
                      <td className="border border-slate-400 p-1 text-center">
                        <input
                          value={row.creditUsd}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "creditUsd",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="w-full bg-transparent text-center outline-none"
                        />
                      </td>
                      <td className="border border-slate-400 p-1 text-center">
                        <input
                          value={row.debitUsd}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "debitUsd",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="w-full bg-transparent text-center outline-none"
                        />
                      </td>
                      <td className="border border-slate-400 p-1 text-center">
                        <input
                          value={row.equivalentTnd}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "equivalentTnd",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="w-full bg-transparent text-center outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mt-3 border-t border-slate-500 pt-2 text-sm">
              <p>
                <strong>مجموع المعاملة:</strong> {formatAmount(totalEquivalent)}
              </p>
              <p className="mt-1">
                <strong>تعويض نفقات العلاج عن شهر:</strong> 26/4
              </p>
            </section>

            <footer className="mt-5 grid grid-cols-4 border border-slate-500 text-center text-xs">
              <div className="min-h-20 border-l border-slate-500 p-2">
                مسؤول الشؤون المالية
              </div>
              <div className="min-h-20 border-l border-slate-500 p-2">
                مدير إدارة الشؤون الإدارية والمالية
              </div>
              <div className="min-h-20 border-l border-slate-500 p-2">
                القسم الداخلي
              </div>
              <div className="min-h-20 p-2">المدير العام</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

