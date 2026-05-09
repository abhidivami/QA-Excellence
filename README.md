# QA Excellence — Learning Days

A structured QA training resource covering the full quality assurance lifecycle, from theory to hands-on practice.

---

## Contents

| File | Description |
| --- | --- |
| [Week-1/01_QA_Excellence.pptx](Week-1/01_QA_Excellence.pptx) | Main training deck — 60-minute session covering QA fundamentals |
| [Week-1/assessment/](Week-1/assessment/) | Hands-on assessment deliverables for the B2B Vendor Invoice Portal |

---

## Training Overview

The training deck covers six areas:

1. **Rethinking QA** — Myths, definitions, QA vs QC vs Testing, objectives
2. **The QA Lifecycle** — All 8 phases from requirements analysis to deployment
3. **Test Artifacts** — Test strategy, plan, cases, bug reports, RTM
4. **Testing Knowledge** — Levels, pyramid, types, and limitations
5. **The QA Mindset** — Critical thinking, customer empathy, traits of great QA
6. **Assessment** — Hands-on B2B use case

---

## Assessment — Vendor Invoice Management Portal

The assessment applies the training to a real B2B scenario. All deliverables are in the [`assessment/`](assessment/) folder.

| # | Deliverable | Purpose |
| --- | --- | --- |
| 01 | [Clarifying Questions](Week-1/assessment/01_Clarifying_Questions.md) | 60+ questions to resolve ambiguities across all 7 requirements before testing begins |
| 02 | [Test Strategy](Week-1/assessment/02_Test_Strategy.md) | High-level QA approach, scope, test types, tools, metrics |
| 03 | [Test Plan](Week-1/assessment/03_Test_Plan.md) | Schedule, resources, entry/exit criteria, risks, quality metrics |
| 04 | [Test Scenarios & Cases](Week-1/assessment/04_Test_Scenarios_and_Cases.md) | 51 test cases across functional, BVA, state transition, non-functional, and integration testing |
| 05 | [RTM](Week-1/assessment/05_RTM.md) | Requirements Traceability Matrix linking all 7 requirements to test cases |
| 06 | [Bug Reports](Week-1/assessment/06_Bug_Report_Sample.md) | 6 sample bug reports covering Critical, High, and Medium severity defects |
| 07 | [Test Execution Report](Week-1/assessment/07_Test_Execution_Report.md) | Post-cycle summary with pass rates, defect counts, metrics, and exit criteria status |

---

## Key Concepts Covered

- Shift-left testing — QA starts at requirements, not after development
- Testing pyramid — invest more at unit and integration, fewer at UI
- Boundary Value Analysis — test at the edges, not just the middle
- State Transition Testing — validate every valid and invalid status change
- Defect density, escape rate, and test effectiveness as quality metrics
- The difference between Severity (impact) and Priority (urgency)
