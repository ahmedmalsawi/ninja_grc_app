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
        dataCategory: '',
        examinationType: '',
        chainOfCustody: '',
        supportingParty: '',
        evidenceLinkUrl: ''
      },
      evidenceRecords: [],
      externalParties: {},
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

  var EVIDENCE_ROW_KEYS = ['formOfEvidence', 'dataCategory', 'examinationType', 'evidenceHashValue', 'chainOfCustody', 'supportingParty', 'evidenceLinkUrl'];

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

  var INTERVIEW_SESSION_KEYS = ['intervieweeName', 'intervieweeJobNumber', 'classification', 'interviewDate', 'rightsNotified', 'documentationMethod', 'receiptResponseStatus', 'summonsId', 'summonsStatus', 'minutes'];

  function emptyInterviewSession() {
    var o = {};
    INTERVIEW_SESSION_KEYS.forEach(function (k) { o[k] = ''; });
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
      return [{
        formOfEvidence: g('formOfEvidence'),
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
    [['label-formOfEvidence', 'formOfEvidence'], ['label-dataCategory', 'dataCategory'], ['label-examinationType', 'examinationType'], ['label-evidenceHashValue', 'evidenceHashValue'], ['label-chainOfCustody', 'chainOfCustody'], ['label-evidenceLinkUrl', 'evidenceLinkUrl'], ['label-supportingParty', 'supportingParty']].forEach(function (pair) {
      var el = row.querySelector('.' + pair[0]);
      if (el) el.textContent = t(pair[1]);
    });
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
        o[k] = el ? (el.value || '').trim() : '';
      });
      out.push(o);
    });
    return out.length ? out : [emptyInterviewSession()];
  }

  function populateInterviewSessionRow(row) {
    var lang = (typeof NinjaI18n !== 'undefined' && NinjaI18n.getLang) ? NinjaI18n.getLang() : 'en';
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    if (window.NinjaSettings && NinjaSettings.populateSelect) {
      var receiptSel = row.querySelector('select.interview-session-receipt');
      var summonsSel = row.querySelector('select.interview-session-summons');
      if (receiptSel) NinjaSettings.populateSelect(receiptSel, 'receiptResponseStatus', { lang: lang });
      if (summonsSel) NinjaSettings.populateSelect(summonsSel, 'summonsStatus', { lang: lang });
    }
    [['intervieweeName', 'intervieweeName'], ['intervieweeJobNumber', 'intervieweeJobNumber'], ['interviewClassification', 'interviewClassification'], ['interviewDate', 'interviewDate'], ['rightsNotified', 'rightsNotified'], ['documentationMethod', 'documentationMethod'], ['receiptResponseStatus', 'receiptResponseStatus'], ['summonsId', 'summonsId'], ['summonsStatus', 'summonsStatus'], ['interviewMinutes', 'interviewMinutes']].forEach(function (pair) {
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
        if (el) el.value = sess[k] != null ? sess[k] : '';
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
      sources: caseObj.reporter.sources,
      source: get('reporterSource'),
      protectionMeasures: caseObj.reporter.protectionMeasures
    };
    caseObj.classification = caseObj.classification || {};
    caseObj.classification.reportType = get('reportType');
    caseObj.classification.geographic = get('geographic');
    caseObj.classification.geographicCity = get('geographicCity');
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
      dataCategory: '',
      examinationType: '',
      evidenceHashValue: '',
      chainOfCustody: '',
      supportingParty: '',
      evidenceLinkUrl: ''
    };
    caseObj.externalParties = {
      partyType: get('partyType'),
      natureOfCommunication: get('natureOfCommunication'),
      encryption: get('encryption'),
      writtenAgreement: (function () {
        var el = formEl.querySelector('#writtenAgreement');
        return el && el.checked ? 'Yes' : 'No';
      })(),
      confidentiality: get('externalConfidentiality')
    };
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
    caseObj.impact.netSavings = get('netSavings');
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
    caseObj.impact.assetRecoveryAmount = get('assetRecoveryAmount');
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
    caseObj.impact.recommendationType = get('recommendationType');
    caseObj.impact.disciplinaryAction = get('disciplinaryAction');
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
      set('reporterSource', caseObj.reporter.source);
    }
    if (caseObj.classification) {
      set('reportType', caseObj.classification.reportType);
      set('geographic', caseObj.classification.geographic);
      set('geographicCity', caseObj.classification.geographicCity);
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
    if (caseObj.externalParties) {
      set('partyType', caseObj.externalParties.partyType);
      set('natureOfCommunication', caseObj.externalParties.natureOfCommunication);
      set('encryption', caseObj.externalParties.encryption);
      set('writtenAgreement', caseObj.externalParties.writtenAgreement);
      set('externalConfidentiality', caseObj.externalParties.confidentiality);
    }
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
      set('netSavings', caseObj.impact.netSavings);
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
      set('mandatoryLevel', caseObj.impact.mandatoryLevel);
    }
    updateScoreDisplay(formEl, caseObj.totalScore, caseObj.path);
    updateReporterRequired(formEl);
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
    fillEvidenceRecordsInForm: fillEvidenceRecordsInForm,
    updateEvidenceRecordHeadings: updateEvidenceRecordHeadings,
    refreshAllEvidenceRowSelects: refreshAllEvidenceRowSelects,
    bindInterviewSessionsUI: bindInterviewSessionsUI,
    fillInterviewSessions: fillInterviewSessions,
    refreshAllInterviewSessionLabels: refreshAllInterviewSessionLabels,
    bindScopeEntityRowsUI: bindScopeEntityRowsUI,
    bindScopeConstraintsUI: bindScopeConstraintsUI,
    refreshAllScopeDynamicLabels: refreshAllScopeDynamicLabels
  };
})(typeof window !== 'undefined' ? window : this);
