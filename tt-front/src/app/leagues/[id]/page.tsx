"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getLeague, getLeagueMembers, joinLeague } from "@/lib/api/leagues";
import { LeagueDTO, LeagueMemberDTO } from "@/lib/types/league";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, AlertCircle } from "lucide-react";

export default function LeagueDetailsPage() {
  const params = useParams();
  const id = parseInt(
    Array.isArray(params.id) ? params.id[0] : params.id || "0",
  );
  const { isAuthenticated, userId } = useAuth();

  const [league, setLeague] = useState<LeagueDTO | null>(null);
  const [members, setMembers] = useState<LeagueMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid League ID");
      return;
    }

    const fetchData = async () => {
      try {
        const [leagueData, membersData] = await Promise.all([
          getLeague(id),
          getLeagueMembers(id),
        ]);
        setLeague(leagueData);
        // Assume membersData is array or {content: []} depending on API
        // According to API file, getLeagueMembers returns Promise<LeagueMemberDTO[]>
        setMembers(membersData);
      } catch (err) {
        console.error(err);
        setError("Failed to load league details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const isMember = members.some((m) => m.user.id === userId);

  const handleJoin = async () => {
    if (!league) return;
    try {
      setJoining(true);
      await joinLeague(id);
      // Refresh members
      const updatedMembers = await getLeagueMembers(id);
      setMembers(updatedMembers);
    } catch (err) {
      console.error("Failed to join league", err);
      // Optionally set error state or show toast
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-xl font-semibold text-red-500">
          {error || "League not found"}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{league.name}</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {league.description}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {league.gameSystem?.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {league.memberCount} Members
            </span>
            <span>•</span>
            <span>
              {new Date(league.startDate).toLocaleDateString()} -{" "}
              {new Date(league.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isAuthenticated && !isMember && (
          <Button onClick={handleJoin} disabled={joining}>
            {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join League
          </Button>
        )}
        {isAuthenticated && isMember && (
          <Button variant="outline">My Dashboard</Button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Current standings for this season
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No members yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground pb-2 border-b px-2">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">Player</div>
                    <div className="col-span-2 text-center">Pts</div>
                    <div className="col-span-2 text-center">W</div>
                    <div className="col-span-2 text-center">Matches</div>
                  </div>
                  {/* Table Rows */}
                  {members
                    .sort((a, b) => b.points - a.points)
                    .map((member, index) => (
                      <div
                        key={member.id}
                        className={`grid grid-cols-12 items-center py-3 px-2 rounded-lg ${
                          member.user.id === userId
                            ? "bg-muted/50 font-medium"
                            : ""
                        }`}
                      >
                        <div className="col-span-1 text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div className="col-span-5 truncate">
                          {member.user.name}
                        </div>
                        <div className="col-span-2 text-center font-bold text-primary">
                          {member.points}
                        </div>
                        <div className="col-span-2 text-center">
                          {member.wins}
                        </div>
                        <div className="col-span-2 text-center text-muted-foreground">
                          {member.matchesPlayed}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Scoring Rules & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span>Win</span>
                <span className="font-semibold text-green-600">
                  +{league.pointsWin} pts
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Draw</span>
                <span className="font-semibold text-yellow-600">
                  +{league.pointsDraw} pts
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Loss</span>
                <span className="font-semibold text-red-600">
                  +{league.pointsLoss} pts
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Participation</span>
                <span className="font-semibold">
                  +{league.pointsParticipation} pts
                </span>
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                * Points per participant: {league.pointsPerParticipant}
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel Placeholder */}
          {league.owner && league.owner.id === userId && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="text-yellow-800">
                  Admin Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full justify-start">
                  Manage Members
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  Edit Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
