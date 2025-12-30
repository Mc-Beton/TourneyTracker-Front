import { useEffect, useState } from "react";

type TournamentDetails = {
  id: number;
  name: string;
  startDate: string;
  numberOfRounds: number;
  roundDurationMinutes: number;
  gameSystemId: number;
  organizerId: number;
  participantIds: number[];
};

type Props = {
  tournamentId: number;
};

export function TournamentDetailsInner({ tournamentId }: Props) {
  const [data, setData] = useState<TournamentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as TournamentDetails;
        setData(json);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }

        const message = e instanceof Error ? e.message : "Nieznany błąd";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [tournamentId]);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div style={{ color: "red" }}>Błąd: {error}</div>;
  if (!data) return <div>Brak danych.</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Start: {data.startDate}</p>
      <p>Liczba rund: {data.numberOfRounds}</p>
      <p>Czas rundy: {data.roundDurationMinutes} min</p>
      <p>System gry (ID): {data.gameSystemId}</p>
      <p>Organizator (ID): {data.organizerId}</p>
      <p>Uczestnicy: {data.participantIds.length}</p>
    </div>
  );
}
