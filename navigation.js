import { createSidebarIfNeeded, clearMessageList, addMessageListItem } from './dom-utils.js';

export function reindexMessagesAndUpdateSidebar(threadContainer) {
  const userMessages = getUserMessages(threadContainer);

  // Assign IDs if not assigned
  userMessages.forEach((msgEl, index) => {
    if (!msgEl.hasAttribute('data-msg-id')) {
      msgEl.setAttribute('data-msg-id', `user-msg-${index}`);
    }
  });

  populateMessageList(userMessages);
}

function getUserMessages(threadContainer) {
  const allMessages = threadContainer.querySelectorAll('article[data-testid^="conversation-turn-"]');

  // For demonstration, assume user messages are even turns
  return Array.from(allMessages).filter(article => {
    const testid = article.getAttribute('data-testid');
    const parts = testid.match(/conversation-turn-(\d+)/);
    if (!parts) return false;
    const turnNumber = parseInt(parts[1], 10);
    return turnNumber % 2 === 0;
  });
}

function populateMessageList(messageElements) {
  createSidebarIfNeeded();
  const listContainer = document.getElementById('chat-nav-list');
  if (!listContainer) return;

  clearMessageList();

  messageElements.forEach((msgEl, index) => {
    const snippet = (msgEl.innerText || '').trim().slice(0, 50).replace(/\s+/g, ' ');
    const label = `User #${index + 1}: ${snippet}`;
    addMessageListItem(label, () => {
      msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

export function filterMessages(searchTerm) {
  const listContainer = document.getElementById('chat-nav-list');
  if (!listContainer) return;

  const items = listContainer.querySelectorAll('li');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}
