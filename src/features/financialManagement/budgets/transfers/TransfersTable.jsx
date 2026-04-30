import Spinner from "../../../ui/Spinner";
import Empty from "../../../ui/Empty";
import Menus from "../../../ui/Menus";
import Table from "../../../ui/Table";
import { useFetchTransfers } from "./useTransfers";
import TransfersRow from "./TransfersRow";

function TransfersTable() {
  const { isLoading, data } = useFetchTransfers();

  if (isLoading) return <Spinner />;
  if (!data.length) return <Empty />;

  return (
    <Menus>
      <Table columns="0.05fr 0.05fr 2fr 0.5fr 0.5fr 0.5fr 2fr;">
        <Table.Header>
          <div>#</div>
          <div></div>
          <div>الحساب</div>
          <div>منقول منه</div>
          <div>منقول إليه</div>
          <div>الناريخ</div>
          <div>ملاحظات</div>
        </Table.Header>

        <Table.Body
          data={data}
          render={(data, index) => (
            <TransfersRow data={data} index={index + 1} key={data.id} />
          )}
        />
      </Table>
    </Menus>
  );
}

export default TransfersTable;
