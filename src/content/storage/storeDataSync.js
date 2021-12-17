export function storeDataSync(key, value) {
  chrome.storage.local.set({ key: value });
}
