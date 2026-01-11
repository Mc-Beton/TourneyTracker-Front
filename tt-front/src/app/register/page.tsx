"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import type { RegisterDTO } from "@/lib/types/auth";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterDTO>({
    name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);

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

  useEffect(() => {
    if (!success) return;

    setSecondsLeft(3);

    const interval = window.setInterval(() => {
      setSecondsLeft((s) => (s > 1 ? s - 1 : 1));
    }, 1000);

    const timeout = window.setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [success, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || submitting || success) return;

    setError(null);

    const payload: RegisterDTO = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    setSubmitting(true);
    try {
      await register(payload);
      setSuccess(true);
    } catch (e: unknown) {
      setSuccess(false);
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Rejestracja</CardTitle>
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
                  autoComplete="name"
                  disabled={submitting || success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  disabled={submitting || success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hasło* (min. 6 znaków)
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  autoComplete="new-password"
                  disabled={submitting || success}
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || submitting || success}
                className="w-full"
              >
                {submitting ? "Rejestruję..." : "Utwórz konto"}
              </Button>

              {!canSubmit && !success && (
                <p className="text-sm text-muted-foreground">
                  Uzupełnij: nazwa, email, hasło (min 6 znaków).
                </p>
              )}

              <div className="text-sm text-center mt-4">
                Masz już konto?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Zaloguj się
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {success && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="text-6xl">✅</div>
                <h2 className="text-2xl font-bold">Rejestracja zakończona!</h2>
                <p className="text-muted-foreground">
                  Za {secondsLeft} sek. przekierujemy Cię na stronę główną.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
