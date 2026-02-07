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
import { ArmyListForm } from "@/components/ArmyListForm";
import { TournamentRounds } from "@/components/TournamentRounds";
import {
  createFirstRoundPairings,
  getTournamentRoundsView,
  startRound,
} from "@/lib/api/tournament-rounds";
import type { TournamentRoundViewDTO } from "@/lib/types/tournament";
import { getCurrentMatch, type CurrentMatchDTO } from "@/lib/api/singleMatches";

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
                          const firstRound = roundsData.find(
                            (r) => r.roundNumber === 1,
                          );
                          const hasMatches =
                            firstRound && firstRound.matches.length > 0;
                          const isRoundStarted =
                            firstRound &&
                            firstRound.matches.some(
                              (m) => m.status === "IN_PROGRESS",
                            );

                          if (!hasMatches) {
                            return (
                              <Button
                                onClick={handleGeneratePairings}
                                disabled={generatingPairings}
                                className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
                              >
                                {generatingPairings
                                  ? "Dobieranie..."
                                  : "Dobierz paringi"}
                              </Button>
                            );
                          }

                          if (hasMatches && !isRoundStarted) {
                            return (
                              <Button
                                onClick={handleStartRound}
                                disabled={startingRound}
                                className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
                              >
                                {startingRound
                                  ? "Rozpoczynanie..."
                                  : "Rozpocznij rundę 1"}
                              </Button>
                            );
                          }

                          return null;
                        })()}
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
    </MainLayout>
  );
}
