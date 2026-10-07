import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Trash2, Receipt } from "lucide-react";
import API from "../services/api";

function Sales() {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);

  const [saleData, setSaleData] = useState({
    medicineId: "",
    batchId: "",
    quantity: 1
  });

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

  // Load sales history
  const loadSales = async () => {
    try {
      const response = await API.get("/sales");
      setSales(response.data);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  // Load all data
  useEffect(() => {
    loadMedicines();
    loadBatches();
    loadSales();
  }, []);

  // Get batches belonging to selected medicine
  const medicineBatches = batches.filter(
    (batch) =>
      Number(batch.medicineId) === Number(saleData.medicineId)
  );

  // Medicine selection
  const handleMedicineChange = (event) => {
    setSaleData({
      medicineId: event.target.value,
      batchId: "",
      quantity: 1
    });
  };

  // Add medicine to bill
  const addToCart = () => {
    if (!saleData.medicineId) {
      alert("Please select a medicine.");
      return;
    }

    if (!saleData.batchId) {
      alert("Please select a batch.");
      return;
    }

    const selectedBatch = batches.find(
      (batch) =>
        Number(batch.id) === Number(saleData.batchId)
    );

    const selectedMedicine = medicines.find(
      (medicine) =>
        Number(medicine.id) === Number(saleData.medicineId)
    );

    if (!selectedBatch || !selectedMedicine) {
      alert("Invalid medicine or batch.");
      return;
    }

    const quantity = Number(saleData.quantity);

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (quantity > selectedBatch.quantity) {
      alert(
        `Only ${selectedBatch.quantity} units are available in this batch.`
      );
      return;
    }

    const existingItem = cart.find(
      (item) => item.batchId === selectedBatch.id
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > selectedBatch.quantity) {
        alert(
          `Only ${selectedBatch.quantity} units are available in this batch.`
        );
        return;
      }

      setCart(
        cart.map((item) =>
          item.batchId === selectedBatch.id
            ? {
                ...item,
                quantity: newQuantity
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: Date.now(),
          medicineId: selectedMedicine.id,
          medicineName: selectedMedicine.medicineName,
          batchId: selectedBatch.id,
          batchNumber: selectedBatch.batchNumber,
          quantity: quantity,
          price: Number(selectedBatch.sellingPrice),
          availableStock: selectedBatch.quantity
        }
      ]);
    }

    setSaleData({
      medicineId: "",
      batchId: "",
      quantity: 1
    });
  };

  // Remove item from bill
  const removeFromCart = (id) => {
    setCart(
      cart.filter((item) => item.id !== id)
    );
  };

  // Calculate total
  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  // Complete sale
  const completeSale = async () => {
    if (cart.length === 0) {
      alert("Please add at least one medicine.");
      return;
    }

    try {
      for (const item of cart) {
        await API.post("/sales", {
          medicineId: item.medicineId,
          batchId: item.batchId,
          quantity: item.quantity,
          sellingPrice: item.price,
          totalAmount:
            item.price * item.quantity,
          saleDate: new Date().toISOString()
        });
      }

      alert("Sale completed successfully.");

      setCart([]);

      // Refresh inventory and sales history
      await loadBatches();
      await loadSales();

    } catch (error) {
      console.error(
        "Error completing sale:",
        error
      );

      alert("Unable to complete sale.");
    }
  };

  return (
    <div className="sales-page">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h2>Sales & Billing</h2>
          <p>Create and manage pharmacy sales</p>
        </div>

        <div className="sales-icon">
          <Receipt size={24} />
        </div>

      </div>


      {/* Billing Section */}

      <div className="sales-layout">

        {/* Add Medicine */}

        <div className="form-card">

          <h3>Add Medicine to Sale</h3>

          <div className="form-group">

            <label>Medicine</label>

            <select
              value={saleData.medicineId}
              onChange={handleMedicineChange}
            >

              <option value="">
                Select medicine
              </option>

              {medicines.map((medicine) => (
                <option
                  key={medicine.id}
                  value={medicine.id}
                >
                  {medicine.medicineName}
                </option>
              ))}

            </select>

          </div>


          <div className="form-group">

            <label>Batch</label>

            <select
              value={saleData.batchId}
              onChange={(event) =>
                setSaleData({
                  ...saleData,
                  batchId: event.target.value
                })
              }
              disabled={!saleData.medicineId}
            >

              <option value="">
                Select batch
              </option>

              {medicineBatches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.id}
                >
                  {batch.batchNumber} — Stock:{" "}
                  {batch.quantity}
                </option>
              ))}

            </select>

          </div>


          <div className="form-group">

            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={saleData.quantity}
              onChange={(event) =>
                setSaleData({
                  ...saleData,
                  quantity: event.target.value
                })
              }
            />

          </div>


          <button
            className="primary-button"
            onClick={addToCart}
          >
            <Plus size={18} />
            Add to Bill
          </button>

        </div>


        {/* Current Bill */}

        <div className="table-card bill-card">

          <div className="table-toolbar">

            <div>
              <h3>Current Bill</h3>

              <span>
                {cart.length} item(s)
              </span>
            </div>

            <ShoppingCart size={22} />

          </div>


          {cart.length === 0 ? (

            <div className="empty-state">

              <ShoppingCart size={42} />

              <h3>No items added</h3>

              <p>
                Add medicines to create a bill.
              </p>

            </div>

          ) : (

            <>

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Medicine</th>
                      <th>Batch</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {cart.map((item) => (

                      <tr key={item.id}>

                        <td>
                          <strong>
                            {item.medicineName}
                          </strong>
                        </td>

                        <td>
                          {item.batchNumber}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          ₹{item.price.toFixed(2)}
                        </td>

                        <td>
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </td>

                        <td>

                          <button
                            className="delete-button"
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              <div className="bill-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>

              </div>


              <button
                className="primary-button checkout-button"
                onClick={completeSale}
              >
                Complete Sale
              </button>

            </>

          )}

        </div>

      </div>


      {/* SALES HISTORY */}

      <div className="table-card">

        <div className="table-toolbar">

          <div>

            <h3>Sales History</h3>

            <span>
              {sales.length} transaction(s)
            </span>

          </div>

          <Receipt size={22} />

        </div>


        {sales.length === 0 ? (

          <div className="empty-state">

            <Receipt size={42} />

            <h3>No sales history</h3>

            <p>
              Completed sales will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Medicine ID</th>
                  <th>Batch ID</th>
                  <th>Quantity</th>
                  <th>Selling Price</th>
                  <th>Total Amount</th>
                  <th>Sale Date</th>
                </tr>

              </thead>

              <tbody>

                {sales.map((sale) => (

                  <tr key={sale.id}>

                    <td>
                      {sale.medicineId}
                    </td>

                    <td>
                      {sale.batchId}
                    </td>

                    <td>
                      {sale.quantity}
                    </td>

                    <td>
                      ₹
                      {Number(
                        sale.sellingPrice
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹
                      {Number(
                        sale.totalAmount
                      ).toFixed(2)}
                    </td>

                    <td>
                      {sale.saleDate
                        ? new Date(
                            sale.saleDate
                          ).toLocaleString("en-IN")
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

export default Sales;