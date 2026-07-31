# MU Piping Calculator

**Professional ASME-based piping engineering calculators for Oil & Gas, Petrochemical, Offshore, Refinery, and Construction.**

## Features

- **18 Calculators**: Pipe Weight, Volume, Schedule, Length, Elbow, Mitre Bend, Rolling Offset, Flange, Bolt Torque, Hydrotest, Surface Area, Painting, Insulation, Support Spacing, Welding, MTO, Center of Gravity, Unit Converter
- **ASME Standards**: B36.10 / B36.19 (pipe dims), B16.5 (flanges), B16.9 (elbows), B31.3 guidance
- **PWA**: Installable, offline-capable via Service Worker
- **Dark / Light mode**
- **Mobile-first** responsive design (Android, iPhone, Tablet, Desktop)
- **Every calculator**: Formulas, step-by-step, units, Reset / Copy / Share / PDF Export
- **Favorites, Recent, Search, Formula Library, Engineering Notes**
- **Local storage** for preferences

## How to Run

1. Serve the folder with any static server (required for Service Worker & PWA):
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
2. Open in browser → optionally “Add to Home Screen”.

## Design Theme

Industrial blue (#3b82f6), grey slate, accent orange (#f97316). Large touch targets for one-hand field use.

## Accuracy Notes

- Pipe dimensions & schedules from ASME B36.10M tables.
- Elbow center-to-end from ASME B16.9 tabulated values.
- Weights calculated from geometry + density (7850 kg/m³ CS).
- Flange Class 150 data included; other classes follow same structure (extend tables as needed).
- Torque & support spacing are typical industry values — always verify against project specifications and ASME PCC-1 / stress analysis.

## Future AI Roadmap (placeholders)

- Upload isometric → auto MTO
- AI weight estimation & fabrication planning
- Engineering assistant chat

## License

For professional engineering use. Verify all critical calculations against latest code editions and project specs.
