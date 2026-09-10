document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle-enabled');
  const healthBadge = document.getElementById('health-status');
  const sessionCounter = document.getElementById('session-counter');
  const modelVersion = document.getElementById('model-version');
  const apiUrlInput = document.getElementById('api-url-input');
  const saveApiBtn = document.getElementById('save-api-btn');
  const testBtn = document.getElementById('test-btn');
  const testText = document.getElementById('test-text');
  const testResult = document.getElementById('test-result');

  // Load saved state & API URL
  chrome.storage.local.get(['rf_enabled', 'rf_session_count', 'rf_api_base'], (result) => {
    if (result.rf_enabled !== undefined) {
      toggle.checked = result.rf_enabled;
    }
    if (result.rf_session_count !== undefined) {
      sessionCounter.textContent = result.rf_session_count;
    }
    apiUrlInput.value = result.rf_api_base || 'http://127.0.0.1:8000';
    checkHealth();
  });

  // Handle toggle change
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ rf_enabled: toggle.checked });
  });

  // Handle Save API URL
  saveApiBtn.addEventListener('click', () => {
    let url = apiUrlInput.value.trim() || 'http://127.0.0.1:8000';
    url = url.replace(/\/+$/, '');
    chrome.storage.local.set({ rf_api_base: url }, () => {
      saveApiBtn.textContent = 'Saved!';
      setTimeout(() => { saveApiBtn.textContent = 'Save'; }, 1500);
      checkHealth();
    });
  });

  function checkHealth() {
    healthBadge.textContent = 'Checking...';
    healthBadge.className = 'status-badge offline';

    chrome.runtime.sendMessage({ action: 'check_health' }, (response) => {
      if (response && response.success && response.data?.status === 'healthy') {
        healthBadge.textContent = 'API Online';
        healthBadge.className = 'status-badge online';
        if (response.data.model_version) {
          modelVersion.textContent = response.data.model_version;
        }
      } else {
        healthBadge.textContent = 'API Offline';
        healthBadge.className = 'status-badge offline';
      }
    });
  }

  // Handle Quick In-Popup Test
  testBtn.addEventListener('click', () => {
    const rawText = testText.value.trim();
    if (!rawText) return;

    testBtn.disabled = true;
    testBtn.textContent = 'Analyzing...';
    testResult.style.display = 'block';
    testResult.textContent = 'Sending comments to ReactionFusion model...';

    // Treat each newline as an individual comment under the post
    const commentsPayload = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const samplePostReactions = { like: 600, love: 20, care: 5, haha: 450, wow: 15, sad: 80, angry: 350 };

    chrome.runtime.sendMessage(
      {
        action: 'analyze_post',
        payload: {
          comments: commentsPayload,
          reactions: samplePostReactions
        }
      },
      (res) => {
        testBtn.disabled = false;
        testBtn.textContent = 'Analyze Sample';
        if (res && res.success && res.data) {
          const d = res.data;
          const dominant = (d.dominant_emotions || []).map(e => `${e.emotion}: ${Math.round(e.probability * 100)}%`).join(', ');
          testResult.innerHTML = `
            <strong>Sentiment:</strong> ${d.sentiment.toUpperCase()} (${Math.round(d.confidence * 100)}%)<br>
            <strong>Comments:</strong> ${d.comments_analyzed} • <strong>Post Rxns:</strong> ${d.reactions_summary?.total || 0}<br>
            <strong>Top Emotions:</strong> ${dominant || 'None'}<br>
            <strong>Reason:</strong> ${d.reason}
          `;
        } else {
          testResult.textContent = 'Error: Could not reach backend API.';
        }
      }
    );
  });
});
