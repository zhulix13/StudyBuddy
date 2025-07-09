import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/constant/header";
import './index.css';
import Login from "./pages/login";
import Signup from "./pages/signup";
import { AuthProvider } from "./context/Authcontext";
import StudyBuddyApp from "./pages/dashboard/page";
import Home from "./pages/home";




const Groups = () => <div className="p-6 text-xl">👥 Groups</div>;
const Discover = () => <div className="p-6 text-xl">🔎 Discover</div>;

 // replace with user from auth state later

const App = () => {
  return (
    <AuthProvider>
      <Router>
      <Header  />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<StudyBuddyApp />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/discover" element={<Discover />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
