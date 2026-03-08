"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTournamentById,
  deleteTournament,
  setTournamentActive,
  startTournament,
  addParticipant,
  getPendingParticipants,
  getConfirmedParticipants,
  removeParticipant,
  setParticipantConfirmation,
  confirmTournamentForLeague,
} from "@/lib/api/tournaments";
import type {
  TournamentDetailsDTO,
  TournamentParticipantDTO,
} from "@/lib/types/tournament";
import { useAuth } from "@/lib/auth/useAuth";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  PaymentStatusBadge,
  ArmyListStatusBadge,
} from "@/components/ui/status-badges";
import { participantApi } from "@/lib/api/participants";
import { ArmyListReviewModal } from "@/components/ArmyListReviewModal";
import { AdditionalPointsModal } from "@/components/AdditionalPointsModal";
import { ArmyListForm } from "@/components/ArmyListForm";
import { TournamentRounds } from "@/components/TournamentRounds";
import {
  createFirstRoundPairings,
  createNextRoundPairings,
  getTournamentRoundsView,
  startRound,
} from "@/lib/api/tournament-rounds";
import type { TournamentRoundViewDTO } from "@/lib/types/tournament";
import { getCurrentMatch, type CurrentMatchDTO } from "@/lib/api/singleMatches";
import {
  getChallenges,
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  cancelChallenge,
  type TournamentChallengeDTO,
} from "@/lib/api/challenges";

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const id = params?.id as string;
  const [data, setData] = useState<TournamentDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [starting, setStarting] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [generatingPairings, setGeneratingPairings] = useState(false);
  const [startingRound, setStartingRound] = useState(false);
  const [roundsKey, setRoundsKey] = useState(0);
  const [roundsData, setRoundsData] = useState<TournamentRoundViewDTO[]>([]);
  const [currentMatch, setCurrentMatch] = useState<CurrentMatchDTO | null>(
    null,
  );
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [pendingParticipants, setPendingParticipants] = useState<
    TournamentParticipantDTO[]
  >([]);
  const [confirmedParticipants, setConfirmedParticipants] = useState<
    TournamentParticipantDTO[]
  >([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    userId: number;
    name: string;
  } | null>(null);
  const [showArmyListForm, setShowArmyListForm] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [selectedParticipantForPoints, setSelectedParticipantForPoints] =
    useState<{
      userId: number;
      name: string;
      points: number;
    } | null>(null);
  const [challenges, setChallenges] = useState<TournamentChallengeDTO[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeActionLoading, setChallengeActionLoading] = useState(false);
  const [confirmingLeague, setConfirmingLeague] = useState(false);

  useEffect(() => {
    if (!id) return;

    getTournamentById(parseInt(id))
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    setLoadingParticipants(true);
    Promise.all([
      getPendingParticipants(parseInt(id)),
      getConfirmedParticipants(parseInt(id)),
    ])
      .then(([pending, confirmed]) => {
        setPendingParticipants(pending);
        setConfirmedParticipants(confirmed);
      })
      .catch((e) => {
        console.error("Error loading participants:", e);
      })
      .finally(() => setLoadingParticipants(false));
  }, [id]);

  useEffect(() => {
    if (!id || !data || data.status !== "IN_PROGRESS") return;

    getTournamentRoundsView(parseInt(id), auth.token || undefined)
      .then(setRoundsData)
      .catch((e) => {
        console.error("Error loading rounds:", e);
      });
  }, [id, data, auth.token, roundsKey]);

  useEffect(() => {
    // Check if user is participant (same logic as isParticipant below)
    const isParticipant =
      auth.userId && data?.participantIds.includes(auth.userId);

    if (
      !id ||
      !data ||
      !isParticipant ||
      data.status !== "IN_PROGRESS" ||
      !auth.token
    )
      return;

    setLoadingMatch(true);
    getCurrentMatch(parseInt(id), auth.token)
      .then(setCurrentMatch)
      .catch((e) => {
        console.error("Error loading current match:", e);
      })
      .finally(() => setLoadingMatch(false));
  }, [id, data, auth.userId, auth.token, roundsKey]);

  useEffect(() => {
    const isParticipant =
      auth.userId && data?.participantIds.includes(auth.userId);

    if (
      !id ||
      !data ||
      !isParticipant ||
      data.status !== "ACTIVE" ||
      !auth.token
    )
      return;

    setLoadingChallenges(true);
    getChallenges(parseInt(id), auth.token)
      .then(setChallenges)
      .catch((e) => console.error("Error loading challenges:", e))
      .finally(() => setLoadingChallenges(false));
  }, [id, data?.status, auth.userId, auth.token, challengeActionLoading]);

  // Auto-refresh danych turnieju gdy jest IN_PROGRESS
  useEffect(() => {
    if (!id || !data || data.status !== "IN_PROGRESS") return;

    const interval = setInterval(async () => {
      try {
        const updatedTournament = await getTournamentById(parseInt(id));
        setData(updatedTournament);
      } catch (e) {
        console.error("Error refreshing tournament data:", e);
      }
    }, 15000); // co 15 sekund

    return () => clearInterval(interval);
  }, [id, data?.status]);

  async function handleCreateChallenge(opponentId: number) {
    if (!data || !auth.token) return;
    setError(null);
    setChallengeActionLoading(true);
    try {
      await createChallenge(data.id, opponentId, auth.token);
    } catch (e) {
      console.error("Error creating challenge:", e);
      if (e instanceof Error && e.message) {
        setError(e.message);
      } else {
        setError("Nie udało się utworzyć wyzwania");
      }
    } finally {
      setChallengeActionLoading(false);
    }
  }

  async function handleAcceptChallenge(challengeId: number) {
    if (!data || !auth.token) return;
    setError(null);
    setChallengeActionLoading(true);
    try {
      await acceptChallenge(data.id, challengeId, auth.token);
    } catch (e) {
      console.error("Error accepting challenge:", e);
      setError("Nie udało się zaakceptować wyzwania");
    } finally {
      setChallengeActionLoading(false);
    }
  }

  async function handleRejectChallenge(challengeId: number) {
    if (!data || !auth.token) return;
    setError(null);
    setChallengeActionLoading(true);
    try {
      await rejectChallenge(data.id, challengeId, auth.token);
    } catch (e) {
      console.error("Error rejecting challenge:", e);
      setError("Nie udało się odrzucić wyzwania");
    } finally {
      setChallengeActionLoading(false);
    }
  }

  async function handleCancelChallenge(challengeId: number) {
    if (!data || !auth.token) return;
    if (!confirm("Czy na pewno chcesz anulować to wyzwanie?")) return;
    setError(null);
    setChallengeActionLoading(true);
    try {
      await cancelChallenge(data.id, challengeId, auth.token);
    } catch (e) {
      console.error("Error cancelling challenge:", e);
      setError("Nie udało się anulować wyzwania");
    } finally {
      setChallengeActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!data || !auth.token) return;

    if (!confirm(`Czy na pewno chcesz usunąć turniej "${data.name}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteTournament(data.id, auth.token);
      router.push("/tournaments/my");
    } catch (e) {
      console.error("Error deleting tournament:", e);
      setError("Nie udało się usunąć turnieju");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive() {
    if (!data || !auth.token) return;

    const newActiveState = data.status !== "ACTIVE";
    try {
      setToggling(true);
      await setTournamentActive(data.id, newActiveState, auth.token);
      setData({ ...data, status: newActiveState ? "ACTIVE" : "DRAFT" });
    } catch (e) {
      console.error("Error toggling tournament active state:", e);
      setError("Nie udało się zmienić statusu turnieju");
    } finally {
      setToggling(false);
    }
  }

  async function handleStart() {
    if (!data || !auth.token) return;

    if (!confirm(`Czy na pewno chcesz rozpocząć turniej "${data.name}"?`)) {
      return;
    }

    try {
      setStarting(true);
      const updated = await startTournament(data.id, auth.token);
      setData(updated);
      setError(null);
    } catch (e) {
      console.error("Error starting tournament:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nie udało się rozpocząć turnieju");
      }
    } finally {
      setStarting(false);
    }
  }

  async function handleConfirmForLeague() {
    if (!data || !auth.token) return;

    if (
      !confirm(
        `Czy na pewno chcesz zatwierdzić wyniki tego turnieju dla ligi? Punkty zostaną przypisane uczestnikom.`,
      )
    ) {
      return;
    }

    try {
      setConfirmingLeague(true);
      await confirmTournamentForLeague(data.id, auth.token);
      // Refresh tournament data to get updated leaguePointsAssigned flag
      const updated = await getTournamentById(data.id);
      setData(updated);
      setError(null);
    } catch (e) {
      console.error("Error confirming tournament for league:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nie udało się zatwierdzić wyników dla ligi");
      }
    } finally {
      setConfirmingLeague(false);
    }
  }

  async function handleRegister() {
    if (!data || !auth.token || !auth.userId) return;

    try {
      setRegistering(true);
      const updated = await addParticipant(data.id, auth.userId, auth.token);
      setData(updated);
      setError(null);
    } catch (e) {
      console.error("Error registering for tournament:", e);
      if (e instanceof Error) {
        // Extract message from backend error response
        try {
          const match = e.message.match(/"message":"([^"]+)"/);
          if (match && match[1]) {
            setError(match[1]);
          } else {
            setError(e.message);
          }
        } catch {
          setError("Nie udało się zarejestrować do turnieju");
        }
      } else {
        setError("Nie udało się zarejestrować do turnieju");
      }
    } finally {
      setRegistering(false);
    }
  }

  async function handleConfirmParticipant(userId: number, confirmed: boolean) {
    if (!data || !auth.token) return;

    try {
      await setParticipantConfirmation(data.id, userId, confirmed, auth.token);
      // Refresh participant lists
      const [pending, confirmedList] = await Promise.all([
        getPendingParticipants(data.id),
        getConfirmedParticipants(data.id),
      ]);
      setPendingParticipants(pending);
      setConfirmedParticipants(confirmedList);
    } catch (e) {
      console.error("Error confirming participant:", e);
      setError("Nie udało się zmienić statusu uczestnika");
    }
  }

  async function handleRemoveParticipant(userId: number) {
    if (!data || !auth.token) return;

    if (!confirm("Czy na pewno chcesz usunąć tego uczestnika?")) {
      return;
    }

    try {
      await removeParticipant(data.id, userId, auth.token);
      // Refresh participant lists
      const [pending, confirmedList] = await Promise.all([
        getPendingParticipants(data.id),
        getConfirmedParticipants(data.id),
      ]);
      setPendingParticipants(pending);
      setConfirmedParticipants(confirmedList);
    } catch (e) {
      console.error("Error removing participant:", e);
      setError("Nie udało się usunąć uczestnika");
    }
  }

  async function handleWithdrawSelf() {
    if (!data || !auth.token || !auth.userId) return;

    if (!confirm("Czy na pewno chcesz wycofać się z turnieju?")) {
      return;
    }

    try {
      await removeParticipant(data.id, auth.userId, auth.token);
      // Refresh tournament data and participant lists
      const [updatedTournament, pending, confirmedList] = await Promise.all([
        getTournamentById(data.id),
        getPendingParticipants(data.id),
        getConfirmedParticipants(data.id),
      ]);
      setData(updatedTournament);
      setPendingParticipants(pending);
      setConfirmedParticipants(confirmedList);
      setError(null);
    } catch (e) {
      console.error("Error withdrawing from tournament:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nie udało się wycofać z turnieju");
      }
    }
  }

  async function handleTogglePayment(userId: number, currentIsPaid: boolean) {
    if (!data) return;

    console.log("=== TOGGLE PAYMENT START ===");
    console.log("User ID:", userId);
    console.log("Current isPaid:", currentIsPaid);
    console.log("New isPaid value to send:", !currentIsPaid);

    try {
      await participantApi.togglePaymentStatus(data.id, userId, !currentIsPaid);
      console.log("Payment status updated successfully");

      // Refresh participant lists
      const [pending, confirmedList] = await Promise.all([
        getPendingParticipants(data.id),
        getConfirmedParticipants(data.id),
      ]);
      console.log("Pending after payment toggle:", pending);
      console.log("Confirmed after payment toggle:", confirmedList);

      // Find the participant that was updated
      const updatedParticipant = [...pending, ...confirmedList].find(
        (p) => p.userId === userId,
      );
      console.log("Updated participant:", updatedParticipant);

      setPendingParticipants(pending);
      setConfirmedParticipants(confirmedList);
      console.log("=== TOGGLE PAYMENT END ===");
    } catch (e) {
      console.error("Error toggling payment:", e);
      setError("Nie udało się zmienić statusu płatności");
    }
  }

  function handleOpenReviewModal(userId: number, userName: string) {
    setSelectedParticipant({ userId, name: userName });
    setReviewModalOpen(true);
  }

  async function handleReviewSubmitted() {
    if (!data) return;
    // Refresh participant lists
    const [pending, confirmedList] = await Promise.all([
      getPendingParticipants(data.id),
      getConfirmedParticipants(data.id),
    ]);
    setPendingParticipants(pending);
    setConfirmedParticipants(confirmedList);
  }

  function handleOpenPointsModal(userId: number, name: string, points: number) {
    setSelectedParticipantForPoints({
      userId,
      name,
      points,
    });
    setPointsModalOpen(true);
  }

  async function handlePointsUpdated() {
    if (!data) return;
    // Refresh participant lists after points update
    const [pending, confirmedList] = await Promise.all([
      getPendingParticipants(data.id),
      getConfirmedParticipants(data.id),
    ]);
    setPendingParticipants(pending);
    setConfirmedParticipants(confirmedList);
  }

  async function handleGeneratePairings() {
    if (!data || !auth.token) return;

    if (
      !confirm(
        `Czy na pewno chcesz wygenerować pary dla pierwszej rundy turnieju "${data.name}"?`,
      )
    ) {
      return;
    }

    try {
      setGeneratingPairings(true);
      await createFirstRoundPairings(data.id, auth.token);
      // Odśwież dane turnieju, aby zaktualizować phase
      const updatedTournament = await getTournamentById(data.id);
      setData(updatedTournament);
      setRoundsKey((prev) => prev + 1);
      setError(null);
    } catch (e) {
      console.error("Error generating pairings:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nie udało się wygenerować par");
      }
    } finally {
      setGeneratingPairings(false);
    }
  }

  async function handleStartRound() {
    if (!data || !auth.token) return;

    if (
      !confirm(
        `Czy na pewno chcesz rozpocząć rundę 1 turnieju "${data.name}"? Uruchomi to licznik czasu dla wszystkich meczów.`,
      )
    ) {
      return;
    }

    try {
      setStartingRound(true);
      await startRound(data.id, 1, auth.token);
      // Odśwież dane turnieju, aby zaktualizować phase
      const updatedTournament = await getTournamentById(data.id);
      setData(updatedTournament);
      setRoundsKey((prev) => prev + 1);
      setError(null);
    } catch (e) {
      console.error("Error starting round:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nie udało się rozpocząć rundy");
      }
    } finally {
      setStartingRound(false);
    }
  }

  async function handleGenerateNextRoundPairings() {
    if (!data || !auth.token) return;

    // Znajdź następną rundę do wygenerowania
    const completedRounds = roundsData.filter((r) => {
      // Runda jest zakończona jeśli:
      // 1. Status jest COMPLETED LUB
      // 2. Wszystkie mecze są zakończone (mają gameEndTime lub status COMPLETED/FINISHED)
      if (r.status === "COMPLETED") return true;
      if (!r.matches || r.matches.length === 0) return false;
      return r.matches.every(
        (m) =>
          m.status === "COMPLETED" ||
          m.status === "FINISHED" ||
          m.gameEndTime != null,
      );
    });
    const nextRoundNumber = completedRounds.length + 1;

    if (nextRoundNumber > data.numberOfRounds) {
      setError("Wszystkie rundy zostały już rozegrane");
      return;
    }

    if (
      !confirm(
        `Czy na pewno chcesz wygenerować pary dla rundy ${nextRoundNumber}?`,
      )
    ) {
      return;
    }

    try {
      setGeneratingPairings(true);
      await createNextRoundPairings(data.id, auth.token);
      // Odśwież dane turnieju, aby zaktualizować phase
      const updatedTournament = await getTournamentById(data.id);
      setData(updatedTournament);
      setRoundsKey((prev) => prev + 1);
      setError(null);
    } catch (e) {
      console.error("Error generating next round pairings:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Nie udało się wygenerować par");
      }
    } finally {
      setGeneratingPairings(false);
    }
  }

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

  if (!data)
    return (
      <MainLayout>
        <div>Brak danych.</div>
      </MainLayout>
    );

  const isOwner = auth.userId === data.organizerId;
  const isParticipant =
    auth.userId && data.participantIds.includes(auth.userId);

  // Challenge logic
  const myIncomingChallenges = challenges.filter(
    (c) => c.opponentId === auth.userId && c.status === "PENDING",
  );
  const myOutgoingChallenges = challenges.filter(
    (c) =>
      c.challengerId === auth.userId &&
      (c.status === "PENDING" ||
        c.status === "ACCEPTED" ||
        c.status === "REJECTED"),
  );
  const myAcceptedIncoming = challenges.find(
    (c) => c.opponentId === auth.userId && c.status === "ACCEPTED",
  );

  // Determine if user can challenge others
  // Can challenge if: no pending outgoing, no accepted outgoing, no accepted incoming
  const myPendingOutgoing = myOutgoingChallenges.find(
    (c) => c.status === "PENDING",
  );
  const myAcceptedOutgoing = myOutgoingChallenges.find(
    (c) => c.status === "ACCEPTED",
  );

  const canChallenge =
    !myPendingOutgoing && !myAcceptedOutgoing && !myAcceptedIncoming;

  return (
    <MainLayout>
      {/* Panel "Twój mecz" dla uczestników - na górze */}
      {isParticipant && data.status === "IN_PROGRESS" && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Twój mecz</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {loadingMatch ? (
              <p className="text-sm text-gray-500">Ładowanie...</p>
            ) : currentMatch ? (
              <>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Przeciwnik:</strong> {currentMatch.opponentName}
                  </p>
                  {currentMatch.tableNumber && (
                    <p>
                      <strong>Stół:</strong> {currentMatch.tableNumber}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    {currentMatch.status === "IN_PROGRESS"
                      ? "W trakcie"
                      : currentMatch.status === "SCHEDULED"
                        ? "Zaplanowany"
                        : currentMatch.status}
                  </p>
                </div>
                <Link
                  href={`/single-matches/${currentMatch.matchId}`}
                  className="w-full"
                >
                  <Button className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700">
                    Przejdź do meczu
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500">Brak przypisanego meczu</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Główna zawartość */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>{data.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    data.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : data.status === "DRAFT"
                        ? "bg-blue-100 text-blue-800"
                        : data.status === "IN_PROGRESS"
                          ? "bg-yellow-100 text-yellow-800"
                          : data.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                  }`}
                >
                  {data.status === "ACTIVE"
                    ? "Aktywny"
                    : data.status === "DRAFT"
                      ? "Szkic"
                      : data.status === "IN_PROGRESS"
                        ? "W trakcie"
                        : data.status === "COMPLETED"
                          ? "Zakończony"
                          : "Anulowany"}
                </span>
              </p>
              <p>
                <strong>Start:</strong> {data.startDate}
              </p>
              {data.location && (
                <p>
                  <strong>Lokalizacja:</strong> {data.location}
                </p>
              )}
              {data.armyPointsLimit && (
                <p>
                  <strong>Limit punktów armii:</strong> {data.armyPointsLimit}{" "}
                  pkt
                </p>
              )}
              <p>
                <strong>Liczba rund:</strong> {data.numberOfRounds}
              </p>
              <p>
                <strong>Czas rundy:</strong> {data.roundDurationMinutes} min
              </p>
              <p>
                <strong>System gry:</strong>{" "}
                {data.gameSystemName || `ID: ${data.gameSystemId}`}
              </p>
              <p>
                <strong>Organizator:</strong>{" "}
                {data.organizerName || `ID: ${data.organizerId}`}
              </p>
              {data.maxParticipants && (
                <p>
                  <strong>Maksymalna liczba uczestników:</strong>{" "}
                  {data.maxParticipants}
                </p>
              )}
              <p>
                <strong>Uczestnicy:</strong> {data.participantIds.length}
                {isParticipant && (
                  <span className="ml-2 text-sm text-green-600">
                    (Jesteś zapisany)
                  </span>
                )}
              </p>
              {data.description && (
                <p>
                  <strong>Opis:</strong> {data.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Challenges Section - Only visible if participant and ACTIVE */}
          {isParticipant && data.status === "ACTIVE" && (
            <div className="mt-6 space-y-4">
              {/* Accepted Match (Challenge) */}
              {(myAcceptedOutgoing || myAcceptedIncoming) && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">
                      Twoje wyzwanie (ZAAKCEPTOWANE)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Masz zaplanowany mecz z:{" "}
                      <strong>
                        {myAcceptedOutgoing
                          ? myAcceptedOutgoing.opponentName
                          : myAcceptedIncoming?.challengerName}
                      </strong>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pending Outgoing */}
              {myPendingOutgoing && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800">
                      Twoje wysłane wyzwanie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <p>
                      Oczekuje na odpowiedź od:{" "}
                      <strong>{myPendingOutgoing.opponentName}</strong>
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleCancelChallenge(myPendingOutgoing.id)
                      }
                      disabled={challengeActionLoading}
                    >
                      Anuluj
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Rejected Outgoing */}
              {myOutgoingChallenges
                .filter((c) => c.status === "REJECTED")
                .map((c) => (
                  <Card key={c.id} className="bg-red-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800">
                        Odrzucone wyzwanie
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <p>
                        Twoje wyzwanie do <strong>{c.opponentName}</strong>{" "}
                        zostało odrzucone.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelChallenge(c.id)}
                        disabled={challengeActionLoading}
                      >
                        Ukryj
                      </Button>
                    </CardContent>
                  </Card>
                ))}

              {/* Incoming Challenges */}
              {myIncomingChallenges.length > 0 &&
                !myAcceptedIncoming &&
                !myAcceptedOutgoing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Otrzymane wyzwania</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          {myIncomingChallenges.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell>
                                <strong>{c.challengerName}</strong> wyzywa Cię
                                na pojedynek!
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAcceptChallenge(c.id)}
                                  disabled={challengeActionLoading}
                                >
                                  Akceptuj
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectChallenge(c.id)}
                                  disabled={challengeActionLoading}
                                >
                                  Odrzuć
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}

          {/* Tournament Rounds - shown when ACTIVE, IN_PROGRESS or COMPLETED */}
          {(data.status === "ACTIVE" ||
            data.status === "IN_PROGRESS" ||
            data.status === "COMPLETED") && (
            <div className="mt-6">
              <TournamentRounds
                key={roundsKey}
                tournamentId={data.id}
                isOrganizer={isOwner}
                tournamentStatus={data.status}
                numberOfRounds={data.numberOfRounds}
                roundStartMode={data.roundStartMode}
                gameSystemId={data.gameSystemId}
              />
            </div>
          )}

          {/* Confirmed Participants */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Potwierdzone uczestnictwa ({confirmedParticipants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <p className="text-muted-foreground">Ładowanie...</p>
              ) : confirmedParticipants.length === 0 ? (
                <p className="text-muted-foreground">
                  Brak potwierdzonych uczestników
                </p>
              ) : (
                <Table>
                  <TableBody>
                    {confirmedParticipants.map((participant) => {
                      const canViewPrivateData =
                        isOwner || auth.userId === participant.userId;
                      console.log(
                        `Participant ${participant.userId} isPaid:`,
                        participant.isPaid,
                        typeof participant.isPaid,
                      );

                      const targetHasAccepted = challenges.some(
                        (c) =>
                          (c.challengerId === participant.userId ||
                            c.opponentId === participant.userId) &&
                          c.status === "ACCEPTED",
                      );
                      const targetIsMe = auth.userId === participant.userId;
                      const showChallengeButton =
                        isParticipant &&
                        canChallenge &&
                        !targetIsMe &&
                        !targetHasAccepted;

                      return (
                        <TableRow key={participant.userId}>
                          <TableCell>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">
                                  {participant.name}
                                </div>
                                {participant.armyFactionName &&
                                  participant.armyName && (
                                    <div className="text-sm text-muted-foreground truncate">
                                      {`${participant.armyFactionName} - ${participant.armyName}`}
                                    </div>
                                  )}
                              </div>
                              {auth.isAuthenticated && (
                                <div className="flex items-center gap-1">
                                  {canViewPrivateData ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          isOwner &&
                                          handleTogglePayment(
                                            participant.userId,
                                            participant.isPaid,
                                          )
                                        }
                                        data-is-paid={String(
                                          participant.isPaid,
                                        )}
                                        data-user-id={participant.userId}
                                        className={`${isOwner ? "hover:opacity-70 cursor-pointer" : "cursor-default"} transition-all p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center`}
                                      >
                                        <PaymentStatusBadge
                                          key={`payment-confirmed-${participant.userId}-${participant.isPaid}`}
                                          isPaid={participant.isPaid}
                                        />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleOpenReviewModal(
                                            participant.userId,
                                            participant.name,
                                          )
                                        }
                                        className="hover:opacity-70 transition-opacity p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                                      >
                                        <ArmyListStatusBadge
                                          status={participant.armyListStatus}
                                        />
                                      </button>
                                      {isOwner && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center font-bold ml-1"
                                          onClick={() => {
                                            setSelectedParticipantForPoints({
                                              userId: participant.userId,
                                              name: participant.name,
                                              points:
                                                participant.additionalPoints ||
                                                0,
                                            });
                                            setPointsModalOpen(true);
                                          }}
                                          title="Zarządzaj punktami dodatkowymi"
                                        >
                                          {participant.additionalPoints
                                            ? participant.additionalPoints > 0
                                              ? `+${participant.additionalPoints}`
                                              : participant.additionalPoints
                                            : "+/-"}
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">
                                      -
                                    </span>
                                  )}
                                </div>
                              )}
                              {!isOwner &&
                                auth.userId === participant.userId && (
                                  <div className="flex-shrink-0">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={handleWithdrawSelf}
                                      className="min-h-[44px]"
                                    >
                                      Wycofaj się
                                    </Button>
                                  </div>
                                )}
                              {showChallengeButton && (
                                <div className="flex-shrink-0 ml-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCreateChallenge(participant.userId)
                                    }
                                    disabled={challengeActionLoading}
                                  >
                                    Wyzwij
                                  </Button>
                                </div>
                              )}
                              {isOwner && (
                                <div className="flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleConfirmParticipant(
                                        participant.userId,
                                        false,
                                      )
                                    }
                                    className="min-h-[44px]"
                                  >
                                    Cofnij potwierdzenie
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pending Participants */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Oczekujące na potwierdzenie ({pendingParticipants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <p className="text-muted-foreground">Ładowanie...</p>
              ) : pendingParticipants.length === 0 ? (
                <p className="text-muted-foreground">
                  Brak oczekujących uczestników
                </p>
              ) : (
                <Table>
                  <TableBody>
                    {pendingParticipants.map((participant) => {
                      const canViewPrivateData =
                        isOwner || auth.userId === participant.userId;
                      console.log(
                        `Pending participant ${participant.userId} isPaid:`,
                        participant.isPaid,
                        typeof participant.isPaid,
                      );
                      return (
                        <TableRow key={participant.userId}>
                          <TableCell>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">
                                  {participant.name}
                                </div>
                                {participant.armyFactionName &&
                                  participant.armyName && (
                                    <div className="text-sm text-muted-foreground truncate">
                                      {`${participant.armyFactionName} - ${participant.armyName}`}
                                    </div>
                                  )}
                              </div>
                              {auth.isAuthenticated && (
                                <div className="flex items-center gap-1">
                                  {canViewPrivateData ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          isOwner &&
                                          handleTogglePayment(
                                            participant.userId,
                                            participant.isPaid,
                                          )
                                        }
                                        data-is-paid={String(
                                          participant.isPaid,
                                        )}
                                        data-user-id={participant.userId}
                                        className={`${isOwner ? "hover:opacity-70 cursor-pointer" : "cursor-default"} transition-all p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center`}
                                      >
                                        <PaymentStatusBadge
                                          key={`payment-pending-${participant.userId}-${participant.isPaid}`}
                                          isPaid={participant.isPaid}
                                        />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleOpenReviewModal(
                                            participant.userId,
                                            participant.name,
                                          )
                                        }
                                        className="hover:opacity-70 transition-opacity p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                                      >
                                        <ArmyListStatusBadge
                                          status={participant.armyListStatus}
                                        />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">
                                      -
                                    </span>
                                  )}
                                </div>
                              )}
                              {!isOwner &&
                                auth.userId === participant.userId && (
                                  <div className="flex-shrink-0">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={handleWithdrawSelf}
                                      className="min-h-[44px]"
                                    >
                                      Wycofaj się
                                    </Button>
                                  </div>
                                )}
                              {isOwner && (
                                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() =>
                                      handleConfirmParticipant(
                                        participant.userId,
                                        true,
                                      )
                                    }
                                    className="min-h-[44px] w-full sm:w-auto"
                                  >
                                    Potwierdź
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveParticipant(
                                        participant.userId,
                                      )
                                    }
                                    className="min-h-[44px] w-full sm:w-auto"
                                  >
                                    Usuń
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Army List Form for Participants */}
          {isParticipant && (
            <div className="mt-6">
              {!showArmyListForm ? (
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => setShowArmyListForm(true)}
                      variant="outline"
                      className="w-full min-h-[44px]"
                    >
                      📝 Zarządzaj rozpiskę armii
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <Button
                    onClick={() => setShowArmyListForm(false)}
                    variant="ghost"
                    size="sm"
                    className="mb-2"
                  >
                    ← Ukryj formularz
                  </Button>
                  <ArmyListForm
                    tournamentId={data.id}
                    gameSystemId={data.gameSystemId}
                    onSubmitSuccess={async () => {
                      // Refresh participant lists after army list submission
                      const [pending, confirmedList] = await Promise.all([
                        getPendingParticipants(data.id),
                        getConfirmedParticipants(data.id),
                      ]);
                      setPendingParticipants(pending);
                      setConfirmedParticipants(confirmedList);
                      setShowArmyListForm(false); // Hide form after success
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Boczny panel z przyciskami - dla organizatora i gości */}
        {(isOwner || (auth.isAuthenticated && !isParticipant)) && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Akcje</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {isOwner ? (
                    <>
                      {/* Aktywuj/Dezaktywuj button - only show when not IN_PROGRESS or COMPLETED */}
                      {data.status !== "IN_PROGRESS" &&
                        data.status !== "COMPLETED" && (
                          <Button
                            variant={
                              data.status === "ACTIVE" ? "outline" : "default"
                            }
                            onClick={handleToggleActive}
                            disabled={toggling}
                            className="w-full min-h-[44px]"
                          >
                            {toggling
                              ? "..."
                              : data.status === "ACTIVE"
                                ? "Dezaktywuj"
                                : "Aktywuj"}
                          </Button>
                        )}
                      {/* Zatwierdź wynik button - only for COMPLETED tournaments with a league */}
                      {data.status === "COMPLETED" &&
                        data.leagueId &&
                        !data.leaguePointsAssigned && (
                          <Button
                            onClick={handleConfirmForLeague}
                            disabled={confirmingLeague}
                            className="w-full min-h-[44px] bg-purple-600 hover:bg-purple-700"
                          >
                            {confirmingLeague
                              ? "Zatwierdzanie..."
                              : "Zatwierdź wynik"}
                          </Button>
                        )}
                      {data.status === "ACTIVE" && (
                        <Button
                          onClick={handleStart}
                          disabled={starting}
                          className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
                        >
                          {starting ? "Rozpoczynanie..." : "Start"}
                        </Button>
                      )}
                      {data.status === "IN_PROGRESS" &&
                        (() => {
                          // Używamy phase do określania która akcja jest dostępna
                          const { phase } = data;

                          // Pobierz zakończone rundy
                          const completedRounds = roundsData.filter(
                            (r) => r.status === "COMPLETED",
                          );
                          const currentRoundNumber = completedRounds.length + 1;

                          // AWAITING_PAIRINGS - czeka na dobranie par
                          if (phase === "AWAITING_PAIRINGS") {
                            return (
                              <Button
                                onClick={
                                  currentRoundNumber === 1
                                    ? handleGeneratePairings
                                    : handleGenerateNextRoundPairings
                                }
                                disabled={generatingPairings}
                                className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
                              >
                                {generatingPairings
                                  ? "Dobieranie..."
                                  : `Dobierz pary (runda ${currentRoundNumber})`}
                              </Button>
                            );
                          }

                          // PAIRINGS_READY - pary dobrane, czeka na start
                          if (phase === "PAIRINGS_READY") {
                            return (
                              <Button
                                onClick={async () => {
                                  if (!auth.token) return;
                                  try {
                                    setStartingRound(true);
                                    await startRound(
                                      data.id,
                                      currentRoundNumber,
                                      auth.token,
                                    );
                                    // Odśwież dane turnieju, aby zaktualizować phase
                                    const updatedTournament =
                                      await getTournamentById(data.id);
                                    setData(updatedTournament);
                                    setRoundsKey((prev) => prev + 1);
                                  } catch (e) {
                                    console.error("Error starting round:", e);
                                    setError("Nie udało się rozpocząć rundy");
                                  } finally {
                                    setStartingRound(false);
                                  }
                                }}
                                disabled={startingRound}
                                className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
                              >
                                {startingRound
                                  ? "Rozpoczynanie..."
                                  : `Rozpocznij rundę ${currentRoundNumber}`}
                              </Button>
                            );
                          }

                          // ROUND_ACTIVE - runda w trakcie, brak przycisków akcji
                          // TOURNAMENT_COMPLETE - turniej zakończony
                          return null;
                        })()}
                      {!isParticipant && data.status === "ACTIVE" && (
                        <Button
                          onClick={handleRegister}
                          disabled={registering}
                          className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
                        >
                          {registering ? "Zapisywanie..." : "Zapisz się"}
                        </Button>
                      )}
                      <Link
                        href={`/tournaments/${data.id}/edit`}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full min-h-[44px]"
                        >
                          Edytuj turniej
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full min-h-[44px]"
                      >
                        {deleting ? "Usuwam..." : "Usuń turniej"}
                      </Button>
                    </>
                  ) : (
                    auth.isAuthenticated &&
                    !isParticipant && (
                      <Button
                        onClick={handleRegister}
                        disabled={registering || data.status !== "ACTIVE"}
                        className="w-full min-h-[44px]"
                      >
                        {registering ? "Rejestracja..." : "Zapisz się"}
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Army List Review Modal */}
      {selectedParticipant && (
        <ArmyListReviewModal
          tournamentId={data.id}
          userId={selectedParticipant.userId}
          userName={selectedParticipant.name}
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {selectedParticipantForPoints && (
        <AdditionalPointsModal
          tournamentId={parseInt(id)}
          userId={selectedParticipantForPoints.userId}
          userName={selectedParticipantForPoints.name}
          initialPoints={selectedParticipantForPoints.points}
          isOpen={pointsModalOpen}
          onClose={() => setPointsModalOpen(false)}
          onPointsUpdated={async () => {
            // Refresh participants
            const confirmed = await getConfirmedParticipants(parseInt(id));
            setConfirmedParticipants(confirmed);
          }}
        />
      )}
    </MainLayout>
  );
}
