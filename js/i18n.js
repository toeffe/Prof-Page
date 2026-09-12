/* i18n — EN/DA dictionaries and applyLang. Exposed on window.TT.i18n */
(function () {
  'use strict';

  var dict = {
    en: {
      'nav.services': 'Services', 'nav.process': 'Process', 'nav.work': 'Work', 'nav.contact': 'Contact', 'nav.cta': 'Start a project',
      'nav.menu': 'Menu', 'nav.menuTitle': 'Navigate',
      'hero.eyebrow': 'Available for new projects',
      'hero.title': 'From idea to finished product.',
      'hero.sub': 'T Tek is an independent software consultancy. I take a project from a rough idea through design, build, and launch — one point of contact, start to finish.',
      'hero.cta1': 'Book a call', 'hero.cta2': 'See the work',
      'hero.proof1': 'projects shipped', 'hero.proof2': 'years building software', 'hero.proof3': 'industries served',
      'hero.step1': 'Describe — scope the actual problem', 'hero.step2': 'Design — plan the build',
      'hero.step3': 'Build — working software, iteratively', 'hero.step4': 'Implement — deployed into the real workflow',
      'trust.label': 'Work delivered for',
      'services.eyebrow': 'Services', 'services.title': 'What I do',
      'services.desc': 'Custom software and automation tools, built around a real workflow rather than a generic template.',
      'services.arkiv': 'Document intelligence pipeline — automated processing and archiving of incoming documents, with OCR and structured extraction built in.',
      'services.arkiv.li1': 'Automated document intake', 'services.arkiv.li2': 'OCR & structured data extraction', 'services.arkiv.li3': 'Production-ready pipelines',
      'services.autorep': 'Automated ETA lookup for inbound email requests. Reads .msg/.txt emails, extracts shipment references, matches them against a booking workbook, and writes reply-ready JSON for downstream automation such as Power Automate.',
      'services.emballage': 'Processes and analyzes pallet shipment data — works across multiple Excel formats, generates professional reports, and handles different customer types.',
      'process.eyebrow': 'Process', 'process.title': 'How a project runs',
      'process.s1.h': 'Describe', 'process.s1.p': 'Walk through the actual problem and the current workflow before anything gets built.',
      'process.s2.h': 'Design', 'process.s2.p': 'Plan the solution — what it needs to do, and what it deliberately won\u2019t.',
      'process.s3.h': 'Build', 'process.s3.p': 'Development happens iteratively, with working software to review along the way.',
      'process.s4.h': 'Implement', 'process.s4.p': 'Deployed into the real workflow it was built for, not just handed off as a file.',
      'work.eyebrow': 'Selected work', 'work.title': 'A few things we\u2019ve built', 'work.desc': 'Three projects, shown here as proof of capability.',
      'work.arkiv': 'Document intelligence pipeline — automated processing and archiving with OCR built in.',
      'work.autorep': 'Reads inbound shipment emails, looks up ETAs against a booking workbook, and writes reply-ready output for automation tools like Power Automate.',
      'work.emballage': 'Processes and analyzes pallet shipment data across multiple Excel formats, with professional report generation and per-customer handling.',
      'work.open': 'Details',
      'tag.automation': 'Automation', 'tag.email': 'Email Parsing', 'tag.reporting': 'Reporting', 'tag.logistics': 'Logistics',
      'sheet.close': 'Close', 'sheet.cta': 'Start a similar project', 'sheet.built': 'Built with',
      'contact.eyebrow': 'Contact', 'contact.title': 'Let\u2019s talk about your project',
      'contact.name': 'Name', 'contact.email': 'Email', 'contact.details': 'Project details', 'contact.send': 'Send message',
      'contact.name.ph': 'Your name', 'contact.details.ph': 'A few lines about what you\u2019re building',
      'contact.err.name': 'Please enter your name.', 'contact.err.email': 'Enter a valid email address.', 'contact.err.details': 'Tell me a little about the project.',
      'contact.sent': 'Your mail client should open now.',
      'contact.emailLabel': 'EMAIL', 'contact.phoneLabel': 'PHONE', 'contact.locationLabel': 'LOCATION', 'contact.responseLabel': 'RESPONSE TIME',
      'footer.copy': 'T Tek © 2026',
      'error.docTitle': 'Page not found — T Tek',
      'error.title': 'This page isn\u2019t here.',
      'error.sub': 'The link may be broken, or the page may have moved. Let\u2019s get you back on track.',
      'error.home': 'Back to home',
      'error.contact': 'Contact'
    },
    da: {
      'nav.services': 'Ydelser', 'nav.process': 'Proces', 'nav.work': 'Arbejde', 'nav.contact': 'Kontakt', 'nav.cta': 'Start et projekt',
      'nav.menu': 'Menu', 'nav.menuTitle': 'Navigér',
      'hero.eyebrow': 'Ledig til nye projekter',
      'hero.title': 'Fra idé til færdigt produkt.',
      'hero.sub': 'T Tek er et uafhængigt software\u00adkonsulenthus. Jeg tager et projekt fra en løs idé gennem design, udvikling og lancering — én kontaktperson, fra start til slut.',
      'hero.cta1': 'Book et opkald', 'hero.cta2': 'Se arbejdet',
      'hero.proof1': 'leverede projekter', 'hero.proof2': 'års erfaring med softwareudvikling', 'hero.proof3': 'brancher betjent',
      'hero.step1': 'Beskriv — afdæk det egentlige problem', 'hero.step2': 'Design — planlæg løsningen',
      'hero.step3': 'Byg — fungerende software, trin for trin', 'hero.step4': 'Implementér — sat i drift i den rigtige arbejdsgang',
      'trust.label': 'Løsninger leveret til',
      'services.eyebrow': 'Ydelser', 'services.title': 'Det jeg laver',
      'services.desc': 'Skræddersyet software og automatiseringsværktøjer, bygget omkring en reel arbejdsgang frem for en generisk skabelon.',
      'services.arkiv': 'Dokumentintelligens-pipeline — automatisk behandling og arkivering af indkomne dokumenter, med indbygget OCR og struktureret dataudtræk.',
      'services.arkiv.li1': 'Automatisk dokumentmodtagelse', 'services.arkiv.li2': 'OCR & struktureret dataudtræk', 'services.arkiv.li3': 'Produktionsklare pipelines',
      'services.autorep': 'Automatisk ETA-opslag for indgående e-mail\u00adforespørgsler. Læser .msg/.txt-mails, udtrækker fragtreferencer, matcher dem mod et bookingark og skriver svarklar JSON til automatisering som fx Power Automate.',
      'services.emballage': 'Behandler og analyserer palle\u00adfragtdata — arbejder på tværs af flere Excel-formater, genererer professionelle rapporter og håndterer forskellige kundetyper.',
      'process.eyebrow': 'Proces', 'process.title': 'Sådan forløber et projekt',
      'process.s1.h': 'Beskriv', 'process.s1.p': 'Vi gennemgår det egentlige problem og den nuværende arbejdsgang, før noget bygges.',
      'process.s2.h': 'Design', 'process.s2.p': 'Løsningen planlægges — hvad den skal kunne, og hvad den bevidst ikke skal.',
      'process.s3.h': 'Byg', 'process.s3.p': 'Udviklingen foregår trinvist, med fungerende software til gennemgang undervejs.',
      'process.s4.h': 'Implementér', 'process.s4.p': 'Sættes i drift i den arbejdsgang, den er bygget til — ikke bare afleveret som en fil.',
      'work.eyebrow': 'Udvalgt arbejde', 'work.title': 'Et par ting jeg har bygget', 'work.desc': 'Tre projekter, vist her som bevis på kompetencer.',
      'work.arkiv': 'Dokumentintelligens-pipeline — automatisk behandling og arkivering med indbygget OCR.',
      'work.autorep': 'Læser indgående fragt-mails, slår ETA op mod et bookingark og skriver svarklart output til automatiseringsværktøjer som Power Automate.',
      'work.emballage': 'Behandler og analyserer palle\u00adfragtdata på tværs af flere Excel-formater, med professionel rapportgenerering og kundespecifik håndtering.',
      'work.open': 'Detaljer',
      'tag.automation': 'Automatisering', 'tag.email': 'E-mail\u00adbehandling', 'tag.reporting': 'Rapportering', 'tag.logistics': 'Logistik',
      'sheet.close': 'Luk', 'sheet.cta': 'Start et lignende projekt', 'sheet.built': 'Bygget med',
      'contact.eyebrow': 'Kontakt', 'contact.title': 'Lad os tale om dit projekt',
      'contact.name': 'Navn', 'contact.email': 'E-mail', 'contact.details': 'Projektbeskrivelse', 'contact.send': 'Send besked',
      'contact.name.ph': 'Dit navn', 'contact.details.ph': 'Et par linjer om det, du vil have bygget',
      'contact.err.name': 'Skriv dit navn.', 'contact.err.email': 'Indtast en gyldig e-mailadresse.', 'contact.err.details': 'Fortæl lidt om projektet.',
      'contact.sent': 'Dit mailprogram burde åbne nu. Gør det ikke, så skriv til MathiasTJ@outlook.com.',
      'contact.emailLabel': 'E-MAIL', 'contact.phoneLabel': 'TELEFON', 'contact.locationLabel': 'LOKATION', 'contact.responseLabel': 'SVARTID',
      'footer.copy': 'T Tek © 2026',
      'error.docTitle': 'Siden findes ikke — T Tek',
      'error.title': 'Denne side er her ikke.',
      'error.sub': 'Linket kan være i stykker, eller siden er flyttet. Lad os få dig tilbage.',
      'error.home': 'Til forsiden',
      'error.contact': 'Kontakt'
    }
  };

  var STORAGE_KEY = 'toffe-lang';
  var current = 'en';
  var listeners = [];

  function t(key, lang) {
    var l = dict[lang || current];
    return l && l[key] !== undefined ? l[key] : (dict.en[key] !== undefined ? dict.en[key] : key);
  }

  function applyLang(lang) {
    if (!dict[lang]) return;
    current = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[lang][key] !== undefined) el.textContent = dict[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (dict[lang][key] !== undefined) el.setAttribute('placeholder', dict[lang][key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (dict[lang][key] !== undefined) el.setAttribute('aria-label', dict[lang][key]);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
    listeners.forEach(function (fn) { fn(lang); });
  }

  function detect() {
    var lang = 'en';
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'da') lang = stored;
      else if ((navigator.language || '').toLowerCase().indexOf('da') === 0) lang = 'da';
    } catch (e) { /* ignore */ }
    return lang;
  }

  window.TT = window.TT || {};
  window.TT.i18n = {
    dict: dict,
    t: t,
    apply: applyLang,
    detect: detect,
    get current() { return current; },
    onChange: function (fn) { listeners.push(fn); }
  };
})();
