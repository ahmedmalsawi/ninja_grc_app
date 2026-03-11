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
    var form = $('caseForm');
    if (!id) {
        NinjaStorage.nextSeq().then(function (seq) {
        var empty = NinjaForms.createEmptyCase(seq);
        var y = new Date().getFullYear();
        empty.id = 'NJ-' + y + '-' + String(seq).padStart(3, '0');
        NinjaForms.fillForm(form, empty);
        formDirty = false;
        $('btnDelete').style.display = 'none';
        $('caseId').readOnly = false;
        if (form) {
          form.setAttribute('data-form-context', 'new');
          form.removeAttribute('data-form-context-id');
        }
        updateFormContextDisplay();
        if (setView) setView('form');
        if (window.NinjaSections && form) NinjaSections.syncSectionsToPhase(form);
        if (window.NinjaTips && NinjaTips.updateConditionalTips) NinjaTips.updateConditionalTips(form);
        if (window.NinjaApp && window.NinjaApp.updateInterviewDuration) window.NinjaApp.updateInterviewDuration();
        var receiptEl = document.getElementById('receiptResponseStatus');
        if (receiptEl) receiptEl.dispatchEvent(new Event('change'));
      });
      return;
    }
    NinjaStorage.getById(id).then(function (c) {
      if (!c) { if (showMessage) showMessage('Case not found.', 'error'); return; }
      NinjaForms.fillForm(form, c);
      formDirty = false;
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
      var receiptEl = document.getElementById('receiptResponseStatus');
      if (receiptEl) receiptEl.dispatchEvent(new Event('change'));
    });
  }

  function saveCase() {
    var form = $('caseForm');
    if (!form) return;
    var btnSave = $('btnSave');
    if (btnSave) { btnSave.classList.add('is-loading'); btnSave.disabled = true; }
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var validation = NinjaForms.validateForm(form);
    if (!validation.ok) {
      if (btnSave) { btnSave.classList.remove('is-loading'); btnSave.disabled = false; }
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
