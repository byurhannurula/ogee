// Side-effect module: patches history.pushState/replaceState exactly once per
// page so SPA route changes fire a single `tagpeek:nav` window event. Pairs
// with a `popstate` listener on the consumer side. The patch survives even
// if the React tree unmounts/remounts.

export const NAV_EVENT = "tagpeek:nav";

let patched = false;
export function installHistoryPatch() {
  if (patched) return;
  patched = true;

  const fire = () => window.dispatchEvent(new Event(NAV_EVENT));

  const origPush = history.pushState;
  history.pushState = function (
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    const ret = origPush.apply(this, args);
    fire();
    return ret;
  };

  const origReplace = history.replaceState;
  history.replaceState = function (
    this: History,
    ...args: Parameters<History["replaceState"]>
  ) {
    const ret = origReplace.apply(this, args);
    fire();
    return ret;
  };
}
