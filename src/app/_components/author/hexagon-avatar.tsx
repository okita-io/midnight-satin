"use client";

interface HexagonAvatarProps {
  src: string | null;
  alt: string;
  size?: "md" | "lg";
}

/** Hexagonal clip-path mask with gold gradient border (Req 7.1). */
export function HexagonAvatar({ src, alt, size = "lg" }: HexagonAvatarProps) {
  const sizeClasses = size === "lg" ? "w-32 h-36" : "w-24 h-28";

  return (
    <div className="relative mb-6 group cursor-pointer">
      <div
        className="absolute -inset-[2px] bg-gradient-to-b from-primary to-[#8A7018] opacity-100 shadow-gold-glow"
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />
      <div
        className={`${sizeClasses} bg-surface relative overflow-hidden`}
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <span className="material-symbols-outlined text-primary text-5xl">person</span>
          </div>
        )}
      </div>
    </div>
  );
}
