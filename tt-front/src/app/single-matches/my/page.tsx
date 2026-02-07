"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { getMySingleMatches } from "@/lib/api/singleMatches";
import type { SingleMatchResponseDTO } from "@/lib/types/singleMatch";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MySingleMatchesPage() {
  const auth = useAuth();
  const [matches, setMatches] = useState<SingleMatchResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.token) {
      setError("Musisz być zalogowany");
      setLoading(false);
      return;
    }

    getMySingleMatches(auth.token)
      .then((data) => {
        console.log("Match data from API:", data);
        setMatches(data);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Nieznany błąd"),
      )
      .finally(() => setLoading(false));
  }, [auth.token]);

  if (loading)
    return (
      <MainLayout>
        <div>Ładowanie...</div>
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout>
        <div className="text-destructive">Błąd: {error}</div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-2xl sm:text-3xl">Moje gry</CardTitle>
            <Link href="/single-matches/new">
              <Button>Utwórz nową grę lokalną</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-sm sm:text-base">
              Nie masz jeszcze żadnych gier
            </p>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                let statusLabel = "Oczekuje";
                let statusColor = "bg-gray-100 text-gray-800";

                if (match.endTime) {
                  statusLabel = "Zakończona";
                  statusColor = "bg-red-100 text-red-800";
                } else if (match.player1ready && match.player2ready) {
                  statusLabel = "W trakcie";
                  statusColor = "bg-green-100 text-green-800";
                } else if (match.player1ready || match.player2ready) {
                  statusLabel = "Gotowość";
                  statusColor = "bg-yellow-100 text-yellow-800";
                }

                return (
                  <Link
                    key={match.matchId}
                    href={`/single-matches/${match.matchId}`}
                    className="block bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Lewa strona: Nazwa + System */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-primary hover:underline mb-1">
                          {match.matchName || `Mecz #${match.matchId}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {match.gameSystemName}
                        </p>

                        {/* Po środku: Gracz vs Gracz */}
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span>{match.player1Name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span>{match.player2Name}</span>
                        </div>
                      </div>

                      {/* Prawa strona: Tryb + Status */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            match.mode === "LIVE"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {match.mode === "LIVE" ? "Live" : "Online"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
