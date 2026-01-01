// Popup script for managing whitelist

let whitelist = [];
let enabled = true;

// Load current whitelist and settings
function loadWhitelist() {
  chrome.storage.sync.get(['whitelist', 'enabled'], (data) => {
    whitelist = data.whitelist || [];
    enabled = data.enabled !== false;
    
    // Update UI
    document.getElementById('enableToggle').checked = enabled;
    renderChannelList();
  });
}

// Render the list of whitelisted channels
function renderChannelList() {
  const listElement = document.getElementById('channelList');
  const countElement = document.getElementById('count');
  
  countElement.textContent = whitelist.length;
  
  if (whitelist.length === 0) {
    listElement.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p class="empty-state-text">No channels whitelisted yet.<br>Add a channel to get started!</p>
      </div>
    `;
    return;
  }
  
  listElement.innerHTML = whitelist.map((channelId) => `
    <div class="channel-item">
      <span class="channel-id">${channelId}</span>
      <button class="remove-button" data-channel="${channelId}">Remove</button>
    </div>
  `).join('');
  
  // Add event listeners to remove buttons
  const removeButtons = listElement.querySelectorAll('.remove-button');
  removeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const channelId = button.dataset.channel;
      removeChannel(channelId);
    });
  });
}

// Add a channel to the whitelist
function addChannel(channelId) {
  // Trim and validate input
  channelId = channelId.trim();
  
  if (!channelId) {
    alert('Please enter a channel ID or @username');
    return;
  }
  
  // Basic validation: either starts with @ or is alphanumeric with dashes/underscores
  if (!channelId.startsWith('@') && !/^[a-zA-Z0-9_-]+$/.test(channelId)) {
    alert('Invalid channel ID format. Use either a channel ID (e.g., UCxxxxxxx) or @username');
    return;
  }
  
  if (whitelist.includes(channelId)) {
    alert('This channel is already in your whitelist');
    return;
  }
  
  whitelist.push(channelId);
  chrome.storage.sync.set({ whitelist }, () => {
    renderChannelList();
    document.getElementById('channelInput').value = '';
  });
}

// Remove a channel from the whitelist
function removeChannel(channelId) {
  const index = whitelist.indexOf(channelId);
  if (index > -1) {
    whitelist.splice(index, 1);
    chrome.storage.sync.set({ whitelist }, () => {
      renderChannelList();
    });
  }
}

// Toggle extension enabled/disabled
function toggleEnabled(isEnabled) {
  enabled = isEnabled;
  chrome.storage.sync.set({ enabled }, () => {
    console.log('Extension', enabled ? 'enabled' : 'disabled');
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadWhitelist();
  
  // Add button click
  document.getElementById('addButton').addEventListener('click', () => {
    const input = document.getElementById('channelInput');
    addChannel(input.value);
  });
  
  // Enter key in input
  document.getElementById('channelInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addChannel(e.target.value);
    }
  });
  
  // Enable/disable toggle
  document.getElementById('enableToggle').addEventListener('change', (e) => {
    toggleEnabled(e.target.checked);
  });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.whitelist) {
    loadWhitelist();
  }
});
