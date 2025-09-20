document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveTabsBtn');
  const tabsetNameInput = document.getElementById('tabsetName');
  const tabsetList = document.getElementById('tabsetList');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const searchInput = document.getElementById('searchInput');
  const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function renderTabSets(tabSets, filter = '') {
    tabsetList.innerHTML = '';
    if (!tabSets || Object.keys(tabSets).length === 0) {
      tabsetList.innerHTML = '<em>No saved tab sets.</em>';
      return;
    }
    const filteredEntries = Object.entries(tabSets).filter(([name, urls]) => {
      const query = filter.toLowerCase();
      return name.toLowerCase().includes(query) || urls.some(url => url.toLowerCase().includes(query));
    });
    if (filteredEntries.length === 0) {
      tabsetList.innerHTML = '<em>No matching tab sets.</em>';
      return;
    }
    filteredEntries.forEach(([name, urls]) => {
      const div = document.createElement('div');
      div.className = 'tabset-item';
      div.innerHTML = `
        <strong>${name}</strong>
        <button data-name="${name}"><span class="material-icons">open_in_new</span> Open</button>
        <button data-name="${name}" class="delete"><span class="material-icons">delete</span> Delete</button>
        <button data-name="${name}" class="view-tabs"><span class="material-icons">visibility</span> View Tabs</button>
        <div class="tab-urls" id="urls-${encodeURIComponent(name)}" style="display:none;margin-top:5px;"></div>
      `;
      tabsetList.appendChild(div);
    });
  }

  function loadTabSets(filter = '') {
    chrome.storage.local.get('tabSets', (data) => {
      renderTabSets(data.tabSets || {}, filter);
    });
  }

  function updatePreviewTabs() {
    const previewTabs = document.getElementById('previewTabs');
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      if (!tabs.length) {
        previewTabs.innerHTML = '<em style="color: #7f8c8d;">No tabs to preview.</em>';
        return;
      }
      previewTabs.innerHTML = tabs.map(tab => {
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
        return `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="${faviconUrl}" style="width: 16px; height: 16px; margin-right: 8px; border-radius: 3px; background: #eee;" onerror="this.style.display='none'">
            <span style="font-size: 14px; color: #34495e; word-break: break-word;">${tab.title || tab.url}</span>
          </div>
        `;
      }).join('');
    });
  }

  // Refactor nested functions
  saveBtn.addEventListener('click', () => {
    updatePreviewTabs();
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const tabData = tabs.map(tab => ({
        url: tab.url,
        pinned: tab.pinned,
        index: tab.index
      }));
      let name = tabsetNameInput.value.trim();
      if (!name) {
        const domains = Array.from(new Set(tabData.map(tab => getDomain(tab.url))));
        name = domains.join(', ');
      }
      saveTabSet(name, tabData);
    });
  });

  function saveTabSet(name, tabData) {
    chrome.storage.local.get('tabSets', (data) => {
      const tabSets = data.tabSets || {};
      tabSets[name] = tabData;
      chrome.storage.local.set({tabSets}, () => loadTabSets(searchInput.value));
      tabsetNameInput.value = '';
    });
  }

  tabsetNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });

  // Use optional chaining
  function restoreTabSet(name) {
    chrome.storage.local.get('tabSets', (data) => {
      const tabData = data.tabSets?.[name];
      if (tabData?.length) {
        tabData.sort((a, b) => a.index - b.index); // Sort by original order
        tabData.forEach(tab => {
          chrome.tabs.create({
            url: tab.url,
            pinned: tab.pinned
          });
        });
      }
    });
  }

  tabsetList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const name = e.target.getAttribute('data-name');
      if (e.target.classList.contains('delete')) {
        chrome.storage.local.get('tabSets', (data) => {
          const tabSets = data.tabSets || {};
          delete tabSets[name];
          chrome.storage.local.set({tabSets}, () => loadTabSets(searchInput.value));
        });
      } else if (e.target.classList.contains('view-tabs')) {
        chrome.storage.local.get('tabSets', (data) => {
          const urls = data.tabSets[name];
          const urlsDiv = document.getElementById(`urls-${encodeURIComponent(name)}`);
          if (urlsDiv) {
            if (urlsDiv.style.display === 'none') {
              urlsDiv.innerHTML = urls.map(url => {
                let domain = '';
                try {
                  domain = new URL(url).hostname;
                } catch {
                  domain = url;
                }
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
                return `
                  <div style="display:flex;align-items:center;margin-bottom:4px;">
                    <img src="${faviconUrl}" style="width:16px;height:16px;margin-right:8px;border-radius:3px;background:#eee;" onerror="this.style.display='none'">
                    <a href="${url}" target="_blank" style="font-size:12px;word-break:break-all;text-decoration:none;color:#333;">${url}</a>
                  </div>
                `;
              }).join('');
              urlsDiv.style.display = 'block';
            } else {
              urlsDiv.style.display = 'none';
            }
          }
        });
      } else {
        restoreTabSet(name);
      }
    }
  });

  searchInput.addEventListener('input', (e) => {
    loadTabSets(e.target.value);
  });

  loadTabSets();
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all saved tab sets? This cannot be undone.')) {
      chrome.storage.local.remove('tabSets', () => loadTabSets(searchInput.value));
    }
  });

  refreshPreviewBtn.addEventListener('click', () => {
    updatePreviewTabs();
  });

  // Update preview on popup load
  updatePreviewTabs();
});
