import { createPool } from "@vercel/postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

async function seed() {
    console.log("Seeding Midnight Satin database...");
    try {
        // 1. Create Author Profile
        console.log("Creating author profile...");
        const authorRes = await pool.query(`
      INSERT INTO author_profiles (name, avatar_url, biography, style_tags, follower_count)
      VALUES (
        'Elias Thorne', 
        '/seed/images/author_avatar.png', 
        '“In the spaces between heartbeats, shadows find their voice.” #GothicRomance #VampireLore', 
        '{"dark aesthetics", "slow burn"}', 
        1200
      )
      RETURNING id;
    `);
        const authorId = authorRes.rows[0].id;

        // 2. Create Series
        console.log("Creating series...");
        const seriesRes = await pool.query(`
      INSERT INTO series (title, author_id, description, genre_tags, is_complete)
      VALUES (
        'The Obsidian Court', 
        $1, 
        'A tale of forbidden bloodlines, ancient curses, and a court where every whispered secret has a price.', 
        '{"Vampire", "High Fantasy", "Court Intrigue"}', 
        false
      )
      RETURNING id;
    `, [authorId]);
        const seriesId = seriesRes.rows[0].id;

        // 3. Create Novel
        console.log("Creating novel...");
        const novelRes = await pool.query(`
      INSERT INTO novels (title, series_id, author_id, cover_image_url, synopsis, genre_tags, rating, rating_count, publication_date)
      VALUES (
        'Whispers in the Velvet Dark', 
        $1, 
        $2, 
        '/seed/images/novel_cover.png', 
        'When Elara Vance uncovers a forbidden archive, she inadvertently binds her soul to Silas Vale, an exiled vampire prince whose hunger is matched only by his profound loneliness. Set in a gothic manor where the walls literally bleed secrets, they must unravel an ancient curse before the approaching winter solstice, or be consumed by the very darkness they seek to master. A story of obsession, blood-ties, and the intoxicating danger of forbidden knowledge.', 
        '{"Gothic Romance", "Vampires", "Mystery"}', 
        4.8, 
        156, 
        NOW()
      )
      RETURNING id;
    `, [seriesId, authorId]);
        const novelId = novelRes.rows[0].id;

        // 4. Create Chapters
        console.log("Creating chapters...");
        await pool.query(`
      INSERT INTO chapters (novel_id, chapter_number, title, content, is_free)
      VALUES (
        $1, 
        1, 
        'The Archive of Shadows', 
        'The air in the archive tasted of dust and forgotten promises. Elara ran her gloved finger along the spine of a leather-bound tome, its surface cold as a tombstone. For weeks, she had searched for the elusive text, guided only by cryptic footnotes and the desperate pounding of her own heart. When she finally pulled it from the shelf, a profound, unnatural silence fell over the room. Behind her, a shadow detached itself from the wall, coalescing into the elegant, terrifying form of Silas Vale. "You seek what is forbidden, little bird," his velvet voice resonated in the heavy air.', 
        true
      ),
      (
        $1, 
        2, 
        'Blood and Velvet', 
        'The manor seemed to breathe around them. Silas stepped closer, the faint scent of rain and copper preceding him. Elara stood her ground, though her pulse betrayed her fear. Every instinct screamed at her to flee, yet she found herself mesmerized by the hypnotic silver of his eyes. "To read the archive is to invite the curse," he murmured, his gaze dropping to the rapid pulse at her throat. He extended a pale hand, adorned with a signet ring black as obsidian. "Are you prepared to pay the toll?" The distance between them vanished, the atmosphere thick with an undeniable, dangerous gravity that threatened to pull her under completely.', 
        false
      ),
      (
        $1, 
        3, 
        'The Midnight Solstice', 
        'In the grand hall, the ballroom lay silent, draped in moonlight and shadows. The impending solstice hung over them like a drawn blade. Silas stood by the towering gothic windows, looking out into the mist-shrouded forest. Elara approached quietly, the heavy velvet of her gown sweeping across the marble floor. They had only hours left to sever the binding, or she would be tethered to his eternal night forever. But as she watched the moonlight trace the sharp planes of his face, she realized the terrifying truth: a part of her no longer wanted the binding to break. The darkness had already woven its way into her heart.', 
        false
      );
    `, [novelId]);

        // 5. Create Characters
        console.log("Creating characters...");
        await pool.query(`
      INSERT INTO characters (novel_id, name, role_subtitle, portrait_url, description, backstory, stats, secrets, endorsement_count, has_trophy)
      VALUES (
        $1, 
        'Silas Vale', 
        'The Exiled Prince', 
        '/seed/images/character_portrait_1.png', 
        'A brooding vampire prince with silver eyes, bound to the ancient manor.', 
        'Exiled from the Obsidian Court centuries ago, Silas has lived in the shadows, guarding the forbidden archives and waiting for the one mortal who could break his curse.', 
        '{"age": "Immortal (appears 28)", "status": "Exiled Royalty", "height": "6''2", "occupation": "Guardian of the Archives", "zodiacSign": "Scorpio", "bloodType": "Unknown", "birthday": "November 2nd", "favorites": ["Rain-streaked windows", "Black Tea", "Silence"], "dislikes": ["The Obsidian Court", "Bright sunlight", "Betrayal"]}', 
        '{"He actually allowed his own exile to protect someone else."}', 
        1050, 
        true
      ),
      (
        $1, 
        'Elara Vance', 
        'The Mortal Scholar', 
        '/seed/images/character_portrait_2.png', 
        'A cunning and determined scholar seeking the truth behind the ancient curse.', 
        'Driven by the mysterious disappearance of her father, Elara has devoted her life to the study of the arcane, unafraid of the monsters that lurk in the dark.', 
        '{"age": "24", "status": "Mortal", "height": "5''6", "occupation": "Scholar of the Arcane", "zodiacSign": "Virgo", "bloodType": "O Negative", "birthday": "September 15th", "favorites": ["Ancient Tomes", "Candlelight", "Strong Coffee"], "dislikes": ["Ignorance", "Being told ''No''", "Cold weather"]}', 
        '{"She unknowingly carries the bloodline of the original curse-weaver."}', 
        850, 
        false
      );
    `, [novelId]);

        console.log("✅ Database seeded successfully with 'Tactile Noir Luxury' content.");
    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await pool.end();
    }
}

seed();
