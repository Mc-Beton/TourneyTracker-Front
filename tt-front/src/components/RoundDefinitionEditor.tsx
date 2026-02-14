"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  TournamentRoundDefinitionDTO,
  UpdateRoundDefinitionDTO,
} from "@/lib/types/roundDefinition";
import type { IdNameDTO } from "@/lib/types/systems";
import { updateRoundDefinition } from "@/lib/api/roundDefinitions";
import { getDeployments, getPrimaryMissions } from "@/lib/api/systems";
import { useAuth } from "@/lib/auth/useAuth";
import { Loader2 } from "lucide-react";

interface RoundDefinitionEditorProps {
  tournamentId: number;
  roundNumber: number;
  gameSystemId: number;
  currentDefinition: TournamentRoundDefinitionDTO;
  open: boolean;
  onClose: (updated: boolean) => void;
}

export function RoundDefinitionEditor({
  tournamentId,
  roundNumber,
  gameSystemId,
  currentDefinition,
  open,
  onClose,
}: RoundDefinitionEditorProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deployments, setDeployments] = useState<IdNameDTO[]>([]);
  const [missions, setMissions] = useState<IdNameDTO[]>([]);

  const [form, setForm] = useState<UpdateRoundDefinitionDTO>({
    deploymentId: currentDefinition.deploymentId,
    primaryMissionId: currentDefinition.primaryMissionId,
    isSplitMapLayout: currentDefinition.isSplitMapLayout,
    mapLayoutEven: currentDefinition.mapLayoutEven || "",
    mapLayoutOdd: currentDefinition.mapLayoutOdd || "",
    byeLargePoints: currentDefinition.byeLargePoints,
    byeSmallPoints: currentDefinition.byeSmallPoints,
    splitLargePoints: currentDefinition.splitLargePoints,
    splitSmallPoints: currentDefinition.splitSmallPoints,
    pairingAlgorithm: currentDefinition.pairingAlgorithm || "STANDARD",
    playerLevelPairingStrategy:
      currentDefinition.playerLevelPairingStrategy || "NONE",
    tableAssignmentStrategy:
      currentDefinition.tableAssignmentStrategy || "BEST_FIRST",
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSystemId]);

  async function loadData() {
    if (!auth.token) return;

    setLoading(true);
    try {
      const [deploymentsData, missionsData] = await Promise.all([
        getDeployments(gameSystemId, auth.token),
        getPrimaryMissions(gameSystemId, auth.token),
      ]);
      setDeployments(deploymentsData);
      setMissions(missionsData);
    } catch (e) {
      console.error("Error loading data:", e);
      setError("Nie udało się załadować danych");
    } finally {
      setLoading(false);
    }
  }

  const update = (
    key: keyof UpdateRoundDefinitionDTO,
    value: string | number | boolean | null,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    if (!auth.token) {
      setError("Brak autoryzacji");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateRoundDefinition(tournamentId, roundNumber, form, auth.token);
      onClose(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się zapisać zmian");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edycja definicji rundy {roundNumber}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            {/* Deployment */}
            <div>
              <Label htmlFor="deployment">Deployment</Label>
              <select
                id="deployment"
                value={form.deploymentId || ""}
                onChange={(e) =>
                  update(
                    "deploymentId",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Wybierz...</option>
                {deployments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Mission */}
            <div>
              <Label htmlFor="mission">Misja główna</Label>
              <select
                id="mission"
                value={form.primaryMissionId || ""}
                onChange={(e) =>
                  update(
                    "primaryMissionId",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Wybierz...</option>
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Layout */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="splitLayout"
                  checked={form.isSplitMapLayout}
                  onChange={(e) => update("isSplitMapLayout", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="splitLayout" className="cursor-pointer">
                  Różne układy mapy dla parzystych i nieparzystych stolików
                </Label>
              </div>

              {form.isSplitMapLayout ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="mapEven">Układ dla parzystych</Label>
                    <Input
                      id="mapEven"
                      value={form.mapLayoutEven || ""}
                      onChange={(e) => update("mapLayoutEven", e.target.value)}
                      placeholder="np. A, B, C..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="mapOdd">Układ dla nieparzystych</Label>
                    <Input
                      id="mapOdd"
                      value={form.mapLayoutOdd || ""}
                      onChange={(e) => update("mapLayoutOdd", e.target.value)}
                      placeholder="np. D, E, F..."
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="mapLayout">Układ mapy</Label>
                  <Input
                    id="mapLayout"
                    value={form.mapLayoutEven || ""}
                    onChange={(e) => update("mapLayoutEven", e.target.value)}
                    placeholder="np. Standard"
                  />
                </div>
              )}
            </div>

            {/* Bye/Split Points */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Punkty za BYE i Split</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="byeLarge">BYE Large Points</Label>
                  <Input
                    id="byeLarge"
                    type="number"
                    min={0}
                    value={form.byeLargePoints}
                    onChange={(e) =>
                      update("byeLargePoints", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="byeSmall">BYE Small Points</Label>
                  <Input
                    id="byeSmall"
                    type="number"
                    min={0}
                    value={form.byeSmallPoints}
                    onChange={(e) =>
                      update("byeSmallPoints", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="splitLarge">Split Large Points</Label>
                  <Input
                    id="splitLarge"
                    type="number"
                    min={0}
                    value={form.splitLargePoints}
                    onChange={(e) =>
                      update("splitLargePoints", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="splitSmall">Split Small Points</Label>
                  <Input
                    id="splitSmall"
                    type="number"
                    min={0}
                    value={form.splitSmallPoints}
                    onChange={(e) =>
                      update("splitSmallPoints", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Pairing Algorithm - tylko dla rundy 1 */}
            {roundNumber === 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Algorytm parowania</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="algorithmStandard"
                      name="pairingAlgorithm"
                      value="STANDARD"
                      checked={form.pairingAlgorithm === "STANDARD"}
                      onChange={(e) =>
                        update("pairingAlgorithm", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="algorithmStandard"
                      className="cursor-pointer font-normal"
                    >
                      Standardowy (losowe przetasowanie)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="algorithmCustom"
                      name="pairingAlgorithm"
                      value="CUSTOM"
                      checked={form.pairingAlgorithm === "CUSTOM"}
                      onChange={(e) =>
                        update("pairingAlgorithm", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="algorithmCustom"
                      className="cursor-pointer font-normal"
                    >
                      Custom (dostosowany algorytm)
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Player Level Pairing Strategy - tylko dla rundy 1 i CUSTOM */}
            {roundNumber === 1 && form.pairingAlgorithm === "CUSTOM" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Strategia parowania według poziomu gracza
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="strategyNone"
                      name="playerLevelPairingStrategy"
                      value="NONE"
                      checked={form.playerLevelPairingStrategy === "NONE"}
                      onChange={(e) =>
                        update("playerLevelPairingStrategy", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="strategyNone"
                      className="cursor-pointer font-normal"
                    >
                      Brak - losowe parowanie
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="strategyBeginnersWithVeterans"
                      name="playerLevelPairingStrategy"
                      value="BEGINNERS_WITH_VETERANS"
                      checked={
                        form.playerLevelPairingStrategy ===
                        "BEGINNERS_WITH_VETERANS"
                      }
                      onChange={(e) =>
                        update("playerLevelPairingStrategy", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="strategyBeginnersWithVeterans"
                      className="cursor-pointer font-normal"
                    >
                      Początkujący z weteranami - łączenie różnych poziomów
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="strategyBeginnersWithBeginners"
                      name="playerLevelPairingStrategy"
                      value="BEGINNERS_WITH_BEGINNERS"
                      checked={
                        form.playerLevelPairingStrategy ===
                        "BEGINNERS_WITH_BEGINNERS"
                      }
                      onChange={(e) =>
                        update("playerLevelPairingStrategy", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="strategyBeginnersWithBeginners"
                      className="cursor-pointer font-normal"
                    >
                      Początkujący z początkującymi - parowanie podobnych
                      poziomów
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Pairing Algorithm - dla rund kolejnych (>1) */}
            {roundNumber > 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Algorytm parowania graczy
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="algorithmStandardNext"
                      name="pairingAlgorithmNext"
                      value="STANDARD"
                      checked={form.pairingAlgorithm === "STANDARD"}
                      onChange={(e) =>
                        update("pairingAlgorithm", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="algorithmStandardNext"
                      className="cursor-pointer font-normal"
                    >
                      Standardowy (ranking)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="algorithmCustomNext"
                      name="pairingAlgorithmNext"
                      value="CUSTOM"
                      checked={form.pairingAlgorithm === "CUSTOM"}
                      onChange={(e) =>
                        update("pairingAlgorithm", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="algorithmCustomNext"
                      className="cursor-pointer font-normal"
                    >
                      Dynamiczny (dostosowany)
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Table Assignment Strategy - dla rund kolejnych i CUSTOM */}
            {roundNumber > 1 && form.pairingAlgorithm === "CUSTOM" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Strategia przypisywania stołów
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="tableBestFirst"
                      name="tableAssignmentStrategy"
                      value="BEST_FIRST"
                      checked={form.tableAssignmentStrategy === "BEST_FIRST"}
                      onChange={(e) =>
                        update("tableAssignmentStrategy", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="tableBestFirst"
                      className="cursor-pointer font-normal"
                    >
                      Najlepsi do pierwszych stołów - stoły sekwencyjnie wg
                      rankingu
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="tableRandom"
                      name="tableAssignmentStrategy"
                      value="RANDOM"
                      checked={form.tableAssignmentStrategy === "RANDOM"}
                      onChange={(e) =>
                        update("tableAssignmentStrategy", e.target.value)
                      }
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor="tableRandom"
                      className="cursor-pointer font-normal"
                    >
                      Losowe - każda para dostaje losowy numer stołu
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={saving}
          >
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
