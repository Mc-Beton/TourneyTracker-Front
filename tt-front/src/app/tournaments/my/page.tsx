"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getMyTournaments,
  deleteTournament,
  setTournamentActive,
} from "@/lib/api/tournaments";
import type { TournamentListItemDTO } from "@/lib/types/tournament";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MyTournamentsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    async function loadMyTournaments() {
      try {
        setLoading(true);
        const data = await getMyTournaments(auth.token!);
        setTournaments(data);
      } catch (e) {
        console.error("Error loading my tournaments:", e);
        setError("Nie udało się załadować turniejów");
      } finally {
        setLoading(false);
      }
    }

    loadMyTournaments();
  }, [auth.isAuthenticated, auth.token, router]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Czy na pewno chcesz usunąć turniej "${name}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      await deleteTournament(id, auth.token!);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Error deleting tournament:", e);
      setError("Nie udało się usunąć turnieju");
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggleActive(tournament: TournamentListItemDTO) {
    const newActiveState = tournament.status !== "ACTIVE";
    try {
      setToggling(tournament.id);
      await setTournamentActive(tournament.id, newActiveState, auth.token!);
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === tournament.id
            ? { ...t, status: newActiveState ? "ACTIVE" : "DRAFT" }
            : t
        )
      );
    } catch (e) {
      console.error("Error toggling tournament active state:", e);
      setError("Nie udało się zmienić statusu turnieju");
    } finally {
      setToggling(null);
    }
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Moje Turnieje</h1>
          <Link href="/tournaments/new">
            <Button>Dodaj Nowy Turniej</Button>
          </Link>
        </div>

        {error && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Ładowanie...</p>
            </CardContent>
          </Card>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nie utworzyłeś jeszcze żadnych turniejów.
              </p>
              <div className="flex justify-center mt-4">
                <Link href="/tournaments/new">
                  <Button>Utwórz Pierwszy Turniej</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista Turniejów ({tournaments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Data rozpoczęcia</TableHead>
                    <TableHead>Lokalizacja</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uczestnicy</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">
                        {tournament.name}
                      </TableCell>
                      <TableCell>{tournament.startDate}</TableCell>
                      <TableCell>{tournament.location || "-"}</TableCell>
                      <TableCell>{tournament.type}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tournament.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : tournament.status === "DRAFT"
                              ? "bg-blue-100 text-blue-800"
                              : tournament.status === "FINISHED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tournament.status === "ACTIVE"
                            ? "Aktywny"
                            : tournament.status === "DRAFT"
                            ? "Szkic"
                            : tournament.status === "FINISHED"
                            ? "Zakończony"
                            : "Anulowany"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {tournament.currentParticipants || 0}
                        {tournament.maxParticipants
                          ? ` / ${tournament.maxParticipants}`
                          : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant={
                              tournament.status === "ACTIVE"
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            onClick={() => handleToggleActive(tournament)}
                            disabled={toggling === tournament.id}
                          >
                            {toggling === tournament.id
                              ? "..."
                              : tournament.status === "ACTIVE"
                              ? "Dezaktywuj"
                              : "Aktywuj"}
                          </Button>
                          <Link href={`/tournaments/${tournament.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edytuj
                            </Button>
                          </Link>
                          <Link href={`/tournaments/${tournament.id}`}>
                            <Button variant="outline" size="sm">
                              Zobacz
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDelete(tournament.id, tournament.name)
                            }
                            disabled={deleting === tournament.id}
                          >
                            {deleting === tournament.id ? "Usuwam..." : "Usuń"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
