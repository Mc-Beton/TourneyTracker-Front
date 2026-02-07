"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TournamentRoundDefinitionDTO } from "@/lib/types/roundDefinition";
import { Edit, Map, Target, GitBranch, Award } from "lucide-react";
import { RoundDefinitionEditor } from "@/components/RoundDefinitionEditor";

interface RoundDefinitionCardProps {
  definition: TournamentRoundDefinitionDTO;
  isOrganizer: boolean;
  tournamentId: number;
  gameSystemId: number;
  onUpdate: () => void;
}

export function RoundDefinitionCard({
  definition,
  isOrganizer,
  tournamentId,
  gameSystemId,
  onUpdate,
}: RoundDefinitionCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditorClose = (updated: boolean) => {
    setEditDialogOpen(false);
    if (updated) {
      onUpdate();
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                Runda {definition.roundNumber}
              </span>
            </CardTitle>
            {isOrganizer && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Edytuj
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Deployment */}
          <div className="flex items-start gap-2">
            <GitBranch className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground uppercase">
                Deployment
              </div>
              <div className="text-sm font-semibold truncate">
                {definition.deploymentName || (
                  <span className="text-muted-foreground italic">
                    Nie ustawiono
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Mission */}
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground uppercase">
                Misja główna
              </div>
              <div className="text-sm font-semibold truncate">
                {definition.primaryMissionName || (
                  <span className="text-muted-foreground italic">
                    Nie ustawiono
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Map Layout */}
          <div className="flex items-start gap-2">
            <Map className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground uppercase">
                Układ mapy
              </div>
              <div className="text-sm">
                {definition.isSplitMapLayout ? (
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Parzyste: </span>
                      <span className="text-muted-foreground">
                        {definition.mapLayoutEven || "Nie ustawiono"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Nieparzyste: </span>
                      <span className="text-muted-foreground">
                        {definition.mapLayoutOdd || "Nie ustawiono"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {definition.mapLayoutEven || definition.mapLayoutOdd || (
                      <span className="italic">Nie ustawiono</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bye/Split Points */}
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Punkty
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="font-medium">BYE Large</div>
                  <div className="text-sm font-bold text-green-600">
                    {definition.byeLargePoints}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="font-medium">BYE Small</div>
                  <div className="text-sm font-bold text-green-600">
                    {definition.byeSmallPoints}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="font-medium">Split Large</div>
                  <div className="text-sm font-bold text-blue-600">
                    {definition.splitLargePoints}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="font-medium">Split Small</div>
                  <div className="text-sm font-bold text-blue-600">
                    {definition.splitSmallPoints}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      {editDialogOpen && (
        <RoundDefinitionEditor
          tournamentId={tournamentId}
          roundNumber={definition.roundNumber}
          gameSystemId={gameSystemId}
          currentDefinition={definition}
          open={editDialogOpen}
          onClose={handleEditorClose}
        />
      )}
    </>
  );
}
