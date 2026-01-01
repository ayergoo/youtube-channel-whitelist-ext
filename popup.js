// Popup script for managing whitelist

// Constants
const MIN_CHANNEL_ID_LENGTH = 10;

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
    // Create empty state using DOM manipulation for security
    listElement.replaceChildren(); // Clear existing content
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'empty-state-icon';
    iconDiv.textContent = '📝';
    
    const textP = document.createElement('p');
    textP.className = 'empty-state-text';
    textP.textContent = 'No channels whitelisted yet.';
    
    const br = document.createElement('br');
    textP.appendChild(br);
    
    const text2 = document.createTextNode('Add a channel to get started!');
    textP.appendChild(text2);
    
    emptyDiv.appendChild(iconDiv);
    emptyDiv.appendChild(textP);
    listElement.appendChild(emptyDiv);
    return;
  }
  
  listElement.replaceChildren(); // Clear existing content
  
  whitelist.forEach((channelId) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'channel-item';
    
    const channelSpan = document.createElement('span');
    channelSpan.className = 'channel-id';
    channelSpan.textContent = channelId; // Safe: uses textContent instead of innerHTML
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-button';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeChannel(channelId);
    
    itemDiv.appendChild(channelSpan);
    itemDiv.appendChild(removeBtn);
    listElement.appendChild(itemDiv);
  });
}

// Add a channel to the whitelist
function addChannel(channelId) {
  // Trim and validate input
  channelId = channelId.trim();
  
  if (!channelId) {
    showFeedback('Please enter a channel ID or @username', 'error');
    return;
  }
  
  // Basic validation: either starts with @ or is a valid YouTube channel ID
  // YouTube channel IDs are typically 24 characters starting with UC, but we allow min 10
  if (!channelId.startsWith('@')) {
    if (!/^[a-zA-Z0-9_-]{10,}$/.test(channelId) || channelId.length < MIN_CHANNEL_ID_LENGTH) {
      showFeedback('Invalid channel ID format. Use either a channel ID (e.g., UCxxxxxxx) or @username', 'error');
      return;
    }
  }
  
  if (whitelist.includes(channelId)) {
    showFeedback('This channel is already in your whitelist', 'info');
    return;
  }
  
  whitelist.push(channelId);
  chrome.storage.sync.set({ whitelist }, () => {
    renderChannelList();
    document.getElementById('channelInput').value = '';
    showFeedback('Channel added successfully!', 'success');
  });
}

// Show feedback message
function showFeedback(message, type = 'info') {
  const input = document.getElementById('channelInput');
  const originalPlaceholder = input.placeholder;
  const originalBorder = input.style.border;
  
  // Update input styling based on type
  if (type === 'error') {
    input.style.border = '2px solid #dc3545';
    input.placeholder = '❌ ' + message;
  } else if (type === 'success') {
    input.style.border = '2px solid #28a745';
    input.placeholder = '✓ ' + message;
  } else {
    input.style.border = '2px solid #ffc107';
    input.placeholder = 'ℹ️ ' + message;
  }
  
  // Reset after 3 seconds
  setTimeout(() => {
    input.style.border = originalBorder;
    input.placeholder = originalPlaceholder;
  }, 3000);
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
