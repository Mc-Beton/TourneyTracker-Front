"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Dumbbell, Users } from "lucide-react";
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

export default function MyTournamentsPage() {
  const auth = useAuth();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    async function loadMyTournaments() {
      try {
        setLoading(true);
        const data = await getMyTournaments(auth.token!);
        console.log("My tournaments data:", data);
        setTournaments(data);
      } catch (e) {
        console.error("Error loading my tournaments:", e);
        setError("Nie udało się załadować turniejów");
      } finally {
        setLoading(false);
      }
    }

    loadMyTournaments();
  }, [mounted, auth.isAuthenticated, auth.token, router]);

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

  if (!mounted || !auth.isAuthenticated) {
    return (
      <MainLayout>
        <div>Ładowanie...</div>
      </MainLayout>
    );
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
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-card border rounded-lg p-4 shadow-sm"
              >
                <Link href={`/tournaments/${tournament.id}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-lg text-primary hover:underline">
                        {tournament.name}
                      </h2>
                    </div>

                    <div className="flex-shrink-0">
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
                    </div>
                  </div>
                </Link>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{tournament.startDate}</span>
                  </div>

                  {tournament.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{tournament.location}</span>
                    </div>
                  )}

                  {tournament.armyPointsLimit && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Dumbbell className="w-4 h-4 flex-shrink-0" />
                      <span>{tournament.armyPointsLimit} pkt</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {tournament.confirmedParticipantsCount || 0}
                      {tournament.maxParticipants
                        ? ` / ${tournament.maxParticipants}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
