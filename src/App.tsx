import React from "react";
import { Routes, Route } from "react-router-dom";

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
import SplashScreen from "./pages/SplashScreen";
import ScrollToTop from "./components/ScrollToTop";
import TransactionSearchScreen from "./pages/TransactionSearchScreen";
import TransactionListScreen from "./pages/TransactionListScreen";
import SavingTransactionListScreen from "./pages/SavingTransactionListScreen";
import SavingTransactionSearchScreen from "./pages/SavingTransactionSearchScreen";

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SplashScreen />} />

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
        <Route
          path="/transactions/search"
          element={<TransactionSearchScreen />}
        />
        <Route
          path="/savings/transactions/search"
          element={<SavingTransactionSearchScreen />}
        />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/transactions" element={<TransactionListScreen />} />
          <Route
            path="/savings/transactions"
            element={<SavingTransactionListScreen />}
          />

          <Route path="/savings" element={<SavingScreen />} />
          <Route path="/savings/create" element={<SavingCreateScreen />} />
          <Route path="/savings/:id/edit" element={<SavingCreateScreen />} />

          <Route path="/account" element={<AccountScreen />} />
        </Route>

        <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
      </Routes>
    </>
  );
};

export default App;
