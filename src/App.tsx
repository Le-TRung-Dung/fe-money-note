import React from "react";
import { Routes, Route } from "react-router-dom";
// import Home from './pages/LoginScreen'
import About from "./pages/RegisterScreen";
import LandingPage from "./pages/LandingScreen";
import LoginPage from "./pages/LoginScreen";
import RegisterPage from "./pages/RegisterScreen";
import TransactionCreateScreen from "./pages/TransactionCreateScreen";
import DashboardScreen from "./pages/DashboardScreen";

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/about" element={<About />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="transactions/create" element={<TransactionCreateScreen />} />
        <Route path="transactions/:id/edit" element={<TransactionCreateScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />

        {/* Xử lý trang 404 */}
        <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
      </Routes>
    </div>
  );
};

export default App;
