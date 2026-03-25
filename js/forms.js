/**
 * Form helpers: scoring, path, collect form data, fill form from case.
 */
(function (global) {
  function scoreToPath(total) {
    if (total >= 4 && total <= 8) return 'green';
    if (total >= 9 && total <= 14) return 'yellow';
    if (total >= 15 && total <= 20) return 'red';
    return 'green';
  }

  function computeTotal(sovereignty, financial, evidence, reputation) {
    const s = Math.min(5, Math.max(1, parseInt(sovereignty, 10) || 0));
    const f = Math.min(5, Math.max(1, parseInt(financial, 10) || 0));
    const e = Math.min(5, Math.max(1, parseInt(evidence, 10) || 0));
    const r = Math.min(5, Math.max(1, parseInt(reputation, 10) || 0));
    return s + f + e + r;
  }

  function getPathClass(path) {
    return 'path-' + (path || 'green');
  }

  function emptyExternalParty() {
    return { partyType: '', natureOfCommunication: '', encryption: '', confidentiality: '', writtenAgreement: false };
  }

  function emptyAccountableEntity() {
    return {
      personName: '', jobNumber: '', relatedEntity: '', convictionLevel: '',
      guidanceViolationProven: false, guidanceNoViolation: false, guidanceInsufficientEvidence: false
    };
  }

  function createEmptyCase(seq) {
    return {
      id: '',
      seq: seq || 1,
      receivedDate: '',
      complexityDays: 0,
      targetCloseDate: '',
      actualCloseDate: '',
      currentPhase: 1,
      phaseHistory: [],
      sovereignty: 1,
      financial: 1,
      evidence: 1,
      reputation: 1,
      sovereigntyNotes: '',
      financialNotes: '',
      evidenceNotes: '',
      reputationNotes: '',
      totalScore: 4,
      path: 'green',
      reporter: {
        name: '',
        phone: '',
        email: '',
        notes: '',
        type: '',
        empId: '',
        department: '',
        departmentOther: '',
        sources: '',
        source: '',
        protectionMeasures: ''
      },
      classification: {
        dataSensitivity: '',
        geographic: '',
        geographicCity: '',
        pdplAction: '',
        reporterStatus: '',
        legalDuration: '',
        legalTargetCloseDate: '',
        legalEntities: '',
        reportType: '',
        subSources: '',
        channels: '',
        reporterStatus: ''
      },
      scope: {
        scope: '',
        subScope: '',
        escalationLevel: '',
        escalationJustification: '',
        severity: '',
        precautionaryMeasures: '',
        precautionaryMeasuresOther: '',
        investigatingBody: [],
        teamMembers: [],
        teamMemberRoster: [],
        scopeEntityRows: [emptyScopeEntityRow()],
        constraintItems: [emptyConstraintRow()]
      },
      process: {
        caseAcceptanceStatus: '',
        legalPrivilege: '',
        legalPrivilegeJustification: [],
        clearance: '',
        scopeAmendmentReason: ''
      },
      interview: { sessions: [emptyInterviewSession()] },
      evidenceDetails: {
        formOfEvidence: '',
        formOfEvidenceOther: '',
        dataCategory: '',
        examinationType: '',
        chainOfCustody: '',
        supportingParty: '',
        evidenceLinkUrl: ''
      },
      evidenceRecords: [],
      externalParties: { parties: [emptyExternalParty()] },
      impact: {
        currentStatus: 'Open',
        recommendationType: '',
        purpose: '',
        methodology: '',
        facts: '',
        conclusions: '',
        recommendations: '',
        disciplinaryAction: '',
        mandatoryLevel: ''
      }
    };
  }

  var EVIDENCE_ROW_KEYS = ['formOfEvidence', 'formOfEvidenceOther', 'dataCategory', 'examinationType', 'evidenceHashValue', 'chainOfCustody', 'supportingParty', 'evidenceLinkUrl'];
  var EXTERNAL_PARTY_KEYS = ['partyType', 'natureOfCommunication', 'encryption', 'confidentiality'];
  var ACCOUNTABLE_ENTITY_TEXT_KEYS = ['personName', 'jobNumber', 'relatedEntity', 'convictionLevel'];
  var ACCOUNTABLE_ENTITY_BOOL_KEYS = { guidanceViolationProven: true, guidanceNoViolation: true, guidanceInsufficientEvidence: true };

  var SCOPE_ENTITY_KEYS = ['relatedEntity', 'jobNumber', 'personName'];
  var SCOPE_CONSTRAINT_KEY = 'constraintText';

  function emptyScopeEntityRow() {
    var o = {};
    SCOPE_ENTITY_KEYS.forEach(function (k) { o[k] = ''; });
    return o;
  }

  function emptyConstraintRow() {
    return { constraintText: '' };
  }

  var INTERVIEW_SESSION_KEYS = [
    'intervieweeName', 'intervieweeJobNumber', 'classification', 'interviewDate',
    'rightsNotified', 'documentationMethod', 'receiptResponseStatus', 'summonsId', 'summonsStatus',
    'technicalAuthorities', 'personalityInfluence', 'independenceVerified',
    'sessionCoreObjective', 'sessionInfoToExtract', 'sessionEvidencePresented',
    'outcomePartialFullAdmission', 'outcomeRevealPartners', 'outcomeRefuteDefenses', 'outcomeSystemicGap',
    'leadInvestigatorName', 'leadInvestigatorJobNumber', 'witnessRecorderName', 'witnessRecorderJobNumber',
    'techExpertName', 'techExpertJobNumber', 'deptRepName', 'deptRepJobNumber',
    'minutes'
  ];
  var INTERVIEW_SESSION_BOOL_KEYS = {
    independenceVerified: true,
    outcomePartialFullAdmission: true,
    outcomeRevealPartners: true,
    outcomeRefuteDefenses: true,
    outcomeSystemicGap: true
  };

  function interviewSessionBoolValue(v) {
    return v === true || v === 'yes' || v === 'Yes' || v === '1';
  }

  function emptyInterviewSession() {
    var o = {};
    INTERVIEW_SESSION_KEYS.forEach(function (k) {
      o[k] = INTERVIEW_SESSION_BOOL_KEYS[k] ? false : '';
    });
    return o;
  }

  function emptyEvidenceRecord() {
    var o = {};
    EVIDENCE_ROW_KEYS.forEach(function (k) { o[k] = ''; });
    return o;
  }

  function collectEvidenceRecordsFromForm(formEl) {
    var c = formEl.querySelector('#evidenceRecordsContainer');
    if (!c) {
      var g = function (id) {
        var el = formEl.querySelector('#' + id);
        return el ? (el.value || '').trim() : '';
      };
      var fo0 = g('formOfEvidence');
      var foOtherEl = formEl.querySelector('#formOfEvidenceOther');
      return [{
        formOfEvidence: fo0,
        formOfEvidenceOther: fo0 === 'Other' && foOtherEl ? (foOtherEl.value || '').trim() : '',
        dataCategory: g('dataCategory'),
        examinationType: g('examinationType'),
        evidenceHashValue: g('evidenceHashValue'),
        chainOfCustody: g('chainOfCustody'),
        supportingParty: g('supportingParty'),
        evidenceLinkUrl: g('evidenceLinkUrl')
      }];
    }
    var rows = c.querySelectorAll('[data-evidence-record]');
    var out = [];
    rows.forEach(function (row) {
      var o = {};
      EVIDENCE_ROW_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ev-k="' + k + '"]');
        o[k] = el ? (el.value || '').trim() : '';
      });
      if (o.formOfEvidence !== 'Other') o.formOfEvidenceOther = '';
      out.push(o);
    });
    return out.length ? out : [emptyEvidenceRecord()];
  }

  function populateEvidenceRecordRow(row) {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang) ? NinjaI18n.getLang() : 'en';
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    if (window.NinjaSettings && NinjaSettings.populateSelect) {
      [['formOfEvidence', 'formOfEvidence'], ['dataCategory', 'dataCategory'], ['examinationType', 'examinationType'], ['supportingParty', 'supportingParty']].forEach(function (pair) {
        var sel = row.querySelector('select[data-ev-k="' + pair[0] + '"]');
        if (sel) NinjaSettings.populateSelect(sel, pair[1], { lang: lang });
      });
    }
    [['label-formOfEvidence', 'formOfEvidence'], ['label-formOfEvidenceOther', 'formOfEvidenceOther'], ['label-dataCategory', 'dataCategory'], ['label-examinationType', 'examinationType'], ['label-evidenceHashValue', 'evidenceHashValue'], ['label-chainOfCustody', 'chainOfCustody'], ['label-evidenceLinkUrl', 'evidenceLinkUrl'], ['label-supportingParty', 'supportingParty']].forEach(function (pair) {
      var el = row.querySelector('.' + pair[0]);
      if (el) el.textContent = t(pair[1]);
    });
    toggleEvidenceFormOtherRow(row);
  }

  function toggleEvidenceFormOtherRow(row) {
    if (!row) return;
    var sel = row.querySelector('select[data-ev-k="formOfEvidence"]');
    var wrap = row.querySelector('.evidence-form-other-wrap');
    var input = row.querySelector('[data-ev-k="formOfEvidenceOther"]');
    if (!sel || !wrap) return;
    var show = (sel.value || '').trim() === 'Other';
    wrap.style.display = show ? 'block' : 'none';
    if (input) input.disabled = !show;
  }

  function refreshAllEvidenceRowSelects() {
    var c = document.getElementById('evidenceRecordsContainer');
    if (!c) return;
    c.querySelectorAll('[data-evidence-record]').forEach(function (row) {
      var vals = {};
      EVIDENCE_ROW_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ev-k="' + k + '"]');
        if (el) vals[k] = el.value;
      });
      populateEvidenceRecordRow(row);
      EVIDENCE_ROW_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ev-k="' + k + '"]');
        if (el && vals[k] != null) el.value = vals[k];
      });
      toggleEvidenceFormOtherRow(row);
    });
  }

  function updateEvidenceRecordHeadings(container) {
    if (!container) return;
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var rows = container.querySelectorAll('[data-evidence-record]');
    rows.forEach(function (row, i) {
      var h = row.querySelector('.evidence-record-heading');
      if (h) h.textContent = (t('evidenceRecordTitle') || 'Evidence') + ' ' + (i + 1);
      var rm = row.querySelector('.btn-remove-evidence-record');
      if (rm) rm.style.display = rows.length > 1 ? 'inline-block' : 'none';
      var rb = row.querySelector('.btn-remove-evidence-record');
      if (rb) rb.textContent = t('removeEvidenceRecord') || 'Remove';
    });
    var addBtn = document.getElementById('btnAddEvidenceRecord');
    if (addBtn && t) addBtn.textContent = t('addEvidenceRecord') || addBtn.textContent;
  }

  function fillEvidenceRecordsInForm(formEl, caseObj) {
    var c = formEl.querySelector('#evidenceRecordsContainer');
    var tpl = document.getElementById('evidenceRecordTpl');
    if (!c || !tpl || !tpl.content) {
      var evidenceSection = caseObj.evidenceDetails || (typeof caseObj.evidence === 'object' && caseObj.evidence && !Array.isArray(caseObj.evidence) ? caseObj.evidence : null);
      setFormValue(formEl, 'formOfEvidence', evidenceSection && evidenceSection.formOfEvidence != null ? evidenceSection.formOfEvidence : '');
      setFormValue(formEl, 'formOfEvidenceOther', evidenceSection && evidenceSection.formOfEvidenceOther != null ? evidenceSection.formOfEvidenceOther : '');
      setFormValue(formEl, 'dataCategory', evidenceSection && evidenceSection.dataCategory != null ? evidenceSection.dataCategory : '');
      setFormValue(formEl, 'examinationType', evidenceSection && evidenceSection.examinationType != null ? evidenceSection.examinationType : '');
      setFormValue(formEl, 'evidenceHashValue', evidenceSection && evidenceSection.evidenceHashValue != null ? evidenceSection.evidenceHashValue : '');
      setFormValue(formEl, 'chainOfCustody', evidenceSection && evidenceSection.chainOfCustody != null ? evidenceSection.chainOfCustody : '');
      setFormValue(formEl, 'evidenceLinkUrl', evidenceSection && evidenceSection.evidenceLinkUrl != null ? evidenceSection.evidenceLinkUrl : '');
      setFormValue(formEl, 'supportingParty', evidenceSection && evidenceSection.supportingParty != null ? evidenceSection.supportingParty : '');
      return;
    }
    var records = (caseObj.evidenceRecords && Array.isArray(caseObj.evidenceRecords) && caseObj.evidenceRecords.length)
      ? caseObj.evidenceRecords.slice()
      : null;
    if (!records || !records.length) {
      var leg = caseObj.evidenceDetails || (typeof caseObj.evidence === 'object' && caseObj.evidence && !Array.isArray(caseObj.evidence) ? caseObj.evidence : null);
      var hasLeg = leg && EVIDENCE_ROW_KEYS.some(function (k) { return leg[k] && String(leg[k]).trim(); });
      records = hasLeg ? [Object.assign(emptyEvidenceRecord(), leg)] : [emptyEvidenceRecord()];
    }
    c.innerHTML = '';
    records.forEach(function (rec) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateEvidenceRecordRow(row);
      EVIDENCE_ROW_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ev-k="' + k + '"]');
        if (el) el.value = rec[k] != null ? rec[k] : '';
      });
      toggleEvidenceFormOtherRow(row);
    });
    updateEvidenceRecordHeadings(c);
  }

  function bindEvidenceRecordsUI(formEl) {
    var c = formEl.querySelector('#evidenceRecordsContainer');
    var tpl = document.getElementById('evidenceRecordTpl');
    var addBtn = document.getElementById('btnAddEvidenceRecord');
    if (!c || !tpl || !addBtn) return;
    if (addBtn.dataset.evidenceBound) return;
    addBtn.dataset.evidenceBound = '1';
    addBtn.addEventListener('click', function () {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateEvidenceRecordRow(row);
      toggleEvidenceFormOtherRow(row);
      updateEvidenceRecordHeadings(c);
    });
    c.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.btn-remove-evidence-record');
      if (!btn || !c.contains(btn)) return;
      var row = btn.closest('[data-evidence-record]');
      if (!row || c.querySelectorAll('[data-evidence-record]').length <= 1) return;
      row.remove();
      updateEvidenceRecordHeadings(c);
    });
  }

  function collectExternalPartiesFromForm(formEl) {
    var c = formEl.querySelector('#externalPartiesContainer');
    if (!c) return null;
    var rows = c.querySelectorAll('[data-external-party]');
    var out = [];
    rows.forEach(function (row) {
      var o = {};
      EXTERNAL_PARTY_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ext-k="' + k + '"]');
        o[k] = el ? (el.value || '').trim() : '';
      });
      var wa = row.querySelector('[data-ext-k="writtenAgreement"]');
      o.writtenAgreement = !!(wa && wa.checked);
      out.push(o);
    });
    return out.length ? out : [emptyExternalParty()];
  }

  function populateExternalPartyRow(row) {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang) ? NinjaI18n.getLang() : 'en';
    if (window.NinjaSettings && NinjaSettings.populateSelect) {
      [['partyType', 'partyType'], ['natureOfCommunication', 'natureOfCommunication'], ['encryption', 'encryption']].forEach(function (pair) {
        var sel = row.querySelector('select[data-ext-k="' + pair[0] + '"]');
        if (sel) NinjaSettings.populateSelect(sel, pair[1], { lang: lang });
      });
    }
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    [['ext-partyType', 'partyType'], ['ext-natureOfCommunication', 'natureOfCommunication'], ['ext-encryption', 'encryption'], ['ext-writtenAgreement', 'writtenAgreement'], ['ext-confidentiality', 'externalConfidentiality']].forEach(function (pair) {
      var el = row.querySelector('.label-' + pair[0]);
      if (el) el.textContent = t(pair[1]);
    });
  }

  function updateExternalPartyHeadings(container) {
    if (!container) return;
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var rows = container.querySelectorAll('[data-external-party]');
    rows.forEach(function (row, i) {
      var h = row.querySelector('.external-party-heading');
      if (h) h.textContent = (t('externalPartyRecordTitle') || 'External party') + ' ' + (i + 1);
      var rm = row.querySelector('.btn-remove-external-party');
      if (rm) {
        rm.style.display = rows.length > 1 ? 'inline-block' : 'none';
        rm.textContent = t('removeExternalParty') || 'Remove';
      }
    });
    var addBtn = document.getElementById('btnAddExternalParty');
    if (addBtn && t) addBtn.textContent = t('addExternalParty') || addBtn.textContent;
  }

  function fillExternalPartiesInForm(formEl, caseObj) {
    var c = formEl.querySelector('#externalPartiesContainer');
    var tpl = document.getElementById('externalPartyTpl');
    if (!c || !tpl || !tpl.content) return;
    var ep = caseObj.externalParties || {};
    var parties = (ep.parties && Array.isArray(ep.parties) && ep.parties.length) ? ep.parties.slice() : null;
    if (!parties || !parties.length) {
      if (ep.partyType || ep.natureOfCommunication || ep.encryption || (ep.confidentiality && String(ep.confidentiality).trim())) {
        parties = [{
          partyType: ep.partyType || '',
          natureOfCommunication: ep.natureOfCommunication || '',
          encryption: ep.encryption || '',
          confidentiality: ep.confidentiality || '',
          writtenAgreement: ep.writtenAgreement === 'Yes' || ep.writtenAgreement === true
        }];
      } else {
        parties = [emptyExternalParty()];
      }
    }
    c.innerHTML = '';
    parties.forEach(function (p) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateExternalPartyRow(row);
      EXTERNAL_PARTY_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ext-k="' + k + '"]');
        if (el) el.value = p[k] != null ? p[k] : '';
      });
      var wa = row.querySelector('[data-ext-k="writtenAgreement"]');
      if (wa) wa.checked = !!(p.writtenAgreement === true || p.writtenAgreement === 'Yes' || p.writtenAgreement === 'yes');
    });
    updateExternalPartyHeadings(c);
  }

  function bindExternalPartiesUI(formEl) {
    var c = formEl.querySelector('#externalPartiesContainer');
    var tpl = document.getElementById('externalPartyTpl');
    var addBtn = document.getElementById('btnAddExternalParty');
    if (!c || !tpl || !addBtn) return;
    if (addBtn.dataset.extPartyBound) return;
    addBtn.dataset.extPartyBound = '1';
    addBtn.addEventListener('click', function () {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateExternalPartyRow(row);
      updateExternalPartyHeadings(c);
    });
    c.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.btn-remove-external-party');
      if (!btn || !c.contains(btn)) return;
      var row = btn.closest('[data-external-party]');
      if (!row || c.querySelectorAll('[data-external-party]').length <= 1) return;
      row.remove();
      updateExternalPartyHeadings(c);
    });
  }

  function refreshExternalPartyLabels() {
    var c = document.getElementById('externalPartiesContainer');
    if (!c) return;
    c.querySelectorAll('[data-external-party]').forEach(function (row) {
      var vals = {};
      EXTERNAL_PARTY_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ext-k="' + k + '"]');
        if (el) vals[k] = el.value;
      });
      var wa = row.querySelector('[data-ext-k="writtenAgreement"]');
      var waChecked = wa && wa.checked;
      populateExternalPartyRow(row);
      EXTERNAL_PARTY_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-ext-k="' + k + '"]');
        if (el && vals[k] != null) el.value = vals[k];
      });
      var wa2 = row.querySelector('[data-ext-k="writtenAgreement"]');
      if (wa2) wa2.checked = !!waChecked;
    });
    updateExternalPartyHeadings(c);
  }

  function collectAccountableEntitiesFromForm(formEl) {
    var c = formEl.querySelector('#accountableEntitiesContainer');
    if (!c) return null;
    var rows = c.querySelectorAll('[data-accountable-entity]');
    var out = [];
    rows.forEach(function (row) {
      var o = {};
      ACCOUNTABLE_ENTITY_TEXT_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-acc-k="' + k + '"]');
        o[k] = el ? (el.value || '').trim() : '';
      });
      Object.keys(ACCOUNTABLE_ENTITY_BOOL_KEYS).forEach(function (k) {
        var el = row.querySelector('[data-acc-k="' + k + '"]');
        o[k] = !!(el && el.checked);
      });
      out.push(o);
    });
    return out.length ? out : [emptyAccountableEntity()];
  }

  function populateAccountableEntityRow(row) {
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    [
      ['acc-personName', 'name'], ['acc-jobNumber', 'teamMemberJobNumber'], ['acc-relatedEntity', 'relatedEntityLabel'],
      ['acc-convictionLevel', 'accConvictionLevel'], ['acc-guidedBy', 'accGuidedBy'],
      ['acc-guidanceViolationProven', 'accGuidanceViolationProven'], ['acc-guidanceNoViolation', 'accGuidanceNoViolation'],
      ['acc-guidanceInsufficientEvidence', 'accGuidanceInsufficientEvidence']
    ].forEach(function (pair) {
      var el = row.querySelector('.label-' + pair[0]);
      if (el) el.textContent = t(pair[1]);
    });
  }

  function updateAccountableEntityHeadings(container) {
    if (!container) return;
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var rows = container.querySelectorAll('[data-accountable-entity]');
    rows.forEach(function (row, i) {
      var h = row.querySelector('.accountable-entity-heading');
      if (h) h.textContent = (t('accountableEntityRecordTitle') || 'Entity') + ' ' + (i + 1);
      var rm = row.querySelector('.btn-remove-accountable-entity');
      if (rm) {
        rm.style.display = rows.length > 1 ? 'inline-block' : 'none';
        rm.textContent = t('removeAccountableEntity') || 'Remove';
      }
    });
    var addBtn = document.getElementById('btnAddAccountableEntity');
    if (addBtn && t) addBtn.textContent = t('addAccountableEntity') || addBtn.textContent;
  }

  function fillAccountableEntitiesInForm(formEl, caseObj) {
    var c = formEl.querySelector('#accountableEntitiesContainer');
    var tpl = document.getElementById('accountableEntityTpl');
    if (!c || !tpl || !tpl.content) return;
    var im = caseObj.impact || {};
    var list = (im.accountableEntities && Array.isArray(im.accountableEntities) && im.accountableEntities.length) ? im.accountableEntities.slice() : [emptyAccountableEntity()];
    c.innerHTML = '';
    list.forEach(function (ent) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateAccountableEntityRow(row);
      ACCOUNTABLE_ENTITY_TEXT_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-acc-k="' + k + '"]');
        if (el) el.value = ent[k] != null ? ent[k] : '';
      });
      Object.keys(ACCOUNTABLE_ENTITY_BOOL_KEYS).forEach(function (k) {
        var el = row.querySelector('[data-acc-k="' + k + '"]');
        if (el) el.checked = !!(ent[k] === true || ent[k] === 'yes' || ent[k] === 'Yes');
      });
    });
    updateAccountableEntityHeadings(c);
  }

  function bindAccountableEntitiesUI(formEl) {
    var c = formEl.querySelector('#accountableEntitiesContainer');
    var tpl = document.getElementById('accountableEntityTpl');
    var addBtn = document.getElementById('btnAddAccountableEntity');
    if (!c || !tpl || !addBtn) return;
    if (addBtn.dataset.accEntBound) return;
    addBtn.dataset.accEntBound = '1';
    addBtn.addEventListener('click', function () {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateAccountableEntityRow(row);
      updateAccountableEntityHeadings(c);
    });
    c.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.btn-remove-accountable-entity');
      if (!btn || !c.contains(btn)) return;
      var row = btn.closest('[data-accountable-entity]');
      if (!row || c.querySelectorAll('[data-accountable-entity]').length <= 1) return;
      row.remove();
      updateAccountableEntityHeadings(c);
    });
  }

  function refreshAccountableEntityLabels() {
    var c = document.getElementById('accountableEntitiesContainer');
    if (!c) return;
    c.querySelectorAll('[data-accountable-entity]').forEach(function (row) { populateAccountableEntityRow(row); });
    updateAccountableEntityHeadings(c);
  }

  function isFormCheckboxChecked(formEl, htmlId) {
    var el = formEl.querySelector('#' + htmlId);
    return !!(el && el.type === 'checkbox' && el.checked);
  }

  function collectScopeEntityRows(formEl) {
    var c = formEl.querySelector('#scopeEntitiesContainer');
    if (!c) return null;
    var rows = c.querySelectorAll('[data-scope-entity]');
    var out = [];
    rows.forEach(function (row) {
      var o = {};
      SCOPE_ENTITY_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-se-k="' + k + '"]');
        o[k] = el ? (el.value || '').trim() : '';
      });
      out.push(o);
    });
    return out.length ? out : [emptyScopeEntityRow()];
  }

  function collectConstraintItems(formEl) {
    var c = formEl.querySelector('#scopeConstraintsContainer');
    if (!c) return null;
    var rows = c.querySelectorAll('[data-scope-constraint]');
    var out = [];
    rows.forEach(function (row) {
      var el = row.querySelector('[data-sc-k="' + SCOPE_CONSTRAINT_KEY + '"]');
      out.push({ constraintText: el ? (el.value || '').trim() : '' });
    });
    return out.length ? out : [emptyConstraintRow()];
  }

  function populateScopeEntityRow(row) {
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    [['relatedEntity', 'relatedEntityLabel'], ['jobNumber', 'teamMemberJobNumber'], ['personName', 'name']].forEach(function (pair) {
      var el = row.querySelector('.label-' + pair[0]);
      if (el) el.textContent = t(pair[1]);
    });
  }

  function updateScopeEntityHeadings(container) {
    if (!container) return;
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var rows = container.querySelectorAll('[data-scope-entity]');
    rows.forEach(function (row, i) {
      var h = row.querySelector('.scope-entity-heading');
      if (h) h.textContent = (t('scopeEntityRowTitle') || 'Related party') + ' ' + (i + 1);
      var rm = row.querySelector('.btn-remove-scope-entity');
      if (rm) {
        rm.style.display = rows.length > 1 ? 'inline-block' : 'none';
        rm.textContent = t('removeScopeEntityRow') || 'Remove';
      }
    });
    var addBtn = document.getElementById('btnAddScopeEntity');
    if (addBtn && t) addBtn.textContent = t('addScopeEntity') || addBtn.textContent;
  }

  function fillScopeEntityRowsInForm(formEl, caseObj) {
    var c = formEl.querySelector('#scopeEntitiesContainer');
    var tpl = document.getElementById('scopeEntityRowTpl');
    if (!c || !tpl || !tpl.content) return;
    var sc = caseObj.scope || {};
    var rows = (sc.scopeEntityRows && Array.isArray(sc.scopeEntityRows) && sc.scopeEntityRows.length) ? sc.scopeEntityRows.slice() : null;
    if (!rows || !rows.length) {
      var leg = (sc.scopeEntities && String(sc.scopeEntities).trim()) ? String(sc.scopeEntities).trim() : '';
      rows = leg ? [{ relatedEntity: leg, jobNumber: '', personName: '' }] : [emptyScopeEntityRow()];
    }
    c.innerHTML = '';
    rows.forEach(function (rec) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateScopeEntityRow(row);
      SCOPE_ENTITY_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-se-k="' + k + '"]');
        if (el) el.value = rec[k] != null ? rec[k] : '';
      });
    });
    updateScopeEntityHeadings(c);
  }

  function populateConstraintRow(row) {
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var el = row.querySelector('.label-constraintText');
    if (el) el.textContent = t('constraintItemLabel') || 'Constraint';
  }

  function updateConstraintHeadings(container) {
    if (!container) return;
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var rows = container.querySelectorAll('[data-scope-constraint]');
    rows.forEach(function (row) {
      var rm = row.querySelector('.btn-remove-scope-constraint');
      if (rm) {
        rm.style.display = rows.length > 1 ? 'inline-block' : 'none';
        rm.textContent = t('removeConstraintRow') || 'Remove';
      }
    });
    var addBtn = document.getElementById('btnAddScopeConstraint');
    if (addBtn && t) addBtn.textContent = t('addScopeConstraint') || addBtn.textContent;
  }

  function fillConstraintItemsInForm(formEl, caseObj) {
    var c = formEl.querySelector('#scopeConstraintsContainer');
    var tpl = document.getElementById('scopeConstraintRowTpl');
    if (!c || !tpl || !tpl.content) return;
    var sc = caseObj.scope || {};
    var items = (sc.constraintItems && Array.isArray(sc.constraintItems) && sc.constraintItems.length) ? sc.constraintItems.slice() : null;
    if (!items || !items.length) {
      var leg = (sc.scopeConstraints && String(sc.scopeConstraints).trim()) ? String(sc.scopeConstraints).trim() : '';
      if (leg) {
        items = leg.split(/\r?\n/).map(function (line) { return { constraintText: line.trim() }; }).filter(function (x) { return x.constraintText; });
      }
      if (!items || !items.length) items = [emptyConstraintRow()];
    }
    c.innerHTML = '';
    items.forEach(function (rec) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateConstraintRow(row);
      var el = row.querySelector('[data-sc-k="constraintText"]');
      if (el) el.value = rec.constraintText != null ? rec.constraintText : '';
    });
    updateConstraintHeadings(c);
  }

  function bindScopeEntityRowsUI(formEl) {
    var c = formEl.querySelector('#scopeEntitiesContainer');
    var tpl = document.getElementById('scopeEntityRowTpl');
    var addBtn = document.getElementById('btnAddScopeEntity');
    if (!c || !tpl || !addBtn) return;
    if (addBtn.dataset.scopeEntityBound) return;
    addBtn.dataset.scopeEntityBound = '1';
    addBtn.addEventListener('click', function () {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateScopeEntityRow(row);
      updateScopeEntityHeadings(c);
    });
    c.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.btn-remove-scope-entity');
      if (!btn || !c.contains(btn)) return;
      var row = btn.closest('[data-scope-entity]');
      if (!row || c.querySelectorAll('[data-scope-entity]').length <= 1) return;
      row.remove();
      updateScopeEntityHeadings(c);
    });
  }

  function bindScopeConstraintsUI(formEl) {
    var c = formEl.querySelector('#scopeConstraintsContainer');
    var tpl = document.getElementById('scopeConstraintRowTpl');
    var addBtn = document.getElementById('btnAddScopeConstraint');
    if (!c || !tpl || !addBtn) return;
    if (addBtn.dataset.scopeConstraintBound) return;
    addBtn.dataset.scopeConstraintBound = '1';
    addBtn.addEventListener('click', function () {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateConstraintRow(row);
      updateConstraintHeadings(c);
    });
    c.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.btn-remove-scope-constraint');
      if (!btn || !c.contains(btn)) return;
      var row = btn.closest('[data-scope-constraint]');
      if (!row || c.querySelectorAll('[data-scope-constraint]').length <= 1) return;
      row.remove();
      updateConstraintHeadings(c);
    });
  }

  function refreshAllScopeDynamicLabels() {
    var ce = document.getElementById('scopeEntitiesContainer');
    if (ce) {
      ce.querySelectorAll('[data-scope-entity]').forEach(function (row) { populateScopeEntityRow(row); });
      updateScopeEntityHeadings(ce);
    }
    var cc = document.getElementById('scopeConstraintsContainer');
    if (cc) {
      cc.querySelectorAll('[data-scope-constraint]').forEach(function (row) { populateConstraintRow(row); });
      updateConstraintHeadings(cc);
    }
  }

  function collectInterviewSessions(formEl) {
    var c = formEl.querySelector('#interviewSessionsContainer');
    if (!c) return null;
    var rows = c.querySelectorAll('[data-interview-session]');
    var out = [];
    rows.forEach(function (row) {
      var o = {};
      INTERVIEW_SESSION_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-int-k="' + k + '"]');
        if (!el) { o[k] = INTERVIEW_SESSION_BOOL_KEYS[k] ? false : ''; return; }
        if (el.type === 'checkbox') {
          o[k] = !!el.checked;
        } else {
          o[k] = (el.value || '').trim();
        }
      });
      out.push(o);
    });
    return out.length ? out : [emptyInterviewSession()];
  }

  function populateInterviewSessionRow(row) {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang) ? NinjaI18n.getLang() : 'en';
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    if (window.NinjaSettings && NinjaSettings.populateSelect) {
      var classSel = row.querySelector('select[data-int-k="classification"]');
      var rightsSel = row.querySelector('select[data-int-k="rightsNotified"]');
      var docSel = row.querySelector('select[data-int-k="documentationMethod"]');
      var receiptSel = row.querySelector('select.interview-session-receipt');
      var summonsSel = row.querySelector('select.interview-session-summons');
      if (classSel) NinjaSettings.populateSelect(classSel, 'interviewClassification', { lang: lang });
      if (rightsSel) NinjaSettings.populateSelect(rightsSel, 'rightsNotified', { lang: lang });
      if (docSel) NinjaSettings.populateSelect(docSel, 'documentationMethod', { lang: lang });
      if (receiptSel) NinjaSettings.populateSelect(receiptSel, 'receiptResponseStatus', { lang: lang });
      if (summonsSel) NinjaSettings.populateSelect(summonsSel, 'summonsStatus', { lang: lang });
    }
    [
      ['intervieweeName', 'intervieweeName'], ['intervieweeJobNumber', 'intervieweeJobNumber'],
      ['interviewClassification', 'interviewClassification'], ['interviewDate', 'interviewDate'],
      ['rightsNotified', 'rightsNotified'], ['documentationMethod', 'documentationMethod'],
      ['receiptResponseStatus', 'receiptResponseStatus'], ['summonsId', 'summonsId'], ['summonsStatus', 'summonsStatus'],
      ['interviewMinutes', 'interviewMinutes'],
      ['interviewTraitsLegend', 'interviewTraitsLegend'], ['interviewTechnicalAuthorities', 'interviewTechnicalAuthorities'],
      ['interviewTechnicalAuthoritiesHint', 'interviewTechnicalAuthoritiesHint'], ['interviewPersonalityInfluence', 'interviewPersonalityInfluence'],
      ['interviewPersonalityInfluenceHint', 'interviewPersonalityInfluenceHint'], ['interviewIndependenceVerified', 'interviewIndependenceVerified'],
      ['interviewGoalsLegend', 'interviewGoalsLegend'],
      ['interviewCoreObjective', 'interviewCoreObjective'],
      ['interviewCoreObjectiveHint', 'interviewCoreObjectiveHint'],
      ['interviewInfoToExtract', 'interviewInfoToExtract'],
      ['interviewEvidencePresented', 'interviewEvidencePresented'],
      ['interviewExpectedOutcomesLegend', 'interviewExpectedOutcomesLegend'],
      ['outcomePartialFullAdmission', 'interviewOutcomePartialFull'], ['outcomeRevealPartners', 'interviewOutcomeRevealPartners'],
      ['outcomeRefuteDefenses', 'interviewOutcomeRefuteDefenses'], ['outcomeSystemicGap', 'interviewOutcomeSystemicGap'],
      ['interviewTeamLegend', 'interviewTeamLegend'], ['teamRoleLeadInvestigator', 'interviewLeadInvestigator'],
      ['teamRoleLeadInvestigatorHint', 'interviewLeadInvestigatorHint'], ['liName', 'name'], ['liJob', 'teamMemberJobNumber'],
      ['teamRoleWitnessRecorder', 'interviewWitnessRecorder'], ['teamRoleWitnessRecorderHint', 'interviewWitnessRecorderHint'],
      ['wrName', 'name'], ['wrJob', 'teamMemberJobNumber'],
      ['teamRoleTechExpert', 'interviewTechExpert'], ['teamRoleTechExpertHint', 'interviewTechExpertHint'],
      ['teName', 'name'], ['teJob', 'teamMemberJobNumber'],
      ['teamRoleDeptRep', 'interviewDeptRep'], ['teamRoleDeptRepHint', 'interviewDeptRepHint'],
      ['drName', 'name'], ['drJob', 'teamMemberJobNumber']
    ].forEach(function (pair) {
      var el = row.querySelector('.label-' + pair[0]);
      if (el) el.textContent = t(pair[1]);
    });
  }

  function updateInterviewSessionHeadings(container) {
    if (!container) return;
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    var rows = container.querySelectorAll('[data-interview-session]');
    rows.forEach(function (row, i) {
      var h = row.querySelector('.interview-session-heading');
      if (h) h.textContent = (t('interviewSessionTitle') || 'Interview') + ' ' + (i + 1);
      var rm = row.querySelector('.btn-remove-interview-session');
      if (rm) rm.style.display = rows.length > 1 ? 'inline-block' : 'none';
      if (rm) rm.textContent = t('removeInterviewRecord') || 'Remove';
    });
    var addBtn = document.getElementById('btnAddInterviewRecord');
    if (addBtn && t) addBtn.textContent = t('addInterviewRecord') || addBtn.textContent;
  }

  function fillInterviewSessions(formEl, caseObj) {
    var c = formEl.querySelector('#interviewSessionsContainer');
    var tpl = document.getElementById('interviewSessionTpl');
    if (!c || !tpl || !tpl.content) return;
    var iv = caseObj.interview || {};
    var sessions = (iv.sessions && Array.isArray(iv.sessions) && iv.sessions.length) ? iv.sessions.slice() : null;
    if (!sessions || !sessions.length) {
      var hasLegacy = iv.classification || iv.interviewDate || (iv.interview2Classification || iv.interview2Date) || (iv.interview3Classification || iv.interview3Date);
      if (hasLegacy) {
        sessions = [];
        sessions.push({
          intervieweeName: '',
          intervieweeJobNumber: '',
          classification: iv.classification || '',
          interviewDate: iv.interviewDate || '',
          rightsNotified: iv.rightsNotified || '',
          documentationMethod: iv.documentationMethod || '',
          receiptResponseStatus: iv.receiptResponseStatus || '',
          summonsId: iv.summonsId || '',
          summonsStatus: iv.summonsStatus || '',
          minutes: ''
        });
        if (iv.interview2Classification || iv.interview2Date || iv.interview2RightsNotified || iv.interview2Minutes) {
          sessions.push({
            intervieweeName: '',
            intervieweeJobNumber: '',
            classification: iv.interview2Classification || '',
            interviewDate: iv.interview2Date || '',
            rightsNotified: iv.interview2RightsNotified || '',
            documentationMethod: '',
            receiptResponseStatus: '',
            summonsId: '',
            summonsStatus: '',
            minutes: iv.interview2Minutes || ''
          });
        }
        if (iv.interview3Classification || iv.interview3Date || iv.interview3RightsNotified || iv.interview3Minutes) {
          sessions.push({
            intervieweeName: '',
            intervieweeJobNumber: '',
            classification: iv.interview3Classification || '',
            interviewDate: iv.interview3Date || '',
            rightsNotified: iv.interview3RightsNotified || '',
            documentationMethod: '',
            receiptResponseStatus: '',
            summonsId: '',
            summonsStatus: '',
            minutes: iv.interview3Minutes || ''
          });
        }
      }
      if (!sessions || !sessions.length) sessions = [emptyInterviewSession()];
    }
    c.innerHTML = '';
    sessions.forEach(function (sess) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateInterviewSessionRow(row);
      INTERVIEW_SESSION_KEYS.forEach(function (k) {
        var el = row.querySelector('[data-int-k="' + k + '"]');
        if (!el) return;
        if (el.type === 'checkbox') {
          el.checked = interviewSessionBoolValue(sess[k]);
        } else {
          el.value = sess[k] != null ? sess[k] : '';
        }
      });
    });
    updateInterviewSessionHeadings(c);
  }

  function refreshAllInterviewSessionLabels() {
    var c = document.getElementById('interviewSessionsContainer');
    if (!c) return;
    c.querySelectorAll('[data-interview-session]').forEach(function (row) {
      populateInterviewSessionRow(row);
    });
    updateInterviewSessionHeadings(c);
  }

  function bindInterviewSessionsUI(formEl) {
    var c = formEl.querySelector('#interviewSessionsContainer');
    var tpl = document.getElementById('interviewSessionTpl');
    var addBtn = document.getElementById('btnAddInterviewRecord');
    if (!c || !tpl || !addBtn) return;
    if (addBtn.dataset.interviewBound) return;
    addBtn.dataset.interviewBound = '1';
    addBtn.addEventListener('click', function () {
      var row = tpl.content.firstElementChild.cloneNode(true);
      c.appendChild(row);
      populateInterviewSessionRow(row);
      updateInterviewSessionHeadings(c);
      if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
    });
    c.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.btn-remove-interview-session');
      if (!btn || !c.contains(btn)) return;
      var row = btn.closest('[data-interview-session]');
      if (!row || c.querySelectorAll('[data-interview-session]').length <= 1) return;
      row.remove();
      updateInterviewSessionHeadings(c);
      if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
    });
    c.addEventListener('change', function () {
      if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
    });
  }

  function getFormValue(formEl, id, isNumber) {
    const el = formEl.querySelector('#' + id);
    if (!el) return isNumber ? 0 : '';
    if (el.type === 'checkbox') return el.checked ? (el.value || 'Yes') : '';
    const v = (el.value || '').trim();
    return isNumber ? (parseInt(v, 10) || 0) : v;
  }

  function setFormValue(formEl, id, value) {
    const el = formEl.querySelector('#' + id);
    if (!el) return;
    if (el.type === 'checkbox') {
      el.checked = value === 'Yes' || value === true || (value && value.toString().toLowerCase() === 'yes');
      return;
    }
    el.value = value == null ? '' : value;
  }

  function collectForm(formEl) {
    const caseObj = createEmptyCase(0);
    const get = (id, isNum) => getFormValue(formEl, id, isNum);

    caseObj.id = get('caseId') || caseObj.id;
    caseObj.receivedDate = get('receivedDate');
    caseObj.complexityDays = get('complexityDays', true);
    caseObj.targetCloseDate = get('targetCloseDate');
    caseObj.actualCloseDate = get('actualCloseDate');
    caseObj.actualDurationDays = get('actualDurationDays', true);
    caseObj.currentPhase = Math.min(12, Math.max(1, get('currentPhase', true) || 1));
    caseObj.sovereignty = get('sovereignty', true) || 1;
    caseObj.financial = get('financial', true) || 1;
    caseObj.evidence = get('evidence', true) || 1;
    caseObj.reputation = get('reputation', true) || 1;
    caseObj.totalScore = computeTotal(caseObj.sovereignty, caseObj.financial, caseObj.evidence, caseObj.reputation);
    caseObj.path = scoreToPath(caseObj.totalScore);

    caseObj.reporter = {
      name: get('reporterName'),
      phone: get('reporterPhone'),
      email: get('reporterEmail'),
      notes: get('reporterNotes'),
      type: get('reporterType'),
      empId: caseObj.reporter.empId,
      department: get('reporterDept'),
      departmentOther: get('reporterDept') === 'Other' ? get('reporterDepartmentOther') : '',
      sources: caseObj.reporter.sources,
      source: get('reporterSource'),
      protectionMeasures: caseObj.reporter.protectionMeasures
    };
    caseObj.classification = caseObj.classification || {};
    caseObj.classification.reportType = get('reportType');
    caseObj.classification.geographic = get('geographic');
    caseObj.classification.geographicCity = get('geographicCity');
    var geoCity = get('geographicCity');
    caseObj.classification.geographicCityOther = (geoCity === 'Other' || (geoCity && geoCity.indexOf('Other-') === 0)) ? get('geographicCityOther') : '';
    caseObj.classification.pdplAction = get('pdplAction');
    caseObj.classification.reporterStatus = get('reporterStatus');

    var indSigned = formEl.querySelector('[name="scope.independenceSigned"]');
    var noConflict = formEl.querySelector('[name="scope.noConflictDisclosed"]');
    var secClear = formEl.querySelector('[name="scope.securityClearanceObtained"]');
    var tmRoster = (window.NinjaSettings && NinjaSettings.collectTeamMemberRoster) ? NinjaSettings.collectTeamMemberRoster() : { roles: [], roster: [] };
    var scopeEntityRowsCollected = collectScopeEntityRows(formEl);
    var constraintItemsCollected = collectConstraintItems(formEl);
    caseObj.scope = {
      scope: get('scopeType'),
      subScope: get('subScope'),
      escalationLevel: get('escalationLevel'),
      escalationJustification: get('escalationJustification'),
      severity: get('severity'),
      precautionaryMeasures: get('precautionaryMeasures'),
      precautionaryMeasuresOther: get('precautionaryMeasuresOther'),
      investigatingBody: (window.NinjaSettings && NinjaSettings.getCheckboxGroupValues) ? NinjaSettings.getCheckboxGroupValues('investigatingBodyGroup') : [],
      teamMembers: tmRoster.roles,
      teamMemberRoster: tmRoster.roster,
      investigationSubject: get('investigationSubject'),
      scopeDateFrom: get('scopeDateFrom'),
      scopeDateTo: get('scopeDateTo'),
      scopeExclusions: get('scopeExclusions'),
      independenceSigned: indSigned && indSigned.checked,
      noConflictDisclosed: noConflict && noConflict.checked,
      securityClearanceObtained: secClear && secClear.checked
    };
    if (scopeEntityRowsCollected !== null) {
      caseObj.scope.scopeEntityRows = scopeEntityRowsCollected;
    } else {
      caseObj.scope.scopeEntities = get('scopeEntities');
    }
    if (constraintItemsCollected !== null) {
      caseObj.scope.constraintItems = constraintItemsCollected;
    } else {
      caseObj.scope.scopeConstraints = get('scopeConstraints');
    }
    var legalPrivJust = [];
    formEl.querySelectorAll('[name="process.legalPrivilegeJustification"]:checked').forEach(function (cb) { legalPrivJust.push(cb.value); });
    caseObj.process = {
      caseAcceptanceStatus: get('caseAcceptanceStatus'),
      legalPrivilege: get('legalPrivilege'),
      legalPrivilegeJustification: legalPrivJust,
      clearance: get('clearance'),
      scopeAmendmentReason: get('scopeAmendmentReason')
    };
    var interviewSessions = collectInterviewSessions(formEl);
    if (interviewSessions !== null) {
      caseObj.interview = { sessions: interviewSessions };
    } else {
      caseObj.interview = {
        classification: get('interviewClassification'),
        rightsNotified: get('rightsNotified'),
        documentationMethod: get('documentationMethod'),
        receiptResponseStatus: get('receiptResponseStatus'),
        interviewDate: get('interviewDate'),
        summonsId: get('summonsId'),
        summonsStatus: get('summonsStatus'),
        interview2Classification: get('interview2Classification'),
        interview2Date: get('interview2Date'),
        interview2RightsNotified: get('interview2RightsNotified'),
        interview2Minutes: get('interview2Minutes'),
        interview3Classification: get('interview3Classification'),
        interview3Date: get('interview3Date'),
        interview3RightsNotified: get('interview3RightsNotified'),
        interview3Minutes: get('interview3Minutes')
      };
    }
    var evRows = collectEvidenceRecordsFromForm(formEl);
    caseObj.evidenceRecords = evRows;
    caseObj.evidenceDetails = evRows && evRows.length ? evRows[0] : {
      formOfEvidence: '',
      formOfEvidenceOther: '',
      dataCategory: '',
      examinationType: '',
      evidenceHashValue: '',
      chainOfCustody: '',
      supportingParty: '',
      evidenceLinkUrl: ''
    };
    var extCollected = collectExternalPartiesFromForm(formEl);
    if (extCollected !== null) {
      caseObj.externalParties = { parties: extCollected };
    } else {
      caseObj.externalParties = { parties: [emptyExternalParty()] };
    }
    var rcHuman = formEl.querySelector('[name="impact.rootCauseHuman"]');
    var rcOrg = formEl.querySelector('[name="impact.rootCauseOrg"]');
    var rcTech = formEl.querySelector('[name="impact.rootCauseTech"]');
    var closureNoV = formEl.querySelector('[name="impact.closureNoViolation"]');
    var closureMal = formEl.querySelector('[name="impact.closureMalicious"]');
    var closurePart = formEl.querySelector('[name="impact.closurePartial"]');
    var closureFile = formEl.querySelector('[name="impact.closureFileClosed"]');
    var termImm = formEl.querySelector('[name="impact.termImmediate"]');
    var deduct = formEl.querySelector('[name="impact.deduction"]');
    var finWarn = formEl.querySelector('[name="impact.finalWarning"]');
    var refProc = formEl.querySelector('[name="impact.referralProsecution"]');
    var refNaz = formEl.querySelector('[name="impact.referralNazaha"]');
    var refSec = formEl.querySelector('[name="impact.referralSecurity"]');
    var wbCash = formEl.querySelector('[name="impact.whistleblowerCash"]');
    var wbThanks = formEl.querySelector('[name="impact.whistleblowerThanks"]');
    var wbNo = formEl.querySelector('[name="impact.whistleblowerNo"]');
    var wbProt = formEl.querySelector('[name="impact.whistleblowerProtection"]');
    caseObj.impact = caseObj.impact || {};
    caseObj.impact.regulatoryRef = (window.NinjaSettings && NinjaSettings.getCheckboxGroupValues) ? NinjaSettings.getCheckboxGroupValues('regulatoryRefGroup') : [];
    var regRefDetails = {};
    var regRefContainer = formEl.querySelector('#regulatoryRefGroup');
    if (regRefContainer) {
      regRefContainer.querySelectorAll('input[data-regulatory-ref]').forEach(function (inp) {
        var ref = inp.getAttribute('data-regulatory-ref');
        if (ref) regRefDetails[ref] = (inp.value || '').trim();
      });
    }
    caseObj.impact.regulatoryRefDetails = regRefDetails;
    caseObj.impact.currentStatus = get('currentStatus') || 'Open';
    caseObj.impact.technicalViolation = get('technicalViolation');
    caseObj.impact.fiveWhys1 = get('fiveWhys1');
    caseObj.impact.fiveWhys2 = get('fiveWhys2');
    caseObj.impact.fiveWhys3 = get('fiveWhys3');
    caseObj.impact.fiveWhys4 = get('fiveWhys4');
    caseObj.impact.fiveWhys5 = get('fiveWhys5');
    var fw1 = (caseObj.impact.fiveWhys1 || '').trim();
    var fw2 = (caseObj.impact.fiveWhys2 || '').trim();
    var fw3 = (caseObj.impact.fiveWhys3 || '').trim();
    var fw4 = (caseObj.impact.fiveWhys4 || '').trim();
    var fw5 = (caseObj.impact.fiveWhys5 || '').trim();
    caseObj.impact.fiveWhys = [fw1, fw2, fw3, fw4, fw5].filter(Boolean).length ? ['1. ' + fw1, '2. ' + fw2, '3. ' + fw3, '4. ' + fw4, '5. ' + fw5].join('\n') : '';
    caseObj.impact.rootCauseHuman = rcHuman && rcHuman.checked;
    caseObj.impact.rootCauseOrg = rcOrg && rcOrg.checked;
    caseObj.impact.rootCauseTech = rcTech && rcTech.checked;
    caseObj.impact.regulatoryImpact = get('regulatoryImpact');
    caseObj.impact.financialOperationalImpact = get('financialOperationalImpact');
    caseObj.impact.reputationLegalImpact = get('reputationLegalImpact');
    caseObj.impact.recoveryOpportunityValue = get('recoveryOpportunityValue');
    caseObj.impact.recoveryStatus = get('recoveryStatus');
    caseObj.impact.recoveryPath = get('recoveryPath');
    caseObj.impact.amountRecovered = get('amountRecovered');
    caseObj.impact.assetRecoveryNotes = get('assetRecoveryNotes');
    caseObj.impact.correctiveActions = get('correctiveActions');
    caseObj.impact.preventiveActions = get('preventiveActions');
    caseObj.impact.closureNoViolation = closureNoV && closureNoV.checked;
    caseObj.impact.closureMalicious = closureMal && closureMal.checked;
    caseObj.impact.closurePartial = closurePart && closurePart.checked;
    caseObj.impact.closureFileClosed = closureFile && closureFile.checked;
    caseObj.impact.closureObjectiveReasons = get('closureObjectiveReasons');
    caseObj.impact.closureTechnicalReasons = get('closureTechnicalReasons');
    caseObj.impact.rcaGapClosed = get('rcaGapClosed');
    caseObj.impact.termImmediate = termImm && termImm.checked;
    caseObj.impact.deduction = deduct && deduct.checked;
    caseObj.impact.finalWarning = finWarn && finWarn.checked;
    caseObj.impact.referralProsecution = refProc && refProc.checked;
    caseObj.impact.referralNazaha = refNaz && refNaz.checked;
    caseObj.impact.referralSecurity = refSec && refSec.checked;
    caseObj.impact.assetRecoveryAmount = caseObj.impact.strategicOptAssetRecovery ? get('assetRecoveryAmount') : '';
    caseObj.impact.whistleblowerCash = wbCash && wbCash.checked;
    caseObj.impact.whistleblowerThanks = wbThanks && wbThanks.checked;
    caseObj.impact.whistleblowerNo = wbNo && wbNo.checked;
    caseObj.impact.whistleblowerAmount = get('whistleblowerAmount');
    caseObj.impact.whistleblowerNoReason = get('whistleblowerNoReason');
    caseObj.impact.whistleblowerProtection = wbProt && wbProt.checked;
    caseObj.impact.grievanceDate = get('grievanceDate');
    caseObj.impact.grievanceGrounds = get('grievanceGrounds');
    caseObj.impact.grievanceAcceptance = get('grievanceAcceptance');
    caseObj.impact.grievanceDecisionAmendment = get('grievanceDecisionAmendment');
    caseObj.impact.formChecklist = (window.NinjaSettings && NinjaSettings.getCheckboxGroupValues) ? NinjaSettings.getCheckboxGroupValues('formChecklistGroup') : [];
    caseObj.impact.qualityReview = (window.NinjaSettings && NinjaSettings.getCheckboxGroupValues) ? NinjaSettings.getCheckboxGroupValues('qualityReviewGroup') : [];
    caseObj.impact.formChecklistNotes = get('formChecklistNotes');
    caseObj.impact.qualityReviewNotes = get('qualityReviewNotes');
    var accCollected = collectAccountableEntitiesFromForm(formEl);
    if (accCollected !== null) caseObj.impact.accountableEntities = accCollected;
    caseObj.impact.strategicOptAssetRecovery = isFormCheckboxChecked(formEl, 'strategicOptAssetRecovery');
    caseObj.impact.strategicOptReferProsecution = isFormCheckboxChecked(formEl, 'strategicOptReferProsecution');
    caseObj.impact.strategicArt80EmployerAssault = isFormCheckboxChecked(formEl, 'strategicArt80EmployerAssault');
    caseObj.impact.strategicArt80Obligations = isFormCheckboxChecked(formEl, 'strategicArt80Obligations');
    caseObj.impact.strategicArt80Misconduct = isFormCheckboxChecked(formEl, 'strategicArt80Misconduct');
    caseObj.impact.strategicArt80IntentionalLoss = isFormCheckboxChecked(formEl, 'strategicArt80IntentionalLoss');
    caseObj.impact.strategicArt80Forgery = isFormCheckboxChecked(formEl, 'strategicArt80Forgery');
    caseObj.impact.strategicArt80Probation = isFormCheckboxChecked(formEl, 'strategicArt80Probation');
    caseObj.impact.strategicArt80Absence = isFormCheckboxChecked(formEl, 'strategicArt80Absence');
    caseObj.impact.strategicArt80PositionAbuse = isFormCheckboxChecked(formEl, 'strategicArt80PositionAbuse');
    caseObj.impact.strategicArt80TradeSecrets = isFormCheckboxChecked(formEl, 'strategicArt80TradeSecrets');
    caseObj.impact.strategicClosureNoProof = isFormCheckboxChecked(formEl, 'strategicClosureNoProof');
    caseObj.impact.strategicClosureMalicious = isFormCheckboxChecked(formEl, 'strategicClosureMalicious');
    caseObj.impact.strategicClosurePartialAdmin = isFormCheckboxChecked(formEl, 'strategicClosurePartialAdmin');
    caseObj.impact.strategicClosureUnable = isFormCheckboxChecked(formEl, 'strategicClosureUnable');
    caseObj.impact.fdArt80 = isFormCheckboxChecked(formEl, 'fdArt80');
    caseObj.impact.fdArt80Paragraph = get('fdArt80Paragraph');
    caseObj.impact.fdDeduction = isFormCheckboxChecked(formEl, 'fdDeduction');
    caseObj.impact.fdDeductionDetail = get('fdDeductionDetail');
    caseObj.impact.fdFinalWarningTransfer = isFormCheckboxChecked(formEl, 'fdFinalWarningTransfer');
    caseObj.impact.fdReferAuthorities = isFormCheckboxChecked(formEl, 'fdReferAuthorities');
    caseObj.impact.fdRepayAmount = isFormCheckboxChecked(formEl, 'fdRepayAmount');
    caseObj.impact.fdRepayAmountValue = get('fdRepayAmountValue');
    caseObj.impact.fdRevokeAccess = isFormCheckboxChecked(formEl, 'fdRevokeAccess');
    caseObj.impact.fdSalaryStopContinue = isFormCheckboxChecked(formEl, 'fdSalaryStopContinue');
    caseObj.impact.fdCloseInvestigation = isFormCheckboxChecked(formEl, 'fdCloseInvestigation');
    caseObj.impact.fdHrRestore = isFormCheckboxChecked(formEl, 'fdHrRestore');
    caseObj.impact.fdHrCancelSuspension = isFormCheckboxChecked(formEl, 'fdHrCancelSuspension');
    caseObj.impact.fdHrRecord = isFormCheckboxChecked(formEl, 'fdHrRecord');
    caseObj.impact.fdTechRestoreAccess = isFormCheckboxChecked(formEl, 'fdTechRestoreAccess');
    caseObj.impact.fdTechStopMonitoring = isFormCheckboxChecked(formEl, 'fdTechStopMonitoring');
    caseObj.impact.fdPdplReturnAssets = isFormCheckboxChecked(formEl, 'fdPdplReturnAssets');
    caseObj.impact.fdPdplDestroy = isFormCheckboxChecked(formEl, 'fdPdplDestroy');
    caseObj.impact.fdPdplArchive = isFormCheckboxChecked(formEl, 'fdPdplArchive');
    caseObj.impact.recommendationType = get('recommendationType');
    caseObj.impact.disciplinaryAction = get('disciplinaryAction');
    caseObj.impact.disciplinaryActionOther = caseObj.impact.disciplinaryAction === 'Other' ? get('disciplinaryActionOther') : '';
    caseObj.impact.mandatoryLevel = get('mandatoryLevel');

    return caseObj;
  }

  function fillForm(formEl, caseObj) {
    if (!caseObj) return;
    const set = (id, value) => setFormValue(formEl, id, value);

    set('caseId', caseObj.id);
    set('receivedDate', caseObj.receivedDate || '');
    set('complexityDays', caseObj.complexityDays);
    set('targetCloseDate', caseObj.targetCloseDate || '');
    set('actualCloseDate', caseObj.actualCloseDate || '');
    set('actualDurationDays', caseObj.actualDurationDays || '');
    set('currentPhase', caseObj.currentPhase);
    set('sovereignty', caseObj.sovereignty);
    set('financial', caseObj.financial);
    set('evidence', typeof caseObj.evidence === 'number' ? caseObj.evidence : (caseObj.evidence && caseObj.evidence.score) || 1);
    set('reputation', caseObj.reputation);
    if (caseObj.reporter) {
      set('reporterName', caseObj.reporter.name);
      set('reporterPhone', caseObj.reporter.phone);
      set('reporterEmail', caseObj.reporter.email);
      set('reporterNotes', caseObj.reporter.notes);
      set('reporterType', caseObj.reporter.type);
      set('reporterDept', caseObj.reporter.department);
      set('reporterDepartmentOther', caseObj.reporter.departmentOther || '');
      set('reporterSource', caseObj.reporter.source);
    }
    if (caseObj.classification) {
      set('reportType', caseObj.classification.reportType);
      set('geographic', caseObj.classification.geographic);
      set('geographicCity', caseObj.classification.geographicCity);
      set('geographicCityOther', caseObj.classification.geographicCityOther);
      set('pdplAction', caseObj.classification.pdplAction);
      set('reporterStatus', caseObj.classification.reporterStatus);
    }
    if (caseObj.scope) {
      set('scopeType', caseObj.scope.scope);
      set('subScope', caseObj.scope.subScope);
      set('escalationLevel', caseObj.scope.escalationLevel);
      set('escalationJustification', caseObj.scope.escalationJustification);
      set('severity', caseObj.scope.severity);
      set('precautionaryMeasures', caseObj.scope.precautionaryMeasures);
      set('precautionaryMeasuresOther', caseObj.scope.precautionaryMeasuresOther || '');
      if (window.NinjaSettings && NinjaSettings.setCheckboxGroupValues) {
        NinjaSettings.setCheckboxGroupValues('investigatingBodyGroup', caseObj.scope.investigatingBody || []);
      }
      if (window.NinjaSettings && NinjaSettings.applyTeamMemberRoster) {
        NinjaSettings.applyTeamMemberRoster(
          (caseObj.scope.teamMemberRoster && caseObj.scope.teamMemberRoster.length) ? caseObj.scope.teamMemberRoster : null,
          caseObj.scope.teamMembers || []
        );
      }
      set('investigationSubject', caseObj.scope.investigationSubject);
      set('scopeDateFrom', caseObj.scope.scopeDateFrom);
      set('scopeDateTo', caseObj.scope.scopeDateTo);
      if (formEl.querySelector('#scopeEntitiesContainer')) {
        fillScopeEntityRowsInForm(formEl, caseObj);
      } else {
        set('scopeEntities', caseObj.scope.scopeEntities);
      }
      if (formEl.querySelector('#scopeConstraintsContainer')) {
        fillConstraintItemsInForm(formEl, caseObj);
      } else {
        set('scopeConstraints', caseObj.scope.scopeConstraints);
      }
      set('scopeExclusions', caseObj.scope.scopeExclusions);
      var is = formEl.querySelector('[name="scope.independenceSigned"]');
      var nc = formEl.querySelector('[name="scope.noConflictDisclosed"]');
      var sc = formEl.querySelector('[name="scope.securityClearanceObtained"]');
      if (is) is.checked = !!caseObj.scope.independenceSigned;
      if (nc) nc.checked = !!caseObj.scope.noConflictDisclosed;
      if (sc) sc.checked = !!caseObj.scope.securityClearanceObtained;
    }
    if (caseObj.process) {
      set('caseAcceptanceStatus', caseObj.process.caseAcceptanceStatus);
      set('legalPrivilege', caseObj.process.legalPrivilege);
      var jg = formEl.querySelector('#legalPrivilegeJustificationGroup');
      if (jg) {
        var arr = caseObj.process.legalPrivilegeJustification || [];
        jg.querySelectorAll('[name="process.legalPrivilegeJustification"]').forEach(function (cb) { cb.checked = arr.indexOf(cb.value) !== -1; });
      }
      set('clearance', caseObj.process.clearance);
      set('scopeAmendmentReason', caseObj.process.scopeAmendmentReason);
    }
    if (caseObj.interview) {
      if (formEl.querySelector('#interviewSessionsContainer')) {
        fillInterviewSessions(formEl, caseObj);
      } else {
        set('interviewClassification', caseObj.interview.classification);
        set('rightsNotified', caseObj.interview.rightsNotified);
        set('documentationMethod', caseObj.interview.documentationMethod);
        set('receiptResponseStatus', caseObj.interview.receiptResponseStatus);
        set('interviewDate', caseObj.interview.interviewDate || '');
        set('summonsId', caseObj.interview.summonsId || '');
        set('summonsStatus', caseObj.interview.summonsStatus || '');
        set('interview2Classification', caseObj.interview.interview2Classification);
        set('interview2Date', caseObj.interview.interview2Date);
        set('interview2RightsNotified', caseObj.interview.interview2RightsNotified);
        set('interview2Minutes', caseObj.interview.interview2Minutes);
        set('interview3Classification', caseObj.interview.interview3Classification);
        set('interview3Date', caseObj.interview.interview3Date);
        set('interview3RightsNotified', caseObj.interview.interview3RightsNotified);
        set('interview3Minutes', caseObj.interview.interview3Minutes);
      }
    }
    fillEvidenceRecordsInForm(formEl, caseObj);
    fillExternalPartiesInForm(formEl, caseObj);
    fillAccountableEntitiesInForm(formEl, caseObj);
    if (caseObj.impact) {
      if (window.NinjaSettings && NinjaSettings.setCheckboxGroupValues) {
        NinjaSettings.setCheckboxGroupValues('regulatoryRefGroup', caseObj.impact.regulatoryRef || []);
        if (caseObj.impact.regulatoryRefDetails && typeof caseObj.impact.regulatoryRefDetails === 'object') {
          Object.keys(caseObj.impact.regulatoryRefDetails).forEach(function (ref) {
            setFormValue(formEl, 'regulatoryRefArticle_' + ref, caseObj.impact.regulatoryRefDetails[ref] || '');
          });
        }
        NinjaSettings.setCheckboxGroupValues('formChecklistGroup', caseObj.impact.formChecklist || []);
        NinjaSettings.setCheckboxGroupValues('qualityReviewGroup', caseObj.impact.qualityReview || []);
      }
      set('formChecklistNotes', caseObj.impact.formChecklistNotes);
      set('qualityReviewNotes', caseObj.impact.qualityReviewNotes);
      var setImpactCb = function (id, v) {
        var el = formEl.querySelector('#' + id);
        if (el && el.type === 'checkbox') el.checked = !!v;
      };
      setImpactCb('strategicOptAssetRecovery', caseObj.impact.strategicOptAssetRecovery);
      setImpactCb('strategicOptReferProsecution', caseObj.impact.strategicOptReferProsecution);
      setImpactCb('strategicArt80EmployerAssault', caseObj.impact.strategicArt80EmployerAssault);
      setImpactCb('strategicArt80Obligations', caseObj.impact.strategicArt80Obligations);
      setImpactCb('strategicArt80Misconduct', caseObj.impact.strategicArt80Misconduct);
      setImpactCb('strategicArt80IntentionalLoss', caseObj.impact.strategicArt80IntentionalLoss);
      setImpactCb('strategicArt80Forgery', caseObj.impact.strategicArt80Forgery);
      setImpactCb('strategicArt80Probation', caseObj.impact.strategicArt80Probation);
      setImpactCb('strategicArt80Absence', caseObj.impact.strategicArt80Absence);
      setImpactCb('strategicArt80PositionAbuse', caseObj.impact.strategicArt80PositionAbuse);
      setImpactCb('strategicArt80TradeSecrets', caseObj.impact.strategicArt80TradeSecrets);
      setImpactCb('strategicClosureNoProof', caseObj.impact.strategicClosureNoProof);
      setImpactCb('strategicClosureMalicious', caseObj.impact.strategicClosureMalicious);
      setImpactCb('strategicClosurePartialAdmin', caseObj.impact.strategicClosurePartialAdmin);
      setImpactCb('strategicClosureUnable', caseObj.impact.strategicClosureUnable);
      setImpactCb('fdArt80', caseObj.impact.fdArt80);
      set('fdArt80Paragraph', caseObj.impact.fdArt80Paragraph);
      setImpactCb('fdDeduction', caseObj.impact.fdDeduction);
      set('fdDeductionDetail', caseObj.impact.fdDeductionDetail);
      setImpactCb('fdFinalWarningTransfer', caseObj.impact.fdFinalWarningTransfer);
      setImpactCb('fdReferAuthorities', caseObj.impact.fdReferAuthorities);
      setImpactCb('fdRepayAmount', caseObj.impact.fdRepayAmount);
      set('fdRepayAmountValue', caseObj.impact.fdRepayAmountValue);
      setImpactCb('fdRevokeAccess', caseObj.impact.fdRevokeAccess);
      setImpactCb('fdSalaryStopContinue', caseObj.impact.fdSalaryStopContinue);
      setImpactCb('fdCloseInvestigation', caseObj.impact.fdCloseInvestigation);
      setImpactCb('fdHrRestore', caseObj.impact.fdHrRestore);
      setImpactCb('fdHrCancelSuspension', caseObj.impact.fdHrCancelSuspension);
      setImpactCb('fdHrRecord', caseObj.impact.fdHrRecord);
      setImpactCb('fdTechRestoreAccess', caseObj.impact.fdTechRestoreAccess);
      setImpactCb('fdTechStopMonitoring', caseObj.impact.fdTechStopMonitoring);
      setImpactCb('fdPdplReturnAssets', caseObj.impact.fdPdplReturnAssets);
      setImpactCb('fdPdplDestroy', caseObj.impact.fdPdplDestroy);
      setImpactCb('fdPdplArchive', caseObj.impact.fdPdplArchive);
      set('currentStatus', caseObj.impact.currentStatus || 'Open');
      set('technicalViolation', caseObj.impact.technicalViolation);
      if (caseObj.impact.fiveWhys1 !== undefined || caseObj.impact.fiveWhys2 !== undefined) {
        set('fiveWhys1', caseObj.impact.fiveWhys1);
        set('fiveWhys2', caseObj.impact.fiveWhys2);
        set('fiveWhys3', caseObj.impact.fiveWhys3);
        set('fiveWhys4', caseObj.impact.fiveWhys4);
        set('fiveWhys5', caseObj.impact.fiveWhys5);
      } else if (caseObj.impact.fiveWhys) {
        var parts = (caseObj.impact.fiveWhys || '').split(/\n|\r/).map(function (s) { return s.replace(/^\s*\d+\.\s*/, '').trim(); });
        set('fiveWhys1', parts[0] || '');
        set('fiveWhys2', parts[1] || '');
        set('fiveWhys3', parts[2] || '');
        set('fiveWhys4', parts[3] || '');
        set('fiveWhys5', parts[4] || '');
      }
      var rcH = formEl.querySelector('[name="impact.rootCauseHuman"]');
      var rcO = formEl.querySelector('[name="impact.rootCauseOrg"]');
      var rcT = formEl.querySelector('[name="impact.rootCauseTech"]');
      if (rcH) rcH.checked = !!caseObj.impact.rootCauseHuman;
      if (rcO) rcO.checked = !!caseObj.impact.rootCauseOrg;
      if (rcT) rcT.checked = !!caseObj.impact.rootCauseTech;
      set('regulatoryImpact', caseObj.impact.regulatoryImpact);
      set('financialOperationalImpact', caseObj.impact.financialOperationalImpact);
      set('reputationLegalImpact', caseObj.impact.reputationLegalImpact);
      set('recoveryOpportunityValue', caseObj.impact.recoveryOpportunityValue);
      set('recoveryStatus', caseObj.impact.recoveryStatus);
      set('recoveryPath', caseObj.impact.recoveryPath);
      set('amountRecovered', caseObj.impact.amountRecovered);
      set('assetRecoveryNotes', caseObj.impact.assetRecoveryNotes);
      set('correctiveActions', caseObj.impact.correctiveActions);
      set('preventiveActions', caseObj.impact.preventiveActions);
      var cNoV = formEl.querySelector('[name="impact.closureNoViolation"]');
      var cMal = formEl.querySelector('[name="impact.closureMalicious"]');
      var cPart = formEl.querySelector('[name="impact.closurePartial"]');
      var cFile = formEl.querySelector('[name="impact.closureFileClosed"]');
      if (cNoV) cNoV.checked = !!caseObj.impact.closureNoViolation;
      if (cMal) cMal.checked = !!caseObj.impact.closureMalicious;
      if (cPart) cPart.checked = !!caseObj.impact.closurePartial;
      if (cFile) cFile.checked = !!caseObj.impact.closureFileClosed;
      set('closureObjectiveReasons', caseObj.impact.closureObjectiveReasons);
      set('closureTechnicalReasons', caseObj.impact.closureTechnicalReasons);
      set('rcaGapClosed', caseObj.impact.rcaGapClosed);
      var tImm = formEl.querySelector('[name="impact.termImmediate"]');
      var ded = formEl.querySelector('[name="impact.deduction"]');
      var fWarn = formEl.querySelector('[name="impact.finalWarning"]');
      var rProc = formEl.querySelector('[name="impact.referralProsecution"]');
      var rNaz = formEl.querySelector('[name="impact.referralNazaha"]');
      var rSec = formEl.querySelector('[name="impact.referralSecurity"]');
      if (tImm) tImm.checked = !!caseObj.impact.termImmediate;
      if (ded) ded.checked = !!caseObj.impact.deduction;
      if (fWarn) fWarn.checked = !!caseObj.impact.finalWarning;
      if (rProc) rProc.checked = !!caseObj.impact.referralProsecution;
      if (rNaz) rNaz.checked = !!caseObj.impact.referralNazaha;
      if (rSec) rSec.checked = !!caseObj.impact.referralSecurity;
      set('assetRecoveryAmount', caseObj.impact.assetRecoveryAmount);
      if (window.NinjaApp && window.NinjaApp.toggleStrategicAssetRecoveryAmount) window.NinjaApp.toggleStrategicAssetRecoveryAmount();
      var wbC = formEl.querySelector('[name="impact.whistleblowerCash"]');
      var wbT = formEl.querySelector('[name="impact.whistleblowerThanks"]');
      var wbN = formEl.querySelector('[name="impact.whistleblowerNo"]');
      var wbP = formEl.querySelector('[name="impact.whistleblowerProtection"]');
      if (wbC) wbC.checked = !!caseObj.impact.whistleblowerCash;
      if (wbT) wbT.checked = !!caseObj.impact.whistleblowerThanks;
      if (wbN) wbN.checked = !!caseObj.impact.whistleblowerNo;
      if (wbP) wbP.checked = !!caseObj.impact.whistleblowerProtection;
      set('whistleblowerAmount', caseObj.impact.whistleblowerAmount);
      set('whistleblowerNoReason', caseObj.impact.whistleblowerNoReason);
      set('grievanceDate', caseObj.impact.grievanceDate);
      set('grievanceGrounds', caseObj.impact.grievanceGrounds);
      set('grievanceAcceptance', caseObj.impact.grievanceAcceptance);
      set('grievanceDecisionAmendment', caseObj.impact.grievanceDecisionAmendment);
      set('recommendationType', caseObj.impact.recommendationType);
      set('disciplinaryAction', caseObj.impact.disciplinaryAction);
      set('disciplinaryActionOther', caseObj.impact.disciplinaryActionOther);
      set('mandatoryLevel', caseObj.impact.mandatoryLevel);
    }
    updateScoreDisplay(formEl, caseObj.totalScore, caseObj.path);
    updateReporterRequired(formEl);
    if (window.NinjaApp && window.NinjaApp.toggleOtherFreeTextFields) window.NinjaApp.toggleOtherFreeTextFields();
    if (window.NinjaApp && window.NinjaApp.toggleAllEvidenceFormOtherRows) window.NinjaApp.toggleAllEvidenceFormOtherRows(formEl);
    if (window.NinjaApp && window.NinjaApp.updateCloseDateComputations) window.NinjaApp.updateCloseDateComputations();
  }

  function updateReporterRequired(formEl) {
    if (!formEl) return;
    var reporterTypeEl = formEl.querySelector('#reporterType');
    var v = (reporterTypeEl && reporterTypeEl.value || '').trim();
    var notAnonymous = v && v !== 'Anonymous';
    var isEmployee = v === 'Employee';
    ['reporterName', 'reporterPhone', 'reporterEmail'].forEach(function (id) {
      var el = formEl.querySelector('#' + id);
      if (el) el.required = notAnonymous;
    });
    var deptEl = formEl.querySelector('#reporterDept');
    if (deptEl) deptEl.required = isEmployee;
  }

  function updateScoreDisplay(formEl, totalScore, path) {
    if (!formEl) return;
    const total = formEl.querySelector('#totalScoreDisplay');
    const pathEl = formEl.querySelector('#pathDisplay');
    const s = formEl.querySelector('#sovereignty');
    const f = formEl.querySelector('#financial');
    const e = formEl.querySelector('#evidence');
    const r = formEl.querySelector('#reputation');
    const computed = computeTotal(s?.value, f?.value, e?.value, r?.value);
    const totalVal = totalScore != null ? totalScore : computed;
    const pathVal = path || scoreToPath(totalVal);
    if (total) total.textContent = totalVal;
    if (pathEl) {
      pathEl.className = 'path-badge ' + getPathClass(pathVal);
      if (typeof window.NinjaI18n !== 'undefined') {
        pathEl.textContent = window.NinjaI18n.t(pathVal === 'green' ? 'pathGreen' : pathVal === 'yellow' ? 'pathYellow' : 'pathRed');
      } else {
        pathEl.textContent = pathVal === 'green' ? 'Green (4-8)' : pathVal === 'yellow' ? 'Yellow (9-14)' : 'Red (15-20)';
      }
    }
    const pathDescEl = formEl.querySelector('#pathDescription');
    if (pathDescEl && typeof window.NinjaI18n !== 'undefined') {
      var actionKey = pathVal === 'green' ? 'pathGreenAction' : pathVal === 'yellow' ? 'pathYellowAction' : 'pathRedAction';
      pathDescEl.textContent = window.NinjaI18n.t(actionKey) || '';
      pathDescEl.className = 'path-description path-description--' + (pathVal || 'green');
    } else if (pathDescEl) {
      pathDescEl.textContent = pathVal === 'green' ? 'Preliminary closure / administrative referral. Classify as non-material or malicious complaint; record reason or refer to HR as administrative dispute.'
        : pathVal === 'yellow' ? 'Restricted follow-up: move to first phase with one investigator for exploratory review before forming full committee.'
        : pathVal === 'red' ? 'Immediate formal investigation. Open official file; activate Legal Privilege and notify board chair if score 15-20.' : '';
      pathDescEl.className = 'path-description path-description--' + (pathVal || 'green');
    }
  }

  function validateForm(formEl) {
    const errors = [];
    const id = formEl.querySelector('#caseId');
    if (!id || !id.value.trim()) errors.push({ msg: 'caseId', fieldId: 'caseId' });
    const reporterType = (formEl.querySelector('#reporterType') || {}).value || '';
    if (reporterType && reporterType !== 'Anonymous') {
      const name = formEl.querySelector('#reporterName');
      const phone = formEl.querySelector('#reporterPhone');
      const email = formEl.querySelector('#reporterEmail');
      if (!name || !name.value.trim()) errors.push({ msg: 'reporterName', fieldId: 'reporterName' });
      if (!phone || !phone.value.trim()) errors.push({ msg: 'reporterPhone', fieldId: 'reporterPhone' });
      if (!email || !email.value.trim()) errors.push({ msg: 'reporterEmail', fieldId: 'reporterEmail' });
      if (reporterType === 'Employee') {
        const dept = formEl.querySelector('#reporterDept');
        if (!dept || !dept.value.trim()) errors.push({ msg: 'reporterDept', fieldId: 'reporterDept' });
      }
    }
    const geographic = formEl.querySelector('#geographic');
    if (!geographic || !geographic.value.trim()) errors.push({ msg: 'geographic', fieldId: 'geographic' });
    const s = formEl.querySelector('#sovereignty');
    const f = formEl.querySelector('#financial');
    const e = formEl.querySelector('#evidence');
    const r = formEl.querySelector('#reputation');
    const scoreFields = [
      { el: s, id: 'sovereignty' },
      { el: f, id: 'financial' },
      { el: e, id: 'evidence' },
      { el: r, id: 'reputation' }
    ];
    for (const { el, id: fieldId } of scoreFields) {
      if (el) {
        const v = parseInt(el.value, 10);
        if (isNaN(v) || v < 1 || v > 5) errors.push({ msg: 'score', fieldId: fieldId });
      }
    }
    return errors.length ? { ok: false, errors: errors } : { ok: true, errors: [] };
  }

  global.NinjaForms = {
    scoreToPath,
    computeTotal,
    getPathClass,
    createEmptyCase,
    collectForm,
    fillForm,
    updateScoreDisplay,
    updateReporterRequired,
    validateForm,
    bindEvidenceRecordsUI: bindEvidenceRecordsUI,
    bindExternalPartiesUI: bindExternalPartiesUI,
    bindAccountableEntitiesUI: bindAccountableEntitiesUI,
    refreshExternalPartyLabels: refreshExternalPartyLabels,
    refreshAccountableEntityLabels: refreshAccountableEntityLabels,
    fillEvidenceRecordsInForm: fillEvidenceRecordsInForm,
    updateEvidenceRecordHeadings: updateEvidenceRecordHeadings,
    refreshAllEvidenceRowSelects: refreshAllEvidenceRowSelects,
    toggleEvidenceFormOtherRow: toggleEvidenceFormOtherRow,
    bindInterviewSessionsUI: bindInterviewSessionsUI,
    fillInterviewSessions: fillInterviewSessions,
    refreshAllInterviewSessionLabels: refreshAllInterviewSessionLabels,
    bindScopeEntityRowsUI: bindScopeEntityRowsUI,
    bindScopeConstraintsUI: bindScopeConstraintsUI,
    refreshAllScopeDynamicLabels: refreshAllScopeDynamicLabels
  };
})(typeof window !== 'undefined' ? window : this);
