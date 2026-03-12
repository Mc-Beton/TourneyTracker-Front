"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getArmies,
  createArmy,
  deleteArmy,
  type IdNameDTO,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FactionArmiesPage() {
  const router = useRouter();
  const params = useParams();
  const gameSystemId = parseInt(params.id as string);
  const factionId = parseInt(params.factionId as string);

  const [armies, setArmies] = useState<IdNameDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newArmyName, setNewArmyName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/wb-admin");
      return;
    }
    loadArmies();
  }, [factionId, router]);

  async function loadArmies() {
    try {
      setLoading(true);
      const data = await getArmies(factionId);
      setArmies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newArmyName.trim()) return;
    try {
      await createArmy({ name: newArmyName, armyFactionId: factionId });
      setNewArmyName("");
      await loadArmies();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(armyId: number) {
    if (!confirm("Delete this army?")) return;
    try {
      await deleteArmy(armyId);
      await loadArmies();
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/wb-admin/game-systems/${gameSystemId}`}>
            <Button variant="outline">← Back</Button>
          </Link>
          <h1 className="text-3xl font-bold">Manage Armies</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Armies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Input
                placeholder="New army name"
                value={newArmyName}
                onChange={(e) => setNewArmyName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} className="w-full">
                Add Army
              </Button>
            </div>

            <div className="space-y-2">
              {armies.map((army) => (
                <div
                  key={army.id}
                  className="flex justify-between items-center p-3 bg-slate-100 rounded"
                >
                  <span className="flex-1 font-medium">{army.name}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(army.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {armies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No armies yet. Add one above!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
