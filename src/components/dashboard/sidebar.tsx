"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Store } from "lucide-react";
import { useViewMode } from "@/components/view-mode-provider";

// ---------------------------------------------------------------------------
// Navigation Items
// ---------------------------------------------------------------------------

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.JSX.Element;
}

const MEMBER_NAV: ReadonlyArray<NavItem> = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "Markets",
    href: "/dashboard/markets",
    icon: <Store size={18} strokeWidth={1.8} />,
  },
  {
    label: "News",
    href: "/dashboard/news",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const ADMIN_NAV: ReadonlyArray<NavItem> = [
  {
    label: "Portfolio Hub",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20V10M18 20V4M6 20v-4" />
      </svg>
    ),
  },
  {
    label: "Valuations",
    href: "/admin/valuations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Sidebar Component
// ---------------------------------------------------------------------------

export function DashboardSidebar(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { viewMode } = useViewMode();

  const isMobileView = viewMode === "mobile";

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close when switching out of mobile view
  useEffect(() => {
    if (!isMobileView) setIsMobileOpen(false);
  }, [isMobileView]);

  // Lock scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="relative px-6 py-10 border-b border-[var(--color-border-dim)] flex items-center justify-center overflow-visible">
        <a href="/" className="flex items-center justify-center w-full" aria-label="Venture Chain Capital">
          <div className={`relative h-[60px] ${isMobileView ? "w-[180px]" : "w-full"} transition-all duration-300`}>
            <Image
              src="/images/vcc-logo-main.png"
              alt="Venture Chain Capital Logo"
              fill
              className="object-contain logo-adaptive scale-[2] origin-center"
              priority
            />
          </div>
        </a>
        {isMobileView && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
            className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] px-3 mb-3">
          Member
        </p>
        {MEMBER_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-[var(--color-vcc-green-subtle)] text-[var(--color-vcc-green)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}

        {/* Admin section — shown on admin routes */}
        {pathname.startsWith("/admin") && (
          <>
            <div className="pt-4 mt-4 border-t border-[var(--color-border-dim)]" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] px-3 mb-3">
              Admin
            </p>
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-vcc-green-subtle)] text-[var(--color-vcc-green)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer Nav & Theme Toggle */}
      <div className="p-4 border-t border-[var(--color-border-dim)] space-y-4">
        <ThemeToggle />
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-1)] rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </>
  );

  // Desktop sidebar: fixed, always visible
  if (!isMobileView) {
    return (
      <aside className="w-64 min-h-screen border-r border-[var(--color-border-dim)] bg-[var(--color-surface-0)] flex flex-col fixed top-0 left-0 z-40">
        {sidebarContent}
      </aside>
    );
  }

  // Mobile sidebar: hamburger + overlay drawer
  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--color-surface-0)] border-b border-[var(--color-border-dim)] glass">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
          className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors duration-200 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        <a href="/" className="flex items-center" aria-label="Venture Chain Capital">
          <div className="relative w-[160px] h-[36px]">
            <Image
              src="/images/vcc-logo-main.png"
              alt="Venture Chain Capital Logo"
              fill
              className="object-contain object-left logo-adaptive scale-125 origin-left"
              priority
            />
          </div>
        </a>

        <ThemeToggle />
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[45] transition-all duration-300 ${
          isMobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsMobileOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />

        {/* Sidebar Drawer */}
        <aside
          className={`absolute top-0 left-0 w-[280px] h-full bg-[var(--color-surface-0)] border-r border-[var(--color-border-dim)] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
