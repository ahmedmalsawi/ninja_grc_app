/**
 * Ninja GRC - Reports view: filtered table, JSON/CSV export.
 */
(function () {
  'use strict';

  var $ = window.NinjaApp && window.NinjaApp.$;

  function getFilteredCases(cases) {
    var filterPath = $('filterPath');
    var filterPhase = $('filterPhase');
    var filterStatus = $('filterStatus');
    var filterDateFrom = $('filterDateFrom');
    var filterDateTo = $('filterDateTo');
    var searchCaseId = $('searchCaseId');
    var controlRecsOnly = $('filterControlRecs') && $('filterControlRecs').checked;

    var pathV = filterPath && filterPath.value ? filterPath.value : '';
    var phaseV = filterPhase && filterPhase.value ? filterPhase.value : '';
    var statusV = filterStatus && filterStatus.value ? filterStatus.value : '';
    var fromDate = filterDateFrom && filterDateFrom.value ? filterDateFrom.value : '';
    var toDate = filterDateTo && filterDateTo.value ? filterDateTo.value : '';
    var searchQ = searchCaseId && searchCaseId.value ? searchCaseId.value.trim().toLowerCase() : '';

    var filtered = cases.slice();
    if (pathV) filtered = filtered.filter(function (c) { return (c.path || '') === pathV; });
    if (phaseV) filtered = filtered.filter(function (c) { return String(c.currentPhase) === String(phaseV); });
    if (statusV) filtered = filtered.filter(function (c) { return ((c.impact && c.impact.currentStatus) || '') === statusV; });
    if (fromDate) filtered = filtered.filter(function (c) { var d = (c.receivedDate || '').slice(0, 10); return d >= fromDate; });
    if (toDate) filtered = filtered.filter(function (c) { var d = (c.receivedDate || '').slice(0, 10); return d <= toDate; });
    if (searchQ) filtered = filtered.filter(function (c) { return ((c.id || '') + '').toLowerCase().indexOf(searchQ) !== -1; });
    if (controlRecsOnly) filtered = filtered.filter(function (c) { return (c.impact && c.impact.recommendationType) === 'Controls'; });
    return filtered;
  }

  function getStatusLabel(status) {
    var t = NinjaI18n && NinjaI18n.t ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var map = { 'Open': t('statusOpen'), 'In preparation': t('statusInPrep'), 'In progress': t('statusInProgress'), 'Draft report': t('statusDraft'), 'Closed': t('statusClosed') };
    return map[status] || status || t('statusOpen');
  }

  function renderReports() {
    if (!$) return;
    var tbody = $('reportsTableBody');
    var summary = $('reportsSummary');
    if (!tbody) return;
    NinjaStorage.getAll().then(function (cases) {
      var filtered = getFilteredCases(cases);

      var byPath = { green: 0, yellow: 0, red: 0 };
      filtered.forEach(function (c) { byPath[c.path] = (byPath[c.path] || 0) + 1; });
      var byPhase = {};
      filtered.forEach(function (c) { var p = c.currentPhase; byPhase[p] = (byPhase[p] || 0) + 1; });

      if (summary) {
        var t = NinjaI18n ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
        summary.innerHTML =
          '<div class="stat"><span class="stat-value">' + filtered.length + '</span><span class="stat-label">' + t('all') + '</span></div>' +
          '<div class="stat"><span class="stat-value">' + (byPath.green || 0) + '</span><span class="stat-label">' + t('pathGreen') + '</span></div>' +
          '<div class="stat"><span class="stat-value">' + (byPath.yellow || 0) + '</span><span class="stat-label">' + t('pathYellow') + '</span></div>' +
          '<div class="stat"><span class="stat-value">' + (byPath.red || 0) + '</span><span class="stat-label">' + t('pathRed') + '</span></div>';
      }

      var t = NinjaI18n ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
      var getPhaseName = (window.NinjaSettings && NinjaSettings.getPhaseName) ? NinjaSettings.getPhaseName : (NinjaI18n && NinjaI18n.getPhaseName ? NinjaI18n.getPhaseName : function (n) { return String(n); });
      var showReporter = $('colReporter') && $('colReporter').checked;
      var showSubScope = $('colSubScope') && $('colSubScope').checked;

      var thReporter = document.querySelector('#rThReporter');
      var thSubScope = document.querySelector('#rThSubScope');
      if (thReporter) thReporter.style.display = showReporter ? '' : 'none';
      if (thSubScope) thSubScope.style.display = showSubScope ? '' : 'none';

      if (filtered.length === 0) {
        var t = NinjaI18n ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
        tbody.innerHTML = '<tr><td colspan="8" class="reports-empty-cell"><div class="reports-empty">' + (t('reportsEmpty') || 'No cases match your filters.') + '</div></td></tr>';
        return;
      }
      tbody.innerHTML = filtered
        .sort(function (a, b) { return (b.seq || 0) - (a.seq || 0); })
        .map(function (c) {
          var path = c.path || 'green';
          var pathLabel = path === 'green' ? t('pathGreen') : path === 'yellow' ? t('pathYellow') : t('pathRed');
          var status = (c.impact && c.impact.currentStatus) ? c.impact.currentStatus : 'Open';
          var statusLabel = getStatusLabel(status);
          var reporterCell = '<td class="col-reporter"' + (showReporter ? '' : ' style="display:none;"') + '>' + ((c.reporter && c.reporter.name) || '') + '</td>';
          var subScopeCell = '<td class="col-subscope"' + (showSubScope ? '' : ' style="display:none;"') + '>' + ((c.scope && c.scope.subScope) || '') + '</td>';
          return '<tr><td>' + (c.id || '') + '</td><td>' + (c.receivedDate || '') + '</td><td>' + getPhaseName(c.currentPhase) + '</td>' +
            '<td><span class="path-badge path-' + path + '">' + pathLabel + '</span></td><td>' + (c.totalScore || 0) + '</td>' +
            reporterCell + subScopeCell +
            '<td>' + statusLabel + '</td></tr>';
        })
        .join('');
    });
  }

  function getCasesForExport() {
    return new Promise(function (resolve) {
      NinjaStorage.getAll().then(function (cases) {
        var exportFilteredOnly = $('exportFilteredOnly') && $('exportFilteredOnly').checked;
        resolve(exportFilteredOnly ? getFilteredCases(cases) : cases);
      });
    });
  }

  function exportJson() {
    getCasesForExport().then(function (cases) {
      var blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ninja-grc-cases-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  function exportCsv() {
    getCasesForExport().then(function (cases) {
      var t = NinjaI18n && NinjaI18n.t ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
      var headers = [t('caseId'), t('receivedDate'), t('phase'), t('path'), t('totalScore'), t('currentStatus'), t('name'), t('subScope')];
      var rows = cases.map(function (c) {
        var status = (c.impact && c.impact.currentStatus) || 'Open';
        var statusLabel = getStatusLabel(status);
        return [
          c.id || '',
          c.receivedDate || '',
          c.currentPhase || '',
          c.path || '',
          c.totalScore || '',
          statusLabel,
          (c.reporter && c.reporter.name) || '',
          (c.scope && c.scope.subScope) || ''
        ];
      });
      var csv = [headers.join(','), ...rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); })].join('\n');
      var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ninja-grc-cases-' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  function exportExcel() {
    exportCsv();
  }

  function initColumnToggles() {
    if (!$('colReporter') || !$('colSubScope')) return;
    function update() { renderReports(); }
    $('colReporter').addEventListener('change', update);
    $('colSubScope').addEventListener('change', update);
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.renderReports = renderReports;
  window.NinjaApp.exportJson = exportJson;
  window.NinjaApp.exportCsv = exportCsv;
  window.NinjaApp.exportExcel = exportExcel;
  window.NinjaApp.initReportsColumnToggles = initColumnToggles;
  window.NinjaApp.printFilteredReport = function () {
    if (typeof NinjaStorage === 'undefined') return;
    NinjaStorage.getAll().then(function (cases) {
      var filtered = getFilteredCases(cases);
      if (window.NinjaApp && window.NinjaApp.printCases) window.NinjaApp.printCases(filtered);
    });
  };
})();
