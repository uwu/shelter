import { before } from "spitroast";

function blockOnModal(listener: EventListener) {
  return function (ev: MouseEvent) {
    const modalRoot = document.querySelector(".shltr-modal-rroot");

    // block if the click target is within a shelter modal
    if (modalRoot && modalRoot.contains(ev.target as Element)) return;

    listener.apply(this, arguments);
  };
}

export default () => {
  // discord adds an event listener for every popout opened
  // it uses this to check for clicks outside of the popout to then close it
  // we need to block this event to prevent popouts from closing while a shelter modal is open
  const unpatch1 = before("addEventListener", document, function ([type, listener, options]) {
    if (type === "mousedown" && listener.toString().includes("ignoreModalClicks")) {
      return [type, blockOnModal(listener), options];
    }
  });

  // also block discord's context menu as it's behind the shelter modal and therefore not usable anyways
  const unpatch2 = before("addEventListener", window, function ([type, listener, options]) {
    if (type === "contextmenu" && listener.toString().includes("openContextMenuLazy")) {
      return [type, blockOnModal(listener), options];
    }
  });

  return () => {
    unpatch1();
    unpatch2();
  };
};
