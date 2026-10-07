import { Search, Bell, UserCircle } from "lucide-react";

function Header({ activePage }) {
  return (
    <header className="header">

      <div className="page-title">
        <h1>{activePage}</h1>
        <p>Manage your pharmacy efficiently</p>
      </div>

      <div className="header-actions">

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search medicines..."
          />
        </div>

        <button className="notification-button">
          <Bell size={21} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">

          <UserCircle size={36} />

          <div>
            <strong>Admin</strong>
            <span>Pharmacy Manager</span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Header;