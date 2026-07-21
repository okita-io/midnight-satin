import { put } from '@vercel/blob';
import { createPool } from './lib/postgres.mjs';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import path from 'path';

config({ path: '.env.local' });

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

async function upload() {
  console.log('Uploading images to Vercel Blob...');
  const images = ['author_avatar.png', 'novel_cover.png', 'character_portrait_1.png', 'character_portrait_2.png'];
  const urls = {};

  for (const img of images) {
    const filePath = path.join('public', 'seed', 'images', img);
    console.log(`Uploading ${img}...`);
    const file = readFileSync(filePath);

    // We upload with a public token if available, or just use the token in .env.local
    const blob = await put(`seed/images/${img}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log(`✅ ${img} uploaded to ${blob.url}`);
    urls[img] = blob.url;
  }

  console.log('Updating database with new Blob URLs...');

  // Update author
  await pool.query(`UPDATE author_profiles SET avatar_url = $1 WHERE name = 'Elias Thorne'`, [urls['author_avatar.png']]);
  // Update novel
  await pool.query(`UPDATE novels SET cover_image_url = $1 WHERE title = 'Whispers in the Velvet Dark'`, [urls['novel_cover.png']]);
  // Update characters
  await pool.query(`UPDATE characters SET portrait_url = $1 WHERE name = 'Silas Vale'`, [urls['character_portrait_1.png']]);
  await pool.query(`UPDATE characters SET portrait_url = $1 WHERE name = 'Elara Vance'`, [urls['character_portrait_2.png']]);

  console.log('✅ Database updated successfully!');
  await pool.end();
}

upload().catch((e) => {
  console.error(e);
  process.exit(1);
});
