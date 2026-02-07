"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Dumbbell, Users } from "lucide-react";
import { getTournaments } from "@/lib/api/tournaments";
import type { TournamentListItemDTO } from "@/lib/types/tournament";
import MainLayout from "@/components/MainLayout";

export default function TournamentListPage() {
  const [items, setItems] = useState<TournamentListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTournaments()
      .then(setItems)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error"),
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Aktywne turnieje
      </h1>

      {items.length === 0 ? (
        <p className="text-sm sm:text-base">Brak turniejów.</p>
      ) : (
        <div className="space-y-4">
          {items.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="block bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-lg mb-3 text-primary hover:underline">
                    {t.name}
                  </h2>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{t.startDate}</span>
                    </div>

                    {t.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </div>
                    )}

                    {t.armyPointsLimit && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Dumbbell className="w-4 h-4 flex-shrink-0" />
                        <span>{t.armyPointsLimit} pkt</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Users className="w-6 h-6 text-muted-foreground" />
                  <span className="font-semibold text-lg">
                    {t.confirmedParticipantsCount || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
