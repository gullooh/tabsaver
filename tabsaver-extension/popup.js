document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveTabsBtn');
  const tabsetNameInput = document.getElementById('tabsetName');
  const tabsetList = document.getElementById('tabsetList');
  const clearAllBtn = document.getElementById('clearAllBtn');

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function renderTabSets(tabSets) {
    tabsetList.innerHTML = '';
    if (!tabSets || Object.keys(tabSets).length === 0) {
      tabsetList.innerHTML = '<em>No saved tab sets.</em>';
      return;
    }
    Object.entries(tabSets).forEach(([name, urls]) => {
      const div = document.createElement('div');
      div.className = 'tabset-item';
      div.innerHTML = `<strong>${name}</strong> <button data-name="${name}">Open</button> <button data-name="${name}" class="delete">Delete</button>`;
      tabsetList.appendChild(div);
    });
  }

  function loadTabSets() {
    chrome.storage.local.get('tabSets', (data) => {
      renderTabSets(data.tabSets || {});
    });
  }

  saveBtn.addEventListener('click', () => {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const urls = tabs.map(tab => tab.url);
      let name = tabsetNameInput.value.trim();
      if (!name) {
        const domains = Array.from(new Set(urls.map(getDomain)));
        name = domains.join(', ');
      }
      chrome.storage.local.get('tabSets', (data) => {
        const tabSets = data.tabSets || {};
        tabSets[name] = urls;
        chrome.storage.local.set({tabSets}, loadTabSets);
        tabsetNameInput.value = '';
      });
    });
  });

  tabsetNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });

  tabsetList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const name = e.target.getAttribute('data-name');
      if (e.target.classList.contains('delete')) {
        chrome.storage.local.get('tabSets', (data) => {
          const tabSets = data.tabSets || {};
          delete tabSets[name];
          chrome.storage.local.set({tabSets}, loadTabSets);
        });
      } else {
        chrome.storage.local.get('tabSets', (data) => {
          const urls = data.tabSets[name];
          if (urls && urls.length) {
            chrome.windows.create({url: urls, focused: true});
          }
        });
      }
    }
  });

  loadTabSets();
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all saved tab sets? This cannot be undone.')) {
      chrome.storage.local.remove('tabSets', loadTabSets);
    }
  });
});
