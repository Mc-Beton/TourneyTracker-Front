"use client";

import { useEffect, useState } from "react";
import { Team } from "@/lib/types/team";
import { getMyTeams, getAllTeams } from "@/lib/api/teams";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useGameSystem } from "@/lib/context/GameSystemContext";

export default function MyTeamsPage() {
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [otherTeams, setOtherTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedGameSystemId } = useGameSystem();

  useEffect(() => {
    Promise.all([getMyTeams(), getAllTeams()])
      .then(([my, all]) => {
        setMyTeams(my);
        // Exclude teams I'm already in (member or owner or pending) from "Other Teams"
        // We assume "my" contains all teams where user has ANY relation (pending or active)
        const others = all.filter((t) => !my.some((m) => m.id === t.id));
        setOtherTeams(others);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filterTeams = (teamsList: Team[]) => {
    if (selectedGameSystemId === "all") return teamsList;
    return teamsList.filter(
      (t) => t.gameSystemId.toString() === selectedGameSystemId,
    );
  };

  const filteredMyTeams = filterTeams(myTeams);
  const filteredOtherTeams = filterTeams(otherTeams);

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Drużyny</h1>
          <Link
            href="/teams/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Utwórz Drużynę
          </Link>
        </div>

        {loading ? (
          <div className="p-4">Ładowanie drużyn...</div>
        ) : (
          <div className="space-y-8">
            {/* My Teams Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Moje Drużyny
              </h2>
              {filteredMyTeams.length === 0 ? (
                <div className="text-gray-500 italic">
                  Nie jesteś członkiem żadnej drużyny.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMyTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="block h-full"
                    >
                      <div className="border border-blue-200 bg-blue-50 p-4 rounded shadow hover:shadow-md transition h-full relative cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">
                            {team.name} [{team.abbreviation}]
                          </h3>
                          {team.isOwner && (
                            <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                              Właściciel
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {team.gameSystemName}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {team.city}
                        </p>
                        <p className="text-gray-700 truncate">
                          {team.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Other Teams Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Dostępne Drużyny
              </h2>
              {filteredOtherTeams.length === 0 ? (
                <div className="text-gray-500 italic">
                  Nie znaleziono innych drużyn dla wybranego systemu gry.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOtherTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="block h-full"
                    >
                      <div className="border p-4 rounded shadow hover:shadow-md transition h-full bg-white cursor-pointer">
                        <h3 className="text-xl font-semibold mb-2">
                          {team.name} [{team.abbreviation}]
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {team.gameSystemName}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {team.city}
                        </p>
                        <p className="text-gray-700 truncate text-sm">
                          {team.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
