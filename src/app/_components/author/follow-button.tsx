"use client";

import { useTransition, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { followAuthor } from "@/app/actions/follow";
import { AuthPrompt } from "../auth-prompt";

interface FollowButtonProps {
  authorId: string;
  initialFollowed: boolean;
  isAuthenticated: boolean;
}

/** Gold CTA that toggles follow state (Req 7.6). */
export function FollowButton({
  authorId,
  initialFollowed,
  isAuthenticated,
}: FollowButtonProps) {
  const { refresh } = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [followed, setFollowed] = useState(() => initialFollowed);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const handleFollow = () => {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await followAuthor(authorId);
      if (result.success) {
        setFollowed(result.followed);
        refresh();
      }
    });
  };

  return (
    <>
      <div className="flex gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={handleFollow}
          disabled={isPending}
          className={`flex-1 font-ui font-bold text-xs uppercase tracking-wider py-3 rounded-sm transition-all shadow-gold-glow cursor-pointer active:scale-[0.98] disabled:active:scale-100 ${
            followed
              ? "border border-primary text-primary bg-transparent hover:bg-primary/10"
              : "bg-primary hover:bg-primary-dark text-void"
          }`}
        >
          {followed ? "Following" : "Follow"}
        </button>
        <button
          type="button"
          className="px-4 border border-[#393528] hover:border-primary text-primary bg-transparent rounded-sm transition-colors flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
      </div>
      <AuthPrompt
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        returnUrl={pathname ?? undefined}
        message="Log in to follow authors"
      />
    </>
  );
}
