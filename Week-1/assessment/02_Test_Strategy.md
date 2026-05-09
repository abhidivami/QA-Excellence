# Test Strategy — Vendor Invoice Management Portal

**Project:** B2B Vendor Invoice Management Portal  
**Version:** 1.0  
**Date:** 2026-05-09  
**Status:** Approved

---

## 1. Purpose

This document defines the overall approach the QA team will follow to test the Vendor Invoice Management Portal. It sets the direction for all testing activities — what will be tested, how it will be tested, who will test it, and what tools will be used.

This strategy applies to all phases of the project from requirements review through deployment.

---

## 2. Scope

### In Scope

| Area | Description |
| --- | --- |
| Vendor Registration & Login | Account creation, login, session management, password rules |
| Invoice Submission | Upload flow, PO validation, file format checks, duplicate detection |
| AP Team Approval Workflow | View, approve, reject, audit trail |
| Payment Forwarding | Status update, integration trigger, duplicate payment prevention |
| Email Notifications | All status-change triggers for vendors and AP team |
| Monthly Reports | Report generation, data accuracy, export formats |
| Role-Based Access Control | Permission enforcement per role at UI and API level |
| API Layer | All backend API endpoints for each feature |
| Database | Data integrity, constraints, correct storage |
| Security | Authentication, authorization, OWASP Top 10 checks |
| Performance | Load testing for peak concurrent users |
| Usability | Ease of use for vendors and AP team members |
| Cross-browser Compatibility | Chrome, Firefox, Safari, Edge |

### Out of Scope

- Third-party payment gateway internal logic (only the integration point is tested)
- ERP/SAP system internals (only the data handoff is tested)
- Infrastructure setup and server configuration (handled by DevOps)

---

## 3. Testing Approach

Testing will follow a **shift-left strategy** — QA involvement starts at requirements review, not after development is complete.

### Levels of Testing

| Level | Who | Focus |
| --- | --- | --- |
| Unit Testing | Developers | Individual functions and components |
| Integration Testing | QA + Developers | API-to-API, API-to-database interactions |
| System Testing | QA Team | End-to-end functional flows |
| User Acceptance Testing (UAT) | Client / Business Users | Validation against real business needs |

### Types of Testing

#### Functional Testing

- Verify each requirement works as specified
- Cover positive paths (happy path) and negative paths (error handling)
- Validate all form fields, validations, and business rules

#### Unit Testing *(done by developers)*

- Test individual functions and components in isolation
- Cover calculation logic, validation rules, and data transformations

#### Integration Testing

- Test cross-system interactions: invoice submission → email notification, approval → payment API
- Verify data is passed correctly between the portal, email service, and ERP/payment system
- Test what happens when a third-party service is slow, returns an error, or sends unexpected data

#### System Testing

- Test complete end-to-end workflows from vendor login to payment confirmation
- Validate the entire system against all 7 client requirements together

#### End-to-End (E2E) Testing

- Simulate real user journeys: vendor registers → submits invoice → AP approves → payment triggered → notification sent
- Run through the full B2B workflow without skipping any step

#### Regression Testing

- Re-run all test cases after every code change or bug fix
- Automate the regression suite for the core flows

#### Smoke Testing

- Run a small set of critical tests immediately after each deployment
- Confirm the system is stable before full testing begins

#### User Acceptance Testing (UAT)

- Client and end users validate the portal against their real business process
- Done on the UAT environment before go-live

#### API Testing

- Test all REST API endpoints independently
- Validate request/response structure, HTTP status codes, and error messages
- Test authentication tokens and authorization headers

#### Database Testing

- Confirm data is saved correctly after each operation
- Verify constraints (unique, not null, foreign keys) are enforced
- Check no orphaned or duplicate records are created

#### Security Testing

- Test login with invalid credentials (brute force protection)
- Check for SQL injection in all input fields
- Check for XSS in text inputs
- Verify role-based access — a vendor must not access AP team pages
- Confirm session tokens expire after the configured timeout

#### Performance & Load Testing

- Simulate peak concurrent users (number to be confirmed with client)
- Measure page load time and API response time under load
- Test file upload performance with large files
- Stress test to find the system's breaking point

#### Usability Testing

- Walkthrough of core workflows with a first-time user perspective
- Check error messages are clear and helpful
- Measure task completion rate for key vendor and AP team workflows

#### Accessibility Testing

- Verify WCAG 2.1 AA compliance for all pages
- Test keyboard-only navigation (no mouse required)
- Test with a screen reader for critical workflows
- Verify colour contrast ratios meet accessibility standards

#### Compatibility Testing

- Test on Chrome, Firefox, Safari, and Edge (latest versions)
- Test on Windows, macOS, Android, and iOS
- Test on desktop, tablet, and mobile screen sizes

#### Reliability & Stability Testing

- Run the system under normal load for an extended period (soak testing)
- Verify the portal recovers correctly from network failures and timeouts
- Confirm that no data is lost during unexpected session drops

#### Documentation Testing

- Verify that all user-facing error messages match what is documented
- Confirm the user guide and help content reflect the actual UI
- Validate that API documentation matches the actual API behaviour

---

## 4. Test Design Techniques

| Technique | When Used |
| --- | --- |
| Equivalence Partitioning | Input fields (file size, invoice amount, date ranges) |
| Boundary Value Analysis | File size limits, amount limits, date edge cases |
| Decision Table Testing | Approval logic (role + invoice status combinations) |
| State Transition Testing | Invoice status flow: Submitted → Approved/Rejected → Paid |
| Error Guessing | Blank fields, special characters, very large inputs |

---

## 5. Quality Metrics

These metrics tell us — objectively — whether testing is thorough and whether the product is ready.

| Metric | Definition | Target |
| --- | --- | --- |
| Requirement Coverage | % of requirements with at least one executed test case | 100% |
| Test Case Pass Rate | % of test cases that pass in a given cycle | ≥ 95% before UAT |
| Defect Density | Number of defects per requirement or feature | ≤ 2 per feature area |
| Defect Escape Rate | % of defects found in UAT or production that were missed in QA | ≤ 5% |
| Test Execution Rate | Number of test cases executed per QA engineer per day | ≥ 8 per day |
| Critical Bug Resolution Time | Time from bug logged to bug verified fixed | ≤ 2 working days for P1 |
| Blocked Test Cases | Number of test cases that cannot be executed due to environment or dependency issues | 0 at UAT start |

---

## 6. Tools

| Purpose | Tool |
| --- | --- |
| Test Case Management | Excel / Google Sheets (or Jira Xray if available) |
| API Testing | Postman |
| Bug Reporting | Jira (or shared bug tracker agreed with client) |
| Performance Testing | JMeter or k6 |
| Browser Testing | BrowserStack or manual on local browsers |
| Automation (Regression) | Selenium / Cypress (if automation phase is in scope) |

---

## 6. Environments

| Environment | Purpose |
| --- | --- |
| Development | Developer unit testing |
| Staging / QA | QA functional and integration testing |
| UAT | Client acceptance testing |
| Production | Post-deployment smoke testing only |

All functional testing will be performed on the **Staging/QA environment** using test data that mirrors real-world scenarios.

---

## 7. Entry and Exit Criteria

### Entry Criteria (Before Testing Starts)

- All requirements are reviewed and clarifications received
- The application is deployed to the staging environment
- Test data is set up (vendor accounts, POs, sample invoices)
- Test cases are reviewed and signed off

### Exit Criteria (Before Testing Ends)

- All planned test cases have been executed
- No critical or high severity bugs are open
- All medium severity bugs are either fixed or have an accepted workaround
- Test execution report is prepared and shared with the client

---

## 8. Roles and Responsibilities

| Role | Responsibility |
| --- | --- |
| QA Lead | Test strategy, test plan, risk assessment, sign-off |
| QA Engineer | Write test cases, execute tests, report bugs |
| Developer | Fix bugs, support unit testing, attend three-amigos sessions |
| Business Analyst | Clarify requirements, support UAT |
| Client / End Users | Perform UAT, provide final sign-off |

---

## 9. Risk and Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Requirements are unclear or incomplete | Test coverage gaps | Raise clarifying questions before test design |
| Integration with ERP/SAP is not ready | Cannot test payment forwarding | Mock the integration in staging; test real integration in UAT |
| Test data is insufficient | Incomplete test execution | Prepare test data scripts before testing begins |
| Short timelines | Coverage cuts | Use risk-based testing — prioritize critical paths first |
| Environment instability | Blocked test execution | Coordinate with DevOps for environment stability windows |

---

## 10. Defect Management

- All defects are logged in the agreed bug tracker (Jira)
- Each bug includes: title, steps to reproduce, expected result, actual result, environment, severity, priority, and screenshots/logs
- Severity levels: **Critical, High, Medium, Low**
- Priority levels: **P1 (fix immediately), P2 (fix in this sprint), P3 (fix in next release), P4 (nice to fix)**
- Bugs are reviewed daily in a defect triage call

---

*This strategy is the foundation for all test planning and execution activities on this project.*
