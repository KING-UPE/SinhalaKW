// Sinhala KW | Kaushalya Wicramarachchi Official Script (Clean & Minimalist)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Dictionary (NO DASHES, PURE PROFESSIONAL COPY)
  const translations = {
    si: {
      navAbout: 'ගුරුතුමිය ගැන',
      navProcess: 'ක්‍රමවේදය',
      navPillars: 'සුවිශේෂතා',
      navClasses: 'පන්ති විස්තර',
      navResults: 'ප්‍රතිඵල',
      navFaq: 'ගැටලු',
      navContact: 'සම්බන්ධ වන්න',
      navEnroll: 'ලියාපදිංචිය',
      
      announcement: '2026 සහ 2027 සාමාන්‍ය පෙළ සිංහල නව පන්ති සඳහා ලියාපදිංචිය දැන් ඇරඹුණා!',
      
      heroBadge: 'ලංකාවේ අංක 1 සාමාන්‍ය පෙළ සිංහල වැඩපිළිවෙළ',
      heroTitle1: 'සාමාන්‍ය පෙළ සිංහලෙන්',
      heroTitleHighlight: 'A සාමාර්ථ 2ක්',
      heroTitle2: 'එකම තැනකින් සහතික කරන ක්‍රමවේදය',
      heroDesc: 'පේරාදෙණිය විශ්වවිද්‍යාලයේ ශාස්ත්‍රවේදී විශේෂ උපාධිධාරී කෞෂල්‍යා වික්‍රමාරච්චි ගුරුතුමියගේ පෞද්ගලික මඟපෙන්වීමෙන්, විෂය නිර්දේශය සිතුවම් සහ විශේෂ ක්‍රම ඔස්සේ සරලව ඉගෙන ගනිමු.',
      heroCtaWhatsapp: 'WhatsApp මඟින් සම්බන්ධ වන්න',
      heroCtaProcess: 'වැඩපිළිවෙළ බලන්න',
      
      stat1Number: '100%',
      stat1Label: 'සම්පූර්ණ විෂය නිර්දේශය සිතුවම් මඟින්',
      stat2Number: 'A 2ක්',
      stat2Label: 'භාෂාව සහ සාහිත්‍ය රසාස්වාදය එකම තැනින්',
      stat3Number: 'මාස 4ක්',
      stat3Label: 'විභාගයට පෙර සීඝ්‍ර ආවරණය සහ පුනරීක්ෂණය',
      stat4Number: 'දිවයින පුරා',
      stat4Label: 'නිබන්ධන කට්ටල නිවසටම බෙදාහැරීම',

      aboutBadge: 'ඔබේ ගුරුතුමිය',
      aboutName: 'කෞෂල්‍යා වික්‍රමාරච්චි',
      aboutDegree: 'Bachelor of Arts Special Degree, University of Peradeniya',
      aboutDesc1: 'අ.පො.ස උසස් පෙළ කලා අංශයෙන් A සාමාර්ථ 3 ක් ලබාගෙන පේරාදෙණිය විශ්වවිද්‍යාලයේ ශාස්ත්‍ර පීඨයට ඇතුළත් වී පන්ති සාමාර්ථ සහිතව විශේෂ උපාධිය ලබාගෙන ඇත.',
      aboutDesc2: 'සාමාන්‍ය පෙළ සිංහල භාෂාව හා සාහිත්‍යය, සිංහල සාහිත්‍ය රසාස්වාදය විෂයන් දෙකෙහි දේශිකාවියක් ලෙස ඉතා සාර්ථක ඉගැන්වීම් රටාවක් සහ ක්‍රමවත් වැඩපිළිවෙළක් තුළින් කෙටි කාලයක් තුළ දී ලංකාව පුරා විහිදී සිටින සිසුන් රාශියකට සිය සාමාන්‍ය පෙළ ප්‍රතිඵල ලේඛනයේ A සාමාර්ථ 2 ක් ලබාගැනීම සඳහා එක් ගුරුවරියක ලෙස මඟපෙන්වීමට සමත්ව ඇත.',

      processBadge: 'අපගේ ක්‍රමවේදය',
      processTitle: 'A සාමාර්ථ 2ක් දක්වා ඔබව රැගෙන යන පියවර 6',
      processSubtitle: 'විෂය නිර්දේශයේ ආරම්භයේ සිට අවසන් විභාග ශාලාව දක්වා ශිෂ්‍යයා ක්‍රමානුකූලව මෙහෙයවන පූර්ණ අධ්‍යාපනික වැඩපිළිවෙළ.',
      step1Title: 'සිද්ධාන්ත පන්තිය (Theory Class)',
      step1Desc: 'විෂය නිර්දේශයේ සියලු කොටස් සිතුවම් සහ විශේෂ ක්‍රම ඔස්සේ මුල සිට සරලව මනසේ තැන්පත් කරවීම.',
      step2Title: 'සජීවී විභාග සහ ශ්‍රේණිගත කිරීම් (Live Exam)',
      step2Desc: 'පන්ති වේලාව තුළදීම ප්‍රශ්න පත්‍ර ලිවීම, ලකුණු ලබාදීම සහ දිවයිනේ ශ්‍රේණිගත කිරීම් මඟින් ශිෂ්‍යයා නිරන්තරයෙන් ඇගයීම.',
      step3Title: 'මාස 4ක සීඝ්‍ර පුනරීක්ෂණය (Rapid Revision)',
      step3Desc: 'විභාගයට මාස 4කට පෙර සම්පූර්ණ විෂය නිර්දේශය නැවත ආවරණය කරමින් සියලු අංශ ශක්තිමත් කිරීම.',
      step4Title: 'Final Shot ප්‍රශ්න පත්‍ර පන්තිය',
      step4Desc: 'විභාග රටාවටම අනුකූලව ගුරුතුමිය සකසන ලද විශේෂ ප්‍රශ්න පත්‍ර ලිවීම, සම්පූර්ණ සිද්ධාන්ත සාකච්ඡාව සහ ලකුණු ගැනීමේ රහස්.',
      step5Title: 'විශේෂ සම්මන්ත්‍රණ මාලාව (Seminars)',
      step5Desc: 'වාර විභාග සහ අවසන් විභාගයට සූදානම් කරවන Term Test Revise Seminar, MCQ Seminar සහ විශේෂ අවසන් සම්මන්ත්‍රණ.',
      step6Title: 'පටිගත කළ පන්ති (Recorded Classes)',
      step6Desc: 'සජීවීව සම්බන්ධ වීමට නොහැකි සිසුන්ට විභාගය දක්වාම නැවත නැවත නැරඹීමේ පහසුකම සහ පුද්ගලික අධීක්ෂණය.',

      pillarBadge: 'සුවිශේෂත්වයන්',
      pillarTitle: 'වැඩ කරන සිංහල පන්තියේ සුවිශේෂී කුලුනු 3',
      pillar1Title: 'Tutes නිවසටම ගෙන්වා ගැනීම',
      pillar1Desc: 'ක්‍රමානුකූල වැඩපිළිවෙළට අදාළ සම්පූර්ණ මුද්‍රිත නිබන්ධන කට්ටල නිවසටම: Theory Tute, Paper Tutes, Q Book, MCQ Tute සහ Final Guess Papers.',
      pillar2Title: 'පන්තියේදීම විභාග හුරුව',
      pillar2Desc: 'පන්තිය තුළදීම විචාර, රසවින්දන ඇතුළු සියලු ප්‍රශ්න නියමිත කාලයට ලිවීමේ කාල කළමනාකරණ අත්දැකීම ලබා දීම.',
      pillar3Title: 'සිසුන්ගේ වැඩ පෞද්ගලිකව පරීක්ෂා කිරීම',
      pillar3Desc: 'ගුරුතුමිය විසින්ම පන්තියේදී සහ WhatsApp හරහා සිසුන්ගේ විචාර ඇතුළු වැඩ පරීක්ෂා කිරීම, ලකුණු ලබාදීම සහ ශිෂ්‍යයා නිවැරදි දිශානතියට යොමු කිරීම.',

      classesBadge: 'පන්ති පැවැත්වෙන ස්ථාන සහ ක්‍රම',
      classesTitle: 'ඔබට පහසු ක්‍රමයකින් සම්බන්ධ වන්න',
      tabOnline: 'ONLINE (දිවයින පුරා)',
      tabMathugama: 'ZINERGY මතුගම',
      tabMeegahathenna: 'LAYARA මීගහතැන්න',
      
      onlineTitle: 'ONLINE පන්තිය ශ්‍රී ලංකාව පුරාම නිවසේ සිට',
      onlinePoint1: 'HD තාක්ෂණයෙන් සජීවී Zoom දේශන සහ පටිගත කිරීම් (Recordings)',
      onlinePoint2: 'මුද්‍රිත නිබන්ධන කට්ටල කුරියර් මඟින් නිවසටම ප්‍රවාහනය',
      onlinePoint3: 'WhatsApp හරහා ගුරුතුමිය විසින්ම පෞද්ගලිකව වැඩ පරීක්ෂා කිරීම',

      mathugamaTitle: 'ZINERGY මතුගම භෞතික පන්තිය',
      mathugamaPoint1: 'සම්පූර්ණ වායුසමනය කළ නවීන දේශන ශාලා පහසුකම්',
      mathugamaPoint2: 'පන්තිය තුළදීම විභාග ප්‍රශ්න පත්‍ර ලිවීම සහ ගුරුතුමිය අතින්ම ඇගයීම',
      mathugamaPoint3: 'මුද්‍රිත සම්පූර්ණ නිබන්ධන කට්ටල පන්තියේදීම ලබාදීම',

      meegahathennaTitle: 'LAYARA මීගහතැන්න භෞතික පන්තිය',
      meegahathennaPoint1: 'පුළුල් ඉඩකඩ සහිත සුවපහසු ඉගෙනුම් පරිසරය',
      meegahathennaPoint2: 'සතිපතා ප්‍රශ්න පත්‍ර ලිවීම සහ එක් එක් ශිෂ්‍යයාට පුද්ගලික අවධානය',
      meegahathennaPoint3: 'සියලු සිද්ධාන්ත නිබන්ධන සහ ප්‍රශ්න පත්‍ර කට්ටල පන්තියේදීම',

      resultsBadge: 'සාක්ෂි සහිත විශිෂ්ට ප්‍රතිඵල',
      resultsTitle: 'සිසුන්ගේ සැබෑ විභාග ප්‍රතිඵල ලේඛන',
      resultsSubtitle: 'සාමාන්‍ය පෙළ විභාග දෙපාර්තමේන්තුවේ නිල ප්‍රතිඵල පත්‍රිකා මඟින් තහවුරු වූ ද්විත්ව A සහ B සාමාර්ථ.',

      galleryBadge: 'ඡායාරූප ගැලරිය',
      galleryTitle: 'පන්ති කාමර සහ සම්මන්ත්‍රණ මතක',

      faqBadge: 'නිතර අසන ගැටලු',
      faqTitle: 'ඔබට දැනගැනීමට අවශ්‍ය සියල්ල',
      faq1Q: 'ONLINE සිසුන්ට නිබන්ධන ලැබෙන්නේ කෙසේද?',
      faq1A: 'ලියාපදිංචි වූ පසු අදාළ මාසයේ සියලුම මුද්‍රිත නිබන්ධන කට්ටල (Theory, Paper Tutes, Q Books) කුරියර් සේවාව මඟින් ආරක්ෂිතව ඔබේ නිවසටම ගෙන්වා දෙනු ලැබේ.',
      faq2Q: 'සජීවී පන්තිය මඟහැරුණහොත් නැවත නැරඹිය හැකිද?',
      faq2A: 'ඔව්. සෑම සජීවී පන්තියකම උසස් තාක්ෂණික පටිගත කිරීම් (Recordings) අපගේ ශිෂ්‍ය පද්ධතිය තුළින් විභාගය අවසන් වන තෙක් ඕනෑම වේලාවක නැවත නැරඹිය හැක.',
      faq3Q: 'ලිඛිත පිළිතුරු ගුරුතුමිය පෞද්ගලිකව පරීක්ෂා කරනවාද?',
      faq3A: 'නියත වශයෙන්ම. භෞතික සහ ඔන්ලයින් පන්ති දෙකෙහිම සිසුන් ලියන විචාර, රසවින්දන සහ ප්‍රශ්න පත්‍ර ගුරුතුමිය විසින්ම පෞද්ගලිකව පරීක්ෂා කර ලකුණු සහ උපදෙස් ලබා දේ.',
      faq4Q: 'නව පන්ති සඳහා ලියාපදිංචි වන්නේ කෙසේද?',
      faq4A: 'අපගේ නිල WhatsApp අංකය වන 074 362 4117 වෙත පණිවිඩයක් එවන්න. නැතහොත් පහත පෝරමය පුරවා ක්ෂණිකව ලියාපදිංචි වන්න.',

      contactBadge: 'සම්බන්ධ වන්න',
      contactTitle: 'ඔබේ A සාමාර්ථයේ ගමන අදම අරඹන්න',
      formTitle: 'ක්ෂණික ලියාපදිංචි වීමේ පෝරමය',
      formName: 'ශිෂ්‍යයාගේ නම',
      formPhone: 'WhatsApp දුරකථන අංකය',
      formSchool: 'පාසල',
      formGrade: 'ශ්‍රේණිය',
      formMode: 'පන්ති මාදිලිය',
      formBtn: 'WhatsApp මඟින් ලියාපදිංචි වන්න'
    },
    en: {
      navAbout: 'About',
      navProcess: 'Methodology',
      navPillars: 'Pillars',
      navClasses: 'Classes',
      navResults: 'Results',
      navFaq: 'FAQ',
      navContact: 'Contact',
      navEnroll: 'Enroll Now',
      
      announcement: 'Registrations are now open for 2026 and 2027 O/L Sinhala batches!',
      
      heroBadge: 'Sri Lanka No 1 O/L Sinhala Program',
      heroTitle1: 'Guaranteeing',
      heroTitleHighlight: 'Double A Passes',
      heroTitle2: 'in Ordinary Level Sinhala',
      heroDesc: 'Under the personal guidance of Teacher Kaushalya Wicramarachchi, BA Special Degree graduate from the University of Peradeniya, master the syllabus with pictorial illustrations and proven shortcuts.',
      heroCtaWhatsapp: 'Enroll via WhatsApp',
      heroCtaProcess: 'View Methodology',
      
      stat1Number: '100%',
      stat1Label: 'Complete syllabus with mind-mapping',
      stat2Number: '2 A Grades',
      stat2Label: 'Sinhala Language and Literature from one tutor',
      stat3Number: '4 Months',
      stat3Label: 'Comprehensive rapid revision before the exam',
      stat4Number: 'Island-wide',
      stat4Label: 'Direct doorstep tute pack delivery',

      aboutBadge: 'Your Teacher',
      aboutName: 'Kaushalya Wicramarachchi',
      aboutDegree: 'Bachelor of Arts Special Degree, University of Peradeniya',
      aboutDesc1: 'Achieved 3 A passes in G.C.E. Advanced Level Arts Stream, entered the Faculty of Arts at the University of Peradeniya, and graduated with a Special Degree with Class Honours.',
      aboutDesc2: 'As a renowned educator for both O/L Sinhala Language & Literature and Sinhala Literature Appreciation, she has guided hundreds of students across Sri Lanka to achieve double A distinctions through a methodical and proven curriculum.',

      processBadge: 'Our 6-Step System',
      processTitle: 'The 6-Step Pathway to Double A Distinctions',
      processSubtitle: 'A structured educational roadmap leading each student safely from basic theory to the final exam hall.',
      step1Title: '01. Theory Classes',
      step1Desc: 'Syllabus delivered from ground up using conceptual diagrams, memory frameworks, and simplified literature insights.',
      step2Title: '02. Live Exams & Ranking',
      step2Desc: 'Weekly exam papers written under timed conditions, scored personally, with island-wide student ranking.',
      step3Title: '03. 4-Month Rapid Revision',
      step3Desc: 'An intensive 4-month program consolidating and reviewing the entire syllabus ahead of the exam.',
      step4Title: '04. Final Shot Paper Class',
      step4Desc: 'Specially crafted prediction papers mirroring exact exam patterns, with detailed marking breakdowns.',
      step5Title: '05. Special Seminars',
      step5Desc: 'Focused specialized seminar series including Term Test Revise Seminars, MCQ Seminars, and Final Night Seminars.',
      step6Title: '06. Class Recordings',
      step6Desc: 'High-definition recordings accessible anytime until the final exam, backed by ongoing teacher supervision.',

      pillarBadge: 'Exclusive Highlights',
      pillarTitle: '3 Core Pillars of Our Successful Program',
      pillar1Title: 'Doorstep Delivery of Tutes',
      pillar1Desc: 'Complete printed tute packs delivered right to your home: Theory Tutes, Paper Tutes, Q Books, MCQ Packs, and Final Guess Papers.',
      pillar2Title: 'In-Class Real Exam Training',
      pillar2Desc: 'Practicing timed essay writing, critiques, and answer composition directly during class hours.',
      pillar3Title: 'Direct Teacher Review',
      pillar3Desc: 'Essays, critiques, and homework checked and scored personally by the teacher both in class and via WhatsApp.',

      classesBadge: 'Locations & Modes',
      classesTitle: 'Flexible Learning Designed for Every Student',
      tabOnline: 'ONLINE (Island-wide)',
      tabMathugama: 'ZINERGY Mathugama',
      tabMeegahathenna: 'LAYARA Meegahathenna',
      
      onlineTitle: 'ONLINE Platform: Learn from Anywhere in Sri Lanka',
      onlinePoint1: 'Live Zoom lectures in HD plus on-demand class recordings',
      onlinePoint2: 'Printed monthly tute sets delivered to your doorstep via courier',
      onlinePoint3: 'Personal marking and guidance from the teacher via WhatsApp',

      mathugamaTitle: 'ZINERGY Mathugama Physical Class',
      mathugamaPoint1: 'Fully air-conditioned lecture facility with comfortable seating',
      mathugamaPoint2: 'In-class paper sessions scored and evaluated on the spot',
      mathugamaPoint3: 'Printed comprehensive study materials provided directly in class',

      meegahathennaTitle: 'LAYARA Meegahathenna Physical Class',
      meegahathennaPoint1: 'Spacious and welcoming academic environment',
      meegahathennaPoint2: 'Weekly in-person paper writing and dedicated attention',
      meegahathennaPoint3: 'Full theory tutes and question books provided in class',

      resultsBadge: 'Proven Results',
      resultsTitle: 'Authentic Student Exam Results',
      resultsSubtitle: 'Official Department of Examinations result sheets demonstrating verified double A distinctions.',

      galleryBadge: 'Photo Gallery',
      galleryTitle: 'Classroom & Seminar Moments',

      faqBadge: 'FAQ',
      faqTitle: 'Frequently Asked Questions',
      faq1Q: 'How do ONLINE students receive printed materials?',
      faq1A: 'Upon registration, complete printed monthly tute packages (Theory, Paper Tutes, Q Books) are dispatched directly to your doorstep by express courier.',
      faq2Q: 'What happens if a student misses a live session?',
      faq2A: 'Full HD recordings of every class are available 24/7 on our student portal until the conclusion of the O/L examination.',
      faq3Q: 'Does the teacher personally mark written essays?',
      faq3A: 'Yes, essays and exam papers submitted by both physical and online students are reviewed and scored personally by Teacher Kaushalya.',
      faq4Q: 'How do I register for upcoming classes?',
      faq4A: 'Send a message to our official WhatsApp hotline at 074 362 4117 or fill out the quick registration form below.',

      contactBadge: 'Contact Us',
      contactTitle: 'Begin Your Double A Journey Today',
      formTitle: 'Quick Registration Form',
      formName: 'Student Name',
      formPhone: 'WhatsApp Mobile Number',
      formSchool: 'School Name',
      formGrade: 'Grade Batch',
      formMode: 'Preferred Class Mode',
      formBtn: 'Register via WhatsApp'
    }
  };

  let currentLang = 'si';

  // Apply Language
  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    const langBtnText = document.getElementById('langToggleText');
    if (langBtnText) {
      langBtnText.textContent = lang === 'si' ? 'English' : 'සිංහල';
    }
    const mobileLangBtn = document.getElementById('mobileLangToggleBtn');
    if (mobileLangBtn) {
      mobileLangBtn.textContent = lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න';
    }
  }

  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      applyLanguage(currentLang === 'si' ? 'en' : 'si');
    });
  }

  const mobileLangBtn = document.getElementById('mobileLangToggleBtn');
  if (mobileLangBtn) {
    mobileLangBtn.addEventListener('click', () => {
      applyLanguage(currentLang === 'si' ? 'en' : 'si');
    });
  }

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  if (mobileMenuBtn && mobileNavMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavMenu.classList.toggle('hidden');
    });
    // Close menu when a link is clicked
    mobileNavMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavMenu.classList.add('hidden');
      });
    });
  }

  // 3. Class Location Tabs Switcher (NO ACTIVE CLASS CONFLICTS)
  const classTabs = document.querySelectorAll('.class-tab-btn');
  const classContents = document.querySelectorAll('.class-tab-pane');
  classTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      // Reset all buttons
      classTabs.forEach(t => {
        t.classList.remove('active', 'bg-[#FFC20E]', 'text-slate-950', 'border-[#FFC20E]');
        t.classList.add('text-slate-600', 'border-slate-200', 'bg-white');
      });

      // Highlight active button
      tab.classList.add('active', 'bg-[#FFC20E]', 'text-slate-950', 'border-[#FFC20E]');
      tab.classList.remove('text-slate-600', 'border-slate-200', 'bg-white');

      // Show targeted pane
      classContents.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.remove('hidden');
          pane.classList.add('block');
        } else {
          pane.classList.remove('block');
          pane.classList.add('hidden');
        }
      });
    });
  });

  // 4. Gallery Category Filter
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryFilters.forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      const filter = filterBtn.getAttribute('data-filter');

      galleryFilters.forEach(b => {
        b.classList.remove('active', 'bg-[#235E83]', 'text-white');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      filterBtn.classList.add('active', 'bg-[#235E83]', 'text-white');
      filterBtn.classList.remove('bg-slate-100', 'text-slate-700');

      galleryItems.forEach(item => {
        if (filter === 'all' || item.classList.contains(filter)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // 5. Result Sheets Lightbox Modal
  const modal = document.getElementById('resultModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  document.querySelectorAll('.result-card-trigger').forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      const title = card.getAttribute('data-title');
      if (modal && modalImg && imgSrc) {
        modalImg.src = imgSrc;
        if (modalTitle && title) modalTitle.textContent = title;
        modal.classList.add('active');
      }
    });
  });

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // 6. FAQ Accordion
  document.querySelectorAll('.faq-accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const arrow = btn.querySelector('.faq-arrow');
      const isExpanded = !content.classList.contains('hidden');

      // Close all first for clean single-item focus
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-arrow').forEach(a => a.classList.remove('rotate-180'));

      if (!isExpanded) {
        content.classList.remove('hidden');
        if (arrow) arrow.classList.add('rotate-180');
      }
    });
  });

  // 7. Video Player Controls
  const mainVideo = document.getElementById('mainIntroVideo');
  const playOverlay = document.getElementById('videoPlayOverlay');
  const soundBtn = document.getElementById('videoSoundBtn');

  if (mainVideo && playOverlay) {
    playOverlay.addEventListener('click', () => {
      if (mainVideo.paused) {
        mainVideo.play();
        playOverlay.style.opacity = '0';
        playOverlay.style.pointerEvents = 'none';
      } else {
        mainVideo.pause();
        playOverlay.style.opacity = '1';
        playOverlay.style.pointerEvents = 'auto';
      }
    });

    mainVideo.addEventListener('click', () => {
      if (!mainVideo.paused) {
        mainVideo.pause();
        playOverlay.style.opacity = '1';
        playOverlay.style.pointerEvents = 'auto';
      }
    });

    mainVideo.addEventListener('ended', () => {
      playOverlay.style.opacity = '1';
      playOverlay.style.pointerEvents = 'auto';
    });
  }

  if (soundBtn && mainVideo) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainVideo.muted = !mainVideo.muted;
      soundBtn.classList.toggle('opacity-50', mainVideo.muted);
    });
  }

  // 8. Quick WhatsApp Registration Form Submission
  const quickForm = document.getElementById('quickRegisterForm');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const school = document.getElementById('regSchool').value.trim();
      const grade = document.getElementById('regGrade').value;
      const mode = document.getElementById('regMode').value;

      const message = `ආයුබෝවන් ගුරුතුමියනි,\nමම Sinhala KW වෙබ් අඩවිය හරහා ලියාපදිංචි වීමට කැමැත්තෙමි.\n\n` +
        `• ශිෂ්‍යයාගේ නම: ${name}\n` +
        `• WhatsApp අංකය: ${phone}\n` +
        `• පාසල: ${school}\n` +
        `• ශ්‍රේණිය: ${grade}\n` +
        `• පන්ති මාදිලිය: ${mode}\n\n` +
        `කරුණාකර පන්ති සම්බන්ධ වැඩිදුර තොරතුරු සහ සම්බන්ධ වීමේ ක්‍රමවේදය දන්වන්න. ස්තූතියි!`;

      const whatsappUrl = `https://wa.me/94743624117?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
});
