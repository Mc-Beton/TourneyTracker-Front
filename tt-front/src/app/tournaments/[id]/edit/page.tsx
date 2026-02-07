"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTournamentEditForm, updateTournament } from "@/lib/api/tournaments";
import { useAuth } from "@/lib/auth/useAuth";
import type {
  CreateTournamentDTO,
  ScoringSystem,
  TournamentPointsSystem,
  RoundStartMode,
} from "@/lib/types/tournament";
import type { TournamentRoundDefinitionDTO } from "@/lib/types/roundDefinition";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RoundDefinitionCard } from "@/components/RoundDefinitionCard";
import { getRoundDefinitions } from "@/lib/api/roundDefinitions";

const scoringSystemOptions: { value: ScoringSystem; label: string }[] = [
  { value: "ROUND_BY_ROUND", label: "Po każdej rundzie" },
  { value: "END_OF_MATCH", label: "Na koniec meczu" },
];

const scoreTypeOptions = [
  { value: "MAIN_SCORE", label: "Main Score" },
  { value: "SECONDARY_SCORE", label: "Secondary Score" },
  { value: "THIRD_SCORE", label: "Third Score" },
  { value: "ADDITIONAL_SCORE", label: "Additional Score" },
];

const tournamentPointsSystemOptions: {
  value: TournamentPointsSystem;
  label: string;
}[] = [
  { value: "FIXED", label: "Stała punktacja" },
  { value: "POINT_DIFFERENCE_STRICT", label: "Różnica punktowa - standardowa" },
  { value: "POINT_DIFFERENCE_LENIENT", label: "Różnica punktowa - łagodna" },
];

const roundStartModeOptions: { value: RoundStartMode; label: string }[] = [
  {
    value: "ALL_MATCHES_TOGETHER",
    label: "Wszystkie mecze startują jednocześnie",
  },
  { value: "INDIVIDUAL_MATCHES", label: "Każdy mecz startuje osobno" },
];

function toLocalDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EditTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  const tournamentId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreateTournamentDTO>({
    name: "",
    description: "",
    startDate: toLocalDateInputValue(new Date()),
    endDate: "",
    numberOfRounds: 3,
    roundDurationMinutes: 120,
    scoreSubmissionExtraMinutes: 15,
    roundStartMode: "ALL_MATCHES_TOGETHER",
    gameSystemId: 1,
    type: "SWISS",
    maxParticipants: undefined,
    registrationDeadline: "",
    location: "",
    venue: "",
    scoringSystem: "ROUND_BY_ROUND",
    enabledScoreTypes: [],
    requireAllScoreTypes: false,
    minScore: 0,
    maxScore: 100,
    // Domyślne wartości dla Tournament Points
    tournamentPointsSystem: undefined,
    pointsForWin: undefined,
    pointsForDraw: undefined,
    pointsForLoss: undefined,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundDefinitions, setRoundDefinitions] = useState<
    TournamentRoundDefinitionDTO[]
  >([]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    async function loadTournament() {
      try {
        setLoading(true);
        const formData = await getTournamentEditForm(tournamentId, auth.token!);
        setForm(formData);
        // Load round definitions
        const definitions = await getRoundDefinitions(tournamentId, auth.token);
        setRoundDefinitions(definitions);
      } catch (e) {
        console.error("Error loading tournament:", e);
        setError("Nie udało się załadować turnieju");
      } finally {
        setLoading(false);
      }
    }

    loadTournament();
  }, [tournamentId, auth.isAuthenticated, auth.token, router]);

  async function loadRoundDefinitions() {
    try {
      const definitions = await getRoundDefinitions(tournamentId, auth.token);
      setRoundDefinitions(definitions);
    } catch (e) {
      console.error("Error loading round definitions:", e);
    }
  }

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.startDate) return false;
    if (!form.gameSystemId || Number.isNaN(form.gameSystemId)) return false;
    if (form.numberOfRounds < 1) return false;
    if (form.roundDurationMinutes < 15) return false;
    return true;
  }, [form]);

  function update<K extends keyof CreateTournamentDTO>(
    key: K,
    value: CreateTournamentDTO[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleScoreType(value: string) {
    const current = form.enabledScoreTypes ?? [];
    if (current.includes(value)) {
      update(
        "enabledScoreTypes",
        current.filter((x) => x !== value),
      );
    } else {
      update("enabledScoreTypes", [...current, value]);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!auth.isAuthenticated || !auth.token) {
      setError("Musisz być zalogowany, aby edytować turniej");
      router.push("/login");
      return;
    }

    const payload: CreateTournamentDTO = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      endDate: form.endDate?.trim() || undefined,
      registrationDeadline: form.registrationDeadline?.trim() || undefined,
      location: form.location?.trim() || undefined,
      venue: form.venue?.trim() || undefined,
      enabledScoreTypes:
        (form.enabledScoreTypes?.length ?? 0) > 0
          ? form.enabledScoreTypes
          : undefined,
    };

    setSubmitting(true);
    try {
      const updated = await updateTournament(tournamentId, payload, auth.token);
      console.log("Tournament updated:", updated);
      router.push(`/tournaments/${tournamentId}`);
    } catch (e: unknown) {
      console.error("Error updating tournament:", e);
      if (e instanceof Error) setError(e.message);
      else setError("Nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <MainLayout>
        <Card className="max-w-3xl">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Ładowanie...</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Edytuj turniej</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-destructive whitespace-pre-wrap">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nazwa*</label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opis</label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start*</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Koniec</label>
                <Input
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Liczba rund*
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.numberOfRounds}
                  onChange={(e) =>
                    update("numberOfRounds", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Czas rundy (min)*
                </label>
                <Input
                  type="number"
                  min={15}
                  value={form.roundDurationMinutes}
                  onChange={(e) =>
                    update("roundDurationMinutes", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Czas dodatkowy na wpisanie punktów (min)
                </label>
                <Input
                  type="number"
                  min={5}
                  value={form.scoreSubmissionExtraMinutes ?? 15}
                  onChange={(e) =>
                    update(
                      "scoreSubmissionExtraMinutes",
                      Number(e.target.value),
                    )
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Domyślnie 15 minut po zakończeniu meczu
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tryb startowania meczów
                </label>
                <select
                  value={form.roundStartMode ?? "ALL_MATCHES_TOGETHER"}
                  onChange={(e) =>
                    update("roundStartMode", e.target.value as RoundStartMode)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {roundStartModeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Game system ID*
              </label>
              <Input
                type="number"
                value={form.gameSystemId}
                onChange={(e) => update("gameSystemId", Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Limit uczestników
                </label>
                <Input
                  type="number"
                  value={form.maxParticipants ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    update("maxParticipants", v ? Number(v) : undefined);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Deadline rejestracji
                </label>
                <Input
                  type="datetime-local"
                  value={form.registrationDeadline ?? ""}
                  onChange={(e) =>
                    update("registrationDeadline", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Miasto / lokalizacja
                </label>
                <Input
                  value={form.location ?? ""}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Venue</label>
                <Input
                  value={form.venue ?? ""}
                  onChange={(e) => update("venue", e.target.value)}
                />
              </div>
            </div>

            <fieldset className="border rounded-lg p-4 space-y-3">
              <legend className="font-medium px-2">
                Punktacja - Score Points (małe punkty)
              </legend>

              <div>
                <label className="block text-sm font-medium mb-1">
                  System punktacji
                </label>
                <select
                  value={form.scoringSystem ?? "ROUND_BY_ROUND"}
                  onChange={(e) =>
                    update("scoringSystem", e.target.value as ScoringSystem)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {scoringSystemOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">
                  Włączone typy score:
                </div>
                <div className="space-y-2">
                  {scoreTypeOptions.map((o) => (
                    <label
                      key={o.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(form.enabledScoreTypes ?? []).includes(
                          o.value,
                        )}
                        onChange={() => toggleScoreType(o.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requireAllScoreTypes}
                  onChange={(e) =>
                    update("requireAllScoreTypes", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">Wymagaj wszystkich typów score</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min score
                  </label>
                  <Input
                    type="number"
                    value={form.minScore ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      update("minScore", v ? Number(v) : undefined);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max score
                  </label>
                  <Input
                    type="number"
                    value={form.maxScore ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      update("maxScore", v ? Number(v) : undefined);
                    }}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="border rounded-lg p-4 space-y-3">
              <legend className="font-medium px-2">
                Punktacja - Tournament Points (duże punkty)
              </legend>

              <div>
                <label className="block text-sm font-medium mb-1">
                  System punktacji turniejowej
                </label>
                <select
                  value={form.tournamentPointsSystem ?? ""}
                  onChange={(e) =>
                    update(
                      "tournamentPointsSystem",
                      e.target.value
                        ? (e.target.value as TournamentPointsSystem)
                        : undefined,
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Wybierz --</option>
                  {tournamentPointsSystemOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.tournamentPointsSystem === "FIXED" && (
                <div className="grid grid-cols-3 gap-4 bg-muted/50 p-3 rounded">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Punkty za wygraną
                    </label>
                    <Input
                      type="number"
                      value={form.pointsForWin ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        update("pointsForWin", v ? Number(v) : undefined);
                      }}
                      placeholder="np. 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Punkty za remis
                    </label>
                    <Input
                      type="number"
                      value={form.pointsForDraw ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        update("pointsForDraw", v ? Number(v) : undefined);
                      }}
                      placeholder="np. 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Punkty za przegraną
                    </label>
                    <Input
                      type="number"
                      value={form.pointsForLoss ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        update("pointsForLoss", v ? Number(v) : undefined);
                      }}
                      placeholder="np. 0"
                    />
                  </div>
                </div>
              )}

              {form.tournamentPointsSystem === "POINT_DIFFERENCE_STRICT" && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <strong>Przedziały punktowe (standardowe):</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>0 różnicy: 10:10</li>
                    <li>1-5 różnicy: 11:9</li>
                    <li>6-10 różnicy: 12:8</li>
                    <li>11-15 różnicy: 13:7</li>
                    <li>16-20 różnicy: 14:6</li>
                    <li>21+ różnicy: 15:5</li>
                  </ul>
                </div>
              )}

              {form.tournamentPointsSystem === "POINT_DIFFERENCE_LENIENT" && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <strong>Przedziały punktowe (łagodne):</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>0-5 różnicy: 10:10</li>
                    <li>6-10 różnicy: 11:9</li>
                    <li>11-15 różnicy: 12:8</li>
                    <li>16-20 różnicy: 13:7</li>
                    <li>21-25 różnicy: 14:6</li>
                    <li>26+ różnicy: 15:5</li>
                  </ul>
                </div>
              )}
            </fieldset>

            <div className="flex gap-2">
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Zapisuję..." : "Zapisz zmiany"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/tournaments/${tournamentId}`)}
              >
                Anuluj
              </Button>
            </div>

            {!canSubmit && (
              <p className="text-sm text-muted-foreground">
                Uzupełnij wymagane pola: nazwa, start, liczba rund, czas rundy,
                gameSystemId.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Round Definitions Section */}
      {roundDefinitions.length > 0 && (
        <Card className="max-w-3xl mt-6">
          <CardHeader>
            <CardTitle>Definicje rund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {roundDefinitions.map((definition) => (
                <RoundDefinitionCard
                  key={definition.roundNumber}
                  definition={definition}
                  isOrganizer={true}
                  tournamentId={tournamentId}
                  gameSystemId={form.gameSystemId}
                  onUpdate={loadRoundDefinitions}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
