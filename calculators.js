/**
 * JMR Piping Calculator - All calculation engines
 * ASME B36.10, B16.5, B16.9 compliant formulas
 */

const Calculators = {
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
      formula: `W = (π/4) × (OD² − ID²) × ρ / 10⁶  [kg/m]\nID = OD − 2t\nWater = (π/4) × ID² × 1000 / 10⁶  [kg/m]\nInsul = (π/4) × ((OD+2ti)² − OD²) × ρᵢ / 10⁶`,
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
      formula: `V = (π/4) × ID² × L\nID = OD − 2t\nCapacity (L) = V × 1000`,
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
        { label: "Outside Diameter", value: od.toFixed(1), unit: "mm" },
        { label: "Wall Thickness", value: wall.toFixed(2), unit: "mm" },
        { label: "Inside Diameter", value: id.toFixed(2), unit: "mm" },
        { label: "Weight (Carbon Steel)", value: wpm.toFixed(3), unit: "kg/m" }
      ],
      formula: `Per ASME B36.10M / B36.19M\nID = OD − 2 × t\nWeight ≈ 0.02466 × t × (OD − t)  kg/m (approx for CS)`,
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
    const { centerline, elbows90 = 0, elbows45 = 0, radiusType = "LR", nps } = inputs;
    // Take-off for elbows (center-to-end)
    let takeoff90 = 0, takeoff45 = 0;
    if (nps && PIPE_DATA.elbowLR90[nps]) {
      takeoff90 = radiusType === "SR" ? (PIPE_DATA.elbowSR90[nps] || 0) : PIPE_DATA.elbowLR90[nps];
      takeoff45 = PIPE_DATA.elbowLR45[nps] || takeoff90 * 0.414;
    } else {
      // Generic: LR 1.5D, SR 1D approx using OD
      const pipe = getPipe(nps);
      const od = pipe ? pipe.od : 100;
      takeoff90 = radiusType === "SR" ? od : 1.5 * od;
      takeoff45 = takeoff90 * Math.tan(Math.PI / 8);
    }
    const totalTakeoff = elbows90 * takeoff90 + elbows45 * takeoff45;
    const cutLength = Math.max(0, (centerline || 0) - totalTakeoff);
    const developed = (centerline || 0); // centerline is already developed for routing

    return {
      results: [
        { label: "Centerline Length", value: (centerline || 0).toFixed(1), unit: "mm" },
        { label: "90° Elbow Take-off each", value: takeoff90.toFixed(1), unit: "mm" },
        { label: "45° Elbow Take-off each", value: takeoff45.toFixed(1), unit: "mm" },
        { label: "Total Take-off", value: totalTakeoff.toFixed(1), unit: "mm" },
        { label: "Cut Length (straight pipe)", value: cutLength.toFixed(1), unit: "mm" },
        { label: "Developed Length", value: developed.toFixed(1), unit: "mm" }
      ],
      formula: `Cut Length = Centerline − Σ (Elbow Center-to-End)\n90° LR C-E ≈ 1.5 × NPS (tabulated ASME B16.9)\n45° LR C-E ≈ 1.5 × NPS × tan(22.5°)`,
      steps: [
        `Centerline = ${centerline || 0} mm`,
        `${elbows90} × 90° (${radiusType}) take-off = ${elbows90} × ${takeoff90.toFixed(1)} = ${(elbows90 * takeoff90).toFixed(1)} mm`,
        `${elbows45} × 45° take-off = ${elbows45} × ${takeoff45.toFixed(1)} = ${(elbows45 * takeoff45).toFixed(1)} mm`,
        `Cut length of pipe = ${cutLength.toFixed(1)} mm`
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
        { label: "Center-to-End", value: centerToEnd.toFixed(1), unit: "mm" },
        { label: "Arc Length (centerline)", value: arcLength.toFixed(1), unit: "mm" }
      ],
      formula: `R_LR = 1.5 × OD    R_SR = 1.0 × OD\nCenter-to-End (90°) tabulated ASME B16.9\nArc Length = π × R × θ / 180`,
      steps: [
        `OD = ${od} mm`,
        `R = ${radiusType === "LR" ? "1.5" : "1.0"} × ${od} = ${R.toFixed(1)} mm`,
        `Center-to-End (${angle}°) ≈ ${centerToEnd.toFixed(1)} mm (ASME B16.9)`,
        `Arc = π × ${R.toFixed(1)} × ${angle}/180 = ${arcLength.toFixed(1)} mm`
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
      formula: `Segment angle = θ / (n + 1)\nDeveloped L = π × R × θ / 180\nMitre cut angle = segment/2 from perpendicular`,
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
    const { rise = 0, roll = 0, angle = 45 } = inputs;
    const trueOffset = Math.sqrt(rise * rise + roll * roll);
    const theta = angle * Math.PI / 180;
    const travel = trueOffset / Math.sin(theta);
    const setback = trueOffset / Math.tan(theta);
    const rollingAngle = Math.atan2(roll, rise) * 180 / Math.PI;

    return {
      results: [
        { label: "Rise (Vertical)", value: rise.toFixed(1), unit: "mm" },
        { label: "Roll (Horizontal)", value: roll.toFixed(1), unit: "mm" },
        { label: "True Offset", value: trueOffset.toFixed(2), unit: "mm" },
        { label: "Fitting Angle", value: angle, unit: "°" },
        { label: "Travel (Pipe Length)", value: travel.toFixed(2), unit: "mm" },
        { label: "Setback", value: setback.toFixed(2), unit: "mm" },
        { label: "Rolling Angle", value: rollingAngle.toFixed(2), unit: "°" }
      ],
      formula: `True Offset X = √(Rise² + Roll²)\nTravel T = X / sin(θ)\nSetback = X / tan(θ)\nRolling Angle = atan(Roll / Rise)`,
      steps: [
        `X = √(${rise}² + ${roll}²) = ${trueOffset.toFixed(2)} mm`,
        `T = ${trueOffset.toFixed(2)} / sin(${angle}°) = ${travel.toFixed(2)} mm`,
        `Setback = ${trueOffset.toFixed(2)} / tan(${angle}°) = ${setback.toFixed(2)} mm`,
        `Rolling plane angle = ${rollingAngle.toFixed(2)}°`
      ]
    };
  },

  // ========== 8. FLANGE ==========
  flange(inputs) {
    const { nps, flangeClass = "150" } = inputs;
    // Currently Class 150 data
    const f = PIPE_DATA.flange150[nps];
    if (!f) return { error: "NPS not in Class 150 table (extend for other classes)" };
    // Stud length estimate (simplified RF): 2×flange thk + gasket + 2×nut + washers
    // Approximate stud length from common charts
    const studApprox = {
      "1/2": 55, "3/4": 65, "1": 65, "1-1/4": 70, "1-1/2": 70, "2": 80,
      "2-1/2": 90, "3": 90, "4": 90, "6": 100, "8": 110, "10": 115,
      "12": 120, "14": 135, "16": 135, "18": 145, "20": 160, "24": 170
    };
    const studL = studApprox[nps] || 100;

    return {
      results: [
        { label: "NPS", value: nps, unit: "" },
        { label: "Class", value: flangeClass, unit: "" },
        { label: "Bolt Circle Diameter (BCD)", value: f.bcd.toFixed(1), unit: "mm" },
        { label: "Number of Bolt Holes", value: f.bolts, unit: "" },
        { label: "Bolt Size", value: f.boltSize, unit: "inch" },
        { label: "Flange OD (approx)", value: f.flangeOD, unit: "mm" },
        { label: "Stud Bolt Length (approx RF)", value: studL, unit: "mm" },
        { label: "Gasket OD (approx)", value: (f.bcd + 20).toFixed(0), unit: "mm" }
      ],
      formula: `Per ASME B16.5\nBCD, n bolts, bolt size tabulated by Class & NPS\nStud L ≈ 2×t_f + t_g + 2×h_nut + washers + stick-out`,
      steps: [
        `ASME B16.5 Class ${flangeClass} for NPS ${nps}`,
        `BCD = ${f.bcd} mm`,
        `${f.bolts} × ${f.boltSize}" bolts`,
        `Stud length ≈ ${studL} mm (verify with exact flange thickness)`
      ]
    };
  },

  // ========== 9. BOLT TORQUE ==========
  boltTorque(inputs) {
    const { boltSize, lubricant = "lubricated" } = inputs;
    const t = PIPE_DATA.boltTorque[boltSize];
    if (!t) return { error: "Bolt size not in table (common sizes 1/2 to 1-1/2)" };
    const torque = lubricant === "dry" ? t.dry : t.lub;
    return {
      results: [
        { label: "Bolt Size", value: boltSize, unit: "inch" },
        { label: "Condition", value: lubricant === "dry" ? "Dry (no lube)" : "Lubricated", unit: "" },
        { label: "Recommended Torque", value: torque, unit: "N·m" },
        { label: "Torque (approx ft-lb)", value: (torque * 0.7376).toFixed(0), unit: "ft·lb" }
      ],
      formula: `T = K × D × F\nWhere K ≈ 0.15–0.20 lubricated, 0.20–0.30 dry\nValues based on typical A193-B7 at ~50–60% yield`,
      steps: [
        `Bolt ${boltSize}"`,
        `Condition: ${lubricant}`,
        `Recommended assembly torque ≈ ${torque} N·m`,
        `Always follow project torque procedure / ASME PCC-1`
      ]
    };
  },

  // ========== 10. HYDROTEST ==========
  hydrotest(inputs) {
    const { designPressure, materialFactor = 1.5, nps, schedule, length, holdTime = 30 } = inputs;
    const testP = designPressure * materialFactor; // typically 1.5 × design for ASME B31.3
    const vol = Calculators.pipeVolume({ nps, schedule, length });
    const waterVol = vol.error ? 0 : parseFloat(vol.results.find(r => r.label === "Water Capacity").value);

    return {
      results: [
        { label: "Design Pressure", value: designPressure, unit: "bar / psi (user)" },
        { label: "Test Factor", value: materialFactor, unit: "" },
        { label: "Test Pressure", value: testP.toFixed(2), unit: "same units" },
        { label: "Water Volume Required", value: waterVol.toFixed(2), unit: "liters" },
        { label: "Recommended Holding Time", value: holdTime, unit: "minutes" }
      ],
      formula: `P_test = 1.5 × P_design  (ASME B31.3 metallic)\nHold time typically ≥ 10–30 min after stabilization\nWater volume from internal volume calculation`,
      steps: [
        `P_test = ${materialFactor} × ${designPressure} = ${testP.toFixed(2)}`,
        `Fill volume ≈ ${waterVol.toFixed(2)} L`,
        `Hold for ${holdTime} min at test pressure after temperature equalization`,
        `Inspect for leaks; depressurize safely`
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
      formula: `A_ext = π × OD × L\nA_int = π × ID × L\nA_ends = 2 × (π/4) × (OD² − ID²)`,
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
      formula: `Paint (L) = (Area × Coats) / Coverage\nAdd 10–15% for wastage / overspray`,
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
      formula: `V = (π/4) × ((OD+2t)² − OD²) × L / 10⁶\nm = V × ρ`,
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
      formula: `Empirical / manufacturer tables for Sch 40 CS\nIncrease ~30% for gas/steam, reduce for heavy insulated`,
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
      formula: `Weld length ≈ π × D_mean × N_joints\nFiller mass ≈ weld volume × density × deposition factor`,
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

  // ========== 18. UNIT CONVERTER ==========
  unitConverter(inputs) {
    const { value, from, to } = inputs;
    const v = parseFloat(value) || 0;
    const conversions = {
      "mm_inch": { factor: 1/25.4, label: "mm → inch" },
      "inch_mm": { factor: 25.4, label: "inch → mm" },
      "m_ft": { factor: 3.28084, label: "m → ft" },
      "ft_m": { factor: 0.3048, label: "ft → m" },
      "kg_ton": { factor: 0.001, label: "kg → tonne" },
      "ton_kg": { factor: 1000, label: "tonne → kg" },
      "psi_bar": { factor: 0.0689476, label: "psi → bar" },
      "bar_psi": { factor: 14.5038, label: "bar → psi" },
      "MPa_bar": { factor: 10, label: "MPa → bar" },
      "bar_MPa": { factor: 0.1, label: "bar → MPa" },
      "C_F": { factor: null, label: "°C → °F" },
      "F_C": { factor: null, label: "°F → °C" }
    };
    const key = `${from}_${to}`;
    let result, formula;
    if (key === "C_F") {
      result = v * 9/5 + 32;
      formula = "°F = °C × 9/5 + 32";
    } else if (key === "F_C") {
      result = (v - 32) * 5/9;
      formula = "°C = (°F − 32) × 5/9";
    } else if (conversions[key]) {
      result = v * conversions[key].factor;
      formula = `${conversions[key].label}: × ${conversions[key].factor}`;
    } else {
      return { error: "Unsupported conversion pair" };
    }
    return {
      results: [
        { label: "Input", value: v, unit: from },
        { label: "Output", value: result.toFixed(6).replace(/\.?0+$/, ""), unit: to }
      ],
      formula,
      steps: [`${v} ${from} = ${result.toFixed(6)} ${to}`]
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
    // SL = S_Lp + (i * MA) / Z
    // Allowable: SL ≤ Sh  (often Sh = S)
    const i = i_in || 1.0;
    const S_bending_sust = (i * MA) / Z; // MPa if MA in N·mm, Z in mm³
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
      formula: `ASME B31.3 Process Piping\n\n` +
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
  { id: "unit-converter", title: "Unit Converter", icon: "🔀", desc: "mm, inch, bar, psi, °C…", category: "Tools" }
];
