import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/constant/header";
import "./index.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { AuthProvider } from "./context/Authcontext";
import StudyBuddyApp from "./pages/dashboard/page";
import Home from "./pages/home";
// import Groups from "./pages/groups";
import { Toaster } from "sonner";
import GroupHome from "./groups_beta/routes/GroupHome";
import GroupPage from "./groups_beta/routes/GroupPage";
import GroupLayout from "./groups_beta/routes/GroupLayout";

const Discover = () => <div className="p-6 text-xl">🔎 Discover</div>;



const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<StudyBuddyApp />} />
          {/* <Route path="/groups" element={<Groups />} /> */}
          <Route path="/discover" element={<Discover />} />
          <Route path="/groups/" element={<GroupLayout />}>
            <Route index element={<GroupHome />} />
            <Route path=":groupId" element={<GroupPage />} />
            {/* Add more nested routes as needed */}
          {/* Add more routes as needed */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
