import Address from "../models/Address.js";
import { z } from "zod";


// ===============================
// ADDRESS VALIDATION
// ===============================

const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),

  addressLine: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters"),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters"),

  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters"),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),

  isDefault: z.boolean().optional().default(false),
});


// ===============================
// GET ADDRESSES
// ===============================

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


// ===============================
// ADD ADDRESS
// ===============================

const addAddress = async (req, res) => {
  try {
    const validationResult = addressSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid address details",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = validationResult.data;


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
      isDefault,
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


// ===============================
// UPDATE ADDRESS
// ===============================

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;


    const validationResult = addressSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid address details",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }


    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = validationResult.data;


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
        {
          userId: req.userId,
          _id: { $ne: id },
        },
        {
          $set: { isDefault: false },
        }
      );
    }


    address.fullName = fullName;
    address.phone = phone;
    address.addressLine = addressLine;
    address.city = city;
    address.state = state;
    address.pincode = pincode;
    address.isDefault = isDefault;


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


// ===============================
// DELETE ADDRESS
// ===============================

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