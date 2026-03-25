/**
 * Ninja GRC - Main app: init, translations, phase options, score listeners.
 * View logic lives in: list-view, form-view, reports-view, settings-view.
 * Routing: router.js. Helpers: utils.js.
 */
(function () {
  'use strict';

  var $ = window.NinjaApp && window.NinjaApp.$;
  var setView = window.NinjaApp && window.NinjaApp.setView;
  var showMessage = window.NinjaApp && window.NinjaApp.showMessage;
  var loadList = window.NinjaApp && window.NinjaApp.loadList;
  var openCase = window.NinjaApp && window.NinjaApp.openCase;
  var saveCase = window.NinjaApp && window.NinjaApp.saveCase;
  var deleteCase = window.NinjaApp && window.NinjaApp.deleteCase;
  var renderReports = window.NinjaApp && window.NinjaApp.renderReports;
  var renderSettingsDropdownList = window.NinjaApp && window.NinjaApp.renderSettingsDropdownList;
  var openSettingsEditor = window.NinjaApp && window.NinjaApp.openSettingsEditor;
  var saveSettingsEditor = window.NinjaApp && window.NinjaApp.saveSettingsEditor;
  var cancelSettingsEditor = window.NinjaApp && window.NinjaApp.cancelSettingsEditor;
  var settingsEditingKey = function () { return window.NinjaApp && window.NinjaApp.settingsEditingKey && window.NinjaApp.settingsEditingKey(); };

  function applyTranslations() {
    if (typeof NinjaI18n === 'undefined') return;
    var t = NinjaI18n.t.bind(NinjaI18n);
    var ids = {
      appTitle: 'appTitle',
      langAr: 'langAr', langEn: 'langEn',
      navCases: 'navCases', navReports: 'navReports', navSettings: 'navSettings', navNotes: 'navNotes',
      newCase: 'newCase', backToList: 'backToList', save: 'save', cancel: 'cancel', delete: 'delete', edit: 'edit',
      noCases: 'emptyState', caseId: 'labelCaseId', receivedDate: 'labelReceivedDate', complexityDays: 'labelComplexityDays',
      targetCloseDate: 'labelTargetCloseDate', actualCloseDate: 'labelActualCloseDate', phase: 'labelPhase',
      actualDurationDays: 'labelActualDurationDays',
      durationVarianceDays: 'labelDurationVarianceDays',
      sovereignty: 'labelSovereignty', financial: 'labelFinancial', evidence: 'labelEvidence', reputation: 'labelReputation',
      totalScore: 'labelTotalScore', path: 'labelPath',       sectionCaseInfo: 'labelSectionCaseInfo', sectionScoring: 'labelSectionScoring',
      sectionReporter: 'labelSectionReporter', sectionClassification: 'labelSectionClassification',
      sectionScope: 'labelSectionScope', sectionProcess: 'labelSectionProcess', sectionInterview: 'labelSectionInterview',
      sectionEvidence: 'labelSectionEvidence', sectionExternalParties: 'labelSectionExternalParties', sectionImpact: 'labelSectionImpact',
      sectionGrievance: 'labelSectionGrievance',
      scopeType: 'labelScopeType', subScope: 'labelSubScope', escalationLevel: 'labelEscalationLevel', severity: 'labelSeverity',
      investigationLimits: 'labelInvestigationLimits', investigationSubject: 'labelInvestigationSubject', scopeDateFrom: 'labelScopeDateFrom', scopeDateTo: 'labelScopeDateTo',
      scopeEntities: 'labelScopeEntities', scopeConstraints: 'labelScopeConstraints', scopeExclusions: 'labelScopeExclusions', independenceCompliance: 'labelIndependenceCompliance',
      regulatoryRef: 'labelRegulatoryRef', regulatoryRefArticle: 'labelRegulatoryRefArticle', evidenceHashValue: 'labelEvidenceHashValue',
      formChecklistHint: 'labelFormChecklistHint', qualityReviewHint: 'labelQualityReviewHint', deficiencies: 'labelDeficiencies', technicalViolation: 'labelTechnicalViolation', fiveWhys: 'labelFiveWhys', fiveWhys1: 'labelFiveWhys1', fiveWhys2: 'labelFiveWhys2', fiveWhys3: 'labelFiveWhys3', fiveWhys4: 'labelFiveWhys4', fiveWhys5: 'labelFiveWhys5',
      rootCauseClass: 'labelRootCauseClass', resultingImpact: 'labelResultingImpact', regulatoryImpact: 'labelRegulatoryImpact',
      financialOperationalImpact: 'labelFinancialOperationalImpact', reputationLegalImpact: 'labelReputationLegalImpact',
      assetRecovery: 'labelAssetRecovery', recoveryOpportunityValue: 'labelRecoveryOpportunityValue', recoveryStatus: 'labelRecoveryStatus', recoveryPath: 'labelRecoveryPath',
      amountRecovered: 'labelAmountRecovered', netSavings: 'labelNetSavings', assetRecoveryNotes: 'labelAssetRecoveryNotes', strategicRecs: 'labelStrategicRecs',
      strategicRecsIntro: 'strategicRecsIntro', correctiveActions: 'labelCorrectiveActions', preventiveActions: 'labelPreventiveActions', closureReasons: 'labelClosureReasons',
      closureObjectiveReasons: 'labelClosureObjectiveReasons', closureTechnicalReasons: 'labelClosureTechnicalReasons', rcaGapClosed: 'labelRcaGapClosed',
      accountabilityDetails: 'labelAccountabilityDetails', assetRecoveryAmount: 'labelAssetRecoveryAmount', whistleblowerIncentive: 'labelWhistleblowerIncentive',
      grievanceDate: 'labelGrievanceDate', grievanceGrounds: 'labelGrievanceGrounds', grievanceAcceptance: 'labelGrievanceAcceptance', grievanceDecisionAmendment: 'labelGrievanceDecisionAmendment',
      sectionFormChecklist: 'labelSectionFormChecklist', sectionQualityReview: 'labelSectionQualityReview', sectionWhistleblower: 'labelSectionWhistleblower',
      whistleblowerCashReward: 'labelWhistleblowerCashReward', whistleblowerThanksLetter: 'labelWhistleblowerThanksLetter', whistleblowerNoReward: 'labelWhistleblowerNoReward', whistleblowerNoReason: 'labelWhistleblowerNoReason', whistleblowerProtectionPlan: 'labelWhistleblowerProtectionPlan',
      finalDecisionActions: 'labelFinalDecisionActions', decisionIntro: 'labelDecisionIntro', decisionPartA: 'labelDecisionPartA', decisionPartB: 'labelDecisionPartB',
      decisionPartASub: 'labelDecisionPartASub', decisionPartBSub: 'labelDecisionPartBSub', formChecklistNotes: 'labelFormChecklistNotes', qualityReviewNotes: 'labelQualityReviewNotes',
      impactAccountableEntities: 'labelImpactAccountableEntities',
      impactAccountableEntitiesHint: 'labelImpactAccountableEntitiesHint',
      strategicRecMultiselect: 'labelStrategicRecMultiselect', strategicOptAssetRecovery: 'labelStrategicOptAssetRecovery', strategicOptReferProsecution: 'labelStrategicOptReferProsecution',
      strategicArt80Title: 'labelStrategicArt80Title', strategicArt80EmployerAssault: 'labelStrategicArt80EmployerAssault', strategicArt80Obligations: 'labelStrategicArt80Obligations',
      strategicArt80Misconduct: 'labelStrategicArt80Misconduct', strategicArt80IntentionalLoss: 'labelStrategicArt80IntentionalLoss', strategicArt80Forgery: 'labelStrategicArt80Forgery',
      strategicArt80Probation: 'labelStrategicArt80Probation', strategicArt80Absence: 'labelStrategicArt80Absence', strategicArt80PositionAbuse: 'labelStrategicArt80PositionAbuse',
      strategicArt80TradeSecrets: 'labelStrategicArt80TradeSecrets', strategicInvestigationClosure: 'labelStrategicInvestigationClosure',
      strategicClosureNoProof: 'labelStrategicClosureNoProof', strategicClosureMalicious: 'labelStrategicClosureMalicious', strategicClosurePartialAdmin: 'labelStrategicClosurePartialAdmin', strategicClosureUnable: 'labelStrategicClosureUnable',
      fdArt80: 'labelFdArt80', fdDeduction: 'labelFdDeduction', fdFinalWarningTransfer: 'labelFdFinalWarningTransfer', fdReferAuthorities: 'labelFdReferAuthorities', fdRepayAmount: 'labelFdRepayAmount',
      fdRevokeAccess: 'labelFdRevokeAccess', fdSalaryStopContinue: 'labelFdSalaryStopContinue', fdCloseInvestigation: 'labelFdCloseInvestigation',
      fdDeptHR: 'labelFdDeptHR', fdHrRestore: 'labelFdHrRestore', fdHrCancelSuspension: 'labelFdHrCancelSuspension', fdHrRecord: 'labelFdHrRecord',
      fdDeptTech: 'labelFdDeptTech', fdTechRestoreAccess: 'labelFdTechRestoreAccess', fdTechStopMonitoring: 'labelFdTechStopMonitoring',
      fdDeptPdpl: 'labelFdDeptPdpl', fdPdplReturnAssets: 'labelFdPdplReturnAssets', fdPdplDestroy: 'labelFdPdplDestroy', fdPdplArchive: 'labelFdPdplArchive',
      interviewMulti: 'labelInterviewMulti', interview1: 'labelInterview1', interview2: 'labelInterview2', interview3: 'labelInterview3',
      interviewMinutes: 'labelInterviewMinutes',
      investigatingBody: 'labelInvestigatingBody', escalationJustification: 'labelEscalationJustification',
      precautionaryMeasures: 'labelPrecautionaryMeasures', teamMembers: 'labelTeamMembers',
      caseAcceptanceStatus: 'labelCaseAcceptanceStatus', legalPrivilege: 'labelLegalPrivilege', legalPrivilegeJustification: 'labelLegalPrivilegeJustification', clearance: 'labelClearance',
      precautionaryMeasuresOther: 'labelPrecautionaryMeasuresOther',
      legalPrivilegeHint: 'labelLegalPrivilegeHint', legalPrivilegeParties: 'labelLegalPrivilegeParties', legalPrivilegeRegulatory: 'labelLegalPrivilegeRegulatory',
      legalPrivilegeSovereign: 'labelLegalPrivilegeSovereign', legalPrivilegeProtection: 'labelLegalPrivilegeProtection',
      internalDisciplinary: 'labelInternalDisciplinary', externalReferral: 'labelExternalReferral',
      independenceSigned: 'labelIndependenceSigned', noConflictDisclosed: 'labelNoConflictDisclosed', securityClearanceObtained: 'labelSecurityClearanceObtained',
      rootCauseHumanCb: 'labelRootCauseHumanCb', rootCauseOrgCb: 'labelRootCauseOrgCb', rootCauseTechCb: 'labelRootCauseTechCb',
      closureNoViolationCb: 'labelClosureNoViolationCb', closureMaliciousCb: 'labelClosureMaliciousCb', closurePartialCb: 'labelClosurePartialCb', closureFileClosedCb: 'labelClosureFileClosedCb',
      termImmediate: 'labelTermImmediate', deduction: 'labelDeduction', finalWarning: 'labelFinalWarning',
      referralProsecution: 'labelReferralProsecution', referralNazaha: 'labelReferralNazaha', referralSecurity: 'labelReferralSecurity',
      scopeAmendmentReason: 'labelScopeAmendmentReason', interviewClassification: 'labelInterviewClassification',
      rightsNotified: 'labelRightsNotified',       documentationMethod: 'labelDocumentationMethod', receiptResponseStatus: 'labelReceiptResponseStatus',
      interviewDate: 'labelInterviewDate', interviewDuration: 'labelInterviewDuration', summonsId: 'labelSummonsId', summonsStatus: 'labelSummonsStatus',
      formOfEvidence: 'labelFormOfEvidence', dataCategory: 'labelDataCategory', examinationType: 'labelExaminationType',
      chainOfCustody: 'labelChainOfCustody', supportingParty: 'labelSupportingParty',
      partyType: 'labelPartyType', natureOfCommunication: 'labelNatureOfCommunication', encryption: 'labelEncryption',
      writtenAgreement: 'labelWrittenAgreement', externalConfidentiality: 'labelExternalConfidentiality',
      purpose: 'labelPurpose', methodology: 'labelMethodology', facts: 'labelFacts', conclusions: 'labelConclusions',
      recommendations: 'labelRecommendations', recommendationType: 'labelRecommendationType', disciplinaryAction: 'labelDisciplinaryAction',
      impactValue: 'labelImpactValue', impactCurrency: 'labelImpactCurrency', recoveryValue: 'labelRecoveryValue',
      rcaType: 'labelRcaType', rcaSubtype: 'labelRcaSubtype', rootCauses: 'labelRootCauses',
      filterControlRecs: 'labelFilterControlRecs',
      exportFilteredOnly: 'labelExportFilteredOnly',
      searchCaseId: 'searchCaseId', dateFrom: 'labelDateFrom', dateTo: 'labelDateTo', skipToMain: 'skipLink',
      showTip: 'labelShowTip',
      hideTip: 'labelHideTip',
      city: 'labelGeographicCity',
      geographicCityOther: 'labelGeographicCityOther',
      pdplAction: 'labelPdplAction',
      reporterStatus: 'labelReporterStatus',
      mandatoryLevel: 'labelMandatoryLevel',
      disciplinaryActionOther: 'labelDisciplinaryActionOther',
      name: 'labelName', phone: 'labelPhone', email: 'labelEmail', notes: 'labelNotes', type: 'labelType',
      employee: 'optEmployee', customer: 'optCustomer', vendor: 'optVendor', anonymous: 'optAnonymous',
      department: 'labelDepartment', source: 'labelSource', hotline: 'optHotline', walkIn: 'optWalkIn', website: 'optWebsite',
      reportType: 'labelReportType', internal: 'optInternal', external: 'optExternal', institutional: 'optInstitutional', thirdParty: 'optThirdParty',
      geographic: 'labelGeographic', ksa: 'optKSA', currentStatus: 'labelCurrentStatus',
      statusOpen: 'optStatusOpen', statusInPrep: 'optStatusInPrep', statusInProgress: 'optStatusInProgress', statusDraft: 'optStatusDraft', statusClosed: 'optStatusClosed',
      exportJson: 'btnExportJson', exportCsv: 'btnExportCsv', filterByPath: 'filterByPath', filterByPhase: 'filterByPhase', filterByStatus: 'filterByStatus', all: 'all',
      saved: 'saved', deleted: 'deleted', validationRequired: 'validationRequired', validationScore: 'validationScore',
      settingsTitle: 'settingsTitle', settingsIntro: 'settingsIntro', settingsEditOptions: 'settingsEditorTitle',
      settingsTipsHeading: 'settingsTipsHeading', settingsTipsDesc: 'settingsTipsDesc', prefShowTipsControls: 'labelPrefShowTipsControls',
      settingsAddOption: 'settingsEditorAdd', settingsRestoreDefaults: 'settingsEditorRestore'
    };
    Object.keys(ids).forEach(function (key) {
      var el = $(ids[key]);
      if (el && el.id !== 'emptyState') {
        var text = t(key);
        if (text !== key) {
          if (el.tagName === 'INPUT' && el.type === 'text' && key === 'searchCaseId') el.placeholder = text;
          else if (el.tagName === 'LABEL' || el.tagName === 'TH' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'SPAN' || el.tagName === 'LEGEND' || el.tagName === 'STRONG' || el.tagName === 'P') el.textContent = text;
          else if (el.tagName === 'BUTTON' || el.tagName === 'A') el.textContent = text;
          else if (el.tagName === 'OPTION') el.textContent = text;
        }
      }
    });
    document.querySelectorAll('.tip-label').forEach(function (span) {
      var tipKey = span.closest('.btn-toggle-tip') && span.closest('.btn-toggle-tip').getAttribute('data-tip');
      var tipEl = tipKey && document.querySelector('.section-tip[data-tip="' + tipKey + '"]');
      var isVisible = tipEl && tipEl.classList.contains('is-visible');
      span.textContent = isVisible ? t('hideTip') : t('showTip');
    });
    var emptyEl = $('emptyState');
    if (emptyEl) emptyEl.textContent = t('noCases');
    var titleEl = $('appTitle');
    if (titleEl) titleEl.textContent = t('appTitle');
    if (typeof document !== 'undefined' && document.title !== undefined) document.title = t('appTitle');
    var listTitle = $('listTitle');
    if (listTitle) listTitle.textContent = t('navCases');
    var reportsTitle = $('reportsTitle');
    if (reportsTitle) reportsTitle.textContent = t('reportsTitle');
    var notesTitle = $('notesTitle');
    if (notesTitle) notesTitle.textContent = t('navNotes');
    var notesIntroEl = $('notesIntro');
    if (notesIntroEl) notesIntroEl.textContent = t('notesIntro');
    var settingsTitleEl = $('settingsTitle');
    if (settingsTitleEl) settingsTitleEl.textContent = t('settingsTitle');
    var settingsIntroEl = $('settingsIntro');
    if (settingsIntroEl) settingsIntroEl.textContent = t('settingsIntro');
    ['btnPrintReport', 'btnPrintListReport', 'btnPrintReports'].forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = t('printReport');
    });
    var backupHeading = $('settingsBackupHeading');
    if (backupHeading) backupHeading.textContent = t('backupTransfer');
    var btnExportSettings = $('btnExportSettings');
    if (btnExportSettings) btnExportSettings.textContent = t('exportSettings');
    var btnImportSettings = $('btnImportSettings');
    if (btnImportSettings) btnImportSettings.textContent = t('importSettings');
    var btnExportAll = $('btnExportAll');
    if (btnExportAll) btnExportAll.textContent = t('exportAll');
    var btnImportAll = $('btnImportAll');
    if (btnImportAll) btnImportAll.textContent = t('importAll');
    var btnExportExcel = $('btnExportExcel');
    if (btnExportExcel) btnExportExcel.textContent = t('exportExcel');
    var obstAlert = $('obstructionAlert');
    if (obstAlert) obstAlert.textContent = t('obstructionAlert');
    document.querySelectorAll('[data-placeholder-key]').forEach(function (el) {
      var key = el.getAttribute('data-placeholder-key');
      if (key) el.placeholder = t(key);
    });
    var hintNetSavings = $('hintNetSavings');
    if (hintNetSavings) hintNetSavings.textContent = t('placeholderAssetRecoveryNotes') || '';
    var strategicIntro = $('strategicRecsIntro');
    if (strategicIntro) strategicIntro.textContent = t('strategicRecsIntro') || '';
    document.querySelectorAll('option[data-i18n-option]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-option');
      if (key) el.textContent = t(key);
    });
    if (window.NinjaSettings && NinjaSettings.populateAllSelects) NinjaSettings.populateAllSelects();
    else fillPhaseOptions();
    if (window.NinjaForms && NinjaForms.refreshAllEvidenceRowSelects) NinjaForms.refreshAllEvidenceRowSelects();
    if (window.NinjaForms && NinjaForms.refreshAllInterviewSessionLabels) NinjaForms.refreshAllInterviewSessionLabels();
    if (window.NinjaForms && NinjaForms.refreshExternalPartyLabels) NinjaForms.refreshExternalPartyLabels();
    if (window.NinjaForms && NinjaForms.refreshAccountableEntityLabels) NinjaForms.refreshAccountableEntityLabels();
    if (window.NinjaForms && NinjaForms.refreshAllScopeDynamicLabels) NinjaForms.refreshAllScopeDynamicLabels();
    var formNavLinks = document.querySelectorAll('.form-tab[role="tab"]');
    var sectionKeys = ['sectionCaseInfo','sectionScoring','sectionReporter','sectionClassification','sectionScope','sectionProcess','sectionInterview','sectionEvidence','sectionExternalParties','sectionImpact','sectionReview','sectionGrievance'];
    formNavLinks.forEach(function (link, i) {
      if (!sectionKeys[i]) return;
      var labelEl = link.querySelector('.form-tab-label');
      if (labelEl) labelEl.textContent = t(sectionKeys[i]);
      else link.textContent = t(sectionKeys[i]);
    });
    var formSectionTitleEl = $('formSectionTitle');
    if (formSectionTitleEl) {
      var activeTab = document.querySelector('.form-tab[role="tab"][aria-selected="true"]');
      var activeSection = activeTab && activeTab.getAttribute('data-section');
      var idx = activeSection ? sectionKeys.indexOf(activeSection) : 0;
      if (idx >= 0 && sectionKeys[idx]) formSectionTitleEl.textContent = t(sectionKeys[idx]);
    }
    var formView = $('viewForm');
    var main = document.getElementById('main');
    var isFormView = formView && main && main.getAttribute('data-current-view') === 'form';
    if (formView && isFormView && window.NinjaApp && typeof window.NinjaApp.updateFormContextDisplay === 'function') {
      window.NinjaApp.updateFormContextDisplay();
    }
    var saveEditorBtn = $('settingsEditorSave');
    if (saveEditorBtn) saveEditorBtn.textContent = t('save');
    var cancelEditorBtn = $('settingsEditorCancel');
    if (cancelEditorBtn) cancelEditorBtn.textContent = t('cancel');
  }

  function fillPhaseOptions() {
    var phaseSelect = $('currentPhase');
    var filterPhase = $('filterPhase');
    if (typeof NinjaI18n === 'undefined') return;
    var phases = NinjaI18n.getPhases();
    if (phaseSelect && phases.length) {
      phaseSelect.innerHTML = phases.map(function (p) { return '<option value="' + p.id + '">' + (p.id + '. ' + (NinjaI18n.getLang() === 'ar' ? p.ar : p.en)) + '</option>'; }).join('');
    }
    if (filterPhase && phases.length) {
      var opts = '<option value="">' + NinjaI18n.t('all') + '</option>' +
        phases.map(function (p) { return '<option value="' + p.id + '">' + (p.id + '. ' + (NinjaI18n.getLang() === 'ar' ? p.ar : p.en)) + '</option>'; }).join('');
      filterPhase.innerHTML = opts;
    }
    var filterStatus = $('filterStatus');
    if (filterStatus && NinjaI18n) {
      filterStatus.innerHTML =
        '<option value="">' + NinjaI18n.t('all') + '</option>' +
        '<option value="Open">' + NinjaI18n.t('statusOpen') + '</option>' +
        '<option value="In preparation">' + NinjaI18n.t('statusInPrep') + '</option>' +
        '<option value="In progress">' + NinjaI18n.t('statusInProgress') + '</option>' +
        '<option value="Draft report">' + NinjaI18n.t('statusDraft') + '</option>' +
        '<option value="Closed">' + NinjaI18n.t('statusClosed') + '</option>';
    }
    var filterPath = $('filterPath');
    if (filterPath && NinjaI18n) {
      filterPath.innerHTML =
        '<option value="">' + NinjaI18n.t('allPaths') + '</option>' +
        '<option value="green">' + NinjaI18n.t('pathGreen') + '</option>' +
        '<option value="yellow">' + NinjaI18n.t('pathYellow') + '</option>' +
        '<option value="red">' + NinjaI18n.t('pathRed') + '</option>';
    }
  }

  function setupScoreListeners() {
    var form = $('caseForm');
    if (!form) return;
    ['sovereignty', 'financial', 'evidence', 'reputation'].forEach(function (id) {
      var e = form.querySelector('#' + id);
      if (!e) return;
      var upd = function () { NinjaForms.updateScoreDisplay(form); };
      e.addEventListener('input', upd);
      e.addEventListener('change', upd);
    });
  }

  function updateInterviewDuration() {
    var received = $('receivedDate');
    var interview = $('interviewDate');
    if (!interview) {
      var container = document.getElementById('interviewSessionsContainer');
      if (container) {
        var firstRow = container.querySelector('[data-interview-session]');
        if (firstRow) interview = firstRow.querySelector('input[data-int-k="interviewDate"]');
      }
    }
    var out = $('interviewDurationDays');
    if (!received || !out) return;
    var r = received.value ? new Date(received.value) : null;
    var i = interview && interview.value ? new Date(interview.value) : null;
    if (r && i && !isNaN(r.getTime()) && !isNaN(i.getTime())) {
      var days = Math.round((i - r) / (24 * 60 * 60 * 1000));
      out.textContent = days >= 0 ? String(days) : '—';
    } else {
      out.textContent = '—';
    }
  }

  function formatDateInputValue(d) {
    if (!d || isNaN(d.getTime())) return '';
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }

  function parseDateInputValue(v) {
    if (!v) return null;
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  function updateCloseDateComputations() {
    var receivedEl = document.getElementById('receivedDate');
    var daysEl = document.getElementById('complexityDays');
    var targetEl = document.getElementById('targetCloseDate');
    var actualEl = document.getElementById('actualCloseDate');
    var actualDurEl = document.getElementById('actualDurationDays');
    var varianceEl = document.getElementById('durationVarianceDays');
    var varianceNotice = document.getElementById('durationVarianceNotice');
    if (!receivedEl) return;

    var r = parseDateInputValue(receivedEl.value);
    var days = daysEl ? (parseInt(daysEl.value, 10) || 0) : 0;

    if (targetEl) {
      if (r && days >= 0) {
        var t = new Date(r.getTime());
        t.setDate(t.getDate() + days);
        targetEl.value = formatDateInputValue(t);
      } else {
        targetEl.value = '';
      }
    }

    if (actualDurEl) {
      var a = actualEl ? parseDateInputValue(actualEl.value) : null;
      if (r && a) {
        var diff = Math.round((a - r) / (24 * 60 * 60 * 1000));
        actualDurEl.value = diff >= 0 ? String(diff) : '';
      } else {
        actualDurEl.value = '';
      }
    }

    if (varianceEl) {
      var actualDays = actualDurEl && actualDurEl.value !== '' ? (parseInt(actualDurEl.value, 10) || 0) : null;
      var targetDays = daysEl ? (parseInt(daysEl.value, 10) || 0) : null;
      if (actualDays != null && targetDays != null && r && actualEl && parseDateInputValue(actualEl.value)) {
        var v = actualDays - targetDays;
        varianceEl.value = String(v);
        if (varianceNotice && typeof NinjaI18n !== 'undefined' && NinjaI18n.t) {
          varianceNotice.classList.add('duration-variance-notice');
          varianceNotice.classList.remove('is-on-time', 'is-ahead', 'is-delayed');
          if (v === 0) varianceNotice.textContent = NinjaI18n.t('durationVarianceOnTime');
          else if (v < 0) varianceNotice.textContent = (NinjaI18n.t('durationVarianceAhead') || '').replace('(__)', String(Math.abs(v)));
          else varianceNotice.textContent = (NinjaI18n.t('durationVarianceDelayed') || '').replace('(__)', String(v));
          if (v === 0) varianceNotice.classList.add('is-on-time');
          else if (v < 0) varianceNotice.classList.add('is-ahead');
          else varianceNotice.classList.add('is-delayed');
        } else if (varianceNotice) {
          varianceNotice.classList.add('duration-variance-notice');
          varianceNotice.classList.remove('is-on-time', 'is-ahead', 'is-delayed');
          varianceNotice.textContent = v === 0 ? 'On target.' : v < 0 ? ('Ahead by ' + Math.abs(v) + ' days.') : ('Delayed by ' + v + ' days.');
          if (v === 0) varianceNotice.classList.add('is-on-time');
          else if (v < 0) varianceNotice.classList.add('is-ahead');
          else varianceNotice.classList.add('is-delayed');
        }
      } else {
        varianceEl.value = '';
        if (varianceNotice) {
          varianceNotice.textContent = '';
          varianceNotice.classList.remove('duration-variance-notice', 'is-on-time', 'is-ahead', 'is-delayed');
        }
      }
    }
  }

  function toggleScopeAmendmentReason() {
    var sel = document.getElementById('caseAcceptanceStatus');
    var wrap = document.getElementById('scopeAmendmentReasonWrap');
    if (!sel || !wrap) return;
    wrap.style.display = (sel.value === 'Scope amended') ? '' : 'none';
  }

  function togglePrecautionaryOther() {
    var sel = document.getElementById('precautionaryMeasures');
    var wrap = document.getElementById('precautionaryMeasuresOtherWrap');
    if (!sel || !wrap) return;
    wrap.style.display = (sel.value === 'OtherPrecautionary') ? 'block' : 'none';
  }

  function toggleStrategicAssetRecoveryAmount() {
    var cb = document.getElementById('strategicOptAssetRecovery');
    var wrap = document.getElementById('strategicAssetRecoveryAmountWrap');
    var input = document.getElementById('assetRecoveryAmount');
    if (!cb || !wrap) return;
    var show = !!cb.checked;
    wrap.style.display = show ? 'block' : 'none';
    if (input) input.disabled = !show;
  }

  function toggleSelectOtherField(selectId, wrapId, inputId) {
    var sel = document.getElementById(selectId);
    var wrap = document.getElementById(wrapId);
    var input = document.getElementById(inputId);
    if (!sel || !wrap) return;
    var show = (sel.value || '').trim() === 'Other';
    wrap.style.display = show ? 'block' : 'none';
    if (input) input.disabled = !show;
  }

  function toggleOtherFreeTextFields() {
    toggleSelectOtherField('geographicCity', 'geographicCityOtherWrap', 'geographicCityOther');
    toggleSelectOtherField('disciplinaryAction', 'disciplinaryActionOtherWrap', 'disciplinaryActionOther');
  }

  function setupInterviewWorkflow() {
    var form = $('caseForm');
    if (!form) return;
    var prec = form.querySelector('#precautionaryMeasures');
    if (prec) {
      prec.addEventListener('change', togglePrecautionaryOther);
      togglePrecautionaryOther();
    }
    var received = form.querySelector('#receivedDate');
    var interview = form.querySelector('#interviewDate');
    var sessionsContainer = form.querySelector('#interviewSessionsContainer');
    if (received) received.addEventListener('change', updateInterviewDuration);
    if (received) received.addEventListener('change', updateCloseDateComputations);
    var complexity = form.querySelector('#complexityDays');
    if (complexity) complexity.addEventListener('input', updateCloseDateComputations);
    if (complexity) complexity.addEventListener('change', updateCloseDateComputations);
    var actualClose = form.querySelector('#actualCloseDate');
    if (actualClose) actualClose.addEventListener('change', updateCloseDateComputations);
    if (interview) interview.addEventListener('change', updateInterviewDuration);
    if (sessionsContainer) sessionsContainer.addEventListener('change', function (e) {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-int-k') === 'interviewDate') updateInterviewDuration();
    });
    updateCloseDateComputations();
    var receipt = form.querySelector('#receiptResponseStatus');
    var obstAlert = form.querySelector('#obstructionAlert');
    if (receipt && obstAlert) {
      receipt.addEventListener('change', function () {
        var v = (receipt.value || '').trim();
        var isObstruction = v === 'Refused to receive' || v === 'Unjustified absence';
        obstAlert.style.display = isObstruction ? 'block' : 'none';
        if (isObstruction && typeof NinjaI18n !== 'undefined' && NinjaI18n.t) obstAlert.textContent = NinjaI18n.t('obstructionAlert');
      });
    }
    var caseAccept = form.querySelector('#caseAcceptanceStatus');
    if (caseAccept) {
      caseAccept.addEventListener('change', toggleScopeAmendmentReason);
      toggleScopeAmendmentReason();
    }
    var legalPriv = form.querySelector('#legalPrivilege');
    var legalPrivJust = form.querySelector('#legalPrivilegeJustificationGroup');
    if (legalPriv && legalPrivJust) {
      function toggleLegalPrivJust() { legalPrivJust.style.display = (legalPriv.value || '').trim() === 'Yes' ? 'block' : 'none'; }
      legalPriv.addEventListener('change', toggleLegalPrivJust);
      toggleLegalPrivJust();
    }
    var recType = form.querySelector('#recommendationType');
    var closureSec = form.querySelector('#impactClosureSection');
    var accountSec = form.querySelector('#impactAccountabilitySection');
    if (recType && closureSec && accountSec) {
      function toggleRecSections() {
        var v = (recType.value || '').trim();
        closureSec.style.display = v === 'Closure' ? 'block' : 'none';
        accountSec.style.display = v === 'Referral' ? 'block' : 'none';
      }
      recType.addEventListener('change', toggleRecSections);
      toggleRecSections();
    }
    var strategicAssetRecovery = form.querySelector('#strategicOptAssetRecovery');
    if (strategicAssetRecovery) {
      strategicAssetRecovery.addEventListener('change', toggleStrategicAssetRecoveryAmount);
      toggleStrategicAssetRecoveryAmount();
    }
    var cityOtherSel = form.querySelector('#geographicCity');
    if (cityOtherSel) {
      cityOtherSel.addEventListener('change', toggleOtherFreeTextFields);
    }
    var countrySel = form.querySelector('#geographic');
    if (countrySel) {
      countrySel.addEventListener('change', toggleOtherFreeTextFields);
    }
    var disciplinaryOtherSel = form.querySelector('#disciplinaryAction');
    if (disciplinaryOtherSel) {
      disciplinaryOtherSel.addEventListener('change', toggleOtherFreeTextFields);
    }
    toggleOtherFreeTextFields();
  }
  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.updateInterviewDuration = updateInterviewDuration;
  window.NinjaApp.togglePrecautionaryOther = togglePrecautionaryOther;
  window.NinjaApp.toggleScopeAmendmentReason = toggleScopeAmendmentReason;
  window.NinjaApp.toggleStrategicAssetRecoveryAmount = toggleStrategicAssetRecoveryAmount;
  window.NinjaApp.toggleOtherFreeTextFields = toggleOtherFreeTextFields;
  window.NinjaApp.updateCloseDateComputations = updateCloseDateComputations;

  function init() {
    function setNavActiveFromPage() {
      var hash = (window.location.hash || '').replace(/^#/, '');
      if (hash === 'scoring-reference') hash = 'notes';
      var pathname = (window.location.pathname || '').toLowerCase();
      var active = 'list';
      if (hash === 'reports' || pathname.indexOf('reports') !== -1) active = 'reports';
      else if (hash === 'settings' || pathname.indexOf('settings') !== -1) active = 'settings';
      else if (hash === 'notes' || pathname.indexOf('notes') !== -1) active = 'notes';
      else if (hash === 'list' || hash === '') active = 'list';
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        a.classList.remove('active');
        var href = (a.getAttribute('href') || '');
        if (href.indexOf(active) !== -1) a.classList.add('active');
      });
      document.querySelectorAll('.nav-tab[role="tab"]').forEach(function (t) {
        var v = t.getAttribute('data-view');
        t.classList.toggle('active', v === active);
        t.setAttribute('aria-selected', v === active ? 'true' : 'false');
      });
    }

    function bindNavAndShowList() {
      var viewListEl = document.getElementById('viewList');
      if (!viewListEl) return;
      if (loadList) loadList();
      var hash = (window.location.hash || '').replace(/^#/, '');
      if (hash === 'scoring-reference') hash = 'notes';
      var initialView = hash || 'list';
      if (!document.getElementById('viewReports') && initialView === 'reports') initialView = 'list';
      if (!document.getElementById('viewSettings') && initialView === 'settings') initialView = 'list';
      if (!document.getElementById('viewNotes') && initialView === 'notes') initialView = 'list';
      var setViewFn = window.NinjaApp && window.NinjaApp.setView;
      if (setViewFn) setViewFn(initialView);
    }

    function bindTabClicks() {
      document.querySelectorAll('.nav-tab[role="tab"]').forEach(function (tab) {
        tab.addEventListener('click', function () {
          var v = tab.getAttribute('data-view');
          if (v && window.NinjaApp && window.NinjaApp.setView) window.NinjaApp.setView(v);
        });
      });
      var logo = document.getElementById('appLogo');
      if (logo) logo.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.NinjaApp && window.NinjaApp.setView) window.NinjaApp.setView('list');
      });
    }

    function onReady() {
      setNavActiveFromPage();
      if (typeof NinjaI18n !== 'undefined' && NinjaI18n.applyDirLang) NinjaI18n.applyDirLang();
      if (typeof applyTranslations === 'function') applyTranslations();
      var tipsPref = document.getElementById('prefShowTipsControls');
      if (tipsPref) {
        try {
          tipsPref.checked = (typeof localStorage !== 'undefined') && localStorage.getItem('ninja-grc-show-tips-controls') === 'true';
        } catch (e) {
          tipsPref.checked = false;
        }
        tipsPref.addEventListener('change', function () {
          try { if (typeof localStorage !== 'undefined') localStorage.setItem('ninja-grc-show-tips-controls', tipsPref.checked ? 'true' : 'false'); } catch (e) {}
          if (window.NinjaTips && NinjaTips.applyTipsControlsPreference) NinjaTips.applyTipsControlsPreference();
        });
      }
      var p = (window.NinjaSettings && NinjaSettings.init) ? NinjaSettings.init() : Promise.resolve();
      return p.then(function () {
        if ($('langAr')) $('langAr').addEventListener('click', function () {
          if (NinjaI18n) { NinjaI18n.setLang('ar'); NinjaI18n.applyDirLang && NinjaI18n.applyDirLang(); }
          $('langAr').classList.add('active');
          $('langEn').classList.remove('active');
          applyTranslations();
          if (window.NinjaTips && NinjaTips.refreshTips) NinjaTips.refreshTips();
          if (window.NinjaSettings && NinjaSettings.populateAllSelects) NinjaSettings.populateAllSelects();
          if (window.NinjaForms && NinjaForms.refreshAllEvidenceRowSelects) NinjaForms.refreshAllEvidenceRowSelects();
    if (window.NinjaForms && NinjaForms.refreshAllInterviewSessionLabels) NinjaForms.refreshAllInterviewSessionLabels();
    if (window.NinjaForms && NinjaForms.refreshExternalPartyLabels) NinjaForms.refreshExternalPartyLabels();
    if (window.NinjaForms && NinjaForms.refreshAccountableEntityLabels) NinjaForms.refreshAccountableEntityLabels();
    if (window.NinjaForms && NinjaForms.refreshAllScopeDynamicLabels) NinjaForms.refreshAllScopeDynamicLabels();
          if (loadList && document.getElementById('viewList')) loadList();
        });
        if ($('langEn')) $('langEn').addEventListener('click', function () {
          if (NinjaI18n) { NinjaI18n.setLang('en'); NinjaI18n.applyDirLang && NinjaI18n.applyDirLang(); }
          $('langEn').classList.add('active');
          $('langAr').classList.remove('active');
          applyTranslations();
          if (window.NinjaTips && NinjaTips.refreshTips) NinjaTips.refreshTips();
          if (window.NinjaSettings && NinjaSettings.populateAllSelects) NinjaSettings.populateAllSelects();
          if (window.NinjaForms && NinjaForms.refreshAllEvidenceRowSelects) NinjaForms.refreshAllEvidenceRowSelects();
    if (window.NinjaForms && NinjaForms.refreshAllInterviewSessionLabels) NinjaForms.refreshAllInterviewSessionLabels();
    if (window.NinjaForms && NinjaForms.refreshExternalPartyLabels) NinjaForms.refreshExternalPartyLabels();
    if (window.NinjaForms && NinjaForms.refreshAccountableEntityLabels) NinjaForms.refreshAccountableEntityLabels();
    if (window.NinjaForms && NinjaForms.refreshAllScopeDynamicLabels) NinjaForms.refreshAllScopeDynamicLabels();
          if (loadList && document.getElementById('viewList')) loadList();
        });
        if (NinjaI18n) {
          var lang = NinjaI18n.getLang();
          if ($('langAr')) $('langAr').classList.toggle('active', lang === 'ar');
          if ($('langEn')) $('langEn').classList.toggle('active', lang === 'en');
        }
        if ($('btnNewCase')) $('btnNewCase').addEventListener('click', function () { if (openCase) openCase(null); });
        if ($('btnBackToList')) $('btnBackToList').addEventListener('click', function () { var goBack = window.NinjaApp && window.NinjaApp.goBackToList; if (goBack) goBack(); else if (setView) setView('list'); });
        if ($('btnSave')) $('btnSave').addEventListener('click', function (e) { e.preventDefault(); if (saveCase) saveCase(); });
        if ($('btnCancel')) $('btnCancel').addEventListener('click', function () { var goBack = window.NinjaApp && window.NinjaApp.goBackToList; if (goBack) goBack(); else if (setView) setView('list'); });
        if ($('btnDelete')) $('btnDelete').addEventListener('click', function () { if (deleteCase) deleteCase(); });
        if ($('btnPrintReport')) $('btnPrintReport').addEventListener('click', function () {
          var form = $('caseForm');
          if (form && window.NinjaApp && window.NinjaApp.printCases) {
            var caseObj = NinjaForms.collectForm(form);
            if (caseObj) window.NinjaApp.printCases([caseObj]);
          }
        });
        if ($('caseForm')) {
          $('caseForm').addEventListener('submit', function (e) { e.preventDefault(); if (saveCase) saveCase(); });
          $('caseForm').addEventListener('input', function () {
            if ($('caseForm') && window.NinjaForms && NinjaForms.updateScoreDisplay) NinjaForms.updateScoreDisplay($('caseForm'));
            if (window.NinjaTips && NinjaTips.updateConditionalTips) NinjaTips.updateConditionalTips($('caseForm'));
          });
          var reporterTypeEl = $('reporterType');
          if (reporterTypeEl) reporterTypeEl.addEventListener('change', function () {
            var v = (reporterTypeEl.value || '').trim();
            var notAnonymous = v && v !== 'Anonymous';
            var isEmployee = v === 'Employee';
            ['reporterName', 'reporterPhone', 'reporterEmail'].forEach(function (id) {
              var el = document.getElementById(id);
              if (el) el.required = notAnonymous;
            });
            var deptEl = document.getElementById('reporterDept');
            if (deptEl) deptEl.required = isEmployee;
          });
        }
        if ($('filterPath')) $('filterPath').addEventListener('change', function () { if (renderReports) renderReports(); });
        if ($('filterPhase')) $('filterPhase').addEventListener('change', function () { if (renderReports) renderReports(); });
        if ($('filterStatus')) $('filterStatus').addEventListener('change', function () { if (renderReports) renderReports(); });
        if ($('filterDateFrom')) $('filterDateFrom').addEventListener('change', function () { if (renderReports) renderReports(); });
        if ($('filterDateTo')) $('filterDateTo').addEventListener('change', function () { if (renderReports) renderReports(); });
        if ($('searchCaseId')) $('searchCaseId').addEventListener('input', function () { if (renderReports) renderReports(); });
        if ($('filterControlRecs')) $('filterControlRecs').addEventListener('change', function () { if (renderReports) renderReports(); });
        if ($('colReporter') && $('colSubScope')) {
          $('colReporter').addEventListener('change', function () { if (renderReports) renderReports(); });
          $('colSubScope').addEventListener('change', function () { if (renderReports) renderReports(); });
        }
        if ($('btnExportJson')) $('btnExportJson').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.exportJson) window.NinjaApp.exportJson(); });
        if ($('btnExportCsv')) $('btnExportCsv').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.exportCsv) window.NinjaApp.exportCsv(); });
        if ($('btnExportExcel')) $('btnExportExcel').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.exportExcel) window.NinjaApp.exportExcel(); });
        if ($('btnPrintListReport')) $('btnPrintListReport').addEventListener('click', function () {
          if (typeof NinjaStorage !== 'undefined' && window.NinjaApp && window.NinjaApp.printCases) {
            NinjaStorage.getAll().then(function (cases) { window.NinjaApp.printCases(cases || []); });
          }
        });
        if ($('btnPrintReports')) $('btnPrintReports').addEventListener('click', function () { if (window.NinjaApp && window.NinjaApp.printFilteredReport) window.NinjaApp.printFilteredReport(); });
        if ($('settingsEditorAdd')) $('settingsEditorAdd').addEventListener('click', function () {
          var key = settingsEditingKey && settingsEditingKey();
          if (!key) return;
          var optionsEl = $('settingsEditorOptions');
          var tbody = optionsEl && optionsEl.querySelector('tbody');
          if (!tbody) return;
          var isPhase = key === 'phases';
          var hasGeographic = key === 'geographicCity';
          var nextId = tbody.querySelectorAll('tr').length + 1;
          var row = document.createElement('tr');
          var geoCell = hasGeographic ? '<td><input type="text" data-field="geographic" value="" placeholder="KSA, Qatar, …"></td>' : '';
          row.innerHTML = isPhase
            ? '<td><input type="text" data-field="value" value="' + nextId + '" readonly></td><td><input type="text" data-field="labelEn" value=""></td><td><input type="text" data-field="labelAr" value=""></td><td><button type="button" class="btn btn-icon row-remove">×</button></td>'
            : '<td><input type="text" data-field="value" value=""></td><td><input type="text" data-field="labelEn" value=""></td><td><input type="text" data-field="labelAr" value=""></td>' + geoCell + '<td><button type="button" class="btn btn-icon row-remove">×</button></td>';
          tbody.appendChild(row);
          var rm = row.querySelector('.row-remove');
          if (rm) rm.addEventListener('click', function () { row.remove(); });
        });
        if ($('settingsEditorPasteComma')) $('settingsEditorPasteComma').addEventListener('click', function () {
          var key = settingsEditingKey && settingsEditingKey();
          if (!key || key === 'phases') return;
          var optionsEl = $('settingsEditorOptions');
          var tbody = optionsEl && optionsEl.querySelector('tbody');
          if (!tbody) return;
          var hasGeographic = key === 'geographicCity';
          var raw = window.prompt('Paste comma-separated values (one per option). Each value will be used as Value and Label EN.');
          if (raw == null || raw.trim() === '') return;
          var items = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
          var geoCell = hasGeographic ? '<td><input type="text" data-field="geographic" value="" placeholder="KSA, Qatar, …"></td>' : '';
          items.forEach(function (item) {
            var row = document.createElement('tr');
            var esc = item.replace(/"/g, '&quot;').replace(/</g, '&lt;');
            row.innerHTML = '<td><input type="text" data-field="value" value="' + esc + '"></td><td><input type="text" data-field="labelEn" value="' + esc + '"></td><td><input type="text" data-field="labelAr" value=""></td>' + geoCell + '<td><button type="button" class="btn btn-icon row-remove">×</button></td>';
            tbody.appendChild(row);
            var rm = row.querySelector('.row-remove');
            if (rm) rm.addEventListener('click', function () { row.remove(); });
          });
        });
        if ($('settingsEditorRestore')) $('settingsEditorRestore').addEventListener('click', function () {
          var key = settingsEditingKey && settingsEditingKey();
          if (!key || !window.NinjaSettings) return;
          NinjaSettings.restoreDefaults(key);
          if (openSettingsEditor) openSettingsEditor(key);
        });
        if ($('settingsEditorSave')) $('settingsEditorSave').addEventListener('click', function () { if (saveSettingsEditor) saveSettingsEditor(); });
        if ($('settingsEditorCancel')) $('settingsEditorCancel').addEventListener('click', function () { if (cancelSettingsEditor) cancelSettingsEditor(); });
        if ($('btnExportSettings')) $('btnExportSettings').addEventListener('click', function () {
          if (typeof NinjaSettings === 'undefined' || !NinjaSettings.getExportData) return;
          var data = NinjaSettings.getExportData();
          var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'ninja-grc-settings-' + new Date().toISOString().slice(0, 10) + '.json';
          a.click();
          URL.revokeObjectURL(a.href);
          if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('saved') : 'Saved.');
        });
        if ($('btnImportSettings')) $('btnImportSettings').addEventListener('click', function () { if ($('inputImportSettings')) $('inputImportSettings').click(); });
        if ($('inputImportSettings')) $('inputImportSettings').addEventListener('change', function () {
          var file = this.files && this.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () {
            try {
              var data = JSON.parse(reader.result);
              if (typeof NinjaSettings !== 'undefined' && NinjaSettings.setFromImport) { NinjaSettings.setFromImport(data); if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('saved') : 'Saved.'); }
            } catch (e) { if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('importError') : 'Invalid file.', 'error'); }
          };
          reader.readAsText(file);
          this.value = '';
        });
        if ($('btnExportAll')) $('btnExportAll').addEventListener('click', function () {
          if (typeof NinjaStorage === 'undefined' || !NinjaStorage.getAll) return;
          NinjaStorage.getAll().then(function (cases) {
            var settings = (typeof NinjaSettings !== 'undefined' && NinjaSettings.getExportData) ? NinjaSettings.getExportData() : {};
            var payload = { version: 1, exportDate: new Date().toISOString(), cases: cases || [], settings: settings };
            var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'ninja-grc-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(a.href);
            if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('saved') : 'Saved.');
          });
        });
        if ($('btnImportAll')) $('btnImportAll').addEventListener('click', function () { if ($('inputImportAll')) $('inputImportAll').click(); });
        if ($('inputImportAll')) $('inputImportAll').addEventListener('change', function () {
          var file = this.files && this.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () {
            try {
              var payload = JSON.parse(reader.result);
              if (!payload || (!payload.cases && !payload.settings)) { if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('importError') : 'Invalid file.', 'error'); return; }
              var msg = NinjaI18n ? NinjaI18n.t('confirmImportAll') : 'This will replace all cases and settings. Continue?';
              if (!confirm(msg)) return;
              var cases = Array.isArray(payload.cases) ? payload.cases : [];
              var settings = payload.settings;
              var save = window.NinjaStorage && window.NinjaStorage.save;
              var next = function (i) {
                if (i >= cases.length) {
                  if (settings && typeof NinjaSettings !== 'undefined' && NinjaSettings.setFromImport) NinjaSettings.setFromImport(settings);
                  if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('importSuccess') : 'Import completed.');
                  if (loadList) loadList();
                  return;
                }
                save(cases[i]).then(function () { next(i + 1); }).catch(function () { next(i + 1); });
              };
              next(0);
            } catch (e) { if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('importError') : 'Invalid file.', 'error'); }
          };
          reader.readAsText(file);
          this.value = '';
        });
        setupScoreListeners();
        setupInterviewWorkflow();
        if (window.NinjaSections && $('caseForm')) NinjaSections.init($('caseForm'));
        if (window.NinjaApp && NinjaApp.bindFormDirty && $('caseForm')) NinjaApp.bindFormDirty($('caseForm'));
      });
    }

    if (typeof NinjaI18n === 'undefined' || !NinjaI18n.init) {
      setNavActiveFromPage();
      bindTabClicks();
      bindNavAndShowList();
      if (document.getElementById('viewReports') && window.NinjaApp && window.NinjaApp.renderReports) window.NinjaApp.renderReports();
      if (document.getElementById('viewSettings') && window.NinjaApp && window.NinjaApp.renderSettingsDropdownList) window.NinjaApp.renderSettingsDropdownList();
      return;
    }
    NinjaI18n.init()
      .then(function () { return onReady(); })
      .then(function () {
        bindTabClicks();
        bindNavAndShowList();
        if (document.getElementById('viewReports') && window.NinjaApp && window.NinjaApp.renderReports) window.NinjaApp.renderReports();
        if (document.getElementById('viewSettings') && window.NinjaApp && window.NinjaApp.renderSettingsDropdownList) window.NinjaApp.renderSettingsDropdownList();
      })
      .catch(function (err) {
        if (typeof NinjaI18n !== 'undefined' && NinjaI18n.applyDirLang) NinjaI18n.applyDirLang();
        setNavActiveFromPage();
        bindTabClicks();
        bindNavAndShowList();
        if (document.getElementById('viewReports') && window.NinjaApp && window.NinjaApp.renderReports) window.NinjaApp.renderReports();
        if (document.getElementById('viewSettings') && window.NinjaApp && window.NinjaApp.renderSettingsDropdownList) window.NinjaApp.renderSettingsDropdownList();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
