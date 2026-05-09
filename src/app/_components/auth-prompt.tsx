"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef } from "react";
import { SecondaryOutlineLink } from "./button-primitives";

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional return URL to pass to login/register (e.g. current path) */
  returnUrl?: string;
  /** Optional short message (e.g. "Unlock this chapter" / "Send a rose") */
  message?: string;
}

export function AuthPrompt({ isOpen, onClose, returnUrl, message }: AuthPromptProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLAnchorElement>(null);

  const onEscapeClose = useEffectEvent(() => {
    onClose();
  });

  const loginHref = returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/auth/login";
  const registerHref = returnUrl ? `/auth/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/auth/register";

  useEffect(() => {
    if (!isOpen) return;
    firstFocusRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onEscapeClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  function backdropMouseClose(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function backdropKeyClose(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
      onClick={backdropMouseClose}
      onKeyDown={backdropKeyClose}
    >
      <div
        role="document"
        className="w-full max-w-md rounded border border-primary/20 bg-surface p-6 shadow-gold-glow"
      >
        <div className="flex justify-between items-start gap-4 mb-4">
          <h2
            id="auth-prompt-title"
            className="font-display font-semibold italic text-xl text-[var(--primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign in to continue
          </h2>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <span className="material-symbols-outlined" aria-hidden>close</span>
          </button>
        </div>
        {message && (
          <p className="font-ui text-sm text-[var(--text-muted)] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
            {message}
          </p>
        )}
        <p className="font-ui text-sm text-[var(--text-main)] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
          Create an account or sign in to unlock chapters, endorse characters, and visit the Vault.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={loginHref}
            className="btn-gold flex-1 text-center"
          >
            Sign in
          </Link>
          <SecondaryOutlineLink
            ref={lastFocusRef}
            href={registerHref}
            className="flex-1 transition-transform"
          >
            Register
          </SecondaryOutlineLink>
        </div>
      </div>
    </div>
  );
}
