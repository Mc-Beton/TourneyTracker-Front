"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomePage = pathname === "/" || pathname === "/tournaments";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Link
              href="/"
              className="font-bold text-base sm:text-lg hover:opacity-80 whitespace-nowrap"
            >
              Turnieje
            </Link>

            <nav className="hidden sm:flex gap-3">
              <Link
                href="/tournaments"
                className="hover:underline whitespace-nowrap"
              >
                Lista
              </Link>
              {mounted && auth.isAuthenticated && (
                <>
                  <Link
                    href="/tournaments/my"
                    className="hover:underline whitespace-nowrap"
                  >
                    Moje turnieje
                  </Link>
                  <Link
                    href="/tournaments/new"
                    className="hover:underline whitespace-nowrap"
                  >
                    Utwórz turniej
                  </Link>
                  <Link
                    href="/single-matches/my"
                    className="hover:underline whitespace-nowrap"
                  >
                    Własne gry
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {mounted ? (
              <>
                <button
                  onClick={() => {
                    if (auth.isAuthenticated) router.push("/profile");
                    else router.push("/login");
                  }}
                  className="flex items-center gap-1 sm:gap-2 border rounded-full px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-accent"
                  title={auth.isAuthenticated ? "Profil" : "Zaloguj się"}
                >
                  <span className="text-base sm:text-lg">👤</span>
                  {auth.isAuthenticated && auth.username && (
                    <span className="text-xs sm:text-sm hidden md:inline">
                      {auth.username}
                    </span>
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
                    className="border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-accent text-xs sm:text-sm"
                  >
                    Wyloguj
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-accent text-xs sm:text-sm"
                  >
                    Zaloguj
                  </Link>
                )}
              </>
            ) : (
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {!isHomePage && (
          <div className="mb-3 sm:mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2 text-sm"
              size="sm"
            >
              ← Wróć
            </Button>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t px-3 sm:px-6 py-3 sm:py-4 text-xs opacity-80">
        © {new Date().getFullYear()} Turnieje
      </footer>
    </div>
  );
}
