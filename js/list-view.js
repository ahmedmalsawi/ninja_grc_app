/**
 * Ninja GRC - Cases list view: render table and load from storage.
 */
(function () {
  'use strict';

  var $ = window.NinjaApp && window.NinjaApp.$;

  function renderList(cases) {
    if (!$) return;
    var tbody = $('caseTableBody');
    var table = $('caseTable');
    var empty = $('emptyState');
    if (!tbody || !table || !empty) return;
    if (!cases || cases.length === 0) {
      table.style.display = 'none';
      empty.style.display = 'block';
      empty.textContent = typeof NinjaI18n !== 'undefined' ? NinjaI18n.t('noCases') : 'No cases yet.';
      return;
    }
    empty.style.display = 'none';
    table.style.display = 'table';
    var t = typeof NinjaI18n !== 'undefined' ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var getPhaseName = (window.NinjaSettings && NinjaSettings.getPhaseName) ? NinjaSettings.getPhaseName : (typeof NinjaI18n !== 'undefined' ? NinjaI18n.getPhaseName : function (n) { return String(n); });
    tbody.innerHTML = cases
      .sort(function (a, b) { return (b.seq || 0) - (a.seq || 0); })
      .map(function (c) {
        var path = c.path || 'green';
        var pathLabel = path === 'green' ? t('pathGreen') : path === 'yellow' ? t('pathYellow') : t('pathRed');
        var status = (c.impact && c.impact.currentStatus) ? c.impact.currentStatus : 'Open';
        return '<tr data-id="' + (c.id || '') + '">' +
          '<td>' + (c.seq || '') + '</td>' +
          '<td>' + (c.id || '') + '</td>' +
          '<td>' + (c.receivedDate || '') + '</td>' +
          '<td>' + getPhaseName(c.currentPhase) + '</td>' +
          '<td><span class="path-badge path-' + path + '">' + pathLabel + '</span></td>' +
          '<td>' + (c.totalScore || 0) + '</td>' +
          '<td>' + status + '</td>' +
          '<td class="actions">' +
          '<button type="button" class="btn edit-case" data-id="' + (c.id || '') + '">' + t('edit') + '</button>' +
          '</td></tr>';
      })
      .join('');
    tbody.querySelectorAll('.edit-case').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.NinjaApp && window.NinjaApp.openCase) window.NinjaApp.openCase(btn.getAttribute('data-id'));
      });
    });
  }

  function loadList() {
    if (typeof NinjaStorage === 'undefined' || !NinjaStorage.getAll) return;
    NinjaStorage.getAll().then(renderList);
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.renderList = renderList;
  window.NinjaApp.loadList = loadList;
})();
