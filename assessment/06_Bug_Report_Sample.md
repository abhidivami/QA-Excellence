# Sample Bug Reports — Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Prepared by:** QA Team  
**Date:** 2026-05-09

---

## How to Use This Document

Each bug report below represents a realistic defect that could be found during testing of this portal. These are written in the standard format used by QA teams. Every field is mandatory — an incomplete bug report delays the fix.

---

## Bug Report 1

| Field | Details |
| --- | --- |
| **Bug ID** | BUG-001 |
| **Title** | Vendor can submit an invoice with a duplicate invoice number without any error |
| **Requirement** | REQ-02 |
| **Related Test Case** | TC-014 |
| **Reported By** | QA Engineer |
| **Date Reported** | 2026-05-09 |
| **Environment** | Staging — Chrome 124, Windows 11 |
| **Severity** | Critical |
| **Priority** | P1 — Fix immediately |
| **Reproducibility** | Always — reproduced 3 out of 3 attempts |
| **Status** | Open |

**Steps to Reproduce:**
1. Log in as vendor: vendor1@acme.com / Acme@12345
2. Go to "Submit Invoice"
3. Fill in all fields — Invoice No: INV-2026-001, PO: PO-1001, Amount: ₹50,000
4. Upload invoice.pdf and click "Submit" — note the success message
5. Repeat steps 2–4 with the same Invoice No: INV-2026-001

**Expected Result:**  
The second submission is blocked. An error message appears: "An invoice with number INV-2026-001 has already been submitted."

**Actual Result:**  
The duplicate invoice is accepted by the system. Two invoices with the same number INV-2026-001 now appear in the AP team's queue.

**Impact:**  
The AP team may approve and process the same invoice twice, resulting in a duplicate payment to the vendor. This is a financial risk and a data integrity failure.

**Attachments:**  
- Screenshot: duplicate_invoice_success.png  
- API Response: POST /api/invoices → 201 Created (on both attempts)

---

## Bug Report 2

| Field | Details |
| --- | --- |
| **Bug ID** | BUG-002 |
| **Title** | Vendor dashboard is accessible without logging in by navigating directly to the URL |
| **Requirement** | REQ-07 |
| **Related Test Case** | TC-062 |
| **Reported By** | QA Engineer |
| **Date Reported** | 2026-05-09 |
| **Environment** | Staging — Firefox 125, macOS Sonoma |
| **Severity** | Critical |
| **Priority** | P1 — Fix immediately |
| **Reproducibility** | Always — reproduced on Chrome 124, Firefox 125, and Edge 124 |
| **Status** | Open |

**Steps to Reproduce:**
1. Open a browser — do not log in
2. Directly navigate to: `https://staging.vendorportal.com/vendor/dashboard`

**Expected Result:**  
The user is redirected to the login page. The dashboard content is not visible.

**Actual Result:**  
The vendor dashboard loads fully and all invoice data is visible without any authentication.

**Impact:**  
Any person with the URL can view sensitive vendor and invoice data. This is a critical security vulnerability — a breach of authentication and access control.

**Attachments:**  
- Screenshot: unauthenticated_dashboard_access.png

---

## Bug Report 3

| Field | Details |
| --- | --- |
| **Bug ID** | BUG-003 |
| **Title** | Rejection email sent to the vendor does not include the rejection reason |
| **Requirement** | REQ-05 |
| **Related Test Case** | TC-042 |
| **Reported By** | QA Engineer |
| **Date Reported** | 2026-05-09 |
| **Environment** | Staging — All browsers |
| **Severity** | High |
| **Priority** | P2 — Fix in this sprint |
| **Reproducibility** | Always — blank reason field observed in 5 consecutive rejection tests across 3 different rejection reasons |
| **Status** | Open |

**Steps to Reproduce:**
1. Log in as AP team member: apreviewer@company.com
2. Open Invoice INV-2026-002
3. Click "Reject" and enter reason: "Invoice amount does not match agreed PO value"
4. Confirm the rejection
5. Check the vendor's email inbox (vendor1@acme.com)

**Expected Result:**  
The vendor receives an email that includes the rejection reason: "Invoice amount does not match agreed PO value."

**Actual Result:**  
The vendor receives a rejection email, but the rejection reason field is blank. The email body shows: "Your invoice INV-2026-002 has been rejected. Reason: "

**Impact:**  
Vendors cannot understand why their invoice was rejected. This leads to confusion, incorrect resubmissions, and unnecessary follow-up calls to the AP team.

**Attachments:**  
- Screenshot: rejection_email_blank_reason.png

---

## Bug Report 4

| Field | Details |
| --- | --- |
| **Bug ID** | BUG-004 |
| **Title** | File upload accepts .exe files — no format validation in place |
| **Requirement** | REQ-02 |
| **Related Test Case** | TC-012 |
| **Reported By** | QA Engineer |
| **Date Reported** | 2026-05-09 |
| **Environment** | Staging — Chrome 124, Windows 11 |
| **Severity** | High |
| **Priority** | P2 — Fix in this sprint |
| **Reproducibility** | Always — also reproduced with .bat, .sh, and .js files; no format is blocked |
| **Status** | Open |

**Steps to Reproduce:**
1. Log in as vendor: vendor1@acme.com
2. Go to "Submit Invoice"
3. Fill in all required fields
4. In the file upload field, select a file named: malicious.exe
5. Click "Submit"

**Expected Result:**  
The upload is blocked. An error message appears: "Only PDF and Excel files are accepted."

**Actual Result:**  
The .exe file is uploaded and the invoice is submitted successfully. The file is stored on the server.

**Impact:**  
Malicious files can be uploaded to the server. This is a security vulnerability that could expose the system to execution of harmful code.

**Attachments:**  
- Screenshot: exe_upload_success.png  
- API Response: POST /api/invoices/upload → 200 OK

---

## Bug Report 5

| Field | Details |
| --- | --- |
| **Bug ID** | BUG-005 |
| **Title** | Monthly report shows incorrect total — approved invoices count is one less than actual |
| **Requirement** | REQ-06 |
| **Related Test Case** | TC-051 |
| **Reported By** | QA Engineer |
| **Date Reported** | 2026-05-09 |
| **Environment** | Staging — All browsers |
| **Severity** | Medium |
| **Priority** | P2 — Fix in this sprint |
| **Reproducibility** | Always — count is consistently off by exactly 1, regardless of the total number of approved invoices; tested with 5, 7, and 10 approved invoices |
| **Status** | Open |

**Steps to Reproduce:**
1. Approve 7 invoices for the month of April 2026
2. Log in as Admin
3. Go to "Reports" → Select April 2026 → Click "Generate Report"
4. Note the "Approved Invoices" count in the report

**Expected Result:**  
Report shows: Approved Invoices = 7

**Actual Result:**  
Report shows: Approved Invoices = 6

**Database Check:**  
Running a direct query on the invoices table confirms 7 records with status = "Approved" and month = April 2026. The report is undercounting by 1.

**Impact:**  
Finance and management decisions made on this report will be based on incorrect data. This is a data accuracy issue.

**Attachments:**  
- Screenshot: april_report_count_mismatch.png  
- DB Query result: db_approved_count_april.png

---

## Bug Severity Guide (Reference)

| Severity | Definition | Example |
| --- | --- | --- |
| Critical | System crashes, data loss, security breach, or core feature completely broken | Unauthenticated access to all pages |
| High | Major feature is broken but there is a workaround, or data integrity is affected | Rejection reason missing from email |
| Medium | Feature partially works, minor data issue, or cosmetic issue affecting usability | Report count off by one |
| Low | Minor UI issue, typo, or cosmetic defect with no functional impact | Button label has a spelling mistake |

## Bug Priority Guide (Reference)

| Priority | Definition |
| --- | --- |
| P1 | Fix immediately — blocks further testing or is a production risk |
| P2 | Fix in the current sprint — important but not blocking |
| P3 | Fix in the next release |
| P4 | Fix when time allows |

---

*All bugs must be reproduced at least twice before being logged. Attach screenshots and API responses wherever possible.*
