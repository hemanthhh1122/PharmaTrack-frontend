import { useEffect, useState } from "react";
import {
  RefreshCcw,
  Package,
  TrendingUp,
  ShoppingCart
} from "lucide-react";
import API from "../services/api";

function Reorder() {
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

  // Load inventory batches
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

  /*
    Calculate total stock for each medicine
  */

  const reorderItems = medicines
    .map((medicine) => {

      const medicineBatches = batches.filter(
        (batch) =>
          Number(batch.medicineId) ===
          Number(medicine.id)
      );

      const currentStock = medicineBatches.reduce(
        (total, batch) =>
          total + (batch.quantity || 0),
        0
      );

      const reorderLevel =
        medicine.reorderLevel || 0;

      /*
        Suggested quantity:
        Bring stock back to 2 × reorder level
      */

      const suggestedQuantity =
        currentStock <= reorderLevel
          ? Math.max(
              reorderLevel * 2 - currentStock,
              0
            )
          : 0;

      return {
        ...medicine,
        currentStock,
        reorderLevel,
        suggestedQuantity
      };
    })
    .filter(
      (medicine) =>
        medicine.currentStock <=
        medicine.reorderLevel
    );

  // Summary values

  const itemsToReorder =
    reorderItems.length;

  const suggestedUnits =
    reorderItems.reduce(
      (total, item) =>
        total + item.suggestedQuantity,
      0
    );

  return (
    <div className="reorder-page">

      {/* Page Header */}

      <div className="page-header">

        <div>

          <h2>Smart Reorder</h2>

          <p>
            Recommended medicine replenishments
          </p>

        </div>

        <div className="reorder-header-icon">

          <RefreshCcw size={24} />

        </div>

      </div>


      {/* Summary Cards */}

      <div className="reorder-summary">

        <div className="reorder-summary-card">

          <Package size={24} />

          <div>

            <span>
              Items to Reorder
            </span>

            <strong>
              {itemsToReorder}
            </strong>

          </div>

        </div>


        <div className="reorder-summary-card">

          <TrendingUp size={24} />

          <div>

            <span>
              Low Stock Items
            </span>

            <strong>
              {itemsToReorder}
            </strong>

          </div>

        </div>


        <div className="reorder-summary-card">

          <ShoppingCart size={24} />

          <div>

            <span>
              Suggested Units
            </span>

            <strong>
              {suggestedUnits}
            </strong>

          </div>

        </div>

      </div>


      {/* Reorder Recommendations */}

      <div className="table-card">

        <div className="card-header">

          <div>

            <h3>
              Reorder Recommendations
            </h3>

            <p>
              Suggested replenishment based on
              current inventory levels
            </p>

          </div>

          <RefreshCcw size={22} />

        </div>


        {reorderItems.length === 0 ? (

          <div className="empty-state">

            <Package size={42} />

            <h3>
              No reorder recommendations
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

                  <th>
                    Medicine
                  </th>

                  <th>
                    Current Stock
                  </th>

                  <th>
                    Reorder Level
                  </th>

                  <th>
                    Suggested Quantity
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {reorderItems.map(
                  (medicine) => (

                    <tr key={medicine.id}>

                      <td>

                        <strong>
                          {medicine.medicineName}
                        </strong>

                      </td>

                      <td>
                        {medicine.currentStock}
                      </td>

                      <td>
                        {medicine.reorderLevel}
                      </td>

                      <td>
                        {medicine.suggestedQuantity}
                      </td>

                      <td>

                        <strong>
                          Reorder Required
                        </strong>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Reorder;