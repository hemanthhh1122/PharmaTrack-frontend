
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Receipt,
  Package,
  Printer,
  CheckCircle
} from "lucide-react";
import API from "../services/api";

function Sales() {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fefoBatches, setFefoBatches] = useState([]);
  const [cart, setCart] = useState([]);
  const [lastReceipt, setLastReceipt] = useState(null);

  const loadMedicines = async () => {
    try {
      const response = await API.get("/medicines");
      setMedicines(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBatches = async () => {
    try {
      const response = await API.get("/batches");
      setBatches(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSales = async () => {
    try {
      const response = await API.get("/sales");
      setSales(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMedicines();
    loadBatches();
    loadSales();
  }, []);

  const handleMedicineChange = (event) => {
    const medicineId = event.target.value;
    setSelectedMedicine(medicineId);
    setQuantity("");

    const available = batches
      .filter(
        (batch) =>
          Number(batch.medicineId) === Number(medicineId) &&
          batch.quantity > 0 &&
          batch.expiryDate &&
          new Date(batch.expiryDate + "T00:00:00") >=
            new Date(new Date().toDateString())
      )
      .sort(
        (a, b) =>
          new Date(a.expiryDate) - new Date(b.expiryDate)
      );

    setFefoBatches(medicineId ? available : []);

    if (medicineId && available.length === 0) {
      alert("No unexpired stock available for this medicine.");
    }
  };

  const addToCart = () => {
    if (!selectedMedicine) {
      alert("Please select a medicine.");
      return;
    }

    const requested = Number(quantity);

    if (!Number.isInteger(requested) || requested <= 0) {
      alert("Enter a valid whole-number quantity.");
      return;
    }

    const existingCartQuantity = cart
      .filter(
        (item) =>
          Number(item.medicineId) === Number(selectedMedicine)
      )
      .reduce((sum, item) => sum + item.quantity, 0);

    const availableStock = fefoBatches.reduce(
      (sum, batch) => sum + batch.quantity,
      0
    );

    if (requested + existingCartQuantity > availableStock) {
      alert(`Insufficient stock. Available: ${availableStock}`);
      return;
    }

    let remaining = requested;
    const allocations = [];

    for (const batch of fefoBatches) {
      if (remaining <= 0) break;

      const alreadyInCart = cart
        .filter((item) => Number(item.batchId) === Number(batch.id))
        .reduce((sum, item) => sum + item.quantity, 0);

      const available = Math.max(0, batch.quantity - alreadyInCart);
      const allocated = Math.min(remaining, available);

      if (allocated > 0) {
        const medicine = medicines.find(
          (item) => Number(item.id) === Number(selectedMedicine)
        );

        allocations.push({
          medicineId: Number(selectedMedicine),
          medicineName: medicine?.medicineName || "Unknown Medicine",
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate,
          quantity: allocated,
          sellingPrice: Number(batch.sellingPrice),
          total: allocated * Number(batch.sellingPrice)
        });

        remaining -= allocated;
      }
    }

    if (remaining > 0) {
      alert("Unable to allocate the requested quantity. Refresh and try again.");
      return;
    }

    setCart((current) => [...current, ...allocations]);
    setQuantity("");
  };

  const removeFromCart = (batchId) => {
    setCart((current) =>
      current.filter((item) => Number(item.batchId) !== Number(batchId))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const completeSale = async () => {
    if (cart.length === 0) {
      alert("Add at least one medicine to the bill.");
      return;
    }

    if (
      !window.confirm(
        `Complete this sale for ₹${cartTotal.toFixed(2)}?`
      )
    ) {
      return;
    }

    const receiptLines = cart.map((item) => ({ ...item }));

    try {
      const completedSales = [];

      for (const item of receiptLines) {
        const response = await API.post("/sales", {
          medicineId: item.medicineId,
          batchId: item.batchId,
          quantity: item.quantity
        });

        completedSales.push(response.data);
      }

      setLastReceipt({
        billNumber: `PT-${Date.now()}`,
        saleDate: new Date().toISOString(),
        items: receiptLines,
        total: completedSales.reduce(
          (sum, sale) => sum + Number(sale.totalAmount || 0),
          0
        )
      });

      setCart([]);
      setSelectedMedicine("");
      setQuantity("");
      setFefoBatches([]);

      await Promise.all([loadBatches(), loadSales()]);
      alert("Sale completed. Your receipt is ready to print.");
    } catch (error) {
      console.error("Sale error:", error);
      await Promise.all([loadBatches(), loadSales()]);
      alert(
        "The sale could not be completed fully. Please check Sales History and inventory before retrying."
      );
    }
  };

  const getMedicineName = (id) =>
    medicines.find((item) => Number(item.id) === Number(id))
      ?.medicineName || "Unknown Medicine";

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="sales-page">
      <div className="page-header no-print">
        <div>
          <h2>Sales & Billing</h2>
          <p>Process medicine sales and print receipts</p>
        </div>
        <div className="sales-header-icon">
          <ShoppingCart size={24} />
        </div>
      </div>

      {lastReceipt && (
        <section className="receipt-card">
          <div className="receipt-actions no-print">
            <div>
              <h3><CheckCircle size={20} /> Sale completed</h3>
              <p>Receipt {lastReceipt.billNumber} is ready.</p>
            </div>
            <button className="primary-button" onClick={printReceipt}>
              <Printer size={18} /> Print Receipt
            </button>
          </div>

          <div className="print-receipt">
            <div className="receipt-heading">
              <h1>PharmaTrack</h1>
              <p>PHARMACY SALES RECEIPT</p>
              <p>Thank you for your purchase</p>
            </div>

            <div className="receipt-meta">
              <p><strong>Bill No:</strong> {lastReceipt.billNumber}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(lastReceipt.saleDate).toLocaleString("en-IN")}
              </p>
            </div>

            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Medicine / Batch</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {lastReceipt.items.map((item, index) => (
                  <tr key={`${item.batchId}-${index}`}>
                    <td>
                      <strong>{item.medicineName}</strong>
                      <div>Batch: {item.batchNumber}</div>
                      <div>Expiry: {item.expiryDate}</div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>₹{item.sellingPrice.toFixed(2)}</td>
                    <td>₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-total">
              <strong>Grand Total</strong>
              <strong>₹{lastReceipt.total.toFixed(2)}</strong>
            </div>

            <p className="receipt-footer">
              Please retain this receipt for your records.
            </p>
          </div>
        </section>
      )}

      <div className="sales-layout no-print">
        <div className="table-card">
          <div className="card-header">
            <div>
              <h3>Create Sale</h3>
              <p>Earliest-expiring batches are allocated first.</p>
            </div>
            <Receipt size={22} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Medicine</label>
              <select
                value={selectedMedicine}
                onChange={handleMedicineChange}
              >
                <option value="">Select medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.medicineName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>FEFO Batch Order</label>
              <input
                readOnly
                value={fefoBatches.map(
                  (batch) => `${batch.batchNumber} (${batch.expiryDate})`
                ).join(" → ")}
                placeholder="Select a medicine"
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {fefoBatches.length > 0 && (
            <div className="inventory-summary">
              <div className="inventory-summary-card">
                <Package size={20} />
                <div>
                  <span>Total Available Stock</span>
                  <strong>
                    {fefoBatches.reduce((sum, batch) => sum + batch.quantity, 0)}
                  </strong>
                </div>
              </div>
              <div className="inventory-summary-card">
                <Package size={20} />
                <div>
                  <span>Earliest Expiry</span>
                  <strong>{fefoBatches[0].expiryDate}</strong>
                </div>
              </div>
              <div className="inventory-summary-card">
                <Package size={20} />
                <div>
                  <span>First FEFO Batch</span>
                  <strong>{fefoBatches[0].batchNumber}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="primary-button" onClick={addToCart}>
              <Plus size={18} /> Add to Cart
            </button>
          </div>
        </div>

        <div className="table-card">
          <div className="card-header">
            <div>
              <h3>Current Bill</h3>
              <p>Review before completing the sale</p>
            </div>
            <ShoppingCart size={22} />
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={42} />
              <h3>Cart is empty</h3>
              <p>Add medicines to create a sale.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.batchId}>
                      <td><strong>{item.medicineName}</strong></td>
                      <td>{item.batchNumber}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => removeFromCart(item.batchId)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cart.length > 0 && (
            <>
              <div className="sales-total">
                <span>Total Amount</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
              <div className="form-actions">
                <button
                  className="secondary-button"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </button>
                <button className="primary-button" onClick={completeSale}>
                  <Receipt size={18} /> Complete Sale
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="table-card no-print">
        <div className="card-header">
          <div>
            <h3>Sales History</h3>
            <p>Recently completed sales</p>
          </div>
          <Receipt size={22} />
        </div>

        {sales.length === 0 ? (
          <div className="empty-state">
            <Receipt size={42} />
            <h3>No sales yet</h3>
            <p>Completed sales will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Sale Date</th>
                </tr>
              </thead>
              <tbody>
                {[...sales]
                  .sort(
                    (a, b) =>
                      new Date(b.saleDate) - new Date(a.saleDate)
                  )
                  .map((sale) => (
                    <tr key={sale.id}>
                      <td><strong>{getMedicineName(sale.medicineId)}</strong></td>
                      <td>{sale.batchId}</td>
                      <td>{sale.quantity}</td>
                      <td>₹{Number(sale.sellingPrice).toFixed(2)}</td>
                      <td>₹{Number(sale.totalAmount).toFixed(2)}</td>
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

export default Sales;
