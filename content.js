(function() {
  console.log("Chat Navigation Extension loaded.");

  // Inject sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'chat-nav-sidebar';
  sidebar.innerText = 'Chat Navigation (Placeholder)';
  document.body.appendChild(sidebar);
})();
