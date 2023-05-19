// code source: https://github.com/KaiHax/kaihax/blob/master/src/patcher.ts

type MutationNode = HTMLElement | SVGElement;
type ObserverCb = (e: MutationNode) => void;

/** [selector, callback, insta-canceled */
type Observation = [string, ObserverCb, boolean];

const observations = new Set<Observation>();

const observer = new MutationObserver((records) => {
  // de-dupe to be sure
  const changedElems = new Set<MutationNode>();

  for (const record of records) {
    changedElems.add(record.target as MutationNode);

    for (const e of record.removedNodes)
      if (e instanceof HTMLElement || e instanceof SVGElement) changedElems.add(e as MutationNode);
  }

  for (const elem of changedElems)
    for (const obs of observations) {
      if (elem.matches(obs[0])) obs[1](elem);
      elem
        .querySelectorAll(obs[0])
        .forEach((e) => !obs[2] && (e instanceof HTMLElement || e instanceof SVGElement) && obs[1](e));
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

  const entry: Observation = [sel, cb, false];
  observations.add(entry);

  const unobs = () => {
    observations.delete(entry);
    if (observations.size === 0) stopObserving();
  };

  unobs.now = () => {
    entry[2] = true;
    unobs();
  };

  return unobs;
}

export function unobserve() {
  observations.clear();
  stopObserving();
}
