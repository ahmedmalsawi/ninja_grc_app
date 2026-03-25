/**
 * Build one HTML page per section: index.html (Cases), reports.html, notes.html, settings.html.
 * Each page has its own main content and nav links to the others. No SPA routing.
 * Run: node build/build-index.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const partialsDir = path.join(root, 'partials');

function readPartial(name) {
  const file = path.join(partialsDir, name);
  if (!fs.existsSync(file)) throw new Error('Missing partial: ' + name);
  return fs.readFileSync(file, 'utf8');
}

const head = readPartial('head.html');
const headerTemplate = readPartial('header.html');
const viewList = readPartial('view-list.html');
const viewForm = readPartial('view-form.html');
const viewReports = readPartial('view-reports.html');
/* Standalone settings (ninja header, cases.html links) are maintained as settings.html / settings-dropdowns.html — not emitted by this build. */
const foot = readPartial('foot.html');

function headerWithActive(activePage) {
  const act = { cases: '', reports: '', settings: '' };
  if (act.hasOwnProperty(activePage)) act[activePage] = ' active';
  return headerTemplate
    .replace(/\{\{active-cases\}\}/g, act.cases)
    .replace(/\{\{active-reports\}\}/g, act.reports)
    .replace(/\{\{active-settings\}\}/g, act.settings);
}

const pages = [
  { file: 'index.html', title: 'Cases', active: 'cases', main: viewList + '\n' + viewForm },
  { file: 'reports.html', title: 'Reports', active: 'reports', main: viewReports }
];

pages.forEach(function (p) {
  const html = head + headerWithActive(p.active) + p.main + foot;
  const out = path.join(root, p.file);
  fs.writeFileSync(out, html, 'utf8');
  console.log('Built ' + p.file);
});

console.log('Done. Open index.html, reports.html, or settings.html.');
