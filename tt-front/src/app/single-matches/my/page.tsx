"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { getMySingleMatches } from "@/lib/api/singleMatches";
import type { SingleMatchResponseDTO } from "@/lib/types/singleMatch";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>System gry</TableHead>
                    <TableHead>Gracz 1</TableHead>
                    <TableHead>Gracz 2</TableHead>
                    <TableHead>Tryb</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => {
                    // Determine match status
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
                      <TableRow key={match.matchId}>
                        <TableCell className="font-medium">
                          {match.matchName || `Mecz #${match.matchId}`}
                        </TableCell>
                        <TableCell>{match.gameSystemName}</TableCell>
                        <TableCell>{match.player1Name}</TableCell>
                        <TableCell>{match.player2Name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              match.mode === "LIVE"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {match.mode === "LIVE" ? "Live" : "Online"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/single-matches/${match.matchId}`}>
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
