"use client";

import { useEffect, useState } from "react";
import { listLeagues } from "@/lib/api/leagues";
import { LeagueDTO } from "@/lib/types/league";
import { LeagueCard } from "@/components/features/leagues/LeagueCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/useAuth";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";

export default function LeaguesPage() {
  const { isAuthenticated } = useAuth();
  const [leagues, setLeagues] = useState<LeagueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await listLeagues(0, 50); // Fetch first 50 for now
        setLeagues(response.content || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load leagues");
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leagues</h1>
          <p className="text-muted-foreground mt-2">
            Join existing leagues or create your own to compete.
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild>
            <Link href="/leagues/create">
              <Plus className="mr-2 h-4 w-4" /> Create League
            </Link>
          </Button>
        )}
      </div>

      {leagues.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold">No leagues found</h3>
          <p className="text-muted-foreground mt-1">
            Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  );
}
