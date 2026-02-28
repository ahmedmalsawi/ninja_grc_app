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

    var navLinks = document.querySelectorAll('.nav-links a');
    for (var i = 0; i < navLinks.length; i++) navLinks[i].classList.remove('active');

    if (viewName === 'list' && list) {
      show(list);
      var a = document.querySelector('.nav-cases');
      if (a) a.classList.add('active');
    } else if (viewName === 'form' && form) {
      show(form);
    } else if (viewName === 'reports' && reports) {
      show(reports);
      var a = document.querySelector('.nav-reports');
      if (a) a.classList.add('active');
      if (window.NinjaApp && typeof window.NinjaApp.renderReports === 'function') window.NinjaApp.renderReports();
    } else if (viewName === 'settings' && settings) {
      show(settings);
      var a = document.querySelector('.nav-settings');
      if (a) a.classList.add('active');
      if (window.NinjaApp && typeof window.NinjaApp.renderSettingsDropdownList === 'function') window.NinjaApp.renderSettingsDropdownList();
    }
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.setView = setView;
})();
