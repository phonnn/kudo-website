import Link from "next/link";

export function AppHeader({ active }: { active: "feed" | "profile" }) {
  return (
    <header>
      <Link className="brand" href="/"><span>GJ</span>Good Job</Link>
      <nav aria-label="Primary navigation">
        <Link className={active === "feed" ? "active" : undefined} href="/">Feed</Link>
        <Link className={active === "profile" ? "active" : undefined} href="/profile">My profile</Link>
      </nav>
      <Link className="profile" href="/profile" aria-label="Open profile">AM</Link>
    </header>
  );
}
