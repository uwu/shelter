// code source: https://github.com/KaiHax/kaihax/blob/master/src/patcher.ts

type MutationNode = HTMLElement | SVGElement;
type ObserverCb = (e: MutationNode) => void;
const observations = new Set<[string, ObserverCb]>();

const observer = new MutationObserver((records) => {
  // de-dupe to be sure
  const changedElems = new Set<MutationNode>();

  for (const record of records) {
    changedElems.add(record.target as MutationNode);

    for (const e of record.removedNodes)
      if (e instanceof HTMLElement || e instanceof SVGElement) changedElems.add(e as MutationNode);
  }

  for (const elem of changedElems)
    for (const [sel, cb] of observations) {
      if (elem.matches(sel)) cb(elem);
      elem.querySelectorAll(sel).forEach((e) => (e instanceof HTMLElement || e instanceof SVGElement) && cb(e));
    }
});

const startObserving = () =>
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
  });

const stopObserving = () => observer.disconnect();

export function observe(sel: string, cb: ObserverCb) {
  if (observations.size === 0) startObserving();

  const entry: [string, ObserverCb] = [sel, cb];
  observations.add(entry);

  return () => {
    observations.delete(entry);
    if (observations.size === 0) stopObserving();
  };
}

export function unobserve() {
  observations.clear();
  stopObserving();
}
