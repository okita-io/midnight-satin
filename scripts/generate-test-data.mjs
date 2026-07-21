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

import { createPool } from './lib/postgres.mjs';
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
      {
        name: 'Elena Voss', archetype: 'Independent Journalist', gender: 'female', age: 28,
        backstory: 'Elena left behind a promising career in city journalism to pursue the mystery that consumed her late mother — the legend of the Moonlit Guardian. Armed with a notebook and an unyielding curiosity, she ventured into the ancient forest, never expecting to find something that would rewrite everything she knew about the world.',
        stats: { age: '28', status: 'Mortal', height: '5\'7"', occupation: 'Archaeologist & Journalist', zodiacSign: 'Aries', bloodType: 'A Positive', birthday: 'March 28th', favorites: ['Ancient maps', 'Earl Grey tea', 'Thunderstorms'], dislikes: ['Being patronized', 'Closed doors', 'Silence without purpose'] },
        secrets: ['She secretly kept her mother\'s last journal, which contains a map to the artifact.']
      },
      {
        name: 'Marcus Thorne', archetype: 'Brooding CEO', gender: 'male', age: 35,
        backstory: 'Once the youngest partner at a prestigious antiquities firm, Marcus walked away from it all after a deal went catastrophically wrong. Now he funds archaeological digs as penance, though his true motive — finding the artifact before the wrong hands do — remains hidden.',
        stats: { age: '35', status: 'Mortal', height: '6\'1"', occupation: 'Antiquities Dealer', zodiacSign: 'Capricorn', bloodType: 'B Negative', birthday: 'January 8th', favorites: ['Rare whiskey', 'Leather-bound books', 'Winter mornings'], dislikes: ['Recklessness', 'Small talk', 'The color white'] },
        secrets: ['He was responsible for the theft that destroyed Elena\'s mother\'s career.']
      },
      {
        name: 'Lucian Blackwood', archetype: 'Mysterious Billionaire', gender: 'male', age: 142,
        backstory: 'Bound to the forest by an ancient pact, Lucian has watched civilizations rise and crumble. He appears as a reclusive philanthropist to the outside world, but within the forest he is the last Guardian — eternal, weary, and desperate for the curse to end.',
        stats: { age: 'Immortal (appears 30)', status: 'Guardian Spirit', height: '6\'3"', occupation: 'Forest Guardian', zodiacSign: 'Pisces', bloodType: 'Unknown', birthday: 'February 22nd', favorites: ['Moonlit clearings', 'The scent of pine', 'Forgotten melodies'], dislikes: ['Iron chains', 'Broken promises', 'The modern world'] },
        secrets: ['He once loved a mortal woman who looked exactly like Elena — 100 years ago.']
      },
      {
        name: 'Isabella Voss', archetype: 'Wise Mentor', gender: 'female', age: 55,
        backstory: 'Elena\'s aunt and a retired professor of folklore studies, Isabella has spent decades collecting oral histories from villages surrounding the ancient forest. She knows more than she lets on, and her protective nature hides a guilt she has carried for thirty years.',
        stats: { age: '55', status: 'Mortal', height: '5\'5"', occupation: 'Retired Folklore Professor', zodiacSign: 'Cancer', bloodType: 'AB Positive', birthday: 'July 4th', favorites: ['Herbal remedies', 'Handwritten letters', 'Cats'], dislikes: ['Technology', 'Dishonesty', 'Rushed meals'] },
        secrets: ['She convinced Elena\'s mother to enter the forest the night she disappeared.']
      },
      {
        name: 'Draven', archetype: 'Wounded Soldier', gender: 'male', age: 178,
        backstory: 'A former Guardian who broke his oath to pursue vengeance against the force that destroyed his village. Draven now wanders the forest\'s edge, neither fully mortal nor fully spirit, seeking redemption through an act he has yet to discover.',
        stats: { age: 'Immortal (appears 33)', status: 'Fallen Guardian', height: '6\'0"', occupation: 'Wanderer', zodiacSign: 'Scorpio', bloodType: 'Unknown', birthday: 'November 15th', favorites: ['Campfires', 'Solitude', 'The sound of rain'], dislikes: ['Authority', 'False hope', 'Crowded places'] },
        secrets: ['He was the one who originally activated the artifact centuries ago.']
      },
      {
        name: 'Soren', archetype: 'Talented Artist', gender: 'male', age: 29,
        backstory: 'A local painter who has lived his entire life in the village near the ancient forest. His paintings of the forest have an uncanny realism that attracts collectors worldwide. What nobody knows is that he paints what he dreams — and his dreams are not his own.',
        stats: { age: '29', status: 'Mortal', height: '5\'10"', occupation: 'Painter', zodiacSign: 'Libra', bloodType: 'O Positive', birthday: 'October 3rd', favorites: ['Oil paints', 'Jazz vinyl', 'Sunrise hikes'], dislikes: ['Criticism of his art', 'Deadlines', 'Fluorescent lighting'] },
        secrets: ['His paintings are actually visions sent by the forest itself.']
      }
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
      {
        name: 'Amelia Rose', archetype: 'Creative Artist', gender: 'female', age: 22,
        backstory: 'Orphaned at fifteen and raised by her seamstress grandmother, Amelia possesses a rare talent for embroidery that has caught the eye of New York\'s elite. She dreams of opening her own atelier, but a chance encounter at a masquerade ball will change the course of her life forever.',
        stats: { age: '22', status: 'Commoner', height: '5\'4"', occupation: 'Seamstress & Embroiderer', zodiacSign: 'Taurus', bloodType: 'A Negative', birthday: 'May 12th', favorites: ['Silk ribbons', 'Pressed flowers', 'Strawberry shortcake'], dislikes: ['Arrogance', 'Wasted fabric', 'Being underestimated'] },
        secrets: ['She is the illegitimate daughter of a railroad baron.']
      },
      {
        name: 'Victor Harrington', archetype: 'Noble Prince', gender: 'male', age: 38,
        backstory: 'The Harrington railroad empire was built on Victor\'s ruthless ambition. But behind the polished veneer of society galas and boardroom deals lies a man haunted by the choices he\'s made — and a growing desire to become someone worthy of the seamstress who sees through his facade.',
        stats: { age: '38', status: 'High Society', height: '6\'2"', occupation: 'Railroad Magnate', zodiacSign: 'Leo', bloodType: 'O Negative', birthday: 'August 5th', favorites: ['Fine cigars', 'Opera', 'Thoroughbred horses'], dislikes: ['Weakness', 'Gossip', 'His father\'s legacy'] },
        secrets: ['He secretly funds orphanages across the city under an alias.']
      },
      {
        name: 'Lady Beatrice Harrington', archetype: 'Strong Single Mother', gender: 'female', age: 65,
        backstory: 'Victor\'s formidable mother and the true power behind the Harrington name. Widowed young, she raised her son alone while navigating the treacherous waters of Gilded Age society. She will stop at nothing to protect the family legacy — even from Victor himself.',
        stats: { age: '65', status: 'High Society', height: '5\'6"', occupation: 'Society Matriarch', zodiacSign: 'Virgo', bloodType: 'B Positive', birthday: 'September 1st', favorites: ['Afternoon tea', 'Rose gardens', 'French literature'], dislikes: ['Scandal', 'Tardiness', 'New money'] },
        secrets: ['She once had a forbidden affair with a working-class immigrant.']
      },
      {
        name: 'Marcus Blackwood', archetype: 'Charming Detective', gender: 'male', age: 32,
        backstory: 'A Pinkerton agent posing as a society gentleman, Marcus has been assigned to investigate financial irregularities within the Harrington empire. His easy charm and quick wit make him a favorite at dinner parties, but his true loyalties remain murky.',
        stats: { age: '32', status: 'Undercover', height: '5\'11"', occupation: 'Pinkerton Detective', zodiacSign: 'Gemini', bloodType: 'AB Negative', birthday: 'June 18th', favorites: ['Card games', 'Black coffee', 'Mystery novels'], dislikes: ['Liars', 'Tight collars', 'Sitting still'] },
        secrets: ['He is in love with Victor\'s sister, who died under mysterious circumstances.']
      },
      {
        name: 'Lord Reginald', archetype: 'Brilliant Scientist', gender: 'male', age: 45,
        backstory: 'An eccentric British inventor who has crossed the Atlantic to secure American investors for his revolutionary electrical inventions. He moves through high society with a distracted brilliance, but his experiments may hold the key to exposing a conspiracy.',
        stats: { age: '45', status: 'Foreign Nobility', height: '5\'9"', occupation: 'Inventor & Scientist', zodiacSign: 'Aquarius', bloodType: 'A Positive', birthday: 'February 3rd', favorites: ['Clockwork devices', 'Turkish delight', 'Stargazing'], dislikes: ['Superstition', 'Poor craftsmanship', 'Interruptions'] },
        secrets: ['His inventions are based on stolen blueprints from a deceased colleague.']
      },
      {
        name: 'Sophia', archetype: 'Compassionate Nurse', gender: 'female', age: 26,
        backstory: 'Amelia\'s closest friend and confidante, Sophia works as a nurse in the city\'s most underfunded hospital. Fiercely loyal and quietly observant, she serves as Amelia\'s anchor to reality when the glittering world of high society threatens to consume her.',
        stats: { age: '26', status: 'Working Class', height: '5\'6"', occupation: 'Nurse', zodiacSign: 'Pisces', bloodType: 'O Positive', birthday: 'March 2nd', favorites: ['Chamomile tea', 'Poetry', 'Caring for stray animals'], dislikes: ['Injustice', 'Loud parties', 'Cold-hearted people'] },
        secrets: ['She is secretly saving money to attend medical school in Europe.']
      },
      {
        name: 'Thomas Rose', archetype: 'Dedicated Doctor', gender: 'male', age: 50,
        backstory: 'Amelia\'s long-lost uncle, a surgeon who left for the frontier decades ago. His unexpected return to New York coincides with a wave of mysterious illnesses among the city\'s elite, and he may be the only one who can trace the poison to its source.',
        stats: { age: '50', status: 'Returning Exile', height: '6\'0"', occupation: 'Frontier Surgeon', zodiacSign: 'Sagittarius', bloodType: 'B Negative', birthday: 'December 10th', favorites: ['Bourbon', 'Medical journals', 'Open skies'], dislikes: ['Pretension', 'Incompetence', 'Being indoors too long'] },
        secrets: ['He faked his own death to escape a scandal that could destroy the Rose family.']
      }
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
      {
        name: 'Dr. Aria Chen', archetype: 'Brilliant Scientist', gender: 'female', age: 31,
        backstory: 'A prodigy who earned her PhD at twenty-three, Aria has spent the last eight years chasing the theoretical foundations of time travel. When her prototype accidentally flings her a century into the future, she discovers that her equations weren\'t just theory — they were a prophecy.',
        stats: { age: '31', status: 'Displaced Temporal', height: '5\'5"', occupation: 'Quantum Physicist', zodiacSign: 'Aquarius', bloodType: 'A Positive', birthday: 'January 29th', favorites: ['Theoretical puzzles', 'Green tea', 'Classical piano'], dislikes: ['Imprecision', 'Being wrong', 'Wasting time'] },
        secrets: ['She intentionally sabotaged her own safety protocols to test the device.']
      },
      {
        name: 'Captain Elias Stone', archetype: 'Wounded Soldier', gender: 'male', age: 34,
        backstory: 'A decorated time guardian, Elias has spent a decade patrolling temporal fractures and sealing paradoxes. The cost has been everything — his family, his past, his sense of self. When Aria arrives from the past, she becomes both his greatest mission and his most dangerous vulnerability.',
        stats: { age: '34', status: 'Temporal Agent', height: '6\'1"', occupation: 'Time Guardian Captain', zodiacSign: 'Scorpio', bloodType: 'O Negative', birthday: 'November 7th', favorites: ['Vintage music', 'Starlit patrols', 'Black coffee'], dislikes: ['Paradoxes', 'Bureaucracy', 'Losing people'] },
        secrets: ['He has already met Aria before — in a timeline that no longer exists.']
      },
      {
        name: 'Dr. Marcus Vale', archetype: 'Wise Mentor', gender: 'male', age: 58,
        backstory: 'Aria\'s doctoral advisor and the father figure she never had. Marcus has always believed in the possibility of time travel, but he never expected his brightest student to prove him right — or to vanish before his eyes during a routine calibration.',
        stats: { age: '58', status: 'Mortal (Past Era)', height: '5\'10"', occupation: 'Theoretical Physicist', zodiacSign: 'Taurus', bloodType: 'B Positive', birthday: 'April 22nd', favorites: ['Chalkboards', 'Earl Grey', 'Old jazz records'], dislikes: ['Academic politics', 'Shortcuts', 'Poor logic'] },
        secrets: ['He received a letter from Aria\'s future self years before the experiment.']
      },
      {
        name: 'Lt. Kira Voss', archetype: 'Fierce Warrior', gender: 'female', age: 27,
        backstory: 'Elias\'s second-in-command and the most ruthless time guardian in the corps. Kira grew up in a future ravaged by temporal instability and will do whatever it takes to maintain the timeline — even if it means eliminating the anomaly that is Aria Chen.',
        stats: { age: '27', status: 'Temporal Agent', height: '5\'8"', occupation: 'Time Guardian Lieutenant', zodiacSign: 'Aries', bloodType: 'AB Negative', birthday: 'April 3rd', favorites: ['Combat training', 'Spicy food', 'Strategic games'], dislikes: ['Sentimentality', 'Disorder', 'Being second-guessed'] },
        secrets: ['She is secretly from a branch timeline that was supposed to be erased.']
      },
      {
        name: 'Chronos', archetype: 'Mysterious Billionaire', gender: 'male', age: 412,
        backstory: 'The enigmatic founder of the Temporal Integrity Commission, Chronos claims to be the first human to have traveled through time. His true age is unknown, his motives inscrutable, and his power over the timeline absolute — or so he would have everyone believe.',
        stats: { age: 'Unknown (appears 40)', status: 'Temporal Authority', height: '6\'0"', occupation: 'Commission Founder', zodiacSign: 'Capricorn', bloodType: 'Unknown', birthday: 'Unknown', favorites: ['Pocket watches', 'Rare teas', 'Ancient history'], dislikes: ['Questions about his past', 'Temporal tourists', 'Disorder'] },
        secrets: ['He is not human — he is an AI construct that achieved consciousness through a temporal loop.']
      },
      {
        name: 'Dr. Lena Black', archetype: 'Talented Musician', gender: 'female', age: 29,
        backstory: 'A fellow researcher and Aria\'s closest friend, Lena was in the lab when the device activated. Left behind in the present day, she races to recreate the experiment and bring Aria home — while uncovering troubling evidence that the accident was anything but accidental.',
        stats: { age: '29', status: 'Mortal (Past Era)', height: '5\'6"', occupation: 'Research Physicist & Cellist', zodiacSign: 'Cancer', bloodType: 'O Positive', birthday: 'July 12th', favorites: ['Cello concertos', 'Lavender candles', 'Late-night coding'], dislikes: ['Goodbyes', 'Lab politics', 'Being alone'] },
        secrets: ['She has been receiving encrypted messages from someone in the future.']
      }
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
      {
        name: 'Sophia Harper', archetype: 'Independent Journalist', gender: 'female', age: 30,
        backstory: 'An investigative journalist specializing in cold cases, Sophia has built her career on chasing stories no one else will touch. When she begins investigating a string of bloodless murders in Chicago, the trail leads her to a man she was certain died centuries ago — and to memories she cannot explain.',
        stats: { age: '30', status: 'Mortal', height: '5\'7"', occupation: 'Investigative Journalist', zodiacSign: 'Sagittarius', bloodType: 'A Positive', birthday: 'December 5th', favorites: ['Red wine', 'True crime podcasts', 'Rooftop views'], dislikes: ['Cover-ups', 'Being lied to', 'Early mornings'] },
        secrets: ['She has recurring dreams of a past life where she was a noblewoman in 17th-century Venice.']
      },
      {
        name: 'Lord Dominic', archetype: 'Brooding CEO', gender: 'male', age: 847,
        backstory: 'An ancient vampire lord who once ruled the courts of medieval Europe, Dominic has retreated into the shadows of modern Chicago, running a vast empire through shell corporations. When he senses a familiar soul in the city, he emerges from self-imposed exile — risking everything for a love that has haunted him for eight centuries.',
        stats: { age: 'Immortal (appears 35)', status: 'Vampire Lord', height: '6\'3"', occupation: 'Corporate Overlord', zodiacSign: 'Scorpio', bloodType: 'Unknown', birthday: 'October 31st', favorites: ['Aged blood wine', 'Moonless nights', 'Gothic architecture'], dislikes: ['Daylight', 'Disloyalty', 'Modern technology'] },
        secrets: ['He made a blood pact that ties his existence to the survival of Sophia\'s bloodline.']
      },
      {
        name: 'Marcus Black', archetype: 'Charming Detective', gender: 'male', age: 156,
        backstory: 'Dominic\'s most trusted lieutenant, turned vampire during the American Civil War. Marcus serves as the bridge between the ancient vampire world and modern society, managing Dominic\'s affairs with a soldier\'s discipline and a gambler\'s instinct.',
        stats: { age: 'Immortal (appears 32)', status: 'Vampire', height: '6\'0"', occupation: 'Chief of Security', zodiacSign: 'Leo', bloodType: 'Unknown', birthday: 'July 28th', favorites: ['Bourbon', 'Blues music', 'Classic cars'], dislikes: ['Rogue vampires', 'Politics', 'Wasted potential'] },
        secrets: ['He secretly reports to the Vampire Council about Dominic\'s activities.']
      },
      {
        name: 'Lady Seraphina', archetype: 'Mysterious Heiress', gender: 'female', age: 423,
        backstory: 'A vampire elder and Dominic\'s former lover, Seraphina commands her own faction within the vampire hierarchy. Elegant, calculating, and dangerously jealous, she sees Sophia\'s arrival as both a threat to her power and an opportunity to settle an old score.',
        stats: { age: 'Immortal (appears 28)', status: 'Vampire Elder', height: '5\'9"', occupation: 'Faction Leader', zodiacSign: 'Libra', bloodType: 'Unknown', birthday: 'October 8th', favorites: ['Silk gowns', 'Venetian masks', 'Power'], dislikes: ['Mortals', 'Disobedience', 'Being forgotten'] },
        secrets: ['She was the one who originally cursed Dominic to immortality out of spite.']
      },
      {
        name: 'Father Gabriel', archetype: 'Dedicated Doctor', gender: 'male', age: 89,
        backstory: 'A vampire hunter masquerading as a parish priest, Gabriel has dedicated his unnaturally long life to the eradication of the undead. His methods are brutal but effective, and he considers Dominic his ultimate prize — unaware that the line between hunter and monster has long since blurred.',
        stats: { age: '89 (appears 60)', status: 'Hunter', height: '5\'11"', occupation: 'Priest & Vampire Hunter', zodiacSign: 'Virgo', bloodType: 'O Negative', birthday: 'September 21st', favorites: ['Holy water', 'Ancient texts', 'Gregorian chants'], dislikes: ['The undead', 'Moral ambiguity', 'Modern sins'] },
        secrets: ['He was bitten decades ago and uses a daily serum to suppress the transformation.']
      },
      {
        name: 'Isabella', archetype: 'Compassionate Nurse', gender: 'female', age: 28,
        backstory: 'Sophia\'s younger sister and a trauma nurse at Chicago General. Isabella has no idea about the supernatural world that surrounds her sister\'s investigation. Her grounded, practical nature makes her Sophia\'s safe harbor — but also makes her a perfect target for those who wish to control Sophia.',
        stats: { age: '28', status: 'Mortal', height: '5\'5"', occupation: 'Trauma Nurse', zodiacSign: 'Cancer', bloodType: 'A Positive', birthday: 'June 25th', favorites: ['Baking', 'Romantic comedies', 'Sunday brunch'], dislikes: ['Violence', 'Lies', 'Working holidays'] },
        secrets: ['She found a vial of Dominic\'s blood in Sophia\'s apartment and had it tested.']
      },
      {
        name: 'Lucian', archetype: 'Talented Artist', gender: 'male', age: 234,
        backstory: 'A vampire artist who has documented the supernatural world through centuries of paintings. Lucian is a pacifist among predators, preferring canvas and pigment to blood and power. His gallery in Chicago\'s underground is the only neutral ground between the vampire factions.',
        stats: { age: 'Immortal (appears 27)', status: 'Vampire', height: '5\'10"', occupation: 'Artist & Gallery Owner', zodiacSign: 'Pisces', bloodType: 'Unknown', birthday: 'February 14th', favorites: ['Oil painting', 'Absinthe', 'Renaissance art'], dislikes: ['Violence', 'Faction politics', 'Artistic censorship'] },
        secrets: ['He painted a portrait of Sophia\'s past life incarnation two hundred years ago.']
      }
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
      {
        name: 'Jessica Mitchell', archetype: 'Ambitious CEO', gender: 'female', age: 33,
        backstory: 'The youngest senior partner at Whitfield & Associates, Jessica has built her career on winning cases no one else would take. But when she\'s assigned to defend an environmental activist accused of corporate sabotage, she finds her convictions tested by a man who refuses to play by her rules.',
        stats: { age: '33', status: 'Professional', height: '5\'7"', occupation: 'Corporate Lawyer', zodiacSign: 'Capricorn', bloodType: 'A Negative', birthday: 'January 14th', favorites: ['Italian espresso', 'Power suits', 'Classical music'], dislikes: ['Losing', 'Disorganization', 'Wasted potential'] },
        secrets: ['She was offered a bribe by the opposing corporation and hasn\'t reported it yet.']
      },
      {
        name: 'Ryan Callahan', archetype: 'Passionate Chef', gender: 'male', age: 31,
        backstory: 'A former marine biologist turned environmental activist, Ryan left academia when he realized papers weren\'t saving the oceans fast enough. His direct-action protests have made him a hero to some and a criminal to others. When the corporate world sends its best lawyer after him, he discovers that not all enemies stay enemies.',
        stats: { age: '31', status: 'Activist', height: '6\'0"', occupation: 'Environmental Activist', zodiacSign: 'Aquarius', bloodType: 'O Positive', birthday: 'February 8th', favorites: ['Ocean swims', 'Campfire cooking', 'Acoustic guitar'], dislikes: ['Corporate greed', 'Plastic waste', 'Being told to calm down'] },
        secrets: ['He has evidence that could bring down the entire corporation but releasing it would endanger innocent workers.']
      },
      {
        name: 'Marcus Reynolds', archetype: 'Brilliant Scientist', gender: 'male', age: 42,
        backstory: 'The CEO of Vanguard Industries, the corporation at the center of the environmental scandal. Marcus presents himself as a forward-thinking innovator, but beneath the public persona lies a man desperate to cover up decades of ecological damage before it destroys his empire.',
        stats: { age: '42', status: 'Corporate Elite', height: '6\'1"', occupation: 'CEO of Vanguard Industries', zodiacSign: 'Scorpio', bloodType: 'B Negative', birthday: 'November 3rd', favorites: ['Single malt scotch', 'Sailboats', 'Chess'], dislikes: ['Media scrutiny', 'Whistleblowers', 'Being outmaneuvered'] },
        secrets: ['He personally authorized the illegal waste dumping that Ryan is protesting.']
      },
      {
        name: 'Sarah Chen', archetype: 'Fierce Warrior', gender: 'female', age: 29,
        backstory: 'A fearless investigative reporter who has been tracking Vanguard Industries for three years. Sarah\'s dogged pursuit of the truth has made her both an ally and a liability. She sees Jessica as a potential source and Ryan as the hero the story needs.',
        stats: { age: '29', status: 'Press', height: '5\'4"', occupation: 'Investigative Reporter', zodiacSign: 'Aries', bloodType: 'AB Positive', birthday: 'March 31st', favorites: ['Breaking stories', 'Vietnamese coffee', 'Long runs'], dislikes: ['Censorship', 'NDA agreements', 'Being scooped'] },
        secrets: ['Her editor is being paid by Vanguard to suppress her stories.']
      },
      {
        name: 'Detective James', archetype: 'Charming Detective', gender: 'male', age: 38,
        backstory: 'A veteran police detective assigned to the environmental sabotage case. James walks a tightrope between his duty to enforce the law and his growing suspicion that the real criminals wear suits and ties. His investigation will force him to choose a side.',
        stats: { age: '38', status: 'Law Enforcement', height: '6\'2"', occupation: 'Police Detective', zodiacSign: 'Gemini', bloodType: 'O Negative', birthday: 'June 8th', favorites: ['Cold cases', 'Diner coffee', 'Old detective novels'], dislikes: ['Corruption', 'Paperwork', 'Being played'] },
        secrets: ['His brother works for Vanguard Industries in their legal department.']
      },
      {
        name: 'Elena Vargas', archetype: 'Wise Mentor', gender: 'female', age: 55,
        backstory: 'A retired environmental lawyer and Jessica\'s former law professor. Elena left corporate law twenty years ago after a case of conscience and now runs a pro bono legal clinic. When her former student comes to her for guidance, she sees a chance to right old wrongs.',
        stats: { age: '55', status: 'Retired Professional', height: '5\'6"', occupation: 'Pro Bono Legal Advisor', zodiacSign: 'Libra', bloodType: 'A Positive', birthday: 'October 15th', favorites: ['Herbal gardens', 'Mentoring', 'Sunday papers'], dislikes: ['Corporate loopholes', 'Willful ignorance', 'Cynicism'] },
        secrets: ['She lost a case against Vanguard twenty years ago that resulted in a community being poisoned.']
      },
      {
        name: 'Dr. Thomas', archetype: 'Dedicated Doctor', gender: 'male', age: 47,
        backstory: 'An epidemiologist who has documented the health effects of Vanguard\'s pollution on surrounding communities. His research is the smoking gun that could win Ryan\'s case — but publishing it will make him a target of the most powerful corporation in the state.',
        stats: { age: '47', status: 'Academic', height: '5\'11"', occupation: 'Epidemiologist', zodiacSign: 'Cancer', bloodType: 'B Positive', birthday: 'July 19th', favorites: ['Data analysis', 'Hiking', 'Craft beer'], dislikes: ['Anti-science rhetoric', 'Bureaucratic delays', 'Compromising research'] },
        secrets: ['Vanguard offered him a million-dollar consulting contract to bury his findings.']
      }
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
          INSERT INTO characters (novel_id, name, role_subtitle, portrait_url, description, backstory, stats, secrets)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `, [
          novelId,
          character.name,
          character.archetype,
          characterImageUrl,
          `${character.name} is a ${character.age}-year-old ${character.archetype.toLowerCase()} (${character.gender}). This character brings depth and complexity to the story, representing themes of ${novel.genre.join(' and ').toLowerCase()}.`,
          character.backstory || null,
          character.stats ? JSON.stringify(character.stats) : '{}',
          character.secrets || []
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