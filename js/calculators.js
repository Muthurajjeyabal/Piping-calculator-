/**
 * MU Piping Calculator - All calculation engines
 * ASME B36.10, B16.5, B16.9 compliant formulas
 */

const Calculators = {

  _svg(inner) {
    return `<div style="text-align:center;margin:10px 0;padding:10px;background:var(--bg-elevated,#1e293b);border-radius:12px;border:1px solid var(--border,#334155)">
      <svg viewBox="0 0 280 160" width="100%" style="max-width:280px;height:auto">${inner}</svg>
    </div>`;
  },

  // ========== 1. PIPE WEIGHT ==========
  pipeWeight(inputs) {
    const { nps, schedule, length, insulationThk = 0, insulationDensity = 120, material = "CS" } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const wall = getWall(nps, schedule);
    if (!wall) return { error: "Invalid Schedule for this NPS" };
    const od = pipe.od;
    const id = calcID(od, wall);
    const density = material === "SS" ? PIPE_DATA.densitySS : PIPE_DATA.densityCS;
    const emptyWpm = calcWeightPerMeter(od, wall, density);
    const waterWpm = (Math.PI / 4) * (id / 1000) ** 2 * PIPE_DATA.densityWater;
    const insWpm = insulationThk > 0
      ? (Math.PI / 4) * ((od + 2 * insulationThk) ** 2 - od ** 2) / 1e6 * insulationDensity
      : 0;
    const L = length || 1;
    const empty = emptyWpm * L;
    const waterFilled = (emptyWpm + waterWpm) * L;
    const insulated = (emptyWpm + insWpm) * L;
    const total = (emptyWpm + waterWpm + insWpm) * L;

    return {
      results: [
        { label: "Outside Diameter (OD)", value: od.toFixed(1), unit: "mm" },
        { label: "Wall Thickness", value: wall.toFixed(2), unit: "mm" },
        { label: "Inside Diameter (ID)", value: id.toFixed(2), unit: "mm" },
        { label: "Empty Weight / m", value: emptyWpm.toFixed(3), unit: "kg/m" },
        { label: "Water Content / m", value: waterWpm.toFixed(3), unit: "kg/m" },
        { label: "Insulation Weight / m", value: insWpm.toFixed(3), unit: "kg/m" },
        { label: "Empty Weight (Total)", value: empty.toFixed(2), unit: "kg" },
        { label: "Water-Filled Weight", value: waterFilled.toFixed(2), unit: "kg" },
        { label: "Insulated Weight (empty)", value: insulated.toFixed(2), unit: "kg" },
        { label: "Total Operating Weight", value: total.toFixed(2), unit: "kg" }
      ],
      diagram: Calculators._svg(`
  <line x1="20" y1="80" x2="260" y2="80" stroke="#475569" stroke-width="1" stroke-dasharray="4"/>
  <rect x="40" y="55" width="200" height="50" rx="2" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2"/>
  <rect x="48" y="63" width="184" height="34" rx="1" fill="rgba(15,23,42,0.6)" stroke="#38bdf8" stroke-width="1"/>
  <text x="140" y="45" text-anchor="middle" fill="#94a3b8" font-size="11">OD</text>
  <text x="140" y="125" text-anchor="middle" fill="#94a3b8" font-size="11">ID / Wall</text>
  <text x="140" y="88" text-anchor="middle" fill="#f97316" font-size="10">t</text>
`), formula: `W = (π/4) × (OD² − ID²) × ρ / 10⁶  [kg/m]\nID = OD − 2t\nWater = (π/4) × ID² × 1000 / 10⁶  [kg/m]\nInsul = (π/4) × ((OD+2ti)² − OD²) × ρᵢ / 10⁶`,
      steps: [
        `1. OD = ${od} mm (ASME B36.10 for NPS ${nps})`,
        `2. t = ${wall} mm (Schedule ${schedule})`,
        `3. ID = ${od} − 2×${wall} = ${id.toFixed(2)} mm`,
        `4. Steel density ρ = ${density} kg/m³`,
        `5. Empty mass/m = (π/4)×(${od}²−${id.toFixed(2)}²)×${density}/1e6 = ${emptyWpm.toFixed(3)} kg/m`,
        `6. For length L = ${L} m → Empty = ${empty.toFixed(2)} kg`
      ]
    };
  },

  // ========== 2. PIPE VOLUME ==========
  pipeVolume(inputs) {
    const { nps, schedule, length } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const wall = getWall(nps, schedule);
    if (!wall) return { error: "Invalid Schedule" };
    const od = pipe.od;
    const id = calcID(od, wall);
    const L = length || 1;
    const area_m2 = Math.PI * (id / 1000) ** 2 / 4;
    const vol_m3 = area_m2 * L;
    const vol_l = vol_m3 * 1000;
    const lpm = area_m2 * 1000; // liters per meter

    return {
      results: [
        { label: "Inside Diameter", value: id.toFixed(2), unit: "mm" },
        { label: "Internal Cross Section", value: (area_m2 * 1e6).toFixed(1), unit: "mm²" },
        { label: "Volume", value: vol_m3.toFixed(4), unit: "m³" },
        { label: "Water Capacity", value: vol_l.toFixed(2), unit: "liters" },
        { label: "Liters per Meter", value: lpm.toFixed(3), unit: "L/m" },
        { label: "Cubic Meters per Meter", value: area_m2.toFixed(6), unit: "m³/m" }
      ],
      diagram: Calculators._svg(`
  <line x1="20" y1="80" x2="260" y2="80" stroke="#475569" stroke-width="1" stroke-dasharray="4"/>
  <rect x="40" y="55" width="200" height="50" rx="2" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2"/>
  <rect x="48" y="63" width="184" height="34" rx="1" fill="rgba(15,23,42,0.6)" stroke="#38bdf8" stroke-width="1"/>
  <text x="140" y="45" text-anchor="middle" fill="#94a3b8" font-size="11">OD</text>
  <text x="140" y="125" text-anchor="middle" fill="#94a3b8" font-size="11">ID / Wall</text>
  <text x="140" y="88" text-anchor="middle" fill="#f97316" font-size="10">t</text>
`), formula: `V = (π/4) × ID² × L\nID = OD − 2t\nCapacity (L) = V × 1000`,
      steps: [
        `1. ID = ${od} − 2×${wall} = ${id.toFixed(2)} mm`,
        `2. Area = π/4 × (${id}/1000)² = ${area_m2.toFixed(6)} m²`,
        `3. Volume = Area × ${L} = ${vol_m3.toFixed(4)} m³ = ${vol_l.toFixed(2)} L`
      ]
    };
  },

  // ========== 3. PIPE SCHEDULE ==========
  pipeSchedule(inputs) {
    const { nps, schedule } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const wall = getWall(nps, schedule);
    if (!wall) return { error: "Schedule not available for this NPS" };
    const od = pipe.od;
    const id = calcID(od, wall);
    const wpm = calcWeightPerMeter(od, wall);

    return {
      results: [
        { label: "NPS", value: nps, unit: "" },
        { label: "DN", value: pipe.dn, unit: "" },
        { label: "Schedule", value: schedule, unit: "" },
        { label: "Pipe Standard (CS)", value: "ASME B36.10M", unit: "" },
        { label: "Pipe Standard (SS)", value: "ASME B36.19M", unit: "" },
        { label: "Outside Diameter", value: od.toFixed(1), unit: "mm" },
        { label: "Wall Thickness", value: wall.toFixed(2), unit: "mm" },
        { label: "Inside Diameter", value: id.toFixed(2), unit: "mm" },
        { label: "Weight (Carbon Steel)", value: wpm.toFixed(3), unit: "kg/m" }
      ],
      diagram: Calculators._svg(`
  <line x1="20" y1="80" x2="260" y2="80" stroke="#475569" stroke-width="1" stroke-dasharray="4"/>
  <rect x="40" y="55" width="200" height="50" rx="2" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2"/>
  <rect x="48" y="63" width="184" height="34" rx="1" fill="rgba(15,23,42,0.6)" stroke="#38bdf8" stroke-width="1"/>
  <text x="140" y="45" text-anchor="middle" fill="#94a3b8" font-size="11">OD</text>
  <text x="140" y="125" text-anchor="middle" fill="#94a3b8" font-size="11">ID / Wall</text>
  <text x="140" y="88" text-anchor="middle" fill="#f97316" font-size="10">t</text>
`), formula: `Per ASME B36.10M / B36.19M\nID = OD − 2 × t\nWeight ≈ 0.02466 × t × (OD − t)  kg/m (approx for CS)`,
      steps: [
        `Reference: ASME B36.10 (CS) / B36.19 (SS)`,
        `NPS ${nps} → DN ${pipe.dn}, OD = ${od} mm fixed`,
        `Schedule ${schedule} → nominal wall t = ${wall} mm`,
        `ID = ${id.toFixed(2)} mm`
      ]
    };
  },

  // ========== 4. PIPE LENGTH (Centerline / Cut / Developed) ==========
  pipeLength(inputs) {
    const { centerline, elbows90 = 0, elbows45 = 0, radiusType = "LR", nps,
            deductFittings = false, reducers = 0, tees = 0 } = inputs;
    // Take-off for elbows (center-to-end)
    let takeoff90 = 0, takeoff45 = 0;
    if (nps && PIPE_DATA.elbowLR90[nps]) {
      takeoff90 = radiusType === "SR" ? (PIPE_DATA.elbowSR90[nps] || 0) : PIPE_DATA.elbowLR90[nps];
      takeoff45 = PIPE_DATA.elbowLR45[nps] || takeoff90 * 0.414;
    } else {
      const pipe = getPipe(nps);
      const od = pipe ? pipe.od : 100;
      takeoff90 = radiusType === "SR" ? od : 1.5 * od;
      takeoff45 = takeoff90 * Math.tan(Math.PI / 8);
    }
    let reducerTO = 0, teeTO = 0;
    if (deductFittings) {
      // Approximate half-length take-off from equal tee / concentric reducer tables when available
      const tee = PIPE_DATA.teeEqual && PIPE_DATA.teeEqual[nps];
      const redKeys = Object.keys(PIPE_DATA.reducerH || {}).filter(k => k.startsWith(nps + "x") || k.endsWith("x" + nps));
      const redH = redKeys.length ? PIPE_DATA.reducerH[redKeys[0]] : (takeoff90 * 0.5);
      reducerTO = (reducers || 0) * (redH || takeoff90 * 0.5);
      teeTO = (tees || 0) * (tee ? tee.C : takeoff90 * 0.5);
    }
    const totalTakeoff = elbows90 * takeoff90 + elbows45 * takeoff45 + reducerTO + teeTO;
    const cutLength = Math.max(0, (centerline || 0) - totalTakeoff);
    const developed = (centerline || 0);

    return {
      results: [
        { label: "Centerline Length", value: (centerline || 0).toFixed(1), unit: "mm" },
        { label: "90° Elbow Take-off each", value: takeoff90.toFixed(1), unit: "mm" },
        { label: "45° Elbow Take-off each", value: takeoff45.toFixed(1), unit: "mm" },
        { label: "Total Elbow Take-off", value: (elbows90 * takeoff90 + elbows45 * takeoff45).toFixed(1), unit: "mm" },
        ...(deductFittings ? [
          { label: "Reducer Take-off total", value: reducerTO.toFixed(1), unit: "mm" },
          { label: "Tee Take-off total", value: teeTO.toFixed(1), unit: "mm" }
        ] : []),
        { label: "Cut Length (straight pipe)", value: cutLength.toFixed(1), unit: "mm" },
        { label: "Centerline Developed Length", value: developed.toFixed(1), unit: "mm" }
      ],
      diagram: Calculators._svg(`
  <line x1="30" y1="90" x2="100" y2="90" stroke="#60a5fa" stroke-width="4"/>
  <path d="M100,90 A30,30 0 0,1 130,60" fill="none" stroke="#f97316" stroke-width="4"/>
  <line x1="130" y1="60" x2="220" y2="60" stroke="#60a5fa" stroke-width="4"/>
  <text x="60" y="80" fill="#94a3b8" font-size="10">cut</text>
  <text x="115" y="55" fill="#f97316" font-size="10">A</text>
`), formula: `Cut Length = Centerline − Σ (Elbow Center-to-End)\nOptional: − Σ Reducer H − Σ Tee C\n90° / 45° C-E per ASME B16.9`,
      steps: [
        `Centerline = ${centerline || 0} mm`,
        `90° take-off × ${elbows90} = ${(elbows90 * takeoff90).toFixed(1)} mm`,
        `45° take-off × ${elbows45} = ${(elbows45 * takeoff45).toFixed(1)} mm`,
        ...(deductFittings ? [`Reducer/Tee deduction ON: ${(reducerTO + teeTO).toFixed(1)} mm`] : [`Fitting deduction OFF`]),
        `Cut Length = ${cutLength.toFixed(1)} mm`,
        `Centerline Developed Length = ${developed.toFixed(1)} mm`
      ]
    };
  },

  // ========== 5. ELBOW ==========
  elbow(inputs) {
    const { nps, angle = 90, radiusType = "LR" } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const od = pipe.od;
    let R, centerToEnd;
    if (radiusType === "SR") {
      R = od; // 1D
      centerToEnd = angle === 90 ? (PIPE_DATA.elbowSR90[nps] || od) :
                    angle === 45 ? (PIPE_DATA.elbowSR90[nps] || od) * 0.414 :
                    angle === 180 ? 2 * (PIPE_DATA.elbowSR90[nps] || od) : (PIPE_DATA.elbowSR90[nps] || od) * (angle / 90);
    } else {
      R = 1.5 * od;
      centerToEnd = angle === 90 ? (PIPE_DATA.elbowLR90[nps] || 1.5 * od) :
                    angle === 45 ? (PIPE_DATA.elbowLR45[nps] || 1.5 * od * 0.414) :
                    angle === 180 ? 2 * (PIPE_DATA.elbowLR90[nps] || 1.5 * od) : (PIPE_DATA.elbowLR90[nps] || 1.5 * od) * (angle / 90);
    }
    const arcLength = Math.PI * R * (angle / 180);

    return {
      results: [
        { label: "NPS / OD", value: `${nps} / ${od}`, unit: "mm" },
        { label: "Radius Type", value: radiusType === "LR" ? "Long Radius (1.5D)" : "Short Radius (1D)", unit: "" },
        { label: "Bend Radius R", value: R.toFixed(1), unit: "mm" },
        { label: "Angle", value: angle, unit: "°" },
        { label: "Center-to-End (A)", value: centerToEnd.toFixed(1), unit: "mm" },
        { label: "Tangent Length / Take-off", value: (angle === 180 ? centerToEnd / 2 : centerToEnd).toFixed(1), unit: "mm" },
        { label: "Center-to-Center", value: (angle === 180 ? centerToEnd : 2 * centerToEnd).toFixed(1), unit: "mm" },
        { label: "180° Return Face-to-Face (approx)", value: (angle === 180 ? centerToEnd : 2 * centerToEnd).toFixed(1), unit: "mm" },
        { label: "Arc Length (centerline)", value: arcLength.toFixed(1), unit: "mm" }
      ],
      diagram: Calculators._svg(`
  <path d="M50,130 L50,80 A60,60 0 0,1 140,40 L140,40" fill="none" stroke="#60a5fa" stroke-width="14" stroke-linecap="round"/>
  <path d="M50,130 L50,80 A60,60 0 0,1 140,40" fill="none" stroke="#1e293b" stroke-width="8"/>
  <line x1="50" y1="130" x2="50" y2="145" stroke="#94a3b8" stroke-width="1"/>
  <line x1="140" y1="40" x2="155" y2="40" stroke="#94a3b8" stroke-width="1"/>
  <text x="30" y="100" fill="#94a3b8" font-size="11">A</text>
  <text x="100" y="35" fill="#94a3b8" font-size="11">R</text>
  <circle cx="50" cy="80" r="3" fill="#f97316"/>
  <text x="160" y="70" fill="#f97316" font-size="11">θ</text>
`), formula: `R_LR = 1.5 × OD    R_SR = 1.0 × OD\nCenter-to-End (A) ASME B16.9\nTake-off = A\nCenter-to-Center (90°) = 2A\nArc = π × R × θ / 180`,
      steps: [
        `OD = ${od} mm (ASME B36.10 / B36.19)`,
        `R = ${radiusType === "LR" ? "1.5" : "1.0"} × OD = ${radiusType === "LR" ? "1.5" : "1.0"} × ${od} = ${R.toFixed(1)} mm`,
        `Center-to-End A (${angle}°) = ${centerToEnd.toFixed(1)} mm (ASME B16.9 table)`,
        `Take-off = A = ${(angle === 180 ? centerToEnd / 2 : centerToEnd).toFixed(1)} mm`,
        `Center-to-Center = ${angle === 180 ? "A (180° return)" : "2 × A"} = ${(angle === 180 ? centerToEnd : 2 * centerToEnd).toFixed(1)} mm`,
        `Arc Length = π × R × θ / 180 = π × ${R.toFixed(1)} × ${angle} / 180 = ${arcLength.toFixed(1)} mm`
      ]
    };
  },

  // ========== 6. MITRE BEND ==========
  mitreBend(inputs) {
    const { nps, angle = 90, cuts = 2, radius } = inputs;
    const pipe = getPipe(nps);
    const od = pipe ? pipe.od : 100;
    const R = radius || 1.5 * od;
    const n = Math.max(1, cuts);
    // Number of segments = cuts + 1 for simple mitre, but commonly cuts = number of mitres
    const segmentAngle = angle / (n + 1);
    // Developed length of centerline
    const developed = Math.PI * R * (angle / 180);
    // Gap / offset at each cut (approx)
    const halfAngleRad = (segmentAngle / 2) * Math.PI / 180;
    const gap = 2 * (od / 2) * Math.tan(halfAngleRad); // chord related

    return {
      results: [
        { label: "Total Bend Angle", value: angle, unit: "°" },
        { label: "Number of Cuts (Mitres)", value: n, unit: "" },
        { label: "Angle per Segment", value: segmentAngle.toFixed(2), unit: "°" },
        { label: "Bend Radius R", value: R.toFixed(1), unit: "mm" },
        { label: "Developed Centerline Length", value: developed.toFixed(1), unit: "mm" },
        { label: "Approx. Cut Face Offset", value: gap.toFixed(2), unit: "mm" }
      ],
      diagram: Calculators._svg(`
  <path d="M30,120 L80,120 L110,70 L160,70 L190,120 L240,120" fill="none" stroke="#60a5fa" stroke-width="10" stroke-linejoin="round"/>
  <path d="M30,120 L80,120 L110,70 L160,70 L190,120 L240,120" fill="none" stroke="#1e293b" stroke-width="5"/>
  <text x="100" y="50" fill="#94a3b8" font-size="11">mitre cuts</text>
  <text x="120" y="145" fill="#f97316" font-size="11">θ total</text>
`), formula: `Segment angle = θ / (n + 1)\nDeveloped L = π × R × θ / 180\nMitre cut angle = segment/2 from perpendicular`,
      steps: [
        `Total angle θ = ${angle}°`,
        `Cuts n = ${n} → segments = ${n + 1}`,
        `Each segment = ${segmentAngle.toFixed(2)}°`,
        `L = π × ${R.toFixed(1)} × ${angle}/180 = ${developed.toFixed(1)} mm`
      ]
    };
  },

  // ========== 7. ROLLING OFFSET ==========
  rollingOffset(inputs) {
    const { rise = 0, roll = 0, angle = 45, deductElbow = false, nps, radiusType = "LR" } = inputs;
    const trueOffset = Math.sqrt(rise * rise + roll * roll);
    const theta = angle * Math.PI / 180;
    const travel = trueOffset / Math.sin(theta);
    const setback = trueOffset / Math.tan(theta);
    const rollingAngle = Math.atan2(roll, rise) * 180 / Math.PI;
    let elbowDeduct = 0;
    if (deductElbow && nps && PIPE_DATA.elbowLR90[nps]) {
      const a = radiusType === "SR" ? (PIPE_DATA.elbowSR90[nps] || 0) : PIPE_DATA.elbowLR90[nps];
      // Two elbows typical on offset run — take-off each end approx A for 90°; scale by angle/90 for custom
      elbowDeduct = 2 * a * (angle / 90);
    }
    const pipeCut = Math.max(0, travel - elbowDeduct);

    return {
      results: [
        { label: "Rise (Vertical)", value: Number(rise).toFixed(1), unit: "mm" },
        { label: "Roll (Horizontal)", value: Number(roll).toFixed(1), unit: "mm" },
        { label: "True Offset", value: trueOffset.toFixed(2), unit: "mm" },
        { label: "Fitting / Travel Angle", value: angle, unit: "°" },
        { label: "Travel (centerline)", value: travel.toFixed(2), unit: "mm" },
        { label: "Setback", value: setback.toFixed(2), unit: "mm" },
        { label: "Rolling Angle", value: rollingAngle.toFixed(2), unit: "°" },
        ...(deductElbow ? [
          { label: "Elbow Take-off deduction", value: elbowDeduct.toFixed(1), unit: "mm" },
          { label: "Net Pipe Cut Length", value: pipeCut.toFixed(2), unit: "mm" }
        ] : [])
      ],
      diagram: Calculators._svg(`
  <!-- base run -->
  <line x1="20" y1="140" x2="90" y2="140" stroke="#60a5fa" stroke-width="4"/>
  <!-- travel diagonal -->
  <line x1="90" y1="140" x2="180" y2="50" stroke="#3b82f6" stroke-width="4"/>
  <!-- upper run -->
  <line x1="180" y1="50" x2="250" y2="50" stroke="#60a5fa" stroke-width="4"/>
  <!-- setback / run dashed -->
  <line x1="90" y1="140" x2="180" y2="140" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4"/>
  <!-- rise -->
  <line x1="180" y1="50" x2="180" y2="140" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4"/>
  <!-- roll hint -->
  <line x1="180" y1="140" x2="210" y2="140" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="3"/>
  <text x="45" y="132" fill="#94a3b8" font-size="9">run</text>
  <text x="125" y="155" fill="#94a3b8" font-size="9">Setback</text>
  <text x="188" y="100" fill="#f97316" font-size="9">Rise</text>
  <text x="195" y="155" fill="#a78bfa" font-size="9">Roll</text>
  <text x="120" y="90" fill="#3b82f6" font-size="10">Travel</text>
  <text x="100" y="40" fill="#e2e8f0" font-size="9">True Offset X</text>
  <text x="200" y="30" fill="#fbbf24" font-size="9">θ rolling</text>
  <circle cx="90" cy="140" r="3" fill="#f97316"/>
  <circle cx="180" cy="50" r="3" fill="#f97316"/>
`), formula: `X = √(Rise² + Roll²)\nTravel = X / sin(θ)\nSetback = X / tan(θ)\nRolling angle = atan(Roll/Rise)\nOptional: Cut ≈ Travel − 2×Elbow C-E×(θ/90)`,
      steps: [
        `X = √(${rise}² + ${roll}²) = ${trueOffset.toFixed(2)} mm`,
        `Travel = X / sin(${angle}°) = ${travel.toFixed(2)} mm`,
        `Setback = X / tan(${angle}°) = ${setback.toFixed(2)} mm`,
        `Rolling plane angle = ${rollingAngle.toFixed(2)}°`,
        ...(deductElbow ? [`Elbow deduction = ${elbowDeduct.toFixed(1)} mm → cut ${pipeCut.toFixed(2)} mm`] : [`Elbow take-off deduction OFF`])
      ]
    };
  },

  // ========== 8. FLANGE ==========
  flange(inputs) {
    const { nps, flangeClass = "150", faceType = "RF" } = inputs;
    const table = flangeClass === "300" ? PIPE_DATA.flange300
                : flangeClass === "600" ? PIPE_DATA.flange600
                : PIPE_DATA.flange150;
    const f = table && table[nps];
    if (!f) return { error: "NPS / Class combination not in table (Class " + flangeClass + ")" };
    // Stud length estimate (simplified): keep existing approx charts for 150; scale mildly by class
    const studApprox150 = {
      "1/2": 55, "3/4": 65, "1": 65, "1-1/4": 70, "1-1/2": 75, "2": 85,
      "2-1/2": 90, "3": 100, "4": 110, "6": 120, "8": 130, "10": 145,
      "12": 160, "14": 170, "16": 180, "18": 190, "20": 200, "24": 220
    };
    let stud = studApprox150[nps] || 100;
    if (flangeClass === "300") stud = Math.round(stud * 1.15);
    if (flangeClass === "600") stud = Math.round(stud * 1.35);
    if (faceType === "RTJ") stud = Math.round(stud + 10); // ring groove extra stack-up (approx)

    return {
      results: [
        { label: "NPS", value: nps, unit: "" },
        { label: "Flange Class", value: "Class " + flangeClass, unit: "" },
        { label: "Facing", value: faceType === "RTJ" ? "Ring Type Joint (RTJ)" : "Raised Face (RF)", unit: "" },
        { label: "Flange OD", value: f.flangeOD, unit: "mm" },
        { label: "Bolt Circle (BCD)", value: f.bcd, unit: "mm" },
        { label: "Number of Bolts", value: f.bolts, unit: "" },
        { label: "Bolt Size", value: f.boltSize, unit: "inch" },
        { label: "Stud Length (approx)", value: stud, unit: "mm" },
        { label: "Standard", value: "ASME B16.5", unit: "" }
      ],
      diagram: Calculators._svg(`
  <circle cx="140" cy="80" r="55" fill="none" stroke="#60a5fa" stroke-width="3"/>
  <circle cx="140" cy="80" r="38" fill="none" stroke="#f97316" stroke-dasharray="4"/>
  <circle cx="178" cy="80" r="4" fill="#f97316"/>
  <circle cx="102" cy="80" r="4" fill="#f97316"/>
  <circle cx="140" cy="42" r="4" fill="#f97316"/>
  <circle cx="140" cy="118" r="4" fill="#f97316"/>
  <text x="140" y="20" text-anchor="middle" fill="#94a3b8" font-size="10">BCD</text>
  <text x="140" y="155" text-anchor="middle" fill="#94a3b8" font-size="10">${faceType}</text>
`), formula: `ASME B16.5 Class ${flangeClass}\nFacing: ${faceType}\nStud length ≈ 2×tf + tg + 2×nut + washers + stick-out\nVerify exact flange thickness & gasket before ordering`,
      steps: [
        `Class ${flangeClass} / ${faceType} — ASME B16.5`,
        `BCD = ${f.bcd} mm, bolts = ${f.bolts} × ${f.boltSize}"`,
        `Stud length (estimate) = ${stud} mm — verify with flange thickness chart`
      ]
    };
  },

  // ========== 9. BOLT TORQUE ==========
  boltTorque(inputs) {
    const { boltSize, lubricant = "lub", material = "A193-B7" } = inputs;
    const t = PIPE_DATA.boltTorque[boltSize];
    if (!t) return { error: "Bolt size not in table" };
    const factor = (PIPE_DATA.boltMaterialFactor && PIPE_DATA.boltMaterialFactor[material]) || 1.0;
    const base = lubricant === "dry" ? t.dry : t.lub;
    const torque = Math.round(base * factor);
    return {
      results: [
        { label: "Bolt Size", value: boltSize, unit: "inch" },
        { label: "Material", value: material, unit: "" },
        { label: "Condition", value: lubricant === "dry" ? "Dry" : "Lubricated", unit: "" },
        { label: "Planning Torque", value: torque, unit: "N·m" },
        { label: "Planning Torque", value: (torque * 0.73756).toFixed(0), unit: "ft·lbf" }
      ],
      diagram: Calculators._svg(`
  <circle cx="140" cy="80" r="35" fill="none" stroke="#60a5fa" stroke-width="4"/>
  <text x="140" y="85" text-anchor="middle" fill="#f97316" font-size="14">T</text>
  <text x="140" y="140" text-anchor="middle" fill="#94a3b8" font-size="10">ASME PCC-1</text>
`), formula: `Planning values for ${material} (${lubricant})\nScaled from A193-B7 baseline × material factor ${factor}\nFinal tightening torque shall follow the approved project specification and ASME PCC-1.`,
      steps: [
        `Base (${lubricant}) ≈ ${base} N·m for size ${boltSize}"`,
        `Material factor (${material}) = ${factor}`,
        `Planning torque ≈ ${torque} N·m`,
        `Final tightening torque shall follow the approved project specification and ASME PCC-1.`
      ]
    };
  },

  // ========== 10. HYDROTEST ==========
  hydrotest(inputs) {
    const {
      designPressure, materialFactor = 1.5, nps, schedule, length, holdTime = 30,
      testType = "hydro", tempCorrection = false, T_test = 20, T_design = 20
    } = inputs;
    let factor = materialFactor;
    // Pneumatic often 1.1 × design (B31.3 guidance) — user can override materialFactor
    if (testType === "pneumatic" && materialFactor === 1.5) factor = 1.1;
    let testP = designPressure * factor;
    let tempNote = "No temperature correction applied";
    if (tempCorrection && testType === "hydro") {
      // Simple ratio of allowable stress proxy: S_test/S_design ≈ conservative 1.0 if unknown;
      // provide mild correction placeholder using linear temp derate assumption only as optional note
      const ratio = (T_design && T_test) ? Math.min(1.2, Math.max(0.9, (273 + T_design) / (273 + T_test))) : 1;
      testP = testP * ratio;
      tempNote = `Optional temp factor ≈ ${ratio.toFixed(3)} (verify vs B31.3 §345 / owner spec)`;
    }
    const vol = Calculators.pipeVolume({ nps, schedule, length });
    const waterVol = vol.error ? 0 : parseFloat(vol.results.find(r => r.label === "Water Capacity").value);

    return {
      results: [
        { label: "Test Type", value: testType === "pneumatic" ? "Pneumatic" : "Hydrostatic", unit: "" },
        { label: "Design Pressure", value: designPressure, unit: "bar / psi (user)" },
        { label: "Test Factor", value: factor, unit: "" },
        { label: "Test Pressure", value: testP.toFixed(2), unit: "same units" },
        { label: "Temperature Correction", value: tempCorrection ? "ON" : "OFF", unit: "" },
        { label: testType === "pneumatic" ? "Air/N₂ Volume (pipe capacity)" : "Water Volume Required", value: waterVol.toFixed(2), unit: "liters" },
        { label: "Recommended Holding Time", value: holdTime, unit: "minutes" }
      ],
      diagram: Calculators._svg(`
  <rect x="50" y="40" width="180" height="70" rx="4" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <rect x="50" y="90" width="180" height="20" fill="rgba(56,189,248,0.35)"/>
  <text x="140" y="80" text-anchor="middle" fill="#38bdf8" font-size="12">${testType === "pneumatic" ? "AIR" : "H₂O"}</text>
  <text x="140" y="130" text-anchor="middle" fill="#94a3b8" font-size="10">Test pressure · Hold time</text>
`), formula: testType === "pneumatic"
        ? `P_test ≈ 1.1 × P_design (typical pneumatic guidance)\nPneumatic testing requires strict safety procedures\nFollow ASME B31.3 §345 and site HSE rules`
        : `P_test = 1.5 × P_design (ASME B31.3 metallic, typical)\nHold ≥ 10–30 min after stabilization\n${tempNote}`,
      steps: [
        `Type = ${testType}`,
        `P_test = ${factor} × ${designPressure} = ${testP.toFixed(2)}`,
        tempNote,
        `Volume ≈ ${waterVol.toFixed(2)} L`,
        `Hold ${holdTime} min after temperature equalization`
      ]
    };
  },

  // ========== 11. SURFACE AREA ==========
  surfaceArea(inputs) {
    const { nps, length, includeEnds = false, schedule = "40" } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const od = pipe.od / 1000; // m
    const L = length || 1;
    const external = Math.PI * od * L;
    const wall = getWall(nps, schedule) || 0;
    const id = (pipe.od - 2 * wall) / 1000;
    const internal = Math.PI * id * L;
    const ends = includeEnds ? 2 * (Math.PI / 4) * (od * od - id * id) : 0;

    return {
      results: [
        { label: "External Surface Area", value: external.toFixed(4), unit: "m²" },
        { label: "Internal Surface Area", value: internal.toFixed(4), unit: "m²" },
        { label: "End Area (both)", value: ends.toFixed(4), unit: "m²" },
        { label: "Total (ext + ends)", value: (external + ends).toFixed(4), unit: "m²" }
      ],
      diagram: Calculators._svg(`
  <rect x="40" y="50" width="200" height="60" rx="2" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"/>
  <text x="140" y="85" text-anchor="middle" fill="#94a3b8" font-size="11">π · OD · L</text>
  <text x="140" y="130" text-anchor="middle" fill="#94a3b8" font-size="10">external surface</text>
`), formula: `A_ext = π × OD × L\nA_int = π × ID × L\nA_ends = 2 × (π/4) × (OD² − ID²)`,
      steps: [
        `OD = ${pipe.od} mm = ${od.toFixed(4)} m`,
        `A_ext = π × ${od.toFixed(4)} × ${L} = ${external.toFixed(4)} m²`
      ]
    };
  },

  // ========== 12. PAINTING ==========
  painting(inputs) {
    const { nps, length, coats = 2, coverage = 10 } = inputs; // coverage m²/L typical
    const sa = Calculators.surfaceArea({ nps, length, includeEnds: false });
    if (sa.error) return sa;
    const area = parseFloat(sa.results[0].value);
    const paintVol = (area * coats) / coverage;

    return {
      results: [
        { label: "External Area", value: area.toFixed(4), unit: "m²" },
        { label: "Number of Coats", value: coats, unit: "" },
        { label: "Paint Coverage", value: coverage, unit: "m²/L" },
        { label: "Paint Volume Required", value: paintVol.toFixed(3), unit: "liters" },
        { label: "With 10% Wastage", value: (paintVol * 1.1).toFixed(3), unit: "liters" }
      ],
      diagram: Calculators._svg(`
  <rect x="40" y="50" width="200" height="60" rx="2" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"/>
  <text x="140" y="85" text-anchor="middle" fill="#94a3b8" font-size="11">π · OD · L</text>
  <text x="140" y="130" text-anchor="middle" fill="#94a3b8" font-size="10">external surface</text>
`), formula: `Paint (L) = (Area × Coats) / Coverage\nAdd 10–15% for wastage / overspray`,
      steps: [
        `Area = ${area.toFixed(4)} m²`,
        `Paint = ${area.toFixed(4)} × ${coats} / ${coverage} = ${paintVol.toFixed(3)} L`
      ]
    };
  },

  // ========== 13. INSULATION ==========
  insulation(inputs) {
    const { nps, length, thk = 50, density = 120, material = "Mineral Wool" } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const od = pipe.od;
    const outer = od + 2 * thk;
    const vol_m3 = (Math.PI / 4) * ((outer / 1000) ** 2 - (od / 1000) ** 2) * (length || 1);
    const mass = vol_m3 * density;
    const outerArea = Math.PI * (outer / 1000) * (length || 1);

    return {
      results: [
        { label: "Pipe OD", value: od.toFixed(1), unit: "mm" },
        { label: "Insulation Thickness", value: thk, unit: "mm" },
        { label: "Outer Diameter (insulated)", value: outer.toFixed(1), unit: "mm" },
        { label: "Insulation Volume", value: vol_m3.toFixed(4), unit: "m³" },
        { label: "Insulation Mass", value: mass.toFixed(2), unit: "kg" },
        { label: "Outer Surface Area", value: outerArea.toFixed(4), unit: "m²" },
        { label: "Material", value: material, unit: "" }
      ],
      diagram: Calculators._svg(`
  <circle cx="140" cy="80" r="55" fill="rgba(249,115,22,0.2)" stroke="#f97316" stroke-width="2"/>
  <circle cx="140" cy="80" r="35" fill="rgba(96,165,250,0.25)" stroke="#60a5fa" stroke-width="2"/>
  <circle cx="140" cy="80" r="22" fill="rgba(15,23,42,0.7)" stroke="#38bdf8" stroke-width="1"/>
  <text x="140" y="84" text-anchor="middle" fill="#94a3b8" font-size="9">pipe</text>
  <text x="200" y="50" fill="#f97316" font-size="10">insul.</text>
`), formula: `V = (π/4) × ((OD+2t)² − OD²) × L / 10⁶\nm = V × ρ`,
      steps: [
        `Outer Ø = ${od} + 2×${thk} = ${outer} mm`,
        `V = ${vol_m3.toFixed(4)} m³`,
        `m = ${vol_m3.toFixed(4)} × ${density} = ${mass.toFixed(2)} kg`
      ]
    };
  },

  // ========== 14. SUPPORT SPACING ==========
  supportSpacing(inputs) {
    const { nps, fluid = "water", schedule = "40" } = inputs;
    let spacing = PIPE_DATA.supportSpacing[nps];
    if (!spacing) {
      // rough estimate based on OD
      const pipe = getPipe(nps);
      spacing = pipe ? 1.5 + pipe.od / 100 : 3;
    }
    if (fluid === "gas" || fluid === "steam") spacing *= 1.3;
    if (fluid === "empty") spacing *= 1.15;

    return {
      results: [
        { label: "NPS", value: nps, unit: "" },
        { label: "Suggested Max Spacing", value: spacing.toFixed(2), unit: "m" },
        { label: "Fluid Condition", value: fluid, unit: "" },
        { label: "Note", value: "Verify with project spec / ASME B31.1/B31.3", unit: "" }
      ],
      diagram: Calculators._svg(`
  <line x1="30" y1="70" x2="250" y2="70" stroke="#60a5fa" stroke-width="6"/>
  <rect x="50" y="70" width="14" height="40" fill="#f97316"/>
  <rect x="130" y="70" width="14" height="40" fill="#f97316"/>
  <rect x="210" y="70" width="14" height="40" fill="#f97316"/>
  <line x1="57" y1="120" x2="137" y2="120" stroke="#94a3b8" stroke-width="1"/>
  <text x="95" y="135" text-anchor="middle" fill="#94a3b8" font-size="10">spacing L</text>
`), formula: `Empirical / manufacturer tables for Sch 40 CS\nIncrease ~30% for gas/steam, reduce for heavy insulated`,
      steps: [
        `Base spacing for NPS ${nps} water-filled ≈ ${PIPE_DATA.supportSpacing[nps] || "N/A"} m`,
        `Adjusted for ${fluid}: ${spacing.toFixed(2)} m`,
        `Always check stress analysis & local codes`
      ]
    };
  },

  // ========== 15. WELDING ==========
  welding(inputs) {
    const { nps, schedule = "40", joints = 1, weldType = "butt" } = inputs;
    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const wall = getWall(nps, schedule) || 5;
    const od = pipe.od;
    const id = calcID(od, wall);
    // Circumference approx mean
    const meanCirc = Math.PI * ((od + id) / 2);
    const weldLength = meanCirc * joints / 1000; // m
    // Filler approx: volume of weld ≈ π × meanD × t × (bevel factor)
    // Simple: for single V, deposition ~ 1.1 × π × D_mean × t × 0.5 (approx kg using density)
    const weldVol_cm3 = Math.PI * ((od + id) / 2) * wall * 0.6 / 100; // rough cm³ per joint
    const fillerKg = (weldVol_cm3 * joints * 7.85) / 1000;

    return {
      results: [
        { label: "Number of Joints", value: joints, unit: "" },
        { label: "Weld Length (total)", value: weldLength.toFixed(3), unit: "m" },
        { label: "Approx. Filler Metal", value: fillerKg.toFixed(3), unit: "kg" },
        { label: "Wall Thickness", value: wall.toFixed(2), unit: "mm" },
        { label: "Note", value: "Estimate only – use WPS for actual consumption", unit: "" }
      ],
      diagram: Calculators._svg(`
  <line x1="30" y1="80" x2="120" y2="80" stroke="#60a5fa" stroke-width="8"/>
  <line x1="160" y1="80" x2="250" y2="80" stroke="#60a5fa" stroke-width="8"/>
  <polygon points="120,65 140,80 120,95" fill="#f97316"/>
  <polygon points="160,65 140,80 160,95" fill="#f97316"/>
  <text x="140" y="120" text-anchor="middle" fill="#94a3b8" font-size="10">weld joint</text>
`), formula: `Weld length ≈ π × D_mean × N_joints\nFiller mass ≈ weld volume × density × deposition factor`,
      steps: [
        `Mean diameter ≈ ${( (od+id)/2 ).toFixed(1)} mm`,
        `Length per joint ≈ ${(meanCirc/1000).toFixed(3)} m`,
        `Total weld length = ${weldLength.toFixed(3)} m`,
        `Approx filler = ${fillerKg.toFixed(3)} kg`
      ]
    };
  },

  // ========== 16. MTO ==========
  mto(inputs) {
    const { pipes = [], elbows = [], tees = 0, reducers = 0, flanges = 0, valves = 0 } = inputs;
    // pipes: [{nps, sch, length}]
    let totalPipeLength = 0;
    let pipeItems = [];
    pipes.forEach(p => {
      totalPipeLength += p.length || 0;
      pipeItems.push(`${p.nps} Sch ${p.sch}: ${(p.length||0).toFixed(1)} m`);
    });
    const elbowCount = elbows.reduce((s, e) => s + (e.qty || 0), 0);

    return {
      results: [
        { label: "Total Pipe Length", value: totalPipeLength.toFixed(1), unit: "m" },
        { label: "Elbows (total)", value: elbowCount, unit: "pcs" },
        { label: "Tees", value: tees, unit: "pcs" },
        { label: "Reducers", value: reducers, unit: "pcs" },
        { label: "Flanges", value: flanges, unit: "pcs" },
        { label: "Valves", value: valves, unit: "pcs" }
      ],
      formula: `Sum of all tagged quantities from isometric / P&ID`,
      steps: pipeItems.concat([
        `Elbows: ${elbowCount}`,
        `Tees: ${tees}, Reducers: ${reducers}`,
        `Flanges: ${flanges}, Valves: ${valves}`
      ])
    };
  },

  // ========== 17. CENTER OF GRAVITY ==========
  cog(inputs) {
    const { items = [] } = inputs; // [{mass, x, y, z}]
    if (!items.length) return { error: "Add at least one mass item" };
    let sumM = 0, sumMx = 0, sumMy = 0, sumMz = 0;
    items.forEach(it => {
      const m = it.mass || 0;
      sumM += m;
      sumMx += m * (it.x || 0);
      sumMy += m * (it.y || 0);
      sumMz += m * (it.z || 0);
    });
    if (sumM === 0) return { error: "Total mass is zero" };
    return {
      results: [
        { label: "Total Mass", value: sumM.toFixed(2), unit: "kg" },
        { label: "CoG X", value: (sumMx / sumM).toFixed(2), unit: "mm or m" },
        { label: "CoG Y", value: (sumMy / sumM).toFixed(2), unit: "mm or m" },
        { label: "CoG Z", value: (sumMz / sumM).toFixed(2), unit: "mm or m" }
      ],
      formula: `X_cg = Σ(mᵢ × xᵢ) / Σmᵢ\nY_cg = Σ(mᵢ × yᵢ) / Σmᵢ\nZ_cg = Σ(mᵢ × zᵢ) / Σmᵢ`,
      steps: [
        `Σm = ${sumM.toFixed(2)}`,
        `X = ${sumMx.toFixed(2)} / ${sumM.toFixed(2)} = ${(sumMx/sumM).toFixed(2)}`,
        `Y = ${(sumMy/sumM).toFixed(2)}, Z = ${(sumMz/sumM).toFixed(2)}`
      ]
    };
  },

  
  // ========== GEOMETRY CALCULATORS ==========
  geometry(inputs) {
    const { type } = inputs;
    const pi = Math.PI;
    const r = (x) => Math.round(x * 10000) / 10000;
    const svgWrap = (inner) =>
      `<div style="text-align:center;margin:12px 0;padding:12px;background:var(--bg-elevated,#1e293b);border-radius:12px;border:1px solid var(--border,#334155)">
        <svg viewBox="0 0 280 180" width="100%" style="max-width:280px;height:auto">${inner}</svg>
      </div>`;
    const lab = (x,y,txt) => `<text x="${x}" y="${y}" fill="#94a3b8" font-size="12" font-family="system-ui,sans-serif">${txt}</text>`;
    const stroke = 'stroke="#60a5fa" stroke-width="2" fill="none"';
    const fill = 'fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"';

    let diagram = "";
    let results = [], formula = "", steps = [];

    switch (type) {
      case "right-triangle":
      case "pythagoras": {
        let { a = 0, b = 0, c = 0 } = inputs;
        if (a && b && !c) c = Math.sqrt(a*a + b*b);
        else if (a && c && !b) b = Math.sqrt(Math.max(0, c*c - a*a));
        else if (b && c && !a) a = Math.sqrt(Math.max(0, c*c - b*b));
        const area = 0.5 * a * b;
        const angA = Math.atan2(a, b) * 180 / pi;
        const angB = 90 - angA;
        results = [
          { label: "Side a (opp)", value: r(a), unit: "" },
          { label: "Side b (adj)", value: r(b), unit: "" },
          { label: "Hypotenuse c", value: r(c), unit: "" },
          { label: "Area", value: r(area), unit: "" },
          { label: "Perimeter", value: r(a+b+c), unit: "" },
          { label: "Angle A", value: r(angA), unit: "°" },
          { label: "Angle B", value: r(angB), unit: "°" },
          { label: "Angle C", value: 90, unit: "°" }
        ];
        formula = "c² = a² + b²\nArea = ½·a·b";
        steps = [`c = √(${r(a)}²+${r(b)}²) = ${r(c)}`];
        diagram = svgWrap(`
          <polygon points="40,150 220,150 40,40" ${fill}/>
          <rect x="40" y="135" width="15" height="15" ${stroke}/>
          ${lab(120,168,"b")}
          ${lab(18,100,"a")}
          ${lab(140,90,"c")}
          ${lab(55,145,"90°")}
        `);
        break;
      }
      case "triangle": {
        const { a = 0, b = 0, c = 0 } = inputs;
        const s = (a+b+c)/2;
        const area = Math.sqrt(Math.max(0, s*(s-a)*(s-b)*(s-c)));
        // angles via cosine law
        const angA = (a&&b&&c) ? Math.acos(Math.min(1,Math.max(-1,(b*b+c*c-a*a)/(2*b*c))))*180/pi : 0;
        const angB = (a&&b&&c) ? Math.acos(Math.min(1,Math.max(-1,(a*a+c*c-b*b)/(2*a*c))))*180/pi : 0;
        const angC = (a&&b&&c) ? 180 - angA - angB : 0;
        results = [
          { label: "Sides a, b, c", value: `${r(a)}, ${r(b)}, ${r(c)}`, unit: "" },
          { label: "Semi-perimeter s", value: r(s), unit: "" },
          { label: "Area (Heron)", value: r(area), unit: "" },
          { label: "Angle A", value: r(angA), unit: "°" },
          { label: "Angle B", value: r(angB), unit: "°" },
          { label: "Angle C", value: r(angC), unit: "°" }
        ];
        formula = "s=(a+b+c)/2\nArea=√[s(s-a)(s-b)(s-c)]\nCosine law for angles";
        diagram = svgWrap(`
          <polygon points="140,30 250,150 30,150" ${fill}/>
          ${lab(140,20,"C")}
          ${lab(258,155,"B")}
          ${lab(15,155,"A")}
          ${lab(85,100,"b")}
          ${lab(200,100,"a")}
          ${lab(130,168,"c")}
        `);
        break;
      }
      case "circle": {
        const { radius = 0, diameter = 0 } = inputs;
        const R = radius || diameter/2;
        results = [
          { label: "Radius R", value: r(R), unit: "" },
          { label: "Diameter", value: r(2*R), unit: "" },
          { label: "Circumference", value: r(2*pi*R), unit: "" },
          { label: "Area", value: r(pi*R*R), unit: "" }
        ];
        formula = "C = 2πR\nA = πR²";
        diagram = svgWrap(`
          <circle cx="140" cy="90" r="60" ${fill}/>
          <line x1="140" y1="90" x2="200" y2="90" stroke="#f97316" stroke-width="2"/>
          <circle cx="140" cy="90" r="3" fill="#f97316"/>
          ${lab(155,85,"R")}
        `);
        break;
      }
      case "arc": {
        const { radius = 0, angle = 0 } = inputs;
        const arc = pi * radius * angle / 180;
        const chord = 2 * radius * Math.sin(angle * pi / 360);
        const sector = pi * radius * radius * angle / 360;
        const h = radius * (1 - Math.cos(angle * pi / 360));
        results = [
          { label: "Arc Length", value: r(arc), unit: "" },
          { label: "Chord Length", value: r(chord), unit: "" },
          { label: "Sector Area", value: r(sector), unit: "" },
          { label: "Segment Height", value: r(h), unit: "" }
        ];
        formula = "Arc=πRθ/180\nChord=2R sin(θ/2)\nSector=πR²θ/360";
        diagram = svgWrap(`
          <path d="M140,90 L200,90 A60,60 0 0,0 140,30 Z" ${fill}/>
          <path d="M200,90 A60,60 0 0,0 140,30" stroke="#f97316" stroke-width="2.5" fill="none"/>
          <line x1="140" y1="90" x2="200" y2="90" stroke="#60a5fa" stroke-width="1.5"/>
          <line x1="140" y1="90" x2="140" y2="30" stroke="#60a5fa" stroke-width="1.5"/>
          ${lab(165,70,"θ")}
          ${lab(175,100,"R")}
        `);
        break;
      }
      case "rectangle": {
        const { length = 0, width = 0 } = inputs;
        results = [
          { label: "Area", value: r(length*width), unit: "" },
          { label: "Perimeter", value: r(2*(length+width)), unit: "" },
          { label: "Diagonal", value: r(Math.sqrt(length*length+width*width)), unit: "" }
        ];
        formula = "A=L×W\nP=2(L+W)\nDiag=√(L²+W²)";
        diagram = svgWrap(`
          <rect x="50" y="40" width="180" height="100" ${fill}/>
          ${lab(130,155,"L")}
          ${lab(20,95,"W")}
        `);
        break;
      }
      case "square": {
        const { side = 0 } = inputs;
        results = [
          { label: "Area", value: r(side*side), unit: "" },
          { label: "Perimeter", value: r(4*side), unit: "" },
          { label: "Diagonal", value: r(side*Math.sqrt(2)), unit: "" }
        ];
        formula = "A=s²\nP=4s\nDiag=s√2";
        diagram = svgWrap(`
          <rect x="70" y="30" width="120" height="120" ${fill}/>
          ${lab(120,165,"s")}
        `);
        break;
      }
      case "trapezoid": {
        const { a = 0, b = 0, height = 0 } = inputs;
        results = [{ label: "Area", value: r(0.5*(a+b)*height), unit: "" }];
        formula = "A = ½(a+b)h";
        diagram = svgWrap(`
          <polygon points="80,40 200,40 240,140 40,140" ${fill}/>
          ${lab(130,32,"a")}
          ${lab(130,158,"b")}
          ${lab(250,95,"h")}
          <line x1="240" y1="40" x2="240" y2="140" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4"/>
        `);
        break;
      }
      case "parallelogram": {
        const { base = 0, height = 0, side = 0, angle = 0 } = inputs;
        const a = side || base;
        const b = base;
        const ang = angle || 0;
        let area = base * height;
        if (!height && ang && a) area = a * b * Math.sin(ang * pi / 180);
        const peri = 2 * (a + b);
        // diagonals if angle known
        const d1 = (ang && a && b) ? Math.sqrt(a*a + b*b + 2*a*b*Math.cos(ang*pi/180)) : 0;
        const d2 = (ang && a && b) ? Math.sqrt(a*a + b*b - 2*a*b*Math.cos(ang*pi/180)) : 0;
        results = [
          { label: "Area", value: r(area), unit: "" },
          { label: "Perimeter", value: r(peri), unit: "" }
        ];
        if (d1) results.push({ label: "Diagonal d1", value: r(d1), unit: "" });
        if (d2) results.push({ label: "Diagonal d2", value: r(d2), unit: "" });
        formula = "A = base×height = a·b·sin(α)\nP = 2(a+b)";
        diagram = svgWrap(`
          <polygon points="70,50 220,50 250,140 100,140" ${fill}/>
          <line x1="70" y1="50" x2="100" y2="140" stroke="#f97316" stroke-width="1" stroke-dasharray="3"/>
          ${lab(140,42,"b")}
          ${lab(55,100,"a")}
          ${lab(95,155,"b")}
          ${lab(85,130,"α")}
        `);
        break;
      }
      case "polygon": {
        const { sides = 6, side = 0 } = inputs;
        const n = Math.max(3, Math.round(sides));
        const area = (n * side * side) / (4 * Math.tan(pi/n));
        results = [
          { label: "Sides n", value: n, unit: "" },
          { label: "Perimeter", value: r(n*side), unit: "" },
          { label: "Area", value: r(area), unit: "" }
        ];
        formula = "A = (n·s²)/(4·tan(π/n))";
        // draw regular polygon
        let pts = [];
        for (let i = 0; i < n; i++) {
          const ang = -pi/2 + i * 2 * pi / n;
          pts.push((140 + 70*Math.cos(ang)).toFixed(1) + "," + (90 + 70*Math.sin(ang)).toFixed(1));
        }
        diagram = svgWrap(`<polygon points="${pts.join(" ")}" ${fill}/>${lab(130,168,"n="+n)}`);
        break;
      }
      case "cylinder": {
        const { radius = 0, height = 0 } = inputs;
        results = [
          { label: "Volume", value: r(pi*radius*radius*height), unit: "" },
          { label: "Lateral Area", value: r(2*pi*radius*height), unit: "" },
          { label: "Total Surface", value: r(2*pi*radius*(radius+height)), unit: "" }
        ];
        formula = "V=πR²h\nA_lat=2πRh\nA_tot=2πR(R+h)";
        diagram = svgWrap(`
          <ellipse cx="140" cy="40" rx="50" ry="18" ${fill}/>
          <line x1="90" y1="40" x2="90" y2="140" stroke="#60a5fa" stroke-width="2"/>
          <line x1="190" y1="40" x2="190" y2="140" stroke="#60a5fa" stroke-width="2"/>
          <ellipse cx="140" cy="140" rx="50" ry="18" ${fill}/>
          ${lab(200,95,"h")}
          ${lab(145,145,"R")}
        `);
        break;
      }
      case "cone": {
        const { radius = 0, height = 0 } = inputs;
        const slant = Math.sqrt(radius*radius + height*height);
        results = [
          { label: "Volume", value: r(pi*radius*radius*height/3), unit: "" },
          { label: "Slant Height l", value: r(slant), unit: "" },
          { label: "Lateral Area", value: r(pi*radius*slant), unit: "" },
          { label: "Total Surface", value: r(pi*radius*(radius+slant)), unit: "" }
        ];
        formula = "V=⅓πR²h\nl=√(R²+h²)";
        diagram = svgWrap(`
          <polygon points="140,25 220,150 60,150" ${fill}/>
          <ellipse cx="140" cy="150" rx="80" ry="16" ${fill}/>
          <line x1="140" y1="25" x2="140" y2="150" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4"/>
          ${lab(148,95,"h")}
          ${lab(145,168,"R")}
        `);
        break;
      }
      case "sphere": {
        const { radius = 0 } = inputs;
        results = [
          { label: "Volume", value: r(4/3*pi*radius*radius*radius), unit: "" },
          { label: "Surface Area", value: r(4*pi*radius*radius), unit: "" }
        ];
        formula = "V=⅔πR³ → 4/3 πR³\nA=4πR²";
        diagram = svgWrap(`
          <circle cx="140" cy="90" r="65" ${fill}/>
          <ellipse cx="140" cy="90" rx="65" ry="22" stroke="#94a3b8" stroke-width="1" fill="none" stroke-dasharray="3"/>
          <line x1="140" y1="90" x2="205" y2="90" stroke="#f97316" stroke-width="2"/>
          ${lab(160,85,"R")}
        `);
        break;
      }
      case "distance": {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = inputs;
        const d = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        results = [
          { label: "Distance", value: r(d), unit: "" },
          { label: "ΔX", value: r(x2-x1), unit: "" },
          { label: "ΔY", value: r(y2-y1), unit: "" }
        ];
        formula = "d = √[(x₂−x₁)²+(y₂−y₁)²]";
        diagram = svgWrap(`
          <line x1="50" y1="140" x2="220" y2="40" stroke="#60a5fa" stroke-width="2"/>
          <circle cx="50" cy="140" r="5" fill="#f97316"/>
          <circle cx="220" cy="40" r="5" fill="#f97316"/>
          ${lab(40,158,"(x1,y1)")}
          ${lab(200,32,"(x2,y2)")}
          ${lab(140,85,"d")}
        `);
        break;
      }
      case "angle": {
        const { opposite = 0, adjacent = 0, hypotenuse = 0 } = inputs;
        let deg = 0;
        if (opposite && adjacent) deg = Math.atan2(opposite, adjacent) * 180 / pi;
        else if (opposite && hypotenuse) deg = Math.asin(Math.min(1, opposite/hypotenuse)) * 180 / pi;
        else if (adjacent && hypotenuse) deg = Math.acos(Math.min(1, adjacent/hypotenuse)) * 180 / pi;
        results = [
          { label: "Angle", value: r(deg), unit: "°" },
          { label: "Radians", value: r(deg * pi / 180), unit: "rad" }
        ];
        formula = "θ = atan(opp/adj) | asin | acos";
        diagram = svgWrap(`
          <polygon points="40,150 200,150 40,50" ${fill}/>
          ${lab(110,168,"adj")}
          ${lab(18,100,"opp")}
          ${lab(55,145,"θ")}
        `);
        break;
      }
      case "slope": {
        const { rise = 0, run = 0 } = inputs;
        const pct = run ? (rise/run)*100 : 0;
        const deg = run ? Math.atan2(rise, run)*180/pi : 0;
        results = [
          { label: "Slope %", value: r(pct), unit: "%" },
          { label: "Angle", value: r(deg), unit: "°" },
          { label: "Ratio", value: run && rise ? `1 in ${r(run/rise)}` : "—", unit: "" }
        ];
        formula = "Slope% = (Rise/Run)×100\nθ = atan(Rise/Run)";
        diagram = svgWrap(`
          <line x1="40" y1="150" x2="240" y2="40" stroke="#60a5fa" stroke-width="2"/>
          <line x1="40" y1="150" x2="240" y2="150" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4"/>
          <line x1="240" y1="150" x2="240" y2="40" stroke="#f97316" stroke-width="1.5"/>
          ${lab(130,168,"Run")}
          ${lab(248,100,"Rise")}
        `);
        break;
      }
      case "offset-geo": {
        const { offset = 0, angle = 45 } = inputs;
        const travel = offset / Math.sin(angle * pi / 180 || 1e-9);
        const advance = offset / Math.tan(angle * pi / 180 || 1e-9);
        results = [
          { label: "Offset", value: r(offset), unit: "" },
          { label: "Travel", value: r(travel), unit: "" },
          { label: "Advance / Setback", value: r(advance), unit: "" }
        ];
        formula = "Travel = Offset/sin(θ)\nAdvance = Offset/tan(θ)";
        diagram = svgWrap(`
          <line x1="40" y1="140" x2="200" y2="140" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="40" y1="140" x2="160" y2="50" stroke="#60a5fa" stroke-width="2"/>
          <line x1="160" y1="50" x2="160" y2="140" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4"/>
          ${lab(165,100,"Offset")}
          ${lab(90,85,"Travel")}
          ${lab(90,155,"Advance")}
        `);
        break;
      }
      default:
        return { error: "Unknown geometry type" };
    }

    // attach diagram as first "result" HTML via special field
    return { results, formula, steps, diagram };
  },

  // ========== 18. UNIT CONVERTER ==========
  unitConverter(inputs) {
    const { value, from, to } = inputs;
    const v = parseFloat(value) || 0;

    const length = { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, yard: 0.9144, mile: 1609.344 };
    const mass = { mg: 1e-6, g: 0.001, kg: 1, tonne: 1000, lb: 0.45359237, oz: 0.028349523125 };
    const pressure = { Pa: 1, kPa: 1000, MPa: 1e6, bar: 1e5, psi: 6894.757293168, atm: 101325 };
    const area = { mm2: 1e-6, cm2: 1e-4, m2: 1, in2: 0.00064516, ft2: 0.09290304, acre: 4046.8564224 };
    const volume = { ml: 1e-6, L: 0.001, m3: 1, in3: 1.6387064e-5, ft3: 0.028316846592, gallon: 0.003785411784 };
    const angle = { deg: 1, rad: 180 / Math.PI, grad: 0.9 }; // store as degrees
    const force = { N: 1, kN: 1000, lbf: 4.4482216153, kgf: 9.80665 };
    const torque = { Nm: 1, kNm: 1000, ftlb: 1.3558179483, inlb: 0.112984829 };
    const energy = { J: 1, kJ: 1000, cal: 4.1868, kcal: 4186.8, Wh: 3600, kWh: 3.6e6, Btu: 1055.05585262 };
    const power = { W: 1, kW: 1000, hp: 745.699872, Btu_h: 0.29307107 };
    const density = { kg_m3: 1, g_cm3: 1000, lb_ft3: 16.01846337 };
    const flow = { m3_s: 1, m3_h: 1/3600, L_s: 0.001, L_min: 1/60000, gpm: 6.30901964e-5, cfm: 0.00047194745 };
    const speed = { m_s: 1, km_h: 1/3.6, ft_s: 0.3048, mph: 0.44704, knot: 0.514444 };

    const categories = [
      { name: "length", units: length },
      { name: "mass", units: mass },
      { name: "pressure", units: pressure },
      { name: "area", units: area },
      { name: "volume", units: volume },
      { name: "angle", units: angle },
      { name: "force", units: force },
      { name: "torque", units: torque },
      { name: "energy", units: energy },
      { name: "power", units: power },
      { name: "density", units: density },
      { name: "flow", units: flow },
      { name: "speed", units: speed },
      { name: "temperature", units: { C: 1, F: 1, K: 1 } }
    ];

    let cat = null;
    for (const c of categories) {
      if (from in c.units && to in c.units) { cat = c; break; }
    }
    if (!cat) {
      return { error: "Select units from the same category" };
    }

    let result, formula, steps;
    if (cat.name === "temperature") {
      let celsius = v;
      if (from === "F") celsius = (v - 32) * 5 / 9;
      else if (from === "K") celsius = v - 273.15;
      if (to === "C") result = celsius;
      else if (to === "F") result = celsius * 9 / 5 + 32;
      else if (to === "K") result = celsius + 273.15;
      formula = "Temperature via °C\\n°F = °C×9/5+32 | K = °C+273.15";
      steps = [`${v} ${from} → ${Number(result.toPrecision(10))} ${to}`];
    } else if (cat.name === "angle") {
      // factors convert TO degrees
      const deg = v * cat.units[from];
      result = deg / cat.units[to];
      formula = `${from} → ${to} (angle)\\nvia degrees`;
      steps = [`${v} ${from} = ${deg} °`, `= ${Number(result.toPrecision(10))} ${to}`];
    } else {
      const base = v * cat.units[from];
      result = base / cat.units[to];
      formula = `${from} → ${to} (${cat.name})\\nvia SI base unit`;
      steps = [
        `${v} ${from} = ${base} [base]`,
        `= ${Number(result.toPrecision(10))} ${to}`
      ];
    }

    const out = Number(result.toPrecision(10));
    return {
      results: [
        { label: "Input", value: v, unit: from },
        { label: "Output", value: out, unit: to },
        { label: "Category", value: cat.name, unit: "" }
      ],
      formula,
      steps
    };
  },


  // ========== 19. ASME B31.3 STRESS ANALYSIS ==========
  /**
   * Practical B31.3 Process Piping stress checks:
   * - Minimum required wall thickness (304.1.2)
   * - Hoop & longitudinal pressure stress
   * - Sustained longitudinal stress (302.3.5)
   * - Displacement stress range / expansion (319.4.4)
   * Units: pressure in MPa or bar (user selects), dimensions mm, stresses MPa
   */
  b31_3Stress(inputs) {
    const {
      nps, schedule,
      P,          // design pressure (user unit)
      Punit = "bar",
      T_des,      // design temp °C (info)
      S,          // basic allowable stress at design temp (MPa) — user from B31.3 App A
      E = 1.0,    // quality factor (weld joint)
      W = 1.0,    // weld joint strength reduction factor
      Y = 0.4,    // coefficient (Table 304.1.1) — 0.4 typical for ferritic ≤482°C
      c = 0,      // corrosion + mechanical allowances (mm)
      t_mill = 0, // mill tolerance % (e.g. 12.5) — applied to nominal t
      MA = 0,     // resultant sustained moment (N·mm) from weight etc.
      i_in = 1.0, // in-plane SIF (or user effective)
      SE = 0,     // expansion stress range from analysis (MPa) — or compute basic
      Sc = 0,     // allowable at cold (MPa)
      Sh = 0,     // allowable at hot (MPa) — often = S
      f = 1.0,    // stress range factor (cycles)
      // optional simple thermal expansion estimate
      L_anchor = 0, // distance between anchors (m)
      alpha = 12e-6, // thermal expansion coeff /°C (CS ~12e-6)
      dT = 0,     // temperature change °C
      E_mod = 200000 // modulus of elasticity MPa (CS ~200 GPa)
    } = inputs;

    const pipe = getPipe(nps);
    if (!pipe) return { error: "Invalid NPS" };
    const wallNom = getWall(nps, schedule);
    if (!wallNom) return { error: "Invalid Schedule for this NPS" };

    const D = pipe.od; // mm outside diameter
    // Convert pressure to MPa
    let P_MPa = P;
    if (Punit === "bar") P_MPa = P / 10;
    else if (Punit === "psi") P_MPa = P * 0.00689476;
    else if (Punit === "kPa") P_MPa = P / 1000;
    // else assume already MPa

    // --- 1. Minimum required thickness (B31.3 §304.1.2) ---
    // t = (P D) / (2 (S E W + P Y)) + c
    // When P / (S E W) < 0.385 use the formula; otherwise more rigorous
    const SEW = S * E * W;
    let t_req = 0;
    if (SEW > 0) {
      t_req = (P_MPa * D) / (2 * (SEW + P_MPa * Y)) + c;
    }
    // Nominal thickness after mill tolerance
    const t_min_ordered = wallNom * (1 - t_mill / 100);
    const t_avail = t_min_ordered - c; // for pressure design comparison (approx)

    // --- 2. Pressure stresses ---
    // Hoop (circumferential) stress ≈ P D / (2 t)  (using nominal or min wall)
    const t_use = Math.max(t_min_ordered, 0.001);
    const S_hoop = (P_MPa * D) / (2 * t_use);
    // Longitudinal pressure stress
    const S_Lp = (P_MPa * D) / (4 * t_use);

    // Section modulus Z ≈ π/32 * (D^4 - d^4)/D  or for thin ≈ π r² t
    const d = D - 2 * wallNom;
    const Z = (Math.PI / 32) * (Math.pow(D, 4) - Math.pow(d, 4)) / D; // mm³

    // --- 3. Sustained longitudinal stress (approx §302.3.5) ---
    // SL = S_Lp + (0.75i × MA) / Z   [B31.3 §302.3.5]
    // Allowable: SL ≤ Sh  (often Sh = S)
    const i = i_in || 1.0;
    const S_bending_sust = (Math.max(0.75 * i, 1.0) * MA) / Z; // B31.3 §302.3.5 uses 0.75i (min 1.0)
    const SL = S_Lp + S_bending_sust;
    const Sh_use = Sh > 0 ? Sh : S;
    const sustained_ok = SL <= Sh_use * 1.001; // small tolerance

    // --- 4. Displacement / Expansion stress range (§319.4.4) ---
    // SA = f (1.25 Sc + 0.25 Sh)
    // SE ≤ SA
    const Sc_use = Sc > 0 ? Sc : S;
    const SA = f * (1.25 * Sc_use + 0.25 * Sh_use);

    // Optional simple estimate of expansion stress for straight run between anchors
    // ε = alpha * dT ; σ ≈ E * ε  (fully constrained) — very conservative
    let SE_est = SE;
    let expansionNote = "User-supplied SE (from flexibility analysis)";
    if (SE <= 0 && L_anchor > 0 && dT !== 0) {
      const strain = alpha * dT;
      SE_est = E_mod * strain; // fully restrained axial — upper bound
      expansionNote = "Estimated as fully restrained axial (E·α·ΔT) — conservative upper bound";
    }
    const expansion_ok = SE_est <= SA * 1.001 || SA === 0;

    // Utilization
    const util_sust = Sh_use > 0 ? (SL / Sh_use * 100) : 0;
    const util_exp = SA > 0 ? (SE_est / SA * 100) : 0;

    const results = [
      { label: "Design Pressure", value: P.toFixed(3), unit: Punit },
      { label: "Pressure (converted)", value: P_MPa.toFixed(4), unit: "MPa" },
      { label: "Outside Diameter D", value: D.toFixed(1), unit: "mm" },
      { label: "Nominal Wall t_nom", value: wallNom.toFixed(2), unit: "mm" },
      { label: "Min. wall after mill tol.", value: t_min_ordered.toFixed(2), unit: "mm" },
      { label: "Required t (B31.3 304.1.2)", value: t_req.toFixed(3), unit: "mm" },
      { label: "Wall check (t_min − c ≥ t_req)", value: (t_min_ordered - c) >= t_req ? "PASS" : "FAIL", unit: "" },
      { label: "Hoop Stress (P D / 2t)", value: S_hoop.toFixed(2), unit: "MPa" },
      { label: "Long. Pressure Stress (PD/4t)", value: S_Lp.toFixed(2), unit: "MPa" },
      { label: "Section Modulus Z", value: Z.toFixed(0), unit: "mm³" },
      { label: "Sustained Bending Stress", value: S_bending_sust.toFixed(2), unit: "MPa" },
      { label: "Sustained Longitudinal SL", value: SL.toFixed(2), unit: "MPa" },
      { label: "Allowable Sh", value: Sh_use.toFixed(2), unit: "MPa" },
      { label: "Sustained Check SL ≤ Sh", value: sustained_ok ? "PASS" : "FAIL", unit: "" },
      { label: "Sustained Utilization", value: util_sust.toFixed(1), unit: "%" },
      { label: "Allowable Displacement SA", value: SA.toFixed(2), unit: "MPa" },
      { label: "Expansion Stress SE", value: SE_est.toFixed(2), unit: "MPa" },
      { label: "Expansion Check SE ≤ SA", value: expansion_ok ? "PASS" : "FAIL / Review", unit: "" },
      { label: "Expansion Utilization", value: util_exp.toFixed(1), unit: "%" }
    ];

    return {
      results,
      diagram: Calculators._svg(`
  <rect x="60" y="40" width="160" height="80" rx="2" fill="rgba(96,165,250,0.15)" stroke="#60a5fa" stroke-width="2"/>
  <rect x="70" y="50" width="140" height="60" fill="rgba(15,23,42,0.5)"/>
  <text x="140" y="85" text-anchor="middle" fill="#f97316" font-size="11">t = PR/(SEW−0.6YP)+c</text>
  <text x="140" y="140" text-anchor="middle" fill="#94a3b8" font-size="10">B31.3 min wall</text>
`), formula: `ASME B31.3 Process Piping\n\n` +
        `t = PD / [2(SEW + PY)] + c     (§304.1.2)\n` +
        `S_hoop ≈ PD / (2t)\n` +
        `S_Lp = PD / (4t)\n` +
        `SL = S_Lp + i·M_A / Z          (§302.3.5)  → SL ≤ Sh\n` +
        `SA = f (1.25 Sc + 0.25 Sh)     (§302.3.5)\n` +
        `SE ≤ SA                        (§319.4.4)\n` +
        `Z = π/32 · (D⁴ − d⁴)/D`,
      steps: [
        `1. Convert P = ${P} ${Punit} → ${P_MPa.toFixed(4)} MPa`,
        `2. D = ${D} mm (NPS ${nps}), t_nom = ${wallNom} mm (Sch ${schedule})`,
        `3. t_req = (${P_MPa.toFixed(4)}×${D}) / [2(${S}×${E}×${W} + ${P_MPa.toFixed(4)}×${Y})] + ${c} = ${t_req.toFixed(3)} mm`,
        `4. After mill tolerance ${t_mill}% → t_min = ${t_min_ordered.toFixed(2)} mm`,
        `5. Hoop stress = ${S_hoop.toFixed(2)} MPa ; Long. pressure = ${S_Lp.toFixed(2)} MPa`,
        `6. Z = ${Z.toFixed(0)} mm³ ; Sustained bending = i·MA/Z = ${S_bending_sust.toFixed(2)} MPa`,
        `7. SL = ${S_Lp.toFixed(2)} + ${S_bending_sust.toFixed(2)} = ${SL.toFixed(2)} MPa  → ${sustained_ok ? "≤" : ">"} Sh=${Sh_use}`,
        `8. SA = ${f}×(1.25×${Sc_use} + 0.25×${Sh_use}) = ${SA.toFixed(2)} MPa`,
        `9. SE = ${SE_est.toFixed(2)} MPa (${expansionNote}) → ${expansion_ok ? "OK" : "Review flexibility"}`
      ]
    };
  }
};

// List of all calculators for UI
const CALC_LIST = [
  { id: "pipe-weight", title: "Pipe Weight", icon: "⚖️", desc: "Empty, water-filled, insulated", category: "Pipe" },
  { id: "pipe-volume", title: "Pipe Volume", icon: "🧪", desc: "Internal volume & capacity", category: "Pipe" },
  { id: "pipe-schedule", title: "Pipe Schedule", icon: "📐", desc: "NPS, DN, thickness, OD/ID", category: "Pipe" },
  { id: "pipe-length", title: "Pipe Length", icon: "📏", desc: "Centerline, cut, developed", category: "Pipe" },
  { id: "elbow", title: "Elbow", icon: "↪️", desc: "45°/90°/180° LR & SR", category: "Fitting" },
  { id: "mitre", title: "Mitre Bend", icon: "✂️", desc: "Cuts, angle, developed length", category: "Fitting" },
  { id: "rolling-offset", title: "Rolling Offset", icon: "🔄", desc: "Travel, setback, angle", category: "Fitting" },
  { id: "flange", title: "Flange", icon: "⭕", desc: "BCD, bolts, stud length", category: "Flange" },
  { id: "bolt-torque", title: "Bolt Torque", icon: "🔧", desc: "Lubricated & dry torque", category: "Flange" },
  { id: "hydrotest", title: "Hydrotest", icon: "💧", desc: "Test pressure & volume", category: "Test" },
  { id: "b31-3-stress", title: "B31.3 Stress Analysis", icon: "📈", desc: "Wall thickness, sustained & expansion stress", category: "Stress" },
  { id: "surface-area", title: "Surface Area", icon: "⬜", desc: "External & internal area", category: "Pipe" },
  { id: "painting", title: "Painting", icon: "🎨", desc: "Paint volume estimation", category: "Pipe" },
  { id: "insulation", title: "Insulation", icon: "🧥", desc: "Volume, mass, outer area", category: "Pipe" },
  { id: "support-spacing", title: "Support Spacing", icon: "🔩", desc: "Max span recommendations", category: "Pipe" },
  { id: "welding", title: "Welding", icon: "🔥", desc: "Weld length & filler", category: "Fab" },
  { id: "mto", title: "MTO", icon: "📋", desc: "Material take-off summary", category: "Fab" },
  { id: "cog", title: "Center of Gravity", icon: "📍", desc: "3D CoG calculation", category: "Fab" },
    { id: "geometry", title: "Geometry Calculator", icon: "△", desc: "Triangle, circle, cylinder, slope…", category: "Geometry" },
  { id: "elbow-data", title: "Elbow Data", icon: "📚", desc: "ASME B16.9 LR/SR dimensions", category: "Reference" },
  { id: "ref-library", title: "Reference Library", icon: "📖", desc: "Tee, Reducer, Cap, OD, Schedule", category: "Reference" },
  { id: "unit-converter", title: "Unit Converter", icon: "🔀", desc: "mm, inch, bar, psi, °C…", category: "Tools" }
];
