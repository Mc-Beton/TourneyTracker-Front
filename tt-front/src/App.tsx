import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { TournamentListPage } from "./pages/TournamentListPage";
import { TournamentDetailsPage } from "./pages/TournamentDetailsPage";
import TournamentCreatePage from "./pages/CreateTournamentPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
//import LoginPage from "./pages/LoginPage"; // jeśli masz

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Navigate to="/tournaments" replace />} />

        <Route path="/tournaments" element={<TournamentListPage />} />
        <Route path="/tournaments/new" element={<TournamentCreatePage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />

        {/* AUTH */}
        <Route path="/register" element={<RegisterPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
