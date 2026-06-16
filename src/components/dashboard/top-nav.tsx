"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Bell, Search, X } from "lucide-react";
import { useViewMode } from "@/components/view-mode-provider";
import { useUser } from "@/components/user-provider";

export function TopNav(): React.JSX.Element {
  const { viewMode } = useViewMode();
  const { profile } = useUser();
  const isMobileView = viewMode === "mobile";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide TopNav completely on mobile since we have a mobile header in the sidebar component
  if (isMobileView) return <></>;

  const searchablePages = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Markets", url: "/dashboard/markets" },
    { name: "News", url: "/dashboard/news" },
    { name: "Profile", url: "/dashboard/profile" },
    { name: "Ledger", url: "/dashboard/ledger" },
    { name: "Admin Hub", url: "/admin" },
  ];

  const filteredPages = searchablePages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full flex items-center justify-between mb-8 relative z-50">
      {/* Search Bar */}
      <div className="relative max-w-md w-full hidden md:block" ref={searchRef}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => setShowSearchDropdown(true)}
          placeholder="Search features, pages, or tokens..."
          className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200"
        />
        
        {/* Search Dropdown */}
        {showSearchDropdown && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] rounded-xl shadow-xl overflow-hidden glass z-50">
            {filteredPages.length > 0 ? (
              <ul className="py-2">
                {filteredPages.map(page => (
                  <li key={page.url}>
                    <a href={page.url} className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
                      Go to <span className="font-semibold text-[var(--color-vcc-green)]">{page.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--color-text-tertiary)]">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 md:hidden" /> {/* Spacer */}

      {/* Right side actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button" 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-[var(--color-vcc-green)] rounded-full border-2 border-[var(--color-surface-0)]" />
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--color-surface-0)] border border-[var(--color-border-subtle)] rounded-xl shadow-xl glass z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-dim)] bg-[var(--color-surface-1)]">
                <h3 className="font-bold text-sm">Notifications</h3>
                <button type="button" onClick={() => setShowNotifications(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="py-2">
                <li className="px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border-dim)] last:border-0 cursor-pointer">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Token Yield Disbursed</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Your Platinum tokens generated +R42.50 today.</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">2 hours ago</p>
                </li>
                <li className="px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border-dim)] last:border-0 cursor-pointer">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">System Maintenance</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Scheduled maintenance will occur on Friday at 2AM SAST.</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">1 day ago</p>
                </li>
              </ul>
              <div className="px-4 py-2 border-t border-[var(--color-border-dim)] text-center">
                <button type="button" className="text-xs font-semibold text-[var(--color-vcc-green)] hover:text-green-400 cursor-pointer">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        <a href="/dashboard/profile" className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)] group-hover:text-[var(--color-vcc-green)] transition-colors">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
              {profile.tier} Member
            </p>
          </div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--color-border-accent)] group-hover:border-[var(--color-vcc-green)] transition-colors duration-300">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.firstName}`}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        </a>
      </div>
    </div>
  );
}
