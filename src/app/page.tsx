import Link from "next/link";
import { NavigationBar } from "./_components/navigation-bar";
import { NovelCard } from "./_components/novel-card";
import { EmptyState } from "./_components/empty-state";
import { getFeaturedNovels, getTrendingNovels } from "@/lib/content";
import { novelDetailPath } from "@/lib/navigation";

export const revalidate = 60;

export default async function Home() {
  let featured: Awaited<ReturnType<typeof getFeaturedNovels>> = [];
  let trending: Awaited<ReturnType<typeof getTrendingNovels>> = [];
  try {
    [featured, trending] = await Promise.all([
      getFeaturedNovels(5),
      getTrendingNovels(10),
    ]);
  } catch {
    // DB/KV may not be configured; show empty sections
  }

  const heroNovel = featured[0];
  const heroCard = heroNovel
    ? {
        id: heroNovel.id,
        title: heroNovel.title,
        authorName: heroNovel.authorName,
        coverImageUrl: heroNovel.coverImageUrl,
        rating: heroNovel.rating || null,
      }
    : null;

  return (
    <>
      {/* Header / Status Bar Area */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>menu_book</span>
          <span className="font-header" style={{ fontSize: '0.875rem', letterSpacing: '0.2em', color: 'var(--primary)' }}>Midnight Satin</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" aria-label="Search" style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" aria-hidden>search</span>
          </button>
          <button type="button" aria-label="Notifications" style={{ position: 'relative', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" aria-hidden>notifications</span>
            <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%', border: '1px solid var(--void)' }} aria-hidden></span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '6rem' }}>
        {/* Hero Carousel */}
        <section style={{ position: 'relative', height: '480px', width: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--void)' }}>
            {heroCard?.coverImageUrl ? (
              <img alt="" style={{ height: '100%', width: '100%', objectFit: 'cover', opacity: 0.6 }} src={heroCard.coverImageUrl} />
            ) : (
              <div style={{ height: '100%', width: '100%', background: 'var(--surface)' }} />
            )}
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--void), rgba(5,5,5,0.4), transparent)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,5,0.6), transparent)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--gold-sheen)', opacity: 0.3, mixBlendMode: 'overlay' }}></div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10, paddingBottom: '3rem' }}>
            <span className="font-header" style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'var(--primary)', marginBottom: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '0.25rem' }}>Editor's Choice</span>
            {heroCard ? (
              <>
                <h1 className="font-display gold-text-shadow" style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '2.5rem', lineHeight: 1.1, color: 'white', margin: '0 0 0.5rem 0' }}>
                  {heroCard.title}
                </h1>
                <p className="font-ui" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', letterSpacing: '0.025em' }}>By {heroCard.authorName}</p>
                <Link href={novelDetailPath(heroCard.id)} className="btn-gold">Start Reading</Link>
              </>
            ) : (
              <EmptyState message="Nothing featured yet" />
            )}
          </div>
        </section>

        {/* Current Affairs (Currently Reading) */}
        <section style={{ padding: '0 1.5rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10, marginTop: '-1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="font-header" style={{ fontSize: '0.875rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>Current Affairs</h2>
            <button style={{ fontSize: '10px', fontFamily: 'var(--font-ui)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
            <div className="overlay-sheen"></div>
            <div style={{ width: '80px', height: '120px', flexShrink: 0, borderRadius: '0.125rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', position: 'relative' }}>
              <img alt="Dark floral pattern book cover design" style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWXl4paH8tw-7BvkMnhTPKLjxmH8nThGmIcJeuhJZPdKWjxlAWYmi7DyGcd_N69mMiQbQWRhAEEfrTzdg0ytX2spYJAfUvK078OxLP-FJc6Z-Va0c2GDJZokObdYp6apJxfZTlK3I1AjePZQ4kBh4PEVaFWCjwuhVIx86uIvZpPwEJ3AlnUzGm6iKE-z4IaiLpULC0-FB6UxQR9b8DNqQUHNoY4B_myjf3pILuGeYPCSzWmmH0vvDG_zsU8gekBdSPvpsal41NIU4" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <div style={{ height: '100%', backgroundColor: 'var(--primary)', width: '65%', boxShadow: '0 0 10px rgba(212,175,55,0.8)' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
              <span className="font-ui" style={{ fontSize: '10px', color: 'rgba(212, 175, 55, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Chapter IV</span>
              <h3 className="font-display truncate" style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1.25rem', color: 'white', marginBottom: '0.25rem' }}>Velvet & Steel</h3>
              <p className="font-ui" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Lady Margaret Thorne</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span className="font-ui" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>65% Complete</span>
                <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>play_circle</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* High Society (Trending) */}
        <section style={{ paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingRight: '1.5rem' }}>
            <h2 className="font-header" style={{ fontSize: '0.875rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>High Society</h2>
          </div>
          <div className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '1.25rem', paddingBottom: '2rem', paddingRight: '1.5rem', scrollSnapType: 'x mandatory' }}>
            {trending.length > 0 ? (
              trending.map((novel) => (
                <NovelCard
                  key={novel.id}
                  novel={{
                    id: novel.id,
                    title: novel.title,
                    authorName: novel.authorName,
                    coverImageUrl: novel.coverImageUrl,
                    rating: novel.rating > 0 ? novel.rating : null,
                  }}
                />
              ))
            ) : (
              <EmptyState message="Nothing in high society yet" />
            )}
          </div>
        </section>

        {/* The Vault Teaser */}
        <section style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: '100%', background: 'linear-gradient(to right, #1a1500, var(--surface))', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '0.125rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8rem', background: 'linear-gradient(to left, rgba(0,0,0,0.2), transparent)', pointerEvents: 'none' }}></div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <h4 className="font-display" style={{ fontStyle: 'italic', fontSize: '1.125rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Refill your purse</h4>
              <p className="font-ui" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px' }}>Unlock exclusive chapters and endorse your favorite suitors.</p>
            </div>
            <div style={{ position: 'relative', zIndex: 10, backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '0.5rem', borderRadius: '9999px', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">diamond</span>
            </div>
          </div>
        </section>
      </main>

      <NavigationBar activeTab="boudoir" />
    </>
  );
}
