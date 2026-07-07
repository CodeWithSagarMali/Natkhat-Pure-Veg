// Lightweight API Integration Test Suite for Gourmet Veg Oasis

const assert = require('assert');

const BASE_URL = 'http://localhost:3001';

async function runTests() {
    console.log('🚀 STARTING BACKEND INTEGRATION TESTS...');
    let passed = 0;
    let failed = 0;

    // Test helper
    async function test(name, fn) {
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ FAIL: ${name}`);
            console.error(err);
            failed++;
        }
    }

    // Start Server verification (Mock ping to running server URL)
    await test('Server base ping status check', async () => {
        const res = await fetch(`${BASE_URL}/`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.status, 'online');
    });

    await test('Fetch Categories list from Menu api', async () => {
        const res = await fetch(`${BASE_URL}/api/menu/categories`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(data.length > 0);
        assert.ok(data.some(c => c.name === 'South Indian'));
    });

    await test('Fetch Menu items matching South Indian category', async () => {
        const res = await fetch(`${BASE_URL}/api/menu/items?search=Dosa`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(data.length > 0);
        assert.strictEqual(data[0].name, 'Masala Dosa');
    });

    await test('Invalid auth login rejection check', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'fake@email.com', password: 'wrong' })
        });
        assert.strictEqual(res.status, 401);
        const data = await res.json();
        assert.ok(data.error);
    });

    await test('Successful admin credential login check', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@natkhatveg.com', password: 'admin123' })
        });
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(data.token);
        assert.strictEqual(data.user.role, 'admin');
    });

    console.log(`\n===========================================`);
    console.log(` TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===========================================`);

    if (failed > 0) {
        process.exit(1);
    }
}

// Automatically start if executed directly
if (require.main === module) {
    runTests();
}
