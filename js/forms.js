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
        investigatingBody: [],
        teamMembers: []
      },
      process: {
        caseAcceptanceStatus: '',
        legalPrivilege: '',
        legalRep1: '',
        legalRep2: '',
        legalRep3: '',
        managementRep: '',
        clearance: '',
        scopeAmendmentReason: ''
      },
      interview: {},
      evidenceDetails: {
        formOfEvidence: '',
        dataCategory: '',
        examinationType: '',
        chainOfCustody: '',
        supportingParty: ''
      },
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
        impactValue: '',
        impactCurrency: '',
        recoveryValue: '',
        rcaType: '',
        rcaSubtype: '',
        rootCauses: '',
        mandatoryLevel: ''
      }
    };
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
    caseObj.currentPhase = Math.min(9, Math.max(1, get('currentPhase', true) || 1));
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

    caseObj.scope = {
      scope: get('scopeType'),
      subScope: get('subScope'),
      escalationLevel: get('escalationLevel'),
      escalationJustification: get('escalationJustification'),
      severity: get('severity'),
      precautionaryMeasures: get('precautionaryMeasures'),
      investigatingBody: (window.NinjaSettings && NinjaSettings.getCheckboxGroupValues) ? NinjaSettings.getCheckboxGroupValues('investigatingBodyGroup') : [],
      teamMembers: (window.NinjaSettings && NinjaSettings.getCheckboxGroupValues) ? NinjaSettings.getCheckboxGroupValues('teamMembersGroup') : []
    };
    caseObj.process = {
      caseAcceptanceStatus: get('caseAcceptanceStatus'),
      legalPrivilege: get('legalPrivilege'),
      legalRep1: get('legalRep1'),
      legalRep2: get('legalRep2'),
      legalRep3: get('legalRep3'),
      managementRep: get('managementRep'),
      clearance: get('clearance'),
      scopeAmendmentReason: get('scopeAmendmentReason')
    };
    caseObj.interview = {
      classification: get('interviewClassification'),
      rightsNotified: get('rightsNotified'),
      documentationMethod: get('documentationMethod'),
      receiptResponseStatus: get('receiptResponseStatus'),
      interviewDate: get('interviewDate'),
      summonsId: get('summonsId'),
      summonsStatus: get('summonsStatus')
    };
    caseObj.evidenceDetails = {
      formOfEvidence: get('formOfEvidence'),
      dataCategory: get('dataCategory'),
      examinationType: get('examinationType'),
      chainOfCustody: get('chainOfCustody'),
      supportingParty: get('supportingParty')
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
    caseObj.impact = caseObj.impact || {};
    caseObj.impact.currentStatus = get('currentStatus') || 'Open';
    caseObj.impact.purpose = get('purpose');
    caseObj.impact.methodology = get('methodology');
    caseObj.impact.facts = get('facts');
    caseObj.impact.conclusions = get('conclusions');
    caseObj.impact.recommendations = get('recommendations');
    caseObj.impact.recommendationType = get('recommendationType');
    caseObj.impact.disciplinaryAction = get('disciplinaryAction');
    caseObj.impact.impactValue = get('impactValue');
    caseObj.impact.impactCurrency = get('impactCurrency');
    caseObj.impact.recoveryValue = get('recoveryValue');
    caseObj.impact.rcaType = get('rcaType');
    caseObj.impact.rcaSubtype = get('rcaSubtype');
    caseObj.impact.rootCauses = get('rootCauses');
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
      if (window.NinjaSettings && NinjaSettings.setCheckboxGroupValues) {
        NinjaSettings.setCheckboxGroupValues('investigatingBodyGroup', caseObj.scope.investigatingBody || []);
        NinjaSettings.setCheckboxGroupValues('teamMembersGroup', caseObj.scope.teamMembers || []);
      }
    }
    if (caseObj.process) {
      set('caseAcceptanceStatus', caseObj.process.caseAcceptanceStatus);
      set('legalPrivilege', caseObj.process.legalPrivilege);
      set('legalRep1', caseObj.process.legalRep1);
      set('legalRep2', caseObj.process.legalRep2);
      set('legalRep3', caseObj.process.legalRep3);
      set('managementRep', caseObj.process.managementRep);
      set('clearance', caseObj.process.clearance);
      set('scopeAmendmentReason', caseObj.process.scopeAmendmentReason);
    }
    if (caseObj.interview) {
      set('interviewClassification', caseObj.interview.classification);
      set('rightsNotified', caseObj.interview.rightsNotified);
      set('documentationMethod', caseObj.interview.documentationMethod);
      set('receiptResponseStatus', caseObj.interview.receiptResponseStatus);
      set('interviewDate', caseObj.interview.interviewDate || '');
      set('summonsId', caseObj.interview.summonsId || '');
      set('summonsStatus', caseObj.interview.summonsStatus || '');
    }
    var evidenceSection = caseObj.evidenceDetails || (typeof caseObj.evidence === 'object' && caseObj.evidence && !Array.isArray(caseObj.evidence) ? caseObj.evidence : null);
    set('formOfEvidence', evidenceSection && evidenceSection.formOfEvidence != null ? evidenceSection.formOfEvidence : '');
    set('dataCategory', evidenceSection && evidenceSection.dataCategory != null ? evidenceSection.dataCategory : '');
    set('examinationType', evidenceSection && evidenceSection.examinationType != null ? evidenceSection.examinationType : '');
    set('chainOfCustody', evidenceSection && evidenceSection.chainOfCustody != null ? evidenceSection.chainOfCustody : '');
    set('supportingParty', evidenceSection && evidenceSection.supportingParty != null ? evidenceSection.supportingParty : '');
    if (caseObj.externalParties) {
      set('partyType', caseObj.externalParties.partyType);
      set('natureOfCommunication', caseObj.externalParties.natureOfCommunication);
      set('encryption', caseObj.externalParties.encryption);
      set('writtenAgreement', caseObj.externalParties.writtenAgreement);
      set('externalConfidentiality', caseObj.externalParties.confidentiality);
    }
    if (caseObj.impact) {
      set('currentStatus', caseObj.impact.currentStatus || 'Open');
      set('purpose', caseObj.impact.purpose);
      set('methodology', caseObj.impact.methodology);
      set('facts', caseObj.impact.facts);
      set('conclusions', caseObj.impact.conclusions);
      set('recommendations', caseObj.impact.recommendations);
      set('recommendationType', caseObj.impact.recommendationType);
      set('disciplinaryAction', caseObj.impact.disciplinaryAction);
      set('impactValue', caseObj.impact.impactValue);
      set('impactCurrency', caseObj.impact.impactCurrency);
      set('recoveryValue', caseObj.impact.recoveryValue);
      set('rcaType', caseObj.impact.rcaType);
      set('rcaSubtype', caseObj.impact.rcaSubtype);
      set('rootCauses', caseObj.impact.rootCauses);
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
    const id = formEl.querySelector('#caseId');
    if (!id || !id.value.trim()) return { ok: false, msg: 'caseId' };
    const reporterType = (formEl.querySelector('#reporterType') || {}).value || '';
    if (reporterType && reporterType !== 'Anonymous') {
      const name = formEl.querySelector('#reporterName');
      const phone = formEl.querySelector('#reporterPhone');
      const email = formEl.querySelector('#reporterEmail');
      if (!name || !name.value.trim()) return { ok: false, msg: 'reporterName' };
      if (!phone || !phone.value.trim()) return { ok: false, msg: 'reporterPhone' };
      if (!email || !email.value.trim()) return { ok: false, msg: 'reporterEmail' };
      if (reporterType === 'Employee') {
        const dept = formEl.querySelector('#reporterDept');
        if (!dept || !dept.value.trim()) return { ok: false, msg: 'reporterDept' };
      }
    }
    const s = formEl.querySelector('#sovereignty');
    const f = formEl.querySelector('#financial');
    const e = formEl.querySelector('#evidence');
    const r = formEl.querySelector('#reputation');
    for (const el of [s, f, e, r]) {
      if (el) {
        const v = parseInt(el.value, 10);
        if (isNaN(v) || v < 1 || v > 5) return { ok: false, msg: 'score' };
      }
    }
    return { ok: true };
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
    validateForm
  };
})(typeof window !== 'undefined' ? window : this);
