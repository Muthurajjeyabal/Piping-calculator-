/**
 * MU Piping Calculator - Main Application
 */
(function () {
  "use strict";

  // State
  let currentPage = "dashboard";
  let favorites = JSON.parse(localStorage.getItem("mu_favs") || "[]");
  let recent = JSON.parse(localStorage.getItem("mu_recent") || "[]");
  let theme = localStorage.getItem("mu_theme") || "dark";

  // NPS options
  const NPS_LIST = Object.keys(PIPE_DATA.pipes);
  const SCH_COMMON = ["5", "10", "20", "30", "40", "STD", "60", "80", "XS", "100", "120", "140", "160", "XXS"];

  // Init
  
  // ========== i18n: EN / HI / PT ==========
  const I18N = {
    en: {
      appName: "MU Piping Calculator",
      tagline: "Fast. Accurate. Professional",
      home: "Home", fav: "Fav", search: "Search", recent: "Recent", formulas: "Formulas", notes: "Notes",
      favorites: "Favorites", recentTitle: "Recent", formulasTitle: "Formula Library", notesTitle: "Engineering Notes",
      favSub: "Your starred calculators", recentSub: "Last used calculators",
      formulasSub: "ASME & industry standard formulas", notesSub: "Quick reference & best practices",
      calculate: "Calculate", reset: "Reset", copy: "Copy", share: "Share", pdf: "PDF",
      searchPlaceholder: "Search calculators…", noFav: "No favorites yet. Tap ★ on any calculator.",
      noRecent: "No recent calculations.", copied: "Copied to clipboard", addedFav: "Added to favorites",
      removedFav: "Removed from favorites", tools: "Tools", allCalcs: "All Calculators",
      language: "Language", theme: "Theme"
    },
    hi: {
      appName: "MU पाइपिंग कैलकुलेटर",
      tagline: "तेज़. सटीक. पेशेवर",
      home: "होम", fav: "पसंदीदा", search: "खोज", recent: "हालिया", formulas: "सूत्र", notes: "नोट्स",
      favorites: "पसंदीदा", recentTitle: "हालिया", formulasTitle: "सूत्र लाइब्रेरी", notesTitle: "इंजीनियरिंग नोट्स",
      favSub: "आपके स्टार वाले कैलकुलेटर", recentSub: "अंतिम उपयोग",
      formulasSub: "ASME और मानक सूत्र", notesSub: "त्वरित संदर्भ",
      calculate: "गणना करें", reset: "रीसेट", copy: "कॉपी", share: "शेयर", pdf: "PDF",
      searchPlaceholder: "कैलकुलेटर खोजें…", noFav: "अभी कोई पसंदीदा नहीं। ★ टैप करें।",
      noRecent: "कोई हालिया गणना नहीं।", copied: "क्लिपबोर्ड पर कॉपी", addedFav: "पसंदीदा में जोड़ा",
      removedFav: "पसंदीदा से हटाया", tools: "टूल्स", allCalcs: "सभी कैलकुलेटर",
      language: "भाषा", theme: "थीम"
    },
    pt: {
      appName: "MU Calculadora de Tubulação",
      tagline: "Rápido. Preciso. Profissional",
      home: "Início", fav: "Fav", search: "Buscar", recent: "Recentes", formulas: "Fórmulas", notes: "Notas",
      favorites: "Favoritos", recentTitle: "Recentes", formulasTitle: "Biblioteca de Fórmulas", notesTitle: "Notas de Engenharia",
      favSub: "Seus calculadores favoritos", recentSub: "Usados recentemente",
      formulasSub: "Fórmulas ASME e padrões", notesSub: "Referência rápida",
      calculate: "Calcular", reset: "Resetar", copy: "Copiar", share: "Compartilhar", pdf: "PDF",
      searchPlaceholder: "Buscar calculadoras…", noFav: "Nenhum favorito. Toque ★ em qualquer calculadora.",
      noRecent: "Nenhum cálculo recente.", copied: "Copiado", addedFav: "Adicionado aos favoritos",
      removedFav: "Removido dos favoritos", tools: "Ferramentas", allCalcs: "Todas as Calculadoras",
      language: "Idioma", theme: "Tema"
    },
    ta: {
      appName: "MU பைப்பிங் கால்குலேட்டர்",
      tagline: "வேகமாக. துல்லியமாக. தொழில்முறை",
      home: "முகப்பு", fav: "பிடித்தவை", search: "தேடல்", recent: "சமீபத்திய", formulas: "சூத்திரங்கள்", notes: "குறிப்புகள்",
      favorites: "பிடித்தவை", recentTitle: "சமீபத்தியவை", formulasTitle: "சூத்திர நூலகம்", notesTitle: "பொறியியல் குறிப்புகள்",
      favSub: "நீங்கள் நட்சத்திரமிட்ட கால்குலேட்டர்கள்", recentSub: "கடைசியாக பயன்படுத்தியவை",
      formulasSub: "ASME மற்றும் தொழில் தர சூத்திரங்கள்", notesSub: "விரைவு குறிப்பு & நடைமுறைகள்",
      calculate: "கணக்கிடு", reset: "மீட்டமை", copy: "நகலெடு", share: "பகிர்", pdf: "PDF",
      searchPlaceholder: "கால்குலேட்டர் தேடு…", noFav: "பிடித்தவை இல்லை. எந்த கால்குலேட்டரிலும் ★ அழுத்துங்கள்.",
      noRecent: "சமீபத்திய கணக்குகள் இல்லை.", copied: "நகலெடுக்கப்பட்டது", addedFav: "பிடித்தவையில் சேர்க்கப்பட்டது",
      removedFav: "பிடித்தவையிலிருந்து நீக்கப்பட்டது", tools: "கருவிகள்", allCalcs: "அனைத்து கால்குலேட்டர்கள்",
      language: "மொழி", theme: "தீம்"
    },
  };

  // Calculator titles/descriptions per language
  const CALC_I18N = {
    hi: {
      "pipe-weight": ["पाइप वजन", "खाली, पानी भरा, इंसुलेटेड"],
      "pipe-volume": ["पाइप आयतन", "आंतरिक आयतन और क्षमता"],
      "pipe-schedule": ["पाइप शेड्यूल", "NPS, DN, मोटाई, OD/ID"],
      "pipe-length": ["पाइप लंबाई", "केंद्र रेखा, कट, विकसित"],
      "elbow": ["एल्बो", "LR/SR चाप और केंद्र-से-अंत"],
      "mitre-bend": ["माइटर बेंड", "कट, कोण, विकसित लंबाई"],
      "rolling-offset": ["रोलिंग ऑफसेट", "ट्रैवल, कोण, पाइप लंबाई"],
      "flange": ["फ्लैंज", "BCD, बोल्ट, स्टड लंबाई"],
      "bolt-torque": ["बोल्ट टॉर्क", "ड्राई और लुब्रिकेटेड"],
      "hydrotest": ["हाइड्रोटेस्ट", "टेस्ट प्रेशर और आयतन"],
      "b31-3-stress": ["B31.3 स्ट्रेस", "दीवार मोटाई, स्ट्रेस"],
      "surface-area": ["सतह क्षेत्र", "बाहरी और आंतरिक"],
      "painting": ["पेंटिंग", "पेंट आयतन अनुमान"],
      "insulation": ["इंसुलेशन", "आयतन, द्रव्यमान, बाहरी क्षेत्र"],
      "support-spacing": ["सपोर्ट स्पेसिंग", "अधिकतम स्पन"],
      "welding": ["वेल्डिंग", "वेल्ड लंबाई और फिलर"],
      "mto": ["MTO", "मटीरियल टेक-ऑफ"],
      "cog": ["गुरुत्वाकर्षण केंद्र", "3D CoG"],
      "geometry": ["ज्यामिति कैलकुलेटर", "त्रिभुज, वृत्त, सिलेंडर…"],
      "elbow-data": ["एल्बो डेटा", "ASME B16.9 आयाम"],
      "ref-library": ["संदर्भ लाइब्रेरी", "टी, रिड्यूसर, OD, शेड्यूल"],
      "unit-converter": ["यूनिट कनवर्टर", "mm, inch, bar, psi, °C…"]
    },
    pt: {
      "pipe-weight": ["Peso do Tubo", "Vazio, com água, isolado"],
      "pipe-volume": ["Volume do Tubo", "Volume interno e capacidade"],
      "pipe-schedule": ["Schedule do Tubo", "NPS, DN, espessura, OD/ID"],
      "pipe-length": ["Comprimento do Tubo", "Linha de centro, corte, desenvolvido"],
      "elbow": ["Curva (Elbow)", "Arco LR/SR e centro-a-extremidade"],
      "mitre-bend": ["Curva Miturada", "Cortes, ângulo, comprimento"],
      "rolling-offset": ["Offset Rolante", "Percurso, ângulo, comprimento"],
      "flange": ["Flange", "BCD, parafusos, comprimento do stud"],
      "bolt-torque": ["Torque do Parafuso", "Seco e lubrificado"],
      "hydrotest": ["Teste Hidrostático", "Pressão e volume de teste"],
      "b31-3-stress": ["Análise B31.3", "Espessura e tensões"],
      "surface-area": ["Área de Superfície", "Externa e interna"],
      "painting": ["Pintura", "Estimativa de tinta"],
      "insulation": ["Isolamento", "Volume, massa, área externa"],
      "support-spacing": ["Espaçamento de Suporte", "Vão máximo"],
      "welding": ["Soldagem", "Comprimento e consumível"],
      "mto": ["MTO", "Lista de materiais"],
      "cog": ["Centro de Gravidade", "CoG 3D"],
      "geometry": ["Calculadora de Geometria", "Triângulo, círculo, cilindro…"],
      "elbow-data": ["Dados de Curva", "Dimensões ASME B16.9"],
      "ref-library": ["Biblioteca de Referência", "Tee, Redução, OD, Schedule"],
      "unit-converter": ["Conversor de Unidades", "mm, inch, bar, psi, °C…"]
    },
    ta: {
      "pipe-weight": ["பைப் எடை", "காலி, நீர் நிரப்பிய, இன்சுலேட்டட்"],
      "pipe-volume": ["பைப் கொள்ளளவு", "உள் கொள்ளளவு மற்றும் திறன்"],
      "pipe-schedule": ["பைப் ஷெட்யூல்", "NPS, DN, தடிமன், OD/ID"],
      "pipe-length": ["பைப் நீளம்", "மையக் கோடு, வெட்டு, டெவலப்ட்"],
      "elbow": ["எல்போ", "LR/SR வளைவு மற்றும் மையம்-முடிவு"],
      "mitre-bend": ["மைட்டர் பெண்ட்", "வெட்டுகள், கோணம், டெவலப்ட் நீளம்"],
      "rolling-offset": ["ரோலிங் ஆஃப்செட்", "டிராவல், கோணம், பைப் நீளம்"],
      "flange": ["ஃபிளாஞ்ச்", "BCD, போல்ட், ஸ்டட் நீளம்"],
      "bolt-torque": ["போல்ட் டார்க்", "உலர் மற்றும் லூப்ரிகேட்டட்"],
      "hydrotest": ["ஹைட்ரோடெஸ்ட்", "டெஸ்ட் அழுத்தம் மற்றும் கொள்ளளவு"],
      "b31-3-stress": ["B31.3 அழுத்த பகுப்பாய்வு", "சுவர் தடிமன், அழுத்தம்"],
      "surface-area": ["மேற்பரப்பு பரப்பளவு", "வெளிப்புறம் மற்றும் உள்"],
      "painting": ["பெயிண்டிங்", "பெயிண்ட் அளவு மதிப்பீடு"],
      "insulation": ["இன்சுலேஷன்", "கொள்ளளவு, நிறை, வெளிப்பரப்பு"],
      "support-spacing": ["சப்போர்ட் இடைவெளி", "அதிகபட்ச ஸ்பான்"],
      "welding": ["வெல்டிங்", "வெல்ட் நீளம் மற்றும் ஃபில்லர்"],
      "mto": ["MTO", "மெட்டீரியல் டேக்-ஆஃப்"],
      "cog": ["ஈர்ப்பு மையம்", "3D CoG கணக்கு"],
      "geometry": ["வடிவவியல் கால்குலேட்டர்", "முக்கோணம், வட்டம், சிலிண்டர்…"],
      "elbow-data": ["எல்போ தரவு", "ASME B16.9 பரிமாணங்கள்"],
      "ref-library": ["குறிப்பு நூலகம்", "டீ, ரிடியூசர், OD, ஷெட்யூல்"],
      "unit-converter": ["யூனிட் மாற்றி", "mm, inch, bar, psi, °C…"]
    }
  };

  let currentLang = localStorage.getItem("mu_lang") || "en";

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
  }

  function calcTitle(c) {
    const pack = CALC_I18N[currentLang];
    if (pack && pack[c.id]) return pack[c.id][0];
    return c.title;
  }
  function calcDesc(c) {
    const pack = CALC_I18N[currentLang];
    if (pack && pack[c.id]) return pack[c.id][1];
    return c.desc;
  }

  
  // Language sheet
  function openLangSheet() {
    const sheet = document.getElementById("langSheet");
    if (!sheet) return;
    sheet.hidden = false;
    sheet.querySelectorAll(".lang-option").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
    });
  }
  function closeLangSheet() {
    const sheet = document.getElementById("langSheet");
    if (sheet) sheet.hidden = true;
  }

  window.setLang = function(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    localStorage.setItem("mu_lang", lang);
    document.documentElement.lang = lang === "hi" ? "hi" : lang === "pt" ? "pt" : lang === "ta" ? "ta" : "en";
    applyStaticI18n();
    renderDashboard();
    // re-render open calculator pages titles if needed
    const active = document.querySelector(".page.active");
    if (active && active.id && active.id.startsWith("page-") && active.id !== "page-dashboard") {
      const id = active.id.replace("page-", "");
      if (CALC_LIST.find(c => c.id === id)) {
        const c = CALC_LIST.find(c => c.id === id);
        const h = active.querySelector(".page-title");
        const sub = active.querySelector(".page-subtitle");
        if (h) h.innerHTML = c.icon + " " + calcTitle(c);
        if (sub) sub.textContent = calcDesc(c);
        const btnP = active.querySelector(".btn-primary");
        const btnS = active.querySelector(".btn-secondary");
        if (btnP) btnP.textContent = t("calculate");
        if (btnS) btnS.textContent = t("reset");
      }
    }
    closeLangSheet();
    toast(lang === "hi" ? "भाषा: हिन्दी" : lang === "pt" ? "Idioma: Português" : lang === "ta" ? "மொழி: தமிழ்" : "Language: English");
  };

  function applyStaticI18n() {
    const map = [
      ["#page-dashboard .page-title", "appName"],
      ["#page-dashboard .page-subtitle", "tagline"],
      ["#page-favorites .page-title", "favorites"],
      ["#page-favorites .page-subtitle", "favSub"],
      ["#page-recent .page-title", "recentTitle"],
      ["#page-recent .page-subtitle", "recentSub"],
      ["#page-formulas .page-title", "formulasTitle"],
      ["#page-formulas .page-subtitle", "formulasSub"],
      ["#page-notes .page-title", "notesTitle"],
      ["#page-notes .page-subtitle", "notesSub"]
    ];
    map.forEach(([sel, key]) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = t(key);
    });
    document.querySelectorAll(".bottom-nav-item").forEach(el => {
      const page = el.getAttribute("data-page");
      const key = { dashboard: "home", favorites: "fav", recent: "recent", formulas: "formulas", notes: "notes", "formula-library": "formulas" }[page];
      if (!key) return;
      const spans = el.querySelectorAll("span");
      if (spans.length >= 2) spans[spans.length - 1].textContent = t(key);
    });
    const qaMap = [
      ["#searchBtn .qa-label", "search"],
      ["#favBtn .qa-label", "favorites"],
      ["#themeBtn .qa-label", "theme"],
      ["#langBtn .qa-label", "language"]
    ];
    qaMap.forEach(([sel, key]) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = t(key);
    });
    // logo tagline
    const tag = document.querySelector(".logo-tagline");
    if (tag) tag.textContent = t("tagline");
    const si = document.getElementById("searchInput");
    if (si) si.placeholder = t("searchPlaceholder");
  }


  function bindEvents() {
    // Nav
    document.querySelectorAll(".nav-item, .bottom-nav-item").forEach(el => {
      el.addEventListener("click", () => {
        const page = el.dataset.page;
        if (page) showPage(page);
      });
    });

    // Theme
    document.getElementById("themeBtn").addEventListener("click", toggleTheme);

    // Search
    const _sb = document.getElementById("searchBtn"); if (_sb) _sb.addEventListener("click", openSearch);
    document.getElementById("bottomSearch").addEventListener("click", openSearch);
    document.getElementById("searchOverlay").addEventListener("click", e => {
      if (e.target.id === "searchOverlay") closeSearch();
    });
    document.getElementById("searchInput").addEventListener("input", function(){ doSearch(); });

    const ups = document.getElementById("unitPickerSearch");
    if (ups) ups.addEventListener("input", function() {
      const t = window._unitPickerTarget;
      const fromVal = t ? (document.getElementById(t.id + "-from") || {}).value : null;
      const forceCat = t && t.field === "to" ? window._unitCategory(fromVal) : null;
      const exclude = t && t.field === "to" ? fromVal : null;
      const sel = t ? (document.getElementById(t.id + "-" + t.field) || {}).value : null;
      window._renderUnitPickerList(ups.value, forceCat, exclude, sel);
    });
    const upb = document.getElementById("unitPickerBackdrop");
    if (upb) upb.addEventListener("click", window._closeUnitPicker);


    const dsi = document.getElementById("desktopSearchInput");
    if (dsi) {
      dsi.addEventListener("input", doDesktopSearch);
      dsi.addEventListener("focus", doDesktopSearch);
    }
    document.addEventListener("click", (e) => {
      const box = document.getElementById("desktopSearchBox");
      const res = document.getElementById("desktopSearchResults");
      if (box && res && !box.contains(e.target)) res.style.display = "none";
    });


    // Favorites header
    const _fb = document.getElementById("favBtn"); if (_fb) _fb.addEventListener("click", () => showPage("favorites"));

    const langBtn = document.getElementById("langBtn");
    if (langBtn) langBtn.addEventListener("click", openLangSheet);
    const langBackdrop = document.getElementById("langSheetBackdrop");
    if (langBackdrop) langBackdrop.addEventListener("click", closeLangSheet);
    document.querySelectorAll(".lang-option").forEach(btn => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });

  }

  function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById("page-" + id);
    if (page) {
      page.classList.add("active");
      currentPage = id;
    }
    // Update nav active
    document.querySelectorAll(".nav-item, .bottom-nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.page === id);
    });
    // Scroll top
    window.scrollTo(0, 0);
    // Track recent for calculators
    if (CALC_LIST.find(c => c.id === id)) {
      addRecent(id);
    }
    if (id === "unit-converter") setTimeout(() => window._updateUnitTo("unit-converter"), 0);
    setTimeout(function(){ enhanceSelects(document.getElementById("page-" + id) || document); }, 0);
    if (id === "ref-library") setTimeout(() => { if (window.loadRefLibrary) window.loadRefLibrary(); }, 0);
  }
  
  window.UNIT_CAT_ORDER = ["length","mass","pressure","temperature","area","volume","angle","force","torque","energy","power","density","flow","speed"];
  window.UNIT_CAT_LABELS = {
    length: "Length", mass: "Mass", pressure: "Pressure", temperature: "Temperature",
    area: "Area", volume: "Volume", angle: "Angle", force: "Force", torque: "Torque",
    energy: "Energy", power: "Power", density: "Density", flow: "Flow", speed: "Speed"
  };
  window.UNIT_GROUPS = {
    length: ["mm","cm","m","km","inch","ft","yard","mile"],
    mass: ["mg","g","kg","tonne","lb","oz"],
    pressure: ["Pa","kPa","MPa","bar","psi","atm"],
    temperature: ["C","F","K"],
    area: ["mm2","cm2","m2","in2","ft2","acre"],
    volume: ["ml","L","m3","in3","ft3","gallon"],
    angle: ["deg","rad","grad"],
    force: ["N","kN","lbf","kgf"],
    torque: ["Nm","kNm","ftlb","inlb"],
    energy: ["J","kJ","cal","kcal","Wh","kWh","Btu"],
    power: ["W","kW","hp","Btu_h"],
    density: ["kg_m3","g_cm3","lb_ft3"],
    flow: ["m3_s","m3_h","L_s","L_min","gpm","cfm"],
    speed: ["m_s","km_h","ft_s","mph","knot"]
  };
  window.UNIT_LABELS = {
    mm:"Millimetre (mm)", cm:"Centimetre (cm)", m:"Metre (m)", km:"Kilometre (km)",
    inch:"Inch (in)", ft:"Foot (ft)", yard:"Yard (yd)", mile:"Mile (mi)",
    mg:"Milligram (mg)", g:"Gram (g)", kg:"Kilogram (kg)", tonne:"Tonne (t)", lb:"Pound (lb)", oz:"Ounce (oz)",
    Pa:"Pascal (Pa)", kPa:"Kilopascal (kPa)", MPa:"Megapascal (MPa)", bar:"Bar", psi:"Pound/in² (psi)", atm:"Atmosphere (atm)",
    C:"Celsius (°C)", F:"Fahrenheit (°F)", K:"Kelvin (K)",
    mm2:"mm²", cm2:"cm²", m2:"m²", in2:"in²", ft2:"ft²", acre:"Acre",
    ml:"Millilitre (ml)", L:"Litre (L)", m3:"Cubic metre (m³)", in3:"in³", ft3:"ft³", gallon:"US Gallon",
    deg:"Degree (°)", rad:"Radian (rad)", grad:"Gradian (gon)",
    N:"Newton (N)", kN:"Kilonewton (kN)", lbf:"Pound-force (lbf)", kgf:"Kilogram-force (kgf)",
    Nm:"Newton-metre (N·m)", kNm:"kN·m", ftlb:"ft·lbf", inlb:"in·lbf",
    J:"Joule (J)", kJ:"Kilojoule (kJ)", cal:"Calorie (cal)", kcal:"Kilocalorie (kcal)",
    Wh:"Watt-hour (Wh)", kWh:"Kilowatt-hour (kWh)", Btu:"BTU",
    W:"Watt (W)", kW:"Kilowatt (kW)", hp:"Horsepower (hp)", Btu_h:"BTU/h",
    kg_m3:"kg/m³", g_cm3:"g/cm³", lb_ft3:"lb/ft³",
    m3_s:"m³/s", m3_h:"m³/h", L_s:"L/s", L_min:"L/min", gpm:"gal/min (US)", cfm:"ft³/min",
    m_s:"m/s", km_h:"km/h", ft_s:"ft/s", mph:"mph", knot:"Knot"
  };
  window.UNIT_SHORT = {
    mm:"mm", cm:"cm", m:"m", km:"km", inch:"in", ft:"ft", yard:"yd", mile:"mi",
    mg:"mg", g:"g", kg:"kg", tonne:"t", lb:"lb", oz:"oz",
    Pa:"Pa", kPa:"kPa", MPa:"MPa", bar:"bar", psi:"psi", atm:"atm",
    C:"°C", F:"°F", K:"K",
    mm2:"mm²", cm2:"cm²", m2:"m²", in2:"in²", ft2:"ft²", acre:"acre",
    ml:"ml", L:"L", m3:"m³", in3:"in³", ft3:"ft³", gallon:"gal",
    deg:"°", rad:"rad", grad:"gon",
    N:"N", kN:"kN", lbf:"lbf", kgf:"kgf",
    Nm:"N·m", kNm:"kN·m", ftlb:"ft·lbf", inlb:"in·lbf",
    J:"J", kJ:"kJ", cal:"cal", kcal:"kcal", Wh:"Wh", kWh:"kWh", Btu:"BTU",
    W:"W", kW:"kW", hp:"hp", Btu_h:"BTU/h",
    kg_m3:"kg/m³", g_cm3:"g/cm³", lb_ft3:"lb/ft³",
    m3_s:"m³/s", m3_h:"m³/h", L_s:"L/s", L_min:"L/min", gpm:"gpm", cfm:"cfm",
    m_s:"m/s", km_h:"km/h", ft_s:"ft/s", mph:"mph", knot:"kn"
  };
  window._unitCategory = function(u) {
    for (const cat of window.UNIT_CAT_ORDER) {
      if ((window.UNIT_GROUPS[cat] || []).indexOf(u) >= 0) return cat;
    }
    return null;
  };
  window._unitPickerTarget = null; // { id, field: 'from'|'to' }
  window._openUnitPicker = function(id, field) {
    window._unitPickerTarget = { id: id, field: field };
    const sheet = document.getElementById("unitPickerSheet");
    if (!sheet) return;
    sheet.hidden = false;
    const fromVal = (document.getElementById(id + "-from") || {}).value;
    const cat = field === "to" ? window._unitCategory(fromVal) : null;
    document.getElementById("unitPickerSearch").value = "";
    window._renderUnitPickerList("", cat, field === "from" ? null : fromVal, (document.getElementById(id + "-" + field) || {}).value);
    setTimeout(function(){ const s = document.getElementById("unitPickerSearch"); if (s) s.focus(); }, 50);
  };
  window._closeUnitPicker = function() {
    const sheet = document.getElementById("unitPickerSheet");
    if (sheet) sheet.hidden = true;
    window._unitPickerTarget = null;
  };
  window._renderUnitPickerList = function(query, forceCat, excludeUnit, selectedUnit) {
    const list = document.getElementById("unitPickerList");
    if (!list) return;
    const q = (query || "").toLowerCase().trim();
    let html = "";
    const cats = forceCat ? [forceCat] : window.UNIT_CAT_ORDER;
    cats.forEach(function(cat) {
      const units = (window.UNIT_GROUPS[cat] || []).filter(function(u) {
        if (excludeUnit && u === excludeUnit) return false;
        if (!q) return true;
        const lab = (window.UNIT_LABELS[u] || u).toLowerCase();
        const short = (window.UNIT_SHORT[u] || u).toLowerCase();
        return lab.indexOf(q) >= 0 || short.indexOf(q) >= 0 || u.toLowerCase().indexOf(q) >= 0 || (window.UNIT_CAT_LABELS[cat] || "").toLowerCase().indexOf(q) >= 0;
      });
      if (!units.length) return;
      html += '<div class="up-cat">' + (window.UNIT_CAT_LABELS[cat] || cat) + '</div>';
      units.forEach(function(u) {
        const sel = u === selectedUnit ? " selected" : "";
        html += '<button type="button" class="up-item' + sel + '" data-unit="' + u + '">' +
          '<span class="up-item-main">' + (window.UNIT_SHORT[u] || u) + '</span>' +
          '<span class="up-item-sub">' + (window.UNIT_LABELS[u] || u) + '</span></button>';
      });
    });
    list.innerHTML = html || '<p class="up-empty">No units match</p>';
    list.querySelectorAll(".up-item").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const u = btn.getAttribute("data-unit");
        const t = window._unitPickerTarget;
        if (!t) return;
        const hidden = document.getElementById(t.id + "-" + t.field);
        const display = document.getElementById(t.id + "-" + t.field + "-display");
        if (hidden) hidden.value = u;
        if (display) display.textContent = window.UNIT_SHORT[u] || u;
        if (t.field === "from") {
          // reset To to first of same category
          const cat = window._unitCategory(u);
          const list2 = (window.UNIT_GROUPS[cat] || []).filter(function(x){ return x !== u; });
          const toH = document.getElementById(t.id + "-to");
          const toD = document.getElementById(t.id + "-to-display");
          if (list2.length && toH) {
            toH.value = list2[0];
            if (toD) toD.textContent = window.UNIT_SHORT[list2[0]] || list2[0];
          }
        }
        window._closeUnitPicker();
      });
    });
  };
  window._updateUnitTo = function(id) {
    // kept for compatibility — sync displays
    const fromEl = document.getElementById(id + "-from");
    const toEl = document.getElementById(id + "-to");
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const cat = window._unitCategory(from);
    const list = (window.UNIT_GROUPS[cat] || []).filter(function(u) { return u !== from; });
    if (list.indexOf(toEl.value) < 0 && list.length) toEl.value = list[0];
    const fd = document.getElementById(id + "-from-display");
    const td = document.getElementById(id + "-to-display");
    if (fd) fd.textContent = window.UNIT_SHORT[fromEl.value] || fromEl.value;
    if (td) td.textContent = window.UNIT_SHORT[toEl.value] || toEl.value;
  };

  
  // ========== Custom MU Select (UI only — native <select> kept for values/events) ==========
  window._muSelectOpen = null;
  window.enhanceSelects = function(root) {
    const scope = root || document;
    scope.querySelectorAll("select").forEach(function(sel) {
      if (sel.dataset.muEnhanced === "1") return;
      if (sel.closest(".mu-select")) return;
      // skip hidden tiny selects if any
      if (sel.classList.contains("mu-native-hidden")) return;
      window._wrapSelect(sel);
    });
  };
  window._wrapSelect = function(sel) {
    if (sel.dataset.muEnhanced === "1") return;
    sel.dataset.muEnhanced = "1";
    const parent = sel.parentNode;
    const wrap = document.createElement("div");
    wrap.className = "mu-select";
    const n = sel.options.length;
    const useSearch = n >= 8;
    wrap.innerHTML =
      '<button type="button" class="mu-select-trigger" aria-haspopup="listbox" aria-expanded="false">' +
        '<span class="mu-select-value"></span>' +
        '<svg class="mu-select-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>' +
      '</button>' +
      '<div class="mu-select-panel" role="listbox">' +
        (useSearch ? '<input type="search" class="mu-select-search" placeholder="Search…" autocomplete="off" />' : '') +
        '<div class="mu-select-options"></div>' +
      '</div>';
    parent.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add("mu-native-hidden");

    const trigger = wrap.querySelector(".mu-select-trigger");
    const valueEl = wrap.querySelector(".mu-select-value");
    const panel = wrap.querySelector(".mu-select-panel");
    const optsBox = wrap.querySelector(".mu-select-options");
    const search = wrap.querySelector(".mu-select-search");

    function syncLabel() {
      const opt = sel.options[sel.selectedIndex];
      valueEl.textContent = opt ? opt.text : "";
    }
    function buildOptions() {
      optsBox.innerHTML = "";
      let currentGroup = null;
      Array.from(sel.options).forEach(function(opt, idx) {
        if (opt.parentElement && opt.parentElement.tagName === "OPTGROUP") {
          const label = opt.parentElement.label;
          if (label !== currentGroup) {
            currentGroup = label;
            const g = document.createElement("div");
            g.className = "mu-select-group";
            g.textContent = label;
            optsBox.appendChild(g);
          }
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mu-select-option" + (opt.selected ? " selected" : "");
        btn.setAttribute("role", "option");
        btn.dataset.value = opt.value;
        btn.dataset.index = String(idx);
        btn.textContent = opt.text;
        btn.addEventListener("click", function(e) {
          e.stopPropagation();
          sel.selectedIndex = idx;
          sel.value = opt.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          syncLabel();
          closePanel();
          buildOptions();
        });
        optsBox.appendChild(btn);
      });
    }
    function openPanel() {
      if (window._muSelectOpen && window._muSelectOpen !== wrap) {
        window._muSelectOpen.classList.remove("open");
        const t = window._muSelectOpen.querySelector(".mu-select-trigger");
        if (t) t.setAttribute("aria-expanded", "false");
      }
      wrap.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      window._muSelectOpen = wrap;
      buildOptions();
      if (search) {
        search.value = "";
        filterOptions("");
        setTimeout(function(){ search.focus(); }, 10);
      }
    }
    function closePanel() {
      wrap.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      if (window._muSelectOpen === wrap) window._muSelectOpen = null;
    }
    function filterOptions(q) {
      q = (q || "").toLowerCase().trim();
      let any = false;
      let lastGroup = null;
      optsBox.querySelectorAll(".mu-select-option, .mu-select-group").forEach(function(el) {
        if (el.classList.contains("mu-select-group")) {
          lastGroup = el;
          el.classList.add("hidden");
          return;
        }
        const show = !q || el.textContent.toLowerCase().indexOf(q) >= 0;
        el.classList.toggle("hidden", !show);
        if (show) {
          any = true;
          if (lastGroup) lastGroup.classList.remove("hidden");
        }
      });
      let empty = optsBox.querySelector(".mu-select-empty");
      if (!any) {
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "mu-select-empty";
          empty.textContent = "No matches";
          optsBox.appendChild(empty);
        }
      } else if (empty) empty.remove();
    }

    trigger.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (wrap.classList.contains("open")) closePanel();
      else openPanel();
    });
    if (search) {
      search.addEventListener("input", function() { filterOptions(search.value); });
      search.addEventListener("click", function(e) { e.stopPropagation(); });
    }
    sel.addEventListener("change", syncLabel);
    // MutationObserver if options change dynamically
    const mo = new MutationObserver(function() { syncLabel(); if (wrap.classList.contains("open")) buildOptions(); });
    mo.observe(sel, { childList: true, subtree: true, attributes: true });

    syncLabel();
  };

  // Global outside click / Escape
  document.addEventListener("click", function(e) {
    if (window._muSelectOpen && !window._muSelectOpen.contains(e.target)) {
      window._muSelectOpen.classList.remove("open");
      const t = window._muSelectOpen.querySelector(".mu-select-trigger");
      if (t) t.setAttribute("aria-expanded", "false");
      window._muSelectOpen = null;
    }
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && window._muSelectOpen) {
      window._muSelectOpen.classList.remove("open");
      window._muSelectOpen = null;
    }
  });

  window.showPage = showPage;

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mu_theme", theme);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  // Dashboard
  function renderDashboard() {
    const grid = document.getElementById("dashboardGrid");
    grid.innerHTML = CALC_LIST.map(c => `
      <div class="calc-card" onclick="showPage('${c.id}')">
        <div class="card-icon">${c.icon}</div>
        <div class="card-title">${calcTitle(c)}</div>
        <div class="card-desc">${calcDesc(c)}</div>
      </div>
    `).join("");
  }

  // Generate calculator pages
  function renderCalcPages() {
    // will enhance after HTML inject
    const container = document.getElementById("calcPages");
    container.innerHTML = CALC_LIST.map(c => {
      const isRef = c.id === "ref-library";
      const btns = isRef ? "" : `
          <div class="btn-group">
            <button class="btn btn-primary" onclick="runCalc('${c.id}')">${t("calculate")}</button>
            <button class="btn btn-secondary" onclick="resetForm('${c.id}')">${t("reset")}</button>
          </div>`;
      const resultsTitle = isRef ? "📖 Reference Table" : "📊 Results";
      return `
      <div class="page" id="page-${c.id}">
        <div class="calc-header">
          <button class="back-btn" onclick="showPage('dashboard')">←</button>
          <div>
            <h1 class="page-title" style="margin:0;font-size:1.3rem">${c.icon} ${calcTitle(c)}</h1>
            <p class="page-subtitle" style="margin:0">${calcDesc(c)}</p>
          </div>
          <button class="icon-btn fav-btn" data-id="${c.id}" onclick="toggleFavorite('${c.id}')" title="Favorite">⭐</button>
        </div>
        <div class="calc-form" id="form-${c.id}">
          ${getFormHTML(c.id)}
          ${btns}
        </div>
        <div class="results-panel${isRef ? " visible" : ""}" id="results-${c.id}">
          <div class="results-title">${resultsTitle}</div>
          <div id="results-body-${c.id}">${isRef ? '<p class="unit-label">Select a table above to view data.</p>' : ""}</div>
          <div class="action-bar">
            <button class="btn btn-secondary" onclick="copyResults('${c.id}')">📋 Copy</button>
            <button class="btn btn-secondary" onclick="shareResults('${c.id}')">📤 Share</button>
            <button class="btn btn-orange" onclick="exportPDF('${c.id}')">📄 PDF</button>
          </div>
        </div>
      </div>`;
    }).join("");
    // Auto-bind ref-library dropdown
    setTimeout(function() {
      const sel = document.getElementById("ref-library-ref");
      if (sel) {
        sel.addEventListener("change", function() { window.loadRefLibrary(); });
        window.loadRefLibrary();
      }
    }, 0);
  }

  function getFormHTML(id) {
    const npsSelect = `<div class="form-group"><label>NPS</label><select id="${id}-nps">${NPS_LIST.map(n => `<option value="${n}" ${n==="4"?"selected":""}>${n}"</option>`).join("")}</select></div>`;
    const schSelect = `<div class="form-group"><label>Schedule</label><select id="${id}-sch">${SCH_COMMON.map(s => `<option value="${s}" ${s==="40"?"selected":""}>${s}</option>`).join("")}</select></div>`;

    switch (id) {
      case "pipe-weight":
        return `
          <div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-row">
            <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="1" min="0" step="0.1" /></div>
            <div class="form-group"><label>Material</label><select id="${id}-mat"><option value="CS">Carbon Steel</option><option value="SS">Stainless</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Insulation Thk (mm)</label><input type="number" id="${id}-ins" value="0" min="0" /></div>
            <div class="form-group"><label>Insul. Density (kg/m³)</label><input type="number" id="${id}-insd" value="120" min="0" /></div>
          </div>`;
      case "pipe-volume":
        return `<div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="1" min="0" step="0.1" /></div>`;
      case "pipe-schedule":
        return `<div class="form-row">${npsSelect}${schSelect}</div>`;
      case "pipe-length":
        return `
          <div class="form-group"><label>Centerline Length (mm)</label><input type="number" id="${id}-cl" value="5000" min="0" /></div>
          <div class="form-row">${npsSelect}
            <div class="form-group"><label>Radius Type</label><select id="${id}-rt"><option value="LR">Long Radius</option><option value="SR">Short Radius</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Qty 90° Elbows</label><input type="number" id="${id}-e90" value="2" min="0" /></div>
            <div class="form-group"><label>Qty 45° Elbows</label><input type="number" id="${id}-e45" value="0" min="0" /></div>
          </div>
          <div class="form-group"><label>Deduct Reducer / Tee Take-off</label>
            <select id="${id}-deduct"><option value="off">OFF</option><option value="on">ON</option></select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Qty Reducers</label><input type="number" id="${id}-red" value="0" min="0" /></div>
            <div class="form-group"><label>Qty Tees</label><input type="number" id="${id}-tee" value="0" min="0" /></div>
          </div>`;
      case "elbow":
        return `
          <div class="form-row">${npsSelect}
            <div class="form-group"><label>Angle</label><select id="${id}-ang"><option value="90">90°</option><option value="45">45°</option><option value="180">180°</option></select></div>
          </div>
          <div class="form-group"><label>Radius Type</label><select id="${id}-rt"><option value="LR">Long Radius (1.5D)</option><option value="SR">Short Radius (1D)</option></select></div>`;
      case "mitre":
        return `
          <div class="form-row">${npsSelect}
            <div class="form-group"><label>Total Angle (°)</label><input type="number" id="${id}-ang" value="90" min="1" max="180" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Number of Cuts</label><input type="number" id="${id}-cuts" value="2" min="1" /></div>
            <div class="form-group"><label>Bend Radius R (mm) optional</label><input type="number" id="${id}-r" placeholder="Auto 1.5D" /></div>
          </div>`;
      case "rolling-offset":
        return `
          <div class="form-row">
            <div class="form-group"><label>Rise / Vertical (mm)</label><input type="number" id="${id}-rise" value="300" min="0" /></div>
            <div class="form-group"><label>Roll / Horizontal (mm)</label><input type="number" id="${id}-roll" value="400" min="0" /></div>
          </div>
          <div class="form-group"><label>Fitting / Travel Angle (°)</label>
            <input type="number" id="${id}-ang" value="45" min="1" max="89" step="0.5" />
            <small class="unit-label">Custom angle (e.g. 22.5, 30, 45, 60)</small>
          </div>
          <div class="form-row">${npsSelect}
            <div class="form-group"><label>Radius Type</label><select id="${id}-rt"><option value="LR">Long Radius</option><option value="SR">Short Radius</option></select></div>
          </div>
          <div class="form-group"><label>Deduct LR/SR Elbow Take-off</label>
            <select id="${id}-deduct"><option value="off">OFF</option><option value="on">ON</option></select>
          </div>`;
      case "flange":
        return `<div class="form-row">${npsSelect}
          <div class="form-group"><label>Class</label><select id="${id}-cls"><option value="150">150</option><option value="300">300</option><option value="600">600</option></select></div>
        </div>
        <div class="form-group"><label>Facing</label>
          <select id="${id}-face"><option value="RF">Raised Face (RF)</option><option value="RTJ">Ring Type Joint (RTJ)</option></select>
        </div>
        <p class="unit-label">ASME B16.5 Class 150 / 300 / 600 — BCD & bolt data. Stud length is estimate; verify flange thickness.</p>`;
      case "bolt-torque":
        return `
          <div class="form-row">
            <div class="form-group"><label>Bolt Size</label>
              <select id="${id}-size"><option>1/2</option><option>5/8</option><option>3/4</option><option>7/8</option><option>1</option><option>1-1/8</option><option>1-1/4</option><option>1-3/8</option><option>1-1/2</option></select>
            </div>
            <div class="form-group"><label>Condition</label>
              <select id="${id}-lub"><option value="lub">Lubricated</option><option value="dry">Dry</option></select>
            </div>
          </div>
          <div class="form-group"><label>Bolt Material</label>
            <select id="${id}-mat">
              <option value="A193-B7">ASTM A193 B7</option>
              <option value="A193-B8">ASTM A193 B8</option>
              <option value="A193-B8M">ASTM A193 B8M</option>
              <option value="A193-B16">ASTM A193 B16</option>
              <option value="A320-L7">ASTM A320 L7</option>
              <option value="A307-B">ASTM A307 B</option>
            </select>
          </div>
          <p class="unit-label">Planning estimate only. Final tightening torque shall follow the approved project specification and ASME PCC-1.</p>`;
      case "hydrotest":
        return `
          <div class="form-group"><label>Test Type</label>
            <select id="${id}-type"><option value="hydro">Hydrostatic</option><option value="pneumatic">Pneumatic</option></select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Design Pressure</label><input type="number" id="${id}-p" value="10" min="0" step="any" /></div>
            <div class="form-group"><label>Test Factor</label><input type="number" id="${id}-f" value="1.5" min="1" step="0.05" title="1.5 hydro typical; 1.1 pneumatic typical" /></div>
          </div>
          <div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-row">
            <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="10" min="0" step="any" /></div>
            <div class="form-group"><label>Hold Time (min)</label><input type="number" id="${id}-hold" value="30" min="1" /></div>
          </div>
          <div class="form-group"><label>Temperature Correction</label>
            <select id="${id}-tcorr"><option value="off">OFF</option><option value="on">ON (optional)</option></select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>T design (°C)</label><input type="number" id="${id}-td" value="20" step="any" /></div>
            <div class="form-group"><label>T test (°C)</label><input type="number" id="${id}-tt" value="20" step="any" /></div>
          </div>`;
      case "b31-3-stress":
        return `
          <div class="form-group"><label>Material (fills Sc/Sh — override allowed)</label>
            <select id="${id}-mat" onchange="window._fillB31Material('${id}')">
              <option value="Custom">Custom (manual S)</option>
              <option value="A106-B">A106 Grade B</option>
              <option value="A53-B">A53 Grade B</option>
              <option value="A312-TP304">A312 TP304</option>
              <option value="A312-TP316">A312 TP316</option>
              <option value="A335-P11">A335 P11</option>
            </select>
          </div>

          <div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-row">
            <div class="form-group"><label>Design Pressure P</label><input type="number" id="${id}-p" value="20" min="0" step="0.1" /></div>
            <div class="form-group"><label>Pressure Unit</label>
              <select id="${id}-punit"><option value="bar">bar</option><option value="MPa">MPa</option><option value="psi">psi</option><option value="kPa">kPa</option></select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Allowable S (MPa) <small>B31.3 App A</small></label><input type="number" id="${id}-s" value="138" min="0" step="0.1" title="e.g. A106 Gr.B ~138 MPa at 38°C" /></div>
            <div class="form-group"><label>Quality Factor E</label><input type="number" id="${id}-e" value="1.0" min="0.5" max="1" step="0.05" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Weld Factor W</label><input type="number" id="${id}-w" value="1.0" min="0.5" max="1" step="0.05" /></div>
            <div class="form-group"><label>Y Coefficient</label><input type="number" id="${id}-y" value="0.4" min="0" max="0.7" step="0.05" title="Table 304.1.1" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Corrosion c (mm)</label><input type="number" id="${id}-c" value="1.5" min="0" step="0.1" /></div>
            <div class="form-group"><label>Mill Tol. (%)</label><input type="number" id="${id}-mill" value="12.5" min="0" step="0.5" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Sustained Moment MA (N·mm)</label><input type="number" id="${id}-ma" value="0" min="0" step="1000" title="From weight/support analysis" /></div>
            <div class="form-group"><label>SIF i (in-plane)</label><input type="number" id="${id}-i" value="1.0" min="1" step="0.1" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Sc cold (MPa)</label><input type="number" id="${id}-sc" value="138" min="0" step="0.1" /></div>
            <div class="form-group"><label>Sh hot (MPa)</label><input type="number" id="${id}-sh" value="138" min="0" step="0.1" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Stress Range Factor f</label><input type="number" id="${id}-f" value="1.0" min="0.15" max="1.2" step="0.05" title="From cycle count Table 302.3.5" /></div>
            <div class="form-group"><label>SE from analysis (MPa)</label><input type="number" id="${id}-se" value="0" min="0" step="0.1" title="0 = use simple estimate if L & ΔT given" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Anchor distance L (m)</label><input type="number" id="${id}-l" value="0" min="0" step="0.1" title="Optional for restrained estimate" /></div>
            <div class="form-group"><label>ΔT (°C)</label><input type="number" id="${id}-dt" value="0" step="1" /></div>
          </div>
          <p class="unit-label">Defaults approximate A106 Gr.B / A53 at ambient. Always use project-specific S from B31.3 Appendix A. Full flexibility analysis required for complex routing.</p>`;
      case "surface-area":
        return `<div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="1" min="0" step="0.1" /></div>`;
      case "painting":
        return `
          <div class="form-row">${npsSelect}
            <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="10" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Coats</label><input type="number" id="${id}-coats" value="2" min="1" /></div>
            <div class="form-group"><label>Coverage (m²/L)</label><input type="number" id="${id}-cov" value="10" min="1" step="0.5" /></div>
          </div>`;
      case "insulation":
        return `
          <div class="form-row">${npsSelect}
            <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="1" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Thickness (mm)</label><input type="number" id="${id}-thk" value="50" min="0" /></div>
            <div class="form-group"><label>Density (kg/m³)</label><input type="number" id="${id}-den" value="120" min="0" /></div>
          </div>`;
      case "support-spacing":
        return `<div class="form-row">${npsSelect}
          <div class="form-group"><label>Fluid</label><select id="${id}-fluid"><option value="water">Water / Liquid</option><option value="gas">Gas / Steam</option><option value="empty">Empty</option></select></div>
        </div>`;
      case "welding":
        return `
          <div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-group"><label>Number of Joints</label><input type="number" id="${id}-j" value="1" min="1" /></div>`;
      case "mto":
        return `
          <div class="form-group"><label>Pipe entries (NPS, Sch, Length m) – one per line e.g. 4,40,12.5</label>
            <textarea id="${id}-pipes" rows="3" style="width:100%;padding:12px;border-radius:8px;background:var(--bg-input);color:var(--text-primary);border:2px solid var(--border);font-size:1rem">4,40,12
6,40,8.5</textarea>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Elbows qty</label><input type="number" id="${id}-elb" value="4" min="0" /></div>
            <div class="form-group"><label>Tees</label><input type="number" id="${id}-tee" value="2" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Reducers</label><input type="number" id="${id}-red" value="1" min="0" /></div>
            <div class="form-group"><label>Flanges</label><input type="number" id="${id}-flg" value="6" min="0" /></div>
            <div class="form-group"><label>Valves</label><input type="number" id="${id}-val" value="2" min="0" /></div>
          </div>`;
      case "cog":
        return `
          <div class="form-group"><label>Items (mass, x, y, z) – one per line e.g. 120,500,0,200</label>
            <textarea id="${id}-items" rows="4" style="width:100%;padding:12px;border-radius:8px;background:var(--bg-input);color:var(--text-primary);border:2px solid var(--border);font-size:1rem">100,0,0,0
50,1000,0,0
75,500,300,0</textarea>
          </div>`;

      case "geometry":
        return `
          <div class="form-group"><label>Geometry Type</label>
            <select id="${id}-type" onchange="document.getElementById('${id}-fields').innerHTML=window._geoFields(this.value)">
              <option value="right-triangle">Right Triangle / Pythagoras</option>
              <option value="triangle">Triangle (3 sides)</option>
              <option value="circle">Circle</option>
              <option value="arc">Arc / Chord / Sector</option>
              <option value="rectangle">Rectangle</option>
              <option value="square">Square</option>
              <option value="trapezoid">Trapezoid</option>
              <option value="parallelogram">Parallelogram</option>
              <option value="polygon">Regular Polygon</option>
              <option value="cylinder">Cylinder</option>
              <option value="cone">Cone</option>
              <option value="sphere">Sphere</option>
              <option value="distance">Distance (2 points)</option>
              <option value="angle">Angle (trig)</option>
              <option value="slope">Slope</option>
              <option value="offset-geo">Simple Offset</option>
            </select>
          </div>
          <div id="${id}-fields">
            <div class="form-row">
              <div class="form-group"><label>Side a</label><input type="number" id="${id}-a" value="3" step="any" /></div>
              <div class="form-group"><label>Side b</label><input type="number" id="${id}-b" value="4" step="any" /></div>
            </div>
            <div class="form-group"><label>Hypotenuse c (optional)</label><input type="number" id="${id}-c" value="" step="any" placeholder="auto" /></div>
          </div>`;
      case "elbow-data":
        return `
          <div class="form-group"><label>NPS</label>
            <select id="${id}-nps">${Object.keys(PIPE_DATA.elbowLR90||PIPE_DATA.pipes).map(n=>`<option value="${n}">${n}"</option>`).join('')}</select>
          </div>
          <p class="unit-label">ASME B16.9 dimensions — Center-to-End, Radius. Select size and Calculate.</p>`;
      case "ref-library":
        return `
          <div class="form-group"><label>Reference Table</label>
            <select id="${id}-ref" class="ref-select">
              <optgroup label="Pipe Dimensions">
                <option value="od">Pipe OD Chart</option>
                <option value="schedule">Pipe Schedule Table</option>
                <option value="nps-dn">NPS ↔ DN Conversion</option>
                <option value="weight">Pipe Weight Chart (CS kg/m)</option>
                <option value="circ">Pipe Circumference Chart</option>
              </optgroup>
              <optgroup label="Fittings (ASME B16.9)">
                <option value="tee">Tee Data (Equal)</option>
                <option value="tee-reducing">Reducing Tee</option>
                <option value="reducer">Reducer Length</option>
                <option value="cap">Cap Length</option>
                <option value="elbow-ce">Elbow Center-to-End (LR &amp; SR)</option>
                <option value="bend">Bend Radius (1D &amp; 1.5D)</option>
                <option value="stub">Stub End (Lap Joint)</option>
              </optgroup>
              <optgroup label="Flanges &amp; Bolting">
                <option value="flange">Flange Class 150 Dimensions</option>
                <option value="flange300">Flange Class 300 Dimensions</option>
                <option value="flange600">Flange Class 600 Dimensions</option>
                <option value="bolt">Bolt Torque Chart</option>
                <option value="stud">Stud Bolt Length Chart</option>
              </optgroup>
            </select>
          </div>
          <p class="unit-label">Handbook mode — table loads when you change the selection. ASME reference data for guidance.</p>`;

case "unit-converter":
        return `
          <div class="form-group"><label>Value</label>
            <input type="number" id="${id}-val" value="100" step="any" />
          </div>
          <div class="form-row unit-pick-row">
            <div class="form-group">
              <label>From</label>
              <input type="hidden" id="${id}-from" value="inch" />
              <button type="button" class="unit-pick-btn" id="${id}-from-display" onclick="window._openUnitPicker('${id}','from')">in</button>
            </div>
            <div class="form-group">
              <label>To</label>
              <input type="hidden" id="${id}-to" value="mm" />
              <button type="button" class="unit-pick-btn" id="${id}-to-display" onclick="window._openUnitPicker('${id}','to')">mm</button>
            </div>
          </div>
          <p class="unit-label">Tap From/To to open the unit picker. To list is limited to the same category as From.</p>`;
      default:
        return "<p>Coming soon</p>";
    }
  }

  // Run calculation
  
  window.loadRefLibrary = function() {
    const id = "ref-library";
    const refEl = document.getElementById(id + "-ref");
    const ref = refEl ? refEl.value : "od";
    let results = [], formula = "ASME / industry reference", steps = ["Handbook reference — verify against project standards"];
    try {
      if (ref === "od") {
        results = Object.values(PIPE_DATA.pipes).map(p => ({ label: "NPS " + p.nps + " (DN " + p.dn + ")", value: p.od, unit: "mm OD" }));
        formula = "Outside diameter per ASME B36.10M / B36.19M";
      } else if (ref === "schedule") {
        results = Object.values(PIPE_DATA.pipes).map(p => {
          const parts = Object.keys(p.schedules).slice(0, 6).map(s => s + ":" + p.schedules[s]);
          return { label: "NPS " + p.nps, value: "OD " + p.od + " | " + parts.join(" "), unit: "mm" };
        });
        formula = "Nominal wall thickness (mm) — ASME B36.10 / B36.19";
      } else if (ref === "nps-dn") {
        results = Object.values(PIPE_DATA.pipes).map(p => ({ label: "NPS " + p.nps, value: "DN " + p.dn, unit: "" }));
        formula = "NPS (inch nominal) ↔ DN (metric nominal)";
      } else if (ref === "weight") {
        results = Object.values(PIPE_DATA.pipes).map(p => {
          const t = p.schedules["40"] || p.schedules["STD"] || Object.values(p.schedules)[0];
          const w = (typeof calcWeightPerMeter === "function" && t) ? calcWeightPerMeter(p.od, t).toFixed(2) : "—";
          return { label: "NPS " + p.nps + " Sch40/STD", value: w, unit: "kg/m" };
        });
        formula = "Approx CS weight kg/m for Sch 40 / STD";
      } else if (ref === "circ") {
        results = Object.values(PIPE_DATA.pipes).map(p => ({ label: "NPS " + p.nps, value: (Math.PI * p.od).toFixed(1), unit: "mm" }));
        formula = "Circumference = π × OD";
      } else if (ref === "tee") {
        results = Object.entries(PIPE_DATA.teeEqual || {}).map(([k,v]) => ({ label: "NPS " + k, value: "C=" + v.C + "  M=" + v.M, unit: "mm" }));
        formula = "Equal Tee ASME B16.9 — C run, M branch center-to-end";
      } else if (ref === "tee-reducing") {
        results = Object.entries(PIPE_DATA.teeReducing || {}).map(([k,v]) => ({ label: "NPS " + k, value: "C=" + v.C + "  M=" + v.M, unit: "mm" }));
        formula = "Reducing Tee ASME B16.9 — C run, M outlet";
      } else if (ref === "reducer") {
        results = Object.entries(PIPE_DATA.reducerH || {}).map(([k,v]) => ({ label: k, value: v, unit: "mm" }));
        formula = "Concentric reducer overall length H — ASME B16.9";
      } else if (ref === "cap") {
        results = Object.entries(PIPE_DATA.capE || {}).map(([k,v]) => ({ label: "NPS " + k, value: v, unit: "mm" }));
        formula = "Cap length E — ASME B16.9";
      } else if (ref === "elbow-ce") {
        results = Object.keys(PIPE_DATA.elbowLR90 || {}).map(k => {
          const lr = PIPE_DATA.elbowLR90[k];
          const sr = (PIPE_DATA.elbowSR90 && PIPE_DATA.elbowSR90[k]) || "—";
          const lr45 = (PIPE_DATA.elbowLR45 && PIPE_DATA.elbowLR45[k]) || "—";
          return { label: "NPS " + k, value: "LR90=" + lr + "  SR90=" + sr + "  LR45=" + lr45, unit: "mm" };
        });
        formula = "Elbow center-to-end — ASME B16.9";
      } else if (ref === "bend") {
        results = Object.values(PIPE_DATA.pipes).map(p => ({
          label: "NPS " + p.nps,
          value: "1.5D=" + (1.5 * p.od).toFixed(1) + "  1D=" + p.od.toFixed(1),
          unit: "mm"
        }));
        formula = "Bend radius R — LR ≈ 1.5×OD, SR ≈ 1.0×OD";
      } else if (ref === "stub") {
        results = Object.entries(PIPE_DATA.stubEnd || {}).map(([k,v]) => ({ label: "NPS " + k, value: "F=" + v.F + "  G≈" + v.G + " (" + v.type + ")", unit: "mm" }));
        formula = "Stub End (Lap Joint) — ASME B16.9 / MSS SP-43";
      } else if (ref === "flange") {
        results = Object.entries(PIPE_DATA.flange150 || {}).map(([k,v]) => ({ label: "NPS " + k, value: "OD " + v.flangeOD + "  BCD " + v.bcd + "  " + v.bolts + "×" + v.boltSize + '"', unit: "mm" }));
        formula = "ASME B16.5 Class 150";
      } else if (ref === "flange300") {
        results = Object.entries(PIPE_DATA.flange300 || {}).map(([k,v]) => ({ label: "NPS " + k, value: "OD " + v.flangeOD + "  BCD " + v.bcd + "  " + v.bolts + "×" + v.boltSize + '"', unit: "mm" }));
        formula = "ASME B16.5 Class 300";
      } else if (ref === "flange600") {
        results = Object.entries(PIPE_DATA.flange600 || {}).map(([k,v]) => ({ label: "NPS " + k, value: "OD " + v.flangeOD + "  BCD " + v.bcd + "  " + v.bolts + "×" + v.boltSize + '"', unit: "mm" }));
        formula = "ASME B16.5 Class 600";
      } else if (ref === "bolt") {
        results = Object.entries(PIPE_DATA.boltTorque || {}).map(([k,v]) => ({ label: k + '"', value: "Lub " + v.lub + "  Dry " + v.dry, unit: "N·m" }));
        formula = "Planning torque (A193-B7) — use project spec + ASME PCC-1 for final values";
      } else if (ref === "stud") {
        const studApprox = {"1/2":55,"3/4":65,"1":65,"1-1/4":70,"1-1/2":75,"2":85,"2-1/2":90,"3":100,"4":110,"6":120,"8":130,"10":145,"12":160,"14":170,"16":180,"18":190,"20":200,"24":220};
        results = Object.entries(studApprox).map(([k,v]) => ({ label: "NPS " + k + " (Cl.150 RF approx)", value: v, unit: "mm" }));
        formula = "Approximate stud length Class 150 RF — verify flange thickness";
      } else {
        results = [{ label: "Info", value: "Select a table", unit: "" }];
      }
      showResults(id, { results: results, formula: formula, steps: steps });
    } catch (e) {
      showResults(id, { error: e.message || String(e) });
    }
  };

  window.runCalc = function (id) {
    let inputs = {};
    try {
      switch (id) {
        case "pipe-weight":
          inputs = {
            nps: val(id, "nps"), schedule: val(id, "sch"), length: num(id, "length"),
            material: val(id, "mat"), insulationThk: num(id, "ins"), insulationDensity: num(id, "insd")
          };
          showResults(id, Calculators.pipeWeight(inputs));
          break;
        case "pipe-volume":
          inputs = { nps: val(id, "nps"), schedule: val(id, "sch"), length: num(id, "length") };
          showResults(id, Calculators.pipeVolume(inputs));
          break;
        case "pipe-schedule":
          inputs = { nps: val(id, "nps"), schedule: val(id, "sch") };
          showResults(id, Calculators.pipeSchedule(inputs));
          break;
        case "pipe-length":
          inputs = {
            centerline: num(id, "cl"), nps: val(id, "nps"), radiusType: val(id, "rt"),
            elbows90: num(id, "e90"), elbows45: num(id, "e45")
          };
          showResults(id, Calculators.pipeLength(inputs));
          break;
        case "elbow":
          inputs = { nps: val(id, "nps"), angle: num(id, "ang"), radiusType: val(id, "rt") };
          showResults(id, Calculators.elbow(inputs));
          break;
        case "mitre":
          inputs = { nps: val(id, "nps"), angle: num(id, "ang"), cuts: num(id, "cuts"), radius: num(id, "r") || undefined };
          showResults(id, Calculators.mitreBend(inputs));
          break;
        case "rolling-offset":
          inputs = { rise: num(id, "rise"), roll: num(id, "roll"), angle: num(id, "ang"), deductElbow: val(id, "deduct")==="on", nps: val(id, "nps"), radiusType: val(id, "rt") };
          showResults(id, Calculators.rollingOffset(inputs));
          break;
        case "flange":
          inputs = { nps: val(id, "nps"), flangeClass: val(id, "cls"), faceType: val(id, "face") || "RF" };
          showResults(id, Calculators.flange(inputs));
          break;
        case "bolt-torque":
          inputs = { boltSize: val(id, "size"), lubricant: val(id, "lub"), material: val(id, "mat") || "A193-B7" };
          showResults(id, Calculators.boltTorque(inputs));
          break;
        case "hydrotest":
          inputs = {
            designPressure: num(id, "p"), materialFactor: num(id, "f"),
            nps: val(id, "nps"), schedule: val(id, "sch"), length: num(id, "length"), holdTime: num(id, "hold"),
            testType: val(id, "type") || "hydro",
            tempCorrection: val(id, "tcorr") === "on",
            T_design: num(id, "td"), T_test: num(id, "tt")
          };
          showResults(id, Calculators.hydrotest(inputs));
          break;
        case "b31-3-stress":
          inputs = {
            nps: val(id, "nps"), schedule: val(id, "sch"),
            P: num(id, "p"), Punit: val(id, "punit"),
            S: num(id, "s"), E: num(id, "e"), W: num(id, "w"), Y: num(id, "y"),
            c: num(id, "c"), t_mill: num(id, "mill"),
            MA: num(id, "ma"), i_in: num(id, "i"),
            Sc: num(id, "sc"), Sh: num(id, "sh"), f: num(id, "f"),
            SE: num(id, "se"), L_anchor: num(id, "l"), dT: num(id, "dt")
          };
          showResults(id, Calculators.b31_3Stress(inputs));
          break;
        case "surface-area":
          inputs = { nps: val(id, "nps"), schedule: val(id, "sch"), length: num(id, "length") };
          showResults(id, Calculators.surfaceArea(inputs));
          break;
        case "painting":
          inputs = { nps: val(id, "nps"), length: num(id, "length"), coats: num(id, "coats"), coverage: num(id, "cov") };
          showResults(id, Calculators.painting(inputs));
          break;
        case "insulation":
          inputs = { nps: val(id, "nps"), length: num(id, "length"), thk: num(id, "thk"), density: num(id, "den") };
          showResults(id, Calculators.insulation(inputs));
          break;
        case "support-spacing":
          inputs = { nps: val(id, "nps"), fluid: val(id, "fluid") };
          showResults(id, Calculators.supportSpacing(inputs));
          break;
        case "welding":
          inputs = { nps: val(id, "nps"), schedule: val(id, "sch"), joints: num(id, "j") };
          showResults(id, Calculators.welding(inputs));
          break;
        case "mto":
          const lines = (document.getElementById(id + "-pipes").value || "").split("\n").filter(Boolean);
          const pipes = lines.map(l => {
            const [nps, sch, length] = l.split(",").map(s => s.trim());
            return { nps, sch, length: parseFloat(length) || 0 };
          });
          inputs = {
            pipes,
            elbows: [{ qty: num(id, "elb") }],
            tees: num(id, "tee"), reducers: num(id, "red"),
            flanges: num(id, "flg"), valves: num(id, "val")
          };
          showResults(id, Calculators.mto(inputs));
          break;
        case "cog":
          const itemLines = (document.getElementById(id + "-items").value || "").split("\n").filter(Boolean);
          const items = itemLines.map(l => {
            const parts = l.split(",").map(s => parseFloat(s.trim()) || 0);
            return { mass: parts[0]||0, x: parts[1]||0, y: parts[2]||0, z: parts[3]||0 };
          });
          showResults(id, Calculators.cog({ items }));
          break;
        case "geometry":
          inputs = {
            type: val(id, "type"),
            a: num(id, "a"), b: num(id, "b"), c: num(id, "c"),
            radius: num(id, "radius"), diameter: num(id, "diameter"), angle: num(id, "angle"),
            length: num(id, "length"), width: num(id, "width"), side: num(id, "side"),
            height: num(id, "height"), base: num(id, "base"), sides: num(id, "sides"),
            x1: num(id, "x1"), y1: num(id, "y1"), x2: num(id, "x2"), y2: num(id, "y2"),
            opposite: num(id, "opposite"), adjacent: num(id, "adjacent"), hypotenuse: num(id, "hypotenuse"),
            rise: num(id, "rise"), run: num(id, "run"), offset: num(id, "offset")
          };
          showResults(id, Calculators.geometry(inputs));
          break;
        case "elbow-data": {
          const npsE = val(id, "nps");
          const pipeE = getPipe(npsE) || {};
          const odE = pipeE.od || 0;
          const lr90 = PIPE_DATA.elbowLR90[npsE] || Math.round(1.5*odE);
          const sr90 = PIPE_DATA.elbowSR90[npsE] || Math.round(odE);
          const lr45 = PIPE_DATA.elbowLR45[npsE] || Math.round(lr90 * 0.414);
          showResults(id, {
            results: [
              { label: "NPS / DN", value: npsE + " / " + (pipeE.dn || "—"), unit: "" },
              { label: "OD", value: odE, unit: "mm" },
              { label: "90 LR Center-to-End (A)", value: lr90, unit: "mm" },
              { label: "90 SR Center-to-End", value: sr90, unit: "mm" },
              { label: "45 LR Center-to-End (B)", value: lr45, unit: "mm" },
              { label: "180 LR Center-to-Center", value: lr90 * 2, unit: "mm" },
              { label: "LR Radius R (1.5D)", value: Math.round(1.5*odE*10)/10, unit: "mm" },
              { label: "SR Radius R (1D)", value: Math.round(odE*10)/10, unit: "mm" },
              { label: "Standard", value: "ASME B16.9", unit: "" }
            ],
            formula: "LR R=1.5×OD | SR R=1.0×OD\nC-E per ASME B16.9",
            steps: ["NPS " + npsE]
          });
          break;
        }
        case "ref-library": {
          const ref = val(id, "ref");
          let results = [], formula = "ASME reference", steps = [];
          if (ref === "od") {
            results = Object.values(PIPE_DATA.pipes).map(p => ({ label: "NPS " + p.nps + " (DN " + p.dn + ")", value: p.od, unit: "mm OD" }));
          } else if (ref === "schedule") {
            results = Object.values(PIPE_DATA.pipes).map(p => {
              const sch = p.schedules["40"] || p.schedules["STD"] || Object.values(p.schedules)[0];
              return { label: "NPS " + p.nps, value: "OD " + p.od + " | t " + sch, unit: "mm" };
            });
          } else if (ref === "tee") {
            results = Object.entries(PIPE_DATA.teeEqual || {}).map(([k,v]) => ({ label: "NPS " + k, value: "C=" + v.C + " M=" + v.M, unit: "mm" }));
            formula = "Equal Tee ASME B16.9\nC = center-to-end (run)\nM = center-to-end (branch)";
          } else if (ref === "tee-reducing") {
            results = Object.entries(PIPE_DATA.teeReducing || {}).map(([k,v]) => ({ label: "NPS " + k, value: "C=" + v.C + " M=" + v.M, unit: "mm" }));
            formula = "Reducing Tee ASME B16.9\nC = run center-to-end\nM = outlet/branch center-to-end\nVerify exact size combination on project BOM";
            steps = ["Select reducing tee size (Run × Outlet)", "Dimensions are typical B16.9 guidance"];
          } else if (ref === "stub") {
            results = Object.entries(PIPE_DATA.stubEnd || {}).map(([k,v]) => ({ label: "NPS " + k, value: "F=" + v.F + " G≈" + v.G + " (" + v.type + ")", unit: "mm" }));
            formula = "Stub End (Lap Joint) ASME B16.9 / MSS SP-43\nF = overall length\nG ≈ fillet radius\nType A long pattern typical values";
            steps = ["Used with lap joint flange", "Confirm short vs long pattern with vendor"];
          } else if (ref === "reducer") {
            results = Object.entries(PIPE_DATA.reducerH || {}).map(([k,v]) => ({ label: k, value: v, unit: "mm" }));
          } else if (ref === "cap") {
            results = Object.entries(PIPE_DATA.capE || {}).map(([k,v]) => ({ label: "NPS " + k, value: v, unit: "mm" }));
          } else if (ref === "flange") {
            results = Object.entries(PIPE_DATA.flange150 || {}).map(([k,v]) => ({ label: "NPS " + k, value: "BCD " + v.bcd + " " + v.bolts + "x" + v.boltSize, unit: "mm" }));
          } else if (ref === "bolt") {
            results = Object.entries(PIPE_DATA.boltTorque || {}).map(([k,v]) => ({ label: k + " in", value: "Dry " + v.dry + " Lub " + v.lub, unit: "Nm" }));
          } else if (ref === "bend") {
            results = Object.values(PIPE_DATA.pipes).filter(p => PIPE_DATA.elbowLR90[p.nps]).map(p => ({
              label: "NPS " + p.nps, value: "1.5D=" + (1.5*p.od).toFixed(0) + " 1D=" + p.od, unit: "mm"
            }));
          }
          showResults(id, { results: results, formula: formula, steps: steps });
          break;
        }
        case "unit-converter":
          inputs = { value: num(id, "val"), from: val(id, "from"), to: val(id, "to") };
          showResults(id, Calculators.unitConverter(inputs));
          break;
      }
    } catch (e) {
      showResults(id, { error: e.message });
    }
  };


  function val(id, field) {
    const el = document.getElementById(`${id}-${field}`);
    return el ? el.value : "";
  }
  function num(id, field) {
    return parseFloat(val(id, field)) || 0;
  }

  function showResults(id, data) {
    const panel = document.getElementById("results-" + id);
    const body = document.getElementById("results-body-" + id);
    if (data.error) {
      body.innerHTML = `<p style="color:var(--danger)">${data.error}</p>`;
      panel.classList.add("visible");
      return;
    }
    let html = "";
    if (data.diagram) html += data.diagram;
    html += data.results.map(r => `
      <div class="result-item">
        <span class="result-label">${r.label}</span>
        <span class="result-value">${r.value}<span class="result-unit">${r.unit}</span></span>
      </div>
    `).join("");
    if (data.formula) {
      html += `<div class="formula-box">${data.formula}</div>`;
    }
    if (data.steps && data.steps.length) {
      html += `<div class="step-box"><strong>Step-by-step:</strong>${data.steps.map(s => `<div class="step">${s}</div>`).join("")}</div>`;
    }
    body.innerHTML = html;
    panel.classList.add("visible");
    // Store for copy/share
    panel.dataset.lastResult = JSON.stringify(data);
  }

  window.resetForm = function (id) {
    const form = document.getElementById("form-" + id);
    form.querySelectorAll("input[type=number]").forEach(i => {
      if (i.id.includes("length") || i.id.includes("cl")) i.value = i.id.includes("cl") ? "5000" : "1";
      else if (i.defaultValue) i.value = i.defaultValue;
    });
    document.getElementById("results-" + id).classList.remove("visible");
  };

  // Copy / Share / PDF
  window.copyResults = function (id) {
    const panel = document.getElementById("results-" + id);
    const data = panel.dataset.lastResult ? JSON.parse(panel.dataset.lastResult) : null;
    if (!data) return;
    const text = `MU Piping Calculator – ${id}\n\n` +
      data.results.map(r => `${r.label}: ${r.value} ${r.unit}`).join("\n") +
      (data.formula ? `\n\nFormula:\n${data.formula}` : "");
    navigator.clipboard.writeText(text).then(() => toast(t("copied")));
  };

  window.shareResults = async function (id) {
    const panel = document.getElementById("results-" + id);
    const data = panel.dataset.lastResult ? JSON.parse(panel.dataset.lastResult) : null;
    if (!data) return;
    const text = `MU Piping Calculator – ${id}\n` + data.results.map(r => `${r.label}: ${r.value} ${r.unit}`).join("\n");
    if (navigator.share) {
      try { await navigator.share({ title: "MU Piping Result", text }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(text).then(() => toast("Copied (share not supported)"));
    }
  };

  window.exportPDF = function (id) {
    // Simple print-based PDF
    const panel = document.getElementById("results-" + id);
    const title = CALC_LIST.find(c => c.id === id)?.title || id;
    const printWin = window.open("", "_blank");
    printWin.document.write(`
      <html><head><title>MU – ${title}</title>
      <style>
        body{font-family:system-ui;padding:24px;color:#111}
        h1{font-size:1.4rem;border-bottom:2px solid #1e40af;padding-bottom:8px}
        .item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}
        .formula{background:#f1f5f9;padding:12px;margin:16px 0;font-family:monospace;white-space:pre-wrap}
        .step{padding:4px 0;color:#444}
        footer{margin-top:32px;font-size:0.8rem;color:#666}
      </style></head><body>
      <h1>MU Piping Calculator – ${title}</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      ${panel.querySelector("#results-body-" + id).innerHTML}
      <footer>MU Piping Calculator • ASME B36.10 / B16.5 / B16.9 reference • For engineering guidance only</footer>
      <script>window.onload=()=>window.print()<\/script>
      </body></html>
    `);
    printWin.document.close();
  };

  // Favorites
  window.toggleFavorite = function (id) {
    const idx = favorites.indexOf(id);
    if (idx >= 0) favorites.splice(idx, 1);
    else favorites.push(id);
    localStorage.setItem("mu_favs", JSON.stringify(favorites));
    updateFavoritesUI();
    // Init unit converter To dropdown
    if (document.getElementById("unit-converter-from")) {
      window._updateUnitTo("unit-converter");
    }

    toast(idx >= 0 ? t("removedFav") : t("addedFav"));
  };

  function updateFavoritesUI() {
    document.querySelectorAll(".fav-btn").forEach(btn => {
      btn.classList.toggle("active", favorites.includes(btn.dataset.id));
    });
    const grid = document.getElementById("favoritesGrid");
    if (!favorites.length) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">⭐</div><p>No favorites yet. Star a calculator to add it here.</p></div>`;
      return;
    }
    grid.innerHTML = favorites.map(id => {
      const c = CALC_LIST.find(x => x.id === id);
      if (!c) return "";
      return `<div class="calc-card" onclick="showPage('${c.id}')">
        <div class="card-icon">${c.icon}</div>
        <div class="card-title">${calcTitle(c)}</div>
      </div>`;
    }).join("");
  }

  function addRecent(id) {
    recent = recent.filter(r => r !== id);
    recent.unshift(id);
    if (recent.length > 12) recent.pop();
    localStorage.setItem("mu_recent", JSON.stringify(recent));
    renderRecent();
  }

  function renderRecent() {
    const el = document.getElementById("recentList");
    if (!recent.length) {
      el.innerHTML = `<div class="empty-state"><div class="icon">🕐</div><p>No recent calculations yet.</p></div>`;
      return;
    }
    el.innerHTML = recent.map(id => {
      const c = CALC_LIST.find(x => x.id === id);
      if (!c) return "";
      return `<div class="note-card" style="cursor:pointer" onclick="showPage('${c.id}')">
        <h3>${c.icon} ${c.title}</h3><p>${c.desc}</p>
      </div>`;
    }).join("");
  }

  // Search
  function openSearch() {
    document.getElementById("searchOverlay").classList.add("active");
    document.getElementById("searchInput").value = "";
    document.getElementById("searchInput").focus();
    document.getElementById("searchResults").innerHTML = "";
  }
  function closeSearch() {
    document.getElementById("searchOverlay").classList.remove("active");
  }
  function doSearch(inputId, resultsId, closeOnClick) {
    const inputEl = document.getElementById(inputId || "searchInput");
    const res = document.getElementById(resultsId || "searchResults");
    if (!inputEl || !res) return;
    const q = inputEl.value.toLowerCase().trim();
    if (!q) { res.innerHTML = ""; res.style.display = "none"; return; }
    res.style.display = "block";
    const items = [];
    CALC_LIST.forEach(c => {
      const title = calcTitle(c).toLowerCase();
      const desc = calcDesc(c).toLowerCase();
      if (c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || title.includes(q) || desc.includes(q)) {
        items.push({
          type: "Calculator",
          icon: c.icon,
          title: calcTitle(c),
          sub: calcDesc(c),
          action: "showPage('" + c.id + "')"
        });
      }
    });
    // Formula library titles (static list from rendered cards if present)
    document.querySelectorAll("#formulaList .formula-card h3").forEach(h => {
      const t = h.textContent || "";
      if (t.toLowerCase().includes(q)) {
        items.push({ type: "Formula", icon: "📐", title: t, sub: "Formula Library", action: "showPage('formula-library')" });
      }
    });
    document.querySelectorAll("#notesList .note-card h3, #notesList h3").forEach(h => {
      const t = h.textContent || "";
      if (t.toLowerCase().includes(q)) {
        items.push({ type: "Note", icon: "📝", title: t, sub: "Engineering Notes", action: "showPage('notes')" });
      }
    });
    // Reference keywords
    const refs = [
      { k: "reducing tee|tee reducing", title: "Reducing Tee Table", page: "ref-library" },
      { k: "stub end|lap joint|stub", title: "Stub End (Lap Joint)", page: "ref-library" },
      { k: "elbow data|b16.9", title: "Elbow Data", page: "elbow-data" },
      { k: "schedule|od chart|pipe od", title: "Reference Library", page: "ref-library" },
      { k: "flange|bcd", title: "Flange Calculator", page: "flange" },
      { k: "b31.3|stress", title: "B31.3 Stress Analysis", page: "b31-3-stress" }
    ];
    refs.forEach(r => {
      if (new RegExp(r.k, "i").test(q) || r.title.toLowerCase().includes(q)) {
        items.push({ type: "Reference", icon: "📖", title: r.title, sub: "Reference", action: "showPage('" + r.page + "')" });
      }
    });
    // de-dupe by title
    const seen = {};
    const unique = items.filter(it => { if (seen[it.title]) return false; seen[it.title] = 1; return true; });
    const closeJs = closeOnClick === false ? "" : "; closeSearch();";
    res.innerHTML = unique.slice(0, 40).map(it => `
      <div class="search-item" onclick="${it.action}${closeJs}">
        <span style="font-size:1.3rem">${it.icon}</span>
        <div><strong>${it.title}</strong><br><small style="color:var(--text-muted)">${it.type} · ${it.sub}</small></div>
      </div>
    `).join("") || `<p style="padding:12px;color:var(--text-muted)">No matches</p>`;
  }
  function doDesktopSearch() {
    doSearch("desktopSearchInput", "desktopSearchResults", false);
  }
  window.closeSearch = closeSearch;

  // Formula library
  function renderFormulaLibrary() {
    const sk = (inner) =>
      `<div class="formula-sketch"><svg viewBox="0 0 200 100" width="100%" style="max-width:220px;height:auto">${inner}</svg></div>`;
    const formulas = [
      // —— PIPE GEOMETRY ——
      {
        cat: "Pipe Geometry",
        title: "Pipe Weight (empty)",
        formula: "W = (π/4)·(OD² − ID²)·ρ / 10⁶",
        vars: "W = mass per metre (kg/m)\nOD, ID, t in mm\nID = OD − 2t\nρ ≈ 7850 kg/m³ (CS), ≈ 8000 (SS)",
        ref: "ASME B36.10 / B36.19 (dimensions)",
        sketch: sk(`<rect x="20" y="35" width="160" height="30" rx="2" fill="rgba(96,165,250,0.25)" stroke="#60a5fa" stroke-width="2"/><rect x="28" y="42" width="144" height="16" fill="rgba(15,23,42,0.5)" stroke="#38bdf8"/><text x="100" y="28" text-anchor="middle" fill="#94a3b8" font-size="10">OD</text><text x="100" y="80" text-anchor="middle" fill="#94a3b8" font-size="10">t wall</text>`)
      },
      {
        cat: "Pipe Geometry",
        title: "Internal Volume / Capacity",
        formula: "V = (π/4)·ID²·L\nCapacity (L) = V × 1000  (ID, L in m → m³)",
        vars: "V = internal volume\nID = inside diameter\nL = length",
        ref: "Geometry — used with hydrotest fill volume",
        sketch: sk(`<rect x="30" y="30" width="140" height="40" rx="4" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="2"/><text x="100" y="55" text-anchor="middle" fill="#38bdf8" font-size="11">fluid</text>`)
      },
      {
        cat: "Pipe Geometry",
        title: "External / Internal Surface Area",
        formula: "A_ext = π·OD·L\nA_int = π·ID·L",
        vars: "A in same unit system as OD, L\nUsed for painting, insulation, heat transfer",
        ref: "—",
        sketch: sk(`<rect x="25" y="35" width="150" height="30" rx="2" fill="none" stroke="#60a5fa" stroke-width="3"/><text x="100" y="80" text-anchor="middle" fill="#94a3b8" font-size="10">π · D · L</text>`)
      },
      {
        cat: "Pipe Geometry",
        title: "Cross-Section Metal Area",
        formula: "A_m = (π/4)·(OD² − ID²)",
        vars: "A_m = metal area\nUsed in stress (Z, i·M/Z) and weight checks",
        ref: "ASME B31.3 (section properties)",
        sketch: sk(`<circle cx="100" cy="50" r="35" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2"/><circle cx="100" cy="50" r="20" fill="#0f172a" stroke="#38bdf8"/>`)
      },
      {
        cat: "Pipe Geometry",
        title: "Inside Diameter",
        formula: "ID = OD − 2t",
        vars: "OD = outside diameter\nt = nominal wall thickness",
        ref: "ASME B36.10 / B36.19",
        sketch: sk(`<circle cx="100" cy="50" r="36" fill="none" stroke="#60a5fa" stroke-width="8"/><text x="100" y="54" text-anchor="middle" fill="#94a3b8" font-size="10">ID</text>`)
      },
      // —— FITTINGS ——
      {
        cat: "Fittings",
        title: "Elbow Arc Length",
        formula: "L_arc = π·R·θ / 180",
        vars: "R = bend radius\nθ = bend angle (degrees)\nLR: R = 1.5·NPS (approx OD basis)\nSR: R = 1.0·NPS",
        ref: "ASME B16.9 (center-to-end tabulated)",
        sketch: sk(`<path d="M30,80 L30,50 A40,40 0 0,1 70,20" fill="none" stroke="#60a5fa" stroke-width="8"/><text x="90" y="55" fill="#f97316" font-size="10">R, θ</text>`)
      },
      {
        cat: "Fittings",
        title: "Elbow Center-to-End (90°)",
        formula: "A = tabulated (B16.9)\nLR ≈ 1.5·D; SR ≈ 1.0·D",
        vars: "A = center-to-end\nD ≈ OD for rough check\nUse table values for fabrication",
        ref: "ASME B16.9 Table (LR/SR elbows)",
        sketch: sk(`<path d="M40,80 L40,50 A35,35 0 0,1 75,25 L90,25" fill="none" stroke="#60a5fa" stroke-width="6"/><text x="30" y="70" fill="#94a3b8" font-size="9">A</text>`)
      },
      {
        cat: "Fittings",
        title: "45° Elbow Center-to-End",
        formula: "B = tabulated (B16.9)\nOften ≈ A · tan(22.5°) for geometry check",
        vars: "B = center-to-end of 45° LR elbow\nPrefer ASME table over approximation",
        ref: "ASME B16.9",
        sketch: sk(`<path d="M30,75 L50,75 L80,35" fill="none" stroke="#60a5fa" stroke-width="6"/><text x="95" y="50" fill="#94a3b8" font-size="9">45°</text>`)
      },
      {
        cat: "Fittings",
        title: "Pipe Cut Length (with elbows)",
        formula: "L_cut = L_CL − Σ(elbow C-to-E)",
        vars: "L_CL = centerline route length\nSubtract each elbow take-off (A or B)",
        ref: "Fabrication practice + B16.9",
        sketch: sk(`<line x1="20" y1="50" x2="80" y2="50" stroke="#60a5fa" stroke-width="4"/><path d="M80,50 A25,25 0 0,1 105,25" fill="none" stroke="#f97316" stroke-width="4"/><line x1="105" y1="25" x2="160" y2="25" stroke="#60a5fa" stroke-width="4"/>`)
      },
      {
        cat: "Fittings",
        title: "Mitre Bend Segment Angle",
        formula: "α = θ / (2n)\nn = number of cuts (or segments as defined)",
        vars: "θ = total bend angle\nα = cut / mitre angle per joint\nConfirm project mitre standard",
        ref: "ASME B31.3 (mitre rules / fabrication)",
        sketch: sk(`<path d="M20,70 L60,70 L90,40 L130,40 L160,70 L190,70" fill="none" stroke="#60a5fa" stroke-width="5"/>`)
      },
      {
        cat: "Fittings",
        title: "Reducer Overall Length",
        formula: "H = tabulated (B16.9)",
        vars: "H = face-to-face / overall length of concentric reducer\nDepends on large × small size",
        ref: "ASME B16.9",
        sketch: sk(`<polygon points="30,30 90,40 90,60 30,70" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/><polygon points="90,40 170,45 170,55 90,60" fill="rgba(96,165,250,0.15)" stroke="#60a5fa"/>`)
      },
      // —— OFFSETS ——
      {
        cat: "Offsets",
        title: "Rolling Offset — True Offset",
        formula: "X = √(Rise² + Roll²)",
        vars: "Rise = vertical offset\nRoll = horizontal offset\nX = combined true offset",
        ref: "Pipefitting practice",
        sketch: sk(`<line x1="30" y1="80" x2="100" y2="80" stroke="#94a3b8" stroke-dasharray="3"/><line x1="100" y1="80" x2="100" y2="30" stroke="#f97316"/><line x1="30" y1="80" x2="100" y2="30" stroke="#60a5fa" stroke-width="2"/><text x="110" y="55" fill="#f97316" font-size="9">rise</text>`)
      },
      {
        cat: "Offsets",
        title: "Rolling Offset — Travel",
        formula: "Travel = X / sin(θ)",
        vars: "X = true offset\nθ = fitting / travel angle\nTravel = centerline length of run",
        ref: "Pipefitting practice",
        sketch: sk(`<line x1="30" y1="75" x2="160" y2="30" stroke="#60a5fa" stroke-width="2"/><text x="100" y="45" fill="#60a5fa" font-size="9">travel</text>`)
      },
      {
        cat: "Offsets",
        title: "Rolling Offset — Setback",
        formula: "Setback = X / tan(θ)",
        vars: "Advance/setback along original axis",
        ref: "Pipefitting practice",
        sketch: sk(`<line x1="30" y1="70" x2="140" y2="70" stroke="#94a3b8"/><line x1="30" y1="70" x2="100" y2="30" stroke="#60a5fa" stroke-width="2"/><text x="70" y="85" fill="#94a3b8" font-size="9">setback</text>`)
      },
      {
        cat: "Offsets",
        title: "Simple Offset Travel",
        formula: "Travel = Offset / sin(θ)\nAdvance = Offset / tan(θ)",
        vars: "Single-plane offset",
        ref: "—",
        sketch: sk(`<line x1="40" y1="75" x2="140" y2="30" stroke="#60a5fa" stroke-width="2"/><line x1="140" y1="30" x2="140" y2="75" stroke="#f97316" stroke-dasharray="3"/>`)
      },
      // —— PRESSURE / B31.3 ——
      {
        cat: "Pressure Design",
        title: "B31.3 Minimum Wall Thickness",
        formula: "t = P·D / [2(S·E·W + P·Y)] + c",
        vars: "t = design thickness\nP = internal design pressure\nD = outside diameter\nS = stress value\nE = quality factor\nW = weld joint strength reduction\nY = coefficient (Table 304.1.1)\nc = sum of allowances (corrosion, thread, etc.)",
        ref: "ASME B31.3 §304.1.2",
        sketch: sk(`<rect x="40" y="25" width="120" height="50" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"/><text x="100" y="55" text-anchor="middle" fill="#f97316" font-size="9">t min</text>`)
      },
      {
        cat: "Pressure Design",
        title: "Hoop (Circumferential) Stress",
        formula: "σ_h ≈ P·D / (2t)",
        vars: "Thin-wall approximation\nCompare to allowable stress",
        ref: "ASME B31.3 (pressure design basis)",
        sketch: sk(`<circle cx="100" cy="50" r="30" fill="none" stroke="#60a5fa" stroke-width="3"/><path d="M100,20 A30,30 0 0,1 130,50" fill="none" stroke="#f97316" stroke-width="2"/>`)
      },
      {
        cat: "Pressure Design",
        title: "Longitudinal Pressure Stress",
        formula: "σ_L,p ≈ P·D / (4t)",
        vars: "Closed-end longitudinal component from pressure",
        ref: "ASME B31.3 §302.3.5 context",
        sketch: sk(`<rect x="50" y="35" width="100" height="30" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/><text x="100" y="55" text-anchor="middle" fill="#94a3b8" font-size="9">axial</text>`)
      },
      {
        cat: "Pressure Design",
        title: "Sustained Longitudinal Stress",
        formula: "S_L = P·D/(4t) + i·M_A / Z\nS_L ≤ S_h",
        vars: "M_A = sustained moment\ni = stress intensification factor\nZ = section modulus\nS_h = hot allowable stress",
        ref: "ASME B31.3 §302.3.5",
        sketch: sk(`<line x1="30" y1="50" x2="170" y2="50" stroke="#60a5fa" stroke-width="4"/><path d="M120,50 Q145,20 170,50" fill="none" stroke="#f97316" stroke-width="2"/>`)
      },
      {
        cat: "Pressure Design",
        title: "Allowable Displacement Stress Range",
        formula: "S_A = f·(1.25·S_c + 0.25·S_h)\nS_E ≤ S_A",
        vars: "f = stress range factor (cycles)\nS_c, S_h = cold/hot allowable\nS_E = computed expansion stress range",
        ref: "ASME B31.3 §302.3.5 / §319",
        sketch: sk(`<path d="M30,60 Q70,20 110,60 T190,60" fill="none" stroke="#60a5fa" stroke-width="2"/>`)
      },
      {
        cat: "Pressure Design",
        title: "Hydrotest Pressure (metallic)",
        formula: "P_t ≥ 1.5 · P_design  (typical B31.3)",
        vars: "Confirm material, temperature, and owner spec\nHold time after stabilization (often ≥ 10 min)",
        ref: "ASME B31.3 §345",
        sketch: sk(`<rect x="40" y="30" width="120" height="40" fill="rgba(56,189,248,0.2)" stroke="#38bdf8"/><text x="100" y="55" text-anchor="middle" fill="#38bdf8" font-size="10">1.5P</text>`)
      },
      {
        cat: "Pressure Design",
        title: "Barlow (reference)",
        formula: "P = 2·S·t / D",
        vars: "Simple pressure–thickness relation\nNot a substitute for B31.3 design thickness",
        ref: "Historical / reference only",
        sketch: sk(`<circle cx="100" cy="50" r="32" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="2"/>`)
      },
      // —— FLANGE / BOLTING ——
      {
        cat: "Flange & Bolting",
        title: "Bolt Circle / BCD",
        formula: "From flange standard tables",
        vars: "BCD = bolt circle diameter\nNumber of bolts depends on size & class",
        ref: "ASME B16.5 / B16.47",
        sketch: sk(`<circle cx="100" cy="50" r="35" fill="none" stroke="#60a5fa" stroke-width="2"/><circle cx="100" cy="50" r="22" fill="none" stroke="#f97316" stroke-dasharray="3"/><circle cx="122" cy="50" r="3" fill="#f97316"/>`)
      },
      {
        cat: "Flange & Bolting",
        title: "Stud Bolt Length (approx)",
        formula: "L ≈ 2t_f + t_g + 2h_n + 2w + s",
        vars: "t_f = flange thickness each side\nt_g = gasket\nh_n = nut height\nw = washer\ns = stick-out",
        ref: "ASME B16.5 related practice / manufacturer charts",
        sketch: sk(`<line x1="40" y1="50" x2="160" y2="50" stroke="#94a3b8" stroke-width="3"/><rect x="70" y="40" width="20" height="20" fill="#60a5fa"/><rect x="110" y="40" width="20" height="20" fill="#60a5fa"/>`)
      },
      {
        cat: "Flange & Bolting",
        title: "Bolt Torque (indicative)",
        formula: "T ≈ K·F·d",
        vars: "K = nut factor (lubrication dependent)\nF = target preload\nd = nominal diameter\nUse project / manufacturer torque charts",
        ref: "Industry practice (not a single ASME torque code value)",
        sketch: sk(`<circle cx="100" cy="50" r="28" fill="none" stroke="#60a5fa" stroke-width="3"/><text x="100" y="55" text-anchor="middle" fill="#f97316" font-size="10">T</text>`)
      },
      // —— INSULATION / PAINT ——
      {
        cat: "Insulation & Paint",
        title: "Insulation Volume",
        formula: "V = (π/4)·[(OD+2t_i)² − OD²]·L",
        vars: "t_i = insulation thickness\nConsistent units (mm → convert to m³)",
        ref: "—",
        sketch: sk(`<circle cx="100" cy="50" r="36" fill="rgba(249,115,22,0.2)" stroke="#f97316"/><circle cx="100" cy="50" r="22" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/>`)
      },
      {
        cat: "Insulation & Paint",
        title: "Paint Volume Estimate",
        formula: "Vol ≈ A_ext · coats / coverage",
        vars: "coverage from paint data sheet (e.g. m²/L)\nInclude loss factor on site",
        ref: "Manufacturer PDS",
        sketch: sk(`<rect x="30" y="35" width="140" height="30" fill="rgba(96,165,250,0.15)" stroke="#60a5fa"/><text x="100" y="55" text-anchor="middle" fill="#94a3b8" font-size="9">A × coats</text>`)
      },
      // —— SUPPORTS ——
      {
        cat: "Supports",
        title: "Suggested Support Spacing",
        formula: "L_max from span charts / project spec",
        vars: "Depends on size, schedule, contents, temp, insulation\nCharts are guidance only",
        ref: "MSS SP-58 / project piping standards",
        sketch: sk(`<line x1="20" y1="40" x2="180" y2="40" stroke="#60a5fa" stroke-width="5"/><rect x="40" y="40" width="10" height="30" fill="#f97316"/><rect x="100" y="40" width="10" height="30" fill="#f97316"/><rect x="160" y="40" width="10" height="30" fill="#f97316"/>`)
      },
      // —— WELDING ——
      {
        cat: "Welding",
        title: "Circumferential Weld Length",
        formula: "L_w ≈ π · OD  (per butt joint)",
        vars: "OD at weld bevel\nMulti-pass: length still π·OD per pass path",
        ref: "Fabrication estimating",
        sketch: sk(`<line x1="20" y1="50" x2="85" y2="50" stroke="#60a5fa" stroke-width="6"/><line x1="115" y1="50" x2="180" y2="50" stroke="#60a5fa" stroke-width="6"/><circle cx="100" cy="50" r="8" fill="none" stroke="#f97316" stroke-width="2"/>`)
      },
      {
        cat: "Welding",
        title: "Filler Metal Estimate (indicative)",
        formula: "m ≈ ρ · V_weld · (1 + loss)",
        vars: "V_weld from groove geometry × length\nloss = stub/spatter factor",
        ref: "Estimating practice",
        sketch: sk(`<polygon points="70,30 100,50 70,70" fill="#f97316"/><polygon points="130,30 100,50 130,70" fill="#f97316"/>`)
      },
      // —— CoG / MTO ——
      {
        cat: "Layout & MTO",
        title: "Center of Gravity",
        formula: "x̄ = Σ(m_i·x_i)/Σm_i  (same for y, z)",
        vars: "m_i = mass of component i\n(x_i,y_i,z_i) = component CG coordinates",
        ref: "Statics",
        sketch: sk(`<circle cx="70" cy="40" r="8" fill="#60a5fa"/><circle cx="130" cy="65" r="12" fill="#38bdf8"/><circle cx="100" cy="50" r="4" fill="#f97316"/><text x="100" y="88" text-anchor="middle" fill="#f97316" font-size="9">CG</text>`)
      },
      {
        cat: "Layout & MTO",
        title: "Developed Length of Bend",
        formula: "L_dev = π·R·θ/180",
        vars: "Same as elbow arc; used for hot bends / spool development",
        ref: "B16.9 / fabrication",
        sketch: sk(`<path d="M40,75 A50,50 0 0,1 140,40" fill="none" stroke="#60a5fa" stroke-width="3"/>`)
      },
      // —— GEOMETRY ——
      {
        cat: "Geometry",
        title: "Pythagoras",
        formula: "c² = a² + b²",
        vars: "Right triangle; c = hypotenuse",
        ref: "—",
        sketch: sk(`<polygon points="40,80 40,25 150,80" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/><rect x="40" y="68" width="12" height="12" fill="none" stroke="#f97316"/>`)
      },
      {
        cat: "Geometry",
        title: "Circle Area / Circumference",
        formula: "A = πR²\nC = 2πR",
        vars: "R = radius",
        ref: "—",
        sketch: sk(`<circle cx="100" cy="50" r="32" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"/><line x1="100" y1="50" x2="132" y2="50" stroke="#f97316"/>`)
      },
      {
        cat: "Geometry",
        title: "Arc Length / Sector",
        formula: "Arc = πRθ/180\nSector = πR²θ/360",
        vars: "θ in degrees",
        ref: "—",
        sketch: sk(`<path d="M100,50 L140,50 A40,40 0 0,0 100,10 Z" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/>`)
      },
      {
        cat: "Geometry",
        title: "Cylinder Volume / Area",
        formula: "V = πR²h\nA_lat = 2πRh",
        vars: "R = radius, h = height",
        ref: "—",
        sketch: sk(`<ellipse cx="100" cy="25" rx="40" ry="12" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/><line x1="60" y1="25" x2="60" y2="75" stroke="#60a5fa"/><line x1="140" y1="25" x2="140" y2="75" stroke="#60a5fa"/><ellipse cx="100" cy="75" rx="40" ry="12" fill="rgba(96,165,250,0.15)" stroke="#60a5fa"/>`)
      },
      {
        cat: "Geometry",
        title: "Heron's Formula (triangle area)",
        formula: "s = (a+b+c)/2\nArea = √[s(s−a)(s−b)(s−c)]",
        vars: "a,b,c = side lengths",
        ref: "—",
        sketch: sk(`<polygon points="100,15 170,80 30,80" fill="rgba(96,165,250,0.2)" stroke="#60a5fa"/>`)
      },
      {
        cat: "Geometry",
        title: "Slope",
        formula: "Slope% = (Rise/Run)×100\nθ = atan(Rise/Run)",
        vars: "Pipe slope / drainage layout",
        ref: "—",
        sketch: sk(`<line x1="30" y1="80" x2="170" y2="30" stroke="#60a5fa" stroke-width="2"/><line x1="30" y1="80" x2="170" y2="80" stroke="#94a3b8" stroke-dasharray="3"/>`)
      },
      // —— UNITS ——
      {
        cat: "Units",
        title: "Key Unit Conversions",
        formula: "1 in = 25.4 mm\n1 ft = 0.3048 m\n1 bar = 14.5038 psi\n1 MPa = 10 bar\n°F = °C×9/5+32\nK = °C+273.15",
        vars: "Use Unit Converter tool for full set",
        ref: "SI / customary",
        sketch: sk(`<text x="100" y="45" text-anchor="middle" fill="#60a5fa" font-size="12">mm ↔ in</text><text x="100" y="65" text-anchor="middle" fill="#f97316" font-size="12">bar ↔ psi</text>`)
      },
      {
        cat: "Units",
        title: "Pressure Head (water, approx)",
        formula: "1 bar ≈ 10.2 m water column",
        vars: "Rough field check only",
        ref: "Fluid statics",
        sketch: sk(`<rect x="80" y="20" width="40" height="60" fill="rgba(56,189,248,0.25)" stroke="#38bdf8"/><text x="100" y="90" text-anchor="middle" fill="#94a3b8" font-size="9">h</text>`)
      },
      // —— API / LINE ——
      {
        cat: "Standards Notes",
        title: "NPS vs DN vs OD",
        formula: "NPS (inch nominal) ≠ OD for most sizes\nDN ≈ NPS×25 (metric nominal)",
        vars: "Always use OD from B36 table for calc",
        ref: "ASME B36.10 / B36.19",
        sketch: sk(`<text x="100" y="40" text-anchor="middle" fill="#60a5fa" font-size="11">NPS 6</text><text x="100" y="60" text-anchor="middle" fill="#94a3b8" font-size="10">OD 168.3 mm</text>`)
      },
      {
        cat: "Standards Notes",
        title: "Schedule vs Wall",
        formula: "Sch number → t from B36 tables\nSTD / XS / XXS are named walls",
        vars: "Same Sch ≠ same t for all materials/standards",
        ref: "ASME B36.10 / B36.19",
        sketch: sk(`<line x1="30" y1="50" x2="170" y2="50" stroke="#60a5fa" stroke-width="12"/><line x1="30" y1="50" x2="170" y2="50" stroke="#0f172a" stroke-width="6"/>`)
      },
      {
        cat: "Standards Notes",
        title: "Flange Class vs Pressure",
        formula: "Class (150, 300…) → P–T ratings",
        vars: "Rating depends on material group & temperature\nDo not mix classes on same joint",
        ref: "ASME B16.5",
        sketch: sk(`<circle cx="100" cy="50" r="34" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="3"/><text x="100" y="55" text-anchor="middle" fill="#f97316" font-size="10">Cl.150</text>`)
      },
      {
        cat: "Standards Notes",
        title: "LR vs SR Elbow",
        formula: "LR R = 1.5D\nSR R = 1.0D",
        vars: "LR preferred for flow; SR for tight space",
        ref: "ASME B16.9",
        sketch: sk(`<path d="M25,75 L25,55 A30,30 0 0,1 55,25" fill="none" stroke="#60a5fa" stroke-width="5"/><path d="M110,75 L110,55 A20,20 0 0,1 130,35" fill="none" stroke="#f97316" stroke-width="5"/><text x="40" y="90" fill="#60a5fa" font-size="9">LR</text><text x="120" y="90" fill="#f97316" font-size="9">SR</text>`)
      }
    ];

    let lastCat = "";
    const html = formulas.map(f => {
      let catHead = "";
      if (f.cat !== lastCat) {
        catHead = `<div class="formula-cat">${f.cat}</div>`;
        lastCat = f.cat;
      }
      return catHead + `
      <div class="formula-card">
        <h3>${f.title}</h3>
        ${f.sketch || ""}
        <div class="formula-box" style="margin:8px 0 0">${f.formula}</div>
        <p class="formula-vars"><strong>Variables</strong><br>${f.vars.replace(/\n/g, "<br>")}</p>
        <p class="formula-ref"><strong>Reference:</strong> ${f.ref}</p>
      </div>`;
    }).join("");

    const el = document.getElementById("formulaList");
    if (el) el.innerHTML = html;
  }

  function renderNotes() {
    const notes = [
      { title: "ASME B36.10 vs B36.19", body: "B36.10 covers carbon & alloy steel pipe. B36.19 covers stainless steel (Schedules 5S, 10S, 40S, 80S). For many sizes Sch 40 = Sch 40S." },
      { title: "Long Radius vs Short Radius", body: "LR elbows (R=1.5D) are preferred for lower pressure drop. SR (R=1D) used where space is limited. 180° returns follow same radius rules." },
      { title: "Hydrotest Best Practice", body: "Use clean water. Vent high points. Raise pressure gradually. Never exceed flange/rating limits. Follow ASME B31.3 / project spec for hold time and acceptance criteria." },
      { title: "B31.3 Stress Analysis Scope", body: "This calculator covers pressure design thickness (§304.1.2), sustained longitudinal stress (§302.3.5) and basic displacement stress range (§319.4.4). It does not replace a full flexibility analysis (CAESAR II / AutoPIPE). Use project-specific S from Appendix A, correct SIFs from Appendix D, and verified moments." },
      { title: "Allowable Stress S", body: "Take basic allowable stress from ASME B31.3 Appendix A at the design metal temperature. Sc = cold allowable, Sh = hot allowable. For many CS grades at ambient, S ≈ 138 MPa (20 ksi)." },
      { title: "Bolt Torquing", body: "Always follow cross-pattern sequence. Lubricate threads & nut face with approved lubricant. Re-torque after initial pressurization if required by procedure (PCC-1)." },
      { title: "MTO Tips", body: "Include cut length + wastage (typically 5–10%). Account for weld neck flange projection, gasket thickness, and support attachments separately." },
      { title: "Support Spacing", body: "Values are indicative for Sch 40 CS water-filled. Insulated lines, high temperature, or two-phase flow require formal stress analysis per B31.3 Chapter II." }
    ];
    document.getElementById("notesList").innerHTML = notes.map(n => `
      <div class="note-card"><h3>${n.title}</h3><p>${n.body}</p></div>
    `).join("");
  }


  window._geoFields = function(type) {
    var id = "geometry";
    var map = {
      "right-triangle": '<div class="form-row"><div class="form-group"><label>Side a</label><input type="number" id="'+id+'-a" value="3" step="any" /></div><div class="form-group"><label>Side b</label><input type="number" id="'+id+'-b" value="4" step="any" /></div></div><div class="form-group"><label>Hypotenuse c (optional)</label><input type="number" id="'+id+'-c" value="" step="any" /></div>',
      "triangle": '<div class="form-row"><div class="form-group"><label>a</label><input type="number" id="'+id+'-a" value="3" step="any" /></div><div class="form-group"><label>b</label><input type="number" id="'+id+'-b" value="4" step="any" /></div><div class="form-group"><label>c</label><input type="number" id="'+id+'-c" value="5" step="any" /></div></div>',
      "circle": '<div class="form-row"><div class="form-group"><label>Radius</label><input type="number" id="'+id+'-radius" value="50" step="any" /></div><div class="form-group"><label>Diameter</label><input type="number" id="'+id+'-diameter" value="" step="any" /></div></div>',
      "arc": '<div class="form-row"><div class="form-group"><label>Radius</label><input type="number" id="'+id+'-radius" value="100" step="any" /></div><div class="form-group"><label>Angle</label><input type="number" id="'+id+'-angle" value="90" step="any" /></div></div>',
      "rectangle": '<div class="form-row"><div class="form-group"><label>Length</label><input type="number" id="'+id+'-length" value="10" step="any" /></div><div class="form-group"><label>Width</label><input type="number" id="'+id+'-width" value="5" step="any" /></div></div>',
      "square": '<div class="form-group"><label>Side</label><input type="number" id="'+id+'-side" value="10" step="any" /></div>',
      "trapezoid": '<div class="form-row"><div class="form-group"><label>a</label><input type="number" id="'+id+'-a" value="10" step="any" /></div><div class="form-group"><label>b</label><input type="number" id="'+id+'-b" value="6" step="any" /></div><div class="form-group"><label>h</label><input type="number" id="'+id+'-height" value="4" step="any" /></div></div>',
      "parallelogram": '<div class="form-row"><div class="form-group"><label>Side a</label><input type="number" id="'+id+'-side" value="2" step="any" /></div><div class="form-group"><label>Base b</label><input type="number" id="'+id+'-base" value="8" step="any" /></div><div class="form-group"><label>Angle α°</label><input type="number" id="'+id+'-angle" value="45" step="any" /></div></div>',
      "polygon": '<div class="form-row"><div class="form-group"><label>Sides</label><input type="number" id="'+id+'-sides" value="6" min="3" /></div><div class="form-group"><label>Side</label><input type="number" id="'+id+'-side" value="10" step="any" /></div></div>',
      "cylinder": '<div class="form-row"><div class="form-group"><label>Radius</label><input type="number" id="'+id+'-radius" value="5" step="any" /></div><div class="form-group"><label>Height</label><input type="number" id="'+id+'-height" value="10" step="any" /></div></div>',
      "cone": '<div class="form-row"><div class="form-group"><label>Radius</label><input type="number" id="'+id+'-radius" value="5" step="any" /></div><div class="form-group"><label>Height</label><input type="number" id="'+id+'-height" value="10" step="any" /></div></div>',
      "sphere": '<div class="form-group"><label>Radius</label><input type="number" id="'+id+'-radius" value="5" step="any" /></div>',
      "distance": '<div class="form-row"><div class="form-group"><label>X1</label><input type="number" id="'+id+'-x1" value="0" step="any" /></div><div class="form-group"><label>Y1</label><input type="number" id="'+id+'-y1" value="0" step="any" /></div><div class="form-group"><label>X2</label><input type="number" id="'+id+'-x2" value="3" step="any" /></div><div class="form-group"><label>Y2</label><input type="number" id="'+id+'-y2" value="4" step="any" /></div></div>',
      "angle": '<div class="form-row"><div class="form-group"><label>Opposite</label><input type="number" id="'+id+'-opposite" value="3" step="any" /></div><div class="form-group"><label>Adjacent</label><input type="number" id="'+id+'-adjacent" value="4" step="any" /></div></div>',
      "slope": '<div class="form-row"><div class="form-group"><label>Rise</label><input type="number" id="'+id+'-rise" value="1" step="any" /></div><div class="form-group"><label>Run</label><input type="number" id="'+id+'-run" value="10" step="any" /></div></div>',
      "offset-geo": '<div class="form-row"><div class="form-group"><label>Offset</label><input type="number" id="'+id+'-offset" value="300" step="any" /></div><div class="form-group"><label>Angle</label><input type="number" id="'+id+'-angle" value="45" step="any" /></div></div>'
    };
    return map[type] || map["right-triangle"];
  };

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }


  function init() {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon();
    applyStaticI18n();
    renderDashboard();
    renderCalcPages();
    enhanceSelects(document);
    renderFormulaLibrary();
    renderNotes();
    bindEvents();
    updateFavoritesUI();
    // Init unit converter To dropdown
    if (document.getElementById("unit-converter-from")) {
      window._updateUnitTo("unit-converter");
    }

    renderRecent();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
