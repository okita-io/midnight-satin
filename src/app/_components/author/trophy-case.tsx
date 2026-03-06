"use client";

export interface AuthorTrophy {
  id: string;
  icon: string;
  name: string;
  description: string;
}

interface TrophyCaseProps {
  trophies: AuthorTrophy[];
}

/** Responsive grid of trophies with icons, names, descriptions (Req 7.4, THE-69).
 * Mobile: 2 cols; Tablet (md): 3 cols; Desktop (lg): 4 cols.
 * Maintains gold drop-shadow on trophy icons.
 */
export function TrophyCase({ trophies }: TrophyCaseProps) {
  if (trophies.length === 0) return null;

  return (
    <section className="mb-10 border-y border-[#393528]/30 bg-surface/50 backdrop-blur-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <h3 className="font-header text-primary text-xs tracking-[0.15em] uppercase">
          Trophy Case
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-x divide-[#393528]/30 border-t border-[#393528]/30">
        {trophies.map((trophy) => (
          <div
            key={trophy.id}
            className="flex flex-col items-center justify-center py-6 px-2 gap-2 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="text-primary opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
              <span className="material-symbols-outlined text-3xl">{trophy.icon}</span>
            </div>
            <div className="text-center">
              <p className="text-text-main text-xs font-display font-bold">{trophy.name}</p>
              <p className="text-[10px] text-text-muted uppercase mt-0.5">
                {trophy.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
