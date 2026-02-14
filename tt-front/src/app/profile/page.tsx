"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfile, updateProfile } from "@/lib/api/users";
import type { UserProfile, UpdateProfileDTO } from "@/lib/types/auth";

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateProfileDTO>({
    name: "",
    email: "",
    realName: "",
    surname: "",
    beginner: false,
    team: "",
    city: "",
    discordNick: "",
  });

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [auth.isAuthenticated, router]);

  const loadProfile = async () => {
    if (!auth.token) return;

    try {
      setLoading(true);
      const data = await getProfile(auth.token);
      setProfile(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        realName: data.realName || "",
        surname: data.surname || "",
        beginner: data.beginner || false,
        team: data.team || "",
        city: data.city || "",
        discordNick: data.discordNick || "",
      });
    } catch (err) {
      setError("Nie udało się pobrać profilu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token) return;

    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await updateProfile(formData, auth.token);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError("Nie udało się zaktualizować profilu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        realName: profile.realName || "",
        surname: profile.surname || "",
        beginner: profile.beginner || false,
        team: profile.team || "",
        city: profile.city || "",
        discordNick: profile.discordNick || "",
      });
    }
    setIsEditing(false);
  };

  if (!auth.isAuthenticated || loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-8 text-center">Ładowanie...</CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error && !profile) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-8 text-center text-red-600">
              {error}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profil użytkownika</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nick</p>
                  <p className="text-lg font-medium">
                    {profile?.name || "Nie podano"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium">
                    {profile?.email || "Nie podano"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Imię</p>
                  <p className="text-lg font-medium">
                    {profile?.realName || "Nie podano"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Nazwisko</p>
                  <p className="text-lg font-medium">
                    {profile?.surname || "Nie podano"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Poziom zaawansowania
                  </p>
                  <p className="text-lg font-medium">
                    {profile?.beginner ? "Początkujący" : "Doświadczony"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Drużyna/Grupa</p>
                  <p className="text-lg font-medium">
                    {profile?.team || "Nie podano"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Miejscowość</p>
                  <p className="text-lg font-medium">
                    {profile?.city || "Nie podano"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Nick na Discord
                  </p>
                  <p className="text-lg font-medium">
                    {profile?.discordNick || "Nie podano"}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    Edytuj profil
                  </Button>
                  <Button onClick={() => router.push("/tournaments/my")}>
                    Moje Turnieje
                  </Button>
                  <Button onClick={() => auth.logout()} variant="destructive">
                    Wyloguj się
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nick *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Imię</label>
                  <input
                    type="text"
                    value={formData.realName}
                    onChange={(e) =>
                      setFormData({ ...formData, realName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="beginner"
                    checked={formData.beginner}
                    onChange={(e) =>
                      setFormData({ ...formData, beginner: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="beginner" className="text-sm font-medium">
                    Jestem początkujący
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Drużyna/Grupa
                  </label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) =>
                      setFormData({ ...formData, team: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="np. Klub Warhammer Warszawa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Miejscowość
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="np. Warszawa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nick na Discord
                  </label>
                  <input
                    type="text"
                    value={formData.discordNick}
                    onChange={(e) =>
                      setFormData({ ...formData, discordNick: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="np. user#1234"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Zapisywanie..." : "Zapisz"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    disabled={loading}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
