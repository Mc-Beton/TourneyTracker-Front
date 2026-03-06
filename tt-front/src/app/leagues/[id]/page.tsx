"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getLeague,
  getLeagueMembers,
  joinLeague,
  getPendingMembers,
  approveMember,
  setLeagueStatus,
  deleteLeague,
  leaveLeague,
  createChallenge,
  respondToChallenge,
  getMyChallenges,
  getMyOutgoingChallenges,
  getLeagueMatches,
} from "@/lib/api/leagues";
import {
  LeagueDTO,
  LeagueMemberDTO,
  LeagueChallengeDTO,
  LeagueMatchDTO,
  LeagueStatus,
} from "@/lib/types/league";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trophy,
  Users,
  AlertCircle,
  Check,
  X,
  Swords,
  Settings,
  LogOut,
  Calendar,
  Sword,
  ShieldAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function LeagueStatusBadge({ status }: { status: LeagueStatus }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
    ARCHIVED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const labels: Record<string, string> = {
    DRAFT: "Draft",
    ACTIVE: "Aktywna",
    COMPLETED: "Zakończona",
    ARCHIVED: "Archiwum",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold border ${styles[status] || ""}`}
    >
      {labels[status] || status}
    </span>
  );
}

export default function LeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(
    Array.isArray(params.id) ? params.id[0] : params.id || "0",
  );
  const { isAuthenticated, userId, isLoading: authLoading } = useAuth();

  const [league, setLeague] = useState<LeagueDTO | null>(null);
  const [members, setMembers] = useState<LeagueMemberDTO[]>([]);
  const [pendingMembers, setPendingMembers] = useState<LeagueMemberDTO[]>([]);
  const [myChallenges, setMyChallenges] = useState<LeagueChallengeDTO[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<
    LeagueChallengeDTO[]
  >([]);
  const [leagueMatches, setLeagueMatches] = useState<LeagueMatchDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New State for Challenge Dialog
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<number | null>(null);
  const [challengeDate, setChallengeDate] = useState("");
  const [challengeMessage, setChallengeMessage] = useState("");

  const fetchData = async () => {
    try {
      // Don't set loading true here to avoid flickering on re-fetch
      const leagueData = await getLeague(id);
      setLeague(leagueData);

      const [membersData, matchesData] = await Promise.all([
        getLeagueMembers(id),
        getLeagueMatches(id),
      ]);
      setMembers(membersData);
      setLeagueMatches(matchesData?.content || []);

      if (isAuthenticated && userId) {
        if (leagueData.owner?.id === userId) {
          try {
            const pendingData = await getPendingMembers(id);
            setPendingMembers(pendingData);
          } catch (e) {
            console.error("Failed to load pending members", e);
          }
        }

        // Load challenges if member
        const isMember = membersData.some((m) => m.user.id === userId);
        if (isMember) {
          try {
            const [inChallenges, outChallenges] = await Promise.all([
              getMyChallenges(id),
              getMyOutgoingChallenges(id),
            ]);
            setMyChallenges([...inChallenges, ...outChallenges]);
          } catch (e) {
            console.error("Failed to load challenges", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load league details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || authLoading) return;
    fetchData();
  }, [id, authLoading, isAuthenticated, userId]);

  const isMember = members.some((m) => m.user.id === userId);
  const isOwner = league?.owner?.id === userId;

  const handleJoin = async () => {
    if (!league) return;
    try {
      setJoining(true);
      await joinLeague(id);
      fetchData();
    } catch (err) {
      console.error("Failed to join league", err);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Czy na pewno chcesz opuścić ligę?")) return;
    try {
      setActionLoading(true);
      await leaveLeague(id);
      fetchData(); // Will likely redirect or update UI
    } catch (err) {
      console.error("Failed to leave league", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status: LeagueStatus) => {
    if (!confirm(`Czy na pewno zmienić status na ${status}?`)) return;
    try {
      setActionLoading(true);
      await setLeagueStatus(id, status);
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Czy na pewno usunąć ligę? Ta operacja jest nieodwracalna."))
      return;
    try {
      setActionLoading(true);
      await deleteLeague(id);
      router.push("/leagues");
    } catch (err) {
      console.error("Failed to delete league", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMember = async (memberUserId: number) => {
    try {
      setActionLoading(true);
      await approveMember(id, memberUserId);
      fetchData();
    } catch (err) {
      console.error("Failed to approve member", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedOpponent || !challengeDate) {
      alert("Wybierz przeciwnika i datę");
      return;
    }

    try {
      setActionLoading(true);
      await createChallenge({
        leagueId: id,
        opponentId: selectedOpponent,
        scheduledTime: new Date(challengeDate).toISOString(),
        message: challengeMessage,
      });
      setChallengeDialogOpen(false);
      fetchData();
      alert("Wyzwanie wysłane!");
    } catch (err) {
      console.error("Failed to create challenge", err);
      alert("Nie udało się utworzyć wyzwania");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondChallenge = async (
    challengeId: number,
    accept: boolean,
  ) => {
    try {
      setActionLoading(true);
      await respondToChallenge(challengeId, accept);
      fetchData();
    } catch (err) {
      console.error("Failed to respond to challenge", err);
    } finally {
      setActionLoading(false);
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
          {error || "Liga nie znaleziona"}
        </p>
        <Button onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 container mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{league.name}</h1>
            <LeagueStatusBadge status={league.status} />
          </div>
          <p className="text-muted-foreground text-lg">{league.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded">
              <Trophy className="w-4 h-4" />
              {league.gameSystem?.name}
            </span>
            <span className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded">
              <Users className="w-4 h-4" />
              {league.memberCount} Uczestników
            </span>
            <span className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded">
              <Calendar className="w-4 h-4" />
              {new Date(league.startDate).toLocaleDateString()} -{" "}
              {new Date(league.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isAuthenticated && !isMember && (
          <Button
            onClick={handleJoin}
            disabled={joining || league.status !== "ACTIVE"}
          >
            {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {league.status === "DRAFT"
              ? "Liga w przygotowaniu"
              : "Dołącz do Ligi"}
          </Button>
        )}
        {isAuthenticated && isMember && !isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLeave}
              disabled={actionLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Opuść ligę
            </Button>
          </div>
        )}
        {isAuthenticated && isOwner && (
          <div className="flex gap-2">
            {league.status === "DRAFT" && (
              <Button
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Aktywuj Ligę
              </Button>
            )}
            {league.status === "ACTIVE" && (
              <Button
                onClick={() => handleStatusChange("COMPLETED")}
                variant="secondary"
                disabled={actionLoading}
              >
                Zakończ Ligę
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={actionLoading}
              title="Usuń ligę"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {league.status === "DRAFT" && !isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <p>
            Ta liga jest statusie <strong>Draft</strong>. Rozgrywki rozpoczną
            się wkrótce po aktywacji przez organizatora.
          </p>
        </div>
      )}

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="members">Tabela</TabsTrigger>
          <TabsTrigger value="matches">Mecze</TabsTrigger>
          {isAuthenticated && isMember && (
            <TabsTrigger value="challenges">Wyzwania</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Uczestnicy</CardTitle>
                <CardDescription>Ranking i lista graczy</CardDescription>
              </div>
              {isAuthenticated && isMember && league.status === "ACTIVE" && (
                <Dialog
                  open={challengeDialogOpen}
                  onOpenChange={setChallengeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Swords className="mr-2 h-4 w-4" />
                      Wyzwij gracza
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Utwórz wyzwanie</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Wybierz przeciwnika</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={selectedOpponent || ""}
                          onChange={(e) =>
                            setSelectedOpponent(Number(e.target.value))
                          }
                        >
                          <option value="">Wybierz gracza...</option>
                          {members
                            .filter((m) => m.user.id !== userId) // Filter out self
                            .map((m) => (
                              <option key={m.user.id} value={m.user.id}>
                                {m.user.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Planowana data</Label>
                        <Input
                          type="datetime-local"
                          value={challengeDate}
                          onChange={(e) => setChallengeDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Wiadomość (opcjonalnie)</Label>
                        <Input
                          value={challengeMessage}
                          onChange={(e) => setChallengeMessage(e.target.value)}
                          placeholder="Zagramy w sobotę?"
                        />
                      </div>
                      <Button
                        onClick={handleCreateChallenge}
                        disabled={actionLoading}
                        className="w-full"
                      >
                        {actionLoading ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : (
                          <Sword className="mr-2 h-4 w-4" />
                        )}
                        Wyślij wyzwanie
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/5">
                  Brak członków.
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground bg-muted/50 py-3 px-4 border-b">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Gracz</div>
                    <div className="col-span-2 text-center">Pkt</div>
                    <div className="col-span-2 text-center">W</div>
                    <div className="col-span-1 text-center">M</div>
                    <div className="col-span-2 text-right">Akcje</div>
                  </div>
                  <div className="divide-y">
                    {members
                      .sort((a, b) => b.points - a.points)
                      .map((member, index) => (
                        <div
                          key={member.id}
                          className={`grid grid-cols-12 items-center py-3 px-4 hover:bg-muted/5 ${member.user.id === userId ? "bg-blue-50/50" : ""}`}
                        >
                          <div className="col-span-1 font-medium">
                            {index + 1}
                          </div>
                          <div className="col-span-4 font-medium flex items-center gap-2 truncate">
                            {member.user.name}
                            {member.user.id === userId && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                Ty
                              </span>
                            )}
                            {member.user.id === league.owner?.id && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                                Org
                              </span>
                            )}
                          </div>
                          <div className="col-span-2 text-center font-bold">
                            {member.points}
                          </div>
                          <div className="col-span-2 text-center">
                            {member.wins}
                          </div>
                          <div className="col-span-1 text-center">
                            {member.matchesPlayed}
                          </div>
                          <div className="col-span-2 text-right">
                            {isAuthenticated &&
                              isMember &&
                              member.user.id !== userId &&
                              league.status === "ACTIVE" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Wyzwij na pojedynek"
                                  onClick={() => {
                                    setSelectedOpponent(member.user.id);
                                    setChallengeDialogOpen(true);
                                  }}
                                >
                                  <Swords className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isOwner && pendingMembers.length > 0 && (
            <Card className="mt-6 border-yellow-200 bg-yellow-50/30">
              <CardHeader>
                <CardTitle className="text-yellow-800">
                  Oczekujący na akceptację
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-center bg-white p-3 rounded shadow-sm border"
                    >
                      <span className="font-medium">{member.user.name}</span>
                      <Button
                        size="sm"
                        onClick={() => handleApproveMember(member.user.id)}
                        disabled={actionLoading}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Zatwierdź
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matches" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historia Meczów</CardTitle>
              <CardDescription>Ostatnie rozegrane spotkania</CardDescription>
            </CardHeader>
            <CardContent>
              {leagueMatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Brak rozegranych meczów w tej lidze.
                </div>
              ) : (
                <div className="space-y-4">
                  {leagueMatches.map((m) => {
                    const match = m.match;
                    const p1 = match.player1Name || "Nieznany";
                    const p2 = match.player2Name || "Nieznany";
                    const hasResult =
                      match.player1Score !== undefined &&
                      match.player1Score !== null;

                    const p1Score = hasResult ? match.player1Score : "-";
                    const p2Score = hasResult ? match.player2Score : "-";

                    const date = new Date(
                      match.startTime || m.submitDate,
                    ).toLocaleDateString();

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold text-lg">
                            <span
                              className={
                                match.winnerId === match.player1Id
                                  ? "text-green-600 font-bold"
                                  : ""
                              }
                            >
                              {p1}
                            </span>
                            <span className="mx-2 text-muted-foreground">
                              vs
                            </span>
                            <span
                              className={
                                match.winnerId === match.player2Id
                                  ? "text-green-600 font-bold"
                                  : ""
                              }
                            >
                              {p2}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {date}
                            {m.submittedBy && (
                              <span className="text-xs ml-2">
                                (Zgłosił: {m.submittedBy.name})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-2xl font-bold bg-muted px-3 py-1 rounded">
                            {p1Score} : {p2Score}
                          </div>
                          <div
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                              m.status === "APPROVED"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : m.status === "REJECTED"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {m.status === "APPROVED"
                              ? "Zatwierdzony"
                              : m.status === "REJECTED"
                                ? "Odrzucony"
                                : "Oczekujący"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Otrzymane Wyzwania</CardTitle>
                <CardDescription>
                  Inni gracze chcą z Tobą zagrać
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myChallenges.filter(
                  (c) => c.challengedId === userId && c.status === "PENDING",
                ).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Brak nowych wyzwań
                  </div>
                )}
                {myChallenges
                  .filter(
                    (c) => c.challengedId === userId && c.status === "PENDING",
                  )
                  .map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-lg">
                            {challenge.challengerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            wyzywa Cię na pojedynek
                          </p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Oczekuje
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        <p>
                          Kiedy:{" "}
                          {new Date(
                            challenge.scheduledTime || challenge.createdAt,
                          ).toLocaleString()}
                        </p>
                        {challenge.message && (
                          <p className="italic mt-1">"{challenge.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleRespondChallenge(challenge.id, true)
                          }
                        >
                          <Check className="w-4 h-4 mr-2" /> Przyjmij
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleRespondChallenge(challenge.id, false)
                          }
                        >
                          <X className="w-4 h-4 mr-2" /> Odrzuć
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wysłane Wyzwania</CardTitle>
                <CardDescription>Twoje propozycje gier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myChallenges.filter((c) => c.challengerId === userId)
                  .length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nie wysłałeś żadnych wyzwań
                  </div>
                )}
                {myChallenges
                  .filter((c) => c.challengerId === userId)
                  .map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border rounded-lg p-3 bg-gray-50/50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          vs {challenge.challengedName}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            challenge.status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : challenge.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {challenge.status === "PENDING"
                            ? "Oczekuje"
                            : challenge.status === "ACCEPTED"
                              ? "Przyjęte"
                              : "Odrzucone"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Wysłano:{" "}
                        {new Date(challenge.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
