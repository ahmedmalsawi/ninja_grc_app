/**
 * Ninja GRC - Shared DOM and toast notifications.
 */
(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  var TOAST_AUTO_CLOSE_SUCCESS = 4000;
  var TOAST_AUTO_CLOSE_ERROR = 6000;

  function getToastContainer() {
    var id = 'ninja-toast-container';
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = 'toast-container';
    el.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(el);
    return el;
  }

  function dismissToast(toastEl, timer) {
    if (timer) clearTimeout(timer);
    toastEl.classList.add('toast--exit');
    setTimeout(function () {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 200);
  }

  function showMessage(text, type) {
    if (!text) return;
    var container = getToastContainer();
    var isError = type === 'error';
    var toastType = isError ? 'error' : 'success';
    var dismissLabel = (typeof window.NinjaI18n !== 'undefined' && window.NinjaI18n.t) ? window.NinjaI18n.t('dismiss') : 'Dismiss';

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + toastType;
    toast.setAttribute('role', isError ? 'alert' : 'status');
    toast.setAttribute('aria-live', isError ? 'assertive' : 'polite');

    var icon = document.createElement('span');
    icon.className = 'toast-icon toast-icon--' + toastType;
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = isError ? '!' : '✓';

    var textSpan = document.createElement('span');
    textSpan.className = 'toast-text';
    textSpan.textContent = text;

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-dismiss';
    closeBtn.setAttribute('aria-label', dismissLabel);
    closeBtn.textContent = '×';

    toast.appendChild(icon);
    toast.appendChild(textSpan);
    toast.appendChild(closeBtn);

    var autoClose = isError ? TOAST_AUTO_CLOSE_ERROR : TOAST_AUTO_CLOSE_SUCCESS;
    var timer = setTimeout(function () { dismissToast(toast, null); }, autoClose);

    closeBtn.addEventListener('click', function () { dismissToast(toast, timer); });

    container.appendChild(toast);

    requestAnimationFrame(function () { toast.classList.add('toast--visible'); });
  }

  function bindLogoFallback() {
    document.querySelectorAll('.app-logo img').forEach(function (img) {
      img.addEventListener('error', function () {
        this.style.display = 'none';
        if (this.nextElementSibling) this.nextElementSibling.style.display = 'inline';
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLogoFallback);
  } else {
    bindLogoFallback();
  }

  window.NinjaApp = window.NinjaApp || {};
  window.NinjaApp.$ = $;
  window.NinjaApp.showMessage = showMessage;
})();

