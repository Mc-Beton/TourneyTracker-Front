import { useParams, Link } from "react-router-dom";
import { TournamentDetailsInner } from "./TournamentDetailsInner.tsx";

export function TournamentDetailsPage() {
  const { id } = useParams();

  const tournamentId = Number(id);
  if (!id || Number.isNaN(tournamentId)) {
    return <div>Niepoprawne ID turnieju.</div>;
  }
  const isValidId = Number.isInteger(tournamentId) && tournamentId > 0;

  if (!isValidId) {
    return (
      <div>
        <h1>Niepoprawne ID turnieju</h1>
        <p>Adres zawiera niepoprawne ID: {String(id)}</p>
        <Link to="/tournaments">← Wróć do listy</Link>
      </div>
    );
  }

  // key powoduje reset stanu po zmianie ID
  return (
    <TournamentDetailsInner key={tournamentId} tournamentId={tournamentId} />
  );
}
