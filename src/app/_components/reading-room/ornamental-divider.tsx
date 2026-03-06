/**
 * Ornamental filigree divider between chapter sections (Req 3.3).
 * Gold SVG matching reference/the_reading_room.html.
 */
export function OrnamentalDivider() {
  return (
    <div
      aria-hidden
      className="py-8 flex items-center justify-center opacity-80"
    >
      <svg
        className="text-primary"
        fill="none"
        height={20}
        viewBox="0 0 120 20"
        width={120}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M60 10C60 10 50 0 30 0C10 0 0 10 0 10C0 10 10 20 30 20C50 20 60 10 60 10Z"
          fill="currentColor"
          fillOpacity={0.2}
        />
        <path
          d="M60 10C60 10 70 0 90 0C110 0 120 10 120 10C120 10 110 20 90 20C70 20 60 10 60 10Z"
          fill="currentColor"
          fillOpacity={0.2}
        />
        <circle cx={60} cy={10} fill="currentColor" r={3} />
        <path d="M40 10H80" stroke="currentColor" strokeWidth={0.5} />
      </svg>
    </div>
  );
}
