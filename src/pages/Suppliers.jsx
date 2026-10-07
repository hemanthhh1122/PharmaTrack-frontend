import { useEffect, useState } from "react";
import { Plus, Search, Truck, Trash2 } from "lucide-react";
import API from "../services/api";

function Suppliers() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    supplierName: "",
    phone: "",
    email: "",
    address: ""
  });

  // Load suppliers from backend
  const loadSuppliers = async () => {
    try {
      const response = await API.get("/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Handle form changes
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // Add supplier
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.post("/suppliers", formData);

      alert("Supplier added successfully.");

      setFormData({
        supplierName: "",
        phone: "",
        email: "",
        address: ""
      });

      setShowForm(false);

      loadSuppliers();

    } catch (error) {
      console.error("Error adding supplier:", error);
      alert("Unable to add supplier.");
    }
  };

  // Delete supplier
  const deleteSupplier = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/suppliers/${id}`);
      loadSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Unable to delete supplier.");
    }
  };

  // Search suppliers
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplierName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="suppliers-page">

      {/* Page Header */}

      <div className="page-header">

        <div>
          <h2>Suppliers</h2>
          <p>Manage your medicine suppliers</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Add Supplier
        </button>

      </div>


      {/* Add Supplier Form */}

      {showForm && (
        <div className="form-card">

          <h3>Add New Supplier</h3>

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
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Add Supplier
              </button>

            </div>

          </form>

        </div>
      )}


      {/* Supplier Table */}

      <div className="table-card">

        <div className="table-toolbar">

          <div>
            <h3>Supplier List</h3>

            <span>
              {suppliers.length} suppliers registered
            </span>
          </div>


          <div className="table-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search supplier..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        {filteredSuppliers.length === 0 ? (

          <div className="empty-state">

            <Truck size={42} />

            <h3>No suppliers found</h3>

            <p>
              Add your first supplier to PharmaTrack.
            </p>

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
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {filteredSuppliers.map((supplier) => (

                  <tr key={supplier.id}>

                    <td>
                      <strong>
                        {supplier.supplierName}
                      </strong>
                    </td>

                    <td>{supplier.phone}</td>

                    <td>
                      {supplier.email || "-"}
                    </td>

                    <td>{supplier.address}</td>

                    <td>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteSupplier(supplier.id)
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

        )}

      </div>

    </div>
  );
}

export default Suppliers;