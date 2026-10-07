import {
  Pill,
  Package,
  AlertTriangle,
  Clock,
  IndianRupee,
  TrendingUp
} from "lucide-react";

import StatCard from "../components/StatCard";

function Dashboard() {

  return (
    <div className="dashboard">

      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h2>Good morning, Admin 👋</h2>
          <p>
            Here's what's happening in your pharmacy today.
          </p>
        </div>

        <div className="date-display">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </div>
      </div>


      {/* Statistics */}
      <div className="stats-grid">

        <StatCard
          title="Total Medicines"
          value="0"
          icon={<Pill size={22} />}
          description="Registered medicines"
          type="blue"
        />

        <StatCard
          title="Available Stock"
          value="0"
          icon={<Package size={22} />}
          description="Total units in stock"
          type="green"
        />

        <StatCard
          title="Low Stock"
          value="0"
          icon={<AlertTriangle size={22} />}
          description="Need replenishment"
          type="orange"
        />

        <StatCard
          title="Expiring Soon"
          value="0"
          icon={<Clock size={22} />}
          description="Within expiry period"
          type="purple"
        />

      </div>


      {/* Second Row */}
      <div className="dashboard-grid">

        {/* Sales */}
        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Today's Sales</h3>
              <p>Sales performance for today</p>
            </div>

            <IndianRupee size={22} />

          </div>

          <div className="sales-value">
            ₹0
          </div>

          <div className="sales-growth">
            <TrendingUp size={16} />
            <span>Sales will appear here</span>
          </div>

        </div>


        {/* Alerts */}
        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Inventory Alerts</h3>
              <p>Items requiring attention</p>
            </div>

            <AlertTriangle size={22} />

          </div>

          <div className="alert-list">

            <div className="empty-state">
              <Package size={30} />
              <p>No inventory alerts</p>
              <span>
                Everything looks good right now.
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* Bottom Section */}
      <div className="dashboard-card recent-card">

        <div className="card-header">

          <div>
            <h3>Recent Activity</h3>
            <p>Latest pharmacy activity</p>
          </div>

        </div>

        <div className="empty-state">

          <Clock size={30} />

          <p>No recent activity</p>

          <span>
            Medicine and sales activity will appear here.
          </span>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;