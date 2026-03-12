"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserPublicProfile } from "@/lib/api/users";
import { UserProfileDTO } from "@/lib/types/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Mail,
  MapPin,
  Users,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id ? Number(params.id) : null;

  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getUserPublicProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Nie udało się załadować profilu użytkownika");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Nie znaleziono użytkownika"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winPercentage = profile.winRatio * 100;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
        {(profile.realName || profile.surname) && (
          <p className="text-lg text-muted-foreground">
            {[profile.realName, profile.surname].filter(Boolean).join(" ")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informacje</CardTitle>
            <CardDescription>Dane kontaktowe użytkownika</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            {profile.team && (
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Klub</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.team}
                  </p>
                </div>
              </div>
            )}

            {profile.city && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Miasto</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.city}
                  </p>
                </div>
              </div>
            )}

            {profile.discordNick && (
              <div className="flex items-center space-x-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">Discord</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.discordNick}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Win Ratio */}
        <Card>
          <CardHeader>
            <CardTitle>Współczynnik Wygranych</CardTitle>
            <CardDescription>
              Statystyki ze wszystkich rozgrywek
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {winPercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Win Ratio</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Współczynnik wygranych</span>
                <span className="font-medium">{winPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={winPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Match Statistics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Statystyki Meczów</CardTitle>
            <CardDescription>
              Szczegółowe statystyki ze wszystkich rozgrywek (turnieje i
              pojedyncze mecze)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold">{profile.totalMatches}</div>
                <p className="text-sm text-muted-foreground">Rozegrane mecze</p>
              </div>

              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Trophy className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {profile.wins}
                </div>
                <p className="text-sm text-muted-foreground">Wygrane</p>
              </div>

              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <TrendingUp className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-yellow-500">
                  {profile.draws}
                </div>
                <p className="text-sm text-muted-foreground">Remisy</p>
              </div>

              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Target className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-500">
                  {profile.losses}
                </div>
                <p className="text-sm text-muted-foreground">Przegrane</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
