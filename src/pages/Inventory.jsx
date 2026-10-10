import {
  Package,
  Plus,
  Search,
  Trash2,
  Download,
  Upload,
  FileDown,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const fileInput = useRef(null);

  const [formData, setFormData] = useState({
    medicineId: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
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

  useEffect(() => {
    loadMedicines();
    loadBatches();
  }, []);

  // Download CSV
  const downloadCsv = (data, filename) => {
    const blob = new Blob([data], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  // Download template
  const downloadBatchTemplate = async () => {
    try {
      const response = await API.get("/csv/batches/template", {
        responseType: "blob",
      });

      downloadCsv(response.data, "batches_template.csv");
    } catch (error) {
      console.error(error);
      alert("Unable to download batch template.");
    }
  };

  // Export batches
  const exportBatches = async () => {
    try {
      const response = await API.get("/csv/batches/export", {
        responseType: "blob",
      });

      downloadCsv(response.data, "batches.csv");
    } catch (error) {
      console.error(error);
      alert("Unable to export batches.");
    }
  };

  // Import batches
  const importBatches = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("CSV file must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (!window.confirm("Import batches from this CSV file?")) {
      event.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);

    setCsvLoading(true);

    try {
      const response = await API.post(
        "/csv/batches/import",
        data
      );

      alert(
        `${response.data.message}. Imported: ${response.data.importedCount}`
      );

      await loadBatches();
    } catch (error) {
      console.error("Import error:", error);

      alert(
        error.response?.data?.message ||
          "Import failed. Check the CSV headers, medicine IDs, dates and values."
      );
    } finally {
      setCsvLoading(false);
      event.target.value = "";
    }
  };

  // Handle form changes
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Add batch
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.post("/batches", {
        medicineId: Number(formData.medicineId),
        batchNumber: formData.batchNumber,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
      });

      alert("Batch added successfully.");

      setFormData({
        medicineId: "",
        batchNumber: "",
        manufacturingDate: "",
        expiryDate: "",
        quantity: "",
        purchasePrice: "",
        sellingPrice: "",
      });

      setShowForm(false);
      await loadBatches();
    } catch (error) {
      console.error("Error adding batch:", error);
      alert("Unable to add batch.");
    }
  };

  // Delete batch
  const deleteBatch = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this batch?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/batches/${id}`);
      await loadBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Unable to delete batch.");
    }
  };

  // Get medicine name
  const getMedicineName = (medicineId) => {
    const medicine = medicines.find(
      (medicine) => medicine.id === medicineId
    );

    return medicine
      ? medicine.medicineName
      : "Unknown Medicine";
  };

  // Search batches
  const filteredBatches = batches.filter((batch) => {
    const medicineName = getMedicineName(batch.medicineId);

    return (
      batch.batchNumber
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      medicineName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Inventory summary
  const totalStock = batches.reduce(
    (sum, batch) => sum + (batch.quantity || 0),
    0
  );

  const totalBatches = batches.length;
  const today = new Date();

  // Corrected expiring-soon calculation
  const expiringSoon = batches.filter((batch) => {
    const expiry = new Date(batch.expiryDate);
    const difference =
      (expiry - today) / (1000 * 60 * 60 * 24);

    return difference >= 0 && difference <= 30;
  }).length;

  // Expired batches
  const expired = batches.filter((batch) => {
    const expiry = new Date(batch.expiryDate);
    return expiry < today;
  }).length;

  return (
    <div className="inventory-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p>Manage medicine batches and stock</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="secondary-button"
            onClick={downloadBatchTemplate}
            disabled={csvLoading}
          >
            <FileDown size={16} />
            Template
          </button>

          <button
            className="secondary-button"
            onClick={exportBatches}
            disabled={csvLoading}
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            className="primary-button"
            onClick={() => fileInput.current?.click()}
            disabled={csvLoading}
          >
            <Upload size={16} />
            {csvLoading ? "Importing..." : "Import CSV"}
          </button>

          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            onChange={importBatches}
            style={{ display: "none" }}
          />

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={18} />
            Add Batch
          </button>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="inventory-summary">
        <div className="inventory-summary-card">
          <Package size={22} />
          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <Package size={22} />
          <div>
            <span>Total Batches</span>
            <strong>{totalBatches}</strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <Package size={22} />
          <div>
            <span>Expiring Soon</span>
            <strong>{expiringSoon}</strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <Package size={22} />
          <div>
            <span>Expired</span>
            <strong>{expired}</strong>
          </div>
        </div>
      </div>

      {/* Add Batch Form */}
      {showForm && (
        <div className="form-card">
          <h3>Add New Batch</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Medicine</label>
                <select
                  name="medicineId"
                  value={formData.medicineId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select medicine</option>

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
                <label>Batch Number</label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  placeholder="e.g. PCM24001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Manufacturing Date</label>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Price</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="₹"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Selling Price</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  placeholder="₹"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Add Batch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Inventory Batches</h3>
            <span>
              {batches.length} batch(es) registered
            </span>
          </div>

          <div className="table-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search batch or medicine..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="empty-state">
            <Package size={42} />
            <h3>No inventory batches</h3>
            <p>
              Add medicine batches to start tracking inventory.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch Number</th>
                  <th>Manufacturing Date</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <strong>
                        {getMedicineName(batch.medicineId)}
                      </strong>
                    </td>

                    <td>{batch.batchNumber}</td>
                    <td>{batch.manufacturingDate}</td>
                    <td>{batch.expiryDate}</td>
                    <td>{batch.quantity}</td>
                    <td>₹{batch.purchasePrice}</td>
                    <td>₹{batch.sellingPrice}</td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteBatch(batch.id)}
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
      </div>
    </div>
  );
}

export default Inventory;