"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getArmyFactions, getArmies } from "@/lib/api/systems";
import { participantApi } from "@/lib/api/participants";
import { useAuth } from "@/lib/auth/useAuth";
import type { ArmyFaction, Army } from "@/lib/types/participant";

interface ArmyListFormProps {
  tournamentId: number;
  gameSystemId: number;
  onSubmitSuccess?: () => void;
}

export function ArmyListForm({
  tournamentId,
  gameSystemId,
  onSubmitSuccess,
}: ArmyListFormProps) {
  const auth = useAuth();
  const [factions, setFactions] = useState<ArmyFaction[]>([]);
  const [armies, setArmies] = useState<Army[]>([]);
  const [selectedFactionId, setSelectedFactionId] = useState<number | null>(
    null,
  );
  const [selectedArmyId, setSelectedArmyId] = useState<number | null>(null);
  const [armyListContent, setArmyListContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFactions, setLoadingFactions] = useState(true);
  const [loadingArmies, setLoadingArmies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingList, setExistingList] = useState(false);

  // Load factions on mount
  useEffect(() => {
    if (!auth.token) return;

    setLoadingFactions(true);
    getArmyFactions(gameSystemId, auth.token)
      .then((data) => setFactions(data))
      .catch((e) => {
        console.error("Error loading factions:", e);
        setError("Nie udało się załadować frakcji");
      })
      .finally(() => setLoadingFactions(false));
  }, [gameSystemId, auth.token]);

  // Load existing army list
  useEffect(() => {
    if (!auth.token) return;

    participantApi
      .getMyArmyList(tournamentId)
      .then((data) => {
        setExistingList(true);
        setArmyListContent(data.armyListContent);
        // Find faction by name and set it
        const faction = factions.find((f) => f.name === data.armyFactionName);
        if (faction) {
          setSelectedFactionId(faction.id);
        }
      })
      .catch(() => {
        // No army list yet - that's fine
        setExistingList(false);
      });
  }, [tournamentId, auth.token, factions]);

  // Load armies when faction is selected
  useEffect(() => {
    if (!selectedFactionId || !auth.token) {
      setArmies([]);
      setSelectedArmyId(null);
      return;
    }

    setLoadingArmies(true);
    getArmies(selectedFactionId, auth.token)
      .then((data) => {
        setArmies(data);
        // If we're loading existing list, find and set the army
        if (existingList) {
          participantApi.getMyArmyList(tournamentId).then((listData) => {
            const army = data.find((a) => a.name === listData.armyName);
            if (army) {
              setSelectedArmyId(army.id);
            }
          });
        }
      })
      .catch((e) => {
        console.error("Error loading armies:", e);
        setError("Nie udało się załadować armii");
      })
      .finally(() => setLoadingArmies(false));
  }, [selectedFactionId, auth.token, existingList, tournamentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFactionId || !selectedArmyId || !armyListContent.trim()) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await participantApi.submitMyArmyList(tournamentId, {
        armyFactionId: selectedFactionId,
        armyId: selectedArmyId,
        armyListContent: armyListContent.trim(),
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (e) {
      console.error("Error submitting army list:", e);
      setError("Nie udało się zapisać rozpiski");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFactions) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Ładowanie formularza...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingList ? "Edytuj rozpiskę" : "Dodaj rozpiskę"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Faction Select */}
          <div>
            <label htmlFor="faction" className="block text-sm font-medium mb-1">
              Frakcja
            </label>
            <select
              id="faction"
              value={selectedFactionId || ""}
              onChange={(e) =>
                setSelectedFactionId(Number(e.target.value) || null)
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Wybierz frakcję</option>
              {factions.map((faction) => (
                <option key={faction.id} value={faction.id}>
                  {faction.name}
                </option>
              ))}
            </select>
          </div>

          {/* Army Select */}
          <div>
            <label htmlFor="army" className="block text-sm font-medium mb-1">
              Armia
            </label>
            <select
              id="army"
              value={selectedArmyId || ""}
              onChange={(e) =>
                setSelectedArmyId(Number(e.target.value) || null)
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!selectedFactionId || loadingArmies}
              required
            >
              <option value="">
                {loadingArmies ? "Ładowanie..." : "Wybierz armię"}
              </option>
              {armies.map((army) => (
                <option key={army.id} value={army.id}>
                  {army.name}
                </option>
              ))}
            </select>
          </div>

          {/* Army List Content */}
          <div>
            <label
              htmlFor="armyList"
              className="block text-sm font-medium mb-1"
            >
              Rozpiska (treść)
            </label>
            <Textarea
              id="armyList"
              value={armyListContent}
              onChange={(e) => setArmyListContent(e.target.value)}
              placeholder="Wpisz swoją rozpiskę..."
              rows={10}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Zapisuję..."
              : existingList
                ? "Aktualizuj rozpiskę"
                : "Wyślij rozpiskę"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
