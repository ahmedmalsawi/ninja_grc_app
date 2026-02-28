/**
 * Ninja GRC - Case form view: open new/edit, save, delete.
 */
(function () {
  'use strict';

  var $ = window.NinjaApp && window.NinjaApp.$;
  var showMessage = window.NinjaApp && window.NinjaApp.showMessage;
  var setView = window.NinjaApp && window.NinjaApp.setView;
  var loadList = window.NinjaApp && window.NinjaApp.loadList;

  function openCase(id) {
    if (typeof NinjaStorage === 'undefined' || !NinjaStorage.nextSeq || !NinjaStorage.getById) {
      if (showMessage) showMessage('Storage not available.', 'error');
      return;
    }
    if (!id) {
      NinjaStorage.nextSeq().then(function (seq) {
        var empty = NinjaForms.createEmptyCase(seq);
        empty.id = 'CASE-' + Date.now();
        NinjaForms.fillForm($('caseForm'), empty);
        $('btnDelete').style.display = 'none';
        $('caseId').readOnly = false;
        var ctx = $('formContext');
        if (ctx) ctx.textContent = (NinjaI18n ? NinjaI18n.t('newCase') : 'New case');
        if (setView) setView('form');
        if (window.NinjaSections && $('caseForm')) NinjaSections.syncSectionsToPhase($('caseForm'));
        if (window.NinjaTips && NinjaTips.updateConditionalTips) NinjaTips.updateConditionalTips($('caseForm'));
        if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
        var receiptEl = document.getElementById('receiptResponseStatus');
        if (receiptEl) receiptEl.dispatchEvent(new Event('change'));
      });
      return;
    }
    NinjaStorage.getById(id).then(function (c) {
      if (!c) { if (showMessage) showMessage('Case not found.', 'error'); return; }
      NinjaForms.fillForm($('caseForm'), c);
      $('btnDelete').style.display = 'block';
      $('caseId').readOnly = true;
      var ctx = $('formContext');
      if (ctx) ctx.textContent = (NinjaI18n ? NinjaI18n.t('editingCase') : 'Editing') + ' ' + (c.id || id);
      if (setView) setView('form');
      if (window.NinjaSections && $('caseForm')) NinjaSections.syncSectionsToPhase($('caseForm'));
      if (window.NinjaTips && NinjaTips.updateConditionalTips) NinjaTips.updateConditionalTips($('caseForm'));
      if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
      var receiptEl = document.getElementById('receiptResponseStatus');
      if (receiptEl) receiptEl.dispatchEvent(new Event('change'));
    });
  }

  function saveCase() {
    var form = $('caseForm');
    if (!form) return;
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var validation = NinjaForms.validateForm(form);
    if (!validation.ok) {
      var msg = validation.msg === 'caseId' ? (NinjaI18n ? NinjaI18n.t('validationRequired') : 'Case ID required.')
        : validation.msg === 'reporterName' || validation.msg === 'reporterPhone' || validation.msg === 'reporterEmail'
        ? (NinjaI18n ? NinjaI18n.t('validationReporter') : 'Name, phone and email are required when reporter is not Anonymous.')
        : validation.msg === 'reporterDept'
        ? (NinjaI18n ? NinjaI18n.t('validationDepartment') : 'Department is required when reporter type is Employee.')
        : (NinjaI18n ? NinjaI18n.t('validationScore') : 'Scores must be 1-5.');
      if (showMessage) showMessage(msg, 'error');
      if (validation.msg === 'caseId') {
        var idEl = form.querySelector('#caseId');
        if (idEl) { idEl.setAttribute('aria-invalid', 'true'); idEl.focus(); }
      } else if (validation.msg === 'reporterName' || validation.msg === 'reporterPhone' || validation.msg === 'reporterEmail') {
        var reporterEl = form.querySelector('#' + validation.msg);
        if (reporterEl) { reporterEl.setAttribute('aria-invalid', 'true'); reporterEl.focus(); }
      } else if (validation.msg === 'reporterDept') {
        var deptEl = form.querySelector('#reporterDept');
        if (deptEl) { deptEl.setAttribute('aria-invalid', 'true'); deptEl.focus(); }
      } else if (validation.msg === 'score') {
        ['sovereignty', 'financial', 'evidence', 'reputation'].forEach(function (id) {
          var el = form.querySelector('#' + id);
          if (el) el.setAttribute('aria-invalid', 'true');
        });
        var firstScore = form.querySelector('#sovereignty');
        if (firstScore) firstScore.focus();
      }
      return;
    }
    var caseObj = NinjaForms.collectForm(form);
    NinjaStorage.save(caseObj)
      .then(function () {
        if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('saved') : 'Saved.');
        if (setView) setView('list');
        if (loadList) loadList();
      })
      .catch(function (err) {
        if (showMessage) showMessage(err && err.message ? err.message : 'Save failed.', 'error');
      });
  }

  function deleteCase() {
    var id = $('caseId') && $('caseId').value ? $('caseId').value.trim() : '';
    if (!id || !confirm('Delete this case?')) return;
    NinjaStorage.remove(id)
      .then(function () {
        if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('deleted') : 'Case deleted.');
        if (setView) setView('list');
        if (loadList) loadList();
      })
      .catch(function (err) {
        if (showMessage) showMessage(err && err.message ? err.message : 'Delete failed.', 'error');
      });
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.openCase = openCase;
  window.NinjaApp.saveCase = saveCase;
  window.NinjaApp.deleteCase = deleteCase;
})();
