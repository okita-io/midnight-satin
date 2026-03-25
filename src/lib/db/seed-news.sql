-- Seed data for news_articles (news-updates-system spec)
-- Covers all 5 article types, 2 featured, 1 campaign with source_url/source_platform

INSERT INTO news_articles (title, slug, article_type, hero_image_url, summary, body_content, tags, attribution, source_url, source_platform, is_published, is_featured, featured_order, published_at)
VALUES
(
  'Welcome to Midnight Satin',
  'welcome-to-midnight-satin',
  'announcement',
  '/images/placeholder-news.webp',
  'Step into the world of Midnight Satin — where every page drips with desire, mystery, and the kind of tension that keeps you reading long past midnight.',
  'We are thrilled to unveil Midnight Satin, a reading experience crafted for lovers of romance who crave something deeper. Our curated library features stories that blend passion with intrigue, set against backdrops of gothic estates, moonlit cities, and forbidden encounters.

Expect weekly updates, exclusive author interviews, and a community that celebrates the art of the slow burn. Your journey begins now.',
  ARRAY['Welcome', 'Announcement', 'Editor''s Pick'],
  'From the Editor',
  NULL,
  NULL,
  true,
  true,
  1,
  NOW() - INTERVAL '1 day'
),
(
  'This Week''s Most Desired Characters',
  'most-desired-characters-week-1',
  'ranking',
  '/images/placeholder-news.webp',
  'The endorsement tallies are in. See which characters captured the most hearts this week across all active novels.',
  'Every week we tally endorsements from across the platform to crown the most beloved characters. This week saw fierce competition between fan favourites.

The top five characters by endorsement count have been revealed. Lord Dominic continues his reign at number one, but newcomer Elena Voss is climbing fast. Check back next week to see if the rankings shift.',
  ARRAY['Rankings', 'Weekly Update', 'Trending'],
  'Staff',
  NULL,
  NULL,
  true,
  false,
  NULL,
  NOW() - INTERVAL '2 days'
),
(
  'Shadows of Desire Tops the Charts',
  'shadows-of-desire-tops-charts',
  'popularity',
  '/images/placeholder-news.webp',
  'With over 2,000 readers and a 4.8 rating, Shadows of Desire has become the most-read novel on the platform this month.',
  'Raven Sinclair''s dark romance masterpiece continues to dominate. Shadows of Desire has held the top spot for three consecutive weeks, driven by its gripping plot twists and unforgettable cast.

Reader engagement metrics show an average reading session of 45 minutes — the highest of any novel currently on Midnight Satin. If you haven''t started this one yet, now is the time.',
  ARRAY['Rankings', 'Trending', 'Editor''s Pick'],
  'Staff',
  NULL,
  NULL,
  true,
  true,
  2,
  NOW() - INTERVAL '3 days'
),
(
  'Bonus Credits Campaign — Follow Us on TikTok',
  'bonus-credits-tiktok-campaign',
  'campaign',
  '/images/placeholder-news.webp',
  'Follow Midnight Satin on TikTok and earn 50 bonus credits to unlock your next chapter. Limited time only.',
  'We''re launching our first social media campaign and we want you involved. Follow our official TikTok account, like our pinned video, and claim 50 bonus credits directly in the app.

This is just the beginning — expect more campaigns across Instagram, YouTube, and X in the coming weeks. Spread the word and help fellow readers discover their next obsession.',
  ARRAY['Campaign', 'Bonus Credits', 'Social', 'New Release'],
  'Midnight Satin Team',
  'https://www.tiktok.com/@midnightsatin',
  'tiktok',
  true,
  false,
  NULL,
  NOW() - INTERVAL '4 days'
),
(
  'A Letter from the Editor: What''s Next for Midnight Satin',
  'editors-letter-whats-next',
  'editorial',
  '/images/placeholder-news.webp',
  'A personal note on upcoming features, new authors joining the platform, and our vision for the reading experience ahead.',
  'Dear readers,

As we close out our launch month, I wanted to share a glimpse of what lies ahead. We have three new authors joining the platform next month, each bringing a distinct voice to the romance genre.

We are also working on enhanced reading features — think ambient soundscapes, character relationship maps, and community reading events. Midnight Satin is more than an app; it is a sanctuary for those who believe in the power of a well-told love story.

Stay tuned, and as always — read boldly.

Yours in fiction,
The Editor',
  ARRAY['Editor''s Pick', 'Announcement', 'Weekly Update'],
  'From the Editor',
  NULL,
  NULL,
  true,
  false,
  NULL,
  NOW() - INTERVAL '5 days'
);
