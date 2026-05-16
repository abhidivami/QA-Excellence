# Practical Exercises — Unit Testing & API Testing

**Week:** 2  
**Date:** 2026-05-16  
**Context:** Vendor Invoice Management Portal

---

## Part 1: Unit Tests

These are written in JavaScript using Jest. Each function mirrors real logic from the Invoice Portal backend.

---

### Exercise 1 — validateInvoiceAmount

The function checks if an invoice amount is valid before saving it.

```javascript
function validateInvoiceAmount(amount) {
    if (typeof amount !== 'number') return { valid: false, error: 'Amount must be a number' }
    if (amount <= 0) return { valid: false, error: 'Amount must be greater than zero' }
    if (amount > 10000000) return { valid: false, error: 'Amount exceeds maximum limit' }
    return { valid: true, error: null }
}
```

**Tests:**

```javascript
describe('validateInvoiceAmount', () => {

    test('valid amount returns true', () => {
        const result = validateInvoiceAmount(50000)
        expect(result.valid).toBe(true)
        expect(result.error).toBeNull()
    })

    test('zero amount is rejected', () => {
        const result = validateInvoiceAmount(0)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Amount must be greater than zero')
    })

    test('negative amount is rejected', () => {
        const result = validateInvoiceAmount(-100)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Amount must be greater than zero')
    })

    test('amount above maximum is rejected', () => {
        const result = validateInvoiceAmount(10000001)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Amount exceeds maximum limit')
    })

    test('non-numeric input is rejected', () => {
        const result = validateInvoiceAmount('fifty thousand')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Amount must be a number')
    })

    test('boundary — exactly at maximum is accepted', () => {
        const result = validateInvoiceAmount(10000000)
        expect(result.valid).toBe(true)
    })
})
```

**What bug does this catch?**  
If the backend skips amount validation, a vendor could submit ₹0 or a negative amount and it would be saved. This test pins that the check exists and works at boundaries.

---

### Exercise 2 — isValidFileType

The function checks if an uploaded file is an allowed type (PDF, JPEG, PNG only).

```javascript
function isValidFileType(filename) {
    const allowed = ['pdf', 'jpg', 'jpeg', 'png']
    const ext = filename.split('.').pop().toLowerCase()
    return allowed.includes(ext)
}
```

**Tests:**

```javascript
describe('isValidFileType', () => {

    test('PDF file is accepted', () => {
        expect(isValidFileType('invoice.pdf')).toBe(true)
    })

    test('JPEG file is accepted', () => {
        expect(isValidFileType('receipt.jpeg')).toBe(true)
    })

    test('PNG file is accepted', () => {
        expect(isValidFileType('document.png')).toBe(true)
    })

    test('EXE file is blocked', () => {
        expect(isValidFileType('malware.exe')).toBe(false)
    })

    test('BAT file is blocked', () => {
        expect(isValidFileType('script.bat')).toBe(false)
    })

    test('uppercase extension is handled — PDF is same as pdf', () => {
        expect(isValidFileType('INVOICE.PDF')).toBe(true)
    })

    test('no extension returns false', () => {
        expect(isValidFileType('invoice')).toBe(false)
    })
})
```

**What bug does this catch?**  
BUG-004 from our bug report — .exe files were uploading without any block. This test would have caught that immediately at the unit level, before it ever reached the upload endpoint.

---

### Exercise 3 — isDuplicateInvoice

The function checks if an invoice number already exists in the list.

```javascript
function isDuplicateInvoice(invoiceNumber, existingInvoices) {
    return existingInvoices.some(inv => inv.invoiceNumber === invoiceNumber)
}
```

**Tests:**

```javascript
describe('isDuplicateInvoice', () => {

    const existing = [
        { invoiceNumber: 'INV-2026-001', amount: 50000 },
        { invoiceNumber: 'INV-2026-002', amount: 30000 }
    ]

    test('duplicate invoice number is detected', () => {
        expect(isDuplicateInvoice('INV-2026-001', existing)).toBe(true)
    })

    test('new invoice number is not a duplicate', () => {
        expect(isDuplicateInvoice('INV-2026-003', existing)).toBe(false)
    })

    test('empty list means no duplicate', () => {
        expect(isDuplicateInvoice('INV-2026-001', [])).toBe(false)
    })

    test('case-sensitive — INV-2026-001 and inv-2026-001 are different', () => {
        expect(isDuplicateInvoice('inv-2026-001', existing)).toBe(false)
    })
})
```

**What bug does this catch?**  
BUG-001 — duplicate invoices were accepted and saved twice. This unit test confirms the duplicate check logic works before it's ever wired to the database.

---

### Exercise 4 — hasPermission

The function checks if a user's role is allowed to perform a given action.

```javascript
const permissions = {
    'AP': ['view_invoices', 'approve_invoice', 'reject_invoice', 'view_reports'],
    'Admin': ['view_invoices', 'approve_invoice', 'reject_invoice', 'view_reports', 'manage_users'],
    'Vendor': ['submit_invoice', 'view_own_invoices']
}

function hasPermission(role, action) {
    if (!permissions[role]) return false
    return permissions[role].includes(action)
}
```

**Tests:**

```javascript
describe('hasPermission', () => {

    test('AP can approve invoices', () => {
        expect(hasPermission('AP', 'approve_invoice')).toBe(true)
    })

    test('Vendor cannot approve invoices', () => {
        expect(hasPermission('Vendor', 'approve_invoice')).toBe(false)
    })

    test('Vendor can submit invoices', () => {
        expect(hasPermission('Vendor', 'submit_invoice')).toBe(true)
    })

    test('AP cannot manage users', () => {
        expect(hasPermission('AP', 'manage_users')).toBe(false)
    })

    test('Admin can manage users', () => {
        expect(hasPermission('Admin', 'manage_users')).toBe(true)
    })

    test('unknown role is denied everything', () => {
        expect(hasPermission('Guest', 'view_invoices')).toBe(false)
    })
})
```

**What bug does this catch?**  
If the permission table is wrong, a Vendor could call approve_invoice and the function would let it through. These tests lock down every role-action combination before authorization is wired to any endpoint.

---

---

## Part 2: API Tests

These are written in Postman-style format. Each test shows:
- The request you send
- The response you expect
- The assertion you write in Postman's Tests tab

---

### Exercise 5 — Login: POST /api/auth/login

**Test 1 — Valid login**

```
Method:  POST
URL:     /api/auth/login
Headers: Content-Type: application/json
Body:
{
    "email": "ap.user@company.com",
    "password": "ValidPass@123"
}

Expected Status: 200
Expected Body:
{
    "token": "<any non-empty string>",
    "role": "AP",
    "expiresIn": 3600
}
```

Postman Tests tab:
```javascript
pm.test("Status is 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Token is present", () => {
    const body = pm.response.json()
    pm.expect(body.token).to.be.a('string').and.not.empty
})
pm.test("Role is AP", () => {
    pm.expect(pm.response.json().role).to.eql('AP')
})

// Save token for use in later requests
pm.environment.set("auth_token", pm.response.json().token)
```

---

**Test 2 — Wrong password**

```
Body:
{
    "email": "ap.user@company.com",
    "password": "WrongPassword"
}

Expected Status: 401
Expected Body:
{
    "error": "Invalid credentials"
}
```

Postman Tests tab:
```javascript
pm.test("Status is 401", () => {
    pm.response.to.have.status(401)
})
pm.test("Error message is present", () => {
    pm.expect(pm.response.json().error).to.eql('Invalid credentials')
})
```

---

**Test 3 — No body sent**

```
Body: (empty)

Expected Status: 400
Expected Body:
{
    "error": "Email and password are required"
}
```

---

### Exercise 6 — Submit Invoice: POST /api/invoices

**Test 1 — Valid invoice submission**

```
Method:  POST
URL:     /api/invoices
Headers:
    Content-Type: application/json
    Authorization: Bearer {{auth_token}}   ← use the token saved from login
Body:
{
    "invoiceNumber": "INV-2026-005",
    "poNumber": "PO-2026-010",
    "amount": 75000,
    "dueDate": "2026-06-15",
    "description": "Software development services - May 2026"
}

Expected Status: 201
Expected Body:
{
    "invoiceId": "<any string>",
    "invoiceNumber": "INV-2026-005",
    "status": "Pending Review",
    "submittedAt": "<any timestamp>"
}
```

Postman Tests tab:
```javascript
pm.test("Status is 201 Created", () => {
    pm.response.to.have.status(201)
})
pm.test("Status is Pending Review", () => {
    pm.expect(pm.response.json().status).to.eql('Pending Review')
})
pm.test("Invoice number matches what was sent", () => {
    pm.expect(pm.response.json().invoiceNumber).to.eql('INV-2026-005')
})
pm.test("Response time under 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500)
})
```

---

**Test 2 — Missing required field (no amount)**

```
Body:
{
    "invoiceNumber": "INV-2026-006",
    "poNumber": "PO-2026-011",
    "dueDate": "2026-06-15"
}

Expected Status: 400
Expected Body:
{
    "error": "Amount is required"
}
```

Postman Tests tab:
```javascript
pm.test("Status is 400", () => {
    pm.response.to.have.status(400)
})
pm.test("Error tells you what is missing", () => {
    pm.expect(pm.response.json().error).to.include('Amount')
})
```

---

**Test 3 — Duplicate invoice number**

Send the same body as Test 1 (INV-2026-005) again.

```
Expected Status: 409
Expected Body:
{
    "error": "Invoice INV-2026-005 already exists"
}
```

---

**Test 4 — No auth token**

Send the request with no Authorization header.

```
Expected Status: 401
```

---

**Test 5 — Vendor token calling AP endpoint**

Use a vendor's token to call `PUT /api/invoices/{id}/approve`.

```
Method:  PUT
URL:     /api/invoices/INV-2026-005/approve
Headers:
    Authorization: Bearer {{vendor_token}}

Expected Status: 403
```

Postman Tests tab:
```javascript
pm.test("Vendor cannot approve — 403 Forbidden", () => {
    pm.response.to.have.status(403)
})
```

**The distinction:** 401 = system doesn't know who you are. 403 = system knows exactly who you are, you're just not allowed here.

---

### Exercise 7 — Get Invoices: GET /api/invoices

**Test 1 — AP sees all invoices**

```
Method:  GET
URL:     /api/invoices
Headers: Authorization: Bearer {{ap_token}}

Expected Status: 200
Expected Body:
{
    "invoices": [ ...array of all invoices... ],
    "total": <number>
}
```

Postman Tests tab:
```javascript
pm.test("Status is 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Response has invoices array", () => {
    pm.expect(pm.response.json().invoices).to.be.an('array')
})
pm.test("Each invoice has required fields", () => {
    const invoices = pm.response.json().invoices
    invoices.forEach(inv => {
        pm.expect(inv).to.have.all.keys('invoiceId', 'invoiceNumber', 'status', 'amount')
    })
})
```

---

**Test 2 — Vendor sees only their own invoices**

```
Headers: Authorization: Bearer {{vendor_token}}

Expected: invoices array contains only invoices submitted by this vendor
```

Postman Tests tab:
```javascript
pm.test("Vendor data isolation — only own invoices returned", () => {
    const invoices = pm.response.json().invoices
    invoices.forEach(inv => {
        pm.expect(inv.vendorId).to.eql(pm.environment.get("vendor_id"))
    })
})
```

**What bug does this catch?**  
Hidden Risk HR-05 from the test plan — vendor data leakage at the API level. The UI might filter the list, but if the API returns all invoices and the UI just hides them, a direct API call exposes everything.

---

### Exercise 8 — Monthly Report: GET /api/reports/monthly

**Test 1 — Admin gets report**

```
Method:  GET
URL:     /api/reports/monthly?month=2026-04
Headers: Authorization: Bearer {{admin_token}}

Expected Status: 200
Expected Body:
{
    "month": "2026-04",
    "totalInvoices": <number>,
    "totalApproved": <number>,
    "totalRejected": <number>,
    "totalPaid": <number>,
    "totalAmount": <number>
}
```

Postman Tests tab:
```javascript
pm.test("All report fields are present", () => {
    const body = pm.response.json()
    pm.expect(body).to.have.all.keys(
        'month', 'totalInvoices', 'totalApproved',
        'totalRejected', 'totalPaid', 'totalAmount'
    )
})
pm.test("Counts are numbers, not strings", () => {
    const body = pm.response.json()
    pm.expect(body.totalInvoices).to.be.a('number')
    pm.expect(body.totalAmount).to.be.a('number')
})
```

---

**Test 2 — Vendor cannot access reports**

```
Headers: Authorization: Bearer {{vendor_token}}

Expected Status: 403
```

---

**Test 3 — Missing month parameter**

```
URL: /api/reports/monthly   (no ?month= param)

Expected Status: 400
Expected Body: { "error": "month parameter is required" }
```

---

### Exercise 9 — Base URL & API Versioning

These are always the first two tests in any collection. They act as a smoke test — if these fail, there's no point running anything else.

---

#### Test 1 — Base URL health check

Before sending any real request, verify the server is up and the API is reachable.

```
Method:  GET
URL:     /api/health
Headers: (none required)

Expected Status: 200
Expected Body:
{
    "status": "ok",
    "version": "1.0.0"
}
```

Postman Tests tab:
```javascript
pm.test("Server is up — status 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Status field is ok", () => {
    pm.expect(pm.response.json().status).to.eql('ok')
})
pm.test("Response time under 200ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(200)
})
```

**Why this matters:** If someone deploys a broken build or the server crashes overnight, this test fails immediately — before you waste time debugging why every other test is returning 502 or connection refused.

---

#### Test 2 — Correct API version is active

Most APIs are versioned — `/api/v1/invoices` is different from `/api/v2/invoices`. You need to confirm you're hitting the right version.

```
Method:  GET
URL:     /api/v1/invoices
Headers: Authorization: Bearer {{auth_token}}

Expected Status: 200   ← v1 is the active version, should work
```

Postman Tests tab:
```javascript
pm.test("v1 endpoint responds correctly", () => {
    pm.response.to.have.status(200)
})
pm.test("API version in response header matches v1", () => {
    pm.expect(pm.response.headers.get('X-API-Version')).to.eql('1.0')
})
```

---

#### Test 3 — Old version returns appropriate response

If v2 was released and v1 is deprecated, hitting v1 should either still work (backward compatible) or return a clear deprecation notice — not a silent 200 with broken data.

```
Method:  GET
URL:     /api/v0/invoices   ← version that no longer exists
Headers: Authorization: Bearer {{auth_token}}

Expected Status: 404  or  410 Gone
Expected Body:
{
    "error": "API version v0 is no longer supported. Use /api/v1/"
}
```

Postman Tests tab:

```javascript
pm.test("Unsupported version returns 404 or 410", () => {
    pm.expect(pm.response.code).to.be.oneOf([404, 410])
})
pm.test("Error message tells you the correct version to use", () => {
    pm.expect(pm.response.json().error).to.include('v1')
})
```

---

#### Test 4 — Completely invalid version string

```
Method:  GET
URL:     /api/vXYZ/invoices

Expected Status: 404
```

---

**Why versioning tests matter in QA:**  
When a new API version is released, regression tests on v1 can break silently if the team forgot to maintain backward compatibility. These two tests — "correct version works" and "old version responds correctly" — are the canary in the coal mine for any deployment.

In Postman, put these at the very top of your collection so they run first. If they fail, the whole run stops early.

---

## Summary Table

| Exercise | Type | Function / Endpoint | Key Scenario Tested |
| --- | --- | --- | --- |
| 1 | Unit | validateInvoiceAmount | Zero, negative, non-numeric, boundary |
| 2 | Unit | isValidFileType | .exe blocked, case-insensitive, no extension |
| 3 | Unit | isDuplicateInvoice | Same number, empty list, case-sensitive |
| 4 | Unit | hasPermission | Role-action matrix, unknown role |
| 5 | API | POST /api/auth/login | Valid login, wrong password, missing body |
| 6 | API | POST /api/invoices | Happy path, missing field, duplicate, no auth, wrong role |
| 7 | API | GET /api/invoices | All vs own invoices, vendor data isolation |
| 8 | API | GET /api/reports/monthly | Admin access, vendor blocked, missing param |
| 9 | API | GET /api/health + versioning | Server up, correct version active, old version handled |

---

## Key Lesson

Unit tests and API tests are not alternatives — they catch different things at different depths.

A unit test on `isDuplicateInvoice` proves the *logic* works in memory.  
An API test on `POST /api/invoices` proves the *endpoint* actually enforces it end-to-end.

Both failing together means the logic is broken.  
API test failing but unit test passing means the logic works but isn't wired up correctly.  
Unit test failing but API test passing is impossible — the API test would have caught it first.
