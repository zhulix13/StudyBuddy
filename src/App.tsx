import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/constant/header";
import './index.css';
import Login from "./pages/login";
import Signup from "./pages/signup";
import { AuthProvider } from "./context/Authcontext";

// Placeholder pages
const Home = () => <div className="p-6 text-xl">🏠 Hero / Home Page</div>;

const Dashboard = () => <div className="p-6 text-xl">📊 Dashboard</div>;
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/discover" element={<Discover />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
