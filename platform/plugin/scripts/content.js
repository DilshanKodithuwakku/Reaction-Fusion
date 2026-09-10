// ReactionFusion: Mock Facebook Sentiment AI Extension
// Grammarly-Style Floating Trigger & Pop-up Powered by 3rd-Party REST API
(function () {
  'use strict';

  // 1. Emotion & Sentiment Bilingual Dictionaries
  const SINHALA_EMOTIONS = {
    joy: { en: 'Joy', si: 'සතුට', emoji: '✨' },
    affection: { en: 'Affection', si: 'ආදරය', emoji: '❤️' },
    amusement: { en: 'Amusement', si: 'විනෝදය', emoji: '😄' },
    surprise: { en: 'Surprise', si: 'පුදුමය', emoji: '😲' },
    sadness: { en: 'Sadness', si: 'දුක', emoji: '😢' },
    anger: { en: 'Anger', si: 'කෝපය', emoji: '😡' },
    care_empathy: { en: 'Empathy', si: 'කරුණාව', emoji: '🫂' },
    fear: { en: 'Fear', si: 'බිය', emoji: '😨' },
    disgust: { en: 'Disgust', si: 'පිළිකුල', emoji: '🤢' },
    approval: { en: 'Approval', si: 'පැසසුම', emoji: '👏' },
    sarcasm: { en: 'Sarcasm', si: 'උපහාසය', emoji: '😏' },
    pride: { en: 'Pride', si: 'ආඩම්බරය', emoji: '🏆' },
    gratitude: { en: 'Gratitude', si: 'කෘතඥතාව', emoji: '🙏' },
    disappointment: { en: 'Disappointment', si: 'කලකිරීම', emoji: '😞' },
    grief: { en: 'Grief', si: 'ශෝකය', emoji: '💔' },
    jealousy: { en: 'Jealousy', si: 'ඊර්ෂ්‍යාව', emoji: '😒' },
    confusion: { en: 'Confusion', si: 'ව්‍යාකූලත්වය', emoji: '😕' },
    nostalgia: { en: 'Nostalgia', si: 'මතකය', emoji: '🍂' },
    hope: { en: 'Hope', si: 'බලාපොරොත්තුව', emoji: '🌱' },
    excitement: { en: 'Excitement', si: 'උද්යෝගය', emoji: '🔥' },
    relief: { en: 'Relief', si: 'සහනය', emoji: '😌' },
    embarrassment: { en: 'Embarrassment', si: 'ලැජ්ජාව', emoji: '😳' }
  };

  const SINHALA_SENTIMENTS = {
    positive: { en: 'Positive', si: 'සතුටුදායකයි', emoji: '🟢' },
    negative: { en: 'Negative', si: 'අසතුටුදායකයි', emoji: '🔴' },
    mixed: { en: 'Mixed', si: 'මිශ්‍ර ප්‍රතිචාර', emoji: '🟡' },
    neutral: { en: 'Neutral', si: 'මධ්‍යස්ථයි', emoji: '⚪' }
  };

  const REACTION_ICONS = {
    like: '👍',
    love: '❤️',
    care: '🥰',
    haha: '😆',
    wow: '😮',
    sad: '😢',
    angry: '😡'
  };

  const postCache = new Map();
  let scanDebounceTimer = null;

  // 2. Initialize Extension
  function init() {
    initObserver();
    scheduleScan();
    initGlobalDismissal();
    initScrollRepositioning();
  }

  function initObserver() {
    const observer = new MutationObserver(() => {
      scheduleScan();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function scheduleScan() {
    if (scanDebounceTimer) clearTimeout(scanDebounceTimer);
    scanDebounceTimer = setTimeout(() => {
      scanAndInjectTriggers();
    }, 200);
  }

  // 3. Scan Mock Facebook Posts & Inject Grammarly Trigger
  function scanAndInjectTriggers() {
    const postElements = Array.from(document.querySelectorAll('article[data-post-id], article'));

    postElements.forEach((postEl) => {
      if (postEl.querySelector('.rf-grammarly-wrapper')) return;

      const postId = postEl.getAttribute('data-post-id') || postEl.id;
      if (!postId) return;

      injectGrammarlyIcon(postEl, postId);
    });
  }

  function injectGrammarlyIcon(postEl, postId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'rf-grammarly-wrapper';
    wrapper.setAttribute('data-rf-post-id', postId);

    wrapper.innerHTML = `
      <button type="button" class="rf-grammarly-btn" title="ReactionFusion: View Audience Sentiment & Emotions">
        <span class="rf-status-dot"></span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" />
          <path d="M12 3a9 9 0 0 1 9 9" stroke="#6366f1" stroke-width="2.5" />
          <circle cx="12" cy="12" r="3" fill="#6366f1" />
        </svg>
      </button>
    `;

    const triggerBtn = wrapper.querySelector('.rf-grammarly-btn');
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopup(postEl, wrapper, triggerBtn, postId);
    });

    // Locate header right action cluster (beside ··· and ✕ buttons)
    const header = postEl.querySelector('header');
    const targetContainer = header ? header.lastElementChild : null;

    if (targetContainer) {
      targetContainer.insertBefore(wrapper, targetContainer.firstChild);
    } else {
      postEl.style.position = 'relative';
      wrapper.style.position = 'absolute';
      wrapper.style.top = '12px';
      wrapper.style.right = '14px';
      postEl.appendChild(wrapper);
    }
  }

  // 4. Portal Popup Positioning (Escapes overflow:hidden)
  function positionPopup(popup, triggerBtn) {
    if (!triggerBtn || !document.body.contains(triggerBtn)) return;

    const rect = triggerBtn.getBoundingClientRect();
    const popupWidth = Math.min(360, window.innerWidth - 32);
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    let top = scrollY + rect.bottom + 8;
    let left = scrollX + rect.right - popupWidth;

    // Viewport margin safety
    if (left < 16) {
      left = 16;
    }
    if (left + popupWidth > scrollX + window.innerWidth - 16) {
      left = scrollX + window.innerWidth - popupWidth - 16;
    }

    popup.style.position = 'absolute';
    popup.style.top = `${Math.round(top)}px`;
    popup.style.left = `${Math.round(left)}px`;
    popup.style.width = `${popupWidth}px`;
    popup.style.zIndex = '999999';
  }

  function initScrollRepositioning() {
    const updatePosition = () => {
      const activePopup = document.querySelector('.rf-grammarly-popup');
      if (activePopup && activePopup._rfTrigger) {
        positionPopup(activePopup, activePopup._rfTrigger);
      }
    };
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });
  }

  // 5. Toggle Popup Logic
  function togglePopup(postEl, wrapper, triggerBtn, postId) {
    const existingPopup = document.querySelector(`.rf-grammarly-popup[data-rf-target-post="${postId}"]`);
    if (existingPopup) {
      existingPopup.remove();
      return;
    }

    // Close any other open popups
    document.querySelectorAll('.rf-grammarly-popup').forEach(p => p.remove());

    if (postCache.has(postId)) {
      renderPopup(wrapper, triggerBtn, postCache.get(postId), postId, postEl);
      return;
    }

    renderLoadingPopup(wrapper, triggerBtn, postId);
    fetchAndAnalyzePost(postEl, wrapper, triggerBtn, postId);
  }

  function renderLoadingPopup(wrapper, triggerBtn, postId) {
    const popup = document.createElement('div');
    popup.className = 'rf-grammarly-popup';
    popup.setAttribute('data-rf-target-post', postId);
    popup._rfTrigger = triggerBtn;

    popup.innerHTML = `
      <div class="rf-popup-header">
        <div class="rf-brand-group">
          <div class="rf-brand-icon">✨</div>
          <span class="rf-brand-title">ReactionFusion</span>
          <span class="rf-brand-tag">AI Pulse</span>
        </div>
        <div class="rf-popup-actions">
          <button type="button" class="rf-action-icon-btn rf-close-btn" title="Close">✕</button>
        </div>
      </div>
      <div class="rf-popup-body">
        <div class="rf-loading-state">
          <div class="rf-pulse-spinner"></div>
          <div class="rf-loading-title">Synthesizing Multimodal Discourse...</div>
          <div class="rf-loading-subtitle">Querying Mock Facebook 3rd-Party API for comments & reactions...</div>
        </div>
      </div>
    `;

    popup.querySelector('.rf-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.remove();
    });

    document.body.appendChild(popup);
    positionPopup(popup, triggerBtn);
  }

  // 6. 3rd-Party REST API Data Pipeline
  function fetchAndAnalyzePost(postEl, wrapper, triggerBtn, postId) {
    if (triggerBtn) triggerBtn.classList.add('rf-state-loading');

    chrome.runtime.sendMessage({ action: 'fetch_mock_post', postId }, (res) => {
      if (!res || !res.success || !res.data) {
        showErrorPopup(triggerBtn, postId, res?.error || 'Unable to fetch post data from Mock Facebook API.');
        if (triggerBtn) triggerBtn.classList.remove('rf-state-loading');
        return;
      }

      const postData = res.data;
      const commentsList = (postData.comments || postData.recentComments || []).map(c => c.text || c.content || '');
      const rawReactions = postData.metrics?.reactionsByType || {};

      chrome.runtime.sendMessage({
        action: 'analyze_post',
        payload: {
          post_id: postId,
          comments: commentsList,
          reactions: rawReactions
        }
      }, (analysisRes) => {
        if (triggerBtn) triggerBtn.classList.remove('rf-state-loading');

        if (analysisRes && analysisRes.success && analysisRes.data) {
          const data = analysisRes.data;
          postCache.set(postId, data);
          updateTriggerStatus(triggerBtn, data.sentiment);
          renderPopup(wrapper, triggerBtn, data, postId, postEl);
        } else {
          showErrorPopup(triggerBtn, postId, analysisRes?.error || 'Inference engine error');
        }
      });
    });
  }

  function updateTriggerStatus(btn, sentiment) {
    if (!btn) return;
    btn.classList.remove('rf-state-positive', 'rf-state-negative', 'rf-state-mixed', 'rf-state-neutral');
    const sent = (sentiment || 'neutral').toLowerCase();
    if (sent === 'positive') btn.classList.add('rf-state-positive');
    else if (sent === 'negative') btn.classList.add('rf-state-negative');
    else if (sent === 'mixed') btn.classList.add('rf-state-mixed');
    else btn.classList.add('rf-state-neutral');
  }

  // 7. Render Modern Minimalistic Pop-up
  function renderPopup(wrapper, triggerBtn, data, postId, postEl) {
    const existing = document.querySelector(`.rf-grammarly-popup[data-rf-target-post="${postId}"]`);
    if (existing) existing.remove();

    const sentimentKey = (data.sentiment || 'neutral').toLowerCase();
    const sentimentInfo = SINHALA_SENTIMENTS[sentimentKey] || SINHALA_SENTIMENTS.neutral;
    const confidencePct = Math.round((data.confidence || 0) * 100);

    const dominantEmotions = (data.dominant_emotions || []).slice(0, 3);
    const totalComments = data.comments_analyzed || 0;
    const reactionsSummary = data.reactions_summary?.counts || {};
    const totalReactions = data.reactions_summary?.total || 0;

    const popup = document.createElement('div');
    popup.className = 'rf-grammarly-popup';
    popup.setAttribute('data-rf-target-post', postId);
    popup._rfTrigger = triggerBtn;

    popup.innerHTML = `
      <div class="rf-popup-header">
        <div class="rf-brand-group">
          <div class="rf-brand-icon">✨</div>
          <span class="rf-brand-title">ReactionFusion</span>
          <span class="rf-brand-tag">v2 AI</span>
        </div>
        <div class="rf-popup-actions">
          <button type="button" class="rf-action-icon-btn rf-refresh-btn" title="Re-analyze latest reactions & comments">🔄</button>
          <button type="button" class="rf-action-icon-btn rf-close-btn" title="Close">✕</button>
        </div>
      </div>

      <div class="rf-popup-body">
        <!-- 1. Sentiment Hero Card -->
        <div class="rf-hero-card rf-${sentimentKey}">
          <div class="rf-hero-sentiment-row">
            <div class="rf-sentiment-pill">
              <span>${sentimentInfo.emoji}</span>
              <span>${sentimentInfo.en} • ${sentimentInfo.si}</span>
            </div>
            <span class="rf-confidence-pct">${confidencePct}% Confidence</span>
          </div>

          <div class="rf-confidence-track">
            <div class="rf-confidence-bar" style="width: ${confidencePct}%;"></div>
          </div>

          <div class="rf-hero-summary-text">
            ${data.reason || (sentimentKey === 'positive'
              ? 'Audience reception is overwhelmingly supportive with high praise and love reactions.'
              : sentimentKey === 'negative'
              ? 'Audience reaction expresses notable dissatisfaction or critical feedback.'
              : 'Audience reaction represents balanced or diverse mixed points of view.')}
          </div>
        </div>

        <!-- 2. Emotion Breakdown -->
        <div class="rf-section-title">
          <span>Top Emotional Triggers</span>
          <span>මූලික හැඟීම්</span>
        </div>

        <div class="rf-emotions-list">
          ${dominantEmotions.map(d => {
            const emoMeta = SINHALA_EMOTIONS[d.emotion] || { en: d.emotion, si: d.emotion, emoji: '🔹' };
            const pct = Math.round(d.probability * 100);
            return `
              <div class="rf-emotion-row">
                <div class="rf-emotion-meta">
                  <span class="rf-emotion-name">${emoMeta.emoji} ${emoMeta.en} (${emoMeta.si})</span>
                  <span class="rf-emotion-score">${pct}%</span>
                </div>
                <div class="rf-progress-track">
                  <div class="rf-progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Toggle all 22 emotions -->
        <button type="button" class="rf-toggle-drawer-btn">
          ▼ View All 22 Detected Emotions
        </button>

        <div class="rf-drawer-grid" style="display: none;">
          ${Object.entries(data.all_emotions || {}).map(([key, val]) => {
            const emoMeta = SINHALA_EMOTIONS[key] || { en: key, si: key, emoji: '🔹' };
            const pct = Math.round(val * 100);
            return `
              <div class="rf-drawer-item">
                <span>${emoMeta.emoji} ${emoMeta.en}</span>
                <strong>${pct}%</strong>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 3. Audience Signals / Audit Footer -->
        <div class="rf-signals-card">
          <div class="rf-signal-stats">
            <span>💬 ${totalComments} Sinhala Comments Analyzed</span>
            <span>${totalReactions.toLocaleString()} Reactions</span>
          </div>

          <div class="rf-rxn-chips-wrap">
            ${Object.entries(reactionsSummary)
              .filter(([_, count]) => count > 0)
              .map(([rxn, count]) => `
                <span class="rf-mini-chip">
                  <span>${REACTION_ICONS[rxn] || ''}</span>
                  <span>${count.toLocaleString()}</span>
                </span>
              `).join('') || '<span class="rf-mini-chip">No reactions recorded</span>'}
          </div>

          <div class="rf-source-badge">
            <span>⚡ Mock Facebook 3rd-Party API</span>
            <span>• Multimodal Net</span>
          </div>
        </div>
      </div>
    `;

    popup.querySelector('.rf-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.remove();
    });

    const refreshBtn = popup.querySelector('.rf-refresh-btn');
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      postCache.delete(postId);
      renderLoadingPopup(wrapper, triggerBtn, postId);
      fetchAndAnalyzePost(postEl, wrapper, triggerBtn, postId);
    });

    const drawerBtn = popup.querySelector('.rf-toggle-drawer-btn');
    const drawerGrid = popup.querySelector('.rf-drawer-grid');
    drawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = drawerGrid.style.display === 'none';
      drawerGrid.style.display = isHidden ? 'grid' : 'none';
      drawerBtn.textContent = isHidden ? '▲ Hide 22 Emotions' : '▼ View All 22 Detected Emotions';
      positionPopup(popup, triggerBtn);
    });

    popup.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(popup);
    positionPopup(popup, triggerBtn);
  }

  function showErrorPopup(triggerBtn, postId, errorMsg) {
    const existing = document.querySelector(`.rf-grammarly-popup[data-rf-target-post="${postId}"]`);
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'rf-grammarly-popup';
    popup.setAttribute('data-rf-target-post', postId);
    popup._rfTrigger = triggerBtn;

    popup.innerHTML = `
      <div class="rf-popup-header">
        <div class="rf-brand-group">
          <div class="rf-brand-icon">⚠️</div>
          <span class="rf-brand-title">ReactionFusion</span>
        </div>
        <div class="rf-popup-actions">
          <button type="button" class="rf-action-icon-btn rf-close-btn">✕</button>
        </div>
      </div>
      <div class="rf-popup-body">
        <div class="rf-hero-card rf-negative">
          <div class="rf-hero-sentiment-row">
            <span class="rf-sentiment-pill">Analysis Unavailable</span>
          </div>
          <div class="rf-hero-summary-text">${errorMsg}</div>
        </div>
      </div>
    `;
    popup.querySelector('.rf-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.remove();
    });
    document.body.appendChild(popup);
    positionPopup(popup, triggerBtn);
  }

  // 8. Global Dismissal Listeners
  function initGlobalDismissal() {
    document.addEventListener('click', (e) => {
      const popup = document.querySelector('.rf-grammarly-popup');
      if (!popup) return;
      if (popup.contains(e.target)) return;
      if (e.target.closest('.rf-grammarly-wrapper')) return;
      popup.remove();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.rf-grammarly-popup').forEach(p => p.remove());
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
