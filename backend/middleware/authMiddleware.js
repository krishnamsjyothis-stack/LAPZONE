import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
  
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }


    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token is missing",
      });
    }

  
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

   
    req.userId = decoded.userId;

    next();

  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;