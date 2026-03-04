import { redirect } from "next/navigation";
import { getCurrentReader } from "@/app/actions/auth";
import { getProfileData } from "@/app/actions/profile";
import { NavigationBar } from "@/app/_components/navigation-bar";
import {
  ProfileHeader,
  ReadingStatsRow,
  LibrarySectionList,
  FollowedAuthorsStrip,
  AccountActionsList,
  ProfileAuthPrompt,
} from "@/app/_components/profile";

/**
 * Reader Profile & Library page. Req 15.1-15.3, 16.3, 18.1-18.9.
 * When a Guest_Reader navigates to /profile, show auth prompt (Req 18.9).
 */
export default async function ProfilePage() {
  const reader = await getCurrentReader();

  if (!reader) {
    return (
      <>
        <main className="min-h-screen flex flex-col items-center justify-center p-4 xs:p-6 pb-safe-bottom pt-safe-top">
          <div className="text-center">
            <h1
              className="font-display font-bold italic text-2xl text-primary mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Profile
            </h1>
            <p className="font-ui text-text-muted mb-6">
              Sign in to view your library, reading stats, and account settings.
            </p>
            <ProfileAuthPrompt />
          </div>
        </main>
        <NavigationBar activeTab="profile" />
      </>
    );
  }

  const profileData = await getProfileData();
  if (!profileData) {
    redirect("/");
  }

  const { stats, currentlyReading, finished, followedAuthors } = profileData;

  return (
    <>
      <main className="min-h-screen pb-safe-bottom pt-safe-top">
        <ProfileHeader
          displayName={reader.displayName}
          email={reader.email}
          creditBalance={reader.creditBalance}
        />
        <ReadingStatsRow stats={stats} />
        <LibrarySectionList
          currentlyReading={currentlyReading}
          finished={finished}
        />
        <FollowedAuthorsStrip authors={followedAuthors} />
        <AccountActionsList showAll />
      </main>
      <NavigationBar activeTab="profile" />
    </>
  );
}
