"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IdNameDTO } from "@/lib/types/systems";
import { getGameSystems } from "@/lib/api/systems";

interface GameSystemContextType {
  selectedGameSystemId: string;
  setSelectedGameSystemId: (id: string) => void;
  gameSystems: IdNameDTO[];
  loadingSystems: boolean;
}

const GameSystemContext = createContext<GameSystemContextType | undefined>(undefined);

export function GameSystemProvider({ children }: { children: React.ReactNode }) {
  const [selectedGameSystemId, setSelectedGameSystemId] = useState<string>("all");
  const [gameSystems, setGameSystems] = useState<IdNameDTO[]>([]);
  const [loadingSystems, setLoadingSystems] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("selectedGameSystemId");
    if (stored) {
        setSelectedGameSystemId(stored);
    }
    
    getGameSystems()
      .then((systems) => {
          setGameSystems(systems);
          setLoadingSystems(false);
      })
      .catch((err) => {
          console.error("Failed to load game systems", err);
          setLoadingSystems(false);
      });
  }, []);

  const handleSetGameSystemId = (id: string) => {
      setSelectedGameSystemId(id);
      localStorage.setItem("selectedGameSystemId", id);
  };

  return (
    <GameSystemContext.Provider
      value={{
        selectedGameSystemId,
        setSelectedGameSystemId: handleSetGameSystemId,
        gameSystems,
        loadingSystems,
      }}
    >
      {children}
    </GameSystemContext.Provider>
  );
}

export function useGameSystem() {
  const context = useContext(GameSystemContext);
  if (context === undefined) {
    throw new Error("useGameSystem must be used within a GameSystemProvider");
  }
  return context;
}
