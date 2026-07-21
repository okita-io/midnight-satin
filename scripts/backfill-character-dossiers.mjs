#!/usr/bin/env node

/**
 * Backfill character dossier data (backstory, stats, secrets)
 * for existing characters in the database.
 *
 * Only updates backstory, stats, and secrets columns.
 * Does NOT touch portrait_url, description, or any other fields.
 * Matches characters by name + novel title.
 */

import { createPool } from './lib/postgres.mjs';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

if (!process.env.POSTGRES_URL) {
  console.error('Missing POSTGRES_URL. Add it to .env.local (or .env).');
  process.exit(1);
}

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

const DOSSIERS = [
  // ── Whispers in the Moonlight ──
  {
    novelTitle: 'Whispers in the Moonlight',
    name: 'Elena Voss',
    backstory: "Elena left behind a promising career in city journalism to pursue the mystery that consumed her late mother — the legend of the Moonlit Guardian. Armed with a notebook and an unyielding curiosity, she ventured into the ancient forest, never expecting to find something that would rewrite everything she knew about the world.",
    stats: { age: '28', status: 'Mortal', height: '5\'7"', occupation: 'Archaeologist & Journalist', zodiacSign: 'Aries', bloodType: 'A Positive', birthday: 'March 28th', favorites: ['Ancient maps', 'Earl Grey tea', 'Thunderstorms'], dislikes: ['Being patronized', 'Closed doors', 'Silence without purpose'] },
    secrets: ["She secretly kept her mother's last journal, which contains a map to the artifact."]
  },
  {
    novelTitle: 'Whispers in the Moonlight',
    name: 'Marcus Thorne',
    backstory: "Once the youngest partner at a prestigious antiquities firm, Marcus walked away from it all after a deal went catastrophically wrong. Now he funds archaeological digs as penance, though his true motive — finding the artifact before the wrong hands do — remains hidden.",
    stats: { age: '35', status: 'Mortal', height: '6\'1"', occupation: 'Antiquities Dealer', zodiacSign: 'Capricorn', bloodType: 'B Negative', birthday: 'January 8th', favorites: ['Rare whiskey', 'Leather-bound books', 'Winter mornings'], dislikes: ['Recklessness', 'Small talk', 'The color white'] },
    secrets: ["He was responsible for the theft that destroyed Elena's mother's career."]
  },
  {
    novelTitle: 'Whispers in the Moonlight',
    name: 'Lucian Blackwood',
    backstory: "Bound to the forest by an ancient pact, Lucian has watched civilizations rise and crumble. He appears as a reclusive philanthropist to the outside world, but within the forest he is the last Guardian — eternal, weary, and desperate for the curse to end.",
    stats: { age: 'Immortal (appears 30)', status: 'Guardian Spirit', height: '6\'3"', occupation: 'Forest Guardian', zodiacSign: 'Pisces', bloodType: 'Unknown', birthday: 'February 22nd', favorites: ['Moonlit clearings', 'The scent of pine', 'Forgotten melodies'], dislikes: ['Iron chains', 'Broken promises', 'The modern world'] },
    secrets: ["He once loved a mortal woman who looked exactly like Elena — 100 years ago."]
  },
  {
    novelTitle: 'Whispers in the Moonlight',
    name: 'Isabella Voss',
    backstory: "Elena's aunt and a retired professor of folklore studies, Isabella has spent decades collecting oral histories from villages surrounding the ancient forest. She knows more than she lets on, and her protective nature hides a guilt she has carried for thirty years.",
    stats: { age: '55', status: 'Mortal', height: '5\'5"', occupation: 'Retired Folklore Professor', zodiacSign: 'Cancer', bloodType: 'AB Positive', birthday: 'July 4th', favorites: ['Herbal remedies', 'Handwritten letters', 'Cats'], dislikes: ['Technology', 'Dishonesty', 'Rushed meals'] },
    secrets: ["She convinced Elena's mother to enter the forest the night she disappeared."]
  },
  {
    novelTitle: 'Whispers in the Moonlight',
    name: 'Draven',
    backstory: "A former Guardian who broke his oath to pursue vengeance against the force that destroyed his village. Draven now wanders the forest's edge, neither fully mortal nor fully spirit, seeking redemption through an act he has yet to discover.",
    stats: { age: 'Immortal (appears 33)', status: 'Fallen Guardian', height: '6\'0"', occupation: 'Wanderer', zodiacSign: 'Scorpio', bloodType: 'Unknown', birthday: 'November 15th', favorites: ['Campfires', 'Solitude', 'The sound of rain'], dislikes: ['Authority', 'False hope', 'Crowded places'] },
    secrets: ["He was the one who originally activated the artifact centuries ago."]
  },
  {
    novelTitle: 'Whispers in the Moonlight',
    name: 'Soren',
    backstory: "A local painter who has lived his entire life in the village near the ancient forest. His paintings of the forest have an uncanny realism that attracts collectors worldwide. What nobody knows is that he paints what he dreams — and his dreams are not his own.",
    stats: { age: '29', status: 'Mortal', height: '5\'10"', occupation: 'Painter', zodiacSign: 'Libra', bloodType: 'O Positive', birthday: 'October 3rd', favorites: ['Oil paints', 'Jazz vinyl', 'Sunrise hikes'], dislikes: ['Criticism of his art', 'Deadlines', 'Fluorescent lighting'] },
    secrets: ["His paintings are actually visions sent by the forest itself."]
  },

  // ── Crimson Hearts Entwined ──
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Amelia Rose',
    backstory: "Orphaned at fifteen and raised by her seamstress grandmother, Amelia possesses a rare talent for embroidery that has caught the eye of New York's elite. She dreams of opening her own atelier, but a chance encounter at a masquerade ball will change the course of her life forever.",
    stats: { age: '22', status: 'Commoner', height: '5\'4"', occupation: 'Seamstress & Embroiderer', zodiacSign: 'Taurus', bloodType: 'A Negative', birthday: 'May 12th', favorites: ['Silk ribbons', 'Pressed flowers', 'Strawberry shortcake'], dislikes: ['Arrogance', 'Wasted fabric', 'Being underestimated'] },
    secrets: ["She is the illegitimate daughter of a railroad baron."]
  },
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Victor Harrington',
    backstory: "The Harrington railroad empire was built on Victor's ruthless ambition. But behind the polished veneer of society galas and boardroom deals lies a man haunted by the choices he's made — and a growing desire to become someone worthy of the seamstress who sees through his facade.",
    stats: { age: '38', status: 'High Society', height: '6\'2"', occupation: 'Railroad Magnate', zodiacSign: 'Leo', bloodType: 'O Negative', birthday: 'August 5th', favorites: ['Fine cigars', 'Opera', 'Thoroughbred horses'], dislikes: ['Weakness', 'Gossip', "His father's legacy"] },
    secrets: ["He secretly funds orphanages across the city under an alias."]
  },
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Lady Beatrice Harrington',
    backstory: "Victor's formidable mother and the true power behind the Harrington name. Widowed young, she raised her son alone while navigating the treacherous waters of Gilded Age society. She will stop at nothing to protect the family legacy — even from Victor himself.",
    stats: { age: '65', status: 'High Society', height: '5\'6"', occupation: 'Society Matriarch', zodiacSign: 'Virgo', bloodType: 'B Positive', birthday: 'September 1st', favorites: ['Afternoon tea', 'Rose gardens', 'French literature'], dislikes: ['Scandal', 'Tardiness', 'New money'] },
    secrets: ["She once had a forbidden affair with a working-class immigrant."]
  },
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Marcus Blackwood',
    backstory: "A Pinkerton agent posing as a society gentleman, Marcus has been assigned to investigate financial irregularities within the Harrington empire. His easy charm and quick wit make him a favorite at dinner parties, but his true loyalties remain murky.",
    stats: { age: '32', status: 'Undercover', height: '5\'11"', occupation: 'Pinkerton Detective', zodiacSign: 'Gemini', bloodType: 'AB Negative', birthday: 'June 18th', favorites: ['Card games', 'Black coffee', 'Mystery novels'], dislikes: ['Liars', 'Tight collars', 'Sitting still'] },
    secrets: ["He is in love with Victor's sister, who died under mysterious circumstances."]
  },
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Lord Reginald',
    backstory: "An eccentric British inventor who has crossed the Atlantic to secure American investors for his revolutionary electrical inventions. He moves through high society with a distracted brilliance, but his experiments may hold the key to exposing a conspiracy.",
    stats: { age: '45', status: 'Foreign Nobility', height: '5\'9"', occupation: 'Inventor & Scientist', zodiacSign: 'Aquarius', bloodType: 'A Positive', birthday: 'February 3rd', favorites: ['Clockwork devices', 'Turkish delight', 'Stargazing'], dislikes: ['Superstition', 'Poor craftsmanship', 'Interruptions'] },
    secrets: ["His inventions are based on stolen blueprints from a deceased colleague."]
  },
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Sophia',
    backstory: "Amelia's closest friend and confidante, Sophia works as a nurse in the city's most underfunded hospital. Fiercely loyal and quietly observant, she serves as Amelia's anchor to reality when the glittering world of high society threatens to consume her.",
    stats: { age: '26', status: 'Working Class', height: '5\'6"', occupation: 'Nurse', zodiacSign: 'Pisces', bloodType: 'O Positive', birthday: 'March 2nd', favorites: ['Chamomile tea', 'Poetry', 'Caring for stray animals'], dislikes: ['Injustice', 'Loud parties', 'Cold-hearted people'] },
    secrets: ["She is secretly saving money to attend medical school in Europe."]
  },
  {
    novelTitle: 'Crimson Hearts Entwined',
    name: 'Thomas Rose',
    backstory: "Amelia's long-lost uncle, a surgeon who left for the frontier decades ago. His unexpected return to New York coincides with a wave of mysterious illnesses among the city's elite, and he may be the only one who can trace the poison to its source.",
    stats: { age: '50', status: 'Returning Exile', height: '6\'0"', occupation: 'Frontier Surgeon', zodiacSign: 'Sagittarius', bloodType: 'B Negative', birthday: 'December 10th', favorites: ['Bourbon', 'Medical journals', 'Open skies'], dislikes: ['Pretension', 'Incompetence', 'Being indoors too long'] },
    secrets: ["He faked his own death to escape a scandal that could destroy the Rose family."]
  },

  // ── Echoes of Eternity ──
  {
    novelTitle: 'Echoes of Eternity',
    name: 'Dr. Aria Chen',
    backstory: "A prodigy who earned her PhD at twenty-three, Aria has spent the last eight years chasing the theoretical foundations of time travel. When her prototype accidentally flings her a century into the future, she discovers that her equations weren't just theory — they were a prophecy.",
    stats: { age: '31', status: 'Displaced Temporal', height: '5\'5"', occupation: 'Quantum Physicist', zodiacSign: 'Aquarius', bloodType: 'A Positive', birthday: 'January 29th', favorites: ['Theoretical puzzles', 'Green tea', 'Classical piano'], dislikes: ['Imprecision', 'Being wrong', 'Wasting time'] },
    secrets: ["She intentionally sabotaged her own safety protocols to test the device."]
  },
  {
    novelTitle: 'Echoes of Eternity',
    name: 'Captain Elias Stone',
    backstory: "A decorated time guardian, Elias has spent a decade patrolling temporal fractures and sealing paradoxes. The cost has been everything — his family, his past, his sense of self. When Aria arrives from the past, she becomes both his greatest mission and his most dangerous vulnerability.",
    stats: { age: '34', status: 'Temporal Agent', height: '6\'1"', occupation: 'Time Guardian Captain', zodiacSign: 'Scorpio', bloodType: 'O Negative', birthday: 'November 7th', favorites: ['Vintage music', 'Starlit patrols', 'Black coffee'], dislikes: ['Paradoxes', 'Bureaucracy', 'Losing people'] },
    secrets: ["He has already met Aria before — in a timeline that no longer exists."]
  },
  {
    novelTitle: 'Echoes of Eternity',
    name: 'Dr. Marcus Vale',
    backstory: "Aria's doctoral advisor and the father figure she never had. Marcus has always believed in the possibility of time travel, but he never expected his brightest student to prove him right — or to vanish before his eyes during a routine calibration.",
    stats: { age: '58', status: 'Mortal (Past Era)', height: '5\'10"', occupation: 'Theoretical Physicist', zodiacSign: 'Taurus', bloodType: 'B Positive', birthday: 'April 22nd', favorites: ['Chalkboards', 'Earl Grey', 'Old jazz records'], dislikes: ['Academic politics', 'Shortcuts', 'Poor logic'] },
    secrets: ["He received a letter from Aria's future self years before the experiment."]
  },
  {
    novelTitle: 'Echoes of Eternity',
    name: 'Lt. Kira Voss',
    backstory: "Elias's second-in-command and the most ruthless time guardian in the corps. Kira grew up in a future ravaged by temporal instability and will do whatever it takes to maintain the timeline — even if it means eliminating the anomaly that is Aria Chen.",
    stats: { age: '27', status: 'Temporal Agent', height: '5\'8"', occupation: 'Time Guardian Lieutenant', zodiacSign: 'Aries', bloodType: 'AB Negative', birthday: 'April 3rd', favorites: ['Combat training', 'Spicy food', 'Strategic games'], dislikes: ['Sentimentality', 'Disorder', 'Being second-guessed'] },
    secrets: ["She is secretly from a branch timeline that was supposed to be erased."]
  },
  {
    novelTitle: 'Echoes of Eternity',
    name: 'Chronos',
    backstory: "The enigmatic founder of the Temporal Integrity Commission, Chronos claims to be the first human to have traveled through time. His true age is unknown, his motives inscrutable, and his power over the timeline absolute — or so he would have everyone believe.",
    stats: { age: 'Unknown (appears 40)', status: 'Temporal Authority', height: '6\'0"', occupation: 'Commission Founder', zodiacSign: 'Capricorn', bloodType: 'Unknown', birthday: 'Unknown', favorites: ['Pocket watches', 'Rare teas', 'Ancient history'], dislikes: ['Questions about his past', 'Temporal tourists', 'Disorder'] },
    secrets: ["He is not human — he is an AI construct that achieved consciousness through a temporal loop."]
  },
  {
    novelTitle: 'Echoes of Eternity',
    name: 'Dr. Lena Black',
    backstory: "A fellow researcher and Aria's closest friend, Lena was in the lab when the device activated. Left behind in the present day, she races to recreate the experiment and bring Aria home — while uncovering troubling evidence that the accident was anything but accidental.",
    stats: { age: '29', status: 'Mortal (Past Era)', height: '5\'6"', occupation: 'Research Physicist & Cellist', zodiacSign: 'Cancer', bloodType: 'O Positive', birthday: 'July 12th', favorites: ['Cello concertos', 'Lavender candles', 'Late-night coding'], dislikes: ['Goodbyes', 'Lab politics', 'Being alone'] },
    secrets: ["She has been receiving encrypted messages from someone in the future."]
  },

  // ── Shadows of Desire ──
  {
    novelTitle: 'Shadows of Desire',
    name: 'Sophia Harper',
    backstory: "An investigative journalist specializing in cold cases, Sophia has built her career on chasing stories no one else will touch. When she begins investigating a string of bloodless murders in Chicago, the trail leads her to a man she was certain died centuries ago — and to memories she cannot explain.",
    stats: { age: '30', status: 'Mortal', height: '5\'7"', occupation: 'Investigative Journalist', zodiacSign: 'Sagittarius', bloodType: 'A Positive', birthday: 'December 5th', favorites: ['Red wine', 'True crime podcasts', 'Rooftop views'], dislikes: ['Cover-ups', 'Being lied to', 'Early mornings'] },
    secrets: ["She has recurring dreams of a past life where she was a noblewoman in 17th-century Venice."]
  },
  {
    novelTitle: 'Shadows of Desire',
    name: 'Lord Dominic',
    backstory: "An ancient vampire lord who once ruled the courts of medieval Europe, Dominic has retreated into the shadows of modern Chicago, running a vast empire through shell corporations. When he senses a familiar soul in the city, he emerges from self-imposed exile — risking everything for a love that has haunted him for eight centuries.",
    stats: { age: 'Immortal (appears 35)', status: 'Vampire Lord', height: '6\'3"', occupation: 'Corporate Overlord', zodiacSign: 'Scorpio', bloodType: 'Unknown', birthday: 'October 31st', favorites: ['Aged blood wine', 'Moonless nights', 'Gothic architecture'], dislikes: ['Daylight', 'Disloyalty', 'Modern technology'] },
    secrets: ["He made a blood pact that ties his existence to the survival of Sophia's bloodline."]
  },
  {
    novelTitle: 'Shadows of Desire',
    name: 'Marcus Black',
    backstory: "Dominic's most trusted lieutenant, turned vampire during the American Civil War. Marcus serves as the bridge between the ancient vampire world and modern society, managing Dominic's affairs with a soldier's discipline and a gambler's instinct.",
    stats: { age: 'Immortal (appears 32)', status: 'Vampire', height: '6\'0"', occupation: 'Chief of Security', zodiacSign: 'Leo', bloodType: 'Unknown', birthday: 'July 28th', favorites: ['Bourbon', 'Blues music', 'Classic cars'], dislikes: ['Rogue vampires', 'Politics', 'Wasted potential'] },
    secrets: ["He secretly reports to the Vampire Council about Dominic's activities."]
  },
  {
    novelTitle: 'Shadows of Desire',
    name: 'Lady Seraphina',
    backstory: "A vampire elder and Dominic's former lover, Seraphina commands her own faction within the vampire hierarchy. Elegant, calculating, and dangerously jealous, she sees Sophia's arrival as both a threat to her power and an opportunity to settle an old score.",
    stats: { age: 'Immortal (appears 28)', status: 'Vampire Elder', height: '5\'9"', occupation: 'Faction Leader', zodiacSign: 'Libra', bloodType: 'Unknown', birthday: 'October 8th', favorites: ['Silk gowns', 'Venetian masks', 'Power'], dislikes: ['Mortals', 'Disobedience', 'Being forgotten'] },
    secrets: ["She was the one who originally cursed Dominic to immortality out of spite."]
  },
  {
    novelTitle: 'Shadows of Desire',
    name: 'Father Gabriel',
    backstory: "A vampire hunter masquerading as a parish priest, Gabriel has dedicated his unnaturally long life to the eradication of the undead. His methods are brutal but effective, and he considers Dominic his ultimate prize — unaware that the line between hunter and monster has long since blurred.",
    stats: { age: '89 (appears 60)', status: 'Hunter', height: '5\'11"', occupation: 'Priest & Vampire Hunter', zodiacSign: 'Virgo', bloodType: 'O Negative', birthday: 'September 21st', favorites: ['Holy water', 'Ancient texts', 'Gregorian chants'], dislikes: ['The undead', 'Moral ambiguity', 'Modern sins'] },
    secrets: ["He was bitten decades ago and uses a daily serum to suppress the transformation."]
  },
  {
    novelTitle: 'Shadows of Desire',
    name: 'Isabella',
    backstory: "Sophia's younger sister and a trauma nurse at Chicago General. Isabella has no idea about the supernatural world that surrounds her sister's investigation. Her grounded, practical nature makes her Sophia's safe harbor — but also makes her a perfect target for those who wish to control Sophia.",
    stats: { age: '28', status: 'Mortal', height: '5\'5"', occupation: 'Trauma Nurse', zodiacSign: 'Cancer', bloodType: 'A Positive', birthday: 'June 25th', favorites: ['Baking', 'Romantic comedies', 'Sunday brunch'], dislikes: ['Violence', 'Lies', 'Working holidays'] },
    secrets: ["She found a vial of Dominic's blood in Sophia's apartment and had it tested."]
  },
  {
    novelTitle: 'Shadows of Desire',
    name: 'Lucian',
    backstory: "A vampire artist who has documented the supernatural world through centuries of paintings. Lucian is a pacifist among predators, preferring canvas and pigment to blood and power. His gallery in Chicago's underground is the only neutral ground between the vampire factions.",
    stats: { age: 'Immortal (appears 27)', status: 'Vampire', height: '5\'10"', occupation: 'Artist & Gallery Owner', zodiacSign: 'Pisces', bloodType: 'Unknown', birthday: 'February 14th', favorites: ['Oil painting', 'Absinthe', 'Renaissance art'], dislikes: ['Violence', 'Faction politics', 'Artistic censorship'] },
    secrets: ["He painted a portrait of Sophia's past life incarnation two hundred years ago."]
  },

  // ── Hearts Across the Divide ──
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Jessica Mitchell',
    backstory: "The youngest senior partner at Whitfield & Associates, Jessica has built her career on winning cases no one else would take. But when she's assigned to defend an environmental activist accused of corporate sabotage, she finds her convictions tested by a man who refuses to play by her rules.",
    stats: { age: '33', status: 'Professional', height: '5\'7"', occupation: 'Corporate Lawyer', zodiacSign: 'Capricorn', bloodType: 'A Negative', birthday: 'January 14th', favorites: ['Italian espresso', 'Power suits', 'Classical music'], dislikes: ['Losing', 'Disorganization', 'Wasted potential'] },
    secrets: ["She was offered a bribe by the opposing corporation and hasn't reported it yet."]
  },
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Ryan Callahan',
    backstory: "A former marine biologist turned environmental activist, Ryan left academia when he realized papers weren't saving the oceans fast enough. His direct-action protests have made him a hero to some and a criminal to others. When the corporate world sends its best lawyer after him, he discovers that not all enemies stay enemies.",
    stats: { age: '31', status: 'Activist', height: '6\'0"', occupation: 'Environmental Activist', zodiacSign: 'Aquarius', bloodType: 'O Positive', birthday: 'February 8th', favorites: ['Ocean swims', 'Campfire cooking', 'Acoustic guitar'], dislikes: ['Corporate greed', 'Plastic waste', 'Being told to calm down'] },
    secrets: ["He has evidence that could bring down the entire corporation but releasing it would endanger innocent workers."]
  },
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Marcus Reynolds',
    backstory: "The CEO of Vanguard Industries, the corporation at the center of the environmental scandal. Marcus presents himself as a forward-thinking innovator, but beneath the public persona lies a man desperate to cover up decades of ecological damage before it destroys his empire.",
    stats: { age: '42', status: 'Corporate Elite', height: '6\'1"', occupation: 'CEO of Vanguard Industries', zodiacSign: 'Scorpio', bloodType: 'B Negative', birthday: 'November 3rd', favorites: ['Single malt scotch', 'Sailboats', 'Chess'], dislikes: ['Media scrutiny', 'Whistleblowers', 'Being outmaneuvered'] },
    secrets: ["He personally authorized the illegal waste dumping that Ryan is protesting."]
  },
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Sarah Chen',
    backstory: "A fearless investigative reporter who has been tracking Vanguard Industries for three years. Sarah's dogged pursuit of the truth has made her both an ally and a liability. She sees Jessica as a potential source and Ryan as the hero the story needs.",
    stats: { age: '29', status: 'Press', height: '5\'4"', occupation: 'Investigative Reporter', zodiacSign: 'Aries', bloodType: 'AB Positive', birthday: 'March 31st', favorites: ['Breaking stories', 'Vietnamese coffee', 'Long runs'], dislikes: ['Censorship', 'NDA agreements', 'Being scooped'] },
    secrets: ["Her editor is being paid by Vanguard to suppress her stories."]
  },
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Detective James',
    backstory: "A veteran police detective assigned to the environmental sabotage case. James walks a tightrope between his duty to enforce the law and his growing suspicion that the real criminals wear suits and ties. His investigation will force him to choose a side.",
    stats: { age: '38', status: 'Law Enforcement', height: '6\'2"', occupation: 'Police Detective', zodiacSign: 'Gemini', bloodType: 'O Negative', birthday: 'June 8th', favorites: ['Cold cases', 'Diner coffee', 'Old detective novels'], dislikes: ['Corruption', 'Paperwork', 'Being played'] },
    secrets: ["His brother works for Vanguard Industries in their legal department."]
  },
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Elena Vargas',
    backstory: "A retired environmental lawyer and Jessica's former law professor. Elena left corporate law twenty years ago after a case of conscience and now runs a pro bono legal clinic. When her former student comes to her for guidance, she sees a chance to right old wrongs.",
    stats: { age: '55', status: 'Retired Professional', height: '5\'6"', occupation: 'Pro Bono Legal Advisor', zodiacSign: 'Libra', bloodType: 'A Positive', birthday: 'October 15th', favorites: ['Herbal gardens', 'Mentoring', 'Sunday papers'], dislikes: ['Corporate loopholes', 'Willful ignorance', 'Cynicism'] },
    secrets: ["She lost a case against Vanguard twenty years ago that resulted in a community being poisoned."]
  },
  {
    novelTitle: 'Hearts Across the Divide',
    name: 'Dr. Thomas',
    backstory: "An epidemiologist who has documented the health effects of Vanguard's pollution on surrounding communities. His research is the smoking gun that could win Ryan's case — but publishing it will make him a target of the most powerful corporation in the state.",
    stats: { age: '47', status: 'Academic', height: '5\'11"', occupation: 'Epidemiologist', zodiacSign: 'Cancer', bloodType: 'B Positive', birthday: 'July 19th', favorites: ['Data analysis', 'Hiking', 'Craft beer'], dislikes: ['Anti-science rhetoric', 'Bureaucratic delays', 'Compromising research'] },
    secrets: ["Vanguard offered him a million-dollar consulting contract to bury his findings."]
  },
];

async function backfill() {
  console.log('🌙 Backfilling character dossier data...\n');

  let updated = 0;
  let skipped = 0;

  for (const d of DOSSIERS) {
    const result = await pool.query(`
      UPDATE characters c
      SET backstory = $1,
          stats     = $2::jsonb,
          secrets   = $3::text[]
      FROM novels n
      WHERE c.novel_id = n.id
        AND n.title    = $4
        AND c.name     = $5
    `, [
      d.backstory,
      JSON.stringify(d.stats),
      d.secrets,
      d.novelTitle,
      d.name,
    ]);

    if (result.rowCount > 0) {
      console.log(`  ✅ ${d.name} (${d.novelTitle})`);
      updated++;
    } else {
      console.log(`  ⚠️  Not found: ${d.name} in "${d.novelTitle}"`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! Updated ${updated} characters, ${skipped} not found.`);
}

backfill()
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
