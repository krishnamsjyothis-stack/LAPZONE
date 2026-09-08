import Address from "../models/Address.js";

// ================= GET ALL ADDRESSES =================

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Addresses fetched successfully",
      addresses,
    });

  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      message: "Failed to fetch addresses",
    });
  }
};


// ================= ADD ADDRESS =================

const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    // Basic validation
    if (
      !fullName ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "All address fields are required",
      });
    }

    // If this address is default,
    // remove default from existing addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: req.userId },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      userId: req.userId,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address,
    });

  } catch (error) {
    console.error("Add address error:", error);

    return res.status(500).json({
      message: "Failed to add address",
    });
  }
};


// ================= UPDATE ADDRESS =================

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    const address = await Address.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    // If setting this address as default
    if (isDefault) {
      await Address.updateMany(
        { userId: req.userId },
        { $set: { isDefault: false } }
      );
    }

    address.fullName = fullName;
    address.phone = phone;
    address.addressLine = addressLine;
    address.city = city;
    address.state = state;
    address.pincode = pincode;
    address.isDefault = isDefault || false;

    await address.save();

    return res.status(200).json({
      message: "Address updated successfully",
      address,
    });

  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      message: "Failed to update address",
    });
  }
};


// ================= DELETE ADDRESS =================

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
    });

  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      message: "Failed to delete address",
    });
  }
};


export {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};