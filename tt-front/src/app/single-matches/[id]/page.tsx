"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getMatchSummary,
  reportReady,
  startMatch,
} from "@/lib/api/singleMatches";
import type { MatchSummaryDTO, ScoreType } from "@/lib/types/singleMatch";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  MAIN_SCORE: "Primary points",
  SECONDARY_SCORE: "Secondary points",
  THIRD_SCORE: "Auxiliary points",
  ADDITIONAL_SCORE: "Additional points",
};

export default function SingleMatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const [match, setMatch] = useState<MatchSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const matchId = params.id ? Number(params.id) : null;

  useEffect(() => {
    if (!auth.token || !matchId) {
      setError("Nieprawidłowy ID meczu lub brak autoryzacji");
      setLoading(false);
      return;
    }

    getMatchSummary(matchId, auth.token)
      .then(setMatch)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Nieznany błąd"),
      )
      .finally(() => setLoading(false));
  }, [auth.token, matchId]);

  async function handleReady() {
    if (!auth.token || !matchId) return;

    setProcessing(true);
    setError(null);

    try {
      await reportReady(matchId, auth.token);
      // Odśwież dane meczu
      const updatedMatch = await getMatchSummary(matchId, auth.token);
      setMatch(updatedMatch);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Błąd podczas zgłaszania gotowości",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleStart() {
    if (!auth.token || !matchId) return;

    setProcessing(true);
    setError(null);

    try {
      await startMatch(matchId, auth.token);
      // Przekieruj do widoku scoring
      router.push(`/single-matches/${matchId}/scoring`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Błąd podczas rozpoczynania meczu",
      );
      setProcessing(false);
    }
  }

  if (loading)
    return (
      <MainLayout>
        <div>Ładowanie...</div>
      </MainLayout>
    );

  if (error || !match)
    return (
      <MainLayout>
        <div className="text-destructive">
          Błąd: {error || "Nie znaleziono meczu"}
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-2xl sm:text-3xl">
                  {match.matchName || `Mecz #${match.matchId}`}
                </CardTitle>
                {match.matchName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ID meczu: #{match.matchId}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {match.ready && match.opponentReady ? (
                  <>
                    {match.rounds.some(
                      (r) =>
                        r.player1 &&
                        Object.keys(r.player1).length > 0 &&
                        Object.values(r.player1).some(
                          (v) => v !== null && v !== 0,
                        ),
                    ) ? (
                      <Button
                        onClick={() =>
                          router.push(`/single-matches/${matchId}/scoring`)
                        }
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Kontynuuj
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStart}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing ? "Rozpoczynanie..." : "Start"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={handleReady} disabled={processing}>
                    {processing ? "Ładowanie..." : "Ready"}
                  </Button>
                )}
                <Button onClick={() => router.push("/single-matches/my")}>
                  Powrót
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Gracze</h3>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Gracz 1:</span>{" "}
                  {match.player1Name}
                  {match.ready && (
                    <span className="text-green-600 font-semibold text-sm">
                      Ready
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Gracz 2:</span>{" "}
                  {match.player2Name}
                  {match.opponentReady && (
                    <span className="text-green-600 font-semibold text-sm">
                      Ready
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Informacje o meczu
                </h3>
                <p>
                  <span className="font-medium">Tryb:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      match.mode === "LIVE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {match.mode === "LIVE" ? "Live" : "Online"}
                  </span>
                </p>
                {match.primaryMission && (
                  <p>
                    <span className="font-medium">Misja:</span>{" "}
                    {match.primaryMission}
                  </p>
                )}
                {match.deployment && (
                  <p>
                    <span className="font-medium">Rozmieszczenie:</span>{" "}
                    {match.deployment}
                  </p>
                )}
                {match.armyPower && (
                  <p>
                    <span className="font-medium">Siła armii:</span>{" "}
                    {match.armyPower}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Czas</h3>
              <p>
                <span className="font-medium">Start:</span>{" "}
                {new Date(match.startTime).toLocaleString("pl-PL")}
              </p>
              {match.endTime && (
                <p>
                  <span className="font-medium">Koniec:</span>{" "}
                  {new Date(match.endTime).toLocaleString("pl-PL")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {match.rounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Historia rund</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Runda</TableHead>
                      <TableHead>Rodzaj punktów</TableHead>
                      <TableHead className="text-center">
                        {match.player1Name}
                      </TableHead>
                      <TableHead className="text-center">
                        {match.player2Name}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {match.rounds.map((round) => {
                      const enabledScores = Object.keys(round.player1).filter(
                        (scoreType) => {
                          if (scoreType === "MAIN_SCORE")
                            return match.primaryScoreEnabled;
                          if (scoreType === "SECONDARY_SCORE")
                            return match.secondaryScoreEnabled;
                          if (scoreType === "THIRD_SCORE")
                            return match.thirdScoreEnabled;
                          if (scoreType === "ADDITIONAL_SCORE")
                            return match.additionalScoreEnabled;
                          return false;
                        },
                      );

                      return enabledScores.map((scoreType, idx) => (
                        <TableRow key={`${round.roundNumber}-${scoreType}`}>
                          {idx === 0 && (
                            <TableCell
                              rowSpan={enabledScores.length}
                              className="font-medium text-center align-middle"
                            >
                              #{round.roundNumber}
                            </TableCell>
                          )}
                          <TableCell className="font-medium text-muted-foreground">
                            {SCORE_TYPE_LABELS[scoreType as ScoreType] ||
                              scoreType}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {round.player1[scoreType as ScoreType]}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {round.player2[scoreType as ScoreType]}
                          </TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Suma punktów</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ punktacji</TableHead>
                    <TableHead className="text-center">
                      {match.player1Name}
                    </TableHead>
                    <TableHead className="text-center">
                      {match.player2Name}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(match.totalsByPlayerAndType.P1 || {})
                    .filter((scoreType) => {
                      if (scoreType === "MAIN_SCORE")
                        return match.primaryScoreEnabled;
                      if (scoreType === "SECONDARY_SCORE")
                        return match.secondaryScoreEnabled;
                      if (scoreType === "THIRD_SCORE")
                        return match.thirdScoreEnabled;
                      if (scoreType === "ADDITIONAL_SCORE")
                        return match.additionalScoreEnabled;
                      return false;
                    })
                    .map((scoreType) => (
                      <TableRow key={scoreType}>
                        <TableCell>
                          {SCORE_TYPE_LABELS[scoreType as ScoreType] ||
                            scoreType}
                        </TableCell>
                        <TableCell className="text-center">
                          {match.totalsByPlayerAndType.P1?.[
                            scoreType as ScoreType
                          ] || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {match.totalsByPlayerAndType.P2?.[
                            scoreType as ScoreType
                          ] || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  <TableRow className="font-bold bg-muted">
                    <TableCell>RAZEM</TableCell>
                    <TableCell className="text-center">
                      {match.totalPointsByPlayer.P1 || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {match.totalPointsByPlayer.P2 || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
