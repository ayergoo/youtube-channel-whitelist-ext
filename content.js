// Content script for YouTube channel whitelist

let whitelist = [];
let enabled = true;
let currentChannelId = null;
let blockedPageShown = false;

// Extract channel ID from various YouTube URL patterns
function extractChannelId() {
  const url = window.location.href;
  
  // Channel pages: /channel/CHANNEL_ID or /@username
  if (url.includes('/channel/')) {
    const match = url.match(/\/channel\/([\w-]+)/);
    return match ? match[1] : null;
  }
  
  // Handle @username format
  if (url.includes('/@')) {
    const match = url.match(/\/@([\w-]+)/);
    if (match) {
      // Store as @username format
      return '@' + match[1];
    }
  }
  
  // Video pages: /watch?v=VIDEO_ID
  if (url.includes('/watch')) {
    // We need to extract channel ID from the page content
    return extractChannelIdFromPage();
  }
  
  return null;
}

// Extract channel ID from page DOM
function extractChannelIdFromPage() {
  // Try to find channel link in video page
  const channelLink = document.querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string[href*="/channel/"]');
  if (channelLink) {
    const match = channelLink.href.match(/\/channel\/([\w-]+)/);
    if (match) return match[1];
  }
  
  // Try @username format
  const handleLink = document.querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string[href*="/@"]');
  if (handleLink) {
    const match = handleLink.href.match(/\/@([\w-]+)/);
    if (match) return '@' + match[1];
  }
  
  // Try ytInitialData for channel ID
  try {
    if (window.ytInitialData) {
      const videoOwnerRenderer = JSON.stringify(window.ytInitialData).match(/"videoOwnerRenderer".*?"browseEndpoint".*?"browseId":"([\w-]+)"/);
      if (videoOwnerRenderer) return videoOwnerRenderer[1];
    }
  } catch (e) {
    console.log('Error extracting channel from ytInitialData:', e);
  }
  
  return null;
}

// Check if current channel is whitelisted
function isChannelWhitelisted(channelId) {
  if (!enabled || !channelId) return true;
  return whitelist.includes(channelId);
}

// Show blocked page
function showBlockedPage(channelId) {
  if (blockedPageShown) return;
  blockedPageShown = true;
  
  const blockedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Channel Not Whitelisted</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: #fff;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 32px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        p {
          font-size: 18px;
          margin: 0 0 30px 0;
          opacity: 0.9;
        }
        .channel-id {
          background: rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 10px;
          margin: 20px 0;
          font-family: monospace;
          word-break: break-all;
        }
        .buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        button {
          padding: 12px 30px;
          font-size: 16px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 120px;
        }
        .btn-primary {
          background: #fff;
          color: #667eea;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255, 255, 255, 0.3);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          border: 2px solid #fff;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🚫</div>
        <h1>Channel Not Whitelisted</h1>
        <p>This YouTube channel is not on your whitelist.</p>
        <div class="channel-id">Channel: ${channelId || 'Unknown'}</div>
        <div class="buttons">
          <button class="btn-primary" onclick="window.history.back()">Go Back</button>
          <button class="btn-secondary" onclick="addToWhitelist()">Add to Whitelist</button>
        </div>
      </div>
      <script>
        function addToWhitelist() {
          const channelId = '${channelId}';
          const button = event.target;
          button.textContent = 'Adding...';
          button.disabled = true;
          
          chrome.runtime.sendMessage({
            action: 'addToWhitelist',
            channelId: channelId
          }, (response) => {
            if (response && response.success) {
              button.textContent = 'Added! Reloading...';
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } else {
              button.textContent = 'Add to Whitelist';
              button.disabled = false;
            }
          });
        }
      </script>
    </body>
    </html>
  `;
  
  document.open();
  document.write(blockedHTML);
  document.close();
}

// Hide non-whitelisted videos from recommendations
function hideNonWhitelistedVideos() {
  if (!enabled) return;
  
  // Find all video elements on the page
  const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer');
  
  videoElements.forEach((element) => {
    // Skip if already processed
    if (element.dataset.whitelistProcessed) return;
    element.dataset.whitelistProcessed = 'true';
    
    // Try to find channel link or ID in the video element
    const channelLink = element.querySelector('a[href*="/channel/"], a[href*="/@"]');
    
    if (channelLink) {
      const href = channelLink.href;
      let channelId = null;
      
      if (href.includes('/channel/')) {
        const match = href.match(/\/channel\/([\w-]+)/);
        channelId = match ? match[1] : null;
      } else if (href.includes('/@')) {
        const match = href.match(/\/@([\w-]+)/);
        channelId = match ? '@' + match[1] : null;
      }
      
      if (channelId && !whitelist.includes(channelId)) {
        // Hide the video element
        element.style.display = 'none';
      }
    }
  });
}

// Check and block if needed
function checkAndBlock() {
  const channelId = extractChannelId();
  
  if (channelId && channelId !== currentChannelId) {
    currentChannelId = channelId;
    
    if (!isChannelWhitelisted(channelId)) {
      // Show blocked page for channel or video pages
      if (window.location.href.includes('/watch') || 
          window.location.href.includes('/channel/') || 
          window.location.href.includes('/@')) {
        showBlockedPage(channelId);
        return;
      }
    }
  }
  
  // Hide non-whitelisted videos from recommendations
  hideNonWhitelistedVideos();
}

// Initialize
chrome.runtime.sendMessage({ action: 'getWhitelist' }, (response) => {
  if (response) {
    whitelist = response.whitelist || [];
    enabled = response.enabled !== false;
    
    // Initial check
    checkAndBlock();
    
    // Use MutationObserver for efficient DOM monitoring
    const observer = new MutationObserver(() => {
      hideNonWhitelistedVideos();
    });
    
    // Observe the main content area for changes
    const targetNode = document.querySelector('ytd-app');
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true
      });
    }
    
    // Fallback periodic check for edge cases (less frequent)
    setInterval(hideNonWhitelistedVideos, 5000);
  }
});

// Listen for URL changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    currentChannelId = null;
    blockedPageShown = false;
    
    // Recheck on URL change
    setTimeout(checkAndBlock, 500);
  }
}).observe(document, { subtree: true, childList: true });

// Also check when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndBlock);
} else {
  checkAndBlock();
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.whitelist) {
      whitelist = changes.whitelist.newValue || [];
      // Re-check without reloading if we're on a safe page
      if (!window.location.href.includes('/watch') && 
          !window.location.href.includes('/channel/') && 
          !window.location.href.includes('/@')) {
        currentChannelId = null;
        checkAndBlock();
      } else {
        // Only reload if on a potentially blocked page
        location.reload();
      }
    }
    if (changes.enabled) {
      enabled = changes.enabled.newValue !== false;
      // Reload for enable/disable to ensure clean state
      location.reload();
    }
  }
});
