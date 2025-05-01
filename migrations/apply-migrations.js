require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration(migrationPath) {
  console.log(`Applying migration: ${migrationPath}`);
  const sql = fs.readFileSync(path.join(__dirname, migrationPath), 'utf-8');
  
  // Split SQL by statement breakpoints
  const statements = sql.split('--> statement-breakpoint');
  
  // Begin transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log(`Executing: ${trimmedStatement.substring(0, 100)}...`);
        await client.query(trimmedStatement);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Migration applied successfully');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function applyMigrations() {
  try {
    // Apply only the second migration
    await applyMigration('0002_massive_angel.sql');
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

applyMigrations(); 