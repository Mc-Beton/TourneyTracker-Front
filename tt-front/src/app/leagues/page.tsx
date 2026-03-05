"use client";

import { useEffect, useState } from "react";
import {
  listLeagues,
  listJoinedLeagues,
  listAvailableLeagues,
} from "@/lib/api/leagues";
import { LeagueDTO } from "@/lib/types/league";
import { LeagueCard } from "@/components/features/leagues/LeagueCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/useAuth";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";

export default function LeaguesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"available" | "my">("available");
  const [leagues, setLeagues] = useState<LeagueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If auth is loading, wait.
    if (authLoading) return;
  }, [authLoading]);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (authLoading) return;

      setLoading(true);
      setError(null);
      try {
        let response;
        if (isAuthenticated) {
          if (activeTab === "my") {
            response = await listJoinedLeagues(0, 50);
          } else {
            response = await listAvailableLeagues(0, 50);
          }
        } else {
          response = await listLeagues(0, 50);
        }
        setLeagues(response.content || []);
      } catch (err) {
        console.error(err);
        setError("Nie udało się załadować lig");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [activeTab, isAuthenticated, authLoading]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </Button>
        </div>
      );
    }

    if (leagues.length === 0) {
      return (
        <div className="text-center py-20 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold">
            {activeTab === "my"
              ? "Nie dołączyłeś jeszcze do żadnych lig"
              : "Brak dostępnych lig"}
          </h3>
          <p className="text-muted-foreground mt-2">
            {activeTab === "my"
              ? "Dołącz do ligi, aby zobaczyć ją tutaj!"
              : "Bądź pierwszym, który ją stworzy!"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <LeagueCard key={league.id} league={league} />
        ))}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ligi</h1>
          <p className="text-muted-foreground mt-2">
            Dołącz do istniejących lig lub stwórz własną, aby rywalizować.
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild>
            <Link href="/leagues/create">
              <Plus className="mr-2 h-4 w-4" /> Stwórz Ligę
            </Link>
          </Button>
        )}
      </div>

      {isAuthenticated && (
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab("available")}
            className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "available"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dostępne Ligi
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "my"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Moje Ligi
          </button>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
