"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getMatchScoring,
  submitRoundScores,
  startRound,
  endRound,
  finishMatch,
} from "@/lib/api/scoring";
import type {
  MatchScoringDTO,
  RoundScoresDTO,
  ScoreEntryDTO,
  MatchSide,
} from "@/lib/types/scoring";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MatchScoringPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const [matchData, setMatchData] = useState<MatchScoringDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editingRound, setEditingRound] = useState<number | null>(null);

  // Formularze
  const [p1Main, setP1Main] = useState("");
  const [p1Secondary, setP1Secondary] = useState("");
  const [p2Main, setP2Main] = useState("");
  const [p2Secondary, setP2Secondary] = useState("");

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);

  const matchId = params.id ? Number(params.id) : null;

  useEffect(() => {
    if (!auth.token || !matchId) {
      setError("Nieprawidłowy ID meczu lub brak autoryzacji");
      setLoading(false);
      return;
    }

    loadMatchData();
  }, [auth.token, matchId]);

  // Timer dla aktualnej rundy
  useEffect(() => {
    if (!matchData) return;

    const currentRoundData = matchData.rounds.find(
      (r) => r.roundNumber === matchData.currentRound,
    );
    if (!currentRoundData?.startTime) return;

    const interval = setInterval(() => {
      const start = new Date(currentRoundData.startTime!).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [matchData]);

  async function loadMatchData() {
    if (!auth.token || !matchId) return;

    try {
      const data = await getMatchScoring(matchId, auth.token);
      setMatchData(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd ładowania danych");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRound() {
    if (!auth.token || !matchId) return;

    setProcessing(true);
    try {
      const updated = await startRound(matchId, auth.token);
      setMatchData(updated);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd rozpoczynania rundy");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSubmitScores(roundNumber: number) {
    if (!auth.token || !matchId) return;

    const scores: ScoreEntryDTO[] = [];

    if (p1Main) {
      scores.push({
        side: "PLAYER1" as MatchSide,
        scoreType: "MAIN_SCORE",
        score: parseInt(p1Main),
      });
    }
    if (p1Secondary) {
      scores.push({
        side: "PLAYER1" as MatchSide,
        scoreType: "SECONDARY_SCORE",
        score: parseInt(p1Secondary),
      });
    }
    if (p2Main) {
      scores.push({
        side: "PLAYER2" as MatchSide,
        scoreType: "MAIN_SCORE",
        score: parseInt(p2Main),
      });
    }
    if (p2Secondary) {
      scores.push({
        side: "PLAYER2" as MatchSide,
        scoreType: "SECONDARY_SCORE",
        score: parseInt(p2Secondary),
      });
    }

    if (scores.length === 0) {
      setError("Wprowadź przynajmniej jeden wynik");
      return;
    }

    setProcessing(true);
    try {
      const updated = await submitRoundScores(
        matchId,
        { roundNumber, scores },
        auth.token,
      );
      setMatchData(updated);
      setError(null);
      // Clear form
      setP1Main("");
      setP1Secondary("");
      setP2Main("");
      setP2Secondary("");
      setEditingRound(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd zapisywania wyników");
    } finally {
      setProcessing(false);
    }
  }

  async function handleEndRound(roundNumber: number) {
    if (!auth.token || !matchId) return;

    setProcessing(true);
    setError(null);

    try {
      // Najpierw zapisz wyniki jeśli są jakieś w formularzu
      const scores: ScoreEntryDTO[] = [];

      if (p1Main) {
        scores.push({
          side: "PLAYER1" as MatchSide,
          scoreType: "MAIN_SCORE",
          score: parseInt(p1Main),
        });
      }
      if (p1Secondary) {
        scores.push({
          side: "PLAYER1" as MatchSide,
          scoreType: "SECONDARY_SCORE",
          score: parseInt(p1Secondary),
        });
      }
      if (p2Main) {
        scores.push({
          side: "PLAYER2" as MatchSide,
          scoreType: "MAIN_SCORE",
          score: parseInt(p2Main),
        });
      }
      if (p2Secondary) {
        scores.push({
          side: "PLAYER2" as MatchSide,
          scoreType: "SECONDARY_SCORE",
          score: parseInt(p2Secondary),
        });
      }

      // Zapisz wyniki jeśli są
      if (scores.length > 0) {
        await submitRoundScores(matchId, { roundNumber, scores }, auth.token);
      }

      // Potem zakończ rundę
      const updated = await endRound(matchId, roundNumber, auth.token);
      setMatchData(updated);

      // Wyczyść formularz
      setP1Main("");
      setP1Secondary("");
      setP2Main("");
      setP2Secondary("");
      setEditingRound(null);

      // Automatycznie rozpocznij następną rundę jeśli istnieje
      if (updated.currentRound <= updated.totalRounds) {
        await startRound(matchId, auth.token);
        const finalData = await getMatchScoring(matchId, auth.token);
        setMatchData(finalData);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd kończenia rundy");
    } finally {
      setProcessing(false);
    }
  }

  async function handleFinishMatch() {
    if (!auth.token || !matchId) return;

    setProcessing(true);
    setError(null);

    try {
      // Najpierw zapisz wyniki jeśli są jakieś w formularzu
      const scores: ScoreEntryDTO[] = [];

      if (p1Main) {
        scores.push({
          side: "PLAYER1" as MatchSide,
          scoreType: "MAIN_SCORE",
          score: parseInt(p1Main),
        });
      }
      if (p1Secondary) {
        scores.push({
          side: "PLAYER1" as MatchSide,
          scoreType: "SECONDARY_SCORE",
          score: parseInt(p1Secondary),
        });
      }
      if (p2Main) {
        scores.push({
          side: "PLAYER2" as MatchSide,
          scoreType: "MAIN_SCORE",
          score: parseInt(p2Main),
        });
      }
      if (p2Secondary) {
        scores.push({
          side: "PLAYER2" as MatchSide,
          scoreType: "SECONDARY_SCORE",
          score: parseInt(p2Secondary),
        });
      }

      // Zapisz wyniki jeśli są
      if (scores.length > 0) {
        await submitRoundScores(
          matchId,
          { roundNumber: matchData!.currentRound, scores },
          auth.token,
        );
      }

      // Zakończ mecz
      await finishMatch(matchId, auth.token);

      // Przekieruj do strony szczegółów
      router.push(`/single-matches/${matchId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd kończenia rozgrywki");
    } finally {
      setProcessing(false);
    }
  }

  function loadRoundForEdit(round: RoundScoresDTO) {
    setEditingRound(round.roundNumber);
    setP1Main(round.player1MainScore?.toString() || "");
    setP1Secondary(round.player1SecondaryScore?.toString() || "");
    setP2Main(round.player2MainScore?.toString() || "");
    setP2Secondary(round.player2SecondaryScore?.toString() || "");
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  if (loading)
    return (
      <MainLayout>
        <div>Ładowanie...</div>
      </MainLayout>
    );

  if (error && !matchData)
    return (
      <MainLayout>
        <div className="text-destructive">Błąd: {error}</div>
      </MainLayout>
    );

  if (!matchData)
    return (
      <MainLayout>
        <div>Brak danych meczu</div>
      </MainLayout>
    );

  const currentRoundData = matchData.rounds.find(
    (r) => r.roundNumber === matchData.currentRound,
  );
  const previousRounds = matchData.rounds.filter(
    (r) => r.roundNumber < matchData.currentRound,
  );

  const isEditingCurrent = editingRound === matchData.currentRound;
  const isEditingPrevious =
    editingRound !== null && editingRound < matchData.currentRound;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  {matchData.matchName || `Mecz #${matchData.matchId}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {matchData.player1Name} vs {matchData.player2Name}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/single-matches/my")}
              >
                Powrót
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Komunikat o zakończonym meczu */}
        {matchData.status === "FINISHED" && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏁</span>
              <div>
                <p className="font-semibold">Rozgrywka zakończona</p>
                <p className="text-sm">
                  {matchData.endTime &&
                    `Zakończono: ${new Date(matchData.endTime).toLocaleString("pl-PL")}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Aktualna Runda */}
        <Card className="border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                🎯 Runda {matchData.currentRound} / {matchData.totalRounds}
              </CardTitle>
              {currentRoundData?.startTime &&
                matchData.status !== "FINISHED" && (
                  <div className="text-2xl font-bold tabular-nums">
                    ⏱️ {formatTime(elapsedTime)}
                  </div>
                )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!currentRoundData?.startTime ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Runda nie została jeszcze rozpoczęta
                </p>
                <Button
                  onClick={handleStartRound}
                  disabled={processing || matchData.status === "FINISHED"}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? "Ładowanie..." : "Rozpocznij rundę"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Formularz wyników */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Player 1 */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      {matchData.player1Name}
                    </h3>
                    {matchData.primaryScoreEnabled && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Primary Score
                        </label>
                        <Input
                          type="number"
                          value={p1Main}
                          onChange={(e) => setP1Main(e.target.value)}
                          placeholder="0"
                          min="0"
                          disabled={matchData.status === "FINISHED"}
                        />
                      </div>
                    )}
                    {matchData.secondaryScoreEnabled && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Secondary Score
                        </label>
                        <Input
                          type="number"
                          value={p1Secondary}
                          onChange={(e) => setP1Secondary(e.target.value)}
                          placeholder="0"
                          min="0"
                          disabled={matchData.status === "FINISHED"}
                        />
                      </div>
                    )}
                  </div>

                  {/* Player 2 */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      {matchData.player2Name}
                    </h3>
                    {matchData.primaryScoreEnabled && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Primary Score
                        </label>
                        <Input
                          type="number"
                          value={p2Main}
                          onChange={(e) => setP2Main(e.target.value)}
                          placeholder="0"
                          min="0"
                          disabled={matchData.status === "FINISHED"}
                        />
                      </div>
                    )}
                    {matchData.secondaryScoreEnabled && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Secondary Score
                        </label>
                        <Input
                          type="number"
                          value={p2Secondary}
                          onChange={(e) => setP2Secondary(e.target.value)}
                          placeholder="0"
                          min="0"
                          disabled={matchData.status === "FINISHED"}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Przyciski akcji */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() =>
                      handleSubmitScores(editingRound || matchData.currentRound)
                    }
                    disabled={processing || matchData.status === "FINISHED"}
                    className="flex-1"
                  >
                    {processing
                      ? "Zapisywanie..."
                      : isEditingPrevious
                        ? "Zapisz zmiany"
                        : "Zapisz wyniki"}
                  </Button>
                  {currentRoundData.status === "IN_PROGRESS" &&
                    matchData.status !== "FINISHED" && (
                      <Button
                        onClick={() =>
                          matchData.currentRound === matchData.totalRounds
                            ? handleFinishMatch()
                            : handleEndRound(matchData.currentRound)
                        }
                        disabled={processing}
                        variant="outline"
                        className={
                          matchData.currentRound === matchData.totalRounds
                            ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                            : ""
                        }
                      >
                        {matchData.currentRound === matchData.totalRounds
                          ? "Zakończ rozgrywkę"
                          : "Zakończ rundę"}
                      </Button>
                    )}
                  {isEditingPrevious && (
                    <Button
                      onClick={() => {
                        setEditingRound(null);
                        setP1Main("");
                        setP1Secondary("");
                        setP2Main("");
                        setP2Secondary("");
                      }}
                      variant="ghost"
                    >
                      Anuluj
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historia poprzednich rund */}
        {previousRounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📋 Historia rund
                {matchData.status !== "FINISHED" && " (kliknij aby edytować)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousRounds
                  .sort((a, b) => b.roundNumber - a.roundNumber)
                  .map((round) => (
                    <div
                      key={round.roundNumber}
                      onClick={() =>
                        matchData.status !== "FINISHED" &&
                        loadRoundForEdit(round)
                      }
                      className={`p-4 border rounded-lg transition-colors ${
                        matchData.status === "FINISHED"
                          ? "cursor-default"
                          : "cursor-pointer hover:bg-muted/50"
                      } ${
                        editingRound === round.roundNumber
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold mb-3 text-base">
                            Runda #{round.roundNumber}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Player 1 */}
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {matchData.player1Name}
                              </div>
                              {matchData.primaryScoreEnabled && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Primary:
                                  </span>
                                  <span className="font-semibold">
                                    {round.player1MainScore ?? "-"}
                                  </span>
                                </div>
                              )}
                              {matchData.secondaryScoreEnabled && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Secondary:
                                  </span>
                                  <span className="font-semibold">
                                    {round.player1SecondaryScore ?? "-"}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Player 2 */}
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {matchData.player2Name}
                              </div>
                              {matchData.primaryScoreEnabled && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Primary:
                                  </span>
                                  <span className="font-semibold">
                                    {round.player2MainScore ?? "-"}
                                  </span>
                                </div>
                              )}
                              {matchData.secondaryScoreEnabled && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Secondary:
                                  </span>
                                  <span className="font-semibold">
                                    {round.player2SecondaryScore ?? "-"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                          {round.endTime
                            ? `Zakończona ${new Date(
                                round.endTime,
                              ).toLocaleTimeString("pl-PL")}`
                            : "W trakcie"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
