"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-bold mb-2">Brak połączenia</h1>
        <p className="text-gray-600 mb-6">
          Wygląda na to, że jesteś offline. Sprawdź swoje połączenie internetowe
          i spróbuj ponownie.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}
