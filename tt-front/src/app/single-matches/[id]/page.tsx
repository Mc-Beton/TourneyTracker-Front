"use client";

import { useEffect, useState, useRef } from "react";
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
  Calendar,
  MapPin,
  Trophy,
  Dumbbell,
  CheckCircle2,
  XCircle,
  Swords,
  Clock,
} from "lucide-react";

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const matchId = params.id ? Number(params.id) : null;
  // Początkowe załadowanie danych
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

  // Auto-refresh (polling) - odświeża dane co 3s podczas oczekiwania na gotowość/rozpoczęcie
  useEffect(() => {
    if (!auth.token || !matchId || !match) return;

    // Sprawdź czy mecz jest w fazie oczekiwania (nie zakończony i nie rozpoczęty)
    const isFinished = match.endTime !== null;
    const hasStarted = match.rounds.some(
      (r) =>
        r.player1 &&
        Object.keys(r.player1).length > 0 &&
        Object.values(r.player1).some((v) => v !== null && v !== 0),
    );

    // Polling tylko gdy mecz nie jest zakończony i nie rozpoczęty (faza gotowości)
    if (isFinished || hasStarted) {
      return;
    }

    // Funkcja odświeżająca dane
    const refreshData = async () => {
      // Nie odświeżaj gdy karta nie jest widoczna
      if (document.hidden) return;

      try {
        const updatedMatch = await getMatchSummary(matchId, auth.token);
        setMatch(updatedMatch);

        // Jeśli mecz się rozpoczął, przekieruj do scoring
        const matchHasStarted = updatedMatch.rounds.some(
          (r) =>
            r.player1 &&
            Object.keys(r.player1).length > 0 &&
            Object.values(r.player1).some((v) => v !== null && v !== 0),
        );
        if (matchHasStarted) {
          router.push(`/single-matches/${matchId}/scoring`);
        }
      } catch (e) {
        // Ciche niepowodzenie - nie przerywaj pollingu
        console.error("Polling error:", e);
      }
    };

    // Uruchom polling co 3 sekundy
    const interval = setInterval(refreshData, 3000);
    pollingIntervalRef.current = interval;

    // Page Visibility API - zatrzymaj/wznów polling gdy użytkownik zmienia kartę
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Karta niewidoczna - zatrzymaj polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        // Karta widoczna - odśwież dane i wznów polling
        refreshData();
        const newInterval = setInterval(refreshData, 3000);
        pollingIntervalRef.current = newInterval;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup po odmontowaniu komponentu
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [auth.token, matchId, match, router]);

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

  const player1Total = match.totalPointsByPlayer.P1 || 0;
  const player2Total = match.totalPointsByPlayer.P2 || 0;
  const winner =
    player1Total > player2Total
      ? "P1"
      : player2Total > player1Total
        ? "P2"
        : null;

  const isFinished = match.endTime !== null;

  // Określ gotowość każdego gracza na podstawie currentUserId
  const isCurrentUserPlayer1 = match.currentUserId === match.player1Id;
  const player1Ready = isCurrentUserPlayer1 ? match.ready : match.opponentReady;
  const player2Ready = isCurrentUserPlayer1 ? match.opponentReady : match.ready;

  // Określ status meczu
  const getMatchStatus = () => {
    if (isFinished) {
      return {
        label: "Zakończona",
        color: "bg-gray-100 text-gray-700 border-gray-300",
      };
    }
    if (
      match.rounds.length > 0 &&
      match.rounds.some((r) => Object.keys(r.player1).length > 0)
    ) {
      return {
        label: "W trakcie",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      };
    }
    if (match.ready && match.opponentReady) {
      return {
        label: "Gotowość",
        color: "bg-green-100 text-green-700 border-green-300",
      };
    }
    return {
      label: "Oczekiwanie",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    };
  };

  const matchStatus = getMatchStatus();

  const handleBackAction = () => {
    if (match?.tournamentId) {
      router.push(`/tournaments/${match.tournamentId}`);
    } else {
      router.back();
    }
  };

  return (
    <MainLayout backAction={handleBackAction}>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-2xl sm:text-3xl">
                    {match.matchName || `Mecz #${match.matchId}`}
                  </CardTitle>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${matchStatus.color}`}
                  >
                    {matchStatus.label}
                  </span>
                </div>
              </div>
              {!isFinished && (
                <div className="flex gap-2 flex-wrap">
                  {match.ready && match.opponentReady ? (
                    <>
                      {match.rounds.some(
                        (r) => r.player1 && Object.keys(r.player1).length > 0,
                      ) ? (
                        <Button
                          onClick={() =>
                            router.push(`/single-matches/${matchId}/scoring`)
                          }
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700 min-h-[44px]"
                        >
                          Kontynuuj
                        </Button>
                      ) : (
                        <Button
                          onClick={handleStart}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700 min-h-[44px]"
                        >
                          {processing ? "Rozpoczynanie..." : "Start"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={handleReady}
                      disabled={processing}
                      className="min-h-[44px] bg-green-600 hover:bg-green-700"
                    >
                      {processing ? "Ładowanie..." : "Ready"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Players VS Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Player 1 */}
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <h3 className="text-xl font-bold mb-2">{match.player1Name}</h3>
                {!isFinished && (
                  <>
                    {player1Ready ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-semibold">Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="w-6 h-6" />
                        <span className="font-semibold">Nie gotowy</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* VS */}
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Swords className="w-12 h-12 text-primary" />
                  <span className="text-2xl font-bold text-muted-foreground">
                    VS
                  </span>
                </div>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <h3 className="text-xl font-bold mb-2">{match.player2Name}</h3>
                {!isFinished && (
                  <>
                    {player2Ready ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-semibold">Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="w-6 h-6" />
                        <span className="font-semibold">Nie gotowy</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Szczegóły meczu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mode */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tryb</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      match.mode === "LIVE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {match.mode === "LIVE" ? "Live" : "Online"}
                  </span>
                </div>
              </div>

              {/* Primary Mission */}
              {match.primaryMission && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="mt-0.5">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Misja</p>
                    <p className="font-medium">{match.primaryMission}</p>
                  </div>
                </div>
              )}

              {/* Deployment */}
              {match.deployment && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="mt-0.5">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Rozmieszczenie
                    </p>
                    <p className="font-medium">{match.deployment}</p>
                  </div>
                </div>
              )}

              {/* Army Power */}
              {match.armyPower && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="mt-0.5">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Siła armii
                    </p>
                    <p className="font-medium">{match.armyPower}</p>
                  </div>
                </div>
              )}

              {/* Start Time */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start</p>
                  <p className="font-medium">
                    {new Date(match.startTime).toLocaleString("pl-PL")}
                  </p>
                </div>
              </div>

              {/* End Time */}
              {match.endTime && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="mt-0.5">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Koniec</p>
                    <p className="font-medium">
                      {new Date(match.endTime).toLocaleString("pl-PL")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rounds History */}
        {match.rounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Historia rund</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

                  // Calculate round totals
                  const roundP1Total = enabledScores.reduce(
                    (sum, scoreType) =>
                      sum + (round.player1[scoreType as ScoreType] || 0),
                    0,
                  );
                  const roundP2Total = enabledScores.reduce(
                    (sum, scoreType) =>
                      sum + (round.player2[scoreType as ScoreType] || 0),
                    0,
                  );

                  return (
                    <div
                      key={round.roundNumber}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                          Runda #{round.roundNumber}
                        </span>
                      </h4>
                      <div className="grid gap-3">
                        {enabledScores.map((scoreType) => {
                          const p1Score =
                            round.player1[scoreType as ScoreType] || 0;
                          const p2Score =
                            round.player2[scoreType as ScoreType] || 0;
                          const diff = Math.abs(p1Score - p2Score);

                          return (
                            <div
                              key={scoreType}
                              className="grid grid-cols-3 gap-2 items-center"
                            >
                              <div className="text-center">
                                <span
                                  className={`text-lg font-bold ${
                                    p1Score > p2Score
                                      ? "text-green-600"
                                      : p1Score < p2Score
                                        ? "text-muted-foreground"
                                        : ""
                                  }`}
                                >
                                  {p1Score}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {SCORE_TYPE_LABELS[scoreType as ScoreType] ||
                                    scoreType}
                                </p>
                                {diff > 0 && (
                                  <p className="text-xs font-medium text-primary">
                                    różnica: {diff}
                                  </p>
                                )}
                              </div>
                              <div className="text-center">
                                <span
                                  className={`text-lg font-bold ${
                                    p2Score > p1Score
                                      ? "text-green-600"
                                      : p2Score < p1Score
                                        ? "text-muted-foreground"
                                        : ""
                                  }`}
                                >
                                  {p2Score}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Round Total */}
                        <div className="grid grid-cols-3 gap-2 items-center mt-3 pt-3 border-t">
                          <div className="text-center">
                            <span
                              className={`text-2xl font-bold ${
                                roundP1Total > roundP2Total
                                  ? "text-green-600"
                                  : roundP1Total < roundP2Total
                                    ? "text-muted-foreground"
                                    : ""
                              }`}
                            >
                              {roundP1Total}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                              Suma rundy
                            </p>
                            {roundP1Total !== roundP2Total && (
                              <p className="text-xs text-primary mt-1">
                                różnica: {Math.abs(roundP1Total - roundP2Total)}
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <span
                              className={`text-2xl font-bold ${
                                roundP2Total > roundP1Total
                                  ? "text-green-600"
                                  : roundP2Total < roundP1Total
                                    ? "text-muted-foreground"
                                    : ""
                              }`}
                            >
                              {roundP2Total}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Suma punktów
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Grand Total */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
              <div
                className={`text-center p-4 rounded-lg ${
                  winner === "P1"
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-card"
                }`}
              >
                <p className="text-sm text-muted-foreground mb-1">
                  {match.player1Name}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {player1Total}
                </p>
                {winner === "P1" && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-semibold">Zwycięzca</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">
                  RAZEM
                </span>
              </div>
              <div
                className={`text-center p-4 rounded-lg ${
                  winner === "P2"
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-card"
                }`}
              >
                <p className="text-sm text-muted-foreground mb-1">
                  {match.player2Name}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {player2Total}
                </p>
                {winner === "P2" && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-semibold">Zwycięzca</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground mb-4">
                Szczegółowy podział punktów
              </h4>
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
                .map((scoreType) => {
                  const p1Score =
                    match.totalsByPlayerAndType.P1?.[scoreType as ScoreType] ||
                    0;
                  const p2Score =
                    match.totalsByPlayerAndType.P2?.[scoreType as ScoreType] ||
                    0;
                  const diff = Math.abs(p1Score - p2Score);

                  return (
                    <div
                      key={scoreType}
                      className="grid grid-cols-3 gap-2 items-center p-3 rounded-lg bg-muted/30"
                    >
                      <div className="text-center">
                        <span
                          className={`text-xl font-bold ${
                            p1Score > p2Score
                              ? "text-green-600"
                              : p1Score < p2Score
                                ? "text-muted-foreground"
                                : ""
                          }`}
                        >
                          {p1Score}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1">
                          {SCORE_TYPE_LABELS[scoreType as ScoreType] ||
                            scoreType}
                        </p>
                        {diff > 0 && (
                          <p className="text-xs text-primary">+{diff}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <span
                          className={`text-xl font-bold ${
                            p2Score > p1Score
                              ? "text-green-600"
                              : p2Score < p1Score
                                ? "text-muted-foreground"
                                : ""
                          }`}
                        >
                          {p2Score}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
