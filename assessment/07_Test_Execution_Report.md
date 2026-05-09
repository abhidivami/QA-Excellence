# Test Execution Report — Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Test Cycle:** Cycle 1 — Functional Testing  
**Version:** 1.0  
**Prepared by:** QA Team  
**Reporting Period:** 2026-05-09 to 2026-05-23  
**Status:** Draft (Template with sample data)

---

## 1. Executive Summary

This report summarises the results of the first functional test cycle for the Vendor Invoice Management Portal. Testing covered all 7 client requirements across 33 test cases in areas including vendor registration, invoice submission, AP approval workflow, payment forwarding, email notifications, reporting, and access control.

### Overall Result: EXIT CRITERIA NOT MET — UAT CANNOT BEGIN

The Test Plan defined three exit criteria. Two are not satisfied:

| Exit Criterion | Target | Actual | Met? |
| --- | --- | --- | --- |
| 100% of test cases executed | 33/33 | 33/33 (2 blocked) | Partial |
| Zero open Critical bugs | 0 | 2 open (BUG-001, BUG-002) | No |
| Zero open High bugs | 0 | 3 open (BUG-003, BUG-004, BUG-007) | No |

Core functionality is working in several areas, but critical and high severity defects must be resolved before UAT is scheduled.

---

## 2. Test Execution Summary

| Metric | Count |
| --- | --- |
| Total Test Cases Planned | 33 |
| Total Test Cases Executed | 33 |
| Passed | 24 |
| Failed | 7 |
| Blocked | 2 |
| Not Executed | 0 |
| **Pass Rate** | **72.7%** |

---

## 3. Results by Requirement

| Req ID | Requirement | Total TCs | Passed | Failed | Blocked | Pass Rate |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-01 | Vendor Registration & Login | 8 | 6 | 1 | 1 | 75% |
| REQ-02 | Invoice Submission | 6 | 3 | 3 | 0 | 50% |
| REQ-03 | AP Approval Workflow | 5 | 4 | 1 | 0 | 80% |
| REQ-04 | Payment Forwarding | 2 | 1 | 1 | 0 | 50% |
| REQ-05 | Email Notifications | 4 | 3 | 1 | 0 | 75% |
| REQ-06 | Monthly Reports | 2 | 1 | 1 | 0 | 50% |
| REQ-07 | Role-Based Access Control | 6 | 6 | 0 | 0 | 100% |  
| **Total** | | **33** | **24** | **7** | **1** | **72.7%** |

---

## 4. Defect Summary

| Bug ID | Title | Severity | Priority | Status | Linked TC |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | Vendor can submit duplicate invoice number without error | Critical | P1 | Open | TC-014 |
| BUG-002 | Vendor dashboard accessible without login via direct URL | Critical | P1 | Open | TC-062 |
| BUG-003 | Rejection email does not include the rejection reason | High | P2 | Open | TC-042 |
| BUG-004 | File upload accepts .exe files — no format validation | High | P2 | Open | TC-012 |
| BUG-005 | Monthly report approved count is one less than actual | Medium | P2 | Open | TC-051 |
| BUG-006 | Account lockout message not shown after 5 failed attempts | Medium | P2 | Open | TC-007 |
| BUG-007 | Invoice amount vs PO balance check not enforced | High | P2 | Open | TC-015 |

### Defect Count by Severity

| Severity | Count |
| --- | --- |
| Critical | 2 |
| High | 3 |
| Medium | 2 |
| Low | 0 |
| **Total** | **7** |

---

## 5. Blocked Test Cases

| TC ID | Reason for Blockage | Action Required |
| --- | --- | --- |
| TC-030 | Payment processing integration API not yet deployed to staging | DevOps to deploy payment API stub by 2026-05-14 |
| TC-031 | Blocked by same reason as TC-030 | Same as above |

---

## 6. Test Execution Detail

| TC ID | Test Case Title | Result | Bug ID | Notes |
| --- | --- | --- | --- | --- |
| TC-001 | Vendor registers successfully | Pass | — | |
| TC-002 | Register with duplicate email | Pass | — | |
| TC-003 | Register with weak password | Pass | — | |
| TC-004 | Register with blank mandatory field | Pass | — | |
| TC-005 | Vendor logs in with valid credentials | Pass | — | |
| TC-006 | Vendor enters wrong password | Pass | — | |
| TC-007 | Account locked after multiple failed attempts | Fail | BUG-006 | No lockout message shown |
| TC-008 | Session expires after idle timeout | Blocked | — | Timeout value not yet configured in staging |
| TC-010 | Submit valid invoice against existing PO | Pass | — | |
| TC-011 | Submit against PO that does not exist | Pass | — | |
| TC-012 | Upload file in unsupported format | Fail | BUG-004 | .exe accepted |
| TC-013 | Upload file exceeding size limit | Pass | — | |
| TC-014 | Submit duplicate invoice number | Fail | BUG-001 | Duplicate accepted |
| TC-015 | Invoice amount exceeds PO value | Fail | BUG-007 | No validation in place |
| TC-020 | AP team views submitted invoices | Pass | — | |
| TC-021 | AP team approves a valid invoice | Pass | — | |
| TC-022 | AP team rejects with a reason | Pass | — | |
| TC-023 | AP team rejects without a reason | Fail | — | No validation — rejection goes through |
| TC-024 | Audit trail records approval action | Pass | — | |
| TC-030 | Approved invoice forwarded for payment | Blocked | — | Integration not deployed |
| TC-031 | Duplicate payment prevention | Blocked | — | Integration not deployed |
| TC-040 | Vendor email on invoice submission | Pass | — | |
| TC-041 | Vendor email on invoice approval | Pass | — | |
| TC-042 | Vendor email on invoice rejection | Fail | BUG-003 | Reason field blank in email |
| TC-043 | AP team email on new invoice | Pass | — | |
| TC-050 | Admin generates monthly report | Pass | — | |
| TC-051 | Report data matches actual records | Fail | BUG-005 | Count off by 1 |
| TC-060 | Vendor blocked from AP invoice queue | Pass | — | |
| TC-061 | AP member blocked from admin settings | Pass | — | |
| TC-062 | Unauthenticated user blocked from all pages | Fail | BUG-002 | Dashboard accessible without login |
| TC-063 | AP member cannot approve own department invoice | Pass | — | Rule enforced |
| TC-070 | SQL injection on login form | Pass | — | Input sanitised correctly |
| TC-071 | XSS in invoice notes field | Pass | — | Script not executed |

---

## 7. Quality Metrics — Cycle 1

| Metric | Target | Actual | Status |
| --- | --- | --- | --- |
| Requirement Coverage | 100% | 100% (all 7 requirements have executed TCs) | Met |
| Test Case Pass Rate | ≥ 95% | 72.7% (24/33 passed) | Not Met |
| Defect Density | ≤ 2 per feature | 2.5 defects across 7 features (7 total bugs / 7 modules ≈ 1 per module, but 3 in REQ-02 alone) | Partial |
| Blocked TCs at cycle end | 0 | 2 (TC-030, TC-031 — payment integration not deployed) | Not Met |
| Critical Bug Count | 0 | 2 open (BUG-001, BUG-002) | Not Met |

---

## 8. Key Observations

### What is working well

- Role-based access control is correctly enforced at both the UI and API level for all tested scenarios
- SQL injection and XSS inputs are properly handled — no security vulnerabilities found in these areas
- Core approval workflow (view, approve, reject) functions as expected
- Email notifications are triggered on all status changes except the rejection reason content issue

### What needs urgent attention before UAT

- BUG-001 and BUG-002 are Critical and must be fixed before UAT begins. A vendor accessing the portal without authentication and a system accepting duplicate invoices are unacceptable production risks.
- BUG-004 (unrestricted file upload) is a security risk and must also be fixed before UAT.

### Areas needing clarification

- Session timeout value not configured in staging — TC-008 could not be fully tested
- Payment processing integration is not available — TC-030 and TC-031 remain blocked

---

## 8. Recommendations

1. Fix BUG-001, BUG-002, and BUG-004 immediately (P1/security risks)
2. Fix BUG-003, BUG-005, BUG-006, BUG-007 before UAT (P2)
3. Deploy payment API stub to staging by 2026-05-14 to unblock TC-030 and TC-031
4. Confirm and configure session timeout value in staging environment
5. Conduct a re-test cycle (Cycle 2) after all P1 and P2 bugs are fixed
6. Schedule UAT only after Cycle 2 passes with zero Critical and High bugs open

---

## 9. Sign-Off

| Role | Name | Signature | Date |
| --- | --- | --- | --- |
| QA Lead | | | |
| Project Manager | | | |
| Client Representative | | | |

---

*This report is generated at the end of Test Cycle 1. Results will be updated after bug fixes and re-testing in Cycle 2.*
