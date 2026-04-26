import Button from "../../ui/Button";
import SignupForm from "./SignupForm";
import Modal from "../../ui/Modal";

function AddUser() {
  return (
    <div>
      <Modal>
        <Modal.Open opens="signup-form">
          <Button>تسجيل مستخدم جديد للبرنامج</Button>
        </Modal.Open>
        <Modal.Window name="signup-form" title="تسجيل مستخدم جديد للبرنامج">
          <SignupForm />
        </Modal.Window>
      </Modal>
    </div>
  );
}

export default AddUser;
