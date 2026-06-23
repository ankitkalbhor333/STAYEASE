import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Home from "../pages/rooms/Home"
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}
