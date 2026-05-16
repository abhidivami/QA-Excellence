# Week 2 — Unit Testing & API Testing

This week covers unit testing and API testing — understanding both concepts and applying them through actual runnable test code.

---

## What We Did

We started by learning unit testing and API testing through analogies and examples, then moved into hands-on practice. We wrote real unit tests for Invoice Portal business logic functions, built a production-grade API test suite for the Swagger Petstore API, and ran both against live targets to find actual bugs.

---

## Folder Structure

```
Week-2/
├── 01_Study_Guide_Unit_and_API_Testing.md
├── 02_API_Testing_Concepts.pptx
├── 02_Practical_Exercises.md
├── 03_Petstore_API_Test_Cases.md
└── tests/
    ├── unit/
    │   └── unit_tests.test.js
    ├── api/
    │   ├── api_tests.test.js
    │   └── postman/
    │       ├── petstore_collection.json
    │       └── petstore_environment.json
    ├── results/
    │   └── .gitkeep
    ├── package.json
    ├── run_tests.sh
    └── run_code_tests.sh
```

---

## Files Explained

### Study Material

| File | What it is |
| --- | --- |
| `01_Study_Guide_Unit_and_API_Testing.md` | Theory notes covering unit testing (FIRST principle, mocks, isolation) and API testing (HTTP methods, status codes, 401 vs 403, Postman workflow) |
| `02_API_Testing_Concepts.pptx` | Trainer slides covering REST, Swagger, Postman, Newman, authentication methods, and best practices |
| `02_Practical_Exercises.md` | Written examples with code snippets for unit tests and Postman-style API tests before the actual code was written |
| `03_Petstore_API_Test_Cases.md` | Full test case reference document — 72 test cases for the Petstore API organized by endpoint, with expected inputs, outputs, and Postman assertions |

---

### Test Code

#### `tests/unit/unit_tests.test.js`
Unit tests for the Vendor Invoice Management Portal business logic.
Tests 6 functions in complete isolation — no network, no database, just code running in memory.

Functions tested:
- `validateInvoiceAmount` — amount validation (zero, negative, non-numeric, boundary at max)
- `isValidFileType` — file upload validation (.exe and .bat blocked, case-insensitive)
- `isDuplicateInvoice` — duplicate detection by invoice number
- `hasPermission` — role-based access (AP, Vendor, Admin, unknown role)
- `calculateTax` — tax calculation at boundary values
- `formatInvoiceStatus` — status label formatting including unknowns

**61 tests | runs in under 1 second**

---

#### `tests/api/api_tests.test.js`
API tests for the Swagger Petstore API using axios and Jest.
Hits the real live API and checks status codes, response body structure, field types, headers, and security behavior.

Covers:
- Smoke tests — server reachable, JSON response, response time
- Pet module — create, get, update, delete, findByStatus
- Store module — inventory, place order, get order by ID (boundary values 1–10)
- User module — create, login, get by username, delete

Security tests included:
- No auth token on protected endpoints
- Extra unknown keys in request body (mass assignment check)
- SQL injection in path params and query params
- Password not returned in plain text on GET /user/{username}

**60 tests | runs in ~27 seconds (real HTTP)**

---

#### `tests/api/postman/petstore_collection.json`
The same API tests as `api_tests.test.js` but in Postman collection format.
Can be imported directly into Postman or run via Newman from the terminal.

Contains 39 requests across 4 folders — Smoke, Pet, Store, User.
Each request has pre-request scripts (for dynamic data), test assertions, and request chaining (IDs created in one request are passed into the next).

---

#### `tests/api/postman/petstore_environment.json`
Environment variables for the Postman collection.

| Variable | Value | Purpose |
| --- | --- | --- |
| `base_url` | `https://petstore.swagger.io/v2` | Base URL for all requests |
| `valid_api_key` | `special-key` | Auth key for authenticated requests |
| `invalid_api_key` | `wrong-key-xyz` | Used in security/auth failure tests |
| `created_pet_id` | _(empty)_ | Filled at runtime by pre-request script |
| `created_order_id` | _(empty)_ | Filled at runtime by pre-request script |
| `created_username` | _(empty)_ | Filled at runtime by pre-request script |

---

#### `tests/results/`
Where test reports are saved after each run.

| File type | Committed to GitHub? | Why |
| --- | --- | --- |
| `report_*.html` | Yes — visible on GitHub | Human-readable Newman pass/fail report |
| `run_*.log` | Yes — visible on GitHub | Console output from each Newman run |
| `report_*.json` | No — gitignored | Newman JSON is 2–3 MB, not useful to read online |

The HTML report shows every request, the full response, and which assertions passed or failed. You can view it on GitHub or download and open in a browser for the full styled version.

---

### Runner Scripts

#### `tests/run_tests.sh` — Newman runner (Postman collection)
Runs the Postman collection via Newman and generates an HTML report.

```bash
cd tests
./run_tests.sh
```

Produces `results/report_<timestamp>.html` — open in a browser to see a full pass/fail breakdown with request and response details.

---

#### `tests/run_code_tests.sh` — Jest runner (unit + API)
Runs unit tests and API tests via Jest and saves results as JSON and logs.

```bash
cd tests
./run_code_tests.sh           # run both
./run_code_tests.sh unit      # unit tests only
./run_code_tests.sh api       # api tests only
```

---

## How to Run

### Prerequisites
- Node.js installed (`node --version` to check)

### Setup
```bash
cd Week-2/tests
npm install
```

### Run unit tests
```bash
npm run test:unit
```

### Run API tests (Jest)
```bash
npm run test:api
```

### Run Postman collection (Newman)
```bash
./run_tests.sh
```

---

## Using the Postman Collection in the UI

1. Open Postman
2. Click **Import** → select `tests/api/postman/petstore_collection.json`
3. Click **Import** again → select `tests/api/postman/petstore_environment.json`
4. In the top-right dropdown, select **Petstore — Test Environment**
5. Open the collection → click **Run**

The environment must be selected before running. Without it, all `{{variable}}` references stay unresolved and requests fail.

---

## What the Tests Found

Running both the Postman collection and the Jest API tests against the live Petstore API found 10–11 real bugs:

| Bug | Severity |
| --- | --- |
| `POST /store/order` with invalid date crashes with 500 | Critical |
| `GET /user/{username}` returns password in plain text | Critical |
| Wrong password on login returns 200 — no credential validation | Critical |
| SQL injection in login query param returns 200 — auth bypassed | Critical |
| String value for `userStatus` crashes server with 500 | Critical |
| Login succeeds with missing username param | High |
| Missing required `name` field on POST /pet accepted with 200 | High |
| Invalid `status` enum value on POST /pet accepted with 200 | High |
| No auth token on POST /pet accepted with 200 | Medium |
| `orderId` above max (11) returns 404 instead of spec-documented 400 | Low |

The Petstore is a public demo API — these bugs are intentionally left in so testers can practice finding them. In a real project, each one of these would be a filed bug report.
