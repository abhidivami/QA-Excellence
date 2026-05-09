# Clarifying Questions for Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Date:** 2026-05-09  
**Purpose:** To identify ambiguities in the client requirements before testing begins, ensuring all edge cases are understood and acceptance criteria are clearly defined.

---

## How to Read This Document

Each requirement is listed with the specific questions that need answers before test cases can be designed. These questions are not optional — unanswered questions lead to incorrect or incomplete test coverage.

---

## REQ-01: Vendors can register and log in to the portal

1. What information is required during registration? (e.g., company name, GST number, contact details, bank account)
2. Is email verification required after registration?
3. Can one email address be used to register multiple vendor accounts?
4. Who approves a new vendor registration — does a vendor get immediate access or does the AP team need to approve first?
5. What password rules apply? (minimum length, special characters, expiry period)
6. Is there a limit on the number of failed login attempts before the account is locked?
7. If an account is locked, how is it unlocked — automatic timer, admin action, or self-service via email?
8. Is "Remember Me" or "Stay Logged In" functionality expected?
9. What session timeout duration is expected for an idle logged-in session?
10. Is Single Sign-On (SSO) or social login (Google, LinkedIn) required?
11. Can a vendor deactivate or delete their own account?
12. What happens to existing invoices if a vendor account is deleted?

---

## REQ-02: Vendors can submit invoices against purchase orders

1. What file formats are accepted for invoice uploads? (PDF only, Excel, images like JPG/PNG, or ZIP bundles?)
2. What is the maximum allowed file size per upload?
3. Can a vendor submit multiple invoices in a single submission, or one at a time?
4. Can one invoice reference multiple Purchase Orders (POs), or is it strictly one invoice per PO?
5. What happens if the vendor enters a PO number that does not exist in the system?
6. What happens if the PO has already been fully invoiced — can another invoice be submitted against it?
7. Can a vendor edit an invoice after submission but before it is reviewed by the AP team?
8. Can a vendor withdraw or cancel a submitted invoice?
9. Are there mandatory fields on the invoice form? (e.g., invoice number, invoice date, amount, tax, line items)
10. Should the system validate that the invoice amount does not exceed the PO value?
11. Is duplicate invoice detection required? (same invoice number submitted twice by the same vendor)
12. Does the system need to support multiple currencies?
13. Is there a cut-off date or deadline for invoice submission within a billing cycle?

---

## REQ-03: The AP team can view, approve, or reject invoices

1. Who makes up the AP team — is it a single role or are there multiple roles (e.g., AP Reviewer, AP Manager)?
2. Does approval require a single person or multiple levels of approval (e.g., below ₹1L — one approver, above ₹1L — two approvers)?
3. Can an AP team member approve their own department's invoices, or is there a conflict-of-interest rule?
4. When rejecting an invoice, is a rejection reason mandatory?
5. Can the AP team request additional information or documents from the vendor without fully rejecting the invoice?
6. Is there a deadline or SLA by which the AP team must act on a submitted invoice?
7. Can an approved invoice be reversed or recalled after approval?
8. Can an AP team member reassign an invoice to another team member for review?
9. Can the AP team bulk-approve multiple invoices at once?
10. Is there an audit log required — recording who approved/rejected which invoice and when?

---

## REQ-04: Approved invoices are forwarded for payment processing

1. What does "forwarded for payment processing" mean technically — is this an integration with an ERP/SAP system, a bank API, or a manual handoff to the finance team?
2. Does the system need to automatically trigger payment, or just notify the finance team?
3. What happens if the payment processing system is unavailable when the invoice is forwarded?
4. Can the same approved invoice accidentally be forwarded twice? Is there a safeguard against duplicate payments?
5. What payment terms are tracked? (e.g., Net 30, Net 60 — does the system respect due dates?)
6. Is there a scheduled batch for payment forwarding (e.g., every Friday), or is it real-time on approval?
7. Should the vendor be able to see the payment status after an invoice is approved? (e.g., Pending Payment, Paid)

---

## REQ-05: Both parties receive email notifications on status changes

1. Which status changes trigger an email notification? (e.g., registration approved, invoice submitted, invoice approved, invoice rejected, payment processed)
2. Who is "both parties" — the vendor and the AP team member, or vendor and a general AP team inbox?
3. Can users customize or opt out of specific notifications?
4. What should the notification email contain? (just a status update, or also a link to view details?)
5. Is there a retry mechanism if an email fails to deliver?
6. Are in-app notifications (bell icon / dashboard alerts) required in addition to emails?
7. Are there any regulatory or compliance rules about the content or format of notification emails?

---

## REQ-06: The system generates monthly invoice activity reports

1. Who can access these reports — vendors (their own data only), AP team (all vendors), or management (summary view)?
2. What data should the report include? (e.g., total invoices submitted, approved, rejected, pending, total value, average processing time)
3. Are reports generated automatically on the 1st of each month, or are they on-demand?
4. In what format should reports be exported — PDF, Excel (CSV), or viewable on-screen only?
5. How many months of historical report data should the system retain?
6. Should the report cover a calendar month or a fiscal/billing cycle?
7. Can an AP team member generate a report for a specific vendor or a specific date range on demand?

---

## REQ-07: Only authorized users may access the system

1. What are the defined user roles? (e.g., Vendor, AP Reviewer, AP Manager, Finance, System Admin)
2. What actions is each role permitted to perform? (please provide a role-permission matrix)
3. Should role-based access be enforced at the UI level only, or also at the API level?
4. Can a single person have multiple roles?
5. Who is responsible for assigning and revoking roles — the System Admin, or the AP Manager?
6. Is there a requirement to log all access attempts, including failed ones?
7. Should the system support IP whitelisting or restrict access to specific networks/VPNs?
8. Is Multi-Factor Authentication (MFA) required for any role?
9. What happens to an inactive user account — automatic suspension after X days?

---

## General System Questions

1. Which browsers and devices must the portal support? (Chrome, Firefox, Safari, Edge; Desktop, Tablet, Mobile)
2. What is the expected number of concurrent users at peak load?
3. What is the expected data volume — how many vendors, invoices per month?
4. Are there any data retention or data privacy regulations to comply with? (e.g., GDPR, local data laws)
5. Is there a staging/UAT environment available for testing that mirrors production?
6. Who is the primary point of contact for clarifications during the testing phase?

---

*Document Status: Draft — Awaiting client responses before test design begins.*
