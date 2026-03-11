/**
 * Ninja GRC - View routing: show/hide panels and nav state.
 * Uses document.getElementById and inline display to avoid any CSS/load-order issues.
 */
(function () {
  'use strict';

  function setView(viewName) {
    var list = document.getElementById('viewList');
    var form = document.getElementById('viewForm');
    var reports = document.getElementById('viewReports');
    var settings = document.getElementById('viewSettings');
    var notes = document.getElementById('viewNotes');

    function hide(el) {
      if (el) el.style.setProperty('display', 'none', 'important');
    }
    function show(el) {
      if (el) el.style.setProperty('display', 'block', 'important');
    }

    hide(list);
    hide(form);
    hide(reports);
    hide(settings);
    hide(notes);

    // Support both old (.nav-links a) and new (.nav-tabs .nav-tab) structures
    var navLinks = document.querySelectorAll('.nav-links a, .nav-tabs .nav-tab');
    for (var i = 0; i < navLinks.length; i++) navLinks[i].classList.remove('active');

    if (viewName === 'list' && list) {
      show(list);
      var a = document.getElementById('navCases') || document.querySelector('.nav-cases');
      if (a) a.classList.add('active');
    } else if (viewName === 'form' && form) {
      show(form);
    } else if (viewName === 'reports' && reports) {
      show(reports);
      var a = document.getElementById('navReports') || document.querySelector('.nav-reports');
      if (a) a.classList.add('active');
      if (window.NinjaApp && typeof window.NinjaApp.renderReports === 'function') window.NinjaApp.renderReports();
    } else if (viewName === 'settings' && settings) {
      show(settings);
      var a = document.getElementById('navSettings') || document.querySelector('.nav-settings');
      if (a) a.classList.add('active');
      if (window.NinjaApp && typeof window.NinjaApp.renderSettingsDropdownList === 'function') window.NinjaApp.renderSettingsDropdownList();
    } else if (viewName === 'notes' && notes) {
      show(notes);
      var a = document.getElementById('navNotes') || document.querySelector('.nav-notes');
      if (a) a.classList.add('active');
    }
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.setView = setView;
})();
