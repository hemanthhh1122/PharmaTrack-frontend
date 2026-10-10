
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Sales from "./pages/Sales";
import Alerts from "./pages/Alerts";
import Reorder from "./pages/Reorder";
import Login from "./pages/Login";
import API from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    API.get("/auth/me")
      .then((response) => {
        setUsername(response.data.username);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUsername("");
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const handleLogin = async () => {
    try {
      const response = await API.get("/auth/me");
      setUsername(response.data.username);
      setIsLoggedIn(true);
      setActivePage("Dashboard");
    } catch {
      setIsLoggedIn(false);
      setUsername("");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setIsLoggedIn(false);
      setUsername("");
      setActivePage("Dashboard");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard username={username} />;
      case "Medicines":
        return <Medicines />;
      case "Inventory":
        return <Inventory />;
      case "Suppliers":
        return <Suppliers />;
      case "Sales & Billing":
        return <Sales />;
      case "Alerts":
        return <Alerts />;
      case "Reorder":
        return <Reorder />;
      default:
        return <Dashboard username={username} />;
    }
  };

  if (checkingSession) {
    return <div className="login-page">Checking session...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-content">
        <Header
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={handleLogout}
          username={username}
        />

        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
