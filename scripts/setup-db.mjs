import { readFileSync } from "fs";
import { createPool } from "@vercel/postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.POSTGRES_URL) {
  console.error("Missing POSTGRES_URL in .env.local");
  console.error(
    "Pull it from the Vercel dashboard: midnight-satin > Storage > Neon"
  );
  process.exit(1);
}

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

async function run() {
  const action = process.argv[2] || "check";

  if (action === "schema") {
    console.log("Dropping existing tables (clean slate)...");
    await pool.query(`
      DROP TABLE IF EXISTS comment_likes CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS reader_bookmarks CASCADE;
      DROP TABLE IF EXISTS author_follows CASCADE;
      DROP TABLE IF EXISTS chapter_unlocks CASCADE;
      DROP TABLE IF EXISTS credit_transactions CASCADE;
      DROP TABLE IF EXISTS reading_progress CASCADE;
      DROP TABLE IF EXISTS characters CASCADE;
      DROP TABLE IF EXISTS chapters CASCADE;
      DROP TABLE IF EXISTS novels CASCADE;
      DROP TABLE IF EXISTS series CASCADE;
      DROP TABLE IF EXISTS readers CASCADE;
      DROP TABLE IF EXISTS author_profiles CASCADE;
      DROP TABLE IF EXISTS processed_payment_events CASCADE;
    `);
    console.log("  Done.\n");

    console.log("Applying schema.sql...");
    const schema = readFileSync("src/lib/db/schema.sql", "utf-8");
    await pool.query(schema);
    console.log("  Schema applied successfully.");
  }

  if (action === "check" || action === "schema") {
    console.log("\nChecking tables...");
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    if (rows.length === 0) {
      console.log("  No tables found. Run: node scripts/setup-db.mjs schema");
    } else {
      console.log(`  Found ${rows.length} tables:`);
      for (const r of rows) console.log(`    - ${r.table_name}`);
    }
  }

  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
