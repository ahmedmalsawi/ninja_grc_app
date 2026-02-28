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
    var ed = c.evidenceDetails || (typeof c.evidence === 'object' ? c.evidence : null) || {};
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
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionProcess') + '</h3><table class="print-table">';
    html += row(t('caseAcceptanceStatus'), pr.caseAcceptanceStatus);
    html += row(t('legalPrivilege'), pr.legalPrivilege);
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionInterview') + '</h3><table class="print-table">';
    html += row(t('interviewClassification'), iv.classification);
    html += row(t('interviewDate'), iv.interviewDate);
    html += row(t('rightsNotified'), iv.rightsNotified);
    html += row(t('documentationMethod'), iv.documentationMethod);
    html += row(t('receiptResponseStatus'), iv.receiptResponseStatus);
    html += row(t('summonsId'), iv.summonsId);
    html += row(t('summonsStatus'), iv.summonsStatus);
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionEvidence') + '</h3><table class="print-table">';
    html += row(t('formOfEvidence'), ed.formOfEvidence);
    html += row(t('dataCategory'), ed.dataCategory);
    html += row(t('examinationType'), ed.examinationType);
    html += row(t('chainOfCustody'), ed.chainOfCustody);
    html += row(t('supportingParty'), ed.supportingParty);
    html += '</table>';

    html += '<h3 class="print-section">' + t('sectionImpact') + '</h3><table class="print-table">';
    html += row(t('currentStatus'), statusLabel(im.currentStatus));
    html += row(t('purpose'), im.purpose);
    html += row(t('methodology'), im.methodology);
    html += row(t('facts'), im.facts);
    html += row(t('conclusions'), im.conclusions);
    html += row(t('recommendations'), im.recommendations);
    html += row(t('recommendationType'), im.recommendationType);
    html += row(t('impactValue'), im.impactValue);
    html += row(t('rcaType'), im.rcaType);
    html += row(t('rcaSubtype'), im.rcaSubtype);
    html += row(t('rootCauses'), im.rootCauses);
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
