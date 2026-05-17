"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getOrganizerMatchScoring,
  updateOrganizerMatchScores,
  type AdminBulkEditScoresDTO,
} from "@/lib/api/organizer";
import type { MatchScoringDTO, ScoreEntryDTO, SubmitScoreDTO } from "@/lib/types/scoring";
import { useAuth } from "@/lib/auth/useAuth";

interface OrganizerScoresModalProps {
  matchId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void; // callback to refresh parent data
}

/**
 * Modal for organizer to bulk edit all rounds' scores for a finished tournament match.
 */
export function OrganizerScoresModal({ matchId, open, onClose, onSaved }: OrganizerScoresModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatchScoringDTO | null>(null);

  // Local editable state: map roundNumber -> values per player and score types
  type RoundEdit = {
    roundNumber: number;
    p1: { MAIN_SCORE?: string; SECONDARY_SCORE?: string; THIRD_SCORE?: string; ADDITIONAL_SCORE?: string };
    p2: { MAIN_SCORE?: string; SECONDARY_SCORE?: string; THIRD_SCORE?: string; ADDITIONAL_SCORE?: string };
  };
  const [edits, setEdits] = useState<RoundEdit[]>([]);

  useEffect(() => {
    if (!open) {
      setData(null);
      setEdits([]);
      setError(null);
      setLoading(false);
      setSaving(false);
      return;
    }
    if (!matchId || !auth.token) return;
    loadData(matchId, auth.token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, matchId, auth.token]);

  async function loadData(id: number, token: string) {
    setLoading(true);
    setError(null);
    try {
      const dto = await getOrganizerMatchScoring(id, token);
      setData(dto);
      // Prefill edits from dto
      const rounds: RoundEdit[] = dto.rounds.map((r) => ({
        roundNumber: r.roundNumber,
        p1: {
          MAIN_SCORE: r.player1MainScore?.toString() ?? "",
          SECONDARY_SCORE: r.player1SecondaryScore?.toString() ?? "",
          // Optional third/additional left blank if not enabled
        },
        p2: {
          MAIN_SCORE: r.player2MainScore?.toString() ?? "",
          SECONDARY_SCORE: r.player2SecondaryScore?.toString() ?? "",
        },
      }));
      setEdits(rounds);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Nie udało się pobrać danych do edycji";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const enabledTypes = useMemo(() => {
    return {
      MAIN_SCORE: data?.primaryScoreEnabled ?? true,
      SECONDARY_SCORE: data?.secondaryScoreEnabled ?? true,
      THIRD_SCORE: data?.thirdScoreEnabled ?? false,
      ADDITIONAL_SCORE: data?.additionalScoreEnabled ?? false,
    } as const;
  }, [data]);

  function updateValue(roundNumber: number, player: "p1" | "p2", type: keyof RoundEdit["p1"], val: string) {
    setEdits((prev) =>
      prev.map((r) =>
        r.roundNumber === roundNumber ? { ...r, [player]: { ...r[player], [type]: val } } : r,
      ),
    );
  }

  function buildPayload(): AdminBulkEditScoresDTO {
    if (!data) throw new Error("Brak danych");

    const types: (keyof RoundEdit["p1"])[] = ["MAIN_SCORE", "SECONDARY_SCORE", "THIRD_SCORE", "ADDITIONAL_SCORE"];

    const roundsPayload: SubmitScoreDTO[] = edits.map((r) => {
      const scores: ScoreEntryDTO[] = [];
      for (const t of types) {
        if (!(enabledTypes as any)[t]) continue; // skip disabled type
        const p1Val = r.p1[t];
        const p2Val = r.p2[t];
        if (p1Val !== undefined && p1Val !== null && p1Val !== "") {
          scores.push({ side: "PLAYER1", scoreType: t as any, score: parseInt(p1Val, 10) || 0 });
        } else {
          // if empty, we'll treat as leave unchanged; to enforce zero set explicit 0
        }
        if (p2Val !== undefined && p2Val !== null && p2Val !== "") {
          scores.push({ side: "PLAYER2", scoreType: t as any, score: parseInt(p2Val, 10) || 0 });
        }
      }
      return { roundNumber: r.roundNumber, scores } as SubmitScoreDTO;
    });

    return { rounds: roundsPayload } as AdminBulkEditScoresDTO;
  }

  async function handleSave() {
    if (!auth.token || !matchId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      await updateOrganizerMatchScores(matchId, payload, auth.token);
      if (onSaved) onSaved();
      onClose();
    } catch (e: any) {
      console.error(e);
      const message = e?.message || "Nie udało się zapisać zmian";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edycja wyników meczu (organizator)</DialogTitle>
        </DialogHeader>

        {loading && <div className="py-6">Ładowanie…</div>}
        {error && <div className="py-3 text-destructive">{error}</div>}

        {!loading && data && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="text-right font-semibold break-words">{data.player1Name}</div>
              <div className="text-center text-muted-foreground">vs</div>
              <div className="font-semibold break-words">{data.player2Name}</div>
            </div>

            <div className="space-y-4">
              {edits.map((r) => (
                <div key={r.roundNumber} className="border rounded p-3">
                  <div className="font-medium mb-3">Runda {r.roundNumber}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                    {enabledTypes.MAIN_SCORE && (
                      <div>
                        <label className="text-xs block mb-1">P1 Primary</label>
                        <Input
                          type="number"
                          value={r.p1.MAIN_SCORE ?? ""}
                          onChange={(e) => updateValue(r.roundNumber, "p1", "MAIN_SCORE", e.target.value)}
                        />
                      </div>
                    )}
                    {enabledTypes.SECONDARY_SCORE && (
                      <div>
                        <label className="text-xs block mb-1">P1 Secondary</label>
                        <Input
                          type="number"
                          value={r.p1.SECONDARY_SCORE ?? ""}
                          onChange={(e) => updateValue(r.roundNumber, "p1", "SECONDARY_SCORE", e.target.value)}
                        />
                      </div>
                    )}
                    {enabledTypes.MAIN_SCORE && (
                      <div>
                        <label className="text-xs block mb-1">P2 Primary</label>
                        <Input
                          type="number"
                          value={r.p2.MAIN_SCORE ?? ""}
                          onChange={(e) => updateValue(r.roundNumber, "p2", "MAIN_SCORE", e.target.value)}
                        />
                      </div>
                    )}
                    {enabledTypes.SECONDARY_SCORE && (
                      <div>
                        <label className="text-xs block mb-1">P2 Secondary</label>
                        <Input
                          type="number"
                          value={r.p2.SECONDARY_SCORE ?? ""}
                          onChange={(e) => updateValue(r.roundNumber, "p2", "SECONDARY_SCORE", e.target.value)}
                        />
                      </div>
                    )}
                    {/* Third/additional types (if enabled) */}
                    {enabledTypes.THIRD_SCORE && (
                      <>
                        <div>
                          <label className="text-xs block mb-1">P1 Third</label>
                          <Input
                            type="number"
                            value={r.p1.THIRD_SCORE ?? ""}
                            onChange={(e) => updateValue(r.roundNumber, "p1", "THIRD_SCORE", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs block mb-1">P2 Third</label>
                          <Input
                            type="number"
                            value={r.p2.THIRD_SCORE ?? ""}
                            onChange={(e) => updateValue(r.roundNumber, "p2", "THIRD_SCORE", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    {enabledTypes.ADDITIONAL_SCORE && (
                      <>
                        <div>
                          <label className="text-xs block mb-1">P1 Additional</label>
                          <Input
                            type="number"
                            value={r.p1.ADDITIONAL_SCORE ?? ""}
                            onChange={(e) => updateValue(r.roundNumber, "p1", "ADDITIONAL_SCORE", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs block mb-1">P2 Additional</label>
                          <Input
                            type="number"
                            value={r.p2.ADDITIONAL_SCORE ?? ""}
                            onChange={(e) => updateValue(r.roundNumber, "p2", "ADDITIONAL_SCORE", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Zapisywanie…" : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
