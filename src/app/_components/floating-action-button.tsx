import Link from "next/link";
import { readingRoomPath } from "@/lib/navigation";

interface FloatingActionButtonProps {
  novelId: string;
  chapterId: string;
}

export function FloatingActionButton({ novelId, chapterId }: FloatingActionButtonProps) {
  const href = readingRoomPath(novelId, chapterId);

  return (
    <div
      className="fixed bottom-24 right-6 z-40"
      style={{ bottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <Link
        href={href}
        className="group flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-gold-glow hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden"
        aria-label="Start reading"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span
          className="material-symbols-outlined text-void text-3xl relative z-10"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          play_arrow
        </span>
      </Link>
    </div>
  );
}
