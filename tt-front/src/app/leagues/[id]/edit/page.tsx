"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useGameSystem } from "@/lib/context/GameSystemContext";
import { getLeague, updateLeague } from "@/lib/api/leagues";
import { CreateLeagueDTO, LeagueDTO } from "@/lib/types/league";
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

export default function EditLeaguePage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(
    Array.isArray(params.id) ? params.id[0] : params.id || "0",
  );
  const { isAuthenticated, userId } = useAuth();
  const { gameSystems, loadingSystems } = useGameSystem();

  const [league, setLeague] = useState<LeagueDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateLeagueDTO>({
    name: "",
    description: "",
    gameSystemId: 0,
    startDate: "",
    endDate: "",
    autoAcceptGames: true,
    autoAcceptTournaments: true,
    paymentRequired: false,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    pointsParticipation: 2,
    pointsPerParticipant: 0,
    pointsFirstPlace: 5,
    pointsSecondPlace: 3,
    pointsThirdPlace: 1,
  });

  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const fetchLeague = async () => {
      try {
        const leagueData = await getLeague(id);
        setLeague(leagueData);

        // Check if user is owner
        if (leagueData.owner?.id !== userId) {
          setError("Tylko właściciel może edytować ligę");
          setLoading(false);
          return;
        }

        // Populate form with existing data
        setFormData({
          name: leagueData.name,
          description: leagueData.description || "",
          gameSystemId: leagueData.gameSystem?.id || 0,
          startDate: leagueData.startDate,
          endDate: leagueData.endDate,
          autoAcceptGames: leagueData.autoAcceptGames,
          autoAcceptTournaments: leagueData.autoAcceptTournaments,
          paymentRequired: leagueData.paymentRequired,
          pointsWin: leagueData.pointsWin,
          pointsDraw: leagueData.pointsDraw,
          pointsLoss: leagueData.pointsLoss,
          pointsParticipation: leagueData.pointsParticipation,
          pointsPerParticipant: leagueData.pointsPerParticipant,
          pointsFirstPlace: leagueData.pointsFirstPlace,
          pointsSecondPlace: leagueData.pointsSecondPlace,
          pointsThirdPlace: leagueData.pointsThirdPlace,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać danych ligi");
        setLoading(false);
      }
    };

    fetchLeague();
  }, [id, isAuthenticated, userId]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">
          Zaloguj się, aby edytować ligę
        </h2>
        <Button asChild>
          <Link href="/login">Zaloguj</Link>
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
        throw new Error("Wybierz system gry");
      }

      await updateLeague(id, formData);
      router.push(`/leagues/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Nie udało się zaktualizować ligi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingSystems) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error && !league) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold text-destructive">{error}</h2>
        <Button onClick={() => router.back()}>Wróć</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Button variant="ghost" className="mb-4" asChild>
        <Link href={`/leagues/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Powrót do Ligi
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edytuj Ligę</CardTitle>
          <CardDescription>
            Zmień ustawienia i konfigurację swojej ligi
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
              <Label htmlFor="name">Nazwa Ligi</Label>
              <Input
                id="name"
                name="name"
                placeholder="np. Mistrzostwa Lata 2024"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameSystemId">System Gry</Label>
              <select
                id="gameSystemId"
                name="gameSystemId"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                value={formData.gameSystemId}
                onChange={handleChange}
              >
                <option value={0}>Wybierz system...</option>
                {gameSystems.map((sys) => (
                  <option key={sys.id} value={sys.id}>
                    {sys.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Rozpoczęcia</Label>
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
                <Label htmlFor="endDate">Data Zakończenia</Label>
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
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Zasady, harmonogram, nagrody..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Punkty w Pojedynczych Meczach</h3>
              <p className="text-sm text-gray-500">
                Punkty przyznawane graczom za wyniki pojedynczych meczów
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsWin">Punkty za Wygraną</Label>
                  <Input
                    type="number"
                    id="pointsWin"
                    name="pointsWin"
                    value={formData.pointsWin}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsDraw">Punkty za Remis</Label>
                  <Input
                    type="number"
                    id="pointsDraw"
                    name="pointsDraw"
                    value={formData.pointsDraw}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsLoss">Punkty za Przegraną</Label>
                  <Input
                    type="number"
                    id="pointsLoss"
                    name="pointsLoss"
                    value={formData.pointsLoss}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Punkty za Turnieje</h3>
              <p className="text-sm text-gray-500">
                Punkty przyznawane uczestnikom po zakończeniu turnieju
              </p>
              <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 mb-4">
                <strong>Formuła:</strong> Punkty = (Uczestnictwo) + (Na
                Uczestnika × Liczba Uczestników) + Bonus za Podium
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsParticipation">
                    Punkty za Uczestnictwo
                  </Label>
                  <Input
                    type="number"
                    id="pointsParticipation"
                    name="pointsParticipation"
                    value={formData.pointsParticipation}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500">
                    Bazowe punkty za udział w turnieju
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsPerParticipant">
                    Punkty na Uczestnika (turnieje)
                  </Label>
                  <Input
                    type="number"
                    id="pointsPerParticipant"
                    name="pointsPerParticipant"
                    value={formData.pointsPerParticipant}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500">
                    Mnożone przez liczbę uczestników
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-base">Bonusy za Podium</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsFirstPlace">1. Miejsce</Label>
                    <Input
                      type="number"
                      id="pointsFirstPlace"
                      name="pointsFirstPlace"
                      value={formData.pointsFirstPlace}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsSecondPlace">2. Miejsce</Label>
                    <Input
                      type="number"
                      id="pointsSecondPlace"
                      name="pointsSecondPlace"
                      value={formData.pointsSecondPlace}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsThirdPlace">3. Miejsce</Label>
                    <Input
                      type="number"
                      id="pointsThirdPlace"
                      name="pointsThirdPlace"
                      value={formData.pointsThirdPlace}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Ustawienia</h3>
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
                  Automatycznie zatwierdzaj wyniki meczów
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
                  Automatycznie zatwierdzaj wyniki turniejów
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="paymentRequired"
                  checked={formData.paymentRequired}
                  onChange={(e) =>
                    handleCheckboxChange("paymentRequired", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="paymentRequired">
                  Wymagana płatność za uczestnictwo
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push(`/leagues/${id}`)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Zapisz Zmiany
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
