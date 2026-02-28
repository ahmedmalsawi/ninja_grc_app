/**
 * Dropdown options: load defaults from data/dropdowns.json, merge with localStorage overrides,
 * populate all <select>s, and provide Settings UI hooks.
 */
(function (global) {
  var STORAGE_KEY = 'ninja-grc-dropdowns';
  var defaultDropdowns = {};
  var mergedDropdowns = {};

  var SELECT_TO_KEY = {
    currentPhase: 'phases',
    reporterType: 'reporterType',
    reporterSource: 'reporterSource',
    reporterDept: 'department',
    reportType: 'reportType',
    geographic: 'geographic',
    geographicCity: 'geographicCity',
    pdplAction: 'pdplAction',
    reporterStatus: 'reporterStatus',
    currentStatus: 'currentStatus',
    scopeType: 'scopeType',
    subScope: 'subScope',
    escalationLevel: 'escalationLevel',
    escalationJustification: 'escalationJustification',
    severity: 'severity',
    precautionaryMeasures: 'precautionaryMeasures',
    investigatingBody: 'investigatingBody',
    caseAcceptanceStatus: 'caseAcceptanceStatus',
    legalPrivilege: 'legalPrivilege',
    legalRep1: 'employees',
    legalRep2: 'employees',
    legalRep3: 'employees',
    managementRep: 'employees',
    interviewClassification: 'interviewClassification',
    rightsNotified: 'rightsNotified',
    documentationMethod: 'documentationMethod',
    receiptResponseStatus: 'receiptResponseStatus',
    summonsStatus: 'summonsStatus',
    formOfEvidence: 'formOfEvidence',
    dataCategory: 'dataCategory',
    examinationType: 'examinationType',
    supportingParty: 'supportingParty',
    partyType: 'partyType',
    natureOfCommunication: 'natureOfCommunication',
    encryption: 'encryption',
    recommendationType: 'recommendationType',
    disciplinaryAction: 'disciplinaryAction',
    mandatoryLevel: 'mandatoryLevel',
    impactCurrency: 'impactCurrency',
    filterPath: 'filterPath',
    filterPhase: 'phases',
    filterStatus: 'currentStatus',
    rcaType: 'rcaType',
    rcaSubtype: 'rcaSubtype'
  };

  /** Child select id -> parent select id for cascading dropdowns */
  var DEPENDS_ON = {
    geographicCity: 'geographic',
    subScope: 'scopeType',
    rcaSubtype: 'rcaType'
  };

  function loadDefaults() {
    return fetch('data/dropdowns.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) {
        defaultDropdowns = data || {};
        return defaultDropdowns;
      })
      .catch(function () { return {}; });
  }

  function loadUserOverrides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveUserOverrides(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function merge() {
    var user = loadUserOverrides();
    mergedDropdowns = {};
    Object.keys(defaultDropdowns).forEach(function (key) {
      mergedDropdowns[key] = user[key] && Array.isArray(user[key]) ? user[key] : defaultDropdowns[key];
    });
  }

  function getDropdownOptions(key) {
    if (!key) return [];
    var list = mergedDropdowns[key];
    return Array.isArray(list) ? list.slice() : [];
  }

  function setDropdownOptions(key, options) {
    if (!key || !Array.isArray(options)) return;
    var user = loadUserOverrides();
    user[key] = options;
    saveUserOverrides(user);
    mergedDropdowns[key] = options;
  }

  function restoreDefaults(key) {
    var user = loadUserOverrides();
    if (key) {
      if (defaultDropdowns[key]) {
        user[key] = defaultDropdowns[key];
        mergedDropdowns[key] = defaultDropdowns[key];
      }
    } else {
      user = {};
      mergedDropdowns = {};
      Object.keys(defaultDropdowns).forEach(function (k) { mergedDropdowns[k] = defaultDropdowns[k]; });
    }
    saveUserOverrides(user);
  }

  function getAllDropdownKeys() {
    return Object.keys(mergedDropdowns);
  }

  function getOptionLabel(opt, lang) {
    if (!opt) return '';
    if (opt.labelEn !== undefined && opt.labelAr !== undefined)
      return lang === 'ar' ? (opt.labelAr || opt.labelEn) : (opt.labelEn || opt.labelAr);
    if (opt.en !== undefined && opt.ar !== undefined)
      return lang === 'ar' ? (opt.ar || opt.en) : (opt.en || opt.ar);
    return opt.value !== undefined ? String(opt.value) : '';
  }

  function getOptionValue(opt) {
    if (!opt) return '';
    if (opt.value !== undefined) return String(opt.value);
    if (opt.id !== undefined) return String(opt.id);
    return '';
  }

  function populateSelect(selectEl, key, opts) {
    if (!selectEl || !key) return;
    var lang = (opts && opts.lang) || ((typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en');
    var emptyLabel = opts && opts.emptyLabel !== undefined ? opts.emptyLabel : '—';
    var options = getDropdownOptions(key);
    var parentSelectId = DEPENDS_ON && DEPENDS_ON[key];
    var parentValue = opts && opts.parentValue !== undefined ? opts.parentValue : (parentSelectId && document.getElementById(parentSelectId) ? document.getElementById(parentSelectId).value : '');
    if (parentSelectId && parentValue !== undefined && parentValue !== null && parentValue !== '') {
      var parentProp = parentSelectId;
      options = options.filter(function (opt) { return opt[parentProp] === parentValue; });
    }
    var isPhase = key === 'phases';
    var allowEmpty = (selectEl.id !== 'currentPhase');
    if (selectEl.id === 'filterPhase' || selectEl.id === 'filterStatus') emptyLabel = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t('all')) ? NinjaI18n.t('all') : 'All';
    if (selectEl.id === 'filterPath') emptyLabel = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t('allPaths')) ? NinjaI18n.t('allPaths') : 'All paths';
    var selected = selectEl.value;
    selectEl.innerHTML = '';
    if (allowEmpty) {
      var emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = emptyLabel;
      selectEl.appendChild(emptyOpt);
    }
    options.forEach(function (opt) {
      var val = isPhase ? String(opt.id) : getOptionValue(opt);
      var label = getOptionLabel(opt, lang);
      if (isPhase && selectEl.id === 'currentPhase') label = opt.id + '. ' + label;
      var o = document.createElement('option');
      o.value = val;
      o.textContent = label;
      selectEl.appendChild(o);
    });
    if (selected !== undefined && selected !== null) {
      try { selectEl.value = selected; } catch (e) {}
    }
  }

  function populateAllSelects() {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en';
    Object.keys(SELECT_TO_KEY).forEach(function (selectId) {
      var el = document.getElementById(selectId);
      var key = SELECT_TO_KEY[selectId];
      var parentId = DEPENDS_ON && DEPENDS_ON[key];
      var parentValue = parentId && document.getElementById(parentId) ? document.getElementById(parentId).value : undefined;
      if (el && key && mergedDropdowns[key]) populateSelect(el, key, { lang: lang, parentValue: parentValue });
    });
    bindCascadeListeners();
    populateCheckboxGroups();
  }

  function populateCheckboxGroups() {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en';
    var groupConfigs = [
      { containerId: 'investigatingBodyGroup', key: 'investigatingBody', name: 'scope.investigatingBody' },
      { containerId: 'teamMembersGroup', key: 'teamMemberRoles', name: 'scope.teamMembers' }
    ];
    groupConfigs.forEach(function (cfg) {
      var container = document.getElementById(cfg.containerId);
      if (!container) return;
      var options = getDropdownOptions(cfg.key);
      if (!options || !options.length) return;
      container.innerHTML = '';
      options.forEach(function (opt) {
        var val = getOptionValue(opt);
        var label = getOptionLabel(opt, lang);
        var labelEl = document.createElement('label');
        labelEl.className = 'checkbox-inline';
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.value = val;
        input.name = cfg.name + '[]';
        input.setAttribute('data-checkbox-group', cfg.containerId);
        labelEl.appendChild(input);
        labelEl.appendChild(document.createTextNode(' ' + label));
        container.appendChild(labelEl);
      });
    });
  }

  function setCheckboxGroupValues(containerId, values) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var arr = Array.isArray(values) ? values : (typeof values === 'string' && values ? values.split(',') : []);
    container.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.checked = arr.indexOf(cb.value.trim()) !== -1;
    });
  }

  function getCheckboxGroupValues(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return [];
    var out = [];
    container.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
      if (cb.value) out.push(cb.value.trim());
    });
    return out;
  }

  function bindCascadeListeners() {
    if (DEPENDS_ON && document.getElementById('geographic') && !document.getElementById('geographic').dataset.cascadeBound) {
      document.getElementById('geographic').addEventListener('change', function () {
        var cityEl = document.getElementById('geographicCity');
        if (cityEl && NinjaSettings && NinjaSettings.populateSelect) {
          var parentValue = document.getElementById('geographic').value;
          NinjaSettings.populateSelect(cityEl, 'geographicCity', {
            lang: (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en',
            parentValue: parentValue
          });
          cityEl.value = '';
        }
      });
      document.getElementById('geographic').dataset.cascadeBound = 'true';
    }
    if (DEPENDS_ON && document.getElementById('scopeType') && !document.getElementById('scopeType').dataset.cascadeBound) {
      document.getElementById('scopeType').addEventListener('change', function () {
        var subEl = document.getElementById('subScope');
        if (subEl && NinjaSettings && NinjaSettings.populateSelect) {
          var parentValue = document.getElementById('scopeType').value;
          NinjaSettings.populateSelect(subEl, 'subScope', {
            lang: (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en',
            parentValue: parentValue
          });
          subEl.value = '';
        }
      });
      document.getElementById('scopeType').dataset.cascadeBound = 'true';
    }
    if (DEPENDS_ON && document.getElementById('rcaType') && !document.getElementById('rcaType').dataset.cascadeBound) {
      document.getElementById('rcaType').addEventListener('change', function () {
        var subEl = document.getElementById('rcaSubtype');
        if (subEl && NinjaSettings && NinjaSettings.populateSelect) {
          var parentValue = document.getElementById('rcaType').value;
          NinjaSettings.populateSelect(subEl, 'rcaSubtype', {
            lang: (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en',
            parentValue: parentValue
          });
          subEl.value = '';
        }
      });
      document.getElementById('rcaType').dataset.cascadeBound = 'true';
    }
  }

  function getDefaultDropdowns() {
    return defaultDropdowns;
  }

  /** Return current user overrides for backup/export. */
  function getExportData() {
    return loadUserOverrides();
  }

  /** Replace user overrides from imported data and refresh UI. */
  function setFromImport(data) {
    if (!data || typeof data !== 'object') return;
    saveUserOverrides(data);
    merge();
    if (typeof NinjaSettings.populateAllSelects === 'function') NinjaSettings.populateAllSelects();
  }

  function getPhaseName(phaseId) {
    var phases = getDropdownOptions('phases');
    var p = phases.filter(function (o) { return String(o.id) === String(phaseId); })[0];
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en';
    return p ? getOptionLabel(p, lang) : String(phaseId);
  }

  function init() {
    return loadDefaults().then(function () {
      merge();
      populateAllSelects();
      return mergedDropdowns;
    });
  }

  global.NinjaSettings = {
    init: init,
    getDropdownOptions: getDropdownOptions,
    setDropdownOptions: setDropdownOptions,
    restoreDefaults: restoreDefaults,
    getAllDropdownKeys: getAllDropdownKeys,
    getDefaultDropdowns: getDefaultDropdowns,
    getExportData: getExportData,
    setFromImport: setFromImport,
    getPhaseName: getPhaseName,
    populateSelect: populateSelect,
    populateAllSelects: populateAllSelects,
    populateCheckboxGroups: populateCheckboxGroups,
    setCheckboxGroupValues: setCheckboxGroupValues,
    getCheckboxGroupValues: getCheckboxGroupValues,
    bindCascadeListeners: bindCascadeListeners,
    SELECT_TO_KEY: SELECT_TO_KEY,
    DEPENDS_ON: DEPENDS_ON,
    getOptionLabel: getOptionLabel,
    getOptionValue: getOptionValue,
    merge: merge
  };
})(typeof window !== 'undefined' ? window : this);
