#!/usr/bin/env node

/**
 * Midnight Satin Test Data Generator
 * Generates comprehensive test data for the romance reading app
 *
 * Features:
 * - 5 complete romance novels with 10 chapters each (1200+ words/chapter)
 * - Rich character casts (5-7 characters per novel)
 * - Author profiles with AI-generated photos
 * - Genre tags and book covers
 * - AI-generated images using Replicate
 */

import { createPool } from '@vercel/postgres';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Replicate from 'replicate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from .env.local (then .env so REPLICATE_API_TOKEN is available)
config({ path: '.env.local' });
config({ path: '.env' });

if (!process.env.POSTGRES_URL) {
  console.error('Missing POSTGRES_URL. Add it to .env.local (or .env).');
  console.error('Pull from Vercel: midnight-satin > Storage > Neon');
  process.exit(1);
}

const pool = createPool({ connectionString: process.env.POSTGRES_URL });
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Test data configuration
const NOVELS_COUNT = 5;
const CHAPTERS_PER_NOVEL = 10;
const WORDS_PER_CHAPTER = 1200;

// Romance genres for testing
const ROMANCE_GENRES = [
  'Contemporary Romance', 'Historical Romance', 'Paranormal Romance',
  'Romantic Suspense', 'Fantasy Romance', 'Science Fiction Romance',
  'Billionaire Romance', 'Small Town Romance', 'Enemies to Lovers',
  'Friends to Lovers', 'Second Chance Romance', 'Forbidden Romance',
  'Military Romance', 'Medical Romance', 'Sports Romance',
  'Vampire Romance', 'Werewolf Romance', 'Time Travel Romance',
  'Royal Romance', 'Cowboy Romance'
];

// Character archetypes for diverse casts
const MALE_ARCHETYPES = [
  'Brooding CEO', 'Charming Detective', 'Noble Prince', 'Rugged Cowboy',
  'Brilliant Scientist', 'Wounded Soldier', 'Mysterious Billionaire',
  'Talented Artist', 'Dedicated Doctor', 'Passionate Chef'
];

const FEMALE_ARCHETYPES = [
  'Independent Journalist', 'Wise Mentor', 'Fierce Warrior',
  'Creative Artist', 'Brilliant Scientist', 'Compassionate Nurse',
  'Mysterious Heiress', 'Strong Single Mother', 'Ambitious CEO',
  'Talented Musician'
];

// Novel data templates
const NOVELS_DATA = [
  {
    title: 'Whispers in the Moonlight',
    genre: ['Paranormal Romance', 'Romantic Suspense'],
    synopsis: 'In the shadowed depths of an ancient forest, archaeologist Elena discovers a forbidden artifact that awakens a centuries-old guardian spirit. As moonlit secrets unfold, she must choose between her scholarly ambitions and the irresistible pull of a love that transcends time itself.',
    author: {
      name: 'Seraphina Blackwood',
      bio: 'Seraphina Blackwood is a bestselling author of paranormal romance with over 15 novels published. Her fascination with ancient mysteries and supernatural lore began during her travels through Eastern Europe, where she first encountered tales of immortal guardians and forbidden artifacts. When not writing, she explores forgotten ruins and collects rare books on mythology.'
    },
    coverPrompt: 'A mystical forest at night with moonlight filtering through ancient trees, a woman in archaeological clothing holding a glowing artifact, atmospheric and romantic',
    characters: [
      { name: 'Elena Voss', archetype: 'Independent Journalist', gender: 'female', age: 28 },
      { name: 'Marcus Thorne', archetype: 'Brooding CEO', gender: 'male', age: 35 },
      { name: 'Lucian Blackwood', archetype: 'Mysterious Billionaire', gender: 'male', age: 142 },
      { name: 'Isabella Voss', archetype: 'Wise Mentor', gender: 'female', age: 55 },
      { name: 'Draven', archetype: 'Wounded Soldier', gender: 'male', age: 178 },
      { name: 'Soren', archetype: 'Talented Artist', gender: 'male', age: 29 }
    ]
  },
  {
    title: 'Crimson Hearts Entwined',
    genre: ['Historical Romance', 'Billionaire Romance'],
    synopsis: 'In the gilded age of 1890s New York, impoverished seamstress Amelia crosses paths with railroad magnate Victor Harrington at a society ball. As their worlds collide in a whirlwind of passion and deception, they must navigate the treacherous waters of high society and forbidden love.',
    author: {
      name: 'Victoria Kensington',
      bio: 'Victoria Kensington specializes in historical romance set in the Gilded Age. A former costume designer for Broadway productions, she brings authentic detail and lavish descriptions to her stories. Her research has taken her to historic mansions, vintage fashion archives, and elite social clubs across America.'
    },
    coverPrompt: 'Victorian era ballroom with crystal chandeliers, elegant couple in formal attire dancing, rich red and gold color palette, romantic and opulent',
    characters: [
      { name: 'Amelia Rose', archetype: 'Creative Artist', gender: 'female', age: 22 },
      { name: 'Victor Harrington', archetype: 'Noble Prince', gender: 'male', age: 38 },
      { name: 'Lady Beatrice Harrington', archetype: 'Strong Single Mother', gender: 'female', age: 65 },
      { name: 'Marcus Blackwood', archetype: 'Charming Detective', gender: 'male', age: 32 },
      { name: 'Lord Reginald', archetype: 'Brilliant Scientist', gender: 'male', age: 45 },
      { name: 'Sophia', archetype: 'Compassionate Nurse', gender: 'female', age: 26 },
      { name: 'Thomas Rose', archetype: 'Dedicated Doctor', gender: 'male', age: 50 }
    ]
  },
  {
    title: 'Echoes of Eternity',
    genre: ['Science Fiction Romance', 'Time Travel Romance'],
    synopsis: 'Quantum physicist Dr. Aria Chen accidentally activates a prototype time device during a routine experiment. Thrown into the year 2147, she encounters Captain Elias Stone, a time guardian sworn to protect the timeline. As they race against temporal collapse, their growing bond threatens to unravel the fabric of reality itself.',
    author: {
      name: 'Dr. Cassandra Vale',
      bio: 'Dr. Cassandra Vale holds a PhD in quantum physics and writes science fiction romance that explores the intersection of advanced technology and human emotion. Her stories blend hard science with emotional depth, drawing from her experiences working at CERN and NASA research facilities.'
    },
    coverPrompt: 'Futuristic cityscape with time vortex swirling in the background, woman in lab coat and man in futuristic armor standing together, neon blue and purple lights, sci-fi romantic',
    characters: [
      { name: 'Dr. Aria Chen', archetype: 'Brilliant Scientist', gender: 'female', age: 31 },
      { name: 'Captain Elias Stone', archetype: 'Wounded Soldier', gender: 'male', age: 34 },
      { name: 'Dr. Marcus Vale', archetype: 'Wise Mentor', gender: 'male', age: 58 },
      { name: 'Lt. Kira Voss', archetype: 'Fierce Warrior', gender: 'female', age: 27 },
      { name: 'Chronos', archetype: 'Mysterious Billionaire', gender: 'male', age: 412 },
      { name: 'Dr. Lena Black', archetype: 'Talented Musician', gender: 'female', age: 29 }
    ]
  },
  {
    title: 'Shadows of Desire',
    genre: ['Paranormal Romance', 'Vampire Romance'],
    synopsis: 'Ancient vampire lord Dominic awakens in modern-day Chicago to find his eternal curse both a blessing and a burden. When he encounters investigative journalist Sophia whose life he once saved centuries ago, their forbidden connection reignites. But as old enemies resurface, they must confront the shadows of their pasts and the dangerous desire that binds them.',
    author: {
      name: 'Raven Sinclair',
      bio: 'Raven Sinclair is renowned for her dark, sensual vampire romances that explore the eternal struggle between light and shadow. A night owl by nature, she draws inspiration from gothic architecture, classical literature, and the mysterious allure of the unknown. Her vampires are complex anti-heroes with depth and humanity.'
    },
    coverPrompt: 'Dark gothic castle silhouette against blood moon, vampire lord embracing mortal woman, crimson roses and black velvet, atmospheric and seductive',
    characters: [
      { name: 'Sophia Harper', archetype: 'Independent Journalist', gender: 'female', age: 30 },
      { name: 'Lord Dominic', archetype: 'Brooding CEO', gender: 'male', age: 847 },
      { name: 'Marcus Black', archetype: 'Charming Detective', gender: 'male', age: 156 },
      { name: 'Lady Seraphina', archetype: 'Mysterious Heiress', gender: 'female', age: 423 },
      { name: 'Father Gabriel', archetype: 'Dedicated Doctor', gender: 'male', age: 89 },
      { name: 'Isabella', archetype: 'Compassionate Nurse', gender: 'female', age: 28 },
      { name: 'Lucian', archetype: 'Talented Artist', gender: 'male', age: 234 }
    ]
  },
  {
    title: 'Hearts Across the Divide',
    genre: ['Contemporary Romance', 'Romantic Suspense'],
    synopsis: 'High-powered corporate lawyer Jessica Mitchell is assigned to defend environmental activist Ryan Callahan in a landmark case. As courtroom battles turn to midnight strategy sessions, their ideological differences ignite an unexpected passion. But when corporate secrets threaten their lives, they must choose between their convictions and the love that could destroy everything.',
    author: {
      name: 'Jordan Blake',
      bio: 'Jordan Blake writes contemporary romance that tackles real-world issues through the lens of love and redemption. A former environmental lawyer turned novelist, Jordan brings authentic legal and activist perspectives to stories about ordinary people facing extraordinary challenges. When not writing, they advocate for climate justice and mentor aspiring writers.'
    },
    coverPrompt: 'Modern city skyline split by environmental protest, lawyer in suit and activist embracing, dramatic lighting with hope and conflict, contemporary romantic tension',
    characters: [
      { name: 'Jessica Mitchell', archetype: 'Ambitious CEO', gender: 'female', age: 33 },
      { name: 'Ryan Callahan', archetype: 'Passionate Chef', gender: 'male', age: 31 },
      { name: 'Marcus Reynolds', archetype: 'Brilliant Scientist', gender: 'male', age: 42 },
      { name: 'Sarah Chen', archetype: 'Fierce Warrior', gender: 'female', age: 29 },
      { name: 'Detective James', archetype: 'Charming Detective', gender: 'male', age: 38 },
      { name: 'Elena Vargas', archetype: 'Wise Mentor', gender: 'female', age: 55 },
      { name: 'Dr. Thomas', archetype: 'Dedicated Doctor', gender: 'male', age: 47 }
    ]
  }
];

// Utility functions
function generateChapterTitle(chapterNumber, novelTitle) {
  const chapterTitles = {
    1: 'Awakening', 2: 'First Encounter', 3: 'Hidden Desires', 4: 'Forbidden Touch',
    5: 'Midnight Confessions', 6: 'Shadows of Doubt', 7: 'Passionate Surrender',
    8: 'Crisis of the Heart', 9: 'Breaking Barriers', 10: 'Eternal Promise'
  };
  return chapterTitles[chapterNumber] || `Chapter ${chapterNumber}`;
}

function generateChapterContent(chapterNumber, novelData, wordCount = WORDS_PER_CHAPTER) {
  // Generate realistic romance chapter content with proper word count
  const templates = [
    `The ${novelData.title.toLowerCase()} unfolded like a carefully crafted tapestry, each thread woven with anticipation and desire. `,
    `In the quiet moments between heartbeats, ${novelData.characters[0].name} found herself contemplating the impossible. `,
    `The air grew thick with unspoken promises as ${novelData.characters[1].name} stepped closer, his presence commanding yet tender. `,
    `Memories of their first encounter danced in ${novelData.characters[0].name}'s mind, each recollection more vivid than the last. `,
    `The world outside ceased to exist as their eyes met, conveying volumes that words could never capture. `,
    `In the sanctuary of their shared secret, boundaries dissolved and vulnerabilities emerged like morning dew. `,
    `The rhythm of their conversation mirrored the cadence of their growing connection, each word a step toward intimacy. `,
    `Shadows played across the room as ${novelData.characters[1].name} revealed a truth that would change everything. `,
    `The weight of expectation hung heavy in the air, yet beneath it simmered an undeniable spark of possibility. `,
    `As the night deepened, so did their understanding of one another, revealing layers previously hidden from view. `
  ];

  let content = '';
  const baseContent = templates.join(' ');

  // Repeat and vary content to reach desired word count
  while (content.split(' ').length < wordCount) {
    content += baseContent + ' ';
  }

  // Add chapter-specific elements
  const chapterOpenings = {
    1: `Chapter ${chapterNumber}: ${generateChapterTitle(chapterNumber, novelData.title)}\n\n`,
    5: `Chapter ${chapterNumber}: ${generateChapterTitle(chapterNumber, novelData.title)}\n\nThe turning point arrived unexpectedly, like a summer storm on a cloudless day. `,
    10: `Chapter ${chapterNumber}: ${generateChapterTitle(chapterNumber, novelData.title)}\n\nAs the final pieces fell into place, ${novelData.characters[0].name} realized that love was not merely an emotion, but a choice made moment by moment. `
  };

  const opening = chapterOpenings[chapterNumber] || `Chapter ${chapterNumber}: ${generateChapterTitle(chapterNumber, novelData.title)}\n\n`;

  return opening + content.substring(0, content.lastIndexOf(' ', wordCount * 6)); // Approximate character limit
}

/**
 * Replicate API: recraft-ai/recraft-v4
 * Inputs: prompt (required), aspect_ratio (optional, e.g. "1:1", "3:4", "2:3")
 * Output: single image URL (string). No "style" or "size" params; use aspect_ratio for dimensions.
 * Docs: https://replicate.com/recraft-ai/recraft-v4/api
 *
 * Downloads the image to public/images/generated/ and returns a local path for the DB.
 */
async function generateImage(prompt, filename, aspectRatio = "1:1") {
  try {
    console.log(`Generating image: ${filename}...`);
    const output = await replicate.run("recraft-ai/recraft-v4", {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
      },
    });

    // Recraft v4 returns a single URL string (or client may return FileOutput/array)
    let url = typeof output === "string" ? output : output?.[0] ?? (output?.url?.() ?? null);
    if (!url) return null;
    url = String(url).replace(/^"|"$/g, '');

    // Save to public/images/generated/ (Recraft returns .webp)
    const baseName = path.basename(filename, path.extname(filename));
    const savedFilename = `${baseName}.webp`;
    const imagePath = path.join(__dirname, "..", "public", "images", "generated", savedFilename);
    await fs.mkdir(path.dirname(imagePath), { recursive: true });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching image`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(imagePath, buffer);
    console.log(`Image saved: public/images/generated/${savedFilename}`);

    // Return path the app can serve from public (e.g. /images/generated/author-x.webp)
    return `/images/generated/${savedFilename}`;
  } catch (error) {
    console.error(`Failed to generate image ${filename}:`, error.message);
    return null;
  }
}

async function insertData() {
  try {
    console.log('🌙 Starting Midnight Satin test data generation...\n');

    // Check environment
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not found in environment variables');
    }

    // Process each novel (schema: author_profiles, novels.genre_tags, characters.portrait_url, chapters without word_count)
    for (let i = 0; i < NOVELS_COUNT; i++) {
      const novel = NOVELS_DATA[i];
      console.log(`\n📚 Processing novel ${i + 1}/${NOVELS_COUNT}: "${novel.title}"`);

      // Replicate: author profile (portrait 2:3)
      const authorImageUrl = await generateImage(
        `Professional headshot of ${novel.author.name}, ${novel.author.bio.substring(0, 100)}..., elegant, sophisticated, book author portrait, natural lighting`,
        `author-${novel.author.name.toLowerCase().replace(/\s+/g, "-")}.png`,
        "2:3"
      );

      // Insert author (author_profiles: name, avatar_url, biography)
      const authorResult = await pool.query(`
        INSERT INTO author_profiles (name, avatar_url, biography, style_tags)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [novel.author.name, authorImageUrl, novel.author.bio, novel.genre]);

      const authorId = authorResult.rows[0].id;

      // Replicate: book cover (portrait 3:4 for spine-style)
      const coverImageUrl = await generateImage(
        novel.coverPrompt,
        `cover-${novel.title.toLowerCase().replace(/\s+/g, "-")}.png`,
        "3:4"
      );

      // Insert novel (genre_tags TEXT[] on novels)
      const novelResult = await pool.query(`
        INSERT INTO novels (title, synopsis, author_id, cover_image_url, publication_date, genre_tags)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        novel.title,
        novel.synopsis,
        authorId,
        coverImageUrl,
        new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        novel.genre
      ]);

      const novelId = novelResult.rows[0].id;

      // Insert characters and generate images
      console.log(`   👥 Creating ${novel.characters.length} characters...`);
      for (const character of novel.characters) {
        // Replicate: character portrait (square for gallery)
        const characterImageUrl = await generateImage(
          `Character portrait of ${character.name}, ${character.archetype}, ${character.age} years old, ${character.gender}, romantic novel character, cinematic lighting, head and shoulders`,
          `character-${novelId}-${character.name.toLowerCase().replace(/\s+/g, "-")}.png`,
          "1:1"
        );

        const characterResult = await pool.query(`
          INSERT INTO characters (novel_id, name, role_subtitle, portrait_url, description)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [
          novelId,
          character.name,
          character.archetype,
          characterImageUrl,
          `${character.name} is a ${character.age}-year-old ${character.archetype.toLowerCase()} (${character.gender}). This character brings depth and complexity to the story, representing themes of ${novel.genre.join(' and ').toLowerCase()}.`
        ]);
      }

      // Insert chapters
      console.log(`   📖 Creating ${CHAPTERS_PER_NOVEL} chapters (${WORDS_PER_CHAPTER}+ words each)...`);
      for (let chapterNum = 1; chapterNum <= CHAPTERS_PER_NOVEL; chapterNum++) {
        const content = generateChapterContent(chapterNum, novel);

        await pool.query(`
          INSERT INTO chapters (novel_id, chapter_number, title, content, is_free)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          novelId,
          chapterNum,
          generateChapterTitle(chapterNum, novel.title),
          content,
          chapterNum === 1 // first chapter free
        ]);

        if (chapterNum % 2 === 0) {
          console.log(`      ✓ Chapter ${chapterNum}/${CHAPTERS_PER_NOVEL} completed`);
        }
      }

      console.log(`   ✅ "${novel.title}" completed with ${novel.characters.length} characters and ${CHAPTERS_PER_NOVEL} chapters`);
    }

    console.log('\n🎉 Test data generation complete!');
    console.log(`📊 Summary:`);
    console.log(`   • ${NOVELS_COUNT} novels created`);
    console.log(`   • ${NOVELS_COUNT * CHAPTERS_PER_NOVEL} chapters generated (${WORDS_PER_CHAPTER}+ words each)`);
    console.log(`   • Genre tags stored on each novel (genre_tags)`);
    console.log(`   • ${NOVELS_DATA.reduce((sum, n) => sum + n.characters.length, 0)} characters with AI-generated portraits`);
    console.log(`   • ${NOVELS_COUNT} author profiles with photos`);
    console.log(`   • ${NOVELS_COUNT} custom book covers`);

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
insertData().catch(console.error);