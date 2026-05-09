# Requirements Traceability Matrix (RTM) — Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Version:** 1.0  
**Prepared by:** QA Team  
**Date:** 2026-05-09

---

## Purpose

The RTM links every client requirement to one or more test scenarios and test cases. It ensures:
- Every requirement has been tested (no gaps in coverage)
- Every test case exists for a reason (no orphaned tests)
- Status is visible at a glance for reporting and sign-off

---

## RTM Table

| Req ID | Requirement Description | Test Scenario | Test Case IDs | Execution Status | Pass / Fail |
| --- | --- | --- | --- | --- | --- |
| REQ-01 | Vendors can register and log in to the portal | Vendor registers successfully | TC-001 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Register with duplicate email | TC-002 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Register with weak password | TC-003 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Register with blank mandatory field | TC-004 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Vendor logs in with valid credentials | TC-005 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Vendor enters wrong password | TC-006 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Account locked after multiple failed attempts | TC-007 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Session expires after idle timeout | TC-008 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Submit valid invoice against existing PO | TC-010 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Submit against a PO that does not exist | TC-011 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Upload file in unsupported format | TC-012 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Upload file exceeding size limit | TC-013 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Submit duplicate invoice number | TC-014 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Invoice amount exceeds PO value | TC-015 | Not Executed | — |
| REQ-03 | The AP team can view, approve, or reject invoices | AP team views submitted invoices | TC-020 | Not Executed | — |
| REQ-03 | The AP team can view, approve, or reject invoices | AP team approves a valid invoice | TC-021 | Not Executed | — |
| REQ-03 | The AP team can view, approve, or reject invoices | AP team rejects an invoice with a reason | TC-022 | Not Executed | — |
| REQ-03 | The AP team can view, approve, or reject invoices | AP team rejects without entering a reason | TC-023 | Not Executed | — |
| REQ-03 | The AP team can view, approve, or reject invoices | Audit trail records approval action | TC-024 | Not Executed | — |
| REQ-04 | Approved invoices are forwarded for payment processing | Approved invoice forwarded for payment | TC-030 | Not Executed | — |
| REQ-04 | Approved invoices are forwarded for payment processing | Duplicate payment prevention | TC-031 | Not Executed | — |
| REQ-05 | Both parties receive email notifications on status changes | Vendor email on invoice submission | TC-040 | Not Executed | — |
| REQ-05 | Both parties receive email notifications on status changes | Vendor email on invoice approval | TC-041 | Not Executed | — |
| REQ-05 | Both parties receive email notifications on status changes | Vendor email on invoice rejection | TC-042 | Not Executed | — |
| REQ-05 | Both parties receive email notifications on status changes | AP team email on new invoice submission | TC-043 | Not Executed | — |
| REQ-06 | The system generates monthly invoice activity reports | Admin generates a monthly report | TC-050 | Not Executed | — |
| REQ-06 | The system generates monthly invoice activity reports | Report data matches actual records | TC-051 | Not Executed | — |
| REQ-07 | Only authorized users may access the system | Vendor blocked from AP invoice queue | TC-060 | Not Executed | — |
| REQ-07 | Only authorized users may access the system | AP member blocked from admin settings | TC-061 | Not Executed | — |
| REQ-07 | Only authorized users may access the system | Unauthenticated user blocked from all pages | TC-062 | Not Executed | — |
| REQ-07 | Only authorized users may access the system | AP member cannot approve own department invoice | TC-063 | Not Executed | — |
| REQ-07 | Only authorized users may access the system | SQL injection attempt on login | TC-070 | Not Executed | — |
| REQ-07 | Only authorized users may access the system | XSS attempt in invoice notes field | TC-071 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | File upload at the size boundary (BVA) | TC-080 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Invoice amount at the PO balance boundary (BVA) | TC-081 | Not Executed | — |
| REQ-01 | Vendors can register and log in to the portal | Login lockout threshold boundary (BVA) | TC-082 | Not Executed | — |
| REQ-02, REQ-03, REQ-04 | Invoice submission + approval + payment | Full invoice lifecycle: Submitted to Paid (State Transition) | TC-090 | Not Executed | — |
| REQ-02, REQ-03 | Invoice submission + AP workflow | Invoice rejected and vendor resubmits (State Transition) | TC-091 | Not Executed | — |
| REQ-02 | Vendors can submit invoices against purchase orders | Vendor cannot submit against a fully invoiced PO (State Transition) | TC-092 | Not Executed | — |
| REQ-03 | The AP team can view, approve, or reject invoices | AP team cannot act on an already-approved invoice (State Transition) | TC-093 | Not Executed | — |
| All | System-wide | Portal responds within acceptable time under normal load (Performance) | TC-100 | Not Executed | — |
| All | System-wide | System handles peak load without degradation (Load & Stress) | TC-101 | Not Executed | — |
| All | System-wide | Keyboard-only navigation for invoice submission flow (Accessibility) | TC-102 | Not Executed | — |
| REQ-01, REQ-02 | Vendor registration + invoice submission | Core vendor workflow usable by first-time user (Usability) | TC-103 | Not Executed | — |
| REQ-03, REQ-05 | AP approval + email notifications | Invoice approval triggers email notification service (Integration) | TC-110 | Not Executed | — |
| REQ-03, REQ-04 | AP approval + payment forwarding | Invoice approval triggers payment system API (Integration) | TC-111 | Not Executed | — |
| REQ-05 | Both parties receive email notifications | Portal behaves correctly when email service is unavailable (Integration) | TC-112 | Not Executed | — |

---

## Coverage Summary

| Requirement | Total Test Cases | Executed | Passed | Failed | Not Executed |
| --- | --- | --- | --- | --- | --- |
| REQ-01 | 11 | 0 | 0 | 0 | 11 |
| REQ-02 | 11 | 0 | 0 | 0 | 11 |
| REQ-03 | 7 | 0 | 0 | 0 | 7 |
| REQ-04 | 3 | 0 | 0 | 0 | 3 |
| REQ-05 | 6 | 0 | 0 | 0 | 6 |
| REQ-06 | 2 | 0 | 0 | 0 | 2 |
| REQ-07 | 8 | 0 | 0 | 0 | 8 |
| Cross-cutting (Non-Functional + Integration) | 6 | 0 | 0 | 0 | 6 |
| **Total** | **47** | **0** | **0** | **0** | **47** |

*Note: Some test cases cover multiple requirements and are counted once in the most relevant category above.*

---

## Notes

- All 7 client requirements are covered across functional, boundary value, state transition, non-functional, and integration test cases.
- Total: 47 test cases — 25 functional, 3 BVA, 4 state transition, 4 non-functional, 3 integration, 6 security/RBAC, 2 reporting.
- The "Pass / Fail" and "Executed" columns will be updated in real-time during test execution.
- This RTM is the single source of truth for test coverage reporting to the client.
