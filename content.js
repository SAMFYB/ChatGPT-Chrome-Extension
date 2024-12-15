(function() {
  let mutationObserver = null;

  // Remove DOMContentLoaded if it's never firing and start immediately,
  // since run_at: document_idle means DOM is likely loaded anyway.
  startObserving();

  function startObserving() {
    console.log("[Chat Nav] Attempting to find thread container...");
    const threadContainer = getThreadContainer();
    console.log("[Chat Nav] threadContainer is:", threadContainer);

    if (!threadContainer) {
      console.log("[Chat Nav] Thread container not found, retrying in 1s...");
      setTimeout(startObserving, 1000);
      return;
    }

    console.log("[Chat Nav] Thread container found. Setting up MutationObserver...");
    mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(threadContainer, {
      childList: true,
      subtree: true
    });

    console.log("[Chat Nav] Running initial reindexing...");
    reindexMessagesAndUpdateSidebar(threadContainer);
  }

  function mutationCallback(mutations) {
    let shouldReindex = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
        console.log("[Chat Nav] Mutation observed: DOM changed in the thread container.");
        shouldReindex = true;
      }
    }

    if (shouldReindex) {
      const threadContainer = getThreadContainer();
      if (threadContainer) {
        console.log("[Chat Nav] Reindexing due to observed mutations...");
        reindexMessagesAndUpdateSidebar(threadContainer);
      }
    }
  }

  function reindexMessagesAndUpdateSidebar(threadContainer) {
    console.log("[Chat Nav] Reindexing messages...");
    const userMessages = getUserMessages(threadContainer);
    console.log(`[Chat Nav] Found ${userMessages.length} user messages.`);

    // Assign IDs if not assigned
    userMessages.forEach((msgEl, index) => {
      if (!msgEl.hasAttribute('data-msg-id')) {
        const msgId = `user-msg-${index}`;
        msgEl.setAttribute('data-msg-id', msgId);
        console.log(`[Chat Nav] Assigned data-msg-id="${msgId}" to a user message.`);
      }
    });

    populateMessageList(userMessages);
  }

  function getUserMessages(threadContainer) {
    const allMessages = threadContainer.querySelectorAll('article[data-testid^="conversation-turn-"]');
    console.log(`[Chat Nav] Total messages found: ${allMessages.length}`);

    return Array.from(allMessages);
  }

  function populateMessageList(messageElements) {
    console.log("[Chat Nav] Populating sidebar with user messages...");
    createSidebarIfNeeded();
    const listContainer = document.getElementById('chat-nav-list');
    if (!listContainer) {
      console.warn("[Chat Nav] #chat-nav-list not found. Cannot populate messages.");
      return;
    }

    clearMessageList();

    messageElements.forEach((msgEl, index) => {
      const fullText = (msgEl.innerText || '').trim();
      const snippet = fullText.slice(0, 50).replace(/\s+/g, ' ');
      addMessageListItem(snippet, () => {
        console.log(`[Chat Nav] Scrolling to message ID: ${msgEl.getAttribute('data-msg-id')}`);
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    console.log("[Chat Nav] Sidebar population complete.");
  }

  function getThreadContainer() {
    const mainEl = document.querySelector('main');
    if (!mainEl) {
      console.log("[Chat Nav] <main> not found.");
      return null;
    }

    const container = mainEl.querySelector('div[class*="@container/thread"]');
    if (!container) {
      console.log("[Chat Nav] Thread container with '@container/thread' not found inside <main>.");
    }
    return container;
  }

  function createSidebarIfNeeded() {
    if (document.getElementById('chat-nav-sidebar')) {
      console.log("[Chat Nav] Sidebar already exists.");
      return;
    }

    console.log("[Chat Nav] Creating sidebar...");
    const sidebar = document.createElement('div');
    sidebar.id = 'chat-nav-sidebar';

    // Start in collapsed state by default
    sidebar.classList.add('collapsed');

    // Header with toggle
    const header = document.createElement('div');
    header.id = 'chat-nav-sidebar-header';

    const title = document.createElement('span');
    title.textContent = 'Chat Nav';
    header.appendChild(title);

    const toggleButton = document.createElement('button');
    toggleButton.id = 'chat-nav-toggle-button';
    toggleButton.textContent = '▼'; // Arrow indicating expand/collapse
    toggleButton.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      toggleButton.textContent = sidebar.classList.contains('collapsed') ? '▼' : '▲';
    });
    header.appendChild(toggleButton);

    sidebar.appendChild(header);

    const contentWrapper = document.createElement('div');
    contentWrapper.id = 'chat-nav-content';

    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search...';
    searchBox.addEventListener('input', (e) => {
      console.log("[Chat Nav] Filtering messages with search term:", e.target.value);
      filterMessages(e.target.value.toLowerCase());
    });
    contentWrapper.appendChild(searchBox);

    const listContainer = document.createElement('ul');
    listContainer.id = 'chat-nav-list';
    contentWrapper.appendChild(listContainer);

    sidebar.appendChild(contentWrapper);

    document.body.appendChild(sidebar);
    console.log("[Chat Nav] Sidebar created successfully.");
  }

  function clearMessageList() {
    const listContainer = document.getElementById('chat-nav-list');
    if (listContainer) {
      listContainer.innerHTML = '';
      console.log("[Chat Nav] Cleared existing message list.");
    }
  }

  function addMessageListItem(snippet, onClick) {
    const listContainer = document.getElementById('chat-nav-list');
    if (!listContainer) {
      console.warn("[Chat Nav] Cannot add message item - #chat-nav-list not found.");
      return;
    }

    console.log(`[Chat Nav] Adding list item: "${snippet}"`);
    const listItem = document.createElement('li');
    listItem.textContent = snippet;
    listItem.addEventListener('click', onClick);
    listContainer.appendChild(listItem);
  }

  function filterMessages(searchTerm) {
    const listContainer = document.getElementById('chat-nav-list');
    if (!listContainer) {
      console.warn("[Chat Nav] Cannot filter messages - #chat-nav-list not found.");
      return;
    }

    const items = listContainer.querySelectorAll('li');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    console.log("[Chat Nav] Filter applied.");
  }
})();
