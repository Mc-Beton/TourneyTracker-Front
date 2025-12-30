import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <p>Nie znaleziono strony.</p>
      <Link to="/">Wróć na listę turniejów</Link>
    </div>
  );
}
