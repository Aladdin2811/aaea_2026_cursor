import Table from "../../../ui/Table";
import { HiPencil, HiTrash } from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Menus from "../../../ui/Menus";
import DecimalConverter from "../../../utils/DecimalConverter";
import DateConverter from "../../../utils/DateConverter";
import ConfirmDelete from "../../../ui/ConfirmDelete";
import UpdateTransfers from "./UpdateTransfers";

function TransfersRow({ data, index }) {
  const {
    id,
    transfer_from,
    transfer_to,
    transfer_date,
    notes,
    bab,
    band,
    no3,
    detailed,
  } = data;

  return (
    <Table.Row>
      <Table.Cell align="center">{index}</Table.Cell>
      <div>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={id} />
            <Menus.List id={id}>
              <Modal.Open opens="edit">
                <Menus.Button icon={<HiPencil />}>تعديل</Menus.Button>
              </Modal.Open>

              <Modal.Open opens="delete">
                <Menus.Button icon={<HiTrash />}>حذف</Menus.Button>
              </Modal.Open>
            </Menus.List>

            <Modal.Window name="edit" title="تعديل بيانات المناقلات">
              <UpdateTransfers />
            </Modal.Window>

            <Modal.Window name="delete">
              <ConfirmDelete
                resourceName="المناقلات"
                // disabled={isDeleting}
                // onConfirm={deleteAccountType(id)}
              />
            </Modal.Window>
          </Menus.Menu>
        </Modal>
      </div>

      <Table.Cell align="right">
        {bab.bab_name}
        <Table.Cell align="right">{band.band_name}</Table.Cell>
        <Table.Cell align="right">{no3?.no3_name}</Table.Cell>
        <Table.Cell align="right">{detailed?.detailed_name}</Table.Cell>
      </Table.Cell>
      <Table.Cell align="right">
        <DecimalConverter number={transfer_from} decimalPlaces={2} />
      </Table.Cell>
      <Table.Cell align="right">
        <DecimalConverter number={transfer_to} decimalPlaces={2} />
      </Table.Cell>
      <Table.Cell align="right">
        <DateConverter dateString={transfer_date} />
      </Table.Cell>

      <Table.Cell align="right">{notes}</Table.Cell>
    </Table.Row>
  );
}

export default TransfersRow;
