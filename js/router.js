/**
 * Ninja GRC - View routing: show/hide panels and tab state.
 * Supports single-page tabbed layout and legacy multi-page.
 */
(function () {
  'use strict';

  var LOG = '[NinjaGRC:router]';

  function setView(viewName) {
    if (viewName === 'scoring-reference') viewName = 'notes';
    var main = document.getElementById('main');
    var list = document.getElementById('viewList');
    var form = document.getElementById('viewForm');
    var reports = document.getElementById('viewReports');
    var settings = document.getElementById('viewSettings');
    var notes = document.getElementById('viewNotes');

    /* Single source of truth: set data-current-view and force visibility so panels always show correctly */
    if (main) {
      var valid = (viewName === 'list' && list) || (viewName === 'form' && form) || (viewName === 'reports' && reports) || (viewName === 'settings' && settings) || (viewName === 'notes' && notes);
      var activeView = valid ? viewName : 'list';
      if (!valid && list) activeView = 'list';
      main.setAttribute('data-current-view', activeView);

      var viewPanels = document.getElementById('viewPanels');
      if (viewPanels) {
        viewPanels.style.setProperty('display', 'block', 'important');
        viewPanels.style.setProperty('visibility', 'visible', 'important');
      }
      main.style.setProperty('display', 'block', 'important');
      main.style.setProperty('visibility', 'visible', 'important');

      var panels = [list, form, reports, settings, notes];
      var activePanel = activeView === 'list' ? list : activeView === 'form' ? form : activeView === 'reports' ? reports : activeView === 'settings' ? settings : notes;
      panels.forEach(function (panel) {
        if (panel) panel.style.setProperty('display', panel === activePanel ? 'block' : 'none', 'important');
      });
    }

    var navLinks = document.querySelectorAll('.nav-links a');
    var navTabs = document.querySelectorAll('.nav-tab[role="tab"]');
    for (var i = 0; i < navLinks.length; i++) navLinks[i].classList.remove('active');
    navTabs.forEach(function (tab) {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    function setTabActive(sel) {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add('active');
        els[i].setAttribute('aria-selected', 'true');
      }
    }

    if (viewName === 'list' && list) {
      setTabActive('.nav-cases, .nav-tab--cases');
      if (window.NinjaApp && typeof window.NinjaApp.loadList === 'function') window.NinjaApp.loadList();
    } else if (viewName === 'form' && form) {
      setTabActive('.nav-cases, .nav-tab--cases');
    } else if (viewName === 'reports' && reports) {
      setTabActive('.nav-reports, .nav-tab--reports');
      if (window.NinjaApp && typeof window.NinjaApp.renderReports === 'function') window.NinjaApp.renderReports();
    } else if (viewName === 'settings' && settings) {
      setTabActive('.nav-settings, .nav-tab--settings');
      if (window.NinjaApp && typeof window.NinjaApp.renderSettingsDropdownList === 'function') window.NinjaApp.renderSettingsDropdownList();
    } else if (viewName === 'notes' && notes) {
      setTabActive('.nav-notes, .nav-tab--notes');
    } else {
      console.warn(LOG, 'no view for:', viewName);
    }
    if (viewName && window.history && window.history.replaceState && (viewName === 'list' || viewName === 'form')) {
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
    }
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.setView = setView;

  function viewFromHash() {
    var list = document.getElementById('viewList');
    if (!list) return;
    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash === 'scoring-reference') hash = 'notes';
    var v = hash || 'list';
    if (!document.getElementById('viewReports') && v === 'reports') v = 'list';
    if (!document.getElementById('viewSettings') && v === 'settings') v = 'list';
    if (!document.getElementById('viewNotes') && v === 'notes') v = 'list';
    setView(v);
  }

  function runInitialView() {
    if (!document.getElementById('viewList')) return;
    viewFromHash();
  }

  var hasHash = /#(.+)/.test(window.location.href);

  /* Run once when DOM is ready. If we have a hash, also run on DOMContentLoaded and load so we never miss. */
  if (document.readyState === 'loading') {
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('DOMContentLoaded', runInitialView, { once: true });
      if (hasHash) window.addEventListener('load', runInitialView, { once: true });
    }
  } else {
    runInitialView();
    if (hasHash && typeof window.addEventListener === 'function') {
      window.addEventListener('DOMContentLoaded', runInitialView, { once: true });
      window.addEventListener('load', runInitialView, { once: true });
      setTimeout(runInitialView, 0);
    }
  }

  /* Keep tab view in sync when URL hash changes (e.g. browser back/forward) */
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('hashchange', viewFromHash);
  }
})();
