import {
  LayoutDashboard,
  Pill,
  Package,
  Truck,
  ShoppingCart,
  Bell,
  RefreshCcw
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Medicines",
      icon: Pill
    },
    {
      name: "Inventory",
      icon: Package
    },
    {
      name: "Suppliers",
      icon: Truck
    },
    {
      name: "Sales & Billing",
      icon: ShoppingCart
    },
    {
      name: "Alerts",
      icon: Bell
    },
    {
      name: "Reorder",
      icon: RefreshCcw
    }
  ];

  return (
    <aside className="sidebar">

      <div className="logo-section">

        <div className="logo-icon">
          <Pill size={24} />
        </div>

        <div>
          <h2>PharmaTrack</h2>
          <span>Pharmacy Management</span>
        </div>

      </div>

      <nav>

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`menu-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >

              <Icon size={20} />

              <span>{item.name}</span>

            </button>
          );

        })}

      </nav>

      <div className="sidebar-footer">

        <div className="user-avatar">
          A
        </div>

        <div>
          <strong>Admin</strong>
          <small>Pharmacy Manager</small>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;