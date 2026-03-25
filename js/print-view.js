/**
 * Ninja GRC - Print-friendly case report (language-aware).
 */
(function () {
  'use strict';

  var t = function (k) { return (window.NinjaI18n && window.NinjaI18n.t(k)) || k; };
  var getPhaseName = function (n) {
    if (window.NinjaSettings && window.NinjaSettings.getPhaseName) return window.NinjaSettings.getPhaseName(n);
    if (window.NinjaI18n && window.NinjaI18n.getPhaseName) return window.NinjaI18n.getPhaseName(n);
    return String(n);
  };

  function pathLabel(path) {
    var p = path || 'green';
    return p === 'green' ? t('pathGreen') : p === 'yellow' ? t('pathYellow') : t('pathRed');
  }

  function statusLabel(s) {
    if (!s) return t('statusOpen');
    var map = { 'Open': 'statusOpen', 'In preparation': 'statusInPrep', 'In progress': 'statusInProgress', 'Draft report': 'statusDraft', 'Closed': 'statusClosed' };
    return map[s] ? t(map[s]) : s;
  }

  function row(label, value) {
    if (value == null || String(value).trim() === '') return '';
    return '<tr><th scope="row">' + escapeHtml(label) + '</th><td>' + escapeHtml(String(value)) + '</td></tr>';
  }

  function interviewSessionBool(v) {
    return v === true || v === 'yes' || v === 'Yes' || v === '1';
  }

  function rowBool(label, checked) {
    var ok = interviewSessionBool(checked);
    var txt = ok ? (t('labelYes') || 'Yes') : (t('labelNo') || 'No');
    return '<tr><th scope="row">' + escapeHtml(label) + '</th><td>' + escapeHtml(txt) + '</td></tr>';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function caseToPrintHtml(c, index, total) {
    var r = c.reporter || {};
    var cl = c.classification || {};
    var sc = c.scope || {};
    var pr = c.process || {};
    var iv = c.interview || {};
    var ed = c.evidenceDetails || (typeof c.evidence === 'object' && !Array.isArray(c.evidence) ? c.evidence : null) || {};
    var edList = (c.evidenceRecords && Array.isArray(c.evidenceRecords) && c.evidenceRecords.length) ? c.evidenceRecords : [ed];
    var ex = c.externalParties || {};
    var im = c.impact || {};
    var path = c.path || 'green';

    var html = '<div class="print-case">';
    html += '<h2 class="print-case-title">' + (total > 1 ? (t('caseReport') + ' ' + (index + 1) + ': ') : '') + escapeHtml(c.id || '') + '</h2>';
    html += '<table class="print-table">';
    html += row(t('caseId'), c.id);
    html += row(t('receivedDate'), c.receivedDate);
    html += row(t('phase'), getPhaseName(c.currentPhase));
    html += row(t('sovereignty'), c.sovereignty);
    html += row(t('financial'), c.financial);
    html += row(t('evidence'), typeof c.evidence === 'number' ? c.evidence : '');
    html += row(t('reputation'), c.reputation);
    html += row(t('totalScore'), c.totalScore);
    html += row(t('path'), pathLabel(path));
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionReporter') + '</h3><table class="print-table">';
    html += row(t('name'), r.name);
    html += row(t('phone'), r.phone);
    html += row(t('email'), r.email);
    html += row(t('type'), r.type);
    html += row(t('department'), r.department);
    html += row(t('source'), r.source);
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionClassification') + '</h3><table class="print-table">';
    html += row(t('reportType'), cl.reportType);
    html += row(t('geographic'), cl.geographic);
    html += row(t('city'), cl.geographicCity);
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionScope') + '</h3><table class="print-table">';
    html += row(t('scopeType'), sc.scope);
    html += row(t('subScope'), sc.subScope);
    html += row(t('escalationLevel'), sc.escalationLevel);
    html += row(t('severity'), sc.severity);
    var precDisp = sc.precautionaryMeasures || '';
    if (precDisp === 'OtherPrecautionary' && sc.precautionaryMeasuresOther) precDisp = (sc.precautionaryMeasuresOther || '').trim() ? precDisp + ': ' + sc.precautionaryMeasuresOther : precDisp;
    html += row(t('precautionaryMeasures'), precDisp);
    if (sc.teamMemberRoster && sc.teamMemberRoster.length) {
      var tml = sc.teamMemberRoster.map(function (m) {
        return (m.role || '') + (m.name ? ' — ' + m.name : '') + (m.employeeNo ? ' (' + t('teamMemberJobNumber') + ': ' + m.employeeNo + ')' : '');
      }).join('; ');
      html += row(t('teamMembers'), tml);
    } else if (sc.teamMembers && sc.teamMembers.length) {
      html += row(t('teamMembers'), sc.teamMembers.join(', '));
    }
    html += '</table>';
    if (sc.scopeEntityRows && Array.isArray(sc.scopeEntityRows) && sc.scopeEntityRows.length) {
      sc.scopeEntityRows.forEach(function (er, ei) {
        if (!(er && (er.relatedEntity || er.jobNumber || er.personName))) return;
        html += '<p class="print-section" style="margin-bottom:0.25rem"><strong>' + escapeHtml((t('scopeEntityRowTitle') || 'Related party') + ' ' + (ei + 1)) + '</strong></p>';
        html += '<table class="print-table">';
        html += row(t('relatedEntityLabel'), er.relatedEntity);
        html += row(t('teamMemberJobNumber'), er.jobNumber);
        html += row(t('name'), er.personName);
        html += '</table>';
      });
    } else if (sc.scopeEntities && String(sc.scopeEntities).trim()) {
      html += '<table class="print-table">';
      html += row(t('scopeEntities'), sc.scopeEntities);
      html += '</table>';
    }
    if (sc.constraintItems && Array.isArray(sc.constraintItems) && sc.constraintItems.length) {
      var lines = sc.constraintItems.map(function (c) { return c && c.constraintText ? String(c.constraintText).trim() : ''; }).filter(Boolean);
      if (lines.length) {
        html += '<table class="print-table">';
        html += row(t('scopeConstraints'), lines.join('; '));
        html += '</table>';
      }
    } else if (sc.scopeConstraints && String(sc.scopeConstraints).trim()) {
      html += '<table class="print-table">';
      html += row(t('scopeConstraints'), sc.scopeConstraints);
      html += '</table>';
    }

    html += '<h3 class="print-section">' + t('sectionProcess') + '</h3><table class="print-table">';
    html += row(t('caseAcceptanceStatus'), pr.caseAcceptanceStatus);
    html += row(t('legalPrivilege'), pr.legalPrivilege);
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionInterview') + '</h3>';
    if (iv.sessions && Array.isArray(iv.sessions) && iv.sessions.length) {
      iv.sessions.forEach(function (sess, idx) {
        var subTitle = (sess.intervieweeName && sess.intervieweeName.trim()) ? escapeHtml(sess.intervieweeName.trim()) + (sess.interviewDate ? ' — ' + sess.interviewDate : '') : (t('interviewSessionTitle') || 'Interview') + ' ' + (idx + 1) + (sess.interviewDate ? ' — ' + sess.interviewDate : '');
        html += '<p class="print-section" style="margin-bottom:0.25rem"><strong>' + subTitle + '</strong></p>';
        html += '<table class="print-table">';
        html += row(t('intervieweeName'), sess.intervieweeName);
        html += row(t('intervieweeJobNumber'), sess.intervieweeJobNumber);
        html += row(t('interviewClassification'), sess.classification);
        html += row(t('interviewDate'), sess.interviewDate);
        html += row(t('rightsNotified'), sess.rightsNotified);
        html += row(t('documentationMethod'), sess.documentationMethod);
        html += row(t('receiptResponseStatus'), sess.receiptResponseStatus);
        html += row(t('summonsId'), sess.summonsId);
        html += row(t('summonsStatus'), sess.summonsStatus);
        html += row(t('interviewTechnicalAuthorities'), sess.technicalAuthorities);
        html += row(t('interviewPersonalityInfluence'), sess.personalityInfluence);
        html += rowBool(t('interviewIndependenceVerified'), sess.independenceVerified);
        html += row(t('interviewCoreObjective'), sess.sessionCoreObjective);
        html += row(t('interviewInfoToExtract'), sess.sessionInfoToExtract);
        html += row(t('interviewEvidencePresented'), sess.sessionEvidencePresented);
        var expOut = [];
        if (interviewSessionBool(sess.outcomePartialFullAdmission)) expOut.push(t('interviewOutcomePartialFull'));
        if (interviewSessionBool(sess.outcomeRevealPartners)) expOut.push(t('interviewOutcomeRevealPartners'));
        if (interviewSessionBool(sess.outcomeRefuteDefenses)) expOut.push(t('interviewOutcomeRefuteDefenses'));
        if (interviewSessionBool(sess.outcomeSystemicGap)) expOut.push(t('interviewOutcomeSystemicGap'));
        html += row(t('interviewExpectedOutcomesLegend'), expOut.join('; '));
        html += row(t('interviewLeadInvestigator'), [sess.leadInvestigatorName, sess.leadInvestigatorJobNumber].filter(Boolean).join(' — ') || '');
        html += row(t('interviewWitnessRecorder'), [sess.witnessRecorderName, sess.witnessRecorderJobNumber].filter(Boolean).join(' — ') || '');
        html += row(t('interviewTechExpert'), [sess.techExpertName, sess.techExpertJobNumber].filter(Boolean).join(' — ') || '');
        html += row(t('interviewDeptRep'), [sess.deptRepName, sess.deptRepJobNumber].filter(Boolean).join(' — ') || '');
        html += row(t('interviewMinutes'), sess.minutes);
        html += '</table>';
      });
    } else {
      html += '<table class="print-table">';
      html += row(t('interviewClassification'), iv.classification);
      html += row(t('interviewDate'), iv.interviewDate);
      html += row(t('rightsNotified'), iv.rightsNotified);
      html += row(t('documentationMethod'), iv.documentationMethod);
      html += row(t('receiptResponseStatus'), iv.receiptResponseStatus);
      html += row(t('summonsId'), iv.summonsId);
      html += row(t('summonsStatus'), iv.summonsStatus);
      html += '</table>';
    }

    var exParties = (ex.parties && Array.isArray(ex.parties) && ex.parties.length) ? ex.parties : (ex.partyType ? [{
      partyType: ex.partyType, natureOfCommunication: ex.natureOfCommunication, encryption: ex.encryption,
      confidentiality: ex.confidentiality, writtenAgreement: ex.writtenAgreement === 'Yes' || ex.writtenAgreement === true
    }] : []);
    if (exParties.length) {
      html += '<h3 class="print-section">' + t('sectionExternalParties') + '</h3>';
      exParties.forEach(function (xp, xi) {
        html += '<p class="print-section" style="margin-bottom:0.25rem"><strong>' + escapeHtml((t('externalPartyRecordTitle') || 'External party') + ' ' + (xi + 1)) + '</strong></p>';
        html += '<table class="print-table">';
        html += row(t('partyType'), xp.partyType);
        html += row(t('natureOfCommunication'), xp.natureOfCommunication);
        html += row(t('encryption'), xp.encryption);
        html += row(t('writtenAgreement'), (xp.writtenAgreement === true || xp.writtenAgreement === 'Yes') ? (t('labelYes') || 'Yes') : '');
        html += row(t('externalConfidentiality'), xp.confidentiality);
        html += '</table>';
      });
    }

    html += '<h3 class="print-section">' + t('sectionEvidence') + '</h3>';
    edList.forEach(function (ev, evIdx) {
      if (edList.length > 1) html += '<p class="print-section" style="margin-bottom:0.25rem"><strong>' + escapeHtml((t('evidenceRecordTitle') || '') + ' ' + (evIdx + 1)) + '</strong></p>';
      html += '<table class="print-table">';
      html += row(t('formOfEvidence'), ev.formOfEvidence);
      html += row(t('dataCategory'), ev.dataCategory);
      html += row(t('examinationType'), ev.examinationType);
      html += row(t('evidenceHashValue'), ev.evidenceHashValue);
      html += row(t('chainOfCustody'), ev.chainOfCustody);
      html += row(t('supportingParty'), ev.supportingParty);
      html += row(t('evidenceLinkUrl'), ev.evidenceLinkUrl);
      html += '</table>';
    });

    html += '<h3 class="print-section">' + t('sectionImpact') + '</h3><table class="print-table">';
    html += row(t('currentStatus'), statusLabel(im.currentStatus));
    html += row(t('technicalViolation'), im.technicalViolation);
    if (im.fiveWhys1 !== undefined || im.fiveWhys2 !== undefined || im.fiveWhys) {
      if (im.fiveWhys1 !== undefined || im.fiveWhys2 !== undefined) {
        html += row(t('fiveWhys1'), im.fiveWhys1);
        html += row(t('fiveWhys2'), im.fiveWhys2);
        html += row(t('fiveWhys3'), im.fiveWhys3);
        html += row(t('fiveWhys4'), im.fiveWhys4);
        html += row(t('fiveWhys5'), im.fiveWhys5);
      } else {
        html += row(t('fiveWhys'), im.fiveWhys);
      }
    }
    html += row(t('regulatoryImpact'), im.regulatoryImpact);
    html += row(t('financialOperationalImpact'), im.financialOperationalImpact);
    html += row(t('reputationLegalImpact'), im.reputationLegalImpact);
    if (im.accountableEntities && Array.isArray(im.accountableEntities) && im.accountableEntities.length) {
      im.accountableEntities.forEach(function (ae, ai) {
        if (!(ae && (ae.personName || ae.jobNumber || ae.relatedEntity || ae.convictionLevel))) return;
        html += '<tr><th colspan="2" scope="colgroup" style="background:#e2e8f0;text-align:start;padding:0.35rem 0.5rem">' + escapeHtml((t('accountableEntityRecordTitle') || '') + ' ' + (ai + 1)) + '</th></tr>';
        html += row(t('name'), ae.personName);
        html += row(t('teamMemberJobNumber'), ae.jobNumber);
        html += row(t('relatedEntityLabel'), ae.relatedEntity);
        html += row(t('accConvictionLevel'), ae.convictionLevel);
        var g = [];
        if (interviewSessionBool(ae.guidanceViolationProven)) g.push(t('accGuidanceViolationProven'));
        if (interviewSessionBool(ae.guidanceNoViolation)) g.push(t('accGuidanceNoViolation'));
        if (interviewSessionBool(ae.guidanceInsufficientEvidence)) g.push(t('accGuidanceInsufficientEvidence'));
        html += row(t('accGuidedBy'), g.join('; '));
      });
    }
    html += row(t('recoveryOpportunityValue'), im.recoveryOpportunityValue);
    html += row(t('recoveryStatus'), im.recoveryStatus);
    html += row(t('amountRecovered'), im.amountRecovered);
    html += row(t('netSavings'), im.netSavings);
    if (im.assetRecoveryNotes) html += row(t('assetRecoveryNotes'), im.assetRecoveryNotes);
    html += row(t('correctiveActions'), im.correctiveActions);
    html += row(t('preventiveActions'), im.preventiveActions);
    var strat = [];
    if (interviewSessionBool(im.strategicOptAssetRecovery)) strat.push(t('strategicOptAssetRecovery'));
    if (interviewSessionBool(im.strategicOptReferProsecution)) strat.push(t('strategicOptReferProsecution'));
    if (strat.length) html += row(t('strategicRecMultiselect'), strat.join('; '));
    var art80 = [];
    [['strategicArt80EmployerAssault', 'strategicArt80EmployerAssault'], ['strategicArt80Obligations', 'strategicArt80Obligations'], ['strategicArt80Misconduct', 'strategicArt80Misconduct'], ['strategicArt80IntentionalLoss', 'strategicArt80IntentionalLoss'], ['strategicArt80Forgery', 'strategicArt80Forgery'], ['strategicArt80Probation', 'strategicArt80Probation'], ['strategicArt80Absence', 'strategicArt80Absence'], ['strategicArt80PositionAbuse', 'strategicArt80PositionAbuse'], ['strategicArt80TradeSecrets', 'strategicArt80TradeSecrets']].forEach(function (p) {
      if (interviewSessionBool(im[p[0]])) art80.push(t(p[1]));
    });
    if (art80.length) html += row(t('strategicArt80Title'), art80.join('; '));
    var scl = [];
    [['strategicClosureNoProof', 'strategicClosureNoProof'], ['strategicClosureMalicious', 'strategicClosureMalicious'], ['strategicClosurePartialAdmin', 'strategicClosurePartialAdmin'], ['strategicClosureUnable', 'strategicClosureUnable']].forEach(function (p) {
      if (interviewSessionBool(im[p[0]])) scl.push(t(p[1]));
    });
    if (scl.length) html += row(t('strategicInvestigationClosure'), scl.join('; '));
    html += row(t('recommendationType'), im.recommendationType);
    html += row(t('grievanceDate'), im.grievanceDate);
    html += row(t('grievanceGrounds'), im.grievanceGrounds);
    html += row(t('formChecklistNotes'), im.formChecklistNotes);
    html += row(t('qualityReviewNotes'), im.qualityReviewNotes);
    var fdLines = [];
    if (interviewSessionBool(im.fdArt80)) fdLines.push(t('fdArt80') + (im.fdArt80Paragraph ? ' — ' + im.fdArt80Paragraph : ''));
    if (interviewSessionBool(im.fdDeduction)) fdLines.push(t('fdDeduction') + (im.fdDeductionDetail ? ' — ' + im.fdDeductionDetail : ''));
    if (interviewSessionBool(im.fdFinalWarningTransfer)) fdLines.push(t('fdFinalWarningTransfer'));
    if (interviewSessionBool(im.fdReferAuthorities)) fdLines.push(t('fdReferAuthorities'));
    if (interviewSessionBool(im.fdRepayAmount)) fdLines.push(t('fdRepayAmount') + (im.fdRepayAmountValue ? ' — ' + im.fdRepayAmountValue : ''));
    if (interviewSessionBool(im.fdRevokeAccess)) fdLines.push(t('fdRevokeAccess'));
    if (interviewSessionBool(im.fdSalaryStopContinue)) fdLines.push(t('fdSalaryStopContinue'));
    if (interviewSessionBool(im.fdCloseInvestigation)) fdLines.push(t('fdCloseInvestigation'));
    var fdB = [];
    if (interviewSessionBool(im.fdHrRestore)) fdB.push(t('fdHrRestore'));
    if (interviewSessionBool(im.fdHrCancelSuspension)) fdB.push(t('fdHrCancelSuspension'));
    if (interviewSessionBool(im.fdHrRecord)) fdB.push(t('fdHrRecord'));
    if (interviewSessionBool(im.fdTechRestoreAccess)) fdB.push(t('fdTechRestoreAccess'));
    if (interviewSessionBool(im.fdTechStopMonitoring)) fdB.push(t('fdTechStopMonitoring'));
    if (interviewSessionBool(im.fdPdplReturnAssets)) fdB.push(t('fdPdplReturnAssets'));
    if (interviewSessionBool(im.fdPdplDestroy)) fdB.push(t('fdPdplDestroy'));
    if (interviewSessionBool(im.fdPdplArchive)) fdB.push(t('fdPdplArchive'));
    if (fdLines.length) html += row(t('decisionPartA'), fdLines.join('\n'));
    if (fdB.length) html += row(t('decisionPartB'), fdB.join('\n'));
    html += '</table>';

    html += '</div>';
    return html;
  }

  function printCases(cases) {
    if (!cases || !cases.length) return;
    var lang = (window.NinjaI18n && window.NinjaI18n.getLang()) ? window.NinjaI18n.getLang() : 'en';
    var dir = lang === 'ar' ? 'rtl' : 'ltr';
    var title = cases.length === 1 ? t('caseReport') : t('casesReport');
    var casesHtml = cases.map(function (c, i) { return caseToPrintHtml(c, i, cases.length); }).join('');
    var doc = '<!DOCTYPE html><html lang="' + lang + '" dir="' + dir + '">' +
      '<head><meta charset="UTF-8"><title>' + escapeHtml(title) + '</title>' +
      '<style>.print-case{page-break-after:always}.print-case:last-child{page-break-after:auto}' +
      'body{font-family:Segoe UI,sans-serif;padding:1.5rem;color:#1e293b;line-height:1.5}' +
      '.print-case-title{font-size:1.25rem;margin:0 0 0.75rem 0;padding-bottom:0.5rem;border-bottom:1px solid #e2e8f0}' +
      '.print-section{font-size:1rem;margin:1rem 0 0.5rem 0}' +
      '.print-table{width:100%;border-collapse:collapse;margin-bottom:0.75rem;font-size:0.9rem}' +
      '.print-table th{text-align:start;padding:0.35rem 0.5rem;background:#f1f5f9;width:35%}' +
      '.print-table td{padding:0.35rem 0.5rem;border-bottom:1px solid #e2e8f0}' +
      '@media print{body{padding:0}.print-case{page-break-after:always}}</style></head>' +
      '<body><h1 style="margin:0 0 1rem 0;font-size:1.5rem">' + escapeHtml(title) + '</h1>' + casesHtml + '</body></html>';
    var w = window.open('', '_blank');
    w.document.write(doc);
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); w.close(); }, 250);
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.printCases = printCases;
})();
