const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

// Load Wasm synchronously
const wasmPath = path.join(require.resolve('sql.js'), '..', 'sql-wasm.wasm');
const wasmBinary = fs.readFileSync(wasmPath);

let db;

// We initialize sql.js using a Promise, but because wasmBinary is loaded locally,
// the callback runs synchronously within the same event loop tick.
let initialized = false;
const readyPromise = initSqlJs({ wasmBinary }).then(SQL => {
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
        // Initialize schema
        try {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            db.run(schemaSql);
            saveDb();
            console.log('Database schema loaded successfully.');
        } catch (error) {
            console.error('Error loading database schema:', error);
        }
    }
    initialized = true;

    // Check if seeding is needed (e.g. if category count is 0)
    const categoriesCount = queryOne('SELECT COUNT(*) as count FROM categories');
    if (!categoriesCount || categoriesCount.count === 0) {
        console.log('Database empty. Running seed script...');
        try {
            const seed = require('./seed');
            seed.runSeed({ query, queryOne, run });
            console.log('Database seeding completed.');
        } catch (error) {
            console.error('Database seeding failed:', error);
        }
    }
});

function saveDb() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

// Function to query all rows
function query(sql, params = []) {
    if (!db) throw new Error('Database is not initialized yet.');
    try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error(`Database Query Error [${sql}]:`, error);
        throw error;
    }
}

// Function to query a single row
// Note: sql.js does not automatically cast numbers from query binding.
function queryOne(sql, params = []) {
    if (!db) throw new Error('Database is not initialized yet.');
    try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const hasRow = stmt.step();
        let result = null;
        if (hasRow) {
            result = stmt.getAsObject();
        }
        stmt.free();
        return result;
    } catch (error) {
        console.error(`Database QueryOne Error [${sql}]:`, error);
        throw error;
    }
}

// Function to execute insert/update/delete
function run(sql, params = []) {
    if (!db) throw new Error('Database is not initialized yet.');
    try {
        db.run(sql, params);
        saveDb();

        // Find changes and lastInsertRowid to match Node.js DatabaseSync/better-sqlite3 return values
        const lastIdRes = queryOne('SELECT last_insert_rowid() as id');
        const changesRes = queryOne('SELECT changes() as count');
        return {
            lastInsertRowid: lastIdRes ? lastIdRes.id : null,
            changes: changesRes ? changesRes.count : 0
        };
    } catch (error) {
        console.error(`Database Run Error [${sql}]:`, error);
        throw error;
    }
}

module.exports = {
    query,
    queryOne,
    run,
    readyPromise  // ✅ Exported so server.js can await DB before accepting requests
};

