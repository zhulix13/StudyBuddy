import React from "react";
import { useAuth } from "@/context/Authcontext";
import { useNavigate, Outlet } from "react-router-dom";
import AuthLoader from "@/loaders/AuthLoader";



const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = React.useState(false);
  const userArr = []

  React.useEffect(() => {
    if (!loading && !user) {
      setRedirecting(true);

      // wait 1.5s before navigating so user sees the message
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <AuthLoader text="Checking your session..." />;
  }

  if (redirecting) {
    return <AuthLoader text="You need to sign in to access this page. Redirecting..." />;
  }

  if (!user) {
    return null; // prevent flashing protected content
  }

  return <Outlet />; // render the protected page
};

export default ProtectedRoutes;
