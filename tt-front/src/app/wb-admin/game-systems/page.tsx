"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllGameSystems,
  createGameSystem,
  updateGameSystem,
  deleteGameSystem,
  type GameSystemDTO,
  type CreateGameSystemDTO,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminGameSystemsPage() {
  const router = useRouter();
  const [gameSystems, setGameSystems] = useState<GameSystemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateGameSystemDTO>({
    name: "",
    defaultRoundNumber: 5,
    primaryScoreEnabled: true,
    secondaryScoreEnabled: true,
    thirdScoreEnabled: false,
    additionalScoreEnabled: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/wb-admin");
      return;
    }
    loadGameSystems();
  }, [router]);

  async function loadGameSystems() {
    try {
      setLoading(true);
      const data = await getAllGameSystems();
      setGameSystems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await createGameSystem(formData);
      setShowCreateForm(false);
      resetForm();
      await loadGameSystems();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdate(id: number) {
    try {
      await updateGameSystem(id, formData);
      setEditingId(null);
      resetForm();
      await loadGameSystems();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this game system?")) return;
    try {
      await deleteGameSystem(id);
      await loadGameSystems();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function startEdit(gs: GameSystemDTO) {
    setEditingId(gs.id);
    setFormData({
      name: gs.name,
      defaultRoundNumber: gs.defaultRoundNumber,
      primaryScoreEnabled: gs.primaryScoreEnabled,
      secondaryScoreEnabled: gs.secondaryScoreEnabled,
      thirdScoreEnabled: gs.thirdScoreEnabled,
      additionalScoreEnabled: gs.additionalScoreEnabled,
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      defaultRoundNumber: 5,
      primaryScoreEnabled: true,
      secondaryScoreEnabled: true,
      thirdScoreEnabled: false,
      additionalScoreEnabled: false,
    });
  }

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/wb-admin");
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Game Systems Management</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "Create New Game System"}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Game System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name*
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Round Number*
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.defaultRoundNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultRoundNumber: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.primaryScoreEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryScoreEnabled: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Primary Score Enabled</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.secondaryScoreEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondaryScoreEnabled: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Secondary Score Enabled</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.thirdScoreEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thirdScoreEnabled: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Third Score Enabled</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.additionalScoreEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additionalScoreEnabled: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Additional Score Enabled</span>
                  </label>
                </div>

                <Button onClick={handleCreate}>Create</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {gameSystems.map((gs) => (
            <Card key={gs.id}>
              <CardContent className="pt-6">
                {editingId === gs.id ? (
                  <div className="space-y-4">
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      min="1"
                      value={formData.defaultRoundNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultRoundNumber: parseInt(e.target.value),
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(gs.id)}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{gs.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Default Rounds: {gs.defaultRoundNumber}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        {gs.primaryScoreEnabled && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                            Primary
                          </span>
                        )}
                        {gs.secondaryScoreEnabled && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Secondary
                          </span>
                        )}
                        {gs.thirdScoreEnabled && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            Third
                          </span>
                        )}
                        {gs.additionalScoreEnabled && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                            Additional
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/wb-admin/game-systems/${gs.id}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(gs)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(gs.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
