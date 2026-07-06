const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

// Check if database needs initialization
const dbExists = fs.existsSync(dbPath);

const db = new DatabaseSync(dbPath);

// Initialize schema
try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
    console.log('Database schema loaded successfully.');
} catch (error) {
    console.error('Error loading database schema:', error);
}

// Function to query all rows
function query(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        return stmt.all(...params);
    } catch (error) {
        console.error(`Database Query Error [${sql}]:`, error);
        throw error;
    }
}

// Function to query a single row
function queryOne(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        return stmt.get(...params);
    } catch (error) {
        console.error(`Database QueryOne Error [${sql}]:`, error);
        throw error;
    }
}

// Function to execute insert/update/delete
function run(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        return stmt.run(...params);
    } catch (error) {
        console.error(`Database Run Error [${sql}]:`, error);
        throw error;
    }
}

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

module.exports = {
    db,
    query,
    queryOne,
    run
};
