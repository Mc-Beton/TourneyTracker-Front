"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament } from "@/lib/api/tournaments";
import { getGameSystems } from "@/lib/api/systems";
import { useAuth } from "@/lib/auth/useAuth";
import type { IdNameDTO } from "@/lib/types/systems";
import type {
  CreateTournamentDTO,
  ScoringSystem,
  TournamentPointsSystem,
  RoundStartMode,
} from "@/lib/types/tournament";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

const roundStartModeOptions: {
  value: RoundStartMode;
  label: string;
}[] = [
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

export default function CreateTournamentPage() {
  const router = useRouter();
  const auth = useAuth();

  const [form, setForm] = useState<CreateTournamentDTO>({
    name: "",
    description: "",
    startDate: toLocalDateInputValue(new Date()),
    endDate: "",
    numberOfRounds: 3,
    roundDurationMinutes: 120,
    gameSystemId: 1,
    type: "SWISS",
    maxParticipants: undefined,
    registrationDeadline: "",
    location: "",
    venue: "",
    armyPointsLimit: undefined,
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
    scoreSubmissionExtraMinutes: 15,
    roundStartMode: "ALL_MATCHES_TOGETHER",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [gameSystems, setGameSystems] = useState<IdNameDTO[]>([]);
  const [loadingSystems, setLoadingSystems] = useState(true);

  useEffect(() => {
    if (auth.token) {
      getGameSystems(auth.token)
        .then((systems) => {
          setGameSystems(systems);
          if (systems.length > 0 && !form.gameSystemId) {
            update("gameSystemId", systems[0].id);
          }
        })
        .catch((e) => console.error("Failed to load game systems:", e))
        .finally(() => setLoadingSystems(false));
    }
  }, [auth.token]);

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
    // Clear field error when user starts typing
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
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
    setFieldErrors({});

    console.log("Form submitted");
    console.log("Auth state:", {
      isAuthenticated: auth.isAuthenticated,
      hasToken: !!auth.token,
    });

    // Check authentication
    if (!auth.isAuthenticated || !auth.token) {
      setError("Musisz być zalogowany, aby utworzyć turniej");
      router.push("/login");
      return;
    }

    const payload: CreateTournamentDTO = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      endDate: form.endDate?.trim() || undefined,
      registrationDeadline: form.registrationDeadline?.trim()
        ? `${form.registrationDeadline.trim()}T23:59:59`
        : undefined,
      location: form.location?.trim() || undefined,
      venue: form.venue?.trim() || undefined,
      armyPointsLimit: form.armyPointsLimit,
      enabledScoreTypes:
        (form.enabledScoreTypes?.length ?? 0) > 0
          ? form.enabledScoreTypes
          : undefined,
    };

    console.log("Sending payload:", payload);
    console.log("Auth token:", auth.token ? "Present" : "Missing");
    console.log("Token preview:", auth.token?.substring(0, 20) + "...");

    setSubmitting(true);
    try {
      const created = await createTournament(payload, auth.token);
      console.log("Tournament created:", created);
      router.push(`/tournaments/${created.id}`);
    } catch (e: unknown) {
      console.error("Error creating tournament:", e);
      if (e instanceof Error) {
        const errorMessage = e.message;

        // Parse error message and map to field
        const errors: Record<string, string> = {};
        if (errorMessage.includes("Czas trwania rundy")) {
          errors.roundDurationMinutes = errorMessage;
        } else if (errorMessage.includes("Data rozpoczęcia")) {
          errors.startDate = errorMessage;
        } else if (errorMessage.includes("Liczba rund")) {
          errors.numberOfRounds = errorMessage;
        }
        setFieldErrors(errors);

        // Set general error only if no field-specific error was found
        if (Object.keys(errors).length === 0) {
          setError(errorMessage);
        }
      } else {
        setError("Nieznany błąd");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Utwórz turniej</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
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
                  className={
                    fieldErrors.startDate
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {fieldErrors.startDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.startDate}
                  </p>
                )}
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
                  className={
                    fieldErrors.numberOfRounds
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {fieldErrors.numberOfRounds && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.numberOfRounds}
                  </p>
                )}
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
                  className={
                    fieldErrors.roundDurationMinutes
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {fieldErrors.roundDurationMinutes && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.roundDurationMinutes}
                  </p>
                )}
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
                System gry*
              </label>
              {loadingSystems ? (
                <div className="text-sm text-muted-foreground">
                  Ładowanie...
                </div>
              ) : (
                <select
                  value={form.gameSystemId}
                  onChange={(e) =>
                    update("gameSystemId", Number(e.target.value))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {gameSystems.map((system) => (
                    <option key={system.id} value={system.id}>
                      {system.name}
                    </option>
                  ))}
                </select>
              )}
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
                  Deadline rejestracji (do końca dnia)
                </label>
                <Input
                  type="date"
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Limit punktów armii
              </label>
              <Input
                type="number"
                value={form.armyPointsLimit ?? ""}
                onChange={(e) =>
                  update(
                    "armyPointsLimit",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                placeholder="np. 2000"
              />
            </div>

            {/* Tymczasowo ukryte - przyda się w przyszłych rozwojach */}
            <fieldset className="border rounded-lg p-4 space-y-3 hidden">
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

            <Button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? "Tworzę..." : "Utwórz turniej"}
            </Button>

            {!canSubmit && (
              <p className="text-sm text-muted-foreground">
                Uzupełnij wymagane pola: nazwa, start, liczba rund, czas rundy,
                gameSystemId.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
