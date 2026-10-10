import { useEffect, useState } from "react";
import {
  Pill,
  Package,
  AlertTriangle,
  Clock,
  IndianRupee,
  TrendingUp,
  ShoppingCart
} from "lucide-react";

import StatCard from "../components/StatCard";
import API from "../services/api";

function Dashboard({ username = "User" }) {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);

  const loadDashboardData = async () => {
    try {
      const [medicineRes, batchRes, salesRes] =
        await Promise.all([
          API.get("/medicines"),
          API.get("/batches"),
          API.get("/sales")
        ]);

      setMedicines(medicineRes.data);
      setBatches(batchRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalMedicines = medicines.length;

  const availableStock = batches.reduce(
    (sum, batch) => sum + (batch.quantity || 0),
    0
  );

  const lowStock = batches.filter((batch) => {
    const medicine = medicines.find(
      (item) => Number(item.id) === Number(batch.medicineId)
    );

    return (
      medicine &&
      batch.quantity > 0 &&
      batch.quantity <= (medicine.reorderLevel || 0)
    );
  }).length;

  const expiringSoon = batches.filter((batch) => {
    if (!batch.expiryDate || batch.quantity <= 0) return false;

    const expiry = new Date(batch.expiryDate);
    const today = new Date();

    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const days = (expiry - today) / 86400000;
    return days >= 0 && days <= 30;
  }).length;

  const today = new Date();

  const todaysSales = sales.filter((sale) => {
    if (!sale.saleDate) return false;

    const date = new Date(sale.saleDate);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  const todaysSalesAmount = todaysSales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  );

  // Rank medicines by total units sold
  const frequentlySold = Object.values(
    sales.reduce((result, sale) => {
      const id = Number(sale.medicineId);

      if (!result[id]) {
        const medicine = medicines.find(
          (item) => Number(item.id) === id
        );

        result[id] = {
          medicineId: id,
          medicineName: medicine
            ? medicine.medicineName
            : "Unknown Medicine",
          unitsSold: 0,
          salesCount: 0
        };
      }

      result[id].unitsSold += Number(sale.quantity || 0);
      result[id].salesCount += 1;

      return result;
    }, {})
  )
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const recentSales = [...sales]
    .sort(
      (a, b) =>
        new Date(b.saleDate || 0) -
        new Date(a.saleDate || 0)
    )
    .slice(0, 5);

  const getMedicineName = (id) => {
    const medicine = medicines.find(
      (item) => Number(item.id) === Number(id)
    );

    return medicine?.medicineName || "Unknown Medicine";
  };

  const getBatchNumber = (id) => {
    const batch = batches.find(
      (item) => Number(item.id) === Number(id)
    );

    return batch?.batchNumber || `Batch ${id}`;
  };

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div>
          <h2>Good morning, {username} 👋</h2>
          <p>Here's what's happening in your pharmacy today.</p>
        </div>

        <div className="date-display">
          {today.toLocaleDateString("en-IN", {
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
          value={totalMedicines}
          icon={<Pill size={22} />}
          description="Registered medicines"
          type="blue"
        />

        <StatCard
          title="Available Stock"
          value={availableStock}
          icon={<Package size={22} />}
          description="Total units in stock"
          type="green"
        />

        <StatCard
          title="Low Stock"
          value={lowStock}
          icon={<AlertTriangle size={22} />}
          description="Need replenishment"
          type="orange"
        />

        <StatCard
          title="Expiring Soon"
          value={expiringSoon}
          icon={<Clock size={22} />}
          description="Within 30 days"
          type="purple"
        />
      </div>

      {/* Today's Sales and Alerts */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Today's Sales</h3>
              <p>Sales performance for today</p>
            </div>
            <IndianRupee size={22} />
          </div>

          <div className="sales-value">
            ₹{todaysSalesAmount.toFixed(2)}
          </div>

          <div className="sales-growth">
            <TrendingUp size={16} />
            <span>
              {todaysSales.length} sale(s) completed today
            </span>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Inventory Alerts</h3>
              <p>Items requiring attention</p>
            </div>
            <AlertTriangle size={22} />
          </div>

          <div className="empty-state">
            <Package size={30} />
            <p>
              {lowStock + expiringSoon > 0
                ? "Inventory needs attention"
                : "No inventory alerts"}
            </p>
            <span>
              {lowStock} low-stock batch(es) and{" "}
              {expiringSoon} expiring batch(es)
            </span>
          </div>
        </div>
      </div>

      {/* Frequently Sold Medicines */}
      <div className="table-card">
        <div className="card-header">
          <div>
            <h3>Frequently Sold Medicines</h3>
            <p>Top 5 medicines ranked by units sold</p>
          </div>
          <ShoppingCart size={22} />
        </div>

        {frequentlySold.length === 0 ? (
          <div className="empty-state">
            <Pill size={38} />
            <h3>No sales data yet</h3>
            <p>
              Frequently sold medicines will appear after sales are recorded.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Medicine</th>
                  <th>Units Sold</th>
                  <th>Number of Sales</th>
                </tr>
              </thead>

              <tbody>
                {frequentlySold.map((item, index) => (
                  <tr key={item.medicineId}>
                    <td><strong>#{index + 1}</strong></td>
                    <td><strong>{item.medicineName}</strong></td>
                    <td>{item.unitsSold}</td>
                    <td>{item.salesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card recent-card">
        <div className="card-header">
          <div>
            <h3>Recent Activity</h3>
            <p>Latest pharmacy sales activity</p>
          </div>
          <Clock size={22} />
        </div>

        {recentSales.length === 0 ? (
          <div className="empty-state">
            <Clock size={30} />
            <p>No recent activity</p>
            <span>Completed sales will appear here.</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                </tr>
              </thead>

              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>
                        {getMedicineName(sale.medicineId)}
                      </strong>
                    </td>
                    <td>{getBatchNumber(sale.batchId)}</td>
                    <td>{sale.quantity}</td>
                    <td>
                      ₹{Number(sale.totalAmount || 0).toFixed(2)}
                    </td>
                    <td>
                      {sale.saleDate
                        ? new Date(sale.saleDate).toLocaleString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;