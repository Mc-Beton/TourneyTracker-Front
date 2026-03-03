"use client";

import { useEffect, useState } from "react";
import { Team } from "@/lib/types/team";
import { getMyTeams } from "@/lib/api/teams";
import Link from "next/link";

export default function MyTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTeams()
      .then(setTeams)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4">Loading teams...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <Link href="/teams/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-gray-500">You are not a member of any team.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="border p-4 rounded shadow hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-2">{team.name} [{team.abbreviation}]</h2>
              <p className="text-sm text-gray-600 mb-1">{team.gameSystemName}</p>
              <p className="text-sm text-gray-600 mb-2">{team.city}</p>
              <p className="text-gray-700 mb-4 truncate">{team.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="bg-gray-200 px-2 py-1 rounded">{team.memberCount} members</span>
                {team.isOwner && <span className="bg-yellow-200 px-2 py-1 rounded text-yellow-800">Owner</span>}
              </div>
              <div className="mt-4 text-right">
                 <Link href={`/teams/${team.id}`} className="text-blue-600 hover:underline">
                    View Details
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
