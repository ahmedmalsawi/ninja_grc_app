/**
 * Ninja GRC - Loader: fetch HTML partials, inject into #app, then load app scripts in order.
 * Keeps index.html small; all view content lives in partials/.
 * Script order must match: i18n → storage → forms → settings → sections → tips → utils → router → views → app.
 */
(function () {
  'use strict';

  var PARTIALS = [
    'partials/header.html',
    'partials/view-list.html',
    'partials/view-form.html',
    'partials/view-reports.html',
    'partials/view-notes.html',
    'partials/view-settings.html'
  ];

  var SCRIPTS = [
    'js/i18n.js',
    'js/storage.js',
    'js/forms.js',
    'js/settings.js',
    'js/sections.js',
    'js/tips.js',
    'js/utils.js',
    'js/router.js',
    'js/list-view.js',
    'js/form-view.js',
    'js/reports-view.js',
    'js/settings-view.js',
    'js/app.js'
  ];

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.text();
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  function run() {
    var app = document.getElementById('app');
    if (!app) return;

    Promise.all(PARTIALS.map(fetchText))
      .then(function (htmls) {
        app.innerHTML = htmls.join('\n') + '\n  </main>\n';
        var next = 0;
        function loadNext() {
          if (next >= SCRIPTS.length) return Promise.resolve();
          return loadScript(SCRIPTS[next++]).then(loadNext);
        }
        return loadNext();
      })
      .catch(function (err) {
        var msg = (err && err.message ? err.message : String(err));
        if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
          msg = 'Open this app via a local server (e.g. run "npx serve ." or "python -m http.server" in the project folder, then visit http://localhost:...). Opening index.html as a file does not work.';
        }
        app.innerHTML = '<p class="msg error">' + msg + '</p>';
        console.error(err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
