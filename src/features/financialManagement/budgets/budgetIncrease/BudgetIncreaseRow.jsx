import Table from "../../../ui/Table";
import { HiPencil, HiTrash } from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Menus from "../../../ui/Menus";
import DecimalConverter from "../../../utils/DecimalConverter";
import ConfirmDelete from "../../../ui/ConfirmDelete";
import UpdateBudgetIncrease from "./UpdateBudgetIncrease";

function BudgetIncreaseRow({ data, index }) {
  const {
    id,
    year_id,
    increase_budget,
    notes,
    bab,
    band,
    no3,
    detailed,
    funding_type,
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

            <Modal.Window name="edit" title="تعديل بيانات ترفيع الإعتمادات">
              <UpdateBudgetIncrease />
            </Modal.Window>

            <Modal.Window name="delete">
              <ConfirmDelete
                resourceName="ترفيع الإعتمادات"
                // disabled={isDeleting}
                // onConfirm={deleteAccountType(id)}
              />
            </Modal.Window>
          </Menus.Menu>
        </Modal>
      </div>
      <Table.Cell align="right">
        {bab.bab_name}
        <br />
        {band.band_name}
        <br />
        {no3?.no3_name}
        <br />
        {detailed?.detailed_name}
      </Table.Cell>
      <Table.Cell align="right">{funding_type.funding_type_name}</Table.Cell>
      <Table.Cell align="right">
        <DecimalConverter number={increase_budget} decimalPlaces={2} />
      </Table.Cell>
      <Table.Cell align="right">{year_id}</Table.Cell>

      <Table.Cell align="right">{notes}</Table.Cell>
    </Table.Row>
  );
}

export default BudgetIncreaseRow;
