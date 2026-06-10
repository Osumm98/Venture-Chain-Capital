import { Suspense } from "react";
import { ProfileForm } from "@/components/dashboard/profile-form";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ProfilePage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
          My Profile
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage your personal details, profile picture, and account preferences.
        </p>
      </div>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileForm />
      </Suspense>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton(): React.JSX.Element {
  return (
    <div className="glass rounded-2xl p-8 animate-pulse">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-full bg-[var(--color-surface-2)]" />
        <div className="space-y-3">
          <div className="w-32 h-6 rounded bg-[var(--color-surface-2)]" />
          <div className="w-48 h-4 rounded bg-[var(--color-surface-2)]" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-[var(--color-surface-2)]" />
        ))}
      </div>
    </div>
  );
}
