/**
 * JMR Piping Calculator - Main Application
 */
(function () {
  "use strict";

  // State
  let currentPage = "dashboard";
  let favorites = JSON.parse(localStorage.getItem("jmr_favs") || "[]");
  let recent = JSON.parse(localStorage.getItem("jmr_recent") || "[]");
  let theme = localStorage.getItem("jmr_theme") || "dark";

  // NPS options
  const NPS_LIST = Object.keys(PIPE_DATA.pipes);
  const SCH_COMMON = ["5", "10", "20", "30", "40", "STD", "60", "80", "XS", "100", "120", "140", "160", "XXS"];

  // Init
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon();
    renderDashboard();
    renderCalcPages();
    renderFormulaLibrary();
    renderNotes();
    bindEvents();
    updateFavoritesUI();
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
    document.getElementById("searchBtn").addEventListener("click", openSearch);
    document.getElementById("bottomSearch").addEventListener("click", openSearch);
    document.getElementById("searchOverlay").addEventListener("click", e => {
      if (e.target.id === "searchOverlay") closeSearch();
    });
    document.getElementById("searchInput").addEventListener("input", doSearch);

    // Favorites header
    document.getElementById("favBtn").addEventListener("click", () => showPage("favorites"));
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
  }
  window.showPage = showPage;

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jmr_theme", theme);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    document.getElementById("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
  }

  // Dashboard
  function renderDashboard() {
    const grid = document.getElementById("dashboardGrid");
    grid.innerHTML = CALC_LIST.map(c => `
      <div class="calc-card" onclick="showPage('${c.id}')">
        <div class="card-icon">${c.icon}</div>
        <div class="card-title">${c.title}</div>
        <div class="card-desc">${c.desc}</div>
      </div>
    `).join("");
  }

  // Generate calculator pages
  function renderCalcPages() {
    const container = document.getElementById("calcPages");
    container.innerHTML = CALC_LIST.map(c => `
      <div class="page" id="page-${c.id}">
        <div class="calc-header">
          <button class="back-btn" onclick="showPage('dashboard')">←</button>
          <div>
            <h1 class="page-title" style="margin:0;font-size:1.3rem">${c.icon} ${c.title}</h1>
            <p class="page-subtitle" style="margin:0">${c.desc}</p>
          </div>
          <button class="icon-btn fav-btn" data-id="${c.id}" onclick="toggleFavorite('${c.id}')" title="Favorite">⭐</button>
        </div>
        <div class="calc-form" id="form-${c.id}">
          ${getFormHTML(c.id)}
          <div class="btn-group">
            <button class="btn btn-primary" onclick="runCalc('${c.id}')">Calculate</button>
            <button class="btn btn-secondary" onclick="resetForm('${c.id}')">Reset</button>
          </div>
        </div>
        <div class="results-panel" id="results-${c.id}">
          <div class="results-title">📊 Results</div>
          <div id="results-body-${c.id}"></div>
          <div class="action-bar">
            <button class="btn btn-secondary" onclick="copyResults('${c.id}')">📋 Copy</button>
            <button class="btn btn-secondary" onclick="shareResults('${c.id}')">📤 Share</button>
            <button class="btn btn-orange" onclick="exportPDF('${c.id}')">📄 PDF</button>
          </div>
        </div>
      </div>
    `).join("");
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
          <div class="form-group"><label>Fitting Angle (°)</label><select id="${id}-ang"><option value="45">45°</option><option value="30">30°</option><option value="60">60°</option><option value="22.5">22.5°</option></select></div>`;
      case "flange":
        return `<div class="form-row">${npsSelect}
          <div class="form-group"><label>Class</label><select id="${id}-cls"><option value="150">150</option><option value="300">300</option><option value="600">600</option></select></div>
        </div>
        <p class="unit-label">Note: Detailed BCD data currently for Class 150. Other classes show structure.</p>`;
      case "bolt-torque":
        return `
          <div class="form-group"><label>Bolt Size (inch)</label>
            <select id="${id}-size">${Object.keys(PIPE_DATA.boltTorque).map(s => `<option value="${s}">${s}"</option>`).join("")}</select>
          </div>
          <div class="form-group"><label>Condition</label>
            <select id="${id}-lub"><option value="lubricated">Lubricated</option><option value="dry">Dry</option></select>
          </div>`;
      case "hydrotest":
        return `
          <div class="form-row">
            <div class="form-group"><label>Design Pressure</label><input type="number" id="${id}-p" value="20" min="0" step="0.1" /></div>
            <div class="form-group"><label>Test Factor</label><input type="number" id="${id}-f" value="1.5" min="1" step="0.1" /></div>
          </div>
          <div class="form-row">${npsSelect}${schSelect}</div>
          <div class="form-row">
            <div class="form-group"><label>Length (m)</label><input type="number" id="${id}-length" value="10" min="0" /></div>
            <div class="form-group"><label>Hold Time (min)</label><input type="number" id="${id}-hold" value="30" min="1" /></div>
          </div>`;
      case "b31-3-stress":
        return `
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
      case "unit-converter":
        return `
          <div class="form-group"><label>Value</label><input type="number" id="${id}-val" value="100" step="any" /></div>
          <div class="form-row">
            <div class="form-group"><label>From</label>
              <select id="${id}-from">
                <option value="mm">mm</option><option value="inch">inch</option>
                <option value="m">m</option><option value="ft">ft</option>
                <option value="kg">kg</option><option value="ton">tonne</option>
                <option value="psi">psi</option><option value="bar">bar</option>
                <option value="MPa">MPa</option>
                <option value="C">°C</option><option value="F">°F</option>
              </select>
            </div>
            <div class="form-group"><label>To</label>
              <select id="${id}-to">
                <option value="inch">inch</option><option value="mm">mm</option>
                <option value="ft">ft</option><option value="m">m</option>
                <option value="ton">tonne</option><option value="kg">kg</option>
                <option value="bar">bar</option><option value="psi">psi</option>
                <option value="MPa">MPa</option>
                <option value="F">°F</option><option value="C">°C</option>
              </select>
            </div>
          </div>`;
      default:
        return "<p>Coming soon</p>";
    }
  }

  // Run calculation
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
          inputs = { rise: num(id, "rise"), roll: num(id, "roll"), angle: num(id, "ang") };
          showResults(id, Calculators.rollingOffset(inputs));
          break;
        case "flange":
          inputs = { nps: val(id, "nps"), flangeClass: val(id, "cls") };
          showResults(id, Calculators.flange(inputs));
          break;
        case "bolt-torque":
          inputs = { boltSize: val(id, "size"), lubricant: val(id, "lub") };
          showResults(id, Calculators.boltTorque(inputs));
          break;
        case "hydrotest":
          inputs = {
            designPressure: num(id, "p"), materialFactor: num(id, "f"),
            nps: val(id, "nps"), schedule: val(id, "sch"), length: num(id, "length"), holdTime: num(id, "hold")
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
            const [mass, x, y, z] = l.split(",").map(s => parseFloat(s.trim()) || 0);
            return { mass, x, y, z };
          });
          showResults(id, Calculators.cog({ items }));
          break;
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
    let html = data.results.map(r => `
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
    const text = `JMR Piping Calculator – ${id}\n\n` +
      data.results.map(r => `${r.label}: ${r.value} ${r.unit}`).join("\n") +
      (data.formula ? `\n\nFormula:\n${data.formula}` : "");
    navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard"));
  };

  window.shareResults = async function (id) {
    const panel = document.getElementById("results-" + id);
    const data = panel.dataset.lastResult ? JSON.parse(panel.dataset.lastResult) : null;
    if (!data) return;
    const text = `JMR Piping Calculator – ${id}\n` + data.results.map(r => `${r.label}: ${r.value} ${r.unit}`).join("\n");
    if (navigator.share) {
      try { await navigator.share({ title: "JMR Piping Result", text }); } catch (e) {}
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
      <html><head><title>JMR – ${title}</title>
      <style>
        body{font-family:system-ui;padding:24px;color:#111}
        h1{font-size:1.4rem;border-bottom:2px solid #1e40af;padding-bottom:8px}
        .item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}
        .formula{background:#f1f5f9;padding:12px;margin:16px 0;font-family:monospace;white-space:pre-wrap}
        .step{padding:4px 0;color:#444}
        footer{margin-top:32px;font-size:0.8rem;color:#666}
      </style></head><body>
      <h1>JMR Piping Calculator – ${title}</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      ${panel.querySelector("#results-body-" + id).innerHTML}
      <footer>JMR Piping Calculator • ASME B36.10 / B16.5 / B16.9 reference • For engineering guidance only</footer>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    printWin.document.close();
  };

  // Favorites
  window.toggleFavorite = function (id) {
    const idx = favorites.indexOf(id);
    if (idx >= 0) favorites.splice(idx, 1);
    else favorites.push(id);
    localStorage.setItem("jmr_favs", JSON.stringify(favorites));
    updateFavoritesUI();
    toast(idx >= 0 ? "Removed from favorites" : "Added to favorites");
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
        <div class="card-title">${c.title}</div>
      </div>`;
    }).join("");
  }

  function addRecent(id) {
    recent = recent.filter(r => r !== id);
    recent.unshift(id);
    if (recent.length > 12) recent.pop();
    localStorage.setItem("jmr_recent", JSON.stringify(recent));
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
  function doSearch() {
    const q = document.getElementById("searchInput").value.toLowerCase().trim();
    const res = document.getElementById("searchResults");
    if (!q) { res.innerHTML = ""; return; }
    const matches = CALC_LIST.filter(c =>
      c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
    res.innerHTML = matches.map(c => `
      <div class="search-item" onclick="showPage('${c.id}'); closeSearch();">
        <span style="font-size:1.4rem">${c.icon}</span>
        <div><strong>${c.title}</strong><br><small style="color:var(--text-muted)">${c.desc}</small></div>
      </div>
    `).join("") || `<p style="padding:12px;color:var(--text-muted)">No matches</p>`;
  }
  window.closeSearch = closeSearch;

  // Formula library
  function renderFormulaLibrary() {
    const formulas = [
      { title: "Pipe Weight (kg/m)", body: "W = (π/4) × (OD² − ID²) × ρ / 10⁶\nID = OD − 2t\nρ_CS ≈ 7850 kg/m³" },
      { title: "Pipe Internal Volume", body: "V = (π/4) × ID² × L\nCapacity (L) = V × 1000" },
      { title: "Elbow Arc Length", body: "L = π × R × θ / 180\nR_LR = 1.5 × OD, R_SR = 1.0 × OD" },
      { title: "Rolling Offset", body: "True Offset X = √(Rise² + Roll²)\nTravel = X / sin(θ)\nSetback = X / tan(θ)" },
      { title: "Hydrotest Pressure (B31.3)", body: "P_test = 1.5 × P_design (metallic pipe)\nHold ≥ 10 min after stabilization" },
      { title: "B31.3 Min. Wall Thickness", body: "t = P D / [2 (S E W + P Y)] + c\n(§304.1.2)  Y from Table 304.1.1" },
      { title: "B31.3 Sustained Stress", body: "SL = PD/(4t) + i MA / Z\nSL ≤ Sh   (§302.3.5)" },
      { title: "B31.3 Expansion Stress", body: "SA = f (1.25 Sc + 0.25 Sh)\nSE ≤ SA   (§319.4.4 / 302.3.5)" },
      { title: "Surface Area", body: "A_ext = π × OD × L\nA_int = π × ID × L" },
      { title: "Insulation Volume", body: "V = (π/4) × ((OD+2t)² − OD²) × L / 10⁶" },
      { title: "Stud Bolt Length (approx)", body: "L ≈ 2×t_flange + t_gasket + 2×h_nut + 2×washer + stick-out" },
      { title: "Center of Gravity", body: "X_cg = Σ(m·x) / Σm\nY_cg = Σ(m·y) / Σm\nZ_cg = Σ(m·z) / Σm" },
      { title: "Unit Conversions", body: "1 inch = 25.4 mm\n1 bar = 14.5038 psi\n1 MPa = 10 bar\n°F = °C×9/5 + 32" }
    ];
    document.getElementById("formulaList").innerHTML = formulas.map(f => `
      <div class="formula-card">
        <h3>${f.title}</h3>
        <div class="formula-box" style="margin:0">${f.body}</div>
      </div>
    `).join("");
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

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }

  // Initial recent render
  renderRecent();
})();
