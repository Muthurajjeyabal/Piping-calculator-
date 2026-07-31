/**
 * MU Piping Calculator - ASME B36.10 / B36.19 Pipe Dimension Data
 * All dimensions in mm / kg/m where applicable. Weights for carbon steel density ~7.85 g/cm³
 */
const PIPE_DATA = {
  // NPS: { od_mm, schedules: { sch: wall_mm } }
  // OD is fixed per NPS per ASME B36.10
  pipes: {
    "1/8": { nps: "1/8", dn: 6, od: 10.3, schedules: { "10": 1.24, "30": 1.45, "40": 1.73, "STD": 1.73, "80": 2.41, "XS": 2.41 } },
    "1/4": { nps: "1/4", dn: 8, od: 13.7, schedules: { "10": 1.65, "30": 1.85, "40": 2.24, "STD": 2.24, "80": 3.02, "XS": 3.02 } },
    "3/8": { nps: "3/8", dn: 10, od: 17.1, schedules: { "10": 1.65, "30": 1.85, "40": 2.31, "STD": 2.31, "80": 3.20, "XS": 3.20 } },
    "1/2": { nps: "1/2", dn: 15, od: 21.3, schedules: { "5": 1.65, "10": 2.11, "40": 2.77, "STD": 2.77, "80": 3.73, "XS": 3.73, "160": 4.78, "XXS": 7.47 } },
    "3/4": { nps: "3/4", dn: 20, od: 26.7, schedules: { "5": 1.65, "10": 2.11, "40": 2.87, "STD": 2.87, "80": 3.91, "XS": 3.91, "160": 5.56, "XXS": 7.82 } },
    "1": { nps: "1", dn: 25, od: 33.4, schedules: { "5": 1.65, "10": 2.77, "40": 3.38, "STD": 3.38, "80": 4.55, "XS": 4.55, "160": 6.35, "XXS": 9.09 } },
    "1-1/4": { nps: "1-1/4", dn: 32, od: 42.2, schedules: { "5": 1.65, "10": 2.77, "40": 3.56, "STD": 3.56, "80": 4.85, "XS": 4.85, "160": 6.35, "XXS": 9.70 } },
    "1-1/2": { nps: "1-1/2", dn: 40, od: 48.3, schedules: { "5": 1.65, "10": 2.77, "40": 3.68, "STD": 3.68, "80": 5.08, "XS": 5.08, "160": 7.14, "XXS": 10.15 } },
    "2": { nps: "2", dn: 50, od: 60.3, schedules: { "5": 1.65, "10": 2.77, "40": 3.91, "STD": 3.91, "80": 5.54, "XS": 5.54, "160": 8.74, "XXS": 11.07 } },
    "2-1/2": { nps: "2-1/2", dn: 65, od: 73.0, schedules: { "5": 2.11, "10": 3.05, "40": 5.16, "STD": 5.16, "80": 7.01, "XS": 7.01, "160": 9.53, "XXS": 14.02 } },
    "3": { nps: "3", dn: 80, od: 88.9, schedules: { "5": 2.11, "10": 3.05, "40": 5.49, "STD": 5.49, "80": 7.62, "XS": 7.62, "160": 11.13, "XXS": 15.24 } },
    "3-1/2": { nps: "3-1/2", dn: 90, od: 101.6, schedules: { "5": 2.11, "10": 3.05, "40": 5.74, "STD": 5.74, "80": 8.08, "XS": 8.08 } },
    "4": { nps: "4", dn: 100, od: 114.3, schedules: { "5": 2.11, "10": 3.05, "40": 6.02, "STD": 6.02, "80": 8.56, "XS": 8.56, "120": 11.13, "160": 13.49, "XXS": 17.12 } },
    "5": { nps: "5", dn: 125, od: 141.3, schedules: { "5": 2.77, "10": 3.40, "40": 6.55, "STD": 6.55, "80": 9.53, "XS": 9.53, "120": 12.70, "160": 15.88, "XXS": 19.05 } },
    "6": { nps: "6", dn: 150, od: 168.3, schedules: { "5": 2.77, "10": 3.40, "40": 7.11, "STD": 7.11, "80": 10.97, "XS": 10.97, "120": 14.27, "160": 18.26, "XXS": 21.95 } },
    "8": { nps: "8", dn: 200, od: 219.1, schedules: { "5": 2.77, "10": 3.76, "20": 6.35, "30": 7.04, "40": 8.18, "STD": 8.18, "60": 10.31, "80": 12.70, "XS": 12.70, "100": 15.09, "120": 18.26, "140": 20.62, "160": 23.01, "XXS": 22.23 } },
    "10": { nps: "10", dn: 250, od: 273.0, schedules: { "5": 3.40, "10": 4.19, "20": 6.35, "30": 7.80, "40": 9.27, "STD": 9.27, "60": 12.70, "80": 15.09, "100": 18.26, "120": 21.44, "140": 25.40, "160": 28.58 } },
    "12": { nps: "12", dn: 300, od: 323.8, schedules: { "5": 3.96, "10": 4.57, "20": 6.35, "30": 8.38, "40": 10.31, "STD": 9.53, "60": 14.27, "80": 17.48, "XS": 12.70, "100": 21.44, "120": 25.40, "140": 28.58, "160": 33.32 } },
    "14": { nps: "14", dn: 350, od: 355.6, schedules: { "10": 6.35, "20": 7.92, "30": 9.53, "40": 11.13, "STD": 9.53, "60": 15.09, "80": 19.05, "XS": 12.70, "100": 23.83, "120": 27.79, "140": 31.75, "160": 35.71 } },
    "16": { nps: "16", dn: 400, od: 406.4, schedules: { "10": 6.35, "20": 7.92, "30": 9.53, "40": 12.70, "STD": 9.53, "60": 16.66, "80": 21.44, "XS": 12.70, "100": 26.19, "120": 30.96, "140": 36.53, "160": 40.49 } },
    "18": { nps: "18", dn: 450, od: 457.2, schedules: { "10": 6.35, "20": 7.92, "30": 11.13, "40": 14.27, "STD": 9.53, "60": 19.05, "80": 23.83, "XS": 12.70, "100": 29.36, "120": 34.93, "140": 39.67, "160": 45.24 } },
    "20": { nps: "20", dn: 500, od: 508.0, schedules: { "10": 6.35, "20": 9.53, "30": 12.70, "40": 15.09, "STD": 9.53, "60": 20.62, "80": 26.19, "XS": 12.70, "100": 32.54, "120": 38.10, "140": 44.45, "160": 50.01 } },
    "24": { nps: "24", dn: 600, od: 609.6, schedules: { "10": 6.35, "20": 9.53, "30": 14.27, "40": 17.48, "STD": 9.53, "60": 24.61, "80": 30.96, "XS": 12.70, "100": 38.89, "120": 45.24, "140": 52.37, "160": 59.54 } },
    "22": { nps: "22", dn: 550, od: 558.8, schedules: { "10": 6.35, "20": 9.53, "30": 12.70, "STD": 9.53, "60": 22.23, "80": 28.58, "XS": 12.70, "100": 34.93, "120": 41.28, "140": 47.63, "160": 53.98 } },
    "26": { nps: "26", dn: 650, od: 660.4, schedules: { "10": 7.92, "20": 12.70, "STD": 9.53, "XS": 12.70 } },
    "28": { nps: "28", dn: 700, od: 711.2, schedules: { "10": 7.92, "20": 12.70, "30": 15.88, "STD": 9.53, "XS": 12.70 } },
    "30": { nps: "30", dn: 750, od: 762.0, schedules: { "5": 6.35, "10": 7.92, "20": 12.70, "30": 15.88, "STD": 9.53, "XS": 12.70 } },
    "32": { nps: "32", dn: 800, od: 812.8, schedules: { "10": 7.92, "20": 12.70, "30": 15.88, "40": 17.48, "STD": 9.53, "XS": 12.70 } },
    "34": { nps: "34", dn: 850, od: 863.6, schedules: { "10": 7.92, "20": 12.70, "30": 15.88, "40": 17.48, "STD": 9.53, "XS": 12.70 } },
    "36": { nps: "36", dn: 900, od: 914.4, schedules: { "10": 7.92, "20": 12.70, "30": 15.88, "40": 19.05, "STD": 9.53, "XS": 12.70 } },
    "42": { nps: "42", dn: 1050, od: 1066.8, schedules: { "20": 12.70, "30": 15.88, "40": 21.44, "STD": 9.53, "XS": 12.70 } },
    "48": { nps: "48", dn: 1200, od: 1219.2, schedules: { "20": 12.70, "30": 15.88, "40": 21.44, "STD": 9.53, "XS": 12.70 } }

  },

  // Elbow center-to-end (mm) per ASME B16.9 - Long Radius 90° = 1.5 × NPS (approx, actual tabulated)
  elbowLR90: {
    "1/2": 38, "3/4": 38, "1": 38, "1-1/4": 48, "1-1/2": 57, "2": 76, "2-1/2": 95, "3": 114, "3-1/2": 133, "4": 152, "5": 190, "6": 229, "8": 305, "10": 381, "12": 457, "14": 533, "16": 610, "18": 686, "20": 762, "22": 838, "24": 914, "26": 991, "28": 1067, "30": 1143, "32": 1219, "34": 1295, "36": 1372, "42": 1600, "48": 1829
  },
  elbowSR90: {
    "1/2": 25, "3/4": 25, "1": 25, "1-1/4": 32, "1-1/2": 38, "2": 51, "2-1/2": 64,
    "3": 76, "3-1/2": 89, "4": 102, "5": 127, "6": 152, "8": 203, "10": 254,
    "12": 305, "14": 356, "16": 406, "18": 457, "20": 508, "22": 559, "24": 610, "26": 660, "28": 711, "30": 762, "32": 813, "34": 864, "36": 914, "42": 1067, "48": 1219
  },
  elbowLR45: {
    "1/2": 16, "3/4": 19, "1": 22, "1-1/4": 25, "1-1/2": 29, "2": 35, "2-1/2": 44, "3": 51, "3-1/2": 57, "4": 64, "5": 79, "6": 95, "8": 127, "10": 159, "12": 190, "14": 222, "16": 254, "18": 286, "20": 318, "22": 343, "24": 381, "26": 406, "28": 438, "30": 470, "32": 502, "34": 533, "36": 565, "42": 660, "48": 759
  },

  // Density carbon steel kg/m³

  teeEqual: {
    "1/2": { C: 25, M: 25 }, "3/4": { C: 29, M: 29 }, "1": { C: 38, M: 38 },
    "1-1/4": { C: 48, M: 48 }, "1-1/2": { C: 57, M: 57 }, "2": { C: 64, M: 64 },
    "2-1/2": { C: 76, M: 76 }, "3": { C: 86, M: 86 }, "4": { C: 105, M: 105 },
    "6": { C: 143, M: 143 }, "8": { C: 178, M: 178 }, "10": { C: 216, M: 216 },
    "12": { C: 254, M: 254 }, "14": { C: 279, M: 279 }, "16": { C: 305, M: 305 },
    "18": { C: 343, M: 343 }, "20": { C: 381, M: 381 }, "24": { C: 432, M: 432 }
  },
  reducerH: {
    "3/4x1/2": 38, "1x1/2": 51, "1x3/4": 51, "1-1/4x1": 51, "1-1/2x1": 64,
    "1-1/2x1-1/4": 64, "2x1": 76, "2x1-1/2": 76, "2-1/2x2": 89, "3x2": 89,
    "3x2-1/2": 89, "4x2": 102, "4x3": 102, "6x4": 140, "8x6": 152,
    "10x8": 178, "12x10": 203, "14x12": 330, "16x12": 356, "18x14": 381,
    "20x16": 508, "24x20": 508
  },

  // Reducing Tee (ASME B16.9) — outlet branch run dimensions C / M approx for common sizes (mm)
  // Format: "RunxOutlet" → { C: center-to-end run, M: center-to-end branch }
  teeReducing: {
    "2x1": { C: 64, M: 44 }, "2x1-1/2": { C: 64, M: 57 },
    "2-1/2x1-1/2": { C: 76, M: 57 }, "2-1/2x2": { C: 76, M: 64 },
    "3x1-1/2": { C: 86, M: 57 }, "3x2": { C: 86, M: 64 }, "3x2-1/2": { C: 86, M: 76 },
    "4x2": { C: 105, M: 64 }, "4x2-1/2": { C: 105, M: 76 }, "4x3": { C: 105, M: 86 },
    "6x3": { C: 143, M: 86 }, "6x4": { C: 143, M: 105 },
    "8x4": { C: 178, M: 105 }, "8x6": { C: 178, M: 143 },
    "10x6": { C: 216, M: 143 }, "10x8": { C: 216, M: 178 },
    "12x8": { C: 254, M: 178 }, "12x10": { C: 254, M: 216 },
    "14x10": { C: 279, M: 216 }, "14x12": { C: 279, M: 254 },
    "16x12": { C: 305, M: 254 }, "16x14": { C: 305, M: 279 },
    "18x14": { C: 343, M: 279 }, "18x16": { C: 343, M: 305 },
    "20x16": { C: 381, M: 305 }, "20x18": { C: 381, M: 343 },
    "24x18": { C: 432, M: 343 }, "24x20": { C: 432, M: 381 }
  },
  // Stub End (Lap Joint) ASME B16.9 / MSS SP-43 — Type A long pattern approximate F & G (mm)
  // F = length of stub, G = radius of fillet (approx)
  stubEnd: {
    "1/2": { F: 76, G: 3, type: "Long" },
    "3/4": { F: 76, G: 3, type: "Long" },
    "1": { F: 102, G: 3, type: "Long" },
    "1-1/4": { F: 102, G: 5, type: "Long" },
    "1-1/2": { F: 102, G: 6, type: "Long" },
    "2": { F: 152, G: 8, type: "Long" },
    "2-1/2": { F: 152, G: 8, type: "Long" },
    "3": { F: 152, G: 10, type: "Long" },
    "4": { F: 152, G: 11, type: "Long" },
    "6": { F: 203, G: 13, type: "Long" },
    "8": { F: 203, G: 13, type: "Long" },
    "10": { F: 254, G: 15, type: "Long" },
    "12": { F: 254, G: 19, type: "Long" },
    "14": { F: 305, G: 19, type: "Long" },
    "16": { F: 305, G: 19, type: "Long" },
    "18": { F: 305, G: 21, type: "Long" },
    "20": { F: 305, G: 25, type: "Long" },
    "24": { F: 305, G: 25, type: "Long" }
  },

  capE: {
    "1/2": 25, "3/4": 25, "1": 38, "1-1/4": 38, "1-1/2": 38, "2": 38,
    "2-1/2": 38, "3": 51, "4": 51, "6": 64, "8": 76, "10": 89, "12": 102,
    "14": 127, "16": 152, "18": 178, "20": 203, "24": 229
  },
  densityCS: 7850,
  densitySS: 8000,
  densityWater: 1000,

  // Flange Class 150 BCD / bolts (simplified common sizes) - BCD mm, bolts count, bolt size inch
  flange150: {
    "1/2": { bcd: 60.3, bolts: 4, boltSize: "1/2", flangeOD: 89 },
    "3/4": { bcd: 69.9, bolts: 4, boltSize: "1/2", flangeOD: 98 },
    "1": { bcd: 79.4, bolts: 4, boltSize: "1/2", flangeOD: 108 },
    "1-1/4": { bcd: 88.9, bolts: 4, boltSize: "1/2", flangeOD: 117 },
    "1-1/2": { bcd: 98.4, bolts: 4, boltSize: "1/2", flangeOD: 127 },
    "2": { bcd: 120.7, bolts: 4, boltSize: "5/8", flangeOD: 152 },
    "2-1/2": { bcd: 139.7, bolts: 4, boltSize: "5/8", flangeOD: 178 },
    "3": { bcd: 152.4, bolts: 4, boltSize: "5/8", flangeOD: 191 },
    "4": { bcd: 190.5, bolts: 8, boltSize: "5/8", flangeOD: 229 },
    "6": { bcd: 241.3, bolts: 8, boltSize: "3/4", flangeOD: 279 },
    "8": { bcd: 298.5, bolts: 8, boltSize: "3/4", flangeOD: 343 },
    "10": { bcd: 362.0, bolts: 12, boltSize: "7/8", flangeOD: 406 },
    "12": { bcd: 431.8, bolts: 12, boltSize: "7/8", flangeOD: 483 },
    "14": { bcd: 476.3, bolts: 12, boltSize: "1", flangeOD: 533 },
    "16": { bcd: 539.8, bolts: 16, boltSize: "1", flangeOD: 597 },
    "18": { bcd: 577.9, bolts: 16, boltSize: "1-1/8", flangeOD: 635 },
    "20": { bcd: 635.0, bolts: 20, boltSize: "1-1/8", flangeOD: 698 },
    "24": { bcd: 749.3, bolts: 20, boltSize: "1-1/4", flangeOD: 813 }
  },

  // Typical bolt torque (Nm) lubricated - approximate values for A193 B7
  boltTorque: {
    "1/2": { dry: 90, lub: 55 },
    "5/8": { dry: 180, lub: 110 },
    "3/4": { dry: 310, lub: 190 },
    "7/8": { dry: 490, lub: 300 },
    "1": { dry: 720, lub: 440 },
    "1-1/8": { dry: 990, lub: 600 },
    "1-1/4": { dry: 1400, lub: 850 },
    "1-3/8": { dry: 1900, lub: 1150 },
    "1-1/2": { dry: 2500, lub: 1500 }
  },


  // ASME B16.5 Class 300 (BCD mm, bolts, boltSize inch, flangeOD mm) - common sizes
  flange300: {
    "1/2": { bcd: 66.7, bolts: 4, boltSize: "1/2", flangeOD: 95 },
    "3/4": { bcd: 82.6, bolts: 4, boltSize: "5/8", flangeOD: 117 },
    "1": { bcd: 88.9, bolts: 4, boltSize: "5/8", flangeOD: 124 },
    "1-1/4": { bcd: 98.4, bolts: 4, boltSize: "5/8", flangeOD: 133 },
    "1-1/2": { bcd: 114.3, bolts: 4, boltSize: "3/4", flangeOD: 155 },
    "2": { bcd: 127.0, bolts: 8, boltSize: "5/8", flangeOD: 165 },
    "2-1/2": { bcd: 149.2, bolts: 8, boltSize: "3/4", flangeOD: 191 },
    "3": { bcd: 168.3, bolts: 8, boltSize: "3/4", flangeOD: 210 },
    "4": { bcd: 200.0, bolts: 8, boltSize: "3/4", flangeOD: 254 },
    "6": { bcd: 269.9, bolts: 12, boltSize: "3/4", flangeOD: 318 },
    "8": { bcd: 330.2, bolts: 12, boltSize: "7/8", flangeOD: 381 },
    "10": { bcd: 387.4, bolts: 16, boltSize: "1", flangeOD: 445 },
    "12": { bcd: 450.8, bolts: 16, boltSize: "1-1/8", flangeOD: 521 },
    "14": { bcd: 514.4, bolts: 20, boltSize: "1-1/8", flangeOD: 584 },
    "16": { bcd: 571.5, bolts: 20, boltSize: "1-1/4", flangeOD: 648 },
    "18": { bcd: 628.6, bolts: 24, boltSize: "1-1/4", flangeOD: 711 },
    "20": { bcd: 685.8, bolts: 24, boltSize: "1-1/4", flangeOD: 775 },
    "24": { bcd: 812.8, bolts: 24, boltSize: "1-1/2", flangeOD: 914 }
  },
  // ASME B16.5 Class 600
  flange600: {
    "1/2": { bcd: 66.7, bolts: 4, boltSize: "1/2", flangeOD: 95 },
    "3/4": { bcd: 82.6, bolts: 4, boltSize: "5/8", flangeOD: 117 },
    "1": { bcd: 88.9, bolts: 4, boltSize: "5/8", flangeOD: 124 },
    "1-1/4": { bcd: 98.4, bolts: 4, boltSize: "5/8", flangeOD: 133 },
    "1-1/2": { bcd: 114.3, bolts: 4, boltSize: "3/4", flangeOD: 155 },
    "2": { bcd: 127.0, bolts: 8, boltSize: "5/8", flangeOD: 165 },
    "2-1/2": { bcd: 149.2, bolts: 8, boltSize: "3/4", flangeOD: 191 },
    "3": { bcd: 168.3, bolts: 8, boltSize: "3/4", flangeOD: 210 },
    "4": { bcd: 215.9, bolts: 8, boltSize: "7/8", flangeOD: 273 },
    "6": { bcd: 292.1, bolts: 12, boltSize: "1", flangeOD: 356 },
    "8": { bcd: 349.2, bolts: 12, boltSize: "1-1/8", flangeOD: 419 },
    "10": { bcd: 431.8, bolts: 16, boltSize: "1-1/4", flangeOD: 508 },
    "12": { bcd: 489.0, bolts: 20, boltSize: "1-1/4", flangeOD: 559 },
    "14": { bcd: 527.0, bolts: 20, boltSize: "1-3/8", flangeOD: 603 },
    "16": { bcd: 565.2, bolts: 20, boltSize: "1-1/2", flangeOD: 686 },
    "18": { bcd: 612.8, bolts: 20, boltSize: "1-5/8", flangeOD: 743 },
    "20": { bcd: 673.1, bolts: 24, boltSize: "1-5/8", flangeOD: 813 },
    "24": { bcd: 771.5, bolts: 24, boltSize: "1-7/8", flangeOD: 940 }
  },
  // Approximate torque multipliers by material vs B7 baseline (planning only)
  boltMaterialFactor: {
    "A193-B7": 1.0,
    "A193-B8": 0.75,
    "A193-B8M": 0.75,
    "A193-B16": 1.05,
    "A320-L7": 1.0,
    "A307-B": 0.55
  },
  // Sample allowable stresses MPa (indicative @ typical design temps) — user can override
  materialAllowables: {
    "A106-B": { Sc: 138, Sh: 138, note: "CS, ~-29 to 100°C band (verify code table)" },
    "A53-B": { Sc: 137, Sh: 137, note: "CS" },
    "A312-TP304": { Sc: 138, Sh: 115, note: "SS 304 indicative" },
    "A312-TP316": { Sc: 138, Sh: 115, note: "SS 316 indicative" },
    "A335-P11": { Sc: 138, Sh: 130, note: "Low alloy" },
    "Custom": { Sc: 138, Sh: 138, note: "Enter S manually" }
  },

  // Support spacing approx (m) for carbon steel Sch 40 water filled - simplified
  supportSpacing: {
    "1": 2.1, "1-1/2": 2.7, "2": 3.0, "3": 3.7, "4": 4.3, "6": 5.2,
    "8": 5.8, "10": 6.4, "12": 7.0, "14": 7.3, "16": 7.6, "18": 7.9, "20": 8.2, "24": 8.8
  }
};

// Helper
function getPipe(nps) {
  return PIPE_DATA.pipes[nps] || null;
}

function getWall(nps, sch) {
  const p = getPipe(nps);
  if (!p) return null;
  return p.schedules[sch] || p.schedules[String(sch)] || null;
}

function calcWeightPerMeter(od, wall, density = 7850) {
  // kg/m = π/4 * (OD² - ID²) * density / 1e6
  const id = od - 2 * wall;
  return (Math.PI / 4) * (od * od - id * id) * density / 1e6;
}

function calcID(od, wall) {
  return od - 2 * wall;
}
