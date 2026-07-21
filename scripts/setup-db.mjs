import { readFileSync } from "fs";
import { createPool } from "./lib/postgres.mjs";
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
    console.log("Dropping all public tables (clean slate)...");
    await pool.query(`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
        ) LOOP
          EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
        END LOOP;
      END $$;
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
