const adminMiddleware = (req, res, next) => {
  try {
    if (!req.session?.adminId) {
      return res.status(401).json({
        message: "Admin session is required",
      });
    }

    req.adminId = req.session.adminId;

    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);

    return res.status(401).json({
      message: "Invalid admin session",
    });
  }
};

export default adminMiddleware;