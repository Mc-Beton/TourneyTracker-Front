"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getLeague,
  getLeagueMembers,
  joinLeague,
  getPendingMembers,
  approveMember,
} from "@/lib/api/leagues";
import { LeagueDTO, LeagueMemberDTO } from "@/lib/types/league";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, AlertCircle, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeagueDetailsPage() {
  const params = useParams();
  const id = parseInt(
    Array.isArray(params.id) ? params.id[0] : params.id || "0",
  );
  const { isAuthenticated, userId, isLoading: authLoading } = useAuth();

  const [league, setLeague] = useState<LeagueDTO | null>(null);
  const [members, setMembers] = useState<LeagueMemberDTO[]>([]);
  const [pendingMembers, setPendingMembers] = useState<LeagueMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    if (!id || authLoading) return;

    const fetchData = async () => {
      try {
        const leagueData = await getLeague(id);
        setLeague(leagueData);

        const membersData = await getLeagueMembers(id);
        setMembers(membersData);

        if (isAuthenticated && userId && leagueData.owner?.id === userId) {
          try {
            const pendingData = await getPendingMembers(id);
            setPendingMembers(pendingData);
          } catch (e) {
            console.error("Failed to load pending members", e);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load league details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, authLoading, isAuthenticated, userId]);

  const isMember = members.some((m) => m.user.id === userId);
  const isOwner = league?.owner?.id === userId;

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
    } finally {
      setJoining(false);
    }
  };

  const handleApprove = async (memberUserId: number) => {
    try {
      setApproving(memberUserId);
      await approveMember(id, memberUserId);
      // Refresh pending and members
      const [updatedMembers, updatedPending] = await Promise.all([
        getLeagueMembers(id),
        getPendingMembers(id),
      ]);
      setMembers(updatedMembers);
      setPendingMembers(updatedPending);
    } catch (err) {
      console.error("Failed to approve member", err);
    } finally {
      setApproving(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-xl font-semibold text-destructive">
          {error || "League not found"}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 container mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{league.name}</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {league.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded">
              <Trophy className="w-4 h-4" />
              {league.gameSystem?.name}
            </span>
            <span className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded">
              <Users className="w-4 h-4" />
              {league.memberCount} Members
            </span>
            <span className="bg-secondary/10 px-2 py-1 rounded">
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
        {isAuthenticated && isMember && !isOwner && (
             <div className="px-4 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium">
                 Member
             </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardDescription>Current standings for this season</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-md bg-muted/5">
                  No members yet. Be the first to join!
                </div>
              ) : (
                <div className="rounded-md border">
                    <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground bg-muted/50 py-3 px-4 border-b">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Player</div>
                        <div className="col-span-2 text-center">Pts</div>
                        <div className="col-span-2 text-center">W</div>
                        <div className="col-span-2 text-center">M</div>
                    </div>
                  <div className="divide-y">
                    {members
                        .sort((a, b) => b.points - a.points)
                        .map((member, index) => (
                        <div
                            key={member.id}
                            className={`grid grid-cols-12 items-center py-3 px-4 hover:bg-muted/5 transition-colors ${
                            member.user.id === userId
                                ? "bg-blue-50/50 hover:bg-blue-50"
                                : ""
                            }`}
                        >
                            <div className="col-span-1 font-mono text-muted-foreground">
                            {index + 1}
                            </div>
                            <div className="col-span-5 font-medium truncate flex items-center gap-2">
                                {/* Avatar placeholder could go here */}
                                {member.user.name}
                                {member.user.id === userId && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">You</span>}
                                {league.owner?.id === member.user.id && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Owner</span>}
                            </div>
                            <div className="col-span-2 text-center font-bold text-primary">
                            {member.points}
                            </div>
                            <div className="col-span-2 text-center text-muted-foreground">
                            {member.wins}
                            </div>
                            <div className="col-span-2 text-center text-muted-foreground">
                            {member.matchesPlayed}
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin / Owner Section */}
          {isOwner && (
            <div className="space-y-6">
                {/* Pending Requests */}
                <Card className="border-orange-200 shadow-sm">
                    <CardHeader className="pb-3 bg-orange-50/30">
                        <CardTitle className="text-orange-900 flex items-center justify-between text-lg">
                            Pending Requests
                            {pendingMembers.length > 0 && <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{pendingMembers.length}</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {pendingMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">No pending requests</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 border rounded bg-white">
                                        <div className="truncate text-sm font-medium mr-2">{member.user.name}</div>
                                        <div className="flex gap-1">
                                            <Button 
                                                size="sm" 
                                                className="h-7 w-7 p-0" 
                                                variant="outline"
                                                onClick={() => handleApprove(member.user.id)}
                                                disabled={approving === member.user.id}
                                            >
                                                {approving === member.user.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Check className="h-4 w-4 text-green-600" />}
                                                <span className="sr-only">Approve</span>
                                            </Button>
                                             {/* Reject button could be added here */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Scoring Rules (Only visible to owner now) */}
                <Card>
                    <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Scoring Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span>Win</span>
                        <span className="font-semibold text-green-600">
                        +{league.pointsWin} pts
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span>Draw</span>
                        <span className="font-semibold text-yellow-600">
                        +{league.pointsDraw} pts
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span>Loss</span>
                        <span className="font-semibold text-red-600">
                        +{league.pointsLoss} pts
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span>Participation</span>
                        <span className="font-semibold">
                        +{league.pointsParticipation} pts
                        </span>
                    </div>
                    <div className="pt-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                        Points per participant: {league.pointsPerParticipant}
                    </div>
                    </CardContent>
                </Card>

                <Card className="">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Admin Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled>
                            Manage Settings (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>
          )}
          
          {/* If simple member, maybe show some stats or nothing */}
          {!isOwner && (
              <Card className="bg-muted/30 border-dashed">
                  <CardHeader>
                      <CardTitle className="text-base text-muted-foreground">League Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                      <p>Contact the league owner <strong>{league.owner?.name}</strong> for questions about rules or scoring.</p>
                  </CardContent>
              </Card>
          )}

        </div>
      </div>
    </div>
  );
}
