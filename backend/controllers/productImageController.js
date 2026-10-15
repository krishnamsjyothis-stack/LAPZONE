const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please select at least one image",
      });
    }

    const imagePaths = req.files.map((file) => {
      return `/uploads/products/${file.filename}`;
    });

    return res.status(200).json({
      message: "Images uploaded successfully",
      images: imagePaths,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return res.status(500).json({
      message: "Failed to upload images",
    });
  }
};

export default uploadProductImages;