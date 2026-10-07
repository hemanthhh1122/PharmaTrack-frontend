import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Pill } from "lucide-react";
import API from "../services/api";

function Medicines() {

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    medicineName: "",
    genericName: "",
    category: "",
    dosageForm: "",
    strength: "",
    manufacturer: "",
    reorderLevel: ""
  });

  // Load medicines from Spring Boot
  const loadMedicines = async () => {
    try {
      const response = await API.get("/medicines");
      setMedicines(response.data);
    } catch (error) {
      console.error("Error loading medicines:", error);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  // Handle form changes
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // Add medicine
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      await API.post("/medicines", {
        ...formData,
        reorderLevel: Number(formData.reorderLevel)
      });

      setFormData({
        medicineName: "",
        genericName: "",
        category: "",
        dosageForm: "",
        strength: "",
        manufacturer: "",
        reorderLevel: ""
      });

      setShowForm(false);

      loadMedicines();

    } catch (error) {
      console.error("Error adding medicine:", error);
      alert("Unable to add medicine.");
    }
  };

  // Delete medicine
  const deleteMedicine = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/medicines/${id}`);

      loadMedicines();

    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Unable to delete medicine.");
    }
  };

  // Search
  const filteredMedicines = medicines.filter((medicine) =>
    medicine.medicineName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div className="medicines-page">

      {/* Page Header */}

      <div className="page-header">

        <div>

          <h2>Medicines</h2>

          <p>
            Manage all registered medicines
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Add Medicine
        </button>

      </div>


      {/* Add Medicine Form */}

      {showForm && (

        <div className="form-card">

          <h3>Add New Medicine</h3>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">

                <label>Medicine Name</label>

                <input
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  placeholder="e.g. Paracetamol"
                  required
                />

              </div>


              <div className="form-group">

                <label>Generic Name</label>

                <input
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                  placeholder="e.g. Paracetamol"
                  required
                />

              </div>


              <div className="form-group">

                <label>Category</label>

                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Analgesic"
                  required
                />

              </div>


              <div className="form-group">

                <label>Dosage Form</label>

                <select
                  name="dosageForm"
                  value={formData.dosageForm}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select dosage form
                  </option>

                  <option value="Tablet">
                    Tablet
                  </option>

                  <option value="Capsule">
                    Capsule
                  </option>

                  <option value="Syrup">
                    Syrup
                  </option>

                  <option value="Injection">
                    Injection
                  </option>

                  <option value="Cream">
                    Cream
                  </option>

                  <option value="Ointment">
                    Ointment
                  </option>

                  <option value="Drops">
                    Drops
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>Strength</label>

                <input
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  placeholder="e.g. 500 mg"
                  required
                />

              </div>


              <div className="form-group">

                <label>Manufacturer</label>

                <input
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Manufacturer name"
                  required
                />

              </div>


              <div className="form-group">

                <label>Reorder Level</label>

                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  min="0"
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
                Add Medicine
              </button>

            </div>

          </form>

        </div>

      )}


      {/* Search */}

      <div className="table-card">

        <div className="table-toolbar">

          <div>

            <h3>Medicine List</h3>

            <span>
              {medicines.length} medicines registered
            </span>

          </div>


          <div className="table-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        {/* Medicine Table */}

        {filteredMedicines.length === 0 ? (

          <div className="empty-state">

            <Pill size={40} />

            <h3>No medicines found</h3>

            <p>
              Add your first medicine to PharmaTrack.
            </p>

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
                  <th>Action</th>

                </tr>

              </thead>


              <tbody>

                {filteredMedicines.map((medicine) => (

                  <tr key={medicine.id}>

                    <td>
                      <strong>
                        {medicine.medicineName}
                      </strong>
                    </td>

                    <td>
                      {medicine.genericName}
                    </td>

                    <td>
                      {medicine.category}
                    </td>

                    <td>
                      {medicine.dosageForm}
                    </td>

                    <td>
                      {medicine.strength}
                    </td>

                    <td>
                      {medicine.manufacturer}
                    </td>

                    <td>
                      {medicine.reorderLevel}
                    </td>

                    <td>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteMedicine(medicine.id)
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

export default Medicines;