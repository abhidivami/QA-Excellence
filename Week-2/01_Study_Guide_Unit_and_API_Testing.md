# Study Guide — Unit Testing & API Testing

**Week:** 2  
**Date:** 2026-05-16  
**Topics:** Unit Testing, API Testing

---

## Part 1: Unit Testing

### What it is

Testing the smallest piece of code — one function — in complete isolation. Nothing else. Just that one function.

---

### The Analogy

Think of building a car. Before you assemble the whole car, you test each individual part separately — does this brake pad grip correctly? Does this engine piston fire correctly? You don't put the whole car together and then drive it to find out if the brake pad works. That's unit testing. You test the part, not the whole car.

---

### What "Isolation" Actually Means

When you test a function, you don't want it talking to a database, calling another API, sending emails, or depending on another function. You want to run it alone. If it fails, you know exactly why — because of that function. Not because the database was down. Not because another function had a bug.

This is why unit tests are the fastest tests — no network, no database, just code running in memory.

---

### What You Actually Test

Given an input → you check the output.

```javascript
function calculateTax(amount, rate) {
    return amount * rate / 100
}
```

Tests you'd write:
- `calculateTax(100, 18)` → should return `18`
- `calculateTax(0, 18)` → should return `0`
- `calculateTax(100, 0)` → should return `0`
- `calculateTax(-100, 18)` → should return `-18` or throw an error?
- `calculateTax("abc", 18)` → what happens with invalid input?

You're covering positive cases, zero edge cases, negative inputs, and invalid inputs — same mindset as QA test cases, but at the code level.

---

### The FIRST Principle

Good unit tests are:

| Letter | Stands For | What It Means |
| --- | --- | --- |
| F | Fast | Run in milliseconds — hundreds can run in seconds |
| I | Isolated | Don't depend on other tests or external systems |
| R | Repeatable | Same result every single time, any environment |
| S | Self-validating | Pass or fail automatically — no human reads logs |
| T | Timely | Written alongside the code, not months later |

---

### Who Writes Them

Primarily developers. As a QA engineer you review them, check if important scenarios are missing, and track code coverage — what percentage of the codebase is actually being tested.

---

### Tools by Language

| Language | Tool |
| --- | --- |
| JavaScript | Jest, Mocha |
| Python | PyTest, unittest |
| Java | JUnit |
| C# | NUnit, xUnit |

---

---

## Part 2: API Testing

### What it is

You test the backend directly — without touching the UI. You send a request, you check the response.

---

### The Analogy

A restaurant has a kitchen (backend) and a waiter (UI). Most people order through the waiter. But you can walk straight into the kitchen, place your order directly, and check if the food coming out is correct — right ingredients, right quantity, right temperature. API testing is walking into the kitchen. You bypass the waiter completely.

This matters because bugs can exist in the kitchen even when the waiter looks perfectly fine.

---

### How APIs Work — The Basics

Every API call has two parts:

**Request — what you send:**
- **URL** — the address of what you're calling. Example: `POST /api/invoices`
- **Method** — what action you want to perform
- **Headers** — extra info like your auth token and content type
- **Body** — the data you're sending (for POST and PUT requests)

**Response — what you get back:**
- **Status Code** — tells you what happened
- **Body** — the actual data returned, usually in JSON format

---

### HTTP Methods

| Method | What It Does | Example |
| --- | --- | --- |
| GET | Fetch data | Get a list of invoices |
| POST | Create something new | Submit a new invoice |
| PUT | Update something | Edit an existing invoice |
| DELETE | Remove something | Delete a draft invoice |

---

### Status Codes You Must Know

| Code | Meaning | When You See It |
| --- | --- | --- |
| 200 | OK | Request succeeded, data returned |
| 201 | Created | New record created successfully |
| 400 | Bad Request | You sent wrong or missing data |
| 401 | Unauthorized | No valid login token sent |
| 403 | Forbidden | Logged in but not allowed to do this |
| 404 | Not Found | The resource doesn't exist |
| 409 | Conflict | Duplicate — record already exists |
| 500 | Internal Server Error | Something broke on the server side |

---

### 401 vs 403 — People Always Mix These Up

**401** = "I don't know who you are." No token, expired token, or wrong token.

**403** = "I know exactly who you are. You're just not allowed to do this."

A vendor hitting an AP-only endpoint gets **403**. An anonymous user hitting any endpoint gets **401**.

---

### What You Test in an API

**1. Happy path**
Send a valid, complete request → check you get 200/201 and the correct data back.

**2. Response structure**
Check that the JSON response has the right fields, right data types, and nothing missing.

```json
{
  "invoiceId": "INV-2026-001",
  "status": "Pending Review",
  "amount": 50000
}
```
Is `invoiceId` a string? Is `amount` a number and not a string? Is `status` one of the expected values?

**3. Authentication**
Call the API without a token → expect 401. Call it with an expired token → expect 401.

**4. Authorization**
Call an AP-only endpoint using a vendor's token → expect 403. The system knows who you are, it just won't let you in.

**5. Input validation**
Send an empty invoice number → expect 400 with a clear error message.
Send a negative amount → expect 400.
Send a non-existent PO number → expect 400 or 404.

**6. Error messages**
A 400 response should tell you *what* is wrong, not just "bad request." "Invoice number is required" is a good error. "Bad request" is useless.

**7. Response time**
A GET request should respond in under 500ms. A file upload under 3 seconds. If it's slower, flag it.

**8. Duplicate handling**
Submit the same invoice twice → expect 409 on the second call. The system should not create two records.

---

### Why API Testing Catches Things UI Testing Misses

The UI might validate that an invoice amount can't be negative. But if that validation only exists on the frontend, a direct API call with a negative amount will go straight through to the database.

API testing finds exactly this — gaps between what the UI enforces and what the backend actually enforces. The UI is just one client. Anyone can call the API directly.

---

### Tool — Postman

The standard tool for API testing. You:
1. Set the method (GET, POST, PUT, DELETE)
2. Enter the URL
3. Add headers — like `Authorization: Bearer <token>` and `Content-Type: application/json`
4. Add a request body in JSON format
5. Hit Send
6. Check the status code and response body

You can save tests as a **collection** — a folder of all your API calls — and run the whole collection at once with one click.

---

### Unit Testing vs API Testing — Side by Side

| | Unit Testing | API Testing |
| --- | --- | --- |
| What you test | One function | One endpoint |
| Who writes it | Developer (QA reviews) | QA / Developer |
| Goes through UI? | No | No |
| Hits a real database? | No — mocked | Yes |
| Speed | Milliseconds | Seconds |
| Finds what kind of bugs? | Logic bugs in functions | Integration bugs, missing validation, auth issues |
| Tool | Jest, PyTest, JUnit | Postman, RestAssured |

---

## Key Takeaways

- Unit tests protect individual functions — they run fast, stay isolated, and give instant feedback when something breaks
- API tests protect the contract between frontend and backend — they verify the backend works correctly regardless of what the UI does
- A bug found at the unit level costs the least to fix
- A bug found only because the UI missed it, but the API didn't validate — that's exactly what API testing is for
- Both together give you deep confidence before the application ever reaches a real user
