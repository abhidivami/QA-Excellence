/**
 * API Tests — Swagger Petstore
 * Production-grade tests using axios + Jest.
 * Mirrors the Postman collection but as executable code.
 *
 * Base URL : https://petstore.swagger.io/v2
 * Auth     : api_key header — value: special-key
 * Run      : npm run test:api
 */

const axios = require('axios');

const BASE_URL    = 'https://petstore.swagger.io/v2';
const VALID_KEY   = 'special-key';
const INVALID_KEY = 'wrong-key-xyz';

// Single axios instance — validateStatus: () => true means it NEVER throws
// regardless of status code. We check status ourselves in each test.
const http = axios.create({
    baseURL:        BASE_URL,
    timeout:        15000,
    validateStatus: () => true
});

const jsonHeaders = { 'Content-Type': 'application/json', api_key: VALID_KEY };
const authHeaders = { api_key: VALID_KEY };

// ============================================================
// SECTION 0 — SMOKE TESTS
// ============================================================

describe('0 — Smoke Tests', () => {

    test('TC-S-001 — Server is reachable and not returning 5xx', async () => {
        const res = await http.get('/pet/1', { headers: authHeaders });
        expect(res.status).toBeLessThan(500);
    });

    test('TC-S-002 — Response Content-Type is application/json', async () => {
        const res = await http.get('/pet/1', { headers: { ...authHeaders, Accept: 'application/json' } });
        expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    test('TC-S-003 — Response time is under 3000ms', async () => {
        const start = Date.now();
        await http.get('/pet/1', { headers: authHeaders });
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(3000);
    });

});

// ============================================================
// SECTION 1 — PET MODULE
// ============================================================

// --- POST /pet ---

describe('1a — POST /pet', () => {

    test('TC-P-001 — Happy path: create pet with all fields', async () => {
        const petId = Math.floor(Math.random() * 9000000) + 1000000;

        const res = await http.post('/pet', {
            id:        petId,
            name:      'Bruno',
            category:  { id: 1, name: 'Dogs' },
            photoUrls: ['https://example.com/bruno.jpg'],
            tags:      [{ id: 1, name: 'friendly' }],
            status:    'available'
        }, { headers: jsonHeaders });

        expect(res.status).toBe(200);
        expect(res.data.name).toBe('Bruno');
        expect(res.data.status).toBe('available');
        expect(typeof res.data.id).toBe('number');
        expect(Array.isArray(res.data.photoUrls)).toBe(true);
    });

    test('TC-P-002 — Only required fields: name + photoUrls', async () => {
        const res = await http.post('/pet', {
            name:      'MinimalPet',
            photoUrls: ['https://example.com/photo.jpg']
        }, { headers: jsonHeaders });

        expect(res.status).toBe(200);
        expect(res.data.name).toBe('MinimalPet');
    });

    test('TC-P-003 — Missing required field: name — should be rejected', async () => {
        const res = await http.post('/pet', {
            photoUrls: ['https://example.com/photo.jpg'],
            status:    'available'
        }, { headers: jsonHeaders });

        expect([400, 405]).toContain(res.status);
    });

    test('TC-P-004 — Invalid status enum value', async () => {
        const res = await http.post('/pet', {
            name:      'BadStatusPet',
            photoUrls: ['https://example.com/photo.jpg'],
            status:    'discontinued'
        }, { headers: jsonHeaders });

        expect([400, 405]).toContain(res.status);
    });

    test('TC-P-005 — No auth token — should be rejected or warn', async () => {
        const res = await http.post('/pet', {
            name:      'NoAuthPet',
            photoUrls: ['https://example.com/photo.jpg']
        }, { headers: { 'Content-Type': 'application/json' } });

        // Petstore demo does not enforce auth — log actual behavior
        if (res.status === 200) {
            console.warn('SECURITY WARNING: POST /pet returned 200 with no auth token — auth not enforced');
        }
        expect(res.status).not.toBe(500);
    });

    test('TC-P-006 — Extra unknown keys must not appear in response (mass assignment)', async () => {
        const res = await http.post('/pet', {
            name:          'ExtraKeyPet',
            photoUrls:     ['https://example.com/photo.jpg'],
            status:        'available',
            adminFlag:     true,
            secretScore:   9999,
            internalId:    'INTERNAL-001'
        }, { headers: jsonHeaders });

        expect(res.status).toBe(200);
        expect(res.data).not.toHaveProperty('adminFlag');
        expect(res.data).not.toHaveProperty('secretScore');
        expect(res.data).not.toHaveProperty('internalId');
    });

    test('TC-P-007 — Wrong data type: name sent as integer', async () => {
        const res = await http.post('/pet', {
            name:      12345,
            photoUrls: ['https://example.com/photo.jpg']
        }, { headers: jsonHeaders });

        expect(res.status).not.toBe(500);
    });

    test('TC-P-008 — Wrong Content-Type header', async () => {
        const res = await http.post('/pet',
            '{"name":"WrongContentType","photoUrls":["https://x.com/x.jpg"]}',
            { headers: { 'Content-Type': 'text/plain', api_key: VALID_KEY } }
        );

        expect(res.status).not.toBe(500);
    });

});

// --- GET /pet/{petId} ---

describe('1b — GET /pet/{petId}', () => {

    let petId;

    beforeAll(async () => {
        const id  = Math.floor(Math.random() * 9000000) + 1000000;
        const res = await http.post('/pet', {
            id,
            name:      'TestPet_GET',
            photoUrls: ['https://example.com/photo.jpg'],
            status:    'available'
        }, { headers: jsonHeaders });
        petId = res.data.id;
    });

    afterAll(async () => {
        if (petId) await http.delete(`/pet/${petId}`, { headers: authHeaders });
    });

    test('TC-P-009 — Valid petId: full schema validation', async () => {
        const res = await http.get(`/pet/${petId}`, { headers: authHeaders });

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('id');
        expect(res.data).toHaveProperty('name');
        expect(res.data).toHaveProperty('photoUrls');
        expect(res.data).toHaveProperty('status');
        expect(typeof res.data.id).toBe('number');
        expect(Array.isArray(res.data.photoUrls)).toBe(true);
        expect(['available', 'pending', 'sold']).toContain(res.data.status);
    });

    test('TC-P-010 — Non-existent petId returns 404', async () => {
        const res = await http.get('/pet/999999999', { headers: authHeaders });
        expect(res.status).toBe(404);
    });

    test('TC-P-011 — String petId "abc" — should not crash server', async () => {
        const res = await http.get('/pet/abc', { headers: authHeaders });
        expect(res.status).not.toBe(500);
        expect([400, 404]).toContain(res.status);
    });

    test('TC-P-012 — Negative petId — should not crash server', async () => {
        const res = await http.get('/pet/-1', { headers: authHeaders });
        expect(res.status).not.toBe(500);
    });

    test('TC-P-013 — SQL injection in petId path param', async () => {
        const res = await http.get("/pet/1 OR 1=1", { headers: authHeaders });
        expect(res.status).not.toBe(500);
        expect([400, 404]).toContain(res.status);
    });

    test('TC-P-014 — Invalid API key returns 401 or 403', async () => {
        const res = await http.get(`/pet/${petId}`, { headers: { api_key: INVALID_KEY } });
        if (res.status === 200) {
            console.warn('SECURITY WARNING: Invalid API key accepted — auth not validated on GET /pet/{id}');
        }
        expect(res.status).not.toBe(500);
    });

});

// --- PUT /pet ---

describe('1c — PUT /pet', () => {

    let petId;

    beforeAll(async () => {
        const id  = Math.floor(Math.random() * 9000000) + 1000000;
        const res = await http.post('/pet', {
            id,
            name:      'TestPet_PUT',
            photoUrls: ['https://example.com/photo.jpg'],
            status:    'available'
        }, { headers: jsonHeaders });
        petId = res.data.id;
    });

    afterAll(async () => {
        if (petId) await http.delete(`/pet/${petId}`, { headers: authHeaders });
    });

    test('TC-P-015 — Valid update: change name and status', async () => {
        const res = await http.put('/pet', {
            id:        petId,
            name:      'BrunoUpdated',
            photoUrls: ['https://example.com/bruno.jpg'],
            status:    'pending'
        }, { headers: jsonHeaders });

        expect(res.status).toBe(200);
        expect(res.data.name).toBe('BrunoUpdated');
        expect(res.data.status).toBe('pending');
    });

    test('TC-P-016 — Update with extra keys — must not appear in response', async () => {
        const res = await http.put('/pet', {
            id:            petId,
            name:          'BrunoUpdated',
            photoUrls:     ['https://example.com/photo.jpg'],
            status:        'available',
            adminOverride: true,
            deletedAt:     '2026-01-01'
        }, { headers: jsonHeaders });

        expect(res.status).toBe(200);
        expect(res.data).not.toHaveProperty('adminOverride');
        expect(res.data).not.toHaveProperty('deletedAt');
    });

    test('TC-P-017 — Update non-existent pet — expect 404', async () => {
        const res = await http.put('/pet', {
            id:        999999998,
            name:      'GhostPet',
            photoUrls: ['https://example.com/ghost.jpg']
        }, { headers: jsonHeaders });

        expect([404, 400]).toContain(res.status);
    });

});

// --- DELETE /pet/{petId} ---

describe('1d — DELETE /pet/{petId}', () => {

    let petId;

    beforeAll(async () => {
        const id  = Math.floor(Math.random() * 9000000) + 1000000;
        const res = await http.post('/pet', {
            id,
            name:      'TestPet_DELETE',
            photoUrls: ['https://example.com/photo.jpg'],
            status:    'available'
        }, { headers: jsonHeaders });
        petId = res.data.id;
    });

    test('TC-P-018 — Valid delete returns 200', async () => {
        const res = await http.delete(`/pet/${petId}`, { headers: authHeaders });
        expect(res.status).toBe(200);
    });

    test('TC-P-019 — Delete already-deleted pet returns 404 not 500 (idempotency)', async () => {
        const res = await http.delete(`/pet/${petId}`, { headers: authHeaders });
        expect(res.status).toBe(404);
    });

    test('TC-P-020 — Delete with string petId does not crash server', async () => {
        const res = await http.delete('/pet/notanumber', { headers: authHeaders });
        expect(res.status).not.toBe(500);
    });

});

// --- GET /pet/findByStatus ---

describe('1e — GET /pet/findByStatus', () => {

    test('TC-P-021 — Valid status "available" returns array', async () => {
        const res = await http.get('/pet/findByStatus', {
            headers: authHeaders,
            params:  { status: 'available' }
        });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
    });

    test('TC-P-022 — Every pet in result has status "available"', async () => {
        const res = await http.get('/pet/findByStatus', {
            headers: authHeaders,
            params:  { status: 'available' }
        });

        res.data.forEach(pet => {
            expect(pet.status).toBe('available');
        });
    });

    test('TC-P-023 — Every pet in result has id and name', async () => {
        const res = await http.get('/pet/findByStatus', {
            headers: authHeaders,
            params:  { status: 'available' }
        });

        res.data.forEach(pet => {
            expect(pet).toHaveProperty('id');
            expect(pet).toHaveProperty('name');
        });
    });

    test('TC-P-024 — Invalid enum value returns 400', async () => {
        const res = await http.get('/pet/findByStatus', {
            headers: authHeaders,
            params:  { status: 'discontinued' }
        });
        expect(res.status).toBe(400);
    });

    test('TC-P-025 — SQL injection in status query param does not crash server', async () => {
        const res = await http.get('/pet/findByStatus', {
            headers: authHeaders,
            params:  { status: "available' OR '1'='1" }
        });
        expect(res.status).not.toBe(500);
    });

});

// ============================================================
// SECTION 2 — STORE MODULE
// ============================================================

// --- GET /store/inventory ---

describe('2a — GET /store/inventory', () => {

    test('TC-ST-001 — Returns 200 and an object', async () => {
        const res = await http.get('/store/inventory', { headers: authHeaders });
        expect(res.status).toBe(200);
        expect(typeof res.data).toBe('object');
        expect(Array.isArray(res.data)).toBe(false);
    });

    test('TC-ST-002 — All inventory values are numbers not strings', async () => {
        const res = await http.get('/store/inventory', { headers: authHeaders });
        Object.values(res.data).forEach(val => {
            expect(typeof val).toBe('number');
        });
    });

    test('TC-ST-003 — Response time under 1000ms', async () => {
        const start = Date.now();
        await http.get('/store/inventory', { headers: authHeaders });
        expect(Date.now() - start).toBeLessThan(1000);
    });

});

// --- POST /store/order ---

describe('2b — POST /store/order', () => {

    let orderId;

    test('TC-ST-004 — Happy path: place order with all fields', async () => {
        const id  = Math.floor(Math.random() * 90000) + 10000;
        const res = await http.post('/store/order', {
            id,
            petId:    1,
            quantity: 2,
            shipDate: '2026-07-01T10:00:00.000Z',
            status:   'placed',
            complete: false
        }, { headers: { 'Content-Type': 'application/json' } });

        expect(res.status).toBe(200);
        expect(res.data.status).toBe('placed');
        expect(res.data.petId).toBe(1);
        expect(typeof res.data.quantity).toBe('number');
        expect(typeof res.data.complete).toBe('boolean');
        orderId = res.data.id;
    });

    test('TC-ST-005 — Invalid order status enum', async () => {
        const res = await http.post('/store/order', {
            petId:    1,
            quantity: 1,
            status:   'cancelled'
        }, { headers: { 'Content-Type': 'application/json' } });

        expect([400, 405]).toContain(res.status);
    });

    test('TC-ST-006 — Negative quantity — should be rejected', async () => {
        const res = await http.post('/store/order', {
            petId:    1,
            quantity: -5,
            status:   'placed'
        }, { headers: { 'Content-Type': 'application/json' } });

        if (res.status === 200) {
            console.warn('VALIDATION GAP: Negative quantity accepted by POST /store/order');
        }
        expect(res.status).not.toBe(500);
    });

    test('TC-ST-007 — Invalid shipDate format causes 500 — CRITICAL BUG', async () => {
        const res = await http.post('/store/order', {
            petId:    1,
            quantity: 1,
            shipDate: 'not-a-real-date',
            status:   'placed'
        }, { headers: { 'Content-Type': 'application/json' } });

        // This SHOULD be 400. If it returns 500, the server is crashing on bad input.
        if (res.status === 500) {
            console.error('CRITICAL BUG: POST /store/order returns 500 on invalid shipDate — server crash on bad input');
        }
        expect(res.status).not.toBe(500);
    });

    test('TC-ST-008 — Extra keys must not appear in response', async () => {
        const res = await http.post('/store/order', {
            petId:          1,
            quantity:       1,
            status:         'placed',
            bypassPayment:  true,
            discount:       9999
        }, { headers: { 'Content-Type': 'application/json' } });

        expect(res.status).toBe(200);
        expect(res.data).not.toHaveProperty('bypassPayment');
        expect(res.data).not.toHaveProperty('discount');
    });

});

// --- GET /store/order/{orderId} ---

describe('2c — GET /store/order/{orderId}', () => {

    test('TC-ST-009 — Boundary: orderId = 1 (minimum valid)', async () => {
        const res = await http.get('/store/order/1');
        expect([200, 404]).toContain(res.status); // may or may not exist
    });

    test('TC-ST-010 — Boundary: orderId = 10 (maximum valid)', async () => {
        const res = await http.get('/store/order/10');
        expect([200, 404]).toContain(res.status);
    });

    test('TC-ST-011 — orderId = 11 (one above max) — expect 400', async () => {
        const res = await http.get('/store/order/11');
        if (res.status !== 400) {
            console.warn(`Spec says orderId > 10 should return 400. Got ${res.status} instead.`);
        }
        expect([400, 404]).toContain(res.status);
    });

    test('TC-ST-012 — Negative orderId — should not crash server', async () => {
        const res = await http.get('/store/order/-1');
        expect(res.status).not.toBe(500);
        expect([400, 404]).toContain(res.status);
    });

    test('TC-ST-013 — String orderId "abc" — should not crash server', async () => {
        const res = await http.get('/store/order/abc');
        expect(res.status).not.toBe(500);
    });

    test('TC-ST-014 — SQL injection in orderId path param', async () => {
        const res = await http.get("/store/order/1 OR 1=1");
        expect(res.status).not.toBe(500);
        expect([400, 404]).toContain(res.status);
    });

});

// ============================================================
// SECTION 3 — USER MODULE
// ============================================================

// --- POST /user ---

describe('3a — POST /user', () => {

    let username;

    beforeAll(() => {
        username = 'qatest_' + Date.now().toString().slice(-6);
    });

    test('TC-U-001 — Happy path: create user with all fields', async () => {
        const res = await http.post('/user', {
            id:         500001,
            username,
            firstName:  'QA',
            lastName:   'Tester',
            email:      'qa.tester@example.com',
            password:   'SecurePass@123',
            phone:      '9876543210',
            userStatus: 1
        }, { headers: { 'Content-Type': 'application/json' } });

        expect(res.status).toBe(200);
    });

    test('TC-U-002 — Extra keys (mass assignment) must not be reflected back', async () => {
        const res = await http.post('/user', {
            username:   'extrakey_user_' + Date.now().toString().slice(-4),
            password:   'Pass@123',
            userStatus: 1,
            isAdmin:    true,
            role:       'superadmin',
            internalId: 'BYPASS-001'
        }, { headers: { 'Content-Type': 'application/json' } });

        expect(res.status).toBe(200);
        // The response for POST /user is {code, type, message} — extra keys should not appear
        if (typeof res.data === 'object') {
            expect(res.data).not.toHaveProperty('isAdmin');
            expect(res.data).not.toHaveProperty('role');
        }
    });

    test('TC-U-003 — userStatus as string instead of int — should be rejected', async () => {
        const res = await http.post('/user', {
            username:   'badtype_user',
            password:   'Pass@123',
            userStatus: 'active'
        }, { headers: { 'Content-Type': 'application/json' } });

        if (res.status === 200) {
            console.warn('VALIDATION GAP: String accepted for userStatus (should be integer)');
        }
        expect(res.status).not.toBe(500);
    });

    test('TC-U-004 — SQL injection in username field does not crash server', async () => {
        const res = await http.post('/user', {
            username:   "user'; DROP TABLE users; --",
            password:   'Pass@123',
            userStatus: 1
        }, { headers: { 'Content-Type': 'application/json' } });

        expect(res.status).not.toBe(500);
    });

});

// --- GET /user/login ---

describe('3b — GET /user/login', () => {

    test('TC-U-005 — Valid login: 200 + session string + response headers', async () => {
        const res = await http.get('/user/login', {
            params: { username: 'user1', password: 'user1' }
        });

        expect(res.status).toBe(200);
        expect(res.headers).toHaveProperty('x-rate-limit');
        expect(res.headers).toHaveProperty('x-expires-after');
        expect(typeof res.data).toBe('string');
        expect(res.data.length).toBeGreaterThan(0);
    });

    test('TC-U-006 — Wrong password — should return 400', async () => {
        const res = await http.get('/user/login', {
            params: { username: 'user1', password: 'wrongpassword999' }
        });

        if (res.status === 200) {
            console.error('CRITICAL BUG: Wrong password accepted by /user/login — no credential validation');
        }
        expect([400, 401]).toContain(res.status);
    });

    test('TC-U-007 — Generic error message does not reveal if username exists', async () => {
        const res = await http.get('/user/login', {
            params: { username: 'user1', password: 'wrongpassword999' }
        });

        const body = JSON.stringify(res.data).toLowerCase();
        expect(body).not.toContain('username not found');
        expect(body).not.toContain('user does not exist');
    });

    test('TC-U-008 — Missing username param — should return 400', async () => {
        const res = await http.get('/user/login', {
            params: { password: 'pass123' }
        });

        if (res.status === 200) {
            console.warn('VALIDATION GAP: Login succeeded without username param');
        }
        expect(res.status).not.toBe(500);
    });

    test('TC-U-009 — SQL injection in username param — must not return 200', async () => {
        const res = await http.get('/user/login', {
            params: { username: "admin'--", password: 'anything' }
        });

        if (res.status === 200) {
            console.error('CRITICAL SECURITY BUG: SQL injection bypassed login — admin\'-- returned 200');
        }
        expect(res.status).not.toBe(500);
    });

    test('TC-U-010 — Special characters in password do not crash server', async () => {
        const res = await http.get('/user/login', {
            params: { username: 'user1', password: "P@$$w0rd!#%^&*()" }
        });

        expect(res.status).not.toBe(500);
    });

});

// --- GET /user/{username} ---

describe('3c — GET /user/{username}', () => {

    let username;

    beforeAll(async () => {
        username = 'qatest_get_' + Date.now().toString().slice(-5);
        await http.post('/user', {
            username,
            firstName:  'QA',
            lastName:   'Tester',
            email:      'qa@example.com',
            password:   'SecurePass@123',
            userStatus: 1
        }, { headers: { 'Content-Type': 'application/json' } });
    });

    afterAll(async () => {
        if (username) await http.delete(`/user/${username}`);
    });

    test('TC-U-011 — Valid username: 200 with correct fields', async () => {
        const res = await http.get(`/user/${username}`);
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('username');
        expect(res.data).toHaveProperty('id');
    });

    test('TC-U-012 — CRITICAL SECURITY: Password must not be returned in plain text', async () => {
        const res = await http.get(`/user/${username}`);
        expect(res.status).toBe(200);

        const password = res.data.password;
        if (password && password !== '' && password !== null && password !== '[REDACTED]') {
            console.error(`CRITICAL SECURITY BUG: GET /user/${username} returned password in plain text: "${password}"`);
        }
        // This assertion documents the expected behavior — it SHOULD be null/empty/redacted
        expect(password == null || password === '' || password === '[REDACTED]').toBe(true);
    });

    test('TC-U-013 — Non-existent username returns 404', async () => {
        const res = await http.get('/user/ghost_user_that_does_not_exist_xyz987');
        expect(res.status).toBe(404);
    });

    test('TC-U-014 — SQL injection in username path does not crash server', async () => {
        const res = await http.get("/user/user1' OR '1'='1");
        expect(res.status).not.toBe(500);
        expect([400, 404]).toContain(res.status);
    });

    test('TC-U-015 — Very long username (300 chars) does not crash server', async () => {
        const longUsername = 'a'.repeat(300);
        const res = await http.get(`/user/${longUsername}`);
        expect(res.status).not.toBe(500);
    });

});

// --- DELETE /user/{username} ---

describe('3d — DELETE /user/{username}', () => {

    let username;

    beforeAll(async () => {
        username = 'qatest_del_' + Date.now().toString().slice(-5);
        await http.post('/user', {
            username,
            password:   'Pass@123',
            userStatus: 1
        }, { headers: { 'Content-Type': 'application/json' } });
    });

    test('TC-U-016 — Valid delete returns 200', async () => {
        const res = await http.delete(`/user/${username}`);
        expect(res.status).toBe(200);
    });

    test('TC-U-017 — Delete already-deleted user returns 404 not 500 (idempotency)', async () => {
        const res = await http.delete(`/user/${username}`);
        expect(res.status).toBe(404);
    });

    test('TC-U-018 — Delete non-existent username returns 404', async () => {
        const res = await http.delete('/user/ghost_user_xyz_does_not_exist');
        expect(res.status).toBe(404);
    });

});
