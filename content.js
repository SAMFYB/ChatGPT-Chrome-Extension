(function() {
  console.log("Chat Navigation Extension loaded.");

  const sidebar = createSidebar();
  observeMutations();

  function observeMutations() {
    const threadContainer = document.querySelector('main div[class*="@container/thread"]');
    if (!threadContainer) {
      setTimeout(observeMutations, 1000);
      return;
    }

    const observer = new MutationObserver(() => {
      reindexMessages();
    });
    observer.observe(threadContainer, { childList: true, subtree: true });
    reindexMessages(); // Initial run
  }

  function reindexMessages() {
    const threadContainer = document.querySelector('main div[class*="@container/thread"]');
    if (!threadContainer) return;

    const allArticles = threadContainer.querySelectorAll('article[data-testid^="conversation-turn-"]');
    const userMessages = Array.from(allArticles).filter(article => {
      const testid = article.getAttribute('data-testid');
      const match = testid.match(/conversation-turn-(\d+)/);
      if (!match) return false;
      const turnNum = parseInt(match[1], 10);
      return turnNum % 2 === 0; // Assume even turns are user
    });

    populateSidebar(userMessages);
  }

  function createSidebar() {
    const existing = document.getElementById('chat-nav-sidebar');
    if (existing) return existing;

    const sidebar = document.createElement('div');
    sidebar.id = 'chat-nav-sidebar';

    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search...';
    searchBox.addEventListener('input', filterMessages);
    sidebar.appendChild(searchBox);

    const list = document.createElement('ul');
    list.id = 'chat-nav-list';
    sidebar.appendChild(list);

    document.body.appendChild(sidebar);
    return sidebar;
  }

  function populateSidebar(messages) {
    const list = document.getElementById('chat-nav-list');
    if (!list) return;
    list.innerHTML = '';

    messages.forEach((msg, index) => {
      const snippet = (msg.innerText || '').trim().slice(0, 50).replace(/\s+/g, ' ');
      const li = document.createElement('li');
      li.textContent = `User #${index + 1}: ${snippet}`;
      li.addEventListener('click', () => {
        msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      list.appendChild(li);
    });
  }

  function filterMessages(e) {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('#chat-nav-list li');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  }
})();
