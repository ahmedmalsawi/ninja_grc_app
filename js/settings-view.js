/**
 * Ninja GRC - Settings view: dropdown list and editor.
 */
(function () {
  'use strict';

  var $ = window.NinjaApp && window.NinjaApp.$;
  var showMessage = window.NinjaApp && window.NinjaApp.showMessage;

  var DROPDOWN_GROUPS = {
    'Phases': ['phases'],
    'Reporter': ['reporterType', 'reporterSource', 'department'],
    'Classification': ['reportType', 'geographic', 'geographicCity', 'pdplAction', 'reporterStatus', 'currentStatus'],
    'Scope': ['scopeType', 'subScope', 'escalationLevel', 'escalationJustification', 'severity', 'precautionaryMeasures', 'investigatingBody', 'teamMemberRoles'],
    'Process': ['caseAcceptanceStatus', 'legalPrivilege'],
    'Interview': ['interviewClassification', 'rightsNotified', 'documentationMethod', 'receiptResponseStatus'],
    'Evidence': ['formOfEvidence', 'dataCategory', 'examinationType', 'supportingParty'],
    'External parties': ['partyType', 'natureOfCommunication', 'encryption', 'writtenAgreement'],
    'Impact': ['recommendationType', 'disciplinaryAction', 'mandatoryLevel', 'impactCurrency'],
    'Filters': ['filterPath'],
    'People': ['employees']
  };

  /** Friendly labels for settings keys (camelCase -> Title case) */
  function keyToLabel(key) {
    if (!key) return '';
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }).trim();
  }

  var settingsEditingKey = null;

  function renderSettingsDropdownList() {
    var $ = window.NinjaApp && window.NinjaApp.$;
    if (!$) $ = document.getElementById.bind(document);
    var container = $('settingsDropdownList');
    var editor = $('settingsEditor');
    if (!container) return;
    if (editor) editor.style.display = 'none';
    settingsEditingKey = null;
    var t = typeof NinjaI18n !== 'undefined' && NinjaI18n.t ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var html = '';
    if (!window.NinjaSettings || !NinjaSettings.getDropdownOptions) {
      container.innerHTML = '<div class="settings-empty"><p class="settings-empty-text">Dropdown options will appear once loaded.</p></div>';
      return;
    }
    var hasAny = false;
    Object.keys(DROPDOWN_GROUPS).forEach(function (groupName) {
      var keys = DROPDOWN_GROUPS[groupName];
      var groupItems = '';
      keys.forEach(function (key) {
        var opts = NinjaSettings.getDropdownOptions(key);
        if (!opts || !opts.length) return;
        hasAny = true;
        var label = keyToLabel(key);
        groupItems += '<div class="dropdown-item">' +
          '<span class="dropdown-item-label">' + label + '</span>' +
          '<span class="dropdown-item-meta">' + opts.length + ' option' + (opts.length !== 1 ? 's' : '') + '</span>' +
          '<button type="button" class="btn btn-sm btn-outline" data-settings-key="' + key + '" aria-label="' + (t('edit') + ' ' + label).replace(/"/g, '&quot;') + '">' + t('edit') + '</button>' +
          '</div>';
      });
      if (groupItems) html += '<div class="dropdown-group-card"><h4 class="dropdown-group-title">' + groupName + '</h4><div class="dropdown-group-items">' + groupItems + '</div></div>';
    });
    container.innerHTML = html || '<div class="settings-empty"><p class="settings-empty-text">No dropdowns configured yet. Restore defaults from the case form or add options here.</p></div>';
    container.querySelectorAll('[data-settings-key]').forEach(function (btn) {
      btn.addEventListener('click', function () { openSettingsEditor(btn.getAttribute('data-settings-key'), btn); });
    });
  }

  function openSettingsEditor(key, triggerEl) {
    if (!window.NinjaSettings) return;
    settingsEditingKey = key;
    var editor = $('settingsEditor');
    var titleEl = $('settingsEditorTitle');
    var keyEl = $('settingsEditorKey');
    var optionsEl = $('settingsEditorOptions');
    if (!editor || !optionsEl) return;
    var card = triggerEl && triggerEl.closest('.dropdown-group-card');
    var container = document.getElementById('settingsDropdownList');
    if (container && editor && card && container.contains(card)) {
      container.insertBefore(editor, card.nextElementSibling);
    }
    var t = typeof NinjaI18n !== 'undefined' && NinjaI18n.t ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    if (titleEl) titleEl.textContent = t('settingsEditOptions') || 'Edit options';
    if (keyEl) keyEl.textContent = keyToLabel(key) + ' (' + key + ')';
    var options = NinjaSettings.getDropdownOptions(key);
    var isPhase = key === 'phases';
    var hasGeographic = key === 'geographicCity';
    var table = '<table class="settings-options-table" aria-label="Options list"><thead><tr><th>Value / ID</th><th>Label (EN)</th><th>Label (AR)</th>' + (hasGeographic ? '<th>Country</th>' : '') + '<th></th></tr></thead><tbody>';
    options.forEach(function (opt, i) {
      var val = isPhase ? (opt.id != null ? opt.id : '') : (opt.value != null ? String(opt.value) : '');
      var en = isPhase ? (opt.en || '') : (opt.labelEn || '');
      var ar = isPhase ? (opt.ar || '') : (opt.labelAr || '');
      var geo = hasGeographic && opt.geographic ? String(opt.geographic).replace(/"/g, '&quot;') : '';
      table += '<tr data-index="' + i + '"><td><input type="text" data-field="value" value="' + (val === '' ? '' : String(val).replace(/"/g, '&quot;')) + '"' + (isPhase ? ' readonly' : '') + ' aria-label="Value"></td><td><input type="text" data-field="labelEn" value="' + (en || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '" aria-label="Label English"></td><td><input type="text" data-field="labelAr" value="' + (ar || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '" aria-label="Label Arabic"></td>';
      if (hasGeographic) table += '<td><input type="text" data-field="geographic" value="' + geo + '" placeholder="KSA, Qatar, …" aria-label="Country"></td>';
      table += '<td><button type="button" class="btn btn-icon row-remove" aria-label="Remove row">×</button></td></tr>';
    });
    table += '</tbody></table>';
    optionsEl.innerHTML = table;
    optionsEl.querySelectorAll('.row-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('tr');
        if (row) row.remove();
      });
    });
    editor.style.display = 'block';
    var firstInput = optionsEl.querySelector('input:not([readonly])');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
  }

  function getEditorOptions(key) {
    if (!$) return [];
    var optionsEl = $('settingsEditorOptions');
    if (!optionsEl) return [];
    var isPhase = key === 'phases';
    var hasGeographic = key === 'geographicCity';
    var rows = optionsEl.querySelectorAll('tbody tr');
    var opts = [];
    rows.forEach(function (row) {
      var valInp = row.querySelector('[data-field="value"]');
      var enInp = row.querySelector('[data-field="labelEn"]');
      var arInp = row.querySelector('[data-field="labelAr"]');
      var geoInp = hasGeographic ? row.querySelector('[data-field="geographic"]') : null;
      var val = valInp ? valInp.value.trim() : '';
      var en = enInp ? enInp.value.trim() : '';
      var ar = arInp ? arInp.value.trim() : '';
      var geo = geoInp ? geoInp.value.trim() : '';
      if (isPhase) opts.push({ id: parseInt(val, 10) || opts.length + 1, en: en, ar: ar });
      else if (hasGeographic) opts.push({ value: val || en, labelEn: en, labelAr: ar, geographic: geo || undefined });
      else opts.push({ value: val || en, labelEn: en, labelAr: ar });
    });
    return opts;
  }

  function saveSettingsEditor() {
    if (!settingsEditingKey || !window.NinjaSettings) return;
    var opts = getEditorOptions(settingsEditingKey);
    NinjaSettings.setDropdownOptions(settingsEditingKey, opts);
    NinjaSettings.populateAllSelects();
    var editor = $('settingsEditor');
    var viewSettings = document.getElementById('viewSettings');
    if (editor && viewSettings && editor.parentNode !== viewSettings) viewSettings.appendChild(editor);
    editor.style.display = 'none';
    settingsEditingKey = null;
    renderSettingsDropdownList();
    if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('saved') : 'Saved.');
  }

  function cancelSettingsEditor() {
    var editor = $('settingsEditor');
    var viewSettings = document.getElementById('viewSettings');
    if (editor && viewSettings && editor.parentNode !== viewSettings) viewSettings.appendChild(editor);
    if (editor) editor.style.display = 'none';
    settingsEditingKey = null;
    renderSettingsDropdownList();
  }

  function getSettingsEditingKey() { return settingsEditingKey; }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.DROPDOWN_GROUPS = DROPDOWN_GROUPS;
  window.NinjaApp.settingsEditingKey = function () { return settingsEditingKey; };
  window.NinjaApp.renderSettingsDropdownList = renderSettingsDropdownList;
  window.NinjaApp.openSettingsEditor = openSettingsEditor;
  window.NinjaApp.getEditorOptions = getEditorOptions;
  window.NinjaApp.saveSettingsEditor = saveSettingsEditor;
  window.NinjaApp.cancelSettingsEditor = cancelSettingsEditor;
})();
