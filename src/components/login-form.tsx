"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";

// ---------------------------------------------------------------------------
// Parallax Background & Meteor Shower
// ---------------------------------------------------------------------------

// Custom SVGs for specific crypto/assets since Lucide doesn't have all of them
const BitcoinIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.313m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
  </svg>
);

const EthereumIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.999 3.486 4.747 15.53l7.252 4.984 7.253-4.984L11.999 3.486Z"/>
    <path d="M11.999 15.53v4.984M11.999 15.53L4.747 10.5M11.999 15.53l7.253-5.03" />
  </svg>
);

const XRPIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h16" /> {/* Generic representation for abstract coin */}
    <circle cx="12" cy="12" r="10" />
    <path d="m8 8 8 8m0-8-8 8" />
  </svg>
);

const GoldIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 16.326A7 7 0 1 1 15.71 5 7 7 0 0 1 6 16.326z" />
    <path d="m9 11 3-3 3 3" />
    <path d="M12 8v8" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ICONS = [
  { id: 1, Icon: BitcoinIcon, size: 100, top: "15%", left: "10%", speed: 0.04, opacity: 0.15, rotateX: 60, rotateY: 20, rotateZ: -15 },
  { id: 2, Icon: EthereumIcon, size: 140, top: "60%", left: "5%", speed: -0.03, opacity: 0.1, rotateX: 55, rotateY: -15, rotateZ: 25 },
  { id: 3, Icon: XRPIcon, size: 90, top: "25%", left: "85%", speed: 0.05, opacity: 0.12, rotateX: 65, rotateY: 10, rotateZ: 10 },
  { id: 4, Icon: GoldIcon, size: 120, top: "75%", left: "80%", speed: -0.04, opacity: 0.15, rotateX: 50, rotateY: -20, rotateZ: -20 },
  { id: 5, Icon: BitcoinIcon, size: 60, top: "10%", left: "50%", speed: 0.02, opacity: 0.1, rotateX: 45, rotateY: 15, rotateZ: 5 },
  { id: 6, Icon: EthereumIcon, size: 100, top: "85%", left: "40%", speed: -0.02, opacity: 0.12, rotateX: 60, rotateY: 5, rotateZ: -10 },
  { id: 7, Icon: GoldIcon, size: 70, top: "45%", left: "15%", speed: 0.06, opacity: 0.14, rotateX: 55, rotateY: 25, rotateZ: -5 },
  { id: 8, Icon: XRPIcon, size: 85, top: "40%", left: "90%", speed: -0.05, opacity: 0.1, rotateX: 65, rotateY: -10, rotateZ: 15 },
];

function FloatingEmbers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const embers = containerRef.current?.querySelectorAll(".ember");
    if (!embers) return;

    embers.forEach((ember) => {
      // Wide dispersion: spawn anywhere from -20vw to 120vw
      const startX = -20 + Math.random() * 140;
      const startY = 110 + Math.random() * 20; // Start slightly below screen
      
      // Extremely slow speed: 30 to 70 seconds to cross the screen
      const duration = 30 + Math.random() * 40; 
      
      // Very long staggered entry so they pop in organically over a minute
      const delay = Math.random() * 45; 

      gsap.fromTo(
        ember,
        {
          x: `${startX}vw`,
          y: `${startY}vh`,
          opacity: 0,
          scale: 0.3 + Math.random() * 0.8,
        },
        {
          // Massive sideways lazy drift
          x: `${startX + (Math.random() * 80 - 40)}vw`, 
          y: `-30vh`, // Float high up past the top of the screen
          opacity: 0,
          scale: 0.3 + Math.random() * 0.8,
          duration: duration,
          ease: "sine.inOut",
          repeat: -1,
          delay: delay,
          keyframes: {
            "0%": { opacity: 0 },
            "25%": { opacity: 0.8 }, // Fade in slowly
            "75%": { opacity: 0.8 }, // Stay visible for most of the journey
            "100%": { opacity: 0 },  // Fade out before hitting top
          },
        }
      );
    });
  }, [mounted]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      {mounted && Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="ember absolute rounded-full bg-[#00ff88] shadow-[0_0_20px_8px_rgba(0,255,136,0.3)]"
          style={{
            width: `${Math.random() * 8 + 2}px`,
            height: `${Math.random() * 8 + 2}px`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 100; // -50 to 50
      const yPos = (clientY / window.innerHeight - 0.5) * 100;

      const icons = container.querySelectorAll(".parallax-icon");
      icons.forEach((icon) => {
        const speed = parseFloat(icon.getAttribute("data-speed") || "0.05");
        gsap.to(icon, {
          x: xPos * speed * 20, 
          y: yPos * speed * 20,
          duration: 1.5,
          ease: "power2.out",
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <FloatingEmbers />
      <div 
        ref={containerRef} 
        className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
        style={{ perspective: "1000px" }}
      >
        {/* Floating 2.5D Icons */}
        {ICONS.map(({ id, Icon, size, top, left, speed, opacity, rotateX, rotateY, rotateZ }) => (
          <div
            key={id}
            className="parallax-icon absolute text-[var(--color-vcc-green)] transition-opacity duration-1000"
            data-speed={speed}
            style={{
              top,
              left,
              opacity,
              transformStyle: "preserve-3d",
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
              filter: "drop-shadow(0px 15px 10px rgba(0,255,136,0.2)) drop-shadow(0px -2px 2px rgba(255,255,255,0.4))",
            }}
          >
            <Icon size={size} />
            {/* 3D Depth Layer beneath the icon to create a slight extrusion effect */}
            <div className="absolute inset-0 text-green-900/50" style={{ transform: "translateZ(-4px)" }}>
              <Icon size={size} />
            </div>
            <div className="absolute inset-0 text-black/40" style={{ transform: "translateZ(-8px)" }}>
              <Icon size={size} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Login Form Component
// ---------------------------------------------------------------------------

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [membershipNo, setMembershipNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipNo, password }),
      });

      const responseData = await response.json() as { success?: boolean; error?: string };

      if (!response.ok) {
        setError(responseData.error ?? "Login failed. Please try again.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-[var(--color-surface-0)] z-0">
      <InteractiveBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 sm:mb-10 overflow-visible">
          <div className="relative w-[240px] sm:w-[320px] h-[70px] sm:h-[90px] transition-transform">
            <Image
              src="/images/vcc-logo-login.png"
              alt="Venture Chain Capital"
              fill
              className="object-contain logo-adaptive scale-[2] origin-center"
              priority
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-accent rounded-2xl p-5 sm:p-8 relative border border-[var(--color-border-accent)] shadow-[0_0_40px_rgba(0,0,0,0.5)] before:absolute before:inset-0 before:pointer-events-none before:rounded-2xl before:box-shadow-[0_0_15px_var(--color-vcc-green)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-[0.05]">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2 text-center text-[var(--color-text-primary)] tracking-wide">
            Member Login
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
            Enter your membership number and password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Membership Number */}
            <div>
              <label
                htmlFor="login-membership-no"
                className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-2"
              >
                Membership Number
              </label>
              <input
                id="login-membership-no"
                type="text"
                value={membershipNo}
                onChange={(event) => setMembershipNo(event.target.value)}
                placeholder="BWG2020M00001"
                required
                autoComplete="username"
                className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] focus:bg-[var(--color-surface-2)] transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-2"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] focus:bg-[var(--color-surface-2)] transition-all duration-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-[var(--color-vcc-green)] text-black hover:bg-green-400 focus:ring-4 focus:ring-[var(--color-vcc-green)]/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-vcc-green)] transition-colors duration-200"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
