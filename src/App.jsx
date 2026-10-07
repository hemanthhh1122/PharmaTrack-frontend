import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Sales from "./pages/Sales";
import Alerts from "./pages/Alerts";
import Reorder from "./pages/Reorder";

function App() {

  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {

    switch (activePage) {

      case "Dashboard":
        return <Dashboard />;

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
        return <Dashboard />;
    }
  };

  return (
    <div className="app">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-content">

        <Header activePage={activePage} />

        <main className="page-content">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

export default App;