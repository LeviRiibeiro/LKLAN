let blockedDomainsCache = [];

async function refreshBlockedDomains() {
  try {
    const response = await fetch("http://192.168.1.1:8000/blocked-sites");
    if (response.ok) {
      blockedDomainsCache = await response.json();
    }
  } catch (e) {
    blockedDomainsCache = blockedDomainsCache || [];
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    try {
      const domain = new URL(details.url).hostname;
      const blocked = blockedDomainsCache.some((d) => domain.endsWith(d));
      if (blocked) {
        return { redirectUrl: chrome.runtime.getURL("blocked.html") };
      }
    } catch (e) {
      return {};
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

refreshBlockedDomains();
setInterval(refreshBlockedDomains, 5 * 60 * 1000);
