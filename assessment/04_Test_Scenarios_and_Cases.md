# Test Scenarios and Test Cases — Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Version:** 1.0  
**Prepared by:** QA Team  
**Date:** 2026-05-09

---

## How to Read This Document

- **Test Scenario:** A high-level description of what situation is being tested (the "what")
- **Test Case:** The detailed steps, test data, and expected result (the "how")
- **Priority:** Critical / High / Medium / Low
- **Type:** Positive (happy path) or Negative (error / edge case)

---

## Module 1: Vendor Registration

### Scenario 1.1 — Vendor registers successfully with valid details

| Field | Details |
| --- | --- |
| Test Case ID | TC-001 |
| Requirement | REQ-01 |
| Priority | Critical |
| Type | Positive |
| Preconditions | Registration page is accessible. User is not already registered. |
| Test Data | Company: "Acme Supplies", Email: `vendor1@acme.com`, Password: `Acme@12345` |
| Steps | 1. Go to the registration page. 2. Fill in all required fields with valid data. 3. Click "Register". |
| Expected Result | Account is created. A verification email is sent to vendor1@acme.com. A success message is shown. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 1.2 — Vendor tries to register with an email already in use

| Field | Details |
| --- | --- |
| Test Case ID | TC-002 |
| Requirement | REQ-01 |
| Priority | High |
| Type | Negative |
| Preconditions | An account already exists for `vendor1@acme.com`. |
| Test Data | Email: `vendor1@acme.com` |
| Steps | 1. Go to the registration page. 2. Enter email: `vendor1@acme.com` with all other valid fields. 3. Click "Register". |
| Expected Result | Registration is blocked. An error message appears: "An account with this email already exists." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 1.3 — Vendor tries to register with a weak password

| Field | Details |
| --- | --- |
| Test Case ID | TC-003 |
| Requirement | REQ-01 |
| Priority | High |
| Type | Negative |
| Preconditions | Registration page is accessible. |
| Test Data | Password: "1234" |
| Steps | 1. Go to the registration page. 2. Fill all fields with valid data. 3. Enter password: "1234". 4. Click "Register". |
| Expected Result | Registration is blocked. An inline error message explains the password rules. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 1.4 — Vendor leaves a mandatory field blank

| Field | Details |
| --- | --- |
| Test Case ID | TC-004 |
| Requirement | REQ-01 |
| Priority | High |
| Type | Negative |
| Preconditions | Registration page is accessible. |
| Test Data | Leave "Company Name" field empty. |
| Steps | 1. Go to the registration page. 2. Fill all fields except "Company Name". 3. Click "Register". |
| Expected Result | Form is not submitted. The "Company Name" field is highlighted with an error: "This field is required." |
| Actual Result | — |
| Status | Not Executed |

---

## Module 2: Vendor Login

### Scenario 2.1 — Vendor logs in with valid credentials

| Field | Details |
| --- | --- |
| Test Case ID | TC-005 |
| Requirement | REQ-01 |
| Priority | Critical |
| Type | Positive |
| Preconditions | Vendor account exists and is verified. |
| Test Data | Email: `vendor1@acme.com`, Password: `Acme@12345` |
| Steps | 1. Go to the login page. 2. Enter valid email and password. 3. Click "Login". |
| Expected Result | Vendor is logged in and redirected to the vendor dashboard. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 2.2 — Vendor enters wrong password

| Field | Details |
| --- | --- |
| Test Case ID | TC-006 |
| Requirement | REQ-01 |
| Priority | High |
| Type | Negative |
| Preconditions | Vendor account exists. |
| Test Data | Email: `vendor1@acme.com`, Password: `WrongPass` |
| Steps | 1. Go to the login page. 2. Enter valid email but wrong password. 3. Click "Login". |
| Expected Result | Login fails. An error message appears: "Invalid email or password." Password is not revealed. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 2.3 — Account is locked after too many failed login attempts

| Field | Details |
| --- | --- |
| Test Case ID | TC-007 |
| Requirement | REQ-01 |
| Priority | High |
| Type | Negative |
| Preconditions | Vendor account (`vendor1@acme.com`) exists and is active. Staging environment is configured with lockout threshold = 5 attempts (confirm this value with the client via CQ#6 before execution). |
| Test Data | Email: `vendor1@acme.com`, Wrong Password: `BadPass99!` (used repeatedly) |
| Steps | 1. Go to the login page. 2. Enter `vendor1@acme.com` and `BadPass99!` → click Login (attempt 1). 3. Repeat 4 more times (attempts 2–5). 4. On the 6th attempt, enter the correct password `Acme@12345`. |
| Expected Result | After attempt 5: account is locked. Message shown: "Your account has been locked due to too many failed attempts. Please check your email to unlock." The 6th attempt (with correct password) is also blocked, confirming the lock is in effect. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 2.4 — Session expires after idle timeout

| Field | Details |
| --- | --- |
| Test Case ID | TC-008 |
| Requirement | REQ-01 |
| Priority | Medium |
| Type | Negative |
| Preconditions | Vendor `vendor1@acme.com` is logged in. Session timeout is configured to 30 minutes in the staging environment (confirm value with DevOps before execution). |
| Test Data | Configured timeout: 30 minutes. Idle duration used in test: 31 minutes. |
| Steps | 1. Log in as `vendor1@acme.com`. 2. Note the login timestamp. 3. Do not interact with any page for 31 minutes. 4. Click any navigation link (e.g., "My Invoices"). |
| Expected Result | User is redirected to the login page. Message shown: "Your session has expired. Please log in again." Previously loaded page content is no longer visible. |
| Actual Result | — |
| Status | Not Executed |

---

## Module 3: Invoice Submission

### Scenario 3.1 — Vendor submits a valid invoice against an existing PO

| Field | Details |
| --- | --- |
| Test Case ID | TC-010 |
| Requirement | REQ-02 |
| Priority | Critical |
| Type | Positive |
| Preconditions | `vendor1@acme.com` is logged in. PO-1001 exists in the system with an outstanding balance of ₹1,00,000. No previous invoices exist against PO-1001. |
| Test Data | Invoice No: `INV-2026-001`, PO No: `PO-1001`, Amount: ₹50,000, Invoice Date: 2026-05-09, File: `invoice.pdf` (2 MB, PDF format) |
| Steps | 1. Log in as `vendor1@acme.com`. 2. Click "Submit Invoice". 3. Enter Invoice No `INV-2026-001`, PO No `PO-1001`, Amount ₹50,000, Date 2026-05-09. 4. Upload `invoice.pdf`. 5. Click "Submit". |
| Expected Result | Invoice `INV-2026-001` is created with status "Pending Review" and appears in the vendor's invoice list. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 3.2 — Vendor tries to submit against a PO that does not exist

| Field | Details |
| --- | --- |
| Test Case ID | TC-011 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | Vendor is logged in. |
| Test Data | PO No: PO-9999 (does not exist) |
| Steps | 1. Log in as a vendor. 2. Go to "Submit Invoice". 3. Enter PO-9999 in the PO number field. 4. Click "Submit". |
| Expected Result | Submission is blocked. An error message appears: "Purchase Order PO-9999 not found." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 3.3 — Vendor uploads a file in an unsupported format

| Field | Details |
| --- | --- |
| Test Case ID | TC-012 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | Vendor is logged in. |
| Test Data | File: invoice.exe |
| Steps | 1. Log in as a vendor. 2. Go to "Submit Invoice". 3. Try to upload invoice.exe. |
| Expected Result | Upload is blocked. Error message: "Only PDF and Excel files are accepted." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 3.4 — Vendor uploads a file that exceeds the size limit

| Field | Details |
| --- | --- |
| Test Case ID | TC-013 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | Vendor is logged in. File size limit is 10 MB (to be confirmed). |
| Test Data | File: large_invoice.pdf (11 MB) |
| Steps | 1. Log in as a vendor. 2. Go to "Submit Invoice". 3. Upload large_invoice.pdf (11 MB). |
| Expected Result | Upload is blocked. Error message: "File size must not exceed 10 MB." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 3.5 — Vendor submits the same invoice number twice (duplicate detection)

| Field | Details |
| --- | --- |
| Test Case ID | TC-014 |
| Requirement | REQ-02 |
| Priority | Critical |
| Type | Negative |
| Preconditions | Invoice INV-2026-001 has already been submitted for PO-1001. |
| Test Data | Invoice No: INV-2026-001 (same as a previously submitted invoice) |
| Steps | 1. Log in as a vendor. 2. Submit an invoice with the same invoice number as an existing one. |
| Expected Result | Submission is blocked. Error: "An invoice with number INV-2026-001 has already been submitted." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 3.6 — Invoice amount exceeds PO value

| Field | Details |
| --- | --- |
| Test Case ID | TC-015 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | PO-1001 has a total value of ₹1,00,000. Already invoiced ₹80,000. Remaining balance: ₹20,000. |
| Test Data | Invoice Amount: ₹50,000 (exceeds remaining balance) |
| Steps | 1. Log in as a vendor. 2. Submit an invoice for ₹50,000 against PO-1001. |
| Expected Result | Submission is blocked. Warning: "Invoice amount exceeds the remaining PO balance of ₹20,000." |
| Actual Result | — |
| Status | Not Executed |

---

## Module 4: AP Team Approval Workflow

### Scenario 4.1 — AP team views submitted invoices

| Field | Details |
| --- | --- |
| Test Case ID | TC-020 |
| Requirement | REQ-03 |
| Priority | Critical |
| Type | Positive |
| Preconditions | AP team member is logged in. At least one invoice is in "Pending Review" status. |
| Test Data | N/A |
| Steps | 1. Log in as AP team member. 2. Navigate to "Invoice Queue". |
| Expected Result | All pending invoices are listed with invoice number, vendor name, PO number, amount, and submission date. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 4.2 — AP team approves a valid invoice

| Field | Details |
| --- | --- |
| Test Case ID | TC-021 |
| Requirement | REQ-03 |
| Priority | Critical |
| Type | Positive |
| Preconditions | AP team member is logged in. Invoice TC-010 is in "Pending Review" status. |
| Test Data | Invoice: INV-2026-001 |
| Steps | 1. Log in as AP team member. 2. Open Invoice INV-2026-001. 3. Click "Approve". 4. Confirm the action. |
| Expected Result | Invoice status changes to "Approved". The vendor receives an email notification. The invoice is queued for payment processing. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 4.3 — AP team rejects an invoice with a reason

| Field | Details |
| --- | --- |
| Test Case ID | TC-022 |
| Requirement | REQ-03 |
| Priority | Critical |
| Type | Positive |
| Preconditions | AP team member is logged in. An invoice is in "Pending Review" status. |
| Test Data | Rejection reason: "Invoice amount does not match the agreed PO value." |
| Steps | 1. Log in as AP team member. 2. Open the invoice. 3. Click "Reject". 4. Enter the rejection reason. 5. Confirm. |
| Expected Result | Invoice status changes to "Rejected". The vendor receives an email with the rejection reason. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 4.4 — AP team tries to reject without entering a reason

| Field | Details |
| --- | --- |
| Test Case ID | TC-023 |
| Requirement | REQ-03 |
| Priority | High |
| Type | Negative |
| Preconditions | AP team member is logged in. |
| Test Data | Rejection reason: (blank) |
| Steps | 1. Log in as AP team member. 2. Open an invoice. 3. Click "Reject". 4. Leave the rejection reason blank. 5. Click "Confirm". |
| Expected Result | Rejection is blocked. Error: "Please enter a reason for rejection." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 4.5 — Audit trail records approval action

| Field | Details |
| --- | --- |
| Test Case ID | TC-024 |
| Requirement | REQ-03 |
| Priority | Medium |
| Type | Positive |
| Preconditions | Invoice INV-2026-001 has been approved by AP team member John. |
| Test Data | N/A |
| Steps | 1. Log in as Admin. 2. Navigate to the audit log. 3. Search for INV-2026-001. |
| Expected Result | The log shows: "INV-2026-001 approved by John on 2026-05-09 at 10:30 AM." |
| Actual Result | — |
| Status | Not Executed |

---

## Module 5: Payment Forwarding

### Scenario 5.1 — Approved invoice is forwarded for payment

| Field | Details |
| --- | --- |
| Test Case ID | TC-030 |
| Requirement | REQ-04 |
| Priority | Critical |
| Type | Positive |
| Preconditions | Invoice INV-2026-001 has just been approved by the AP team. |
| Test Data | N/A |
| Steps | 1. Approve invoice INV-2026-001. 2. Check the payment processing queue (or verify API call to ERP). |
| Expected Result | The invoice appears in the payment processing queue. Vendor can see the status updated to "Payment Pending". |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 5.2 — Duplicate payment prevention

| Field | Details |
| --- | --- |
| Test Case ID | TC-031 |
| Requirement | REQ-04 |
| Priority | Critical |
| Type | Negative |
| Preconditions | Invoice INV-2026-001 has already been approved and forwarded for payment. |
| Test Data | Invoice ID: INV-2026-001 |
| Steps | 1. Attempt to approve and forward INV-2026-001 a second time (via UI or direct API call). |
| Expected Result | The system blocks the duplicate action. Error: "This invoice has already been forwarded for payment." |
| Actual Result | — |
| Status | Not Executed |

---

## Module 6: Email Notifications

### Scenario 6.1 — Vendor receives email when invoice is submitted

| Field | Details |
| --- | --- |
| Test Case ID | TC-040 |
| Requirement | REQ-05 |
| Priority | High |
| Type | Positive |
| Preconditions | Vendor submits an invoice successfully. |
| Test Data | Vendor email: `vendor1@acme.com` |
| Steps | 1. Submit a valid invoice as a vendor. 2. Check `vendor1@acme.com` inbox. |
| Expected Result | An email is received confirming the submission with the invoice number and current status. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 6.2 — Vendor receives email when invoice is approved

| Field | Details |
| --- | --- |
| Test Case ID | TC-041 |
| Requirement | REQ-05 |
| Priority | High |
| Type | Positive |
| Preconditions | AP team has approved the vendor's invoice. |
| Test Data | Vendor email: `vendor1@acme.com` |
| Steps | 1. AP team approves Invoice INV-2026-001. 2. Check `vendor1@acme.com` inbox. |
| Expected Result | Vendor receives an email: "Your invoice INV-2026-001 has been approved." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 6.3 — Vendor receives email when invoice is rejected

| Field | Details |
| --- | --- |
| Test Case ID | TC-042 |
| Requirement | REQ-05 |
| Priority | High |
| Type | Positive |
| Preconditions | AP team has rejected the vendor's invoice with a reason. |
| Test Data | Vendor email: `vendor1@acme.com` |
| Steps | 1. AP team rejects Invoice INV-2026-001 with a reason. 2. Check `vendor1@acme.com` inbox. |
| Expected Result | Vendor receives an email with the rejection reason included. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 6.4 — AP team receives email when a new invoice is submitted

| Field | Details |
| --- | --- |
| Test Case ID | TC-043 |
| Requirement | REQ-05 |
| Priority | Medium |
| Type | Positive |
| Preconditions | A vendor has submitted a new invoice. |
| Test Data | AP team inbox: `ap-team@company.com` |
| Steps | 1. Submit a valid invoice as a vendor. 2. Check `ap-team@company.com` inbox. |
| Expected Result | AP team receives an email: "A new invoice from Acme Supplies is pending your review." |
| Actual Result | — |
| Status | Not Executed |

---

## Module 7: Monthly Reports

### Scenario 7.1 — Admin generates a monthly invoice activity report

| Field | Details |
| --- | --- |
| Test Case ID | TC-050 |
| Requirement | REQ-06 |
| Priority | Medium |
| Type | Positive |
| Preconditions | Admin is logged in. Invoices exist for the selected month. |
| Test Data | Month: April 2026 |
| Steps | 1. Log in as Admin. 2. Go to "Reports". 3. Select "April 2026". 4. Click "Generate Report". |
| Expected Result | Report is generated showing total invoices submitted, approved, rejected, pending, and total amounts. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 7.2 — Report data matches actual invoice records

| Field | Details |
| --- | --- |
| Test Case ID | TC-051 |
| Requirement | REQ-06 |
| Priority | High |
| Type | Positive |
| Preconditions | 10 invoices were submitted in April 2026: 7 approved, 2 rejected, 1 pending. |
| Test Data | April 2026 data |
| Steps | 1. Generate the April 2026 report. 2. Cross-check the counts against the actual invoice records in the system. |
| Expected Result | Report shows: Submitted: 10, Approved: 7, Rejected: 2, Pending: 1. All amounts match the database records. |
| Actual Result | — |
| Status | Not Executed |

---

## Module 8: Role-Based Access Control

### Scenario 8.1 — Vendor cannot access the AP team invoice queue

| Field | Details |
| --- | --- |
| Test Case ID | TC-060 |
| Requirement | REQ-07 |
| Priority | Critical |
| Type | Negative |
| Preconditions | User is logged in as a Vendor. |
| Test Data | URL: /ap/invoice-queue |
| Steps | 1. Log in as a vendor. 2. Manually navigate to the AP team's invoice queue URL. |
| Expected Result | Access is denied. User sees a "403 Forbidden" or "You do not have permission" message. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 8.2 — AP team member cannot access Admin settings

| Field | Details |
| --- | --- |
| Test Case ID | TC-061 |
| Requirement | REQ-07 |
| Priority | High |
| Type | Negative |
| Preconditions | User is logged in as an AP team member. |
| Test Data | URL: /admin/settings |
| Steps | 1. Log in as an AP team member. 2. Navigate to the admin settings page. |
| Expected Result | Access is denied. User sees "403 Forbidden" or is redirected to their dashboard. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 8.3 — Unauthenticated user is blocked from all pages

| Field | Details |
| --- | --- |
| Test Case ID | TC-062 |
| Requirement | REQ-07 |
| Priority | Critical |
| Type | Negative |
| Preconditions | User is not logged in. |
| Test Data | URL: /vendor/submit-invoice |
| Steps | 1. Without logging in, navigate directly to /vendor/submit-invoice. |
| Expected Result | User is redirected to the login page. No invoice submission page content is visible. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 8.4 — AP team member cannot approve their own department's invoice (conflict of interest)

| Field | Details |
| --- | --- |
| Test Case ID | TC-063 |
| Requirement | REQ-07 |
| Priority | High |
| Type | Negative |
| Preconditions | To be confirmed with client — if this business rule exists. |
| Test Data | AP team member from Finance department approving a Finance department invoice |
| Steps | 1. Log in as AP team member. 2. Open an invoice from their own department. 3. Attempt to approve. |
| Expected Result | Approval is blocked with message: "You cannot approve invoices from your own department." |
| Actual Result | — |
| Status | Not Executed |

---

## Module 9: Security Tests

### Scenario 9.1 — SQL injection attempt on the login form

| Field | Details |
| --- | --- |
| Test Case ID | TC-070 |
| Requirement | REQ-07, REQ-01 |
| Priority | Critical |
| Type | Negative |
| Preconditions | Login page is accessible. |
| Test Data | Email: `' OR '1'='1` |
| Steps | 1. Go to the login page. 2. Enter `' OR '1'='1` in the email field. 3. Click "Login". |
| Expected Result | Login fails. No database error is exposed. The input is treated as plain text. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 9.2 — XSS attempt in the invoice notes field

| Field | Details |
| --- | --- |
| Test Case ID | TC-071 |
| Requirement | REQ-07, REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | Vendor is logged in. |
| Test Data | Notes field: `<script>alert('XSS')</script>` |
| Steps | 1. Log in as a vendor. 2. Submit an invoice with the script tag in the "Notes" field. 3. Open the invoice as an AP team member. |
| Expected Result | The script does not execute. The notes are displayed as plain text or the field is sanitised. |
| Actual Result | — |
| Status | Not Executed |

---

---

## Module 10: Boundary Value Analysis (BVA)

*BVA tests the edges of valid ranges — where most defects hide. Each set covers just-below, at, and just-above the boundary.*

### Scenario 10.1 — File upload at the size boundary (assumed limit: 10 MB)

| Field | Details |
| --- | --- |
| Test Case ID | TC-080 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | `vendor1@acme.com` is logged in. File size limit is 10 MB (confirm with client via CQ#2). |
| Test Data | File A: `invoice_9mb.pdf` (9.9 MB) — just below limit. File B: `invoice_10mb.pdf` (10.0 MB) — at the limit. File C: `invoice_10mb_over.pdf` (10.1 MB) — just above limit. |
| Steps | 1. Upload File A (9.9 MB) → note result. 2. Upload File B (10.0 MB) → note result. 3. Upload File C (10.1 MB) → note result. |
| Expected Result | File A (9.9 MB): upload succeeds. File B (10.0 MB): upload succeeds (at the boundary, inclusive). File C (10.1 MB): upload is blocked with error "File size must not exceed 10 MB." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 10.2 — Invoice amount at the PO balance boundary

| Field | Details |
| --- | --- |
| Test Case ID | TC-081 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | `vendor1@acme.com` is logged in. PO-1002 has a total value of ₹1,00,000 with ₹80,000 already invoiced, leaving a remaining balance of ₹20,000. |
| Test Data | Invoice A: Amount ₹19,999 (just below balance). Invoice B: Amount ₹20,000 (exact match). Invoice C: Amount ₹20,001 (just above balance). |
| Steps | 1. Submit Invoice A for ₹19,999 against PO-1002 → note result. 2. Revert the submission (or use a fresh PO). 3. Submit Invoice B for ₹20,000 → note result. 4. Submit Invoice C for ₹20,001 → note result. |
| Expected Result | Invoice A (₹19,999): submission succeeds. Invoice B (₹20,000): submission succeeds (exact match is valid). Invoice C (₹20,001): submission is blocked with error "Invoice amount exceeds the remaining PO balance of ₹20,000." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 10.3 — Login lockout threshold boundary (assumed: 5 attempts)

| Field | Details |
| --- | --- |
| Test Case ID | TC-082 |
| Requirement | REQ-01 |
| Priority | High |
| Type | Negative |
| Preconditions | `vendor2@acme.com` is active. Lockout threshold is 5 failed attempts. Run this on a fresh account that has zero failed attempts. |
| Test Data | Email: `vendor2@acme.com`, Wrong Password: `WrongPass1!` |
| Steps | 1. Enter wrong password 4 times (attempts 1–4) — note that account is NOT locked. 2. Enter wrong password a 5th time — note the response. 3. Attempt login with correct password immediately after attempt 5. |
| Expected Result | After 4 attempts: login still allowed (account not locked). After attempt 5: account is locked. Correct password on the 6th try is also blocked — the lock applies regardless of whether the next input is correct. |
| Actual Result | — |
| Status | Not Executed |

---

## Module 11: State Transition Testing

*The invoice moves through defined statuses. Every valid transition must work; every invalid one must be blocked.*

### Scenario 11.1 — Full invoice lifecycle: Submitted → Approved → Payment Pending → Paid

| Field | Details |
| --- | --- |
| Test Case ID | TC-090 |
| Requirement | REQ-02, REQ-03, REQ-04 |
| Priority | Critical |
| Type | Positive |
| Preconditions | `vendor1@acme.com` is active. PO-1003 has a balance of ₹30,000. Payment integration is available in staging. |
| Test Data | Invoice No: `INV-2026-010`, PO: `PO-1003`, Amount: ₹30,000, File: `invoice_10.pdf` |
| Steps | 1. Vendor submits `INV-2026-010` → status = "Pending Review". 2. AP team member opens and approves the invoice → status = "Approved". 3. Confirm the invoice is pushed to the payment queue → status = "Payment Pending". 4. Simulate payment completion in staging → status = "Paid". |
| Expected Result | Invoice transitions correctly: Pending Review → Approved → Payment Pending → Paid. Each status change is visible in the invoice history. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 11.2 — Invoice is rejected and vendor resubmits

| Field | Details |
| --- | --- |
| Test Case ID | TC-091 |
| Requirement | REQ-02, REQ-03 |
| Priority | High |
| Type | Positive |
| Preconditions | Invoice `INV-2026-011` is in "Pending Review" status. |
| Test Data | Rejection reason: "Invoice number does not match the PO reference." Corrected Invoice No: `INV-2026-011B` |
| Steps | 1. AP team rejects `INV-2026-011` → status = "Rejected". 2. Vendor logs in and views the rejection reason. 3. Vendor submits a corrected invoice `INV-2026-011B` → status = "Pending Review". |
| Expected Result | Rejected invoice remains visible with status "Rejected". Corrected invoice `INV-2026-011B` is submitted and shows status "Pending Review" as a new, independent submission. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 11.3 — Vendor cannot re-submit against a fully invoiced PO

| Field | Details |
| --- | --- |
| Test Case ID | TC-092 |
| Requirement | REQ-02 |
| Priority | High |
| Type | Negative |
| Preconditions | PO-1004 had a total value of ₹50,000. An invoice for the full ₹50,000 has been submitted and approved. Remaining balance = ₹0. |
| Test Data | New Invoice No: `INV-2026-012`, PO: `PO-1004`, Amount: ₹1 |
| Steps | 1. Vendor attempts to submit a new invoice against `PO-1004`. |
| Expected Result | Submission is blocked. Error: "This Purchase Order has been fully invoiced. No remaining balance available." |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 11.4 — AP team cannot act on an already-approved invoice

| Field | Details |
| --- | --- |
| Test Case ID | TC-093 |
| Requirement | REQ-03 |
| Priority | High |
| Type | Negative |
| Preconditions | Invoice `INV-2026-001` has already been approved. |
| Test Data | Invoice: `INV-2026-001` (status: Approved) |
| Steps | 1. AP team member opens `INV-2026-001`. 2. Attempts to click "Approve" or "Reject" again. |
| Expected Result | Approve and Reject buttons are disabled or hidden. A message indicates: "This invoice has already been approved." No status change occurs. |
| Actual Result | — |
| Status | Not Executed |

---

## Module 12: Non-Functional Testing

### Scenario 12.1 — Portal responds within acceptable time under normal load (Performance)

| Field | Details |
| --- | --- |
| Test Case ID | TC-100 |
| Requirement | All (system-wide) |
| Priority | High |
| Type | Non-Functional |
| Preconditions | Staging environment is configured to mirror production capacity. JMeter or k6 is set up. |
| Test Data | Simulated users: 50 concurrent users. Actions: login + invoice submission. Duration: 5 minutes. |
| Steps | 1. Use JMeter to simulate 50 concurrent users logging in and submitting invoices simultaneously. 2. Measure average response time, 95th percentile response time, and error rate. |
| Expected Result | Average response time ≤ 2 seconds. 95th percentile response time ≤ 5 seconds. Error rate = 0%. No application crashes or timeouts. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 12.2 — System handles peak load without degradation (Load & Stress)

| Field | Details |
| --- | --- |
| Test Case ID | TC-101 |
| Requirement | All (system-wide) |
| Priority | Medium |
| Type | Non-Functional |
| Preconditions | Load testing tool (JMeter/k6) configured. Staging environment is stable. |
| Test Data | Ramp from 50 to 200 concurrent users over 10 minutes, then hold at 200 for 5 minutes. |
| Steps | 1. Start with 50 concurrent users. 2. Increase load by 50 users every 2 minutes until 200 concurrent users. 3. Hold at 200 users for 5 minutes. 4. Record response times and errors at each stage. |
| Expected Result | Response time degrades gracefully (not a sudden crash). System remains operational at 200 users. Error rate stays below 1%. Identify the point at which performance begins to degrade. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 12.3 — Keyboard-only navigation works for the full invoice submission flow (Accessibility)

| Field | Details |
| --- | --- |
| Test Case ID | TC-102 |
| Requirement | All (system-wide) |
| Priority | Medium |
| Type | Non-Functional |
| Preconditions | Portal is accessible on Chrome. No mouse will be used during this test. |
| Test Data | Keyboard controls: Tab (move forward), Shift+Tab (move back), Enter (activate), Space (toggle checkboxes). |
| Steps | 1. Open the portal login page. 2. Using only the keyboard, tab through all fields, fill in credentials, and press Enter to log in. 3. Tab to "Submit Invoice", fill in all fields using keyboard only, and submit. 4. Verify that focus is visible on every interactive element throughout. |
| Expected Result | Every form field, button, and link is reachable via Tab key. Focus indicator is visible at all times. Invoice is submitted successfully without using a mouse. No element is skipped or unreachable. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 12.4 — Core vendor workflow is usable by a first-time user (Usability)

| Field | Details |
| --- | --- |
| Test Case ID | TC-103 |
| Requirement | REQ-01, REQ-02 |
| Priority | Medium |
| Type | Non-Functional |
| Preconditions | A person unfamiliar with the portal is available to test. They are given no training or manual in advance. |
| Test Data | Task: "Register an account and submit one invoice against PO-1001." Time limit: 10 minutes. |
| Steps | 1. Ask the user to register a new vendor account without guidance. 2. Ask the user to submit an invoice against PO-1001. 3. Record time taken, errors made, and any points of confusion. |
| Expected Result | User completes registration in under 3 minutes. User completes invoice submission in under 5 minutes. No task requires more than 2 attempts. Error messages encountered are clear and helpful. |
| Actual Result | — |
| Status | Not Executed |

---

## Module 13: Integration Testing

*Testing that the connected parts of the system talk to each other correctly — especially under failure conditions.*

### Scenario 13.1 — Invoice approval triggers the email notification service

| Field | Details |
| --- | --- |
| Test Case ID | TC-110 |
| Requirement | REQ-03, REQ-05 |
| Priority | High |
| Type | Integration |
| Preconditions | Invoice `INV-2026-020` is in "Pending Review". Email service is running in staging. |
| Test Data | Invoice: `INV-2026-020`. Vendor email: `vendor1@acme.com`. |
| Steps | 1. AP team approves `INV-2026-020`. 2. Within 2 minutes, check the vendor's email inbox. 3. Also check the email service logs to confirm the notification was dispatched. |
| Expected Result | Vendor receives the approval email within 2 minutes of the approval action. Email service log shows a successful dispatch record for `INV-2026-020`. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 13.2 — Invoice approval correctly triggers the payment system API

| Field | Details |
| --- | --- |
| Test Case ID | TC-111 |
| Requirement | REQ-03, REQ-04 |
| Priority | Critical |
| Type | Integration |
| Preconditions | Invoice `INV-2026-021` is in "Pending Review". Payment system API stub is running in staging. |
| Test Data | Invoice: `INV-2026-021`, Amount: ₹40,000. |
| Steps | 1. AP team approves `INV-2026-021`. 2. Check the payment system API log to verify a request was sent with the correct invoice number and amount. 3. Verify invoice status updates to "Payment Pending" in the portal. |
| Expected Result | Payment system receives exactly one API call for `INV-2026-021` with amount ₹40,000. Invoice status in the portal changes to "Payment Pending". No duplicate calls are made. |
| Actual Result | — |
| Status | Not Executed |

---

### Scenario 13.3 — Portal behaves correctly when the email service is unavailable

| Field | Details |
| --- | --- |
| Test Case ID | TC-112 |
| Requirement | REQ-05 |
| Priority | High |
| Type | Integration |
| Preconditions | Email service is intentionally stopped/disabled in staging. |
| Test Data | Invoice: `INV-2026-022`. |
| Steps | 1. Stop the email service in staging. 2. AP team approves `INV-2026-022`. 3. Check the invoice status and the error/retry log in the system. |
| Expected Result | The invoice is approved and its status updates correctly in the portal. The email failure is logged. The system does not crash. A retry mechanism attempts to send the notification later. |
| Actual Result | — |
| Status | Not Executed |

---

*Total Test Cases in this document: 46*

| Module | TC Range | Count |
| --- | --- | --- |
| Vendor Registration | TC-001 to TC-004 | 4 |
| Vendor Login | TC-005 to TC-008 | 4 |
| Invoice Submission | TC-010 to TC-015 | 6 |
| AP Approval Workflow | TC-020 to TC-024 | 5 |
| Payment Forwarding | TC-030 to TC-031 | 2 |
| Email Notifications | TC-040 to TC-043 | 4 |
| Monthly Reports | TC-050 to TC-051 | 2 |
| Role-Based Access Control | TC-060 to TC-063 | 4 |
| Security | TC-070 to TC-071 | 2 |
| Boundary Value Analysis | TC-080 to TC-082 | 3 |
| State Transition | TC-090 to TC-093 | 4 |
| Non-Functional | TC-100 to TC-103 | 4 |
| Integration | TC-110 to TC-112 | 3 |
| **Total** | | **47** |
