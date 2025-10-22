import { getDb } from '../server/db';
import fs from 'fs';

const sql = fs.readFileSync('./scripts/seed-data.sql', 'utf-8');
const statements = sql.split(';').filter(s => s.trim());

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await db.execute(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('✗ Error:', error);
      }
    }
  }
}

seed();
