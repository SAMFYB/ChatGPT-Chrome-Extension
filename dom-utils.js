import { filterMessages } from './navigation.js';

export function getThreadContainer() {
  const mainEl = document.querySelector('main');
  if (!mainEl) return null;
  return mainEl.querySelector('div[class*="@container/thread"]');
}

export function createSidebarIfNeeded() {
  if (document.getElementById('chat-nav-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'chat-nav-sidebar';

  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Search...';
  searchBox.addEventListener('input', (e) => {
    filterMessages(e.target.value.toLowerCase());
  });

  sidebar.appendChild(searchBox);

  const listContainer = document.createElement('ul');
  listContainer.id = 'chat-nav-list';
  sidebar.appendChild(listContainer);

  document.body.appendChild(sidebar);
}

export function clearMessageList() {
  const listContainer = document.getElementById('chat-nav-list');
  if (listContainer) {
    listContainer.innerHTML = '';
  }
}

export function addMessageListItem(label, onClick) {
  const listContainer = document.getElementById('chat-nav-list');
  if (!listContainer) return;

  const listItem = document.createElement('li');
  listItem.textContent = label;
  listItem.addEventListener('click', onClick);
  listContainer.appendChild(listItem);
}
