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

  function snapshotTeamMemberState() {
    var container = document.getElementById('teamMembersGroup');
    if (!container) return {};
    var saved = {};
    container.querySelectorAll('.team-member-block').forEach(function (block) {
      var role = block.getAttribute('data-team-role');
      var cb = block.querySelector('input[type="checkbox"]');
      var ni = block.querySelector('.team-member-name');
      var ei = block.querySelector('.team-member-emp');
      if (role) {
        saved[role] = {
          checked: cb && cb.checked,
          name: ni ? ni.value : '',
          emp: ei ? ei.value : ''
        };
      }
    });
    return saved;
  }

  function populateTeamMembersGroup() {
    var container = document.getElementById('teamMembersGroup');
    if (!container) return;
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en';
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var options = getDropdownOptions('teamMemberRoles');
    if (!options || !options.length) return;
    var saved = snapshotTeamMemberState();
    container.innerHTML = '';
    options.forEach(function (opt) {
      var val = getOptionValue(opt);
      var label = getOptionLabel(opt, lang);
      var block = document.createElement('div');
      block.className = 'team-member-block';
      block.setAttribute('data-team-role', val);
      var row1 = document.createElement('label');
      row1.className = 'checkbox-inline';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = val;
      cb.setAttribute('data-checkbox-group', 'teamMembersGroup');
      var details = document.createElement('div');
      details.className = 'team-member-fields';
      details.style.display = 'none';
      details.style.marginTop = '0.35rem';
      details.style.marginLeft = '0';
      var wrapName = document.createElement('div');
      wrapName.className = 'form-group';
      var ln = document.createElement('label');
      ln.setAttribute('for', 'tm-name-' + val.replace(/\W/g, '_'));
      ln.textContent = t('name') + '';
      var inpName = document.createElement('input');
      inpName.type = 'text';
      inpName.className = 'team-member-name';
      inpName.id = 'tm-name-' + String(val).replace(/\W/g, '_');
      inpName.setAttribute('autocomplete', 'off');
      var wrapEmp = document.createElement('div');
      wrapEmp.className = 'form-group';
      var le = document.createElement('label');
      le.setAttribute('for', 'tm-emp-' + val.replace(/\W/g, '_'));
      le.textContent = t('teamMemberJobNumber');
      var inpEmp = document.createElement('input');
      inpEmp.type = 'text';
      inpEmp.className = 'team-member-emp';
      inpEmp.id = 'tm-emp-' + String(val).replace(/\W/g, '_');
      inpEmp.setAttribute('autocomplete', 'off');
      function syncVis() {
        details.style.display = cb.checked ? 'block' : 'none';
      }
      cb.addEventListener('change', syncVis);
      var mem = saved[val];
      if (mem) {
        cb.checked = !!mem.checked;
        inpName.value = mem.name || '';
        inpEmp.value = mem.emp || '';
        syncVis();
      }
      row1.appendChild(cb);
      row1.appendChild(document.createTextNode(' ' + label));
      wrapName.appendChild(ln);
      wrapName.appendChild(inpName);
      wrapEmp.appendChild(le);
      wrapEmp.appendChild(inpEmp);
      details.appendChild(wrapName);
      details.appendChild(wrapEmp);
      block.appendChild(row1);
      block.appendChild(details);
      container.appendChild(block);
    });
  }

  function collectTeamMemberRoster() {
    var container = document.getElementById('teamMembersGroup');
    var roster = [];
    var roles = [];
    if (!container) return { roster: roster, roles: roles };
    container.querySelectorAll('.team-member-block').forEach(function (block) {
      var role = block.getAttribute('data-team-role');
      var cb = block.querySelector('input[type="checkbox"]');
      if (!cb || !cb.checked || !role) return;
      var ni = block.querySelector('.team-member-name');
      var ei = block.querySelector('.team-member-emp');
      roles.push(role);
      roster.push({
        role: role,
        name: ni ? (ni.value || '').trim() : '',
        employeeNo: ei ? (ei.value || '').trim() : ''
      });
    });
    return { roster: roster, roles: roles };
  }

  function applyTeamMemberRoster(roster, legacyRoleList) {
    var container = document.getElementById('teamMembersGroup');
    if (!container) return;
    var byRole = {};
    (roster || []).forEach(function (e) {
      if (e && e.role) byRole[e.role] = e;
    });
    var legacy = Array.isArray(legacyRoleList) ? legacyRoleList : [];
    container.querySelectorAll('.team-member-block').forEach(function (block) {
      var role = block.getAttribute('data-team-role');
      var cb = block.querySelector('input[type="checkbox"]');
      var ni = block.querySelector('.team-member-name');
      var ei = block.querySelector('.team-member-emp');
      var det = block.querySelector('.team-member-fields');
      var ent = byRole[role];
      if (ent) {
        cb.checked = true;
        ni.value = ent.name || '';
        ei.value = ent.employeeNo || '';
        if (det) det.style.display = 'block';
      } else if (legacy.indexOf(role) !== -1) {
        cb.checked = true;
        if (det) det.style.display = 'block';
      } else {
        cb.checked = false;
        ni.value = '';
        ei.value = '';
        if (det) det.style.display = 'none';
      }
    });
  }

  function populateCheckboxGroups() {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang()) ? NinjaI18n.getLang() : 'en';
    var groupConfigs = [
      { containerId: 'investigatingBodyGroup', key: 'investigatingBody', name: 'scope.investigatingBody' },
      { containerId: 'regulatoryRefGroup', key: 'regulatoryRef', name: 'impact.regulatoryRef' },
      { containerId: 'formChecklistGroup', key: 'formChecklist', name: 'impact.formChecklist' },
      { containerId: 'qualityReviewGroup', key: 'qualityReview', name: 'impact.qualityReview' }
    ];
    groupConfigs.forEach(function (cfg) {
      var container = document.getElementById(cfg.containerId);
      if (!container) return;
      var options = getDropdownOptions(cfg.key);
      if (!options || !options.length) return;
      container.innerHTML = '';
      if (cfg.containerId === 'regulatoryRefGroup') {
        var tHdr = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
        var table = document.createElement('table');
        table.className = 'regulatory-ref-table';
        table.setAttribute('role', 'presentation');
        var thead = document.createElement('thead');
        var thr = document.createElement('tr');
        var thOpt = document.createElement('th');
        thOpt.setAttribute('scope', 'col');
        thOpt.textContent = tHdr('regulatoryRefColOption');
        var thArt = document.createElement('th');
        thArt.setAttribute('scope', 'col');
        thArt.textContent = tHdr('regulatoryRefColArticle');
        thr.appendChild(thOpt);
        thr.appendChild(thArt);
        thead.appendChild(thr);
        table.appendChild(thead);
        var tbody = document.createElement('tbody');
        options.forEach(function (opt) {
          var val = getOptionValue(opt);
          var label = getOptionLabel(opt, lang);
          var tr = document.createElement('tr');
          var tdCb = document.createElement('td');
          var labelEl = document.createElement('label');
          labelEl.className = 'checkbox-inline';
          var input = document.createElement('input');
          input.type = 'checkbox';
          input.value = val;
          input.name = cfg.name + '[]';
          input.setAttribute('data-checkbox-group', cfg.containerId);
          labelEl.appendChild(input);
          labelEl.appendChild(document.createTextNode(' ' + label));
          tdCb.appendChild(labelEl);
          var tdInput = document.createElement('td');
          var textInput = document.createElement('input');
          textInput.type = 'text';
          textInput.id = 'regulatoryRefArticle_' + val;
          textInput.name = 'impact.regulatoryRefArticle_' + val;
          textInput.setAttribute('data-regulatory-ref', val);
          textInput.placeholder = '';
          tdInput.appendChild(textInput);
          tr.appendChild(tdCb);
          tr.appendChild(tdInput);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
        return;
      }
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
    populateTeamMembersGroup();
  }

  function setCheckboxGroupValues(containerId, values) {
    var container = document.getElementById(containerId);
    if (!container) return;
    if (containerId === 'teamMembersGroup') {
      applyTeamMemberRoster(null, values);
      return;
    }
    var arr = Array.isArray(values) ? values : (typeof values === 'string' && values ? values.split(',') : []);
    container.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      if (!cb.closest('.team-member-block')) cb.checked = arr.indexOf(cb.value.trim()) !== -1;
    });
  }

  function getCheckboxGroupValues(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return [];
    if (containerId === 'teamMembersGroup') return collectTeamMemberRoster().roles;
    var out = [];
    container.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
      if (cb.value && !cb.closest('.team-member-block')) out.push(cb.value.trim());
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
    populateTeamMembersGroup: populateTeamMembersGroup,
    collectTeamMemberRoster: collectTeamMemberRoster,
    applyTeamMemberRoster: applyTeamMemberRoster,
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
