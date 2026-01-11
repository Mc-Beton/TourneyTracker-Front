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
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg hover:opacity-80">
              Turnieje
            </Link>

            <nav className="flex gap-3">
              <Link href="/tournaments" className="hover:underline">
                Lista
              </Link>
              {auth.isAuthenticated && (
                <>
                  <Link href="/tournaments/my" className="hover:underline">
                    Moje turnieje
                  </Link>
                  <Link href="/tournaments/new" className="hover:underline">
                    Utwórz turniej
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {mounted ? (
              <>
                <button
                  onClick={() => {
                    if (auth.isAuthenticated) router.push("/profile");
                    else router.push("/login");
                  }}
                  className="flex items-center gap-2 border rounded-full px-3 py-2 hover:bg-accent"
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
                    className="border rounded-lg px-3 py-2 hover:bg-accent"
                  >
                    Wyloguj
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="border rounded-lg px-3 py-2 hover:bg-accent"
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

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {!isHomePage && (
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              ← Wróć
            </Button>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t px-6 py-4 text-xs opacity-80">
        © {new Date().getFullYear()} Turnieje
      </footer>
    </div>
  );
}
