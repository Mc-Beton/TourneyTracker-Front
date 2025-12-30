import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import type { RegisterDTO } from "../types/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterDTO>({
    name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.password) return false;
    if (form.password.length < 6) return false;
    return true;
  }, [form]);

  function update<K extends keyof RegisterDTO>(key: K, value: RegisterDTO[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Po sukcesie przekieruj po chwili (z cleanup żeby nie było “podwójnie” w dev)
  useEffect(() => {
    if (!success) return;

    const t = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 600);

    return () => window.clearTimeout(t);
  }, [success, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setError(null);
    setSuccess(null);

    const payload: RegisterDTO = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    setSubmitting(true);
    try {
      const msg = await register(payload);
      setSuccess(msg || "Utworzono konto!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Rejestracja</h1>

      {error && (
        <div style={{ marginBottom: 12, color: "red", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      {success && (
        <div
          style={{ marginBottom: 12, color: "green", whiteSpace: "pre-wrap" }}
        >
          {success} Przekierowuję do logowania...
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
            autoComplete="name"
            disabled={submitting || !!success}
          />
        </label>

        <label>
          Email*
          <br />
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            style={{ width: "100%" }}
            autoComplete="email"
            disabled={submitting || !!success}
          />
        </label>

        <label>
          Hasło* (min. 6 znaków)
          <br />
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            style={{ width: "100%" }}
            autoComplete="new-password"
            disabled={submitting || !!success}
          />
        </label>

        <button type="submit" disabled={!canSubmit || submitting || !!success}>
          {submitting ? "Rejestruję..." : "Utwórz konto"}
        </button>

        {!canSubmit && !success && (
          <small style={{ opacity: 0.8 }}>
            Uzupełnij: nazwa, email, hasło (min 6 znaków).
          </small>
        )}

        <div style={{ marginTop: 8 }}>
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </div>
      </form>
    </div>
  );
}
