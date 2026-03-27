import type { ReactNode } from "react";
import Link from "next/link";
import { PaperbackDecorationLine } from "./paperback-decoration-line";

/**
 * Shared layout for paperback routes: fixed back control, void background,
 * gold ambient glow (vault-style), and ornamental divider above content.
 */
export function PaperbackPageShell({
  novelId,
  children,
}: {
  novelId: string;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 p-3 xs:p-4 flex items-center bg-gradient-to-b from-black/80 to-transparent w-full pointer-events-none"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
      >
        <Link
          href={`/novel/${novelId}`}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-shadow-sm">
            arrow_back
          </span>
        </Link>
      </div>

      <div className="relative flex min-h-screen flex-col bg-void text-white">
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[360px] bg-primary/5 blur-[100px] rounded-full pointer-events-none z-0"
          aria-hidden
        />
        <main
          className="relative z-10 flex-1 px-4 xs:px-6 pb-20 overflow-y-auto"
          style={{
            paddingTop: "calc(5rem + env(safe-area-inset-top, 0px))",
          }}
        >
          <div className="max-w-lg mx-auto flex flex-col items-center w-full">
            <header className="w-full text-center mb-2">
              <p className="font-cinzel text-primary/90 text-[10px] xs:text-xs tracking-[0.25em] uppercase">
                Midnight Satin Press
              </p>
              <h1 className="font-marcellus text-white/50 text-xs xs:text-sm tracking-wide mt-1">
                Paperback
              </h1>
            </header>
            <PaperbackDecorationLine className="mb-6 xs:mb-8" />
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
