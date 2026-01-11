"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament } from "@/lib/api/tournaments";
import { useAuth } from "@/lib/auth/useAuth";
import type {
  CreateTournamentDTO,
  ScoringSystem,
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
    scoringSystem: "ROUND_BY_ROUND",
    enabledScoreTypes: [],
    requireAllScoreTypes: false,
    minScore: 0,
    maxScore: 100,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    value: CreateTournamentDTO[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleScoreType(value: string) {
    const current = form.enabledScoreTypes ?? [];
    if (current.includes(value)) {
      update(
        "enabledScoreTypes",
        current.filter((x) => x !== value)
      );
    } else {
      update("enabledScoreTypes", [...current, value]);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      registrationDeadline: form.registrationDeadline?.trim() || undefined,
      location: form.location?.trim() || undefined,
      venue: form.venue?.trim() || undefined,
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
      if (e instanceof Error) setError(e.message);
      else setError("Nieznany błąd");
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
              <legend className="font-medium px-2">Punktacja</legend>

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
                          o.value
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
