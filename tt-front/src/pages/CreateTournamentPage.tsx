import { useMemo, useState } from "react";
import { createTournament } from "../api/tournaments";
import type { CreateTournamentDTO, ScoringSystem } from "../types/tournament";
import { useNavigate } from "react-router-dom";

const scoringSystemOptions: { value: ScoringSystem; label: string }[] = [
  { value: "ROUND_BY_ROUND", label: "Po każdej rundzie" },
  { value: "END_OF_MATCH", label: "Na koniec meczu" },
];

// Na start dajemy score typy jako teksty (dopasuj do swojego enumu)
const scoreTypeOptions = [
  { value: "VICTORY_POINTS", label: "Victory Points" },
  { value: "OBJECTIVES", label: "Objectives" },
  { value: "BONUS", label: "Bonus" },
];

function toLocalDateInputValue(d: Date) {
  // yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreateTournamentPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateTournamentDTO>({
    name: "",
    description: "",
    startDate: toLocalDateInputValue(new Date()),
    endDate: "",
    numberOfRounds: 3,
    roundDurationMinutes: 120,
    gameSystemId: 1, // tymczasowo, docelowo wybór z listy
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

    // Zróbmy “czyszczenie” pól opcjonalnych:
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
      const created = await createTournament(payload);
      // zakładam, że response ma id:
      navigate(`/tournaments/${created.id}`);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Utwórz turniej</h1>

      {error && (
        <div style={{ marginBottom: 12, color: "red", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Nazwa*
          <br />
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Opis
          <br />
          <textarea
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            style={{ width: "100%" }}
          />
        </label>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label>
            Start*
            <br />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Koniec
            <br />
            <input
              type="date"
              value={form.endDate ?? ""}
              onChange={(e) => update("endDate", e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label>
            Liczba rund*
            <br />
            <input
              type="number"
              min={1}
              value={form.numberOfRounds}
              onChange={(e) => update("numberOfRounds", Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Czas rundy (min)*
            <br />
            <input
              type="number"
              min={15}
              value={form.roundDurationMinutes}
              onChange={(e) =>
                update("roundDurationMinutes", Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <label>
          Game system ID* (na razie ręcznie, potem zrobimy select)
          <br />
          <input
            type="number"
            value={form.gameSystemId}
            onChange={(e) => update("gameSystemId", Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label>
            Limit uczestników
            <br />
            <input
              type="number"
              value={form.maxParticipants ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                update("maxParticipants", v ? Number(v) : undefined);
              }}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Deadline rejestracji (ISO)
            <br />
            <input
              type="datetime-local"
              value={form.registrationDeadline ?? ""}
              onChange={(e) => update("registrationDeadline", e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <label>
            Miasto / lokalizacja
            <br />
            <input
              value={form.location ?? ""}
              onChange={(e) => update("location", e.target.value)}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Venue
            <br />
            <input
              value={form.venue ?? ""}
              onChange={(e) => update("venue", e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <fieldset style={{ padding: 12 }}>
          <legend>Punktacja</legend>

          <label>
            System punktacji
            <br />
            <select
              value={form.scoringSystem ?? "ROUND_BY_ROUND"}
              onChange={(e) =>
                update("scoringSystem", e.target.value as ScoringSystem)
              }
            >
              {scoringSystemOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: 10 }}>
            <div>Włączone typy score:</div>
            <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
              {scoreTypeOptions.map((o) => (
                <label
                  key={o.value}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={(form.enabledScoreTypes ?? []).includes(o.value)}
                    onChange={() => toggleScoreType(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          <label style={{ display: "block", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={form.requireAllScoreTypes}
              onChange={(e) => update("requireAllScoreTypes", e.target.checked)}
            />{" "}
            Wymagaj wszystkich typów score
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 10,
            }}
          >
            <label>
              Min score
              <br />
              <input
                type="number"
                value={form.minScore ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  update("minScore", v ? Number(v) : undefined);
                }}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Max score
              <br />
              <input
                type="number"
                value={form.maxScore ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  update("maxScore", v ? Number(v) : undefined);
                }}
                style={{ width: "100%" }}
              />
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Tworzę..." : "Utwórz turniej"}
        </button>

        {!canSubmit && (
          <small style={{ color: "#666" }}>
            Uzupełnij wymagane pola: nazwa, start, liczba rund, czas rundy,
            gameSystemId.
          </small>
        )}
      </form>
    </div>
  );
}
