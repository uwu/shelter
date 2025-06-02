import { before } from "spitroast";

const documentListenerMap = new WeakMap<EventListener, EventListener>();
const windowListenerMap = new WeakMap<EventListener, EventListener>();

function blockOnModal(listener: EventListener): EventListener {
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
  // also disable arrow key navigation in discord when modals are open
  const unpatchDocument = before("addEventListener", document, function ([type, listener, options]) {
    const stringifiedListener = listener.toString();
    if (
      (type === "mousedown" && stringifiedListener.includes("ignoreModalClicks")) ||
      (type === "keydown" && stringifiedListener.includes("ARROW_LEFT"))
    ) {
      if (!documentListenerMap.has(listener)) {
        documentListenerMap.set(listener, blockOnModal(listener));
      }
      return [type, documentListenerMap.get(listener)!, options];
    }
  });

  // also block discord's context menu as it's behind the shelter modal and therefore not usable anyways
  // gif picker also needs to be blocked from closing when a shelter modal is open
  const unpatchWindow = before("addEventListener", window, function ([type, listener, options]) {
    const stringifiedListener = listener.toString();
    if (
      (type === "contextmenu" && stringifiedListener.includes("-webkit-user-select")) ||
      (type === "mousedown" && stringifiedListener.includes("data-menu-item"))
    ) {
      if (!windowListenerMap.has(listener)) {
        windowListenerMap.set(listener, blockOnModal(listener));
      }
      return [type, windowListenerMap.get(listener)!, options];
    }
  });

  // weakmap should let the garbage collector clean up unused listeners
  // but i dont know if its enough, so we also patch removeEventListener to make sure listener is deleted
  const unpatchRemoveDocument = before("removeEventListener", document, ([type, listener, options]) => {
    const patched = documentListenerMap.get(listener);
    if (patched) {
      documentListenerMap.delete(listener);
      return [type, patched, options];
    }
  });

  const unpatchRemoveWindow = before("removeEventListener", window, ([type, listener, options]) => {
    const patched = windowListenerMap.get(listener);
    if (patched) {
      windowListenerMap.delete(listener);
      return [type, patched, options];
    }
  });

  return () => {
    unpatchDocument();
    unpatchWindow();
    unpatchRemoveDocument();
    unpatchRemoveWindow();
  };
};
