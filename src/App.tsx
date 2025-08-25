import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/constant/header";
import "./index.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { AuthProvider } from "./context/Authcontext";
import StudyBuddyApp from "./pages/dashboard/page";
import Home from "./pages/home";
import Groups from "./pages/groups";
import { Toaster } from "sonner";
import GroupHome from "./groups_beta/routes/GroupHome";
import GroupPage from "./groups_beta/routes/GroupPage";
import GroupLayout from "./groups_beta/routes/GroupLayout";
import ProtectedRoutes from "./pages/protected/ProtectedRoutes";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Header />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<StudyBuddyApp />} />
            <Route path="/discover" element={<Groups />} />
            <Route path="/groups" element={<GroupLayout />}>
              <Route index element={<GroupHome />} />
              <Route path=":groupId" element={<GroupPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
