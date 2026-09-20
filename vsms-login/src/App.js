import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerDashboard from "./pages/CustomerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PeriodicService from "./pages/PeriodicService";
import OilChangeService from "./pages/OilChangeService";
import ACRepairService from "./pages/ACRepairService";
import BrakeRepairService from "./pages/BrakeRepairService";
import BatteryService from "./pages/BatteryService";
import CarWashService from "./pages/CarWashService";
import WheelAlignmentService from "./pages/WheelAlignmentService";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/periodic-service" element={<PeriodicService />} />
        <Route path="/oil-change-service" element={<OilChangeService />} />
        <Route path="/ac-repair-service" element={<ACRepairService />} />
        <Route path="/brake-repair-service" element={<BrakeRepairService />} />
        <Route path="/battery-service" element={<BatteryService />} />
        <Route path="/car-wash-service" element={<CarWashService />} />
        <Route path="/services/wheel-alignment" element={<WheelAlignmentService />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Redirect any unknown routes and ensure default entry is Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;