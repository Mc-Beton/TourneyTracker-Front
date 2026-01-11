"use client";

import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await testFn();
      setResults((prev) => ({
        ...prev,
        [name]: { success: true, data: result },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: "GET /api/tournaments",
      fn: () =>
        fetch("http://localhost:8080/api/tournaments").then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          return r.json();
        }),
    },
    {
      name: "GET /api/tournaments/1",
      fn: () =>
        fetch("http://localhost:8080/api/tournaments/1").then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
          return r.json();
        }),
    },
    {
      name: "POST /api/users/auth/register",
      fn: () =>
        fetch("http://localhost:8081/api/users/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: `test${Date.now()}@test.com`,
            password: "test123456",
          }),
        }).then(async (r) => {
          const text = await r.text();
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${text}`);
          return text;
        }),
    },
    {
      name: "POST /api/users/auth/login",
      fn: () =>
        fetch("http://localhost:8081/api/users/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@test.com",
            password: "test123",
          }),
        }).then(async (r) => {
          const text = await r.text();
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${text}`);
          return text;
        }),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">API Endpoint Tests</h1>

        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.name}>
              <CardHeader>
                <CardTitle className="text-lg font-mono">{test.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => testEndpoint(test.name, test.fn)}
                  disabled={loading[test.name]}
                >
                  {loading[test.name] ? "Testing..." : "Test"}
                </Button>

                {results[test.name] && (
                  <div
                    className={`p-4 rounded-lg ${
                      results[test.name].success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {results[test.name].success ? (
                      <div>
                        <div className="text-green-800 font-semibold mb-2">
                          ✓ Success
                        </div>
                        <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
                          {JSON.stringify(results[test.name].data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <div className="text-red-800 font-semibold mb-2">
                          ✗ Error
                        </div>
                        <div className="text-red-700 text-sm">
                          {results[test.name].error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Backend URLs:</strong>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Tournaments API: http://localhost:8080</li>
                  <li>Auth API: http://localhost:8081</li>
                </ul>
              </div>
              <div className="mt-4">
                <strong>Expected Endpoints:</strong>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li>GET /api/tournaments - List all tournaments</li>
                  <li>GET /api/tournaments/:id - Get tournament details</li>
                  <li>POST /api/tournaments - Create tournament</li>
                  <li>POST /api/users/auth/register - Register user</li>
                  <li>POST /api/users/auth/login - Login user</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
