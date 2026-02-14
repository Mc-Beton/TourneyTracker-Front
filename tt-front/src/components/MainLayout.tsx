"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";

export default function MainLayout({
  children,
  backAction,
}: {
  children: React.ReactNode;
  backAction?: () => void;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomePage = pathname === "/" || pathname === "/tournaments";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md px-3 sm:px-6 py-3 relative">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button - Left Side */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 border border-white rounded-lg hover:bg-white/20 text-primary-foreground flex-shrink-0"
              aria-label="Menu"
            >
              <span className="text-xl">☰</span>
            </button>

            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Image
                src="/logo.png"
                alt="WarBracket Logo"
                width={128}
                height={128}
                className="h-24 sm:h-32 w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex gap-3">
              {mounted && auth.isAuthenticated && (
                <>
                  <Link
                    href="/tournaments/my"
                    className="hover:underline whitespace-nowrap text-primary-foreground"
                  >
                    Moje turnieje
                  </Link>
                  <Link
                    href="/single-matches/my"
                    className="hover:underline whitespace-nowrap text-primary-foreground"
                  >
                    Własne gry
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {mounted ? (
              <>
                {auth.isAuthenticated && <NotificationBell />}

                {/* Mobile User Icon */}
                <button
                  onClick={() => {
                    if (auth.isAuthenticated) router.push("/profile");
                    else router.push("/login");
                  }}
                  className="md:hidden flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-white/20 text-primary-foreground"
                  title={auth.isAuthenticated ? "Profil" : "Zaloguj się"}
                  aria-label="Profil użytkownika"
                >
                  <span className="text-lg">👤</span>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (auth.isAuthenticated) router.push("/profile");
                      else router.push("/login");
                    }}
                    className="flex items-center gap-2 border border-white rounded-full px-3 py-2 hover:bg-white/20 text-primary-foreground min-h-[44px]"
                    title={auth.isAuthenticated ? "Profil" : "Zaloguj się"}
                  >
                    <span className="text-lg">👤</span>
                    {auth.isAuthenticated && auth.username && (
                      <span className="text-sm">{auth.username}</span>
                    )}
                  </button>

                  {auth.isAuthenticated ? (
                    <button
                      onClick={() => {
                        if (confirm("Czy na pewno chcesz się wylogować?")) {
                          auth.logout();
                          router.push("/");
                        }
                      }}
                      className="border border-white rounded-lg px-3 py-2 hover:bg-white/20 text-sm text-primary-foreground min-h-[44px]"
                    >
                      Wyloguj
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="border border-white rounded-lg px-3 py-2 hover:bg-white/20 text-sm text-primary-foreground min-h-[44px] flex items-center"
                    >
                      Zaloguj
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && mounted && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && mounted && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-[#00BCD4] shadow-lg z-50 border-t border-white/20">
            <div className="px-3 py-3 space-y-2">
              {auth.isAuthenticated ? (
                <>
                  <Link
                    href="/tournaments/my"
                    className="block py-2 px-3 hover:bg-white/10 rounded text-primary-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Moje turnieje
                  </Link>
                  <Link
                    href="/single-matches/my"
                    className="block py-2 px-3 hover:bg-white/10 rounded text-primary-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Własne gry
                  </Link>
                  <hr className="border-white/20 my-2" />
                  <Link
                    href="/profile"
                    className="block py-2 px-3 hover:bg-white/10 rounded text-primary-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Czy na pewno chcesz się wylogować?")) {
                        auth.logout();
                        router.push("/");
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="block w-full text-left py-2 px-3 hover:bg-white/10 rounded text-primary-foreground"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-white/20 my-2" />
                  <Link
                    href="/login"
                    className="block py-2 px-3 hover:bg-white/10 rounded text-primary-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href="/register"
                    className="block py-2 px-3 hover:bg-white/10 rounded text-primary-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Zarejestruj się
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {!isHomePage && (
          <div className="mb-3 sm:mb-4">
            <Button
              variant="outline"
              onClick={() => (backAction ? backAction() : router.back())}
              className="gap-2 text-sm"
              size="sm"
            >
              ← Wróć
            </Button>
          </div>
        )}
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground px-3 sm:px-6 py-3 sm:py-4 text-xs opacity-90">
        © {new Date().getFullYear()} WarBracket
      </footer>
    </div>
  );
}
