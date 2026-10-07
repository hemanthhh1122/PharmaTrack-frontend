import { useEffect, useState } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  Package,
  CheckCircle
} from "lucide-react";
import API from "../services/api";

function Alerts() {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);

  // Load medicines
  const loadMedicines = async () => {
    try {
      const response = await API.get("/medicines");
      setMedicines(response.data);
    } catch (error) {
      console.error("Error loading medicines:", error);
    }
  };

  // Load batches
  const loadBatches = async () => {
    try {
      const response = await API.get("/batches");
      setBatches(response.data);
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  };

  useEffect(() => {
    loadMedicines();
    loadBatches();
  }, []);

  // Get medicine name
  const getMedicineName = (medicineId) => {
    const medicine = medicines.find(
      (medicine) =>
        Number(medicine.id) === Number(medicineId)
    );

    return medicine
      ? medicine.medicineName
      : "Unknown Medicine";
  };

  // Low stock medicines
  const lowStockItems = batches.filter((batch) => {
    const medicine = medicines.find(
      (medicine) =>
        Number(medicine.id) === Number(batch.medicineId)
    );

    if (!medicine) return false;

    return (
      batch.quantity <= medicine.reorderLevel &&
      batch.quantity > 0
    );
  });

  // Expired batches
  const expiredItems = batches.filter((batch) => {
    if (!batch.expiryDate) return false;

    const expiryDate = new Date(batch.expiryDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    return expiryDate < today;
  });

  // Expiring within 30 days
  const expiringItems = batches.filter((batch) => {
    if (!batch.expiryDate) return false;

    const expiryDate = new Date(batch.expiryDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const difference =
      (expiryDate - today) /
      (1000 * 60 * 60 * 24);

    return difference >= 0 && difference <= 30;
  });

  return (
    <div className="alerts-page">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h2>Alerts</h2>
          <p>
            Monitor medicines that need attention
          </p>
        </div>

        <div className="alert-header-icon">
          <Bell size={24} />
        </div>

      </div>


      {/* Alert Summary */}

      <div className="alert-summary">

        <div className="alert-summary-card low-stock">

          <AlertTriangle size={24} />

          <div>
            <span>Low Stock</span>
            <strong>
              {lowStockItems.length}
            </strong>
          </div>

        </div>


        <div className="alert-summary-card expiring">

          <Clock size={24} />

          <div>
            <span>Expiring Soon</span>
            <strong>
              {expiringItems.length}
            </strong>
          </div>

        </div>


        <div className="alert-summary-card expired">

          <Package size={24} />

          <div>
            <span>Expired</span>
            <strong>
              {expiredItems.length}
            </strong>
          </div>

        </div>

      </div>


      {/* Low Stock Section */}

      <div className="table-card alert-card">

        <div className="card-header">

          <div>

            <h3>Low Stock Medicines</h3>

            <p>
              Medicines that have reached their
              reorder level
            </p>

          </div>

          <AlertTriangle size={22} />

        </div>


        {lowStockItems.length === 0 ? (

          <div className="empty-state">

            <CheckCircle size={42} />

            <h3>
              No low-stock medicines
            </h3>

            <p>
              All medicines currently have
              sufficient stock.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                </tr>

              </thead>

              <tbody>

                {lowStockItems.map((batch) => {

                  const medicine =
                    medicines.find(
                      (medicine) =>
                        Number(medicine.id) ===
                        Number(batch.medicineId)
                    );

                  return (

                    <tr key={batch.id}>

                      <td>
                        <strong>
                          {getMedicineName(
                            batch.medicineId
                          )}
                        </strong>
                      </td>

                      <td>
                        {batch.batchNumber}
                      </td>

                      <td>
                        {batch.quantity}
                      </td>

                      <td>
                        {medicine
                          ? medicine.reorderLevel
                          : "-"}
                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* Expiry Alerts */}

      <div className="table-card alert-card">

        <div className="card-header">

          <div>

            <h3>Expiry Alerts</h3>

            <p>
              Medicines approaching or past
              their expiry date
            </p>

          </div>

          <Clock size={22} />

        </div>


        {expiringItems.length === 0 &&
        expiredItems.length === 0 ? (

          <div className="empty-state">

            <CheckCircle size={42} />

            <h3>
              No expiry alerts
            </h3>

            <p>
              No medicines require
              expiry-related attention.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {expiredItems.map((batch) => (

                  <tr key={`expired-${batch.id}`}>

                    <td>
                      <strong>
                        {getMedicineName(
                          batch.medicineId
                        )}
                      </strong>
                    </td>

                    <td>
                      {batch.batchNumber}
                    </td>

                    <td>
                      {batch.expiryDate}
                    </td>

                    <td>
                      <strong>
                        Expired
                      </strong>
                    </td>

                  </tr>

                ))}


                {expiringItems.map((batch) => (

                  <tr key={`expiring-${batch.id}`}>

                    <td>
                      <strong>
                        {getMedicineName(
                          batch.medicineId
                        )}
                      </strong>
                    </td>

                    <td>
                      {batch.batchNumber}
                    </td>

                    <td>
                      {batch.expiryDate}
                    </td>

                    <td>
                      <strong>
                        Expiring Soon
                      </strong>
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

export default Alerts;