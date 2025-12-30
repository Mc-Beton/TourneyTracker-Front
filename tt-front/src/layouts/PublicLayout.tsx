import { Link, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>
            Turnieje
          </Link>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              Lista
            </Link>
            <Link to="/tournaments/new">Utwórz turniej</Link>
            <Link to="/register">Rejestracja</Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "24px",
          maxWidth: 1000,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #ddd",
          fontSize: 12,
          opacity: 0.8,
        }}
      >
        IGB / Tournament app
      </footer>
    </div>
  );
}
