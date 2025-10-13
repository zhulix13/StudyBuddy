// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/constant/header";
import "./index.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { AuthProvider } from "./context/Authcontext";
import Home from "./pages/home";
import Groups from "./pages/groups";
import { Toaster } from "sonner";
import GroupHome from "./groups_beta/routes/GroupHome";
import GroupPage from "./groups_beta/routes/GroupPage";
import GroupLayout from "./groups_beta/routes/GroupLayout";
import ProtectedRoutes from "./pages/protected/ProtectedRoutes";
import InvitesPage from "./pages/invites";
import ForgotPassword from "./pages/forgot-password";
import { ThemeProvider } from "@/context/ThemeContext";

// New imports
import DashboardLayout from "./pages/dashboard/layout";
// import DashboardHome from "./pages/dashboard/components/Overview/dashboard";
// import { Profile } from "./pages/dashboard/components/Profile/profile";
// import SettingsPage from "./pages/dashboard/components/Settings/settings";
// import NotificationsPage from "./pages/dashboard/components/Notifications/notifications";

import { Notifications } from "./pages/dashboard";
import {Profile }from "./pages/dashboard";
import {DashboardOverview} from "./pages/dashboard";
import {Settings} from "./pages/dashboard";
import {MyInvites }from "./pages/dashboard";

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Toaster />
          <Header />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/invites/:token" element={<InvitesPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoutes />}>
              {/* Dashboard routes with nested layout */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="profile" element={<Profile />} />
                
                <Route path="invites" element={<MyInvites />} />

                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route path="/discover" element={<Groups />} />
              <Route path="/groups" element={<GroupLayout />}>
                <Route index element={<GroupHome />} />
                <Route path=":groupId" element={<GroupPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;