"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Team,
  TeamMember,
  TeamMemberStatus,
  UpdateTeamRequest,
} from "@/lib/types/team";
import {
  getTeam,
  getTeamMembers,
  joinTeam,
  leaveTeam,
  acceptMember,
  kickMember,
  updateTeam,
  transferOwnership,
} from "@/lib/api/teams";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTeamRequest>({});

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = () => {
    Promise.all([getTeam(id), getTeamMembers(id)])
      .then(([t, m]) => {
        setTeam(t);
        setMembers(m);
        setEditForm({
          name: t.name,
          abbreviation: t.abbreviation,
          city: t.city,
          description: t.description,
        });
      })
      .catch((err) => setError("Failed to load team details."))
      .finally(() => setLoading(false));
  };

  const handleUpdate = async () => {
    if (!team) return;
    try {
      const updated = await updateTeam(team.id, editForm);
      setTeam(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update team");
    }
  };

  const handleTransfer = async (memberId: number, memberName: string) => {
    if (!team) return;
    if (
      confirm(
        `Are you sure you want to transfer ownership to ${memberName}? You will lose administrative privileges.`,
      )
    ) {
      try {
        await transferOwnership(team.id, memberId);
        loadData(); // Reload to see permission changes
      } catch (err: any) {
        alert(err.message || "Failed to transfer ownership");
      }
    }
  };

  const handleJoin = async () => {
    if (!team) return;
    try {
      await joinTeam(team.id);
      loadData();
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
      loadData();
    } catch (err: any) {
      alert("Failed to accept member.");
    }
  };

  const handleKick = async (memberId: number) => {
    if (confirm("Are you sure you want to remove/reject this member?")) {
      try {
        await kickMember(id, memberId);
        loadData();
      } catch (err: any) {
        alert("Failed to remove member.");
      }
    }
  };

  if (loading)
    return (
      <MainLayout>
        <div className="p-4">Loading team...</div>
      </MainLayout>
    );

  if (!team)
    return (
      <MainLayout>
        <div className="p-4 text-red-500">{error || "Team not found"}</div>
      </MainLayout>
    );

  const activeMembers = members.filter(
    (m) => m.status === TeamMemberStatus.ACTIVE,
  );
  const pendingMembers = members.filter(
    (m) => m.status === TeamMemberStatus.PENDING,
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Team Header / Edit Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Edit Team</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Abbreviation
                </label>
                <input
                  type="text"
                  value={editForm.abbreviation || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, abbreviation: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={editForm.city || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {team.name} [{team.abbreviation}]
                </h1>
                <p className="text-gray-600 mb-1">
                  Game System: {team.gameSystemName}
                </p>
                <p className="text-gray-600 mb-1">City: {team.city}</p>
                <p className="text-gray-600 mb-4">Owner: {team.ownerName}</p>
                <p className="text-gray-800">{team.description}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {!team.isMember &&
                  !team.isOwner &&
                  !members.some((m) => m.userId === auth.userId) && (
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
                  <>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-bold border border-yellow-300 text-center w-full">
                      Owner
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                    >
                      Edit Details
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pending Members */}
        {team.isOwner && pendingMembers.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-yellow-500">
            <h2 className="text-2xl font-bold mb-4 text-yellow-800">
              Pending Requests ({pendingMembers.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap font-bold">
                          {member.userName}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(member.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleKick(member.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Members */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Active Members ({activeMembers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member
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
                {activeMembers.map((member) => (
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
                      <p className="text-gray-900 whitespace-no-wrap">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </td>
                    {team.isOwner && (
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex gap-2">
                          {member.userId !== team.ownerId && (
                            <>
                              <button
                                onClick={() =>
                                  handleTransfer(member.id, member.userName)
                                }
                                className="text-blue-600 hover:text-blue-900 text-xs border border-blue-600 px-2 py-1 rounded"
                              >
                                Make Owner
                              </button>
                              <button
                                onClick={() => handleKick(member.id)}
                                className="text-red-600 hover:text-red-900 text-xs border border-red-600 px-2 py-1 rounded"
                              >
                                Remove
                              </button>
                            </>
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
