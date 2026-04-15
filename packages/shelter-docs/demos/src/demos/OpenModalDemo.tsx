import {
  Button,
  ButtonColors,
  Text,
  openModal,
  ModalRoot,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalSizes,
  ButtonSizes,
} from "@uwu/shelter-ui";

export default function OpenModalDemo() {
  const handleOpenModal = () => {
    openModal((props) => {
      return (
        <ModalRoot size={ModalSizes.SMALL}>
          <ModalHeader close={props.close}>Hello from a Modal</ModalHeader>
          <ModalBody>
            <Text>This modal was opened using openModal(). Click outside or the button to close.</Text>
          </ModalBody>
          <ModalFooter>
            <Button color={ButtonColors.PRIMARY} onClick={props.close}>
              Got it!
            </Button>
          </ModalFooter>
        </ModalRoot>
      );
    });
  };

  return (
    <Button color={ButtonColors.PRIMARY} size={ButtonSizes.MEDIUM} onClick={handleOpenModal}>
      Open Modal
    </Button>
  );
}
