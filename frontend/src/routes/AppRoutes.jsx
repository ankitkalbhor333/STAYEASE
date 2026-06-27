import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
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
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import CreateRoom from "../pages/owner/CreateRoom";
import RoomDraft from "../pages/owner/RoomDraft";
import MyRooms from "../pages/owner/MyRooms";
import BookingCheckout from "../pages/booking/BookingCheckout";
import MyBookings from "../pages/booking/MyBookings";

import BookingDetails from "../pages/booking/BookingDetails";

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
        <Route
          path="/rooms/:id/book"
          element={
            <ProtectedRoute>
              <BookingCheckout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        <Route path="/host" element={<ProtectedRoute><Navigate to="/owner/create" replace /></ProtectedRoute>} />

        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/create"
          element={
            <ProtectedRoute>
              <CreateRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/room/:id"
          element={
            <ProtectedRoute>
              <RoomDraft />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/rooms"
          element={
            <ProtectedRoute>
              <MyRooms />
            </ProtectedRoute>
          }
        />
</Routes>
    </BrowserRouter>
  );
}
