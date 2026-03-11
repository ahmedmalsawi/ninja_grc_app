/**
 * Ninja GRC - Reports page init (standalone reports.html).
 * Fills filter options, binds handlers, runs renderReports.
 */
(function () {
  'use strict';
  var $ = window.NinjaApp && window.NinjaApp.$;
  if (!$) $ = function (id) { return document.getElementById(id); };
  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.setView = function () {};

  function fillReportFilters() {
    var filterPhase = $('filterPhase');
    var filterStatus = $('filterStatus');
    var filterPath = $('filterPath');
    if (typeof NinjaI18n !== 'undefined' && NinjaI18n.getPhases && filterPhase) {
      var phases = NinjaI18n.getPhases();
      if (phases.length) {
        filterPhase.innerHTML = '<option value="">' + (NinjaI18n.t ? NinjaI18n.t('all') : 'All') + '</option>' +
          phases.map(function (p) { return '<option value="' + p.id + '">' + (p.id + '. ' + (NinjaI18n.getLang() === 'ar' ? p.ar : p.en)) + '</option>'; }).join('');
      }
    }
    if (filterStatus && (typeof NinjaI18n !== 'undefined' && NinjaI18n.t)) {
      filterStatus.innerHTML = '<option value="">' + NinjaI18n.t('all') + '</option>' +
        '<option value="Open">' + NinjaI18n.t('statusOpen') + '</option>' +
        '<option value="In preparation">' + NinjaI18n.t('statusInPrep') + '</option>' +
        '<option value="In progress">' + NinjaI18n.t('statusInProgress') + '</option>' +
        '<option value="Draft report">' + NinjaI18n.t('statusDraft') + '</option>' +
        '<option value="Closed">' + NinjaI18n.t('statusClosed') + '</option>';
    }
    if (filterPath && (typeof NinjaI18n !== 'undefined' && NinjaI18n.t)) {
      filterPath.innerHTML = '<option value="">' + NinjaI18n.t('allPaths') + '</option>' +
        '<option value="green">' + NinjaI18n.t('pathGreen') + '</option>' +
        '<option value="yellow">' + NinjaI18n.t('pathYellow') + '</option>' +
        '<option value="red">' + NinjaI18n.t('pathRed') + '</option>';
    }
  }

  function bindReportHandlers() {
    var renderReports = window.NinjaApp && window.NinjaApp.renderReports;
    if (!$('viewReports')) return;
    ['filterPath', 'filterPhase', 'filterStatus', 'filterDateFrom', 'filterDateTo', 'searchCaseId', 'filterControlRecs'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener(el.id === 'searchCaseId' ? 'input' : 'change', function () { if (renderReports) renderReports(); });
    });
    if ($('colReporter') && $('colSubScope')) {
      $('colReporter').addEventListener('change', function () { if (renderReports) renderReports(); });
      $('colSubScope').addEventListener('change', function () { if (renderReports) renderReports(); });
    }
    if ($('btnExportJson')) $('btnExportJson').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.exportJson) window.NinjaApp.exportJson(); });
    if ($('btnExportCsv')) $('btnExportCsv').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.exportCsv) window.NinjaApp.exportCsv(); });
    if ($('btnExportExcel')) $('btnExportExcel').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.exportExcel) window.NinjaApp.exportExcel(); });
    if ($('btnPrintReports')) $('btnPrintReports').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.printFilteredReport) window.NinjaApp.printFilteredReport(); });
  }

  function init() {
    fillReportFilters();
    bindReportHandlers();
    if (window.NinjaApp.initReportsColumnToggles) window.NinjaApp.initReportsColumnToggles();
    if (window.NinjaApp.renderReports) window.NinjaApp.renderReports();
  }

  function run() {
    var i18nReady = (typeof NinjaI18n !== 'undefined' && NinjaI18n.init) ? NinjaI18n.init() : Promise.resolve();
    var settingsReady = (window.NinjaSettings && NinjaSettings.init) ? NinjaSettings.init() : Promise.resolve();
    Promise.all([i18nReady, settingsReady]).then(function () { init(); }).catch(function () { init(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
