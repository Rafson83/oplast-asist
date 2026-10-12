import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'oplast_asist.db');

// Simply remove the file if it exists so Next.js re-runs seedInitialData automatically, or trigger reseed
import fs from 'fs';
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Old database file removed:', dbPath);
}
console.log('Ready for auto-init on next request!');
