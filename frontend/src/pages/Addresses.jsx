import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import addressSchema from "../validation/addressValidation";





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



  const [errors, setErrors] = useState({});

  const [modal, setModal] = useState(null);

  const showModalMessage = (message) => {
    setModal({
      message,
      type: /successfully|success/i.test(String(message)) ? "success" : "error",
    });
  };



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



  const newValue = type === "checkbox" ? checked : value;



  setFormData((previous) => ({

    ...previous,

    [name]: newValue,

  }));



  // Validate only the field being changed

  if (name !== "isDefault") {

    const result = addressSchema.safeParse({

      ...formData,

      [name]: newValue,

    });



    if (!result.success) {

      const fieldError = result.error.issues.find(

        (issue) => issue.path[0] === name

      );



      setErrors((previous) => ({

        ...previous,

        [name]: fieldError?.message || "",

      }));

    } else {

      setErrors((previous) => ({

        ...previous,

        [name]: "",

      }));

    }

  }

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



  setErrors({});

  setEditingId(null);

  setShowForm(false);

};



  // ================= ADD / UPDATE =================



const handleSubmit = async (e) => {

  e.preventDefault();



  // ================= FRONTEND VALIDATION =================



  console.log("FORM DATA:", formData);

  console.log("PHONE:", formData.phone);

  console.log("PHONE LENGTH:", formData.phone.length);

  console.log("PINCODE:", formData.pincode);

  console.log("PINCODE LENGTH:", formData.pincode.length);



  const result = addressSchema.safeParse(formData);



  if (!result.success) {

  const fieldErrors = {};



  result.error.issues.forEach((issue) => {

    const fieldName = issue.path[0];



    if (!fieldErrors[fieldName]) {

      fieldErrors[fieldName] = issue.message;

    }

  });



  setErrors(fieldErrors);



  return;

}



setErrors({});



  // ================= GET TOKEN =================



  try {

    const token = localStorage.getItem("token");



    if (!token) {

      navigate("/login");

      return;

    }



    // ================= UPDATE ADDRESS =================



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



      showModalMessage("Address updated successfully");

    }



    // ================= ADD ADDRESS =================



    else {

      await api.post(

        "/address",

        formData,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      showModalMessage("Address added successfully");

    }



    // ================= AFTER SUCCESS =================



    resetForm();

    fetchAddresses();



  } catch (error) {

    console.error(

      "ADDRESS SAVE ERROR:",

      error

    );



    console.error(

      "RESPONSE:",

      error.response

    );



    console.error(

      "RESPONSE DATA:",

      error.response?.data

    );



    showModalMessage(

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



      showModalMessage("Address deleted successfully");



      fetchAddresses();



    } catch (error) {

      console.error(

        "Delete address error:",

        error.response?.data || error.message

      );



      showModalMessage(

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

    className={`w-full h-12 bg-[#222731] border rounded-lg px-4 text-white outline-none focus:border-[#c51f35] ${

      errors.fullName

        ? "border-red-500"

        : "border-[#4a5568]"

    }`}

    placeholder="Enter full name"

  />



  {errors.fullName && (

    <p className="text-red-400 text-sm mt-1">

      {errors.fullName}

    </p>

  )}

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

    className={`w-full h-12 bg-[#222731] border rounded-lg px-4 text-white outline-none focus:border-[#c51f35] ${

      errors.phone

        ? "border-red-500"

        : "border-[#4a5568]"

    }`}

    placeholder="Enter phone number"

  />



  {errors.phone && (

    <p className="text-red-400 text-sm mt-1">

      {errors.phone}

    </p>

  )}

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

    rows="3"

    className={`w-full bg-[#222731] border rounded-lg px-4 py-3 text-white outline-none focus:border-[#c51f35] ${

      errors.addressLine

        ? "border-red-500"

        : "border-[#4a5568]"

    }`}

    placeholder="House name, street, area..."

  />



  {errors.addressLine && (

    <p className="text-red-400 text-sm mt-1">

      {errors.addressLine}

    </p>

  )}

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

    className={`w-full h-12 bg-[#222731] border rounded-lg px-4 text-white outline-none focus:border-[#c51f35] ${

      errors.city

        ? "border-red-500"

        : "border-[#4a5568]"

    }`}

    placeholder="Enter city"

  />



  {errors.city && (

    <p className="text-red-400 text-sm mt-1">

      {errors.city}

    </p>

  )}

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

    className={`w-full h-12 bg-[#222731] border rounded-lg px-4 text-white outline-none focus:border-[#c51f35] ${

      errors.state

        ? "border-red-500"

        : "border-[#4a5568]"

    }`}

    placeholder="Enter state"

  />



  {errors.state && (

    <p className="text-red-400 text-sm mt-1">

      {errors.state}

    </p>

  )}

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

    className={`w-full h-12 bg-[#222731] border rounded-lg px-4 text-white outline-none focus:border-[#c51f35] ${

      errors.pincode

        ? "border-red-500"

        : "border-[#4a5568]"

    }`}

    placeholder="Enter pincode"

  />



  {errors.pincode && (

    <p className="text-red-400 text-sm mt-1">

      {errors.pincode}

    </p>

  )}

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



      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            className="w-full max-w-md rounded-2xl border border-[#303642] bg-[#151820] p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  modal.type === "success"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-[#c51f35]/15 text-[#ff6479]"
                }`}
              >
                <span className="text-2xl">
                  {modal.type === "success" ? "✓" : "!"}
                </span>
              </div>
              <h2 id="address-modal-title" className="text-xl font-semibold">
                {modal.type === "success" ? "SUCCESSFUL" : "PLEASE CHECK"}
              </h2>
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-300">
              {modal.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg bg-[#c51f35] px-5 py-2.5 font-medium text-white transition hover:bg-[#b51a2b]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      </main>



    </div>

  );

}



export default Addresses;