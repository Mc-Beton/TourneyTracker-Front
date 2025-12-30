import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "../api/tournaments";
import type { TournamentListItemDTO } from "../types/tournament";

export function TournamentListPage() {
  const [items, setItems] = useState<TournamentListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTournaments()
      .then(setItems)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Ładowanie listy turniejów...</div>;
  if (error) return <div style={{ color: "crimson" }}>Błąd: {error}</div>;

  return (
    <div>
      <h1>Aktywne turnieje</h1>

      {items.length === 0 ? (
        <p>Brak turniejów.</p>
      ) : (
        <table
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>Nazwa</th>
              <th style={{ padding: 8 }}>Start</th>
              <th style={{ padding: 8 }}>Rundy</th>
              <th style={{ padding: 8 }}>Czas rundy</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{t.name}</td>
                <td style={{ padding: 8 }}>{t.startDate}</td>
                <td style={{ padding: 8 }}>{t.numberOfRounds}</td>
                <td style={{ padding: 8 }}>{t.roundDurationMinutes} min</td>
                <td style={{ padding: 8 }}>
                  <Link to={`/tournaments/${t.id}`}>Szczegóły →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
