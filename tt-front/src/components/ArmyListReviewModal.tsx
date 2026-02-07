"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { participantApi } from "@/lib/api/participants";
import { ArmyListStatusBadge } from "@/components/ui/status-badges";
import type { ArmyListDetails } from "@/lib/api/participants";
import { X } from "lucide-react";

interface ArmyListReviewModalProps {
  tournamentId: number;
  userId: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export function ArmyListReviewModal({
  tournamentId,
  userId,
  userName,
  isOpen,
  onClose,
  onReviewSubmitted,
}: ArmyListReviewModalProps) {
  const [armyList, setArmyList] = useState<ArmyListDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    participantApi
      .getParticipantArmyList(tournamentId, userId)
      .then((data) => {
        setArmyList(data);
        setRejectionReason(data.rejectionReason || "");
      })
      .catch((e) => {
        console.error("Error loading army list:", e);
        setError("Nie udało się załadować rozpiski");
      })
      .finally(() => setLoading(false));
  }, [isOpen, tournamentId, userId]);

  const handleApprove = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await participantApi.reviewArmyList(tournamentId, userId, {
        approved: true,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      onClose();
    } catch (e) {
      console.error("Error approving army list:", e);
      setError("Nie udało się zatwierdzić rozpiski");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Podaj powód odrzucenia");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await participantApi.reviewArmyList(tournamentId, userId, {
        approved: false,
        rejectionReason: rejectionReason.trim(),
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      onClose();
    } catch (e) {
      console.error("Error rejecting army list:", e);
      setError("Nie udało się odrzucić rozpiski");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Rozpiska - {userName}</CardTitle>
            {armyList && (
              <div className="mt-2">
                <ArmyListStatusBadge status={armyList.status} />
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Ładowanie...</p>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          ) : armyList ? (
            <>
              {/* Army Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Frakcja
                  </p>
                  <p className="text-base">{armyList.armyFactionName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Armia
                  </p>
                  <p className="text-base">{armyList.armyName}</p>
                </div>
              </div>

              {/* Submission Date */}
              {armyList.submittedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Data przesłania
                  </p>
                  <p className="text-base">
                    {new Date(armyList.submittedAt).toLocaleString("pl-PL")}
                  </p>
                </div>
              )}

              {/* Review Date */}
              {armyList.reviewedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Data weryfikacji
                  </p>
                  <p className="text-base">
                    {new Date(armyList.reviewedAt).toLocaleString("pl-PL")}
                  </p>
                </div>
              )}

              {/* Army List Content */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Treść rozpiski
                </p>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap font-mono text-sm">
                  {armyList.armyListContent}
                </div>
              </div>

              {/* Rejection Reason (for rejected or to enter when rejecting) */}
              {(armyList.status === "REJECTED" ||
                armyList.status === "PENDING") && (
                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium mb-2"
                  >
                    Powód odrzucenia{" "}
                    {armyList.status === "PENDING" && "(opcjonalnie)"}
                  </label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Wpisz powód odrzucenia..."
                    rows={3}
                    disabled={armyList.status === "REJECTED"}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {armyList.status === "PENDING" && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Zamknij
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={submitting}
                  >
                    {submitting ? "Odrzucanie..." : "Odrzuć"}
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    {submitting ? "Zatwierdzanie..." : "Zatwierdź"}
                  </Button>
                </div>
              )}

              {armyList.status !== "PENDING" && (
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={onClose}>
                    Zamknij
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Brak rozpiski</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
