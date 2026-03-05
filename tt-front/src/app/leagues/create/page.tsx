"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useGameSystem } from "@/lib/context/GameSystemContext";
import { createLeague } from "@/lib/api/leagues";
import { CreateLeagueDTO } from "@/lib/types/league";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateLeaguePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { gameSystems, loadingSystems } = useGameSystem();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateLeagueDTO>({
    name: "",
    description: "",
    gameSystemId: 0,
    startDate: new Date().toISOString().split("T")[0], // Default to today
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0], // Default +1 month
    autoAcceptGames: true,
    autoAcceptTournaments: true,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    pointsParticipation: 1,
    pointsPerParticipant: 0,
  });

  // Redirect logic for auth could be handled by a layout or here
  // For now simple check on render might suffice or use middleware
  if (!isAuthenticated) {
    // simple return for now, proper redirect handled elsewhere usually
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">
          Please log in to create a league
        </h2>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = parseInt(value) || 0;
    } else if (name === "gameSystemId") {
      parsedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleCheckboxChange = (
    name: keyof CreateLeagueDTO,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.gameSystemId) {
        throw new Error("Please select a game system");
      }

      // Ensure dates are valid strings if needed, api expects ISO local usually or simplified YYYY-MM-DD
      // The input type="date" returns YYYY-MM-DD which is fine for backend LocalDate

      const newLeague = await createLeague(formData);
      router.push(`/leagues/${newLeague.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSystems) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Button variant="ghost" className="mb-4" asChild>
        <Link href="/leagues">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leagues
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New League</CardTitle>
          <CardDescription>
            Start a new season for your community
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">League Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Summer Championship 2024"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameSystemId">Game System</Label>
              <select
                id="gameSystemId"
                name="gameSystemId"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                value={formData.gameSystemId}
                onChange={handleChange}
              >
                <option value={0}>Select a system...</option>
                {gameSystems.map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Rules, schedule, prizes..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Scoring Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsWin">Win Points</Label>
                  <Input
                    type="number"
                    id="pointsWin"
                    name="pointsWin"
                    value={formData.pointsWin}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsDraw">Draw Points</Label>
                  <Input
                    type="number"
                    id="pointsDraw"
                    name="pointsDraw"
                    value={formData.pointsDraw}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsLoss">Loss Points</Label>
                  <Input
                    type="number"
                    id="pointsLoss"
                    name="pointsLoss"
                    value={formData.pointsLoss}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsParticipation">
                    Participation Points
                  </Label>
                  <Input
                    type="number"
                    id="pointsParticipation"
                    name="pointsParticipation"
                    value={formData.pointsParticipation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Settings</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoAcceptGames"
                  checked={formData.autoAcceptGames}
                  onChange={(e) =>
                    handleCheckboxChange("autoAcceptGames", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="autoAcceptGames">
                  Auto-approve match submissions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoAcceptTournaments"
                  checked={formData.autoAcceptTournaments}
                  onChange={(e) =>
                    handleCheckboxChange(
                      "autoAcceptTournaments",
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="autoAcceptTournaments">
                  Auto-approve tournament results
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create League
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
