"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  TournamentRoundViewDTO,
  ParticipantStatsDTO,
  PodiumDTO,
  RoundStatusDTO,
  RoundStartMode,
} from "@/lib/types/tournament";
import type { TournamentRoundDefinitionDTO } from "@/lib/types/roundDefinition";
import {
  getTournamentRoundsView,
  getParticipantStats,
  getPodium,
  startRound,
  extendSubmissionDeadline,
  completeTournament,
  getRoundStatusForOrganizer,
  startIndividualMatch,
} from "@/lib/api/tournament-rounds";
import { getRoundDefinitions } from "@/lib/api/roundDefinitions";
import { RoundInfoCard } from "./RoundInfoCard";
import { useAuth } from "@/lib/auth/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TournamentRoundsProps {
  tournamentId: number;
  isOrganizer: boolean;
  tournamentStatus: string;
  numberOfRounds: number;
  roundStartMode?: RoundStartMode;
  gameSystemId: number;
}

export function TournamentRounds({
  tournamentId,
  isOrganizer,
  tournamentStatus,
  numberOfRounds,
  roundStartMode,
  gameSystemId,
}: TournamentRoundsProps) {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<"rounds" | "stats">("rounds");
  const [selectedRound, setSelectedRound] = useState(1);
  const [rounds, setRounds] = useState<TournamentRoundViewDTO[]>([]);
  const [roundDefinitions, setRoundDefinitions] = useState<
    TournamentRoundDefinitionDTO[]
  >([]);
  const [stats, setStats] = useState<ParticipantStatsDTO[]>([]);
  const [podium, setPodium] = useState<PodiumDTO | null>(null);
  const [roundStatus, setRoundStatus] = useState<RoundStatusDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    loadRoundsData();
    loadStatsData();
    loadRoundDefinitions();
    if (tournamentStatus === "COMPLETED") {
      loadPodiumData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, tournamentStatus]);

  // Auto-refresh round status and match data for organizers during IN_PROGRESS
  useEffect(() => {
    if (isOrganizer && tournamentStatus === "IN_PROGRESS") {
      loadRoundStatus();
      const statusInterval = setInterval(loadRoundStatus, 30000); // Refresh every 30s

      // Also refresh rounds data less frequently to update match statuses
      const roundsInterval = setInterval(loadRoundsData, 15000); // Refresh every 15s

      // Refresh stats to show updated tournament points
      const statsInterval = setInterval(loadStatsData, 20000); // Refresh every 20s

      return () => {
        clearInterval(statusInterval);
        clearInterval(roundsInterval);
        clearInterval(statsInterval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, selectedRound, isOrganizer, tournamentStatus]);

  // Timer countdown
  useEffect(() => {
    const currentRound = rounds.find((r) => r.roundNumber === selectedRound);
    if (!currentRound?.matches || currentRound.matches.length === 0) {
      setTimeRemaining("");
      return;
    }

    // Check if round is completed - stop timer
    const isRoundCompleted = currentRound.matches.every(
      (m) =>
        m.status === "COMPLETED" ||
        m.status === "FINISHED" ||
        m.gameEndTime != null,
    );

    if (isRoundCompleted) {
      setTimeRemaining("🏁 Runda zakończona");
      return;
    }

    // Get first match to check times (all matches in round have same times)
    const firstMatch = currentRound.matches[0];
    if (
      !firstMatch?.resultSubmissionDeadline ||
      !firstMatch.startTime ||
      !firstMatch.gameDurationMinutes
    ) {
      setTimeRemaining("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(firstMatch.resultSubmissionDeadline!);
      const startTime = new Date(firstMatch.startTime!);
      const gameEnd = new Date(
        startTime.getTime() + firstMatch.gameDurationMinutes * 60000,
      );

      // Najpierw odliczamy czas gry
      if (now < gameEnd) {
        const diff = gameEnd.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(
          `⏰ Czas rundy: ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
        return;
      }

      // Po zakończeniu czasu gry - odliczamy czas na składanie wyników
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("❌ Czas na składanie wyników minął");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `⚠️ Czas na wyniki: ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [rounds, selectedRound]);

  async function loadRoundsData() {
    try {
      const data = await getTournamentRoundsView(tournamentId);
      setRounds(data);
    } catch (e) {
      console.error("Error loading rounds:", e);
    }
  }

  async function loadRoundDefinitions() {
    try {
      const data = await getRoundDefinitions(tournamentId, auth.token);
      setRoundDefinitions(data);
    } catch (e) {
      console.error("Error loading round definitions:", e);
    }
  }

  async function loadStatsData() {
    try {
      const data = await getParticipantStats(tournamentId);
      setStats(data);
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  }

  async function loadPodiumData() {
    try {
      const data = await getPodium(tournamentId);
      setPodium(data);
    } catch (e) {
      console.error("Error loading podium:", e);
    }
  }

  async function loadRoundStatus() {
    if (!auth.token) return;
    try {
      const data = await getRoundStatusForOrganizer(
        tournamentId,
        selectedRound,
        auth.token,
      );
      setRoundStatus(data);
    } catch (e) {
      console.error("Error loading round status:", e);
    }
  }

  async function handleStartRound() {
    if (!auth.token) return;
    try {
      setLoading(true);
      setError(null);
      await startRound(tournamentId, selectedRound, auth.token);
      await loadRoundsData();
      await loadRoundStatus();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Nie udało się rozpocząć rundy",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleExtendDeadline() {
    if (!auth.token) return;
    const minutes = prompt("Ile minut dodać?", "15");
    if (!minutes) return;

    try {
      setLoading(true);
      setError(null);
      await extendSubmissionDeadline(
        tournamentId,
        selectedRound,
        parseInt(minutes),
        auth.token,
      );
      await loadRoundsData();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Nie udało się przedłużyć czasu",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteTournament() {
    if (!auth.token) return;
    if (
      !confirm(
        "Czy na pewno chcesz zakończyć turniej? Tej operacji nie można cofnąć.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await completeTournament(tournamentId, auth.token);
      window.location.reload(); // Refresh to show completed state
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Nie udało się zakończyć turnieju",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStartIndividualMatch(matchId: number) {
    if (!auth.token) return;
    try {
      setLoading(true);
      setError(null);
      await startIndividualMatch(
        tournamentId,
        selectedRound,
        matchId,
        auth.token,
      );
      await loadRoundsData();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Nie udało się rozpocząć meczu",
      );
    } finally {
      setLoading(false);
    }
  }

  const currentRound = rounds.find((r) => r.roundNumber === selectedRound);
  const currentRoundDefinition = roundDefinitions.find(
    (rd) => rd.roundNumber === selectedRound,
  );

  return (
    <div className="space-y-6">
      {/* Podium for completed tournaments */}
      {tournamentStatus === "COMPLETED" && podium && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">🏆 Podium 🏆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-4 py-8">
              {/* Second place */}
              {podium.second && (
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="bg-gray-300 rounded-lg p-4 h-32 w-32 flex flex-col items-center justify-center">
                    <div className="font-bold text-center">
                      {podium.second.userName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      TP: {podium.second.tournamentPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SP: {podium.second.scorePoints}
                    </div>
                  </div>
                  <div className="mt-2 text-lg font-bold">2.</div>
                </div>
              )}

              {/* First place */}
              {podium.first && (
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🥇</div>
                  <div className="bg-yellow-300 rounded-lg p-4 h-40 w-40 flex flex-col items-center justify-center">
                    <div className="font-bold text-lg text-center">
                      {podium.first.userName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      TP: {podium.first.tournamentPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SP: {podium.first.scorePoints}
                    </div>
                  </div>
                  <div className="mt-2 text-xl font-bold">1.</div>
                </div>
              )}

              {/* Third place */}
              {podium.third && (
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="bg-orange-300 rounded-lg p-4 h-28 w-28 flex flex-col items-center justify-center">
                    <div className="font-bold text-center text-sm">
                      {podium.third.userName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      TP: {podium.third.tournamentPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SP: {podium.third.scorePoints}
                    </div>
                  </div>
                  <div className="mt-2 text-lg font-bold">3.</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("rounds")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "rounds"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Rundy
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "stats"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Statystyki
        </button>
      </div>

      {/* Rounds tab */}
      {activeTab === "rounds" && (
        <div>
          {/* Round Info Card - Mobile friendly overview */}
          <div className="mb-4">
            <RoundInfoCard
              roundNumber={selectedRound}
              definition={currentRoundDefinition}
              totalMatches={currentRound?.matches?.length || 0}
              completedMatches={
                currentRound?.matches?.filter(
                  (m) =>
                    m.scoresSubmitted ||
                    m.status === "COMPLETED" ||
                    m.status === "FINISHED" ||
                    m.gameEndTime != null,
                ).length || 0
              }
              isStarted={
                currentRound?.matches?.length > 0 &&
                currentRound.matches.some(
                  (m) => m.status === "IN_PROGRESS" || m.startTime != null,
                )
              }
              isCompleted={
                currentRound?.matches?.length > 0 &&
                currentRound.matches.every(
                  (m) =>
                    m.status === "COMPLETED" ||
                    m.status === "FINISHED" ||
                    m.gameEndTime != null,
                )
              }
              startTime={currentRound?.matches?.[0]?.startTime ?? undefined}
              endTime={
                currentRound?.matches?.[0]?.resultSubmissionDeadline ??
                undefined
              }
              isOrganizer={isOrganizer}
              tournamentId={tournamentId}
              gameSystemId={gameSystemId}
              onUpdate={loadRoundDefinitions}
            />
          </div>

          {/* Round selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {Array.from({ length: numberOfRounds }, (_, i) => i + 1).map(
              (roundNum) => {
                const round = rounds.find((r) => r.roundNumber === roundNum);
                const isStarted =
                  round?.matches &&
                  round.matches.length > 0 &&
                  round.matches.some(
                    (m) => m.status === "IN_PROGRESS" || m.startTime != null,
                  );

                return (
                  <button
                    key={roundNum}
                    onClick={() => setSelectedRound(roundNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedRound === roundNum
                        ? "bg-blue-500 text-white"
                        : isStarted
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    Runda {roundNum}
                    {isStarted && " ✓"}
                  </button>
                );
              },
            )}
          </div>

          {/* Timer */}
          {timeRemaining && (
            <Card className="mb-4">
              <CardContent className="py-4">
                <div className="text-center text-2xl font-bold">
                  {timeRemaining}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizer controls */}
          {isOrganizer && tournamentStatus === "IN_PROGRESS" && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Panel organizatora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-800 p-3 rounded">
                    {error}
                  </div>
                )}

                {/* Success banner when round is completed */}
                {currentRound?.matches &&
                  currentRound.matches.length > 0 &&
                  currentRound.matches.every(
                    (m) =>
                      m.status === "COMPLETED" ||
                      m.status === "FINISHED" ||
                      m.gameEndTime != null,
                  ) && (
                    <div className="bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🏁</span>
                        <h3 className="font-bold text-lg">
                          Runda {selectedRound} zakończona!
                        </h3>
                      </div>
                      <p className="text-sm mb-2">
                        Wszystkie mecze zostały rozegrane. Wyniki zostały
                        zapisane.
                      </p>
                      {selectedRound < numberOfRounds && (
                        <p className="text-sm font-medium">
                          💡 Przejdź do panelu &ldquo;Akcje&rdquo; aby dobierz
                          pary dla rundy {selectedRound + 1}.
                        </p>
                      )}
                      {selectedRound === numberOfRounds && (
                        <p className="text-sm font-medium">
                          🎉 To była ostatnia runda turnieju! Możesz zakończyć
                          turniej.
                        </p>
                      )}
                    </div>
                  )}

                <div className="flex gap-2 flex-wrap">
                  {(!currentRound?.matches ||
                    currentRound.matches.length === 0 ||
                    !currentRound.matches.some(
                      (m) => m.status === "IN_PROGRESS" || m.startTime != null,
                    )) && (
                    <Button onClick={handleStartRound} disabled={loading}>
                      🚀 Rozpocznij rundę {selectedRound}
                    </Button>
                  )}

                  {currentRound?.matches &&
                    currentRound.matches.length > 0 &&
                    currentRound.matches.some(
                      (m) => m.status === "IN_PROGRESS" || m.startTime != null,
                    ) && (
                      <Button
                        onClick={handleExtendDeadline}
                        disabled={loading}
                        variant="outline"
                      >
                        ⏰ Przedłuż czas na wyniki
                      </Button>
                    )}

                  <Button
                    onClick={handleCompleteTournament}
                    disabled={loading}
                    variant="destructive"
                  >
                    🏁 Zakończ turniej
                  </Button>
                </div>

                {/* Round status for organizer */}
                {roundStatus &&
                  currentRound?.matches &&
                  currentRound.matches.length > 0 &&
                  currentRound.matches.some(
                    (m) => m.status === "IN_PROGRESS",
                  ) && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-bold mb-2">
                        Status rundy {selectedRound}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          Mecze z wynikami:{" "}
                          <strong>
                            {roundStatus.completedMatches} /{" "}
                            {roundStatus.totalMatches}
                          </strong>
                        </p>
                        {roundStatus.playersWithoutScores &&
                          roundStatus.playersWithoutScores.length > 0 && (
                            <div className="mt-2">
                              <p className="text-red-600 font-medium">
                                ⚠️ Brakujące wyniki (
                                {roundStatus.playersWithoutScores.length}{" "}
                                graczy):
                              </p>
                              <ul className="list-disc list-inside ml-4 text-red-800">
                                {roundStatus.playersWithoutScores.map(
                                  (playerName, i) => (
                                    <li key={i}>{playerName}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Match pairings */}
          <Card>
            <CardHeader>
              <CardTitle>Paringi - Runda {selectedRound}</CardTitle>
            </CardHeader>
            <CardContent>
              {!currentRound ? (
                <p className="text-muted-foreground">
                  Brak danych dla tej rundy
                </p>
              ) : !currentRound.matches || currentRound.matches.length === 0 ? (
                <p className="text-muted-foreground">
                  Runda jeszcze nie rozpoczęta
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {currentRound.matches.map((match) => (
                    <div
                      key={match.tableNumber}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-lg font-bold">
                          Stolik {match.tableNumber}
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {/* Status badge */}
                          {(() => {
                            // Określ czy mecz jest faktycznie zakończony na podstawie danych
                            const isFinished =
                              match.status === "FINISHED" ||
                              match.status === "COMPLETED" ||
                              match.gameEndTime != null;

                            return (
                              <span
                                className={`text-xs px-2 py-1 rounded font-medium ${
                                  isFinished
                                    ? "bg-green-100 text-green-800"
                                    : match.status === "IN_PROGRESS"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {isFinished
                                  ? "Zakończony"
                                  : match.status === "IN_PROGRESS"
                                    ? "W trakcie"
                                    : "Zaplanowany"}
                              </span>
                            );
                          })()}
                          {match.scoresSubmitted && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Wynik wpisany
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Player 1 */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{match.player1Name}</div>
                          {match.player1TotalScore !== null &&
                            match.player1TotalScore !== undefined && (
                              <div className="text-lg font-bold text-blue-600">
                                {match.player1TotalScore}
                              </div>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          TP: {match.player1TournamentPoints ?? 0}
                        </div>
                        {match.matchWinner === "PLAYER1" && (
                          <div className="text-sm font-bold text-green-600 mt-1">
                            🏆 Zwycięzca
                          </div>
                        )}
                      </div>

                      <div className="text-center text-muted-foreground text-sm my-2">
                        {match.matchWinner === "DRAW" ? "REMIS" : "VS"}
                      </div>

                      {/* Player 2 or BYE */}
                      {!match.player2Id ? (
                        <div className="text-center italic text-muted-foreground">
                          BYE
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">
                              {match.player2Name}
                            </div>
                            {match.player2TotalScore !== null &&
                              match.player2TotalScore !== undefined && (
                                <div className="text-lg font-bold text-blue-600">
                                  {match.player2TotalScore}
                                </div>
                              )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            TP: {match.player2TournamentPoints ?? 0}
                          </div>
                          {match.matchWinner === "PLAYER2" && (
                            <div className="text-sm font-bold text-green-600 mt-1">
                              🏆 Zwycięzca
                            </div>
                          )}
                        </div>
                      )}

                      {/* Start button for INDIVIDUAL_MATCHES mode */}
                      {isOrganizer &&
                        roundStartMode === "INDIVIDUAL_MATCHES" &&
                        match.status !== "IN_PROGRESS" &&
                        match.status !== "COMPLETED" &&
                        match.status !== "FINISHED" && (
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              onClick={() =>
                                handleStartIndividualMatch(match.matchId)
                              }
                              disabled={loading}
                              size="sm"
                              className="w-full"
                            >
                              🚀 Rozpocznij mecz
                            </Button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats tab */}
      {activeTab === "stats" && (
        <Card>
          <CardHeader>
            <CardTitle>Statystyki uczestników</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length === 0 ? (
              <p className="text-muted-foreground">Brak danych</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miejsce</TableHead>
                    <TableHead>Uczestnik</TableHead>
                    <TableHead className="text-center">W</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">L</TableHead>
                    <TableHead className="text-right">TP</TableHead>
                    <TableHead className="text-right">SP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((s, index) => (
                    <TableRow key={s.userId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{s.userName}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {s.wins}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {s.draws}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {s.losses}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {s.tournamentPoints}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {s.scorePoints}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
