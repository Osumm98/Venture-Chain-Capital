import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign In | Venture Chain Capital",
  description: "Sign in to your VCC member account.",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-surface-0)]">
      <div className="w-full max-w-md animate-pulse">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.06)]" />
          <div className="h-6 w-48 bg-[rgba(255,255,255,0.06)] rounded" />
        </div>
        <div className="glass-accent rounded-2xl p-8 h-[380px]" />
      </div>
    </div>
  );
}
