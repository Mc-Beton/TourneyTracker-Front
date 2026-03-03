"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { participantApi } from "@/lib/api/participants";

interface AdditionalPointsModalProps {
  tournamentId: number;
  userId: number;
  userName: string;
  initialPoints: number;
  isOpen: boolean;
  onClose: () => void;
  onPointsUpdated: () => void;
}

export function AdditionalPointsModal({
  tournamentId,
  userId,
  userName,
  initialPoints,
  isOpen,
  onClose,
  onPointsUpdated,
}: AdditionalPointsModalProps) {
  const [points, setPoints] = useState(initialPoints || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPoints(initialPoints || 0);
      setError(null);
    }
  }, [isOpen, initialPoints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await participantApi.updateAdditionalPoints(tournamentId, userId, points);
      onPointsUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update points");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Punkty dodatkowe/karne: {userName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Wartość punktowa (+/-)
            </label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wpisz wartość dodatnią dla bonusu lub ujemną dla kary.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
