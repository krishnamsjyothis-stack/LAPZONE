import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // ================= GET ADDRESSES =================

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses(response.data.addresses);
    } catch (error) {
      console.error(
        "Fetch addresses error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ================= INPUT CHANGE =================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ================= RESET FORM =================

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ================= ADD / UPDATE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (editingId) {
        await api.put(
          `/address/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Address updated successfully");
      } else {
        await api.post(
          "/address",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Address added successfully");
      }

      resetForm();
      fetchAddresses();

    } catch (error) {
      console.error(
        "Address save error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save address"
      );
    }
  };

  // ================= EDIT =================

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: address.isDefault || false,
    });

    setEditingId(address._id);
    setShowForm(true);
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/address/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Address deleted successfully");

      fetchAddresses();

    } catch (error) {
      console.error(
        "Delete address error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete address"
      );
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151820] flex items-center justify-center text-white">
        Loading addresses...
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200">

      {/* ================= NAVBAR ================= */}

      <nav className="h-16 bg-[#11151d] border-b border-[#252a33] flex items-center justify-between px-8">

        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 bg-[#c51f35] rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              LZ
            </span>
          </div>

          <span className="text-white font-semibold">
            LAPZONE
          </span>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full bg-[#c51f35] flex items-center justify-center"
        >
          👤
        </button>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-semibold text-white">
              My Addresses
            </h1>

            <p className="text-gray-400 mt-2">
              Manage your delivery addresses.
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white"
            >
              + Add Address
            </button>
          )}

        </div>


        {/* ================= ADDRESS FORM ================= */}

        {showForm && (

          <div className="bg-[#384358] rounded-2xl p-7 mb-8">

            <h2 className="text-xl font-semibold text-white mb-6">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* FULL NAME */}

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                    placeholder="Enter full name"
                  />
                </div>


                {/* PHONE */}

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                    placeholder="Enter phone number"
                  />
                </div>


                {/* ADDRESS */}

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-2">
                    Address
                  </label>

                  <textarea
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full bg-[#222731] border border-[#4a5568] rounded-lg px-4 py-3 text-white outline-none focus:border-[#c51f35]"
                    placeholder="House name, street, area..."
                  />
                </div>


                {/* CITY */}

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                    placeholder="Enter city"
                  />
                </div>


                {/* STATE */}

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                    placeholder="Enter state"
                  />
                </div>


                {/* PINCODE */}

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                    placeholder="Enter pincode"
                  />
                </div>

              </div>


              {/* DEFAULT ADDRESS */}

              <label className="flex items-center gap-3 mt-5 text-gray-300">

                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#c51f35]"
                />

                Set as default address

              </label>


              {/* FORM BUTTONS */}

              <div className="flex justify-end gap-4 mt-7">

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 h-11 rounded-xl border border-[#4a5568] hover:bg-[#222731]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-7 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </button>

              </div>

            </form>

          </div>
        )}


        {/* ================= ADDRESS LIST ================= */}

        {addresses.length === 0 ? (

          <div className="bg-[#384358] rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              📍
            </div>

            <h2 className="text-xl text-white">
              No addresses yet
            </h2>

            <p className="text-gray-400 mt-2">
              Add an address for your deliveries.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {addresses.map((address) => (

              <div
                key={address._id}
                className="bg-[#384358] rounded-2xl p-6"
              >

                {/* HEADER */}

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-white font-semibold">
                      {address.fullName}
                    </h2>

                    {address.isDefault && (
                      <span className="inline-block mt-2 text-xs bg-[#c51f35] text-white px-3 py-1 rounded-full">
                        Default
                      </span>
                    )}

                  </div>

                  <span className="text-[#c51f35] text-2xl">
                    📍
                  </span>

                </div>


                {/* ADDRESS */}

                <div className="mt-5 text-gray-300 text-sm space-y-1">

                  <p>
                    {address.addressLine}
                  </p>

                  <p>
                    {address.city}, {address.state}
                  </p>

                  <p>
                    {address.pincode}
                  </p>

                  <p className="pt-2">
                    📞 {address.phone}
                  </p>

                </div>


                {/* ACTIONS */}

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 h-10 rounded-lg border border-[#4a5568] text-gray-300 hover:bg-[#222731]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(address._id)}
                    className="flex-1 h-10 rounded-lg bg-[#c51f35] hover:bg-[#b51a2b] text-white"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Addresses;