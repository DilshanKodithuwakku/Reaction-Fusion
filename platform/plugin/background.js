// ReactionFusion Background Service Worker (Manifest V3)
const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/v1';

async function getApiBase() {
  try {
    const res = await chrome.storage.local.get(['rf_api_base']);
    let base = res.rf_api_base || DEFAULT_API_BASE;
    base = base.trim().replace(/\/+$/, '');
    if (!base.endsWith('/api/v1')) {
      base = base + '/api/v1';
    }
    return base;
  } catch {
    return DEFAULT_API_BASE;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_post') {
    getApiBase().then((apiBase) => {
      fetch(`${apiBase}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.payload)
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'fetch_mock_post') {
    const postId = request.postId;
    const url = `http://localhost:4000/api/posts/${postId}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => sendResponse({ success: true, data: data.data || data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'check_health') {
    getApiBase().then((apiBase) => {
      fetch(`${apiBase}/health`)
        .then(res => res.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
    });
    return true;
  }
});
