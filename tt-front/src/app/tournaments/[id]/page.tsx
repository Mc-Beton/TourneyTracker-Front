"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTournamentById,
  deleteTournament,
  setTournamentActive,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [registering, setRegistering] = useState(false);
  const [pendingParticipants, setPendingParticipants] = useState<
    TournamentParticipantDTO[]
  >([]);
  const [confirmedParticipants, setConfirmedParticipants] = useState<
    TournamentParticipantDTO[]
  >([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (!id) return;

    getTournamentById(parseInt(id))
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error")
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
                      : data.status === "FINISHED"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {data.status === "ACTIVE"
                    ? "Aktywny"
                    : data.status === "DRAFT"
                    ? "Szkic"
                    : data.status === "FINISHED"
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
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Email</TableHead>
                      {isOwner && (
                        <TableHead className="text-right">Akcje</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmedParticipants.map((participant) => (
                      <TableRow key={participant.userId}>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        {isOwner && (
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleConfirmParticipant(
                                  participant.userId,
                                  false
                                )
                              }
                            >
                              Cofnij potwierdzenie
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
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
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Email</TableHead>
                      {isOwner && (
                        <TableHead className="text-right">Akcje</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingParticipants.map((participant) => (
                      <TableRow key={participant.userId}>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        {isOwner && (
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleConfirmParticipant(
                                    participant.userId,
                                    true
                                  )
                                }
                              >
                                Potwierdź
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleRemoveParticipant(participant.userId)
                                }
                              >
                                Usuń
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Boczny panel z przyciskami */}
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
                        className="w-full"
                      >
                        {toggling
                          ? "..."
                          : data.status === "ACTIVE"
                          ? "Dezaktywuj"
                          : "Aktywuj"}
                      </Button>
                      <Link
                        href={`/tournaments/${data.id}/edit`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Edytuj turniej
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full"
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
                        className="w-full"
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
    </MainLayout>
  );
}
