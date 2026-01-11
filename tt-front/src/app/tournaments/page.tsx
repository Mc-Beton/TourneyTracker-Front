"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTournaments } from "@/lib/api/tournaments";
import type { TournamentListItemDTO } from "@/lib/types/tournament";
import MainLayout from "@/components/MainLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TournamentListPage() {
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

  if (loading)
    return (
      <MainLayout>
        <div>Ładowanie listy turniejów...</div>
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout>
        <div className="text-destructive">Błąd: {error}</div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Aktywne turnieje</h1>

      {items.length === 0 ? (
        <p>Brak turniejów.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Rundy</TableHead>
              <TableHead>Czas rundy</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.startDate}</TableCell>
                <TableCell>{t.numberOfRounds}</TableCell>
                <TableCell>{t.roundDurationMinutes} min</TableCell>
                <TableCell>
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="text-primary hover:underline"
                  >
                    Szczegóły →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </MainLayout>
  );
}
