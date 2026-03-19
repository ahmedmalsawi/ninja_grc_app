/**
 * Form section tabs driven by tab clicks and current phase.
 * One section visible at a time; phase change switches to matching tab.
 */
(function (global) {
  var PHASE_TO_SECTION = {
    1: 'sectionCaseInfo',
    2: 'sectionScoring',
    3: 'sectionReporter',
    4: 'sectionClassification',
    5: 'sectionScope',
    6: 'sectionProcess',
    7: 'sectionInterview',
    8: 'sectionEvidence',
    9: 'sectionImpact',
    10: 'sectionImpact',
    11: 'sectionReview',
    12: 'sectionGrievance'
  };

  function getSectionIds() {
    return [
      'sectionCaseInfo', 'sectionScoring', 'sectionReporter', 'sectionClassification',
      'sectionScope', 'sectionProcess', 'sectionInterview', 'sectionEvidence',
      'sectionExternalParties', 'sectionImpact', 'sectionReview', 'sectionGrievance'
    ];
  }

  function getPhaseFromForm(form) {
    if (!form) return 1;
    var sel = form.querySelector('#currentPhase');
    if (!sel || sel.value === '') return 1;
    var n = parseInt(sel.value, 10);
    return (n >= 1 && n <= 12) ? n : 1;
  }

  var collapsedSections = {};

  function isSectionContentHidden(sectionId) {
    return !!collapsedSections[sectionId];
  }

  function getActiveSectionId() {
    var nav = document.getElementById('formSectionNav');
    if (!nav) return null;
    var t = nav.querySelector('.form-tab[aria-selected="true"]');
    return t ? t.getAttribute('data-section') : null;
  }

  function setSectionContentVisible(sectionId, visible) {
    if (visible) delete collapsedSections[sectionId]; else collapsedSections[sectionId] = true;
    var panel = document.getElementById(sectionId);
    if (!panel) return;
    var body = panel.querySelector('.form-section-body');
    if (body) body.style.setProperty('display', visible ? 'block' : 'none', 'important');
    var useSlotPool = document.getElementById(SLOT_ID);
    if (!useSlotPool) {
      var isActive = getActiveSectionId() === sectionId;
      if (visible && isActive) panel.style.setProperty('display', 'block', 'important');
      else if (!visible) panel.style.setProperty('display', 'none', 'important');
    }
    updateToggleButtonLabel(sectionId);
  }

  function updateToggleButtonLabel(sectionId) {
    var t = document.querySelector('.case-form-section-toggle[data-section="' + sectionId + '"]');
    if (t) {
      var hidden = isSectionContentHidden(sectionId);
      t.textContent = hidden ? 'Show' : 'Hide';
      t.setAttribute('aria-label', hidden ? 'Show section content' : 'Hide section content');
    }
  }

  var SLOT_ID = 'formSectionContentSlot';
  var POOL_ID = 'formSectionPool';

  function ensureSlotPoolSetup(form) {
    if (!form) return;
    var slot = document.getElementById(SLOT_ID);
    var pool = document.getElementById(POOL_ID);
    if (!slot || !pool) {
      if (!slot) {
        slot = document.createElement('div');
        slot.id = SLOT_ID;
        slot.className = 'form-section-content-slot';
        form.insertBefore(slot, form.firstChild);
      }
      if (!pool) {
        pool = document.createElement('div');
        pool.id = POOL_ID;
        pool.className = 'form-section-pool';
        pool.setAttribute('aria-hidden', 'true');
        pool.style.display = 'none';
        var actions = null;
        for (var i = 0; i < form.children.length; i++) {
          if (form.children[i].classList && form.children[i].classList.contains('form-actions')) {
            actions = form.children[i];
            break;
          }
        }
        if (actions) form.insertBefore(pool, actions);
        else form.appendChild(pool);
      }
    }
    var refs = getSlotAndPool(form);
    slot = refs.slot;
    pool = refs.pool;
    if (!slot && document.getElementById(SLOT_ID)) {
      slot = document.getElementById(SLOT_ID);
      if (slot && form.contains(slot)) {
        slot.parentNode.removeChild(slot);
        form.insertBefore(slot, form.firstChild);
      } else slot = null;
    }
    if (!pool && document.getElementById(POOL_ID)) {
      pool = document.getElementById(POOL_ID);
      if (pool && form.contains(pool)) {
        pool.parentNode.removeChild(pool);
        var before = null;
        for (var k = 0; k < form.children.length; k++) {
          if (form.children[k].classList && form.children[k].classList.contains('form-actions')) {
            before = form.children[k];
            break;
          }
        }
        if (before) form.insertBefore(pool, before);
        else form.appendChild(pool);
      } else pool = null;
    }
    if (!slot || !pool) return;
    ensureFormActionsVisible(form);
    var ids = getSectionIds();
    var needMigrate = false;
    for (var i = 0; i < ids.length; i++) {
      var panel = document.getElementById(ids[i]);
      if (panel && panel.parentNode !== slot && panel.parentNode !== pool) {
        needMigrate = true;
        break;
      }
    }
    if (needMigrate) {
      for (var j = 0; j < ids.length; j++) {
        var p = document.getElementById(ids[j]);
        if (!p) continue;
        if (j === 0) slot.appendChild(p);
        else pool.appendChild(p);
      }
    }
  }

  function getSlotAndPool(form) {
    var slot = null, pool = null;
    for (var i = 0; i < form.children.length; i++) {
      var el = form.children[i];
      if (el.id === SLOT_ID) slot = el;
      if (el.id === POOL_ID) pool = el;
    }
    return { slot: slot, pool: pool };
  }

  /** Keep Save/Print/Cancel bar as a direct child of the form and visible (it can end up inside the pool otherwise). */
  function ensureFormActionsVisible(form) {
    if (!form) return;
    var actions = form.querySelector('.form-actions');
    if (!actions) return;
    if (actions.parentNode !== form) {
      actions.parentNode.removeChild(actions);
      form.appendChild(actions);
    }
    actions.style.removeProperty('display');
    if (window.getComputedStyle(actions).display === 'none') actions.style.display = 'flex';
  }

  /** Ensure slot and pool are direct children of the form so we never use a nested copy. */
  function ensureSlotPoolDirectChildren(form, refs) {
    var slot = refs.slot, pool = refs.pool;
    if (slot && slot.parentNode !== form) {
      slot.parentNode.removeChild(slot);
      form.insertBefore(slot, form.firstChild);
    }
    if (pool && pool.parentNode !== form) {
      pool.parentNode.removeChild(pool);
      var before = null;
      for (var i = 0; i < form.children.length; i++) {
        if (form.children[i].classList && form.children[i].classList.contains('form-actions')) {
          before = form.children[i];
          break;
        }
      }
      if (before) form.insertBefore(pool, before);
      else form.appendChild(pool);
    }
  }

  function showSection(form, sectionId) {
    form = form || document.getElementById('caseForm');
    if (!form || !sectionId) return;
    ensureSlotPoolSetup(form);
    var refs = getSlotAndPool(form);
    if (!refs.slot || !refs.pool) return;
    ensureSlotPoolDirectChildren(form, refs);
    var slot = refs.slot;
    var pool = refs.pool;
    var panel = document.getElementById(sectionId);
    if (!panel) return;
    if (panel.parentNode === slot) return;
    var current = slot.firstElementChild;
    if (current && current !== panel) {
      current.parentNode.removeChild(current);
      pool.appendChild(current);
    }
    if (panel.parentNode && panel.parentNode !== slot) {
      panel.parentNode.removeChild(panel);
      slot.appendChild(panel);
    }
    panel.classList.remove('form-section--collapsed');
    var body = panel.querySelector('.form-section-body');
    if (body && !isSectionContentHidden(sectionId)) {
      body.style.removeProperty('display');
      body.style.removeProperty('visibility');
    }
    updateToggleButtonLabel(sectionId);
    var ids = getSectionIds();
    var nav = document.getElementById('formSectionNav');
    var total = ids.length;
    var currentIndex = 0;
    if (nav) {
      var tabs = nav.querySelectorAll('.form-tab');
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var active = t.getAttribute('data-section') === sectionId;
        if (active) {
          t.classList.add('active');
          t.setAttribute('aria-selected', 'true');
          currentIndex = i + 1;
          var titleEl = document.getElementById('formSectionTitle');
          if (titleEl) {
            var labelEl = t.querySelector('.form-tab-label');
            titleEl.textContent = labelEl ? labelEl.textContent.trim() : t.textContent.trim();
          }
        } else {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      }
    }
    var progressText = document.getElementById('formProgressText');
    var progressFill = document.getElementById('formProgressFill');
    if (progressText && global.NinjaI18n && global.NinjaI18n.t) {
      progressText.textContent = global.NinjaI18n.t('sectionProgressSection') + ' ' + currentIndex + ' ' + global.NinjaI18n.t('sectionProgressOf') + ' ' + total;
    } else if (progressText) {
      progressText.textContent = 'Section ' + currentIndex + ' of ' + total;
    }
    if (progressFill) progressFill.style.width = (total ? (currentIndex / total * 100) : 0) + '%';
    for (var k = 0; k < ids.length; k++) updateToggleButtonLabel(ids[k]);
    ensureFormActionsVisible(form);
    /* Keep "New case" / "Editing …" visible when switching sections – use stored form context */
    if (global.NinjaApp && typeof global.NinjaApp.updateFormContextDisplay === 'function') {
      global.NinjaApp.updateFormContextDisplay();
    }
  }

  function syncSectionsToPhase(form) {
    if (!form) return;
    var phase = getPhaseFromForm(form);
    var sectionId = PHASE_TO_SECTION[phase];
    if (sectionId) showSection(form, sectionId);
  }

  function bindTabClicks(form) {
    if (!form) return;
    var nav = document.getElementById('formSectionNav');
    if (!nav) return;
    var tabs = nav.querySelectorAll('.form-tab');
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var sectionId = this.getAttribute('data-section');
        if (!sectionId) return;
        var currentForm = document.getElementById('caseForm');
        showSection(currentForm || form, sectionId);
      });
    }
    var toggles = nav.querySelectorAll('.case-form-section-toggle');
    for (var j = 0; j < toggles.length; j++) {
      toggles[j].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var sectionId = this.getAttribute('data-section');
        if (!sectionId) return;
        var hidden = isSectionContentHidden(sectionId);
        setSectionContentVisible(sectionId, hidden);
      });
    }
  }

  function bindPhaseChange(form, callback) {
    if (!form) return;
    var sel = form.querySelector('#currentPhase');
    if (sel) sel.addEventListener('change', function () {
      if (callback) callback();
    });
  }

  function init(form) {
    if (!form) return;
    bindTabClicks(form);
    bindPhaseChange(form, function () { syncSectionsToPhase(form); });
    showSection(form, 'sectionCaseInfo');
  }

  global.NinjaSections = {
    syncSectionsToPhase: syncSectionsToPhase,
    init: init,
    getPhaseFromForm: getPhaseFromForm,
    showSection: showSection,
    setSectionContentVisible: setSectionContentVisible,
    isSectionContentHidden: isSectionContentHidden
  };
})(typeof window !== 'undefined' ? window : this);
