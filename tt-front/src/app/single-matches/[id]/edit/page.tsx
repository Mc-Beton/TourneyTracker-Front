"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getMatchSummary, updateSingleMatch } from "@/lib/api/singleMatches";
import { getDeployments, getPrimaryMissions } from "@/lib/api/systems";
import type {
  CreateSingleMatchDTO,
  MatchSummaryDTO,
} from "@/lib/types/singleMatch";
import { MatchMode } from "@/lib/types/singleMatch";
import type { IdNameDTO } from "@/lib/types/systems";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditSingleMatchPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const matchId = params.id ? Number(params.id) : null;

  const [match, setMatch] = useState<MatchSummaryDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // System data
  const [deployments, setDeployments] = useState<IdNameDTO[]>([]);
  const [primaryMissions, setPrimaryMissions] = useState<IdNameDTO[]>([]);

  // Form state
  const [matchName, setMatchName] = useState("");
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<
    number | null
  >(null);
  const [selectedPrimaryMissionId, setSelectedPrimaryMissionId] = useState<
    number | null
  >(null);
  const [armyPower, setArmyPower] = useState<number | null>(null);
  const [matchMode, setMatchMode] = useState<MatchMode>(MatchMode.LIVE);

  // Load match data
  useEffect(() => {
    if (!auth.token || !matchId) {
      setError("Nieprawidłowy ID meczu lub brak autoryzacji");
      setLoading(false);
      return;
    }

    getMatchSummary(matchId, auth.token)
      .then((matchData) => {
        setMatch(matchData);
        setMatchName(matchData.matchName || "");
        setMatchMode(matchData.mode);
        setArmyPower(matchData.armyPower);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Nieznany błąd");
        setLoading(false);
      });
  }, [auth.token, matchId]);

  // Load deployments and missions based on game system from match
  useEffect(() => {
    if (!match || !auth.token) return;

    // We need to get gameSystemId from the match
    // For now, we'll need to add it to the MatchSummaryDTO or fetch it separately
    // Let's assume we have access to it through match details

    // Temporary: We'll need to fetch these without gameSystemId filter
    // or add gameSystemId to MatchSummaryDTO
    getDeployments(1, auth.token) // placeholder - should use match's game system ID
      .then(setDeployments)
      .catch((e) => console.error("Error loading deployments:", e));

    getPrimaryMissions(1, auth.token) // placeholder - should use match's game system ID
      .then(setPrimaryMissions)
      .catch((e) => console.error("Error loading missions:", e));
  }, [match, auth.token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!auth.token || !matchId) return;

    setSubmitting(true);
    setError(null);

    try {
      // Note: We can only update certain fields
      // gameSystemId and player2 cannot be changed
      const dto: CreateSingleMatchDTO = {
        matchName: matchName || undefined,
        gameSystemId: 1, // This won't be used in update, but required by DTO
        primaryMissionId: selectedPrimaryMissionId,
        deploymentId: selectedDeploymentId,
        armyPower: armyPower,
        mode: matchMode,
      };

      await updateSingleMatch(matchId, dto, auth.token);
      router.push(`/single-matches/${matchId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  if (error || !match) {
    return (
      <MainLayout>
        <div className="text-destructive">
          Błąd: {error || "Nie znaleziono meczu"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edytuj mecz</CardTitle>
          <p className="text-sm text-muted-foreground">
            Możesz edytować szczegóły meczu przed jego rozpoczęciem
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Match Name */}
            <div>
              <Label htmlFor="matchName">Nazwa meczu (opcjonalnie)</Label>
              <Input
                id="matchName"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder="np. Półfinał Turnieju"
                className="mt-1.5"
              />
            </div>

            {/* Game System - Disabled */}
            <div>
              <Label>System gry</Label>
              <Input
                value="Nie można zmienić"
                disabled
                className="mt-1.5 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                System gry nie może być zmieniony po utworzeniu meczu
              </p>
            </div>

            {/* Opponent - Disabled */}
            <div>
              <Label>Przeciwnik</Label>
              <Input
                value={match.player2Name}
                disabled
                className="mt-1.5 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Przeciwnik nie może być zmieniony po utworzeniu meczu
              </p>
            </div>

            {/* Match Mode */}
            <div>
              <Label htmlFor="matchMode">Tryb meczu</Label>
              <select
                id="matchMode"
                value={matchMode}
                onChange={(e) => setMatchMode(e.target.value as MatchMode)}
                className="mt-1.5 w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={MatchMode.LIVE}>Live</option>
                <option value={MatchMode.ONLINE}>Online</option>
              </select>
            </div>

            {/* Primary Mission */}
            <div>
              <Label htmlFor="primaryMission">Misja główna (opcjonalnie)</Label>
              <select
                id="primaryMission"
                value={selectedPrimaryMissionId?.toString() || ""}
                onChange={(e) =>
                  setSelectedPrimaryMissionId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="mt-1.5 w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Brak</option>
                {primaryMissions.map((mission) => (
                  <option key={mission.id} value={mission.id.toString()}>
                    {mission.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deployment */}
            <div>
              <Label htmlFor="deployment">Rozmieszczenie (opcjonalnie)</Label>
              <select
                id="deployment"
                value={selectedDeploymentId?.toString() || ""}
                onChange={(e) =>
                  setSelectedDeploymentId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="mt-1.5 w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Brak</option>
                {deployments.map((deployment) => (
                  <option key={deployment.id} value={deployment.id.toString()}>
                    {deployment.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Army Power */}
            <div>
              <Label htmlFor="armyPower">Siła armii (opcjonalnie)</Label>
              <Input
                id="armyPower"
                type="number"
                value={armyPower || ""}
                onChange={(e) =>
                  setArmyPower(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="np. 2000"
                className="mt-1.5"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Zapisuje..." : "Zapisz zmiany"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/single-matches/${matchId}`)}
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
