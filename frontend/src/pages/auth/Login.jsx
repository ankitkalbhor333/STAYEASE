import { useNavigate } from "react-router-dom";
import AuthModal from "../../components/auth/AuthModal";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900/10 backdrop-blur-sm flex items-center justify-center">
      <AuthModal isOpen={true} onClose={() => navigate("/")} initialMode="login" />
    </div>
  );
}
