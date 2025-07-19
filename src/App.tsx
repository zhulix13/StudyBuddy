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
import MetaPage from "./groups_beta";

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
          <Route path="/groups" element={<Groups />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/meta" element={<MetaPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
