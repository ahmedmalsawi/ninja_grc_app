/**
 * Load and show tips from data/tips.json (bilingual).
 * Modes: toggle (section tips), hover (title on inputs), conditional (show when form state matches showWhen).
 */
(function () {
  var tipsData = {};
  var PREF_KEY = 'ninja-grc-show-tips-controls';
  /** When tips controls are off, this section still shows its general tip by default */
  var INTERVIEW_SECTION_TIP = 'sectionInterview';

  var HOVER_TIP_INPUTS = {
    sovereigntyTip: 'sovereignty',
    financialTip: 'financial',
    evidenceTip: 'evidence',
    reputationTip: 'reputation'
  };

  function loadTips() {
    return fetch('data/tips.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) { tipsData = data || {}; return tipsData; })
      .catch(function () { return {}; });
  }

  function getLang() {
    return (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en';
  }

  function getTipText(tipKey) {
    var entry = tipsData[tipKey];
    if (!entry || typeof entry !== 'object') return '';
    var lang = getLang();
    return entry[lang] || entry.en || entry.ar || '';
  }

  function getDisplayMode(tipKey) {
    var entry = tipsData[tipKey];
    if (!entry || typeof entry !== 'object') return 'toggle';
    return entry.display || 'toggle';
  }

  function showTipsForSection(tipKey) {
    if (getDisplayMode(tipKey) === 'hover' || getDisplayMode(tipKey) === 'conditional') return;
    var tipEl = document.querySelector('.section-tip[data-tip="' + tipKey + '"]');
    var btn = document.querySelector('.btn-toggle-tip[data-tip="' + tipKey + '"]');
    if (!tipEl || !tipsData[tipKey]) return;
    var text = (tipKey === 'sectionInterview' && tipsData.interviewGuidance) ? getTipText('interviewGuidance') : getTipText(tipKey);
    tipEl.textContent = text;
    if (!tipEl.classList.contains('is-visible')) tipEl.classList.remove('is-visible');
    if (btn) {
      var label = btn.querySelector('.tip-label');
      var showText = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t('showTip')) ? NinjaI18n.t('showTip') : 'Show tips';
      if (label && !tipEl.classList.contains('is-visible')) label.textContent = showText;
      btn.setAttribute('aria-expanded', tipEl.classList.contains('is-visible') ? 'true' : 'false');
    }
  }

  function applyHoverTips() {
    Object.keys(HOVER_TIP_INPUTS).forEach(function (tipKey) {
      if (getDisplayMode(tipKey) !== 'hover') return;
      var inputId = HOVER_TIP_INPUTS[tipKey];
      var input = document.getElementById(inputId);
      if (input) input.setAttribute('title', getTipText(tipKey));
    });
  }

  function getPathFromForm(form) {
    if (!form || typeof NinjaForms === 'undefined') return 'green';
    var total = NinjaForms.computeTotal(
      (form.querySelector('#sovereignty') && form.querySelector('#sovereignty').value) || 1,
      (form.querySelector('#financial') && form.querySelector('#financial').value) || 1,
      (form.querySelector('#evidence') && form.querySelector('#evidence').value) || 1,
      (form.querySelector('#reputation') && form.querySelector('#reputation').value) || 1
    );
    return NinjaForms.scoreToPath(total);
  }

  function matchesShowWhen(form, showWhen) {
    if (!showWhen || typeof showWhen !== 'object') return false;
    if (showWhen.path) {
      var path = getPathFromForm(form);
      if (String(path).toLowerCase() === String(showWhen.path).toLowerCase()) return true;
    }
    if (showWhen.currentPhase) {
      var phaseEl = form && form.querySelector('#currentPhase');
      var phase = phaseEl ? parseInt(phaseEl.value, 10) : 1;
      if (showWhen.currentPhase.min != null && phase >= showWhen.currentPhase.min) return true;
      if (showWhen.currentPhase.eq != null && phase === showWhen.currentPhase.eq) return true;
    }
    return false;
  }

  function updateConditionalTips(form) {
    if (!form) form = document.getElementById('caseForm');
    if (!form) return;
    document.querySelectorAll('.tip-conditional').forEach(function (el) {
      var tipKey = el.getAttribute('data-tip');
      if (!tipKey || !tipsData[tipKey]) return;
      if (getDisplayMode(tipKey) !== 'conditional') return;
      var showWhen = tipsData[tipKey].showWhen;
      var show = matchesShowWhen(form, showWhen);
      el.textContent = getTipText(tipKey);
      el.style.display = show ? '' : 'none';
    });
  }

  function bindToggles() {
    document.querySelectorAll('.btn-toggle-tip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tipKey = btn.getAttribute('data-tip');
        var tipEl = document.querySelector('.section-tip[data-tip="' + tipKey + '"]');
        var label = btn.querySelector('.tip-label');
        var showText = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t('showTip')) ? NinjaI18n.t('showTip') : 'Show tips';
        var hideText = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t('hideTip')) ? NinjaI18n.t('hideTip') : 'Hide tips';
        if (!tipEl) return;
        var isVisible = tipEl.classList.toggle('is-visible');
        btn.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
        if (label) label.textContent = isVisible ? hideText : showText;
      });
    });
  }

  function areTipsControlsEnabled() {
    try {
      return (typeof localStorage !== 'undefined') && localStorage.getItem(PREF_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function applyTipsControlsPreference() {
    var enabled = areTipsControlsEnabled();
    document.querySelectorAll('.btn-toggle-tip').forEach(function (btn) {
      btn.style.display = enabled ? '' : 'none';
    });
    document.querySelectorAll('.section-tip').forEach(function (el) {
      var tipKey = el.getAttribute('data-tip');
      if (!enabled && tipKey === INTERVIEW_SECTION_TIP) {
        el.classList.add('is-visible');
        el.style.display = '';
        return;
      }
      if (!enabled) {
        el.classList.remove('is-visible');
        el.style.display = 'none';
      } else {
        el.style.display = '';
        el.classList.remove('is-visible');
      }
    });
    document.querySelectorAll('.tip-conditional').forEach(function (el) {
      if (!enabled) el.style.display = 'none';
    });
  }

  function init() {
    loadTips().then(function () {
      Object.keys(tipsData).forEach(showTipsForSection);
      applyHoverTips();
      bindToggles();
      applyTipsControlsPreference();
      var form = document.getElementById('caseForm');
      if (form) updateConditionalTips(form);
    });
  }

  function refreshTips() {
    Object.keys(tipsData).forEach(function (tipKey) {
      if (getDisplayMode(tipKey) === 'hover' || getDisplayMode(tipKey) === 'conditional') return;
      var tipEl = document.querySelector('.section-tip[data-tip="' + tipKey + '"]');
      if (!tipEl || !tipsData[tipKey]) return;
      var text = (tipKey === 'sectionInterview' && tipsData.interviewGuidance) ? getTipText('interviewGuidance') : getTipText(tipKey);
      tipEl.textContent = text;
    });
    applyHoverTips();
    updateConditionalTips(document.getElementById('caseForm'));
    applyTipsControlsPreference();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.NinjaTips = {
    loadTips: loadTips,
    refreshTips: refreshTips,
    updateConditionalTips: updateConditionalTips,
    getTipText: getTipText,
    applyTipsControlsPreference: applyTipsControlsPreference,
    areTipsControlsEnabled: areTipsControlsEnabled
  };
})();
