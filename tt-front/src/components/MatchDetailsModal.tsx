"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMatchScoring } from "@/lib/api/scoring";
import type { MatchScoringDTO } from "@/lib/types/scoring";
import { useAuth } from "@/lib/auth/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MatchDetailsModalProps {
  matchId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchDetailsModal({
  matchId,
  isOpen,
  onClose,
}: MatchDetailsModalProps) {
  const auth = useAuth();
  const [data, setData] = useState<MatchScoringDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && matchId && auth.token) {
      loadData(matchId, auth.token);
    } else {
      setData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, matchId, auth.token]);

  async function loadData(id: number, token: string) {
    setLoading(true);
    try {
      const result = await getMatchScoring(id, token);
      setData(result);
    } catch (e) {
      console.error(e);
      setError("Nie udało się pobrać szczegółów meczu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Szczegóły meczu</DialogTitle>
        </DialogHeader>

        {loading && <div className="py-8 text-center">Ładowanie...</div>}
        {error && (
          <div className="py-8 text-center text-destructive">{error}</div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center items-center p-4 bg-muted rounded-lg border">
              <div className="text-xl font-bold break-words">
                {data.player1Name}
              </div>
              <div className="text-sm text-muted-foreground uppercase font-bold text-xs tracking-wider">
                VS
              </div>
              <div className="text-xl font-bold break-words">
                {data.player2Name}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Runda</TableHead>
                  <TableHead className="text-center" colSpan={2}>
                    {data.player1Name}
                  </TableHead>
                  <TableHead className="text-center" colSpan={2}>
                    {data.player2Name}
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="text-center text-xs">Primary</TableHead>
                  <TableHead className="text-center text-xs">
                    Secondary
                  </TableHead>
                  <TableHead className="text-center text-xs">Primary</TableHead>
                  <TableHead className="text-center text-xs">
                    Secondary
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rounds.map((round) => (
                  <TableRow key={round.roundNumber}>
                    <TableCell className="font-medium">
                      {round.roundNumber}
                    </TableCell>
                    <TableCell className="text-center">
                      {round.player1MainScore ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {round.player1SecondaryScore ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {round.player2MainScore ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {round.player2SecondaryScore ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Suma */}
                <TableRow className="font-bold bg-muted/50 border-t-2">
                  <TableCell>SUMA</TableCell>
                  <TableCell className="text-center">
                    {data.rounds.reduce(
                      (acc, r) => acc + (r.player1MainScore || 0),
                      0,
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {data.rounds.reduce(
                      (acc, r) => acc + (r.player1SecondaryScore || 0),
                      0,
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {data.rounds.reduce(
                      (acc, r) => acc + (r.player2MainScore || 0),
                      0,
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {data.rounds.reduce(
                      (acc, r) => acc + (r.player2SecondaryScore || 0),
                      0,
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="font-black text-lg bg-muted">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center" colSpan={2}>
                    {data.rounds.reduce(
                      (acc, r) =>
                        acc +
                        (r.player1MainScore || 0) +
                        (r.player1SecondaryScore || 0),
                      0,
                    )}
                  </TableCell>
                  <TableCell className="text-center" colSpan={2}>
                    {data.rounds.reduce(
                      (acc, r) =>
                        acc +
                        (r.player2MainScore || 0) +
                        (r.player2SecondaryScore || 0),
                      0,
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
