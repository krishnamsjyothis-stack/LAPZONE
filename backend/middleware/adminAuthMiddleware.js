const adminAuthMiddleware = (req, res, next) => {
  try {
  
    if (!req.session.adminId) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }


    req.adminId = req.session.adminId;

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);

    return res.status(401).json({
      message: "Invalid admin session",
    });
  }
};

export default adminAuthMiddleware; 