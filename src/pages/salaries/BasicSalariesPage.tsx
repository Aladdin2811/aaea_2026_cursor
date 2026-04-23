import ContractorsBasicSalariesTable from "../../features/salaries/contractorsBasicSalaries/ContractorsBasicSalariesTable";
import EmployeesBasicSalariesTable from "../../features/salaries/employeesBasicSalaries/EmployeesBasicSalariesTable";
import ExpertsBasicSalariesTable from "../../features/salaries/expertsBasicSalaries/ExpertsBasicSalariesTable";

export default function BasicSalariesPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        الرواتب الأساسية للموظفين
      </span>

      <EmployeesBasicSalariesTable />

      <div className="mt-4 text-sm text-slate-700">
        (*) يتم زيادة نسبة 40% على تعويض غلاء المعيشة وذلك استناداً الى قرار
        مجلس جامعة الدول العربية رقم (7355) فى دورته العادية (135) بتاريخ
        2011/03/02، بزيادة بدل غلاء المعيشة بنسبة 40% لموظفي الأمانة العامة
        بالمقر، على ان لا تدخل هذه الزيادة ضمن مكافأة نهاية الخدمة، وقد وافق
        المجلس الاقتصادي والاجتماعي بموجب قراره رقم (2026) بتاريخ 2014/09/11، فى
        دورته العادية (94) على تطبيق الزيادة بنسبة 40% فى تعويض غلاء المعيشة
        والتى اقرها مجلس الجامعة فى القرار المشار اليه اعلاه لموظفي المنظمات
        العربية المتخصصة، على أن يتم تطبيق الزيادة من تاريخ موافقة المجلس
        الاقتصادي والاجتماعي ، وعلى أن لا تدخل هذه الزيادة ضمن مكافأة نهاية
        الخدمة.
      </div>

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        الرواتب الأساسية للمتعاقدين
      </span>

      <ContractorsBasicSalariesTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        المكافآت الأساسية للخبراء
      </span>

      <ExpertsBasicSalariesTable />
    </>
  );
}
