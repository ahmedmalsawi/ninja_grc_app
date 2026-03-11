/**
 * Apply i18n on standalone HTML pages (reports.html, scoring-reference.html):
 * init NinjaI18n, set dir/lang, document title, nav labels, page titles, and bind lang switcher.
 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  function applyStandalone() {
    if (typeof NinjaI18n === 'undefined' || !NinjaI18n.t) return;
    var t = NinjaI18n.t.bind(NinjaI18n);
    document.title = t('appTitle');
    var navKeys = ['navCases', 'navReports', 'navSettings', 'navNotes'];
    var navIds = ['navCases', 'navReports', 'navSettings', 'navNotes'];
    for (var i = 0; i < navIds.length; i++) {
      var el = $(navIds[i]);
      if (el) el.textContent = t(navKeys[i]);
    }
    var reportsTitle = $('reportsTitle');
    if (reportsTitle) reportsTitle.textContent = t('reportsTitle');
    var settingsTitle = $('settingsTitle');
    if (settingsTitle) settingsTitle.textContent = t('settingsTitle');
    var notesTitle = $('notesTitle');
    if (notesTitle) notesTitle.textContent = t('navNotes');
    var notesIntro = $('notesIntro');
    if (notesIntro) notesIntro.textContent = t('notesIntro');
    var skipLink = $('skipLink');
    if (skipLink) skipLink.textContent = t('skipToMain');
  }

  function bindLangSwitcher() {
    var langAr = $('langAr');
    var langEn = $('langEn');
    if (langAr && typeof NinjaI18n !== 'undefined') {
      langAr.addEventListener('click', function () {
        NinjaI18n.setLang('ar');
        if (NinjaI18n.applyDirLang) NinjaI18n.applyDirLang();
        applyStandalone();
        langAr.classList.add('active');
        if (langEn) langEn.classList.remove('active');
      });
    }
    if (langEn && typeof NinjaI18n !== 'undefined') {
      langEn.addEventListener('click', function () {
        NinjaI18n.setLang('en');
        if (NinjaI18n.applyDirLang) NinjaI18n.applyDirLang();
        applyStandalone();
        langEn.classList.add('active');
        if (langAr) langAr.classList.remove('active');
      });
    }
    if (typeof NinjaI18n !== 'undefined') {
      var lang = NinjaI18n.getLang();
      if (langAr) langAr.classList.toggle('active', lang === 'ar');
      if (langEn) langEn.classList.toggle('active', lang === 'en');
    }
  }

  function run() {
    if (typeof NinjaI18n === 'undefined' || !NinjaI18n.init) {
      applyStandalone();
      bindLangSwitcher();
      return;
    }
    NinjaI18n.init()
      .then(function () {
        if (NinjaI18n.applyDirLang) NinjaI18n.applyDirLang();
        applyStandalone();
        bindLangSwitcher();
      })
      .catch(function () {
        if (NinjaI18n.applyDirLang) NinjaI18n.applyDirLang();
        applyStandalone();
        bindLangSwitcher();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
