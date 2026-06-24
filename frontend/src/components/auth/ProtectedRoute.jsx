import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
	const { user, loading } = useAuth();

	if (loading) {
		return <h2>Loading...</h2>;
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" />;
	}

	return children;


}