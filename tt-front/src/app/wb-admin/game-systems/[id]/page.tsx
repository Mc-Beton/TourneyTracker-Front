"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getGameSystem,
  getArmyFactions,
  getDeployments,
  getPrimaryMissions,
  createArmyFaction,
  createDeployment,
  createPrimaryMission,
  deleteArmyFaction,
  deleteDeployment,
  deletePrimaryMission,
  type GameSystemDTO,
  type IdNameDTO,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GameSystemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [gameSystem, setGameSystem] = useState<GameSystemDTO | null>(null);
  const [factions, setFactions] = useState<IdNameDTO[]>([]);
  const [deployments, setDeployments] = useState<IdNameDTO[]>([]);
  const [missions, setMissions] = useState<IdNameDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newFactionName, setNewFactionName] = useState("");
  const [newDeploymentName, setNewDeploymentName] = useState("");
  const [newMissionName, setNewMissionName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/wb-admin");
      return;
    }
    loadData();
  }, [id, router]);

  async function loadData() {
    try {
      setLoading(true);
      const [gsData, factionsData, deploymentsData, missionsData] =
        await Promise.all([
          getGameSystem(id),
          getArmyFactions(id),
          getDeployments(id),
          getPrimaryMissions(id),
        ]);
      setGameSystem(gsData);
      setFactions(factionsData);
      setDeployments(deploymentsData);
      setMissions(missionsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFaction() {
    if (!newFactionName.trim()) return;
    try {
      await createArmyFaction({ name: newFactionName, gameSystemId: id });
      setNewFactionName("");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreateDeployment() {
    if (!newDeploymentName.trim()) return;
    try {
      await createDeployment({ name: newDeploymentName, gameSystemId: id });
      setNewDeploymentName("");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreateMission() {
    if (!newMissionName.trim()) return;
    try {
      await createPrimaryMission({ name: newMissionName, gameSystemId: id });
      setNewMissionName("");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteFaction(factionId: number) {
    if (!confirm("Delete this faction? Armies within it will also be deleted."))
      return;
    try {
      await deleteArmyFaction(factionId);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteDeployment(deploymentId: number) {
    if (!confirm("Delete this deployment?")) return;
    try {
      await deleteDeployment(deploymentId);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteMission(missionId: number) {
    if (!confirm("Delete this mission?")) return;
    try {
      await deletePrimaryMission(missionId);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!gameSystem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Game system not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/wb-admin/game-systems">
            <Button variant="outline">← Back</Button>
          </Link>
          <h1 className="text-3xl font-bold">{gameSystem.name}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Army Factions */}
          <Card>
            <CardHeader>
              <CardTitle>Army Factions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="New faction name"
                  value={newFactionName}
                  onChange={(e) => setNewFactionName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateFaction()}
                />
                <Button
                  onClick={handleCreateFaction}
                  className="w-full"
                  size="sm"
                >
                  Add Faction
                </Button>
              </div>

              <div className="space-y-2">
                {factions.map((faction) => (
                  <div
                    key={faction.id}
                    className="flex justify-between items-center p-2 bg-slate-100 rounded"
                  >
                    <Link
                      href={`/wb-admin/game-systems/${id}/factions/${faction.id}`}
                      className="flex-1 hover:underline"
                    >
                      {faction.name}
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteFaction(faction.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                {factions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No factions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deployments */}
          <Card>
            <CardHeader>
              <CardTitle>Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="New deployment name"
                  value={newDeploymentName}
                  onChange={(e) => setNewDeploymentName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCreateDeployment()
                  }
                />
                <Button
                  onClick={handleCreateDeployment}
                  className="w-full"
                  size="sm"
                >
                  Add Deployment
                </Button>
              </div>

              <div className="space-y-2">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex justify-between items-center p-2 bg-slate-100 rounded"
                  >
                    <span className="flex-1">{deployment.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDeployment(deployment.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                {deployments.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No deployments yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Primary Missions */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="New mission name"
                  value={newMissionName}
                  onChange={(e) => setNewMissionName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateMission()}
                />
                <Button
                  onClick={handleCreateMission}
                  className="w-full"
                  size="sm"
                >
                  Add Mission
                </Button>
              </div>

              <div className="space-y-2">
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    className="flex justify-between items-center p-2 bg-slate-100 rounded"
                  >
                    <span className="flex-1">{mission.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMission(mission.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                {missions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No missions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
