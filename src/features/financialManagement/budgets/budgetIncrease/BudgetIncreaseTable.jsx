import Table from "../../../ui/Table";
import Menus from "../../../ui/Menus";
import Empty from "../../../ui/Empty";
import Spinner from "../../../ui/Spinner";
import { useFetchBudgetIncrease } from "./useBudgetIncrease";
import BudgetIncreaseRow from "./BudgetIncreaseRow";

function BudgetIncreaseTable() {
  const { isLoading, data } = useFetchBudgetIncrease();

  if (isLoading) return <Spinner />;
  if (!data.length) return <Empty />;

  return (
    <Menus>
      <Table columns="0.1fr 0.05fr 4fr 1fr 1fr 1fr 1fr ;">
        <Table.Header>
          <div>#</div>
          <div></div>
          <div>الحساب</div>
          <div>مصدر التمويل</div>
          <div>مبلغ الزيادة</div>
          <div>السنة</div>
          <div>ملاحظات</div>
        </Table.Header>

        <Table.Body
          data={data}
          render={(data, index) => (
            <BudgetIncreaseRow data={data} index={index + 1} key={data.id} />
          )}
        />
      </Table>
    </Menus>
  );
}

export default BudgetIncreaseTable;
