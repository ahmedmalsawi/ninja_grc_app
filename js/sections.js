/**
 * Collapsible form sections driven by current phase (1-9).
 * Phase dropdown change expands the matching section; user can toggle any section header.
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
    9: 'sectionImpact'
  };

  function getSectionIds() {
    return [
      'sectionCaseInfo', 'sectionScoring', 'sectionReporter', 'sectionClassification',
      'sectionScope', 'sectionProcess', 'sectionInterview', 'sectionEvidence',
      'sectionExternalParties', 'sectionImpact'
    ];
  }

  function getPhaseFromForm(form) {
    if (!form) return 1;
    var sel = form.querySelector('#currentPhase');
    if (!sel || sel.value === '') return 1;
    var n = parseInt(sel.value, 10);
    return (n >= 1 && n <= 9) ? n : 1;
  }

  function collapseSection(sectionEl) {
    if (!sectionEl) return;
    sectionEl.classList.add('form-section--collapsed');
    var btn = sectionEl.querySelector('.form-section-header');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function expandSection(sectionEl) {
    if (!sectionEl) return;
    sectionEl.classList.remove('form-section--collapsed');
    var btn = sectionEl.querySelector('.form-section-header');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function collapseAllSections(form) {
    if (!form) return;
    getSectionIds().forEach(function (id) {
      var el = form.querySelector('#' + id);
      if (el) collapseSection(el);
    });
  }

  function syncSectionsToPhase(form) {
    if (!form) return;
    var phase = getPhaseFromForm(form);
    collapseAllSections(form);
    var sectionId = PHASE_TO_SECTION[phase];
    if (sectionId) {
      var el = form.querySelector('#' + sectionId);
      if (el) expandSection(el);
    }
    if (phase === 8) {
      var ext = form.querySelector('#sectionExternalParties');
      if (ext) expandSection(ext);
    }
  }

  function toggleSection(sectionEl) {
    if (!sectionEl) return;
    var collapsed = sectionEl.classList.contains('form-section--collapsed');
    if (collapsed) expandSection(sectionEl); else collapseSection(sectionEl);
  }

  function bindSectionHeaders(form) {
    if (!form) return;
    getSectionIds().forEach(function (id) {
      var sectionEl = form.querySelector('#' + id);
      if (!sectionEl) return;
      var btn = sectionEl.querySelector('.form-section-header');
      if (!btn) return;
      btn.addEventListener('click', function () {
        toggleSection(sectionEl);
      });
    });
  }

  function bindPhaseChange(form, callback) {
    if (!form) return;
    var sel = form.querySelector('#currentPhase');
    if (sel) sel.addEventListener('change', function () {
      if (callback) callback();
    });
  }

  function bindNavLinks(form) {
    if (!form) return;
    var nav = form.closest('#viewForm');
    if (!nav) return;
    nav.querySelectorAll('.form-section-nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        var id = href.slice(1);
        var sectionEl = form.querySelector('#' + id);
        if (sectionEl) {
          collapseAllSections(form);
          expandSection(sectionEl);
          sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function init(form) {
    if (!form) return;
    bindSectionHeaders(form);
    bindPhaseChange(form, function () { syncSectionsToPhase(form); });
    bindNavLinks(form);
    syncSectionsToPhase(form);
  }

  global.NinjaSections = {
    syncSectionsToPhase: syncSectionsToPhase,
    init: init,
    getPhaseFromForm: getPhaseFromForm,
    expandSection: expandSection,
    collapseSection: collapseSection,
    collapseAllSections: collapseAllSections
  };
})(typeof window !== 'undefined' ? window : this);
