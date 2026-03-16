"use client";

interface BiographySectionProps {
  biography: string | null;
  styleTags: string[];
}

/** Centered italic quote with decorative quotation marks and writing style hashtag pills (Req 7.3). */
export function BiographySection({ biography, styleTags }: BiographySectionProps) {
  return (
    <section className="px-4 xs:px-6 mb-8 xs:mb-10">
      <div className="relative">
        <span className="absolute -left-1 xs:-left-2 -top-2 text-3xl xs:text-4xl text-[#393528] font-display">&ldquo;</span>
        <p className="text-text-main/90 text-lg leading-relaxed text-center italic font-light px-2">
          {biography || "No biography available."}
        </p>
        <span
          className="absolute -right-2 bottom-0 text-4xl text-[#393528] font-display transform rotate-180"
          aria-hidden
        >
          &rdquo;
        </span>
      </div>
      {styleTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {styleTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-sm border border-primary/60 bg-void/50 backdrop-blur-sm text-xs text-primary font-ui tracking-wider uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
