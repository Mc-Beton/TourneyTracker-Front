"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { createSingleMatch } from "@/lib/api/singleMatches";
import {
  getGameSystems,
  getDeployments,
  getPrimaryMissions,
} from "@/lib/api/systems";
import { searchUsers } from "@/lib/api/users";
import type { CreateSingleMatchDTO } from "@/lib/types/singleMatch";
import { MatchMode } from "@/lib/types/singleMatch";
import type { IdNameDTO, UserLookupDTO } from "@/lib/types/systems";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewSingleMatchPage() {
  const router = useRouter();
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHotSeat, setIsHotSeat] = useState(true);
  const [matchMode, setMatchMode] = useState<MatchMode>(MatchMode.LIVE);

  // System data
  const [gameSystems, setGameSystems] = useState<IdNameDTO[]>([]);
  const [selectedGameSystemId, setSelectedGameSystemId] = useState<
    number | null
  >(null);
  const [deployments, setDeployments] = useState<IdNameDTO[]>([]);
  const [primaryMissions, setPrimaryMissions] = useState<IdNameDTO[]>([]);

  // User search
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserLookupDTO[]>(
    [],
  );
  const [selectedPlayer2, setSelectedPlayer2] = useState<UserLookupDTO | null>(
    null,
  );

  // Load game systems on mount
  useEffect(() => {
    if (!auth.token) return;

    getGameSystems(auth.token)
      .then(setGameSystems)
      .catch((e) => console.error("Error loading game systems:", e));
  }, [auth.token]);

  // Load deployments and missions when game system changes
  useEffect(() => {
    if (!selectedGameSystemId || !auth.token) {
      setDeployments([]);
      setPrimaryMissions([]);
      return;
    }

    Promise.all([
      getDeployments(selectedGameSystemId, auth.token),
      getPrimaryMissions(selectedGameSystemId, auth.token),
    ])
      .then(([deps, missions]) => {
        setDeployments(deps);
        setPrimaryMissions(missions);
      })
      .catch((e) => console.error("Error loading deployments/missions:", e));
  }, [selectedGameSystemId, auth.token]);

  // User search debounced
  useEffect(() => {
    if (!auth.token || isHotSeat || userSearchQuery.length < 4) {
      setUserSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(userSearchQuery, auth.token!, 10)
        .then(setUserSearchResults)
        .catch((e) => console.error("Error searching users:", e));
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery, auth.token, isHotSeat]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token) return;

    const formData = new FormData(e.currentTarget);
    const matchName = formData.get("matchName");
    const gameSystemId = formData.get("gameSystemId");
    const guestPlayer2Name = formData.get("guestPlayer2Name");
    const deploymentId = formData.get("deploymentId");
    const primaryMissionId = formData.get("primaryMissionId");
    const armyPower = formData.get("armyPower");

    if (!gameSystemId) {
      setError("Wybierz system gry");
      return;
    }

    if (isHotSeat && !guestPlayer2Name) {
      setError("Podaj nazwę gościa");
      return;
    }

    if (!isHotSeat && !selectedPlayer2) {
      setError("Wybierz gracza 2");
      return;
    }

    const payload: CreateSingleMatchDTO = {
      ...(matchName && { matchName: matchName as string }),
      gameSystemId: parseInt(gameSystemId as string),
      mode: matchMode,
      ...(isHotSeat
        ? { guestPlayer2Name: guestPlayer2Name as string }
        : { player2Id: selectedPlayer2!.id }),
      ...(deploymentId && { deploymentId: parseInt(deploymentId as string) }),
      ...(primaryMissionId && {
        primaryMissionId: parseInt(primaryMissionId as string),
      }),
      ...(armyPower && { armyPower: parseInt(armyPower as string) }),
    };

    try {
      setSubmitting(true);
      setError(null);
      await createSingleMatch(payload, auth.token);
      router.push("/single-matches/my");
    } catch (e) {
      console.error("Error creating single match:", e);
      setError(e instanceof Error ? e.message : "Nie udało się utworzyć gry");
    } finally {
      setSubmitting(false);
    }
  }

  if (!auth.isAuthenticated) {
    return (
      <MainLayout>
        <div className="text-destructive">Musisz być zalogowany</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">
            Utwórz nową grę lokalną
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="matchName"
                className="block text-sm font-medium mb-1"
              >
                Nazwa rozgrywki (opcjonalna)
              </label>
              <Input
                id="matchName"
                name="matchName"
                type="text"
                placeholder="np. Turniej ligowy - runda 1"
              />
            </div>

            <div>
              <label
                htmlFor="gameSystemId"
                className="block text-sm font-medium mb-1"
              >
                System gry *
              </label>
              <select
                id="gameSystemId"
                name="gameSystemId"
                required
                value={selectedGameSystemId || ""}
                onChange={(e) =>
                  setSelectedGameSystemId(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Wybierz system gry</option>
                {gameSystems.map((gs) => (
                  <option key={gs.id} value={gs.id}>
                    {gs.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedGameSystemId && (
              <>
                <div>
                  <label
                    htmlFor="deploymentId"
                    className="block text-sm font-medium mb-1"
                  >
                    Deployment (opcjonalne)
                  </label>
                  <select
                    id="deploymentId"
                    name="deploymentId"
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Brak</option>
                    {deployments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="primaryMissionId"
                    className="block text-sm font-medium mb-1"
                  >
                    Primary Mission (opcjonalne)
                  </label>
                  <select
                    id="primaryMissionId"
                    name="primaryMissionId"
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Brak</option>
                    {primaryMissions.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="armyPower"
                className="block text-sm font-medium mb-1"
              >
                Moc armii (opcjonalne)
              </label>
              <Input
                id="armyPower"
                name="armyPower"
                type="number"
                placeholder="np. 2000"
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="matchMode"
                className="block text-sm font-medium mb-1"
              >
                Tryb rozgrywki *
              </label>
              <select
                id="matchMode"
                name="matchMode"
                required
                value={matchMode}
                onChange={(e) => setMatchMode(e.target.value as MatchMode)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value={MatchMode.LIVE}>Live - rozgrywka na żywo</option>
                <option value={MatchMode.ONLINE}>
                  Online - rozgrywka zdalna
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hotSeat"
                checked={isHotSeat}
                onChange={(e) => {
                  setIsHotSeat(e.target.checked);
                  setSelectedPlayer2(null);
                  setUserSearchQuery("");
                }}
                className="w-4 h-4"
              />
              <label htmlFor="hotSeat" className="text-sm font-medium">
                Drugi gracz bez konta (gość)
              </label>
            </div>

            {isHotSeat ? (
              <div>
                <label
                  htmlFor="guestPlayer2Name"
                  className="block text-sm font-medium mb-1"
                >
                  Nazwa drugiego gracza (gość) *
                </label>
                <Input
                  id="guestPlayer2Name"
                  name="guestPlayer2Name"
                  type="text"
                  required
                  placeholder="np. Jan Kowalski"
                  className="w-full"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="userSearch"
                  className="block text-sm font-medium mb-1"
                >
                  Wyszukaj gracza 2 *
                </label>
                <Input
                  id="userSearch"
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Wpisz co najmniej 4 znaki..."
                  className="w-full"
                />
                {selectedPlayer2 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                    <span className="text-sm">
                      Wybrany: {selectedPlayer2.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPlayer2(null)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Usuń
                    </button>
                  </div>
                )}
                {userSearchResults.length > 0 && !selectedPlayer2 && (
                  <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                    {userSearchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlayer2(user);
                          setUserSearchQuery("");
                          setUserSearchResults([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                )}
                {userSearchQuery.length > 0 && userSearchQuery.length < 4 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Wpisz co najmniej 4 znaki aby wyszukać
                  </p>
                )}
              </div>
            )}

            {error && <div className="text-destructive text-sm">{error}</div>}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Tworzenie..." : "Utwórz grę"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/single-matches/my")}
                className="flex-1"
              >
                Anuluj
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
