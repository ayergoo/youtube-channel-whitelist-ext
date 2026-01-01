// Background service worker for managing whitelist data

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['whitelist', 'enabled'], (data) => {
    if (!data.whitelist) {
      chrome.storage.sync.set({ whitelist: [] });
    }
    if (data.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getWhitelist') {
    chrome.storage.sync.get(['whitelist', 'enabled'], (data) => {
      sendResponse({ 
        whitelist: data.whitelist || [], 
        enabled: data.enabled !== false 
      });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'addToWhitelist') {
    chrome.storage.sync.get(['whitelist'], (data) => {
      const whitelist = data.whitelist || [];
      if (!whitelist.includes(request.channelId)) {
        whitelist.push(request.channelId);
        chrome.storage.sync.set({ whitelist }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: true, message: 'Already whitelisted' });
      }
    });
    return true;
  }
  
  if (request.action === 'removeFromWhitelist') {
    chrome.storage.sync.get(['whitelist'], (data) => {
      const whitelist = data.whitelist || [];
      const index = whitelist.indexOf(request.channelId);
      if (index > -1) {
        whitelist.splice(index, 1);
        chrome.storage.sync.set({ whitelist }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, message: 'Not in whitelist' });
      }
    });
    return true;
  }
});
