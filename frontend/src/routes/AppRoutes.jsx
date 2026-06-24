import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/rooms/Home";
import SearchRooms from "../pages/rooms/SearchRooms";
import RoomDetails from "../pages/rooms/RoomDetails";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/RestPassword";
import VerifyEmail from "../pages/auth/verifyEmail";
import VerifySuccess from "../pages/auth/VerifySuccess";
import VerifyEmailNotice from "../pages/auth/VerifyEmailNotice";
import Profile from "../pages/user/Profile";
import EditProfile from "../pages/user/EditProfile";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/auth/verify-success" element={<VerifySuccess />} />
        <Route path="/rooms/search" element={<SearchRooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
