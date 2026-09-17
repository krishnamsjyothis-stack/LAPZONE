const adminMiddleware = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      message: "Admin authentication required",
    });
  }

  next();
};

export default adminMiddleware;