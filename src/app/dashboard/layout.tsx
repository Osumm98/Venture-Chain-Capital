// =============================================================================
// Dashboard Layout — Server Component that reads session, passes to client shell
// =============================================================================

import { getSession } from "@/lib/session";
import { DEMO_ACCOUNTS } from "@/lib/demo-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const session = await getSession();

  // Derive the member's highest tier for the top-nav badge
  const demoUser = session
    ? DEMO_ACCOUNTS.find((u) => u.membershipNo === session.membershipNo)
    : undefined;

  const tiers = demoUser?.tokens?.map((t) => t.tier) ?? [];
  const tierRank = ["ENTRY", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "GROUP_1", "GROUP_2", "GROUP_3"];
  const highestTier = tiers.length > 0
    ? tiers.reduce((best, t) => (tierRank.indexOf(t) > tierRank.indexOf(best) ? t : best), tiers[0])
    : "Entry";

  // Split displayName into first/last
  const displayName = session?.displayName ?? "Member";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <DashboardShell
      initialProfile={{
        firstName,
        lastName,
        tier: highestTier.charAt(0) + highestTier.slice(1).toLowerCase(),
      }}
    >
      {children}
    </DashboardShell>
  );
}
