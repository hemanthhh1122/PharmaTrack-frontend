
import { useEffect, useRef, useState } from "react";
import {
  Plus, Search, Trash2, Pill, Pencil, X,
  Download, Upload, FileDown
} from "lucide-react";
import API from "../services/api";

const emptyForm = {
  medicineName: "",
  genericName: "",
  category: "",
  dosageForm: "",
  strength: "",
  manufacturer: "",
  reorderLevel: ""
};

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInput = useRef(null);

  const loadMedicines = async () => {
    try {
      const response = await API.get("/medicines");
      setMedicines(response.data);
    } catch (error) {
      console.error("Error loading medicines:", error);
      alert("Unable to load medicines.");
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const downloadFile = (data, filename, type = "text/csv") => {
    const url = window.URL.createObjectURL(new Blob([data], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get("/csv/medicines/template", {
        responseType: "blob"
      });
      downloadFile(response.data, "medicines_template.csv");
    } catch (error) {
      console.error(error);
      alert("Unable to download CSV template.");
    }
  };

  const exportMedicines = async () => {
    try {
      const response = await API.get("/csv/medicines/export", {
        responseType: "blob"
      });
      downloadFile(response.data, "medicines.csv");
    } catch (error) {
      console.error(error);
      alert("Unable to export medicines.");
    }
  };

  const importMedicines = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    if (!window.confirm(
      "Import medicines from this CSV? Existing records will not be updated."
    )) {
      event.target.value = "";
      return;
    }

    const data = new FormData();
    data.append("file", file);
    setCsvLoading(true);

    try {
      const response = await API.post("/csv/medicines/import", data);
      alert(
        response.data.message +
        ". Imported: " + response.data.importedCount
      );
      await loadMedicines();
    } catch (error) {
      console.error("CSV import error:", error);
      alert(
        error.response?.data?.message ||
        "CSV import failed. Check the template and file contents."
      );
    } finally {
      setCsvLoading(false);
      event.target.value = "";
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (medicine) => {
    setEditingId(medicine.id);
    setFormData({
      medicineName: medicine.medicineName || "",
      genericName: medicine.genericName || "",
      category: medicine.category || "",
      dosageForm: medicine.dosageForm || "",
      strength: medicine.strength || "",
      manufacturer: medicine.manufacturer || "",
      reorderLevel: String(medicine.reorderLevel ?? "")
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      reorderLevel: Number(formData.reorderLevel)
    };

    try {
      if (editingId !== null) {
        await API.put(`/medicines/${editingId}`, payload);
        alert("Medicine updated successfully.");
      } else {
        await API.post("/medicines", payload);
        alert("Medicine added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      await loadMedicines();
    } catch (error) {
      console.error("Error saving medicine:", error);
      alert(
        error.response?.data?.message ||
        "Unable to save medicine. Please try again."
      );
    }
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) {
      return;
    }

    try {
      await API.delete(`/medicines/${id}`);
      await loadMedicines();
      alert("Medicine deleted successfully.");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Unable to delete medicine. Check whether it has linked batches.");
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    [
      medicine.medicineName,
      medicine.genericName,
      medicine.category,
      medicine.manufacturer
    ].some((value) =>
      value?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="medicines-page">
      <div className="page-header">
        <div>
          <h2>Medicines</h2>
          <p>Manage all registered medicines</p>
        </div>
        <button className="primary-button" onClick={openAddForm}>
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>CSV Import / Export</h3>
            <span>Import or download medicine records</span>
          </div>
          <div style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap"
          }}>
            <button
              className="secondary-button"
              onClick={downloadTemplate}
              disabled={csvLoading}
            >
              <FileDown size={16} /> Template
            </button>
            <button
              className="secondary-button"
              onClick={exportMedicines}
              disabled={csvLoading}
            >
              <Download size={16} /> Export CSV
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
              onChange={importMedicines}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="card-header">
            <h3>{editingId !== null ? "Edit Medicine" : "Add New Medicine"}</h3>
            <button
              type="button"
              className="delete-button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Medicine Name</label>
                <input name="medicineName" value={formData.medicineName}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Generic Name</label>
                <input name="genericName" value={formData.genericName}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input name="category" value={formData.category}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Dosage Form</label>
                <select name="dosageForm" value={formData.dosageForm}
                  onChange={handleChange} required>
                  <option value="">Select dosage form</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                </select>
              </div>
              <div className="form-group">
                <label>Strength</label>
                <input name="strength" value={formData.strength}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input name="manufacturer" value={formData.manufacturer}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Reorder Level</label>
                <input type="number" min="0" name="reorderLevel"
                  value={formData.reorderLevel} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                {editingId !== null ? "Save Changes" : "Add Medicine"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Medicine List</h3>
            <span>{medicines.length} medicines registered</span>
          </div>
          <div className="table-search">
            <Search size={18} />
            <input
              placeholder="Search medicines..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="empty-state">
            <Pill size={40} />
            <h3>No medicines found</h3>
            <p>Try another search or add a medicine.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Dosage Form</th>
                  <th>Strength</th>
                  <th>Manufacturer</th>
                  <th>Reorder Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td><strong>{medicine.medicineName}</strong></td>
                    <td>{medicine.genericName}</td>
                    <td>{medicine.category}</td>
                    <td>{medicine.dosageForm}</td>
                    <td>{medicine.strength}</td>
                    <td>{medicine.manufacturer}</td>
                    <td>{medicine.reorderLevel}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="secondary-button"
                          onClick={() => openEditForm(medicine)}
                          title="Edit medicine"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => deleteMedicine(medicine.id)}
                          title="Delete medicine"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
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

export default Medicines;
