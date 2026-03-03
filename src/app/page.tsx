import { NavigationBar } from "./_components/navigation-bar";

export default function Home() {
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
            <img alt="Abstract moody dark romance book cover atmosphere" style={{ height: '100%', width: '100%', objectFit: 'cover', opacity: 0.6 }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0FWAoY-qpFwIzQY_6NmtA-SM2ncwUiYZAEuYUEBom83LsxojIR6fgowWoE7PdG45wh2SSerECtQEUEHwxh6gRhXL-oNcyaZnuPwqItJdMvc-t7COhLSmV-06APiGC5HxJHdnezjXuFWJq0Fb5YZGjzyZ2qWd7Fq4ZLmiYLQK5LhcyaZl5pnP1XTbM51FlwZgCE5UOUSmdUXEkF48IbBGIejauxbuRCBVIt-yzfoiuyZK2WXMMIlJ2pnr6kn0_HXLqvqcwecc6uPg" />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--void), rgba(5,5,5,0.4), transparent)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,5,0.6), transparent)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--gold-sheen)', opacity: 0.3, mixBlendMode: 'overlay' }}></div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10, paddingBottom: '3rem' }}>
            <span className="font-header" style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'var(--primary)', marginBottom: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '0.25rem' }}>Editor's Choice</span>
            <h1 className="font-display gold-text-shadow" style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '2.5rem', lineHeight: 1.1, color: 'white', margin: '0 0 0.5rem 0' }}>
              The Duke’s <br /> Forbidden Vow
            </h1>
            <p className="font-ui" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', letterSpacing: '0.025em' }}>By Eleanor Vane</p>
            <button className="btn-gold">Start Reading</button>
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

            <div style={{ display: 'flex', flexDirection: 'column', width: '130px', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '0.125rem', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img alt="Gothic castle silhouette" style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-jy2ntZScXPc-EgaGAc38KBI_YhRUYl1mRN7RcxuAMIkJKii9F6LQVCyKNHjGMkG-bpoQHKVUgshJTcK7ahZLGBwx4-q33Y93lGSjfvWRqUOAY7lVcD7HlnrVjx2U_fOeB7BCQ50F9uXL6xQutaqSXbeCFakke4N5xVonnwcoNHlOLL25VqfbCQvEIUL0FU-cItwo0L9VDmlz6HoE9jYd8iT4eM7fGYnw-9FuYJW0T_JRCQAYNxCg-zHtXE9_kMGAtQ0Bpw3KjfM" />
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(4px)', padding: '0.125rem 0.375rem', borderRadius: '0.125rem', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '10px', color: 'var(--primary)' }}>star</span>
                  <span className="font-ui" style={{ fontSize: '10px', color: 'white' }}>4.9</span>
                </div>
              </div>
              <h3 className="font-display truncate" style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1rem', color: 'white', lineHeight: 1.25, marginBottom: '0.25rem' }}>Midnight Masquerade</h3>
              <p className="font-ui truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Viscount Blackwood</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '130px', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '0.125rem', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img alt="Abstract dark red rose petals" style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4ZMzPWHir-QvitLQbaWtq4dkFiPYU6TuxAkUlh8e7EMYfQCA7XGHEMxZ5kCmImqqWOoprsDJulEVGttbT5dft2cwYphTirdVBL94HfJ0wmaYZRRLv8VfS_pJ_wnuXW9RVHpyXkQz70b7yfeWSI-F_Bx_l041NwTTtKRAEkqWusrevXWjry40WUbYn_JUMwutYWxNCAmpWktj9wUfZeBxzQyDuY_ZoGn92IsqH_XNeiTWQPNweIcCVrfq2kcs2IBjk9Y_8h_BejII" />
              </div>
              <h3 className="font-display truncate" style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1rem', color: 'white', lineHeight: 1.25, marginBottom: '0.25rem' }}>The Scarlet Letter</h3>
              <p className="font-ui truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nathaniel H.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '130px', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '0.125rem', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img alt="Vintage leather texture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY1pJAtpkQP521addbeH3ObF1aIwimoWU1DKFSD9KynOt_BOaB1S2m7uqIVRyb5AL0met6Ksqfu4FZnafL-cxBD6qjY4o14ty_pGBrHDuRO4Lov2i6I9nwy5NbNlT3Sb0Z0XPPrHOmPiu55QEn8xdsSKgGWRSG66m06bAJjx7x4kqvDJdvUC3QTpWrzhqiuG_-25bLbaD6dee6titau2aXK4weEE8FKdOJYuvZ8bKQLuFqEzCEhlM7TNoHI6QFNQPVD7GJVw9UTII" />
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(4px)', padding: '0.125rem 0.375rem', borderRadius: '0.125rem', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '10px', color: 'var(--primary)' }}>star</span>
                  <span className="font-ui" style={{ fontSize: '10px', color: 'white' }}>4.7</span>
                </div>
              </div>
              <h3 className="font-display truncate" style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1rem', color: 'white', lineHeight: 1.25, marginBottom: '0.25rem' }}>Bound by Silk</h3>
              <p className="font-ui truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Eliza Montrose</p>
            </div>

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
