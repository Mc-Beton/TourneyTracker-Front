"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Team, TeamMember, TeamMemberStatus } from "@/lib/types/team";
import { getTeam, getTeamMembers, joinTeam, leaveTeam, acceptMember, kickMember } from "@/lib/api/teams";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/lib/auth/useAuth";

export default function TeamDetailsPage() {
  const router = useRouter(); 
  const auth = useAuth();
  const params = useParams();
  const id = Number(params.id);

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTeam(id), getTeamMembers(id)])
      .then(([t, m]) => {
        setTeam(t);
        setMembers(m);
      })
      .catch((err) => setError("Failed to load team details."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    if (!team) return;
    try {
      await joinTeam(team.id);
      // Reload
      const t = await getTeam(id);
        const m = await getTeamMembers(id);
        setTeam(t);
        setMembers(m);
    } catch (err: any) {
      alert(err.message || "Failed to join team.");
    }
  };

  const handleLeave = async () => {
    if (!team) return;
    if (confirm("Are you sure you want to leave this team?")) {
      try {
        await leaveTeam(team.id);
        router.push("/teams/my");
      } catch (err: any) {
        alert(err.message || "Failed to leave team.");
      }
    }
  };

  const handleAccept = async (memberId: number) => {
    try {
      await acceptMember(id, memberId);
      const m = await getTeamMembers(id);
      setMembers(m);
    } catch (err: any) {
      alert("Failed to accept member.");
    }
  };

  const handleKick = async (memberId: number) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await kickMember(id, memberId);
        const m = await getTeamMembers(id);
        setMembers(m);
      } catch (err: any) {
        alert("Failed to kick member.");
      }
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="p-4">Loading team...</div>
    </MainLayout>
  );

  if (!team) return (
    <MainLayout>
      <div className="p-4 text-red-500">{error || "Team not found"}</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{team.name} [{team.abbreviation}]</h1>
            <p className="text-gray-600 mb-1">Game System: {team.gameSystemName}</p>
            <p className="text-gray-600 mb-1">City: {team.city}</p>
            <p className="text-gray-600 mb-4">Owner: {team.ownerName}</p>
            <p className="text-gray-800">{team.description}</p>
          </div>
          <div>
            {!team.isMember && !team.isOwner && !members.some(m => m.userId === auth.userId) && (
              <button 
                onClick={handleJoin}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Join Team
              </button>
            )}
            {team.isMember && !team.isOwner && (
              <button 
                onClick={handleLeave}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Leave Team
              </button>
            )}
            {team.isOwner && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-bold border border-yellow-300">
                You are Owner
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Members ({members.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined At
                </th>
                {team.isOwner && (
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {member.userName}
                          {member.userId === team.ownerId && " (Owner)"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        member.status === TeamMemberStatus.ACTIVE
                          ? "text-green-900"
                          : "text-orange-900"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-0 ${
                          member.status === TeamMemberStatus.ACTIVE
                            ? "bg-green-200"
                            : "bg-orange-200"
                        } opacity-50 rounded-full`}
                      ></span>
                      <span className="relative">{member.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </td>
                  {team.isOwner && (
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex gap-2">
                         {member.status === TeamMemberStatus.PENDING && (
                           <button
                             onClick={() => handleAccept(member.id)}
                             className="text-green-600 hover:text-green-900"
                           >
                             Accept
                           </button>
                         )}
                         {member.userId !== team.ownerId && (
                           <button
                             onClick={() => handleKick(member.id)}
                             className="text-red-600 hover:text-red-900"
                           >
                             Kick
                           </button>
                         )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
