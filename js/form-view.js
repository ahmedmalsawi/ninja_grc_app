/**
 * Ninja GRC - Case form view: open new/edit, save, delete.
 */
(function () {
  'use strict';

  var $ = window.NinjaApp && window.NinjaApp.$;
  var showMessage = window.NinjaApp && window.NinjaApp.showMessage;
  var setView = window.NinjaApp && window.NinjaApp.setView;
  var formDirty = false;

  function setFormDirty(dirty) { formDirty = !!dirty; }
  function isFormDirty() { return formDirty; }

  function goBackToList() {
    if (formDirty && !confirm(NinjaI18n ? NinjaI18n.t('unsavedChanges') : 'You have unsaved changes. Leave anyway?')) return;
    formDirty = false;
    if (setView) setView('list');
  }

  function updateFormContextDisplay() {
    var form = $('caseForm');
    var ctxEl = $('formContext');
    if (!form || !ctxEl) return;
    var isNew = form.getAttribute('data-form-context') === 'new';
    var editId = form.getAttribute('data-form-context-id') || '';
    var t = (typeof NinjaI18n !== 'undefined' && NinjaI18n.t) ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
    if (isNew) {
      ctxEl.textContent = t('newCase') || 'New case';
    } else {
      ctxEl.textContent = (t('editingCase') || 'Editing') + (editId ? ' ' + editId : '');
    }
  }

  function openCase(id) {
    if (typeof NinjaStorage === 'undefined' || !NinjaStorage.nextSeq || !NinjaStorage.getById) {
      if (showMessage) showMessage('Storage not available.', 'error');
      return;
    }
    if (typeof window.NinjaForms === 'undefined' || !window.NinjaForms.createEmptyCase) {
      if (showMessage) showMessage('Forms module not loaded. Check that js/forms.js is included before form-view.js.', 'error');
      return;
    }
    var NF = window.NinjaForms;
    var form = $('caseForm');
    if (!id) {
        NinjaStorage.nextSeq().then(function (seq) {
        var empty = NF.createEmptyCase(seq);
        var y = new Date().getFullYear();
        empty.id = 'NJ-' + y + '-' + String(seq).padStart(3, '0');
        NF.fillForm(form, empty);
        formDirty = false;
        if (NF.bindEvidenceRecordsUI) NF.bindEvidenceRecordsUI(form);
        if (NF.bindExternalPartiesUI) NF.bindExternalPartiesUI(form);
        if (NF.bindAccountableEntitiesUI) NF.bindAccountableEntitiesUI(form);
        if (NF.bindInterviewSessionsUI) NF.bindInterviewSessionsUI(form);
        if (NF.bindScopeEntityRowsUI) NF.bindScopeEntityRowsUI(form);
        if (NF.bindScopeConstraintsUI) NF.bindScopeConstraintsUI(form);
        if (window.NinjaApp && NinjaApp.togglePrecautionaryOther) NinjaApp.togglePrecautionaryOther();
        $('btnDelete').style.display = 'none';
        $('caseId').readOnly = true;
        if (form) {
          form.setAttribute('data-form-context', 'new');
          form.removeAttribute('data-form-context-id');
        }
        updateFormContextDisplay();
        if (setView) setView('form');
        if (window.NinjaSections && form) NinjaSections.syncSectionsToPhase(form);
        if (window.NinjaTips && NinjaTips.updateConditionalTips) NinjaTips.updateConditionalTips(form);
        if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
        if (window.NinjaApp && window.NinjaApp.toggleScopeAmendmentReason) window.NinjaApp.toggleScopeAmendmentReason();
        var receiptEl = document.getElementById('receiptResponseStatus');
        if (receiptEl) receiptEl.dispatchEvent(new Event('change'));
      });
      return;
    }
    NinjaStorage.getById(id).then(function (c) {
      if (!c) { if (showMessage) showMessage('Case not found.', 'error'); return; }
      NF.fillForm(form, c);
      formDirty = false;
      if (NF.bindEvidenceRecordsUI) NF.bindEvidenceRecordsUI(form);
      if (NF.bindExternalPartiesUI) NF.bindExternalPartiesUI(form);
      if (NF.bindAccountableEntitiesUI) NF.bindAccountableEntitiesUI(form);
      if (NF.bindInterviewSessionsUI) NF.bindInterviewSessionsUI(form);
      if (NF.bindScopeEntityRowsUI) NF.bindScopeEntityRowsUI(form);
      if (NF.bindScopeConstraintsUI) NF.bindScopeConstraintsUI(form);
      if (window.NinjaApp && NinjaApp.togglePrecautionaryOther) NinjaApp.togglePrecautionaryOther();
      $('btnDelete').style.display = 'block';
      $('caseId').readOnly = true;
      if (form) {
        form.setAttribute('data-form-context', 'edit');
        form.setAttribute('data-form-context-id', c.id || id);
      }
      updateFormContextDisplay();
      if (setView) setView('form');
      if (window.NinjaSections && form) NinjaSections.syncSectionsToPhase(form);
      if (window.NinjaTips && NinjaTips.updateConditionalTips) NinjaTips.updateConditionalTips(form);
      if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
      if (window.NinjaApp && window.NinjaApp.toggleScopeAmendmentReason) window.NinjaApp.toggleScopeAmendmentReason();
      var receiptEl = document.getElementById('receiptResponseStatus');
      if (receiptEl) receiptEl.dispatchEvent(new Event('change'));
    });
  }

  function saveCase() {
    var form = $('caseForm');
    if (!form) return;
    if (typeof window.NinjaForms === 'undefined' || !window.NinjaForms.validateForm) {
      if (showMessage) showMessage('Forms module not loaded.', 'error');
      return;
    }
    var NF = window.NinjaForms;
    var btnSave = $('btnSave');
    if (btnSave) { btnSave.classList.add('is-loading'); btnSave.disabled = true; }
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var validation = NF.validateForm(form);
    if (!validation.ok && validation.errors && validation.errors.length) {
      if (btnSave) { btnSave.classList.remove('is-loading'); btnSave.disabled = false; }
      var t = NinjaI18n && NinjaI18n.t ? NinjaI18n.t.bind(NinjaI18n) : function (k) { return k; };
      var fieldLabelMap = {
        caseId: t('caseId'),
        reporterName: t('name'),
        reporterPhone: t('phone'),
        reporterEmail: t('email'),
        reporterDept: t('department'),
        geographic: t('geographic'),
        sovereignty: t('validationScore'),
        financial: t('validationScore'),
        evidence: t('validationScore'),
        reputation: t('validationScore')
      };
      var labels = [];
      var seen = {};
      var scoreLabelAdded = false;
      validation.errors.forEach(function (err) {
        var lid = err.fieldId || (err.msg === 'score' ? 'sovereignty' : err.msg);
        if (err.msg === 'score') {
          if (!scoreLabelAdded) {
            scoreLabelAdded = true;
            labels.push(fieldLabelMap.sovereignty || t('validationScore'));
          }
        } else if (!seen[lid]) {
          seen[lid] = true;
          labels.push(fieldLabelMap[lid] || t(err.msg) || lid);
        }
      });
      var msg = (t('validationRequiredFieldsList') || 'The following required fields are missing or invalid: ') + labels.join(', ');
      if (showMessage) showMessage(msg, 'error');
      validation.errors.forEach(function (err) {
        var fieldId = err.fieldId || (err.msg === 'score' ? 'sovereignty' : err.msg);
        var el = form.querySelector('#' + fieldId);
        if (el) el.setAttribute('aria-invalid', 'true');
      });
      var firstErr = validation.errors[0];
      var firstId = firstErr && (firstErr.fieldId || (firstErr.msg === 'score' ? 'sovereignty' : firstErr.msg));
      if (firstId === 'sovereignty' || firstId === 'financial' || firstId === 'evidence' || firstId === 'reputation') {
        var firstScore = form.querySelector('#sovereignty');
        if (firstScore) firstScore.focus();
      } else {
        var firstEl = form.querySelector('#' + firstId);
        if (firstEl) firstEl.focus();
      }
      return;
    }
    var caseObj = NF.collectForm(form);
    NinjaStorage.save(caseObj)
      .then(function () {
        if (btnSave) { btnSave.classList.remove('is-loading'); btnSave.disabled = false; }
        formDirty = false;
        if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('saved') : 'Saved.');
        if (setView) setView('list');
        if (window.NinjaApp && window.NinjaApp.loadList) window.NinjaApp.loadList();
      })
      .catch(function (err) {
        if (btnSave) { btnSave.classList.remove('is-loading'); btnSave.disabled = false; }
        if (showMessage) showMessage(err && err.message ? err.message : 'Save failed.', 'error');
      });
  }

  function deleteCase() {
    var id = $('caseId') && $('caseId').value ? $('caseId').value.trim() : '';
    if (!id) return;
    var msg = NinjaI18n ? NinjaI18n.t('confirmDelete') : 'Delete this case?';
    if (!confirm(msg)) return;
    var btnDelete = $('btnDelete');
    if (btnDelete) { btnDelete.classList.add('is-loading'); btnDelete.disabled = true; }
    NinjaStorage.remove(id)
      .then(function () {
        if (btnDelete) { btnDelete.classList.remove('is-loading'); btnDelete.disabled = false; }
        if (showMessage) showMessage(NinjaI18n ? NinjaI18n.t('deleted') : 'Case deleted.');
        if (setView) setView('list');
        if (window.NinjaApp && window.NinjaApp.loadList) window.NinjaApp.loadList();
      })
      .catch(function (err) {
        if (btnDelete) { btnDelete.classList.remove('is-loading'); btnDelete.disabled = false; }
        if (showMessage) showMessage(err && err.message ? err.message : 'Delete failed.', 'error');
      });
  }

  function bindFormDirty(form) {
    if (!form) return;
    var events = ['input', 'change'];
    events.forEach(function (ev) {
      form.addEventListener(ev, function () { formDirty = true; }, { passive: true });
    });
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.openCase = openCase;
  window.NinjaApp.saveCase = saveCase;
  window.NinjaApp.deleteCase = deleteCase;
  window.NinjaApp.goBackToList = goBackToList;
  window.NinjaApp.bindFormDirty = bindFormDirty;
  window.NinjaApp.updateFormContextDisplay = updateFormContextDisplay;
})();
