"use client";

import { useEffect, useState } from "react";
import { CreateTeamRequest } from "@/lib/types/team";
import { createTeam } from "@/lib/api/teams";
import { IdNameDTO } from "@/lib/types/systems";
import { getGameSystems } from "@/lib/api/systems";
import { useRouter } from "next/navigation";

export default function CreateTeamPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: "",
    abbreviation: "",
    city: "",
    description: "",
    gameSystemId: 0,
  });

  const [systems, setSystems] = useState<IdNameDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGameSystems()
      .then(setSystems)
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.gameSystemId === 0) {
      setError("Please select a game system.");
      return;
    }

    try {
      await createTeam(formData);
      router.push("/teams/my"); // Redirect to My Teams
    } catch (err: any) {
      setError(err.message || "Failed to create team.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Create New Team</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Team Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Abbreviation</label>
          <input
            type="text"
            name="abbreviation"
            value={formData.abbreviation}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
            required
            maxLength={10}
          />
        </div>
        <div>
           <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
           <input
             type="text"
             name="city"
             value={formData.city}
             onChange={handleChange}
             className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
             required
           />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Game System</label>
          <select
            name="gameSystemId"
            value={formData.gameSystemId}
            onChange={(e) => setFormData({ ...formData, gameSystemId: Number(e.target.value) })}
            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
            required
          >
            <option value={0}>Select a system</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Team
        </button>
      </form>
    </div>
  );
}
