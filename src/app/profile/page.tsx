import { AppHeader } from "@/components/app-header";
import { ProfileOverview } from "@/features/user/components/profile-overview";

export default function ProfilePage() {
  return (
    <>
      <AppHeader active="profile" />
      <main className="profile-page">
        <ProfileOverview />
      </main>
      <footer>Good Job · Built for better teams</footer>
    </>
  );
}
