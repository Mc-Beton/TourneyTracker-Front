"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Dumbbell,
  Users,
  Play,
  CheckCircle,
} from "lucide-react";
import { getTournaments } from "@/lib/api/tournaments";
import { useGameSystem } from "@/lib/context/GameSystemContext";
import type { TournamentListItemDTO } from "@/lib/types/tournament";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function TournamentListPage() {
  const [items, setItems] = useState<TournamentListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedGameSystemId } = useGameSystem();
  
  const [activeTab, setActiveTab] = useState<
    "future" | "ongoing" | "completed"
  >("future");

  useEffect(() => {
    getTournaments()
      .then((tournaments) => {
        setItems(tournaments);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, []);

  const getFilteredTournaments = (
    category: "future" | "ongoing" | "completed",
  ) => {
    return items.filter((t) => {
      // Game System
      if (
        selectedGameSystemId !== "all" &&
        t.gameSystemId.toString() !== selectedGameSystemId
      ) {
        return false;
      }

      switch (category) {
        case "ongoing":
          return t.status === "IN_PROGRESS";
        case "completed":
          return t.status === "COMPLETED" || t.status === "CANCELLED";
        case "future":
        default:
          return t.status === "ACTIVE" || t.status === "DRAFT";
      }
    });
  };

  const filteredItems = getFilteredTournaments(activeTab);

  if (loading)
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout>
        <div className="text-destructive p-4 border border-destructive rounded bg-destructive/10">
          Błąd: {error}
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Turnieje</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-full sm:w-auto inline-flex self-start">
        <button
          onClick={() => setActiveTab("future")}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "future"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Przyszłe</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("ongoing")}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "ongoing"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            <span>Trwające</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "completed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Zakończone</span>
          </div>
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            Brak turniejów w tej kategorii.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="block group"
            >
              <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            t.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : t.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-700"
                                : t.status === "COMPLETED"
                                  ? "bg-gray-100 text-gray-700"
                                  : t.status === "DRAFT"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.status === "ACTIVE"
                            ? "ZAPISY OTWARTE"
                            : t.status === "IN_PROGRESS"
                              ? "W TRAKCIE"
                              : t.status === "COMPLETED"
                                ? "ZAKOŃCZONY"
                                : t.status === "DRAFT"
                                  ? "SZKIC"
                                  : "ANULOWANY"}
                        </span>
                        {t.gameSystemName && (
                          <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                            {t.gameSystemName}
                          </span>
                        )}
                      </div>

                      <h2 className="font-semibold text-lg sm:text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                        {t.name}
                      </h2>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary/70" />
                          <span>{t.startDate}</span>
                        </div>

                        {t.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            <span className="truncate">{t.location}</span>
                          </div>
                        )}

                        {t.armyPointsLimit && (
                          <div className="flex items-center gap-1.5">
                            <Dumbbell className="w-4 h-4 text-primary/70" />
                            <span>{t.armyPointsLimit} pkt</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-2 min-w-[60px]">
                      <Users className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="font-bold text-lg">
                        {t.confirmedParticipantsCount || 0}
                        {t.maxParticipants ? (
                          <span className="text-xs text-muted-foreground font-normal">
                            /{t.maxParticipants}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
