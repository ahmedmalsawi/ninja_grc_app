/**
 * Bilingual (Arabic / English) support.
 * Loads from data/translations.json and data/phases.json when possible; uses embedded fallbacks for file://.
 */
(function (global) {
  const LANG_KEY = 'ninja-grc-lang';
  const DEFAULT_LANG = 'en';

  const DEFAULT_TRANSLATIONS = {"appTitle":{"en":"Ninja GRC - Report & Investigation Record","ar":"نينجا GRC - سجل البلاغات والتحقيقات"},"langAr":{"en":"Arabic","ar":"عربي"},"langEn":{"en":"English","ar":"English"},"navCases":{"en":"Cases","ar":"الحالات"},"navReports":{"en":"Reports","ar":"التقارير"},"navNotes":{"en":"Scoring Reference","ar":"مرجع التقييم"},"newCase":{"en":"New case","ar":"حالة جديدة"},"backToList":{"en":"Back to list","ar":"العودة للقائمة"},"save":{"en":"Save","ar":"حفظ"},"cancel":{"en":"Cancel","ar":"إلغاء"},"delete":{"en":"Delete","ar":"حذف"},"edit":{"en":"Edit","ar":"تعديل"},"noCases":{"en":"No cases yet. Click \"New case\" to add one.","ar":"لا توجد حالات بعد. انقر \"حالة جديدة\" للإضافة."},"caseId":{"en":"Case ID","ar":"رقم الحالة"},"receivedDate":{"en":"Received date","ar":"تاريخ الاستلام"},"complexityDays":{"en":"Complexity (days)","ar":"التعقيد (أيام)"},"targetCloseDate":{"en":"Target close date","ar":"تاريخ الإغلاق المستهدف"},"actualCloseDate":{"en":"Actual close date","ar":"تاريخ الإغلاق الفعلي"},"phase":{"en":"Phase","ar":"المرحلة"},"sovereignty":{"en":"Sovereignty","ar":"الأثر النظامي"},"financial":{"en":"Financial","ar":"القيمة المالية"},"evidence":{"en":"Evidence","ar":"جودة الأدلة"},"reputation":{"en":"Reputation","ar":"مخاطر السمعة"},"totalScore":{"en":"Total score","ar":"المجموع"},"path":{"en":"Path","ar":"المسار"},"pathGreen":{"en":"Green (4-8)","ar":"أخضر (4-8)"},"pathYellow":{"en":"Yellow (9-14)","ar":"أصفر (9-14)"},"pathRed":{"en":"Red (15-20)","ar":"أحمر (15-20)"},"sectionCaseInfo":{"en":"Case information","ar":"معلومات الحالة"},"sectionScoring":{"en":"Scoring","ar":"التقييم"},"sectionReporter":{"en":"Reporter","ar":"المُبلّغ"},"sectionClassification":{"en":"Classification","ar":"التصنيف"},"sectionScope":{"en":"Scope & team","ar":"النطاق والفريق"},"sectionProcess":{"en":"Process","ar":"الإجراءات"},"sectionInterview":{"en":"Interview","ar":"المقابلة"},"sectionEvidence":{"en":"Evidence","ar":"الأدلة"},"sectionExternalParties":{"en":"External parties","ar":"الأطراف الخارجية"},"sectionImpact":{"en":"Report content (Impact)","ar":"محتوى التقرير (الأثر)"},"name":{"en":"Name","ar":"الاسم"},"phone":{"en":"Phone","ar":"الهاتف"},"email":{"en":"Email","ar":"البريد الإلكتروني"},"notes":{"en":"Notes","ar":"ملاحظات"},"type":{"en":"Type","ar":"النوع"},"employee":{"en":"Employee","ar":"موظف"},"customer":{"en":"Customer","ar":"عميل"},"vendor":{"en":"Vendor","ar":"مورد"},"anonymous":{"en":"Anonymous","ar":"مجهول"},"empId":{"en":"Emp. ID","ar":"رقم الموظف"},"department":{"en":"Department","ar":"القسم"},"source":{"en":"Source","ar":"المصدر"},"sources":{"en":"Sources","ar":"المصادر"},"hotline":{"en":"Hotline","ar":"الخط الساخن"},"walkIn":{"en":"Walk-in","ar":"حضوري"},"website":{"en":"Website","ar":"الموقع"},"reportType":{"en":"Report type","ar":"نوع التقرير"},"internal":{"en":"Internal","ar":"داخلي"},"external":{"en":"External","ar":"خارجي"},"institutional":{"en":"Institutional","ar":"مؤسسي"},"thirdParty":{"en":"Third-party","ar":"طرف ثالث"},"geographic":{"en":"Geographic","ar":"الجغرافيا"},"ksa":{"en":"KSA","ar":"السعودية"},"currentStatus":{"en":"Current status","ar":"الموقف الحالي"},"statusOpen":{"en":"Open","ar":"مفتوح"},"statusInPrep":{"en":"In preparation","ar":"قيد التحضير"},"statusInProgress":{"en":"In progress","ar":"قيد التنفيذ"},"statusDraft":{"en":"Draft report","ar":"مسودة تقرير"},"statusClosed":{"en":"Closed","ar":"مغلق"},"exportJson":{"en":"Export JSON","ar":"تصدير JSON"},"exportCsv":{"en":"Export CSV","ar":"تصدير CSV"},"filterByPath":{"en":"Path","ar":"المسار"},"filterByPhase":{"en":"Phase","ar":"المرحلة"},"filterByStatus":{"en":"Status","ar":"الحالة"},"all":{"en":"All","ar":"الكل"},"allPaths":{"en":"All paths","ar":"كل المسارات"},"allStatuses":{"en":"All statuses","ar":"كل الحالات"},"controlRecommendations":{"en":"Control recommendations","ar":"توصيات التحكم"},"validationRequired":{"en":"This field is required.","ar":"هذا الحقل مطلوب."},"validationScore":{"en":"Score must be between 1 and 5.","ar":"الدرجة يجب أن تكون بين 1 و 5."},"saved":{"en":"Saved.","ar":"تم الحفظ."},"deleted":{"en":"Case deleted.","ar":"تم حذف الحالة."},"filterControlRecs":{"en":"Control recommendations only","ar":"توصيات التحكم فقط"},"showTip":{"en":"Show tips","ar":"عرض النصائح"},"hideTip":{"en":"Hide tips","ar":"إخفاء النصائح"},"city":{"en":"City","ar":"المدينة"},"pdplAction":{"en":"PDPL action","ar":"إجراء PDPL"},"reporterStatus":{"en":"Reporter status","ar":"حالة المُبلّغ"},"mandatoryLevel":{"en":"Mandatory level","ar":"مستوى الإلزام"},"editingCase":{"en":"Editing","ar":"تعديل"},"notesIntro":{"en":"Based on the unified report and investigation record. Use this as a guide when scoring cases.","ar":"استناداً إلى النموذج الموحد لسجل البلاغات والتحقيقات. استخدم هذا كمرجع عند تقييم الحالات."},"sectionProgressSection":{"en":"Section","ar":"المرحلة"},"sectionProgressOf":{"en":"of","ar":"من"}};

  const DEFAULT_PHASES = [{"id":1,"en":"Intake & Compliance Alignment","ar":"القيد والولاء التنظيمي"},{"id":2,"en":"Scope & Ownership","ar":"تصنيف النطاق والمسؤولية"},{"id":3,"en":"Governance & Risks","ar":"الحوكمة والقبول النظامي"},{"id":4,"en":"Interview Protocol","ar":"بروتوكول تخطيط وتنفيذ المقابلات"},{"id":5,"en":"Digital Evidence & Chain of Custody","ar":"الأدلة الرقمية وسلسلة الحيازة"},{"id":6,"en":"Third-Party & Anti-Tipping-off","ar":"التواصل مع الأطراف الثالثة ومنع \"التسريب\""},{"id":7,"en":"Reporting & Quality Control","ar":"هندسة التقارير، الجودة، والتحفظات"},{"id":8,"en":"Root Cause & Impact","ar":"التحليل الجذري والأثر"},{"id":9,"en":"Accountability & Master Closure","ar":"المساءلة، الإقرار الجامع، والإغلاق"},{"id":10,"en":"Report Quality Review","ar":"مراجعة جودة التقارير"},{"id":11,"en":"Whistleblower Incentives & Integrity","ar":"تحفيز ونزاهة المبلّغين"},{"id":12,"en":"Grievance (Appeal)","ar":"التظلم"}];

  let translations = {};
  let phases = [];
  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

  function loadJSON(path) {
    return fetch(path)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(path)))
      .catch(() => null);
  }

  function init() {
    return Promise.all([
      loadJSON('data/translations.json').then(t => { translations = t || DEFAULT_TRANSLATIONS; return translations; }),
      loadJSON('data/phases.json').then(p => { phases = (p && p.length) ? p : DEFAULT_PHASES; return phases; })
    ]).catch(() => {
      translations = DEFAULT_TRANSLATIONS;
      phases = DEFAULT_PHASES;
    }).then(() => [translations, phases]);
  }

  function t(key) {
    const entry = translations[key];
    if (!entry) return key;
    return entry[currentLang] || entry.en || entry.ar || key;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (lang !== 'ar' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    const root = document.documentElement;
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    return currentLang;
  }

  function getPhases() {
    return phases;
  }

  function getPhaseName(phaseNum) {
    const p = phases.find(x => x.id === phaseNum);
    if (!p) return String(phaseNum);
    return p[currentLang] || p.en || p.ar || String(phaseNum);
  }

  function applyDirLang() {
    setLang(currentLang);
  }

  global.NinjaI18n = {
    init,
    t,
    getLang,
    setLang,
    getPhases,
    getPhaseName,
    applyDirLang
  };
})(typeof window !== 'undefined' ? window : this);
