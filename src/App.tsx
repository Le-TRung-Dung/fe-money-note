import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import About from "./pages/RegisterScreen";
import LandingPage from "./pages/LandingScreen";
import LoginPage from "./pages/LoginScreen";
import RegisterPage from "./pages/RegisterScreen";
import TransactionCreateScreen from "./pages/TransactionCreateScreen";
import DashboardScreen from "./pages/DashboardScreen";
import SavingScreen from "./pages/SavingScreen";
import SavingCreateScreen from "./pages/SavingCreateScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import AccountScreen from "./pages/AccountScreen";
import AppShell from "./components/AppShell";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" replace />} />

      <Route path="/about" element={<About />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route
        path="/transactions/create"
        element={<TransactionCreateScreen />}
      />
      <Route
        path="/transactions/:id/edit"
        element={<TransactionCreateScreen />}
      />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardScreen />} />

        <Route path="/savings" element={<SavingScreen />} />
        <Route path="/savings/create" element={<SavingCreateScreen />} />
        <Route path="/savings/:id/edit" element={<SavingCreateScreen />} />

        <Route path="/account" element={<AccountScreen />} />
      </Route>

      <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
    </Routes>
  );
};

export default App;
