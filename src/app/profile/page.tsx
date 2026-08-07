import { AppShell } from "@/components/app-shell";
import { ProfileOverview } from "@/features/user/components/profile-overview";

export default function ProfilePage() {
  return (
    <AppShell active="profile" mainClassName="profile-page">
      <ProfileOverview />
    </AppShell>
  );
}
