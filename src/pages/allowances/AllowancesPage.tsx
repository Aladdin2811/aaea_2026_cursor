import ExpatriationAllowanceTable from "../../features/allowances/expatriationAllowance/ExpatriationAllowanceTable";
import LivingCostIncreaseTable from "../../features/allowances/livingCostIncrease/LivingCostIncreaseTable";
import LuggageAndFurnituresTable from "../../features/allowances/luggageAndFurnitures/LuggageAndFurnituresTable";
import NatureOfWorkTable from "../../features/allowances/natureOfWork/NatureOfWorkTable";
import TravelAllowanceTable from "../../features/allowances/travelAllowance/TravelAllowanceTable";

export default function AllowancesPage() {
  return (
    <>
      <span className="block min-w-0 text-lg font-bold text-slate-900">
        نسبة زيادة بدل المعيشة
      </span>

      <LivingCostIncreaseTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        نسبة بدل الاغتراب
      </span>

      <ExpatriationAllowanceTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        بدل طبيعة العمل
      </span>

      <NatureOfWorkTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        بدل نقل الأمتعة والأثاث
      </span>

      <LuggageAndFurnituresTable />

      <span className="mt-4 block min-w-0 text-lg font-bold text-slate-900">
        تعويض بدل السفر للمهام الرسمية
      </span>

      <TravelAllowanceTable />
    </>
  );
}
