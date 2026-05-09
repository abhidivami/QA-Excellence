# Test Plan — Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Version:** 1.0  
**Prepared by:** QA Team  
**Date:** 2026-05-09  
**Status:** Approved

---

## 1. Introduction

This Test Plan describes what will be tested, when, by whom, and how. It is based on the Test Strategy and the seven client requirements for the Vendor Invoice Management Portal.

The goal of testing is to ensure the portal works correctly for vendors and the AP team, that data is processed accurately, and that the system is secure and reliable enough for business use.

---

## 2. Features to Be Tested

| Feature | Priority | Risk Level |
| --- | --- | --- |
| Vendor Registration | High | Medium |
| Vendor Login & Session | High | High |
| Invoice Submission | High | High |
| PO Validation | High | High |
| AP Approval / Rejection Workflow | High | High |
| Payment Forwarding | High | High |
| Email Notifications | Medium | Medium |
| Monthly Report Generation | Medium | Low |
| Role-Based Access Control | High | High |
| File Upload (format + size limits) | High | Medium |
| Duplicate Invoice Detection | High | High |
| Audit Trail / Logs | Medium | Medium |
| API Endpoints | High | High |
| Security (Auth, OWASP checks) | High | High |
| Cross-browser Compatibility | Medium | Low |
| Performance under Load | Medium | Medium |
| Accessibility (WCAG 2.1 AA) | Medium | Medium |
| Reliability / Session Recovery | Medium | Medium |
| Documentation Accuracy | Low | Low |

---

## 3. Features Not to Be Tested

| Feature | Reason |
| --- | --- |
| ERP/SAP internal processing | Out of project scope — only the integration point is tested |
| Payment gateway transaction logic | Handled by the payment provider — black-box only |
| Server infrastructure setup | Managed by DevOps team |
| Email delivery reliability | Depends on email service provider (SMTP/SendGrid) |

---

## 4. Test Approach

Testing will proceed in the following order:

1. **Smoke Test** — Confirm the build is stable and core pages load
2. **Functional Testing** — Test each feature against the requirements
3. **API Testing** — Test all backend endpoints using Postman
4. **Integration Testing** — Test cross-system flows (invoice → payment system, notifications)
5. **Security Testing** — Test authentication, authorization, and common vulnerabilities
6. **Performance Testing** — Simulate concurrent users and measure response times
7. **Regression Testing** — Re-run all test cases after bug fixes
8. **UAT** — Client team validates the portal against their business process

---

## 5. Test Schedule

| Phase | Activity | Estimated Duration |
| --- | --- | --- |
| Phase 1 | Requirements review + clarifying questions | 2 days |
| Phase 2 | Test case design + test data preparation | 3 days |
| Phase 3 | Smoke testing | 1 day |
| Phase 4 | Functional testing (all features) | 5 days |
| Phase 5 | API + integration testing | 3 days |
| Phase 6 | Security + performance testing | 2 days |
| Phase 7 | Bug fix verification + regression testing | 3 days |
| Phase 8 | UAT support | 2 days |
| **Total** | | **~21 working days** |

*Note: Schedule may be adjusted based on environment availability and bug resolution timelines.*

---

## 6. Resources

### Team

| Name / Role | Responsibility |
| --- | --- |
| QA Lead | Test planning, risk management, sign-off |
| QA Engineer 1 | Functional and API test execution |
| QA Engineer 2 | Security, performance, and regression testing |
| Business Analyst | Requirements support, UAT coordination |

### Hardware / Software

| Requirement | Details |
| --- | --- |
| Test Environment | Staging server (mirrors production) |
| Browsers | Chrome (latest), Firefox (latest), Safari, Edge |
| Devices | Desktop (Windows + Mac), Tablet, Mobile (Android + iOS) |
| Tools | Postman, JMeter, Jira, Selenium/Cypress |

---

## 7. Test Data Requirements

| Data Type | Details |
| --- | --- |
| Vendor Accounts | Minimum 5 test vendor accounts (active, inactive, unverified) |
| Purchase Orders | At least 10 POs with varied amounts, currencies, and statuses |
| Invoices | Sample invoices in PDF and Excel format, varying file sizes |
| AP Team Users | Accounts for AP Reviewer and AP Manager roles |
| Admin User | 1 system admin account |
| Invalid Test Data | Expired PO numbers, unsupported file types, oversized files |

All test data must be isolated from production. No real vendor or payment data will be used during testing.

---

## 8. Quality Metrics

These metrics define what "good enough to release" looks like. They are tracked throughout the test cycle and reported in the Test Execution Report.

| Metric | How It Is Measured | Target |
| --- | --- | --- |
| Requirement Coverage | (Requirements with ≥1 executed TC ÷ Total requirements) × 100 | 100% |
| Test Case Pass Rate | (Passed TCs ÷ Total executed TCs) × 100 | ≥ 95% before UAT |
| Defect Density | Total defects ÷ Number of features tested | ≤ 2 defects per feature |
| Defect Escape Rate | (Defects found in UAT ÷ Total defects found) × 100 | ≤ 5% |
| Critical Bug Fix Turnaround | Time from P1 bug logged to verified fix | ≤ 2 working days |
| Blocked Test Cases at UAT Start | Count of TCs still blocked on UAT start date | 0 |

---

## 9. Entry Criteria

The QA team will begin test execution only when all of the following conditions are met:

- [ ] All 7 requirements are reviewed and clarifications received from the client
- [ ] The application is deployed and accessible on the staging environment
- [ ] All test data is set up in the staging environment
- [ ] All test cases are written and reviewed
- [ ] A smoke test confirms the core pages load without errors

---

## 10. Exit Criteria

Testing will be considered complete when:

- [ ] 100% of planned test cases have been executed
- [ ] Zero open Critical bugs
- [ ] Zero open High severity bugs (or all accepted with written risk acknowledgement)
- [ ] Medium and Low bugs are logged and prioritised for future releases
- [ ] Test Execution Report is prepared and approved
- [ ] Client has signed off on UAT

---

## 11. Suspension Criteria

Testing will be paused if:

- The staging environment is down for more than 4 hours
- More than 30% of test cases are blocked due to a critical bug
- A major requirement change is introduced mid-testing cycle

Testing will resume once the blocking issue is resolved and confirmed by the QA Lead.

---

## 12. Deliverables

| Deliverable | Owner | When |
| --- | --- | --- |
| Clarifying Questions Document | QA Lead | Before test design |
| Test Strategy | QA Lead | Before test planning |
| Test Plan (this document) | QA Lead | Before execution |
| Test Scenarios and Test Cases | QA Engineer | Before execution |
| RTM (Requirements Traceability Matrix) | QA Engineer | During test design |
| Bug Reports | QA Engineer | During execution |
| Test Execution Report | QA Lead | After execution |

---

## 13. Project Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Integration with payment system not ready in time | High | High | Use mock/stub for payment API during functional testing |
| Incomplete requirements | Medium | High | Raise and resolve clarifying questions before test design |
| Environment instability | Medium | High | Have a rollback plan; schedule testing with DevOps |
| Team member unavailability | Low | Medium | Cross-train QA engineers on all feature areas |
| Scope creep (new features added mid-cycle) | Medium | Medium | Freeze scope before test execution; manage via change control |

---

## 14. Hidden Risks

These are risks that are not obvious from reading the requirements but could cause serious problems in production if not tested. They were identified during requirements analysis.

| # | Hidden Risk | Why It Is Not Obvious | How to Test For It |
| --- | --- | --- | --- |
| HR-01 | **Duplicate Payment** — The same invoice could be approved and forwarded for payment more than once if there is no system-level guard. | REQ-04 says "forward for payment" but does not say "only once". | TC-031 — attempt to approve and forward the same invoice twice. |
| HR-02 | **Unauthenticated Access via Direct URL** — A user who knows the URL structure could bypass the login page and access vendor or AP data directly. | REQ-07 mentions "authorized users only" but most teams only test the login page, not direct URL access. | TC-062 — navigate to protected pages without a session token. |
| HR-03 | **PO Over-billing** — A vendor could submit multiple invoices against the same PO over time, eventually billing more than the PO's total value. | REQ-02 says "submit invoices against purchase orders" but does not mention a cap. | TC-015, TC-081 — submit invoices that exceed the remaining PO balance. |
| HR-04 | **Malicious File Upload** — The file upload field could accept executable files (.exe, .sh, .bat), allowing harmful code to be stored on the server. | REQ-02 only says "upload invoices" — no mention of file type restrictions. | TC-012 — upload non-invoice file types. |
| HR-05 | **Data Leakage Between Vendors** — Vendor A could potentially view Vendor B's invoices if role-based filtering is not applied at the API level (only at the UI level). | REQ-07 mentions access control but teams often only test the UI, not the API directly. | TC-060 — call the invoice list API with Vendor A's token but request Vendor B's invoice ID. |
| HR-06 | **Email Notification Failure Silently Skipped** — If the email service is down, the system could approve or reject an invoice without notifying anyone, leaving both parties unaware of the status change. | REQ-05 says "receive notifications" but does not specify what happens if delivery fails. | TC-112 — disable the email service and verify that failures are logged and retried. |
| HR-07 | **Report Data Manipulation After the Fact** — If an invoice is deleted or backdated after a monthly report is generated, the report may no longer reflect accurate historical data. | REQ-06 says "generate monthly reports" but does not specify whether reports are snapshots or live queries. | TC-051 — cross-check report data against database records after a deletion. |
| HR-08 | **Session Fixation Attack** — After login, if the session token does not change, an attacker who captured the pre-login token could hijack the session. | REQ-01 mentions login but not session security internals. | Verify that the session token changes upon successful login (check browser dev tools). |
| HR-09 | **Concurrent Invoice Submission Race Condition** — If two users submit the same invoice number at exactly the same moment, both could succeed if the uniqueness check is not atomic at the database level. | REQ-02 mentions duplicate detection but not concurrency. | Simulate two simultaneous API calls with the same invoice number and check the database for duplicates. |

---

*This Test Plan is the QA team's commitment to the project. Any changes to scope or schedule must be agreed in writing with the project manager.*
