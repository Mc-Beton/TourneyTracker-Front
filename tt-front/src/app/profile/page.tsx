"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, router]);

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nazwa użytkownika</p>
              <p className="text-lg font-medium">
                {auth.username || "Brak nazwy"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-medium">
                {auth.isAuthenticated ? "Zalogowany" : "Niezalogowany"}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => router.push("/tournaments/my")}>
                Moje Turnieje
              </Button>
              <Button onClick={() => auth.logout()} variant="destructive">
                Wyloguj się
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
