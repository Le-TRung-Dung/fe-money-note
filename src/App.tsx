import React from "react";
import { Routes, Route } from "react-router-dom";
// import Home from './pages/LoginScreen'
import About from "./pages/RegisterScreen";
import LandingPage from "./pages/LandingScreen";
import LoginPage from "./pages/LoginScreen";

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/about" element={<About />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/Login" element={<LoginPage />} />

        {/* Xử lý trang 404 */}
        <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
      </Routes>
    </div>
  );
};

export default App;
