import { reindexMessagesAndUpdateSidebar } from './navigation.js';
import { getThreadContainer } from './dom-utils.js';

let mutationObserver = null;

export function startObserving() {
  const threadContainer = getThreadContainer();
  if (!threadContainer) {
    setTimeout(startObserving, 1000);
    return;
  }

  mutationObserver = new MutationObserver(mutationCallback);
  mutationObserver.observe(threadContainer, {
    childList: true,
    subtree: true
  });

  // Initial index build
  reindexMessagesAndUpdateSidebar(threadContainer);
}

function mutationCallback(mutations) {
  let shouldReindex = false;

  for (const mutation of mutations) {
    if (mutation.type === 'childList' &&
        (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
      shouldReindex = true;
    }
  }

  if (shouldReindex) {
    const threadContainer = getThreadContainer();
    if (threadContainer) {
      reindexMessagesAndUpdateSidebar(threadContainer);
    }
  }
}
