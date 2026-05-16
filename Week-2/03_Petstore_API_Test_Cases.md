# Petstore API — Production-Grade Test Cases

**Week:** 2  
**Date:** 2026-05-16  
**API:** Swagger Petstore  
**Base URL:** `https://petstore.swagger.io/v2`  
**Auth:** Header `api_key: special-key`  
**Spec:** https://petstore.swagger.io/#/

---

## Environment Setup (Postman)

Before running any tests, set these as Postman environment variables:

| Variable | Value |
| --- | --- |
| `base_url` | `https://petstore.swagger.io/v2` |
| `valid_api_key` | `special-key` |
| `invalid_api_key` | `wrong-key-xyz` |
| `malformed_api_key` | `!!@##$$%%` |
| `created_pet_id` | _(set dynamically by TC-P-001)_ |
| `created_order_id` | _(set dynamically by TC-ST-001)_ |
| `created_username` | _(set dynamically by TC-U-001)_ |

---

## Section 0: Smoke Tests

Run these first. If they fail, stop — there is no point running anything else.

---

### TC-S-001 — Base URL is reachable

```
Method:  GET
URL:     {{base_url}}/pet/1
Headers: api_key: {{valid_api_key}}
```

```javascript
pm.test("Server is reachable — not a connection error", () => {
    pm.expect(pm.response.code).to.not.eql(0)
})
pm.test("Response is not a 5xx server crash", () => {
    pm.expect(pm.response.code).to.be.below(500)
})
pm.test("Response time under 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000)
})
```

---

### TC-S-002 — API returns JSON, not HTML

```
Method:  GET
URL:     {{base_url}}/pet/1
Headers: api_key: {{valid_api_key}}
         Accept: application/json
```

```javascript
pm.test("Content-Type is application/json", () => {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json")
})
pm.test("Response body is valid JSON", () => {
    pm.response.json() // throws if not valid JSON
})
```

**Why:** If a proxy, firewall, or WAF intercepts the request, it may return an HTML error page. Your tests would then crash on `pm.response.json()` with cryptic errors. This test catches that immediately.

---

---

## Section 1: Pet Endpoints

### POST /pet — Add a New Pet

---

#### TC-P-001 — Happy path: create pet with all fields

```
Method:  POST
URL:     {{base_url}}/pet
Headers: Content-Type: application/json
         api_key: {{valid_api_key}}
Body:
{
    "id": 987654321,
    "name": "Bruno",
    "category": { "id": 1, "name": "Dogs" },
    "photoUrls": ["https://example.com/bruno.jpg"],
    "tags": [{ "id": 1, "name": "friendly" }],
    "status": "available"
}
```

Expected Status: `200`

```javascript
pm.test("Status is 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Pet name matches", () => {
    pm.expect(pm.response.json().name).to.eql("Bruno")
})
pm.test("Status is available", () => {
    pm.expect(pm.response.json().status).to.eql("available")
})
pm.test("Response has id field", () => {
    pm.expect(pm.response.json()).to.have.property("id")
})
// Save pet ID for later tests
pm.environment.set("created_pet_id", pm.response.json().id)
```

---

#### TC-P-002 — Only required fields (name + photoUrls)

The schema requires only `name` and `photoUrls`. Everything else is optional.

```
Body:
{
    "name": "MinimalPet",
    "photoUrls": ["https://example.com/photo.jpg"]
}
```

Expected Status: `200`

```javascript
pm.test("Server accepts minimal body", () => {
    pm.response.to.have.status(200)
})
pm.test("Name is returned correctly", () => {
    pm.expect(pm.response.json().name).to.eql("MinimalPet")
})
```

---

#### TC-P-003 — Missing required field: name

```
Body:
{
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "available"
}
```

Expected Status: `400` or `405`

```javascript
pm.test("Missing name is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 405])
})
```

**Why:** `name` is marked `required` in the schema. Sending without it should be rejected, not silently stored with a null name.

---

#### TC-P-004 — Missing required field: photoUrls

```
Body:
{
    "name": "NoPicPet",
    "status": "available"
}
```

Expected Status: `400` or `405`

---

#### TC-P-005 — photoUrls sent as empty array

```
Body:
{
    "name": "EmptyPhotoPet",
    "photoUrls": []
}
```

Expected Status: `400` or `200` _(document which one the API actually returns — this is a grey area worth flagging)_

```javascript
pm.test("Empty photoUrls — note actual behavior", () => {
    console.log("Actual status:", pm.response.code)
    console.log("API accepts or rejects empty photoUrls array:", pm.response.code)
})
```

---

#### TC-P-006 — Invalid status enum value

The schema defines status as enum: `available | pending | sold`. Anything else should fail.

```
Body:
{
    "name": "BadStatusPet",
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "discontinued"
}
```

Expected Status: `400` or `405`

```javascript
pm.test("Invalid enum value is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 405])
})
```

---

#### TC-P-007 — No auth token

```
Headers: Content-Type: application/json
         (no api_key header)
Body: { "name": "TestPet", "photoUrls": ["https://example.com/x.jpg"] }
```

Expected Status: `401` or `403`

```javascript
pm.test("Request without auth is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([401, 403])
})
```

---

#### TC-P-008 — Invalid API key

```
Headers: api_key: {{invalid_api_key}}
```

Expected Status: `401` or `403`

```javascript
pm.test("Wrong API key is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([401, 403])
})
```

---

#### TC-P-009 — Malformed API key (special characters)

```
Headers: api_key: !!@##$$%%^&*()
```

Expected Status: `400` or `401`

```javascript
pm.test("Malformed key does not crash the server", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

**Why:** A 500 here means the API tried to parse the key and threw an unhandled exception — a security and stability issue.

---

#### TC-P-010 — Extra unknown keys in body

The API should silently ignore unknown fields. It should not fail or leak them back.

```
Body:
{
    "name": "ExtraKeyPet",
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "available",
    "internalAdminFlag": true,
    "deletedAt": "2026-01-01",
    "secretScore": 9999
}
```

Expected Status: `200`

```javascript
pm.test("Extra keys are accepted without error", () => {
    pm.response.to.have.status(200)
})
pm.test("Extra keys are not reflected back in response", () => {
    const body = pm.response.json()
    pm.expect(body).to.not.have.property("internalAdminFlag")
    pm.expect(body).to.not.have.property("secretScore")
})
```

**Why:** If the API reflects extra keys back in the response, it may indicate improper input handling — a risk for injection or mass assignment attacks.

---

#### TC-P-011 — Wrong data type: name sent as integer

```
Body:
{
    "name": 12345,
    "photoUrls": ["https://example.com/photo.jpg"]
}
```

Expected Status: `400` or `405`

```javascript
pm.test("Integer where string is expected is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 405])
})
```

---

#### TC-P-012 — id sent as string instead of int64

```
Body:
{
    "id": "not-an-integer",
    "name": "StringIdPet",
    "photoUrls": ["https://example.com/photo.jpg"]
}
```

Expected Status: `400` or `405`

---

#### TC-P-013 — name is null

```
Body:
{
    "name": null,
    "photoUrls": ["https://example.com/photo.jpg"]
}
```

Expected Status: `400`

```javascript
pm.test("Null for required field is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 405])
})
```

---

#### TC-P-014 — Wrong Content-Type header

```
Headers: Content-Type: text/plain
         api_key: {{valid_api_key}}
Body: { "name": "WrongContentType", "photoUrls": ["https://x.com/x.jpg"] }
```

Expected Status: `415` (Unsupported Media Type) or `400`

```javascript
pm.test("Wrong Content-Type is rejected or flagged", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 415])
})
pm.test("Server does not crash with wrong content type", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-P-015 — Extremely long name (500 characters)

```
Body:
{
    "name": "AAAA...A" (500 'A' characters),
    "photoUrls": ["https://example.com/photo.jpg"]
}
```

Expected Status: `400` (if max length enforced) or `200` _(document actual behavior)_

```javascript
pm.test("Server handles oversized string without 500", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

### GET /pet/{petId} — Find Pet by ID

---

#### TC-P-016 — Valid petId

```
Method:  GET
URL:     {{base_url}}/pet/{{created_pet_id}}
Headers: api_key: {{valid_api_key}}
```

Expected Status: `200`

```javascript
pm.test("Status is 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Response has all expected fields", () => {
    const pet = pm.response.json()
    pm.expect(pet).to.have.property("id")
    pm.expect(pet).to.have.property("name")
    pm.expect(pet).to.have.property("photoUrls")
    pm.expect(pet).to.have.property("status")
})
pm.test("id is a number, not a string", () => {
    pm.expect(pm.response.json().id).to.be.a("number")
})
pm.test("photoUrls is an array", () => {
    pm.expect(pm.response.json().photoUrls).to.be.an("array")
})
pm.test("status is a valid enum value", () => {
    pm.expect(pm.response.json().status).to.be.oneOf(["available", "pending", "sold"])
})
```

---

#### TC-P-017 — Non-existent petId

```
URL: {{base_url}}/pet/999999999
```

Expected Status: `404`

```javascript
pm.test("Non-existent pet returns 404", () => {
    pm.response.to.have.status(404)
})
```

---

#### TC-P-018 — petId = 0 (boundary)

```
URL: {{base_url}}/pet/0
```

Expected Status: `400` or `404`

```javascript
pm.test("petId 0 is handled without 500", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-P-019 — Negative petId

```
URL: {{base_url}}/pet/-1
```

Expected Status: `400`

```javascript
pm.test("Negative petId returns 400", () => {
    pm.response.to.have.status(400)
})
```

---

#### TC-P-020 — petId as string ("abc")

```
URL: {{base_url}}/pet/abc
```

Expected Status: `400`

```javascript
pm.test("String petId returns 400", () => {
    pm.response.to.have.status(400)
})
pm.test("Server does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-P-021 — SQL injection in petId

```
URL: {{base_url}}/pet/1' OR '1'='1
```

Expected Status: `400`

```javascript
pm.test("SQL injection in path param does not crash server", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
pm.test("SQL injection does not return unexpected data", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 404])
})
```

---

#### TC-P-022 — No API key on GET /pet/{petId}

```
Headers: (no api_key)
URL:     {{base_url}}/pet/{{created_pet_id}}
```

Expected Status: `401` or `403` _(or 200 if this endpoint is public — document actual behavior)_

```javascript
pm.test("Unauthenticated access behavior is documented", () => {
    console.log("Status without auth key:", pm.response.code)
})
```

---

### PUT /pet — Update an Existing Pet

---

#### TC-P-023 — Valid update: change name and status

```
Method:  PUT
URL:     {{base_url}}/pet
Headers: Content-Type: application/json
         api_key: {{valid_api_key}}
Body:
{
    "id": {{created_pet_id}},
    "name": "BrunoUpdated",
    "photoUrls": ["https://example.com/bruno.jpg"],
    "status": "pending"
}
```

Expected Status: `200`

```javascript
pm.test("Update succeeds", () => {
    pm.response.to.have.status(200)
})
pm.test("Name is updated", () => {
    pm.expect(pm.response.json().name).to.eql("BrunoUpdated")
})
pm.test("Status is updated to pending", () => {
    pm.expect(pm.response.json().status).to.eql("pending")
})
```

---

#### TC-P-024 — Update with non-existent pet ID

```
Body:
{
    "id": 999999998,
    "name": "GhostPet",
    "photoUrls": ["https://example.com/ghost.jpg"]
}
```

Expected Status: `404`

---

#### TC-P-025 — Update with invalid ID (negative)

```
Body:
{
    "id": -999,
    "name": "NegativePet",
    "photoUrls": ["https://example.com/photo.jpg"]
}
```

Expected Status: `400`

---

#### TC-P-026 — Update with extra keys

```
Body:
{
    "id": {{created_pet_id}},
    "name": "ExtraKeyUpdate",
    "photoUrls": ["https://example.com/photo.jpg"],
    "status": "available",
    "createdBy": "hacker",
    "adminOverride": true
}
```

Expected Status: `200`

```javascript
pm.test("Extra keys in update do not cause error", () => {
    pm.response.to.have.status(200)
})
pm.test("Extra keys are not stored in response", () => {
    const body = pm.response.json()
    pm.expect(body).to.not.have.property("adminOverride")
})
```

---

### DELETE /pet/{petId}

---

#### TC-P-027 — Valid delete

```
Method:  DELETE
URL:     {{base_url}}/pet/{{created_pet_id}}
Headers: api_key: {{valid_api_key}}
```

Expected Status: `200`

```javascript
pm.test("Delete returns 200", () => {
    pm.response.to.have.status(200)
})
```

---

#### TC-P-028 — Delete already-deleted pet (idempotency)

Send the same delete request again with the same pet ID.

Expected Status: `404`

```javascript
pm.test("Deleting again returns 404, not 500", () => {
    pm.response.to.have.status(404)
})
```

**Why:** A 500 on the second delete means the server tried to delete a non-existent record and crashed. A clean 404 means the server handles it gracefully.

---

#### TC-P-029 — Delete with no auth

```
Headers: (no api_key)
```

Expected Status: `401` or `403`

---

#### TC-P-030 — Delete with string petId

```
URL: {{base_url}}/pet/notanumber
```

Expected Status: `400`

---

### GET /pet/findByStatus

---

#### TC-P-031 — Single valid status

```
Method: GET
URL:    {{base_url}}/pet/findByStatus?status=available
Headers: api_key: {{valid_api_key}}
```

Expected Status: `200`

```javascript
pm.test("Status 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Returns an array", () => {
    pm.expect(pm.response.json()).to.be.an("array")
})
pm.test("Every pet has status available", () => {
    pm.response.json().forEach(pet => {
        pm.expect(pet.status).to.eql("available")
    })
})
pm.test("Every item has required fields", () => {
    pm.response.json().forEach(pet => {
        pm.expect(pet).to.have.property("id")
        pm.expect(pet).to.have.property("name")
    })
})
```

---

#### TC-P-032 — Multiple statuses

```
URL: {{base_url}}/pet/findByStatus?status=available&status=pending
```

Expected Status: `200`

```javascript
pm.test("Returns pets with both statuses", () => {
    const statuses = pm.response.json().map(p => p.status)
    pm.expect(statuses).to.include("available")
})
```

---

#### TC-P-033 — Invalid status value

```
URL: {{base_url}}/pet/findByStatus?status=unknown
```

Expected Status: `400`

```javascript
pm.test("Invalid status returns 400", () => {
    pm.response.to.have.status(400)
})
```

---

#### TC-P-034 — Missing status param entirely

```
URL: {{base_url}}/pet/findByStatus
```

Expected Status: `400`

---

#### TC-P-035 — SQL injection in status param

```
URL: {{base_url}}/pet/findByStatus?status=available' OR '1'='1
```

Expected Status: `400`

```javascript
pm.test("SQL injection in query param does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-P-036 — Status param repeated with conflicting values

```
URL: {{base_url}}/pet/findByStatus?status=available&status=invalidvalue
```

Expected Status: `400` or `200` _(document which — should not silently drop the invalid value)_

---

---

## Section 2: Store Endpoints

### GET /store/inventory

---

#### TC-ST-001 — Valid inventory fetch

```
Method:  GET
URL:     {{base_url}}/store/inventory
Headers: api_key: {{valid_api_key}}
```

Expected Status: `200`

```javascript
pm.test("Status 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Response is an object", () => {
    pm.expect(pm.response.json()).to.be.an("object")
})
pm.test("All values are integers (not strings)", () => {
    Object.values(pm.response.json()).forEach(val => {
        pm.expect(val).to.be.a("number")
    })
})
pm.test("Response time under 1000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(1000)
})
```

---

#### TC-ST-002 — No API key on inventory

```
Headers: (no api_key)
```

Expected Status: `401` or `200` _(document actual — this endpoint may be public)_

---

### POST /store/order — Place an Order

---

#### TC-ST-003 — Valid order

```
Method:  POST
URL:     {{base_url}}/store/order
Headers: Content-Type: application/json
Body:
{
    "id": 101,
    "petId": 987654321,
    "quantity": 1,
    "shipDate": "2026-06-01T00:00:00.000Z",
    "status": "placed",
    "complete": false
}
```

Expected Status: `200`

```javascript
pm.test("Order is created", () => {
    pm.response.to.have.status(200)
})
pm.test("Order status is placed", () => {
    pm.expect(pm.response.json().status).to.eql("placed")
})
pm.test("petId matches what was sent", () => {
    pm.expect(pm.response.json().petId).to.eql(987654321)
})
pm.test("quantity is a number", () => {
    pm.expect(pm.response.json().quantity).to.be.a("number")
})
pm.environment.set("created_order_id", pm.response.json().id)
```

---

#### TC-ST-004 — Invalid status enum in order

Status must be `placed | approved | delivered`.

```
Body:
{
    "petId": 1,
    "quantity": 1,
    "shipDate": "2026-06-01T00:00:00.000Z",
    "status": "cancelled"
}
```

Expected Status: `400`

---

#### TC-ST-005 — Negative quantity

```
Body:
{
    "petId": 1,
    "quantity": -5,
    "status": "placed"
}
```

Expected Status: `400`

```javascript
pm.test("Negative quantity is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 422])
})
```

---

#### TC-ST-006 — Zero quantity (boundary)

```
Body:
{
    "petId": 1,
    "quantity": 0,
    "status": "placed"
}
```

Expected Status: `400` _(ordering 0 items should not be valid)_

---

#### TC-ST-007 — Invalid shipDate format

```
Body:
{
    "petId": 1,
    "quantity": 1,
    "shipDate": "not-a-date",
    "status": "placed"
}
```

Expected Status: `400`

```javascript
pm.test("Invalid date format is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 422])
})
pm.test("Server does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-ST-008 — Extra keys in order body

```
Body:
{
    "petId": 1,
    "quantity": 1,
    "status": "placed",
    "discount": 100,
    "internalPriority": "HIGH",
    "bypassPayment": true
}
```

Expected Status: `200`

```javascript
pm.test("Extra keys do not trigger error", () => {
    pm.response.to.have.status(200)
})
pm.test("Extra keys are not reflected back", () => {
    const body = pm.response.json()
    pm.expect(body).to.not.have.property("bypassPayment")
    pm.expect(body).to.not.have.property("internalPriority")
})
```

---

#### TC-ST-009 — Duplicate order ID

Send TC-ST-003 again with the same `id`. The system should not create two orders with the same ID.

Expected Status: `400` or `409`

```javascript
pm.test("Duplicate order ID is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 409])
})
```

---

#### TC-ST-010 — Missing petId

```
Body:
{
    "quantity": 2,
    "status": "placed"
}
```

Expected Status: `400`

---

### GET /store/order/{orderId}

**Note from spec:** Valid orderId range is 1 to 10. Outside this generates exceptions.

---

#### TC-ST-011 — Valid orderId (boundary: 1)

```
Method:  GET
URL:     {{base_url}}/store/order/1
```

Expected Status: `200` or `404` _(depends on whether order 1 exists — both are valid)_

```javascript
pm.test("Response is 200 or 404 — not a server error", () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 404])
})
```

---

#### TC-ST-012 — Valid orderId (boundary: 10)

```
URL: {{base_url}}/store/order/10
```

Expected Status: `200` or `404`

---

#### TC-ST-013 — orderId = 11 (above max)

```
URL: {{base_url}}/store/order/11
```

Expected Status: `400`

```javascript
pm.test("orderId above max returns 400", () => {
    pm.response.to.have.status(400)
})
```

---

#### TC-ST-014 — orderId = 0 (below min)

```
URL: {{base_url}}/store/order/0
```

Expected Status: `400`

---

#### TC-ST-015 — Negative orderId

```
URL: {{base_url}}/store/order/-1
```

Expected Status: `400`

```javascript
pm.test("Negative orderId returns 400", () => {
    pm.response.to.have.status(400)
})
pm.test("Server does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-ST-016 — orderId as string

```
URL: {{base_url}}/store/order/abc
```

Expected Status: `400`

---

#### TC-ST-017 — SQL injection in orderId

```
URL: {{base_url}}/store/order/1 OR 1=1
```

Expected Status: `400`

```javascript
pm.test("SQL injection does not crash server or return data", () => {
    pm.expect(pm.response.code).to.not.eql(500)
    pm.expect(pm.response.code).to.be.oneOf([400, 404])
})
```

---

### DELETE /store/order/{orderId}

---

#### TC-ST-018 — Valid delete

```
Method:  DELETE
URL:     {{base_url}}/store/order/{{created_order_id}}
```

Expected Status: `200`

---

#### TC-ST-019 — Delete non-existent order

```
URL: {{base_url}}/store/order/999
```

Expected Status: `404`

---

#### TC-ST-020 — Delete with negative orderId

```
URL: {{base_url}}/store/order/-5
```

Expected Status: `400`

---

---

## Section 3: User Endpoints

### POST /user — Create User

---

#### TC-U-001 — Happy path: create user

```
Method:  POST
URL:     {{base_url}}/user
Headers: Content-Type: application/json
Body:
{
    "id": 500001,
    "username": "testuser_qa_001",
    "firstName": "QA",
    "lastName": "Tester",
    "email": "qa.tester@example.com",
    "password": "SecurePass@123",
    "phone": "9876543210",
    "userStatus": 1
}
```

Expected Status: `200`

```javascript
pm.test("User created successfully", () => {
    pm.response.to.have.status(200)
})
pm.environment.set("created_username", "testuser_qa_001")
```

---

#### TC-U-002 — Extra keys in user body

```
Body:
{
    "username": "testuser_extra",
    "password": "Pass@123",
    "role": "superadmin",
    "isAdmin": true,
    "internalId": "INTERNAL-99"
}
```

Expected Status: `200`

```javascript
pm.test("Extra keys do not elevate privileges", () => {
    const body = pm.response.json()
    pm.expect(body).to.not.have.property("role")
    pm.expect(body).to.not.have.property("isAdmin")
})
```

**Why:** Mass assignment attack — if the server blindly maps request fields to user objects, sending `"isAdmin": true` could grant admin access.

---

#### TC-U-003 — userStatus sent as string instead of int

```
Body:
{
    "username": "testuser_badtype",
    "password": "Pass@123",
    "userStatus": "active"
}
```

Expected Status: `400`

```javascript
pm.test("String where int expected is rejected", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 422])
})
```

---

#### TC-U-004 — SQL injection in username field

```
Body:
{
    "username": "user'; DROP TABLE users; --",
    "password": "Pass@123",
    "userStatus": 1
}
```

Expected Status: `400` or `200` _(if 200, document it — the username should be stored as a literal string, not executed)_

```javascript
pm.test("SQL injection in body does not crash server", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-U-005 — Empty body

```
Body: {}
```

Expected Status: `400`

---

### GET /user/login

---

#### TC-U-006 — Valid login

```
Method:  GET
URL:     {{base_url}}/user/login?username=user1&password=XXXXXXXXXXX
Headers: (no auth needed)
```

Expected Status: `200`

```javascript
pm.test("Login succeeds", () => {
    pm.response.to.have.status(200)
})
pm.test("X-Rate-Limit header is present", () => {
    pm.expect(pm.response.headers.get("X-Rate-Limit")).to.exist
})
pm.test("X-Expires-After header is present", () => {
    pm.expect(pm.response.headers.get("X-Expires-After")).to.exist
})
pm.test("X-Rate-Limit is a number", () => {
    pm.expect(Number(pm.response.headers.get("X-Rate-Limit"))).to.be.a("number")
})
pm.test("Response body is a session string/token", () => {
    pm.expect(pm.response.text()).to.be.a("string").and.not.empty
})
```

**Why the header tests matter:** The spec documents `X-Rate-Limit` and `X-Expires-After` as part of the 200 response. If these headers are missing, clients depending on them will silently break.

---

#### TC-U-007 — Wrong password

```
URL: {{base_url}}/user/login?username=user1&password=wrongpassword
```

Expected Status: `400`

```javascript
pm.test("Wrong password returns 400", () => {
    pm.response.to.have.status(400)
})
pm.test("Response does not reveal whether username exists", () => {
    const body = pm.response.text()
    pm.expect(body.toLowerCase()).to.not.include("username not found")
})
```

**Why:** Returning "username not found" vs "wrong password" lets an attacker enumerate valid usernames. The error should be generic: "Invalid username/password."

---

#### TC-U-008 — Missing username param

```
URL: {{base_url}}/user/login?password=Pass@123
```

Expected Status: `400`

---

#### TC-U-009 — Missing password param

```
URL: {{base_url}}/user/login?username=user1
```

Expected Status: `400`

---

#### TC-U-010 — SQL injection in username query param

```
URL: {{base_url}}/user/login?username=admin'--&password=anything
```

Expected Status: `400`

```javascript
pm.test("SQL injection in login does not succeed", () => {
    pm.expect(pm.response.code).to.not.eql(200)
})
pm.test("Server does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-U-011 — Special characters in password

```
URL: {{base_url}}/user/login?username=user1&password=P@$$w0rd!#%^&*()
```

Expected Status: `400` _(unless this is actually user1's password)_

```javascript
pm.test("Special chars in password do not crash server", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-U-012 — Extremely long username (500 chars)

```
URL: {{base_url}}/user/login?username=AAAA...(500 chars)&password=Pass@123
```

Expected Status: `400`

```javascript
pm.test("Oversized username does not crash server", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

### GET /user/{username}

---

#### TC-U-013 — Valid username fetch

```
Method:  GET
URL:     {{base_url}}/user/{{created_username}}
```

Expected Status: `200`

```javascript
pm.test("Status 200", () => {
    pm.response.to.have.status(200)
})
pm.test("Username matches", () => {
    pm.expect(pm.response.json().username).to.eql(pm.environment.get("created_username"))
})
pm.test("Password is NOT returned in response", () => {
    const body = pm.response.json()
    pm.expect(body.password).to.not.exist
        .or.eql("").or.eql(null).or.eql("[REDACTED]")
})
pm.test("All expected fields are present", () => {
    const user = pm.response.json()
    pm.expect(user).to.have.property("id")
    pm.expect(user).to.have.property("username")
    pm.expect(user).to.have.property("email")
})
```

**Why the password check matters:** APIs should never return plaintext passwords in GET responses. This is a critical security test.

---

#### TC-U-014 — Non-existent username

```
URL: {{base_url}}/user/this_user_does_not_exist_xyz987
```

Expected Status: `404`

---

#### TC-U-015 — SQL injection in username path

```
URL: {{base_url}}/user/user1' OR '1'='1
```

Expected Status: `400` or `404`

```javascript
pm.test("SQL injection in path does not return data", () => {
    pm.expect(pm.response.code).to.be.oneOf([400, 404])
})
pm.test("Server does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

#### TC-U-016 — Username with special characters

```
URL: {{base_url}}/user/user@name!
```

Expected Status: `400` or `404` _(document actual — URL encoding may affect behavior)_

---

#### TC-U-017 — Very long username in path (500 chars)

```
URL: {{base_url}}/user/AAAA...(500 As)
```

Expected Status: `400` or `404`

```javascript
pm.test("Oversized path param does not crash", () => {
    pm.expect(pm.response.code).to.not.eql(500)
})
```

---

### DELETE /user/{username}

---

#### TC-U-018 — Valid delete

```
Method:  DELETE
URL:     {{base_url}}/user/{{created_username}}
```

Expected Status: `200`

---

#### TC-U-019 — Delete already-deleted user (idempotency)

Send the same delete again.

Expected Status: `404`

```javascript
pm.test("Second delete returns 404, not 500", () => {
    pm.response.to.have.status(404)
})
```

---

#### TC-U-020 — Delete non-existent username

```
URL: {{base_url}}/user/ghost_user_xyz
```

Expected Status: `404`

---

---

## Summary Table

| TC ID | Endpoint | Category | Expected Status |
| --- | --- | --- | --- |
| TC-S-001 | GET /pet/1 | Smoke — server reachable | < 500 |
| TC-S-002 | GET /pet/1 | Smoke — JSON response | 200 |
| TC-P-001 | POST /pet | Happy path | 200 |
| TC-P-002 | POST /pet | Minimal required fields only | 200 |
| TC-P-003 | POST /pet | Missing required: name | 400/405 |
| TC-P-004 | POST /pet | Missing required: photoUrls | 400/405 |
| TC-P-005 | POST /pet | Empty photoUrls array | Document |
| TC-P-006 | POST /pet | Invalid status enum | 400/405 |
| TC-P-007 | POST /pet | No auth token | 401/403 |
| TC-P-008 | POST /pet | Invalid API key | 401/403 |
| TC-P-009 | POST /pet | Malformed API key | 400/401 |
| TC-P-010 | POST /pet | Extra unknown keys in body | 200, not reflected |
| TC-P-011 | POST /pet | Wrong type: name as integer | 400/405 |
| TC-P-012 | POST /pet | Wrong type: id as string | 400/405 |
| TC-P-013 | POST /pet | Null for required field | 400/405 |
| TC-P-014 | POST /pet | Wrong Content-Type | 400/415 |
| TC-P-015 | POST /pet | 500-char name | Not 500 |
| TC-P-016 | GET /pet/{id} | Valid fetch + response schema | 200 |
| TC-P-017 | GET /pet/{id} | Non-existent ID | 404 |
| TC-P-018 | GET /pet/{id} | petId = 0 | 400/404 |
| TC-P-019 | GET /pet/{id} | Negative petId | 400 |
| TC-P-020 | GET /pet/{id} | String petId ("abc") | 400 |
| TC-P-021 | GET /pet/{id} | SQL injection in petId | 400/404 |
| TC-P-022 | GET /pet/{id} | No API key | Document |
| TC-P-023 | PUT /pet | Valid update | 200 |
| TC-P-024 | PUT /pet | Non-existent pet ID | 404 |
| TC-P-025 | PUT /pet | Negative ID | 400 |
| TC-P-026 | PUT /pet | Extra keys — mass assignment | 200, not reflected |
| TC-P-027 | DELETE /pet/{id} | Valid delete | 200 |
| TC-P-028 | DELETE /pet/{id} | Delete already-deleted (idempotency) | 404 |
| TC-P-029 | DELETE /pet/{id} | No auth | 401/403 |
| TC-P-030 | DELETE /pet/{id} | String petId | 400 |
| TC-P-031 | GET /findByStatus | Valid status filter | 200 |
| TC-P-032 | GET /findByStatus | Multiple statuses | 200 |
| TC-P-033 | GET /findByStatus | Invalid enum value | 400 |
| TC-P-034 | GET /findByStatus | Missing status param | 400 |
| TC-P-035 | GET /findByStatus | SQL injection in query param | Not 500 |
| TC-P-036 | GET /findByStatus | Mix valid + invalid status | Document |
| TC-ST-001 | GET /store/inventory | Valid fetch + type check | 200 |
| TC-ST-002 | GET /store/inventory | No API key | Document |
| TC-ST-003 | POST /store/order | Valid order | 200 |
| TC-ST-004 | POST /store/order | Invalid status enum | 400 |
| TC-ST-005 | POST /store/order | Negative quantity | 400 |
| TC-ST-006 | POST /store/order | Zero quantity | 400 |
| TC-ST-007 | POST /store/order | Invalid date format | 400 |
| TC-ST-008 | POST /store/order | Extra keys | 200, not reflected |
| TC-ST-009 | POST /store/order | Duplicate order ID | 400/409 |
| TC-ST-010 | POST /store/order | Missing petId | 400 |
| TC-ST-011 | GET /store/order/{id} | Boundary: id = 1 | 200/404 |
| TC-ST-012 | GET /store/order/{id} | Boundary: id = 10 | 200/404 |
| TC-ST-013 | GET /store/order/{id} | id = 11 (above max) | 400 |
| TC-ST-014 | GET /store/order/{id} | id = 0 (below min) | 400 |
| TC-ST-015 | GET /store/order/{id} | Negative id | 400 |
| TC-ST-016 | GET /store/order/{id} | String id | 400 |
| TC-ST-017 | GET /store/order/{id} | SQL injection | Not 500 |
| TC-ST-018 | DELETE /store/order/{id} | Valid delete | 200 |
| TC-ST-019 | DELETE /store/order/{id} | Non-existent order | 404 |
| TC-ST-020 | DELETE /store/order/{id} | Negative id | 400 |
| TC-U-001 | POST /user | Happy path | 200 |
| TC-U-002 | POST /user | Extra keys — mass assignment | 200, not reflected |
| TC-U-003 | POST /user | Wrong type: userStatus as string | 400 |
| TC-U-004 | POST /user | SQL injection in username | Not 500 |
| TC-U-005 | POST /user | Empty body | 400 |
| TC-U-006 | GET /user/login | Valid login + header validation | 200 |
| TC-U-007 | GET /user/login | Wrong password + generic error | 400 |
| TC-U-008 | GET /user/login | Missing username param | 400 |
| TC-U-009 | GET /user/login | Missing password param | 400 |
| TC-U-010 | GET /user/login | SQL injection in username | Not 200 |
| TC-U-011 | GET /user/login | Special chars in password | Not 500 |
| TC-U-012 | GET /user/login | 500-char username | Not 500 |
| TC-U-013 | GET /user/{username} | Valid + password not in response | 200 |
| TC-U-014 | GET /user/{username} | Non-existent user | 404 |
| TC-U-015 | GET /user/{username} | SQL injection in path | Not 500 |
| TC-U-016 | GET /user/{username} | Special chars in path | Document |
| TC-U-017 | GET /user/{username} | 500-char username | Not 500 |
| TC-U-018 | DELETE /user/{username} | Valid delete | 200 |
| TC-U-019 | DELETE /user/{username} | Delete already-deleted (idempotency) | 404 |
| TC-U-020 | DELETE /user/{username} | Non-existent user | 404 |

**Total: 72 test cases**

---

## Key Patterns to Remember

| Pattern | What to Check | Why |
| --- | --- | --- |
| Extra keys in body | Not reflected back in response | Mass assignment attack prevention |
| SQL injection | Server returns 400/404, never 500 | Unhandled exception = vulnerable query |
| Wrong data type | 400 returned, not silent coercion | Silent coercion stores garbage data |
| Password in GET response | Must not appear | Plaintext credentials exposed |
| Generic error on bad login | "Invalid credentials", not "user not found" | Username enumeration prevention |
| Delete twice | Second returns 404, not 500 | Idempotency and crash safety |
| Boundary values | Min-1, min, max, max+1 | Off-by-one bugs in range validation |
| Malformed auth token | 400 or 401, never 500 | Input not sanitized before parsing |
