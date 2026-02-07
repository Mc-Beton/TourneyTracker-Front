"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  Target,
  Map,
  Award,
  Users,
  Clock,
  Edit,
} from "lucide-react";
import type { TournamentRoundDefinitionDTO } from "@/lib/types/roundDefinition";
import { RoundDefinitionEditor } from "@/components/RoundDefinitionEditor";

interface RoundInfoCardProps {
  roundNumber: number;
  definition?: TournamentRoundDefinitionDTO;
  totalMatches?: number;
  completedMatches?: number;
  isStarted: boolean;
  isCompleted: boolean;
  startTime?: string;
  endTime?: string;
  isOrganizer?: boolean;
  tournamentId?: number;
  gameSystemId?: number;
  onUpdate?: () => void;
}

export function RoundInfoCard({
  roundNumber,
  definition,
  totalMatches = 0,
  completedMatches = 0,
  isStarted,
  isCompleted,
  startTime,
  endTime,
  isOrganizer = false,
  tournamentId,
  gameSystemId,
  onUpdate,
}: RoundInfoCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditorClose = (updated: boolean) => {
    setEditDialogOpen(false);
    if (updated && onUpdate) {
      onUpdate();
    }
  };
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Zakończona
        </span>
      );
    }
    if (isStarted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ W trakcie
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        📅 Oczekuje
      </span>
    );
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">Runda {roundNumber}</CardTitle>
              {getStatusBadge()}
            </div>
            {isOrganizer && definition && tournamentId && gameSystemId && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
                className="gap-1 flex-shrink-0"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edytuj</span>
              </Button>
            )}
          </div>

          {/* Timeline */}
          {(startTime || endTime) && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(startTime) && <span>{formatTime(startTime)}</span>}
              {formatTime(startTime) && formatTime(endTime) && <span>-</span>}
              {formatTime(endTime) && <span>{formatTime(endTime)}</span>}
            </div>
          )}

          {/* Match progress */}
          {isStarted && totalMatches > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    Mecze: {completedMatches}/{totalMatches}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {Math.round((completedMatches / totalMatches) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedMatches / totalMatches) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          {definition ? (
            <div className="space-y-3">
              {/* Deployment */}
              {definition.deploymentName && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <GitBranch className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium">
                      Deployment
                    </div>
                    <div className="text-sm font-medium truncate">
                      {definition.deploymentName}
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Mission */}
              {definition.primaryMissionName && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Target className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium">
                      Misja główna
                    </div>
                    <div className="text-sm font-medium truncate">
                      {definition.primaryMissionName}
                    </div>
                  </div>
                </div>
              )}

              {/* Map Layout */}
              {(definition.isSplitMapLayout !== null ||
                definition.mapLayoutOdd ||
                definition.mapLayoutEven) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Map className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium">
                      Układ map
                    </div>
                    <div className="text-sm">
                      {definition.isSplitMapLayout ? (
                        <div className="space-y-1">
                          {definition.mapLayoutOdd && (
                            <div>
                              <span className="font-medium">Nieparzyste:</span>{" "}
                              {definition.mapLayoutOdd}
                            </div>
                          )}
                          {definition.mapLayoutEven && (
                            <div>
                              <span className="font-medium">Parzyste:</span>{" "}
                              {definition.mapLayoutEven}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="font-medium">
                          {definition.mapLayoutOdd || definition.mapLayoutEven}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BYE/Split Points */}
              {((definition.byeSmallPoints !== null &&
                definition.byeSmallPoints > 0) ||
                (definition.byeLargePoints !== null &&
                  definition.byeLargePoints > 0) ||
                (definition.splitSmallPoints !== null &&
                  definition.splitSmallPoints > 0) ||
                (definition.splitLargePoints !== null &&
                  definition.splitLargePoints > 0)) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium">
                      Punkty specjalne
                    </div>
                    <div className="text-xs space-y-0.5 mt-1">
                      {definition.byeSmallPoints !== null &&
                        definition.byeSmallPoints > 0 && (
                          <div>
                            BYE: {definition.byeSmallPoints} PP
                            {definition.byeLargePoints !== null &&
                              definition.byeLargePoints > 0 &&
                              ` + ${definition.byeLargePoints} TP`}
                          </div>
                        )}
                      {definition.splitSmallPoints !== null &&
                        definition.splitSmallPoints > 0 && (
                          <div>
                            Split: {definition.splitSmallPoints} PP
                            {definition.splitLargePoints !== null &&
                              definition.splitLargePoints > 0 &&
                              ` + ${definition.splitLargePoints} TP`}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Brak szczegółów dla tej rundy
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      {isOrganizer && definition && tournamentId && gameSystemId && (
        <RoundDefinitionEditor
          open={editDialogOpen}
          onClose={handleEditorClose}
          currentDefinition={definition}
          tournamentId={tournamentId}
          roundNumber={roundNumber}
          gameSystemId={gameSystemId}
        />
      )}
    </>
  );
}
