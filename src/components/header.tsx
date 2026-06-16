"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useViewMode } from "@/components/view-mode-provider";

const NAV_LINKS = [
  { label: "Packages", href: "#token-packages" },
  { label: "Portfolios", href: "#portfolios" },
  { label: "How It Works", href: "#how-it-works" },
] as const;

export function Header(): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { viewMode } = useViewMode();

  const isMobileView = viewMode === "mobile";

  useEffect(() => {
    function handleScroll(): void {
      setIsScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when switching back to desktop view
  useEffect(() => {
    if (!isMobileView) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileView]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        id="site-header"
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            isScrolled
              ? "glass py-3 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
              : "py-4 md:py-5 bg-transparent"
          }
        `}
      >
        <div className="w-full mx-auto px-4 md:px-8 lg:px-10 flex items-center justify-between relative">
          {/* Logo */}
          <div className="flex-1 flex items-center justify-start">
            <a href="/" className="flex items-center gap-3 group" aria-label="Venture Chain Capital Home">
              <div className={`relative overflow-visible ${
                isMobileView
                  ? "h-[50px] w-[200px]"
                  : "h-[50px] w-[180px] md:h-[60px] md:w-[220px]"
              } transition-transform`}>
                <Image
                  src="/images/vcc-logo-main.png"
                  alt="Venture Chain Capital Logo"
                  fill
                  className="object-contain object-left logo-adaptive scale-[3] origin-left"
                  priority
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side Controls */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
            <ThemeToggle />

            {/* Hamburger Button (Mobile Only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors duration-200 cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center gap-3 md:gap-5">
              <a
                href="/login"
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 font-medium"
              >
                Sign In
              </a>
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-vcc-green)] text-[var(--color-surface-0)] hover:shadow-[0_0_20px_rgba(0,255,136,0.25)] transition-all duration-200 cursor-pointer"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          md:hidden fixed inset-0 z-[45] transition-all duration-300 ease-out
          ${isMobileMenuOpen ? "visible" : "invisible pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileMenu}
          onKeyDown={(e) => e.key === "Escape" && closeMobileMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />

        {/* Menu Panel */}
        <div
          className={`
            absolute top-0 right-0 w-[280px] h-full bg-[var(--color-surface-0)] border-l border-[var(--color-border-dim)]
            flex flex-col transition-transform duration-300 ease-out shadow-2xl
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-dim)] mt-16">
            <span className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
              Menu
            </span>
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors duration-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-5 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="block px-4 py-3.5 rounded-xl text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="p-5 border-t border-[var(--color-border-dim)] space-y-3">
            <a
              href="/login"
              onClick={closeMobileMenu}
              className="block w-full text-center py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-vcc-green)] text-[var(--color-surface-0)] hover:shadow-[0_0_20px_rgba(0,255,136,0.25)] transition-all duration-200 cursor-pointer"
            >
              Get Started
            </a>
            <a
              href="/login"
              onClick={closeMobileMenu}
              className="block w-full text-center py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-accent)] transition-all duration-200 cursor-pointer"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
