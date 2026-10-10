
import { useEffect, useState } from "react";
import {
  Search, Bell, UserCircle, Pill, Truck, X, LogOut
} from "lucide-react";
import API from "../services/api";

function Header({ activePage, onNavigate, onLogout, username }) {
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [medicineResponse, supplierResponse] = await Promise.all([
          API.get("/medicines"),
          API.get("/suppliers")
        ]);

        setMedicines(medicineResponse.data);
        setSuppliers(supplierResponse.data);
      } catch (error) {
        console.error("Error loading global search data:", error);
      }
    };

    loadData();
  }, []);

  const query = search.trim().toLowerCase();

  const matchedMedicines = query
    ? medicines.filter((medicine) =>
        [
          medicine.medicineName,
          medicine.genericName,
          medicine.manufacturer,
          medicine.category
        ].some((value) => value?.toLowerCase().includes(query))
      )
    : [];

  const matchedSuppliers = query
    ? suppliers.filter((supplier) =>
        [
          supplier.supplierName,
          supplier.phone,
          supplier.email,
          supplier.address
        ].some((value) => value?.toLowerCase().includes(query))
      )
    : [];

  const closeSearch = () => {
    setSearch("");
    setShowResults(false);
  };

  const navigateTo = (page) => {
    onNavigate?.(page);
    closeSearch();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout?.();
    }
  };

  return (
    <header className="header">
      <div className="page-title">
        <h1>{activePage}</h1>
        <p>Manage your pharmacy efficiently</p>
      </div>

      <div className="header-actions">
        <div className="global-search-container">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search medicines & suppliers..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />

            {search && (
              <button
                type="button"
                className="search-clear-button"
                onClick={closeSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showResults && query && (
            <div className="global-search-results">
              {matchedMedicines.length === 0 &&
              matchedSuppliers.length === 0 ? (
                <p className="global-search-empty">
                  No matching results found.
                </p>
              ) : (
                <>
                  {matchedMedicines.length > 0 && (
                    <div className="global-search-section">
                      <h4><Pill size={15} /> Medicines</h4>
                      {matchedMedicines.slice(0, 5).map((medicine) => (
                        <button
                          type="button"
                          className="global-search-result"
                          key={medicine.id}
                          onClick={() => navigateTo("Medicines")}
                        >
                          <strong>{medicine.medicineName}</strong>
                          <span>
                            {medicine.genericName || "Generic name unavailable"}
                            {medicine.manufacturer
                              ? ` · ${medicine.manufacturer}`
                              : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedSuppliers.length > 0 && (
                    <div className="global-search-section">
                      <h4><Truck size={15} /> Suppliers</h4>
                      {matchedSuppliers.slice(0, 5).map((supplier) => (
                        <button
                          type="button"
                          className="global-search-result"
                          key={supplier.id}
                          onClick={() => navigateTo("Suppliers")}
                        >
                          <strong>{supplier.supplierName}</strong>
                          <span>
                            {supplier.phone || supplier.email || supplier.address}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={21} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">
          <UserCircle size={36} />
          <div>
            <strong>{username || "User"}</strong>
            <span>Pharmacy Staff</span>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
