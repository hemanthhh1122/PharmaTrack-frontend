
import { useEffect, useState } from "react";
import { Plus, Search, Truck, Trash2, Pencil, X } from "lucide-react";
import API from "../services/api";

const emptyForm = {
  supplierName: "",
  phone: "",
  email: "",
  address: ""
};

function Suppliers() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadSuppliers = async () => {
    try {
      const response = await API.get("/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      alert("Unable to load suppliers.");
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (supplier) => {
    setEditingId(supplier.id);
    setFormData({
      supplierName: supplier.supplierName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || ""
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId !== null) {
        await API.put(`/suppliers/${editingId}`, formData);
        alert("Supplier updated successfully.");
      } else {
        await API.post("/suppliers", formData);
        alert("Supplier added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      await loadSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Unable to save supplier. Please try again.");
    }
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      await API.delete(`/suppliers/${id}`);
      await loadSuppliers();
      alert("Supplier deleted successfully.");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Unable to delete supplier.");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    [
      supplier.supplierName,
      supplier.phone,
      supplier.email,
      supplier.address
    ].some((value) =>
      value?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <div>
          <h2>Suppliers</h2>
          <p>Manage your medicine suppliers</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="card-header">
            <h3>
              {editingId !== null ? "Edit Supplier" : "Add New Supplier"}
            </h3>

            <button
              type="button"
              className="delete-button"
              onClick={closeForm}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Supplier Name</label>
                <input
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="supplier@example.com"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter supplier address"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                {editingId !== null ? "Save Changes" : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>Supplier List</h3>
            <span>{suppliers.length} suppliers registered</span>
          </div>

          <div className="table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="empty-state">
            <Truck size={42} />
            <h3>No suppliers found</h3>
            <p>Add your first supplier to PharmaTrack.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td><strong>{supplier.supplierName}</strong></td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.email || "-"}</td>
                    <td>{supplier.address}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="secondary-button"
                          onClick={() => openEditForm(supplier)}
                          title="Edit supplier"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteSupplier(supplier.id)}
                          title="Delete supplier"
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

export default Suppliers;
