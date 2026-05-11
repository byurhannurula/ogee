// chrome.tabs.query can hang in rare edge cases (extension host stalls,
// private window edge cases). Bound it so callers never wait forever —
// resolves to [] on timeout so the popup/SW continue gracefully.

const QUERY_TIMEOUT_MS = 5000;

export function queryTabs(
  info: chrome.tabs.QueryInfo = {},
): Promise<chrome.tabs.Tab[]> {
  if (!chrome?.tabs?.query) return Promise.resolve([]);
  const timeout = new Promise<chrome.tabs.Tab[]>((resolve) =>
    setTimeout(() => resolve([]), QUERY_TIMEOUT_MS),
  );
  return Promise.race([chrome.tabs.query(info), timeout]).catch(() => []);
}

export function queryActiveTab(): Promise<chrome.tabs.Tab[]> {
  return queryTabs({ active: true, currentWindow: true });
}
