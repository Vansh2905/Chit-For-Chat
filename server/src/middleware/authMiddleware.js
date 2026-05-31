import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Fail startup if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET environment variable is missing. Server will not start.");
}

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protect };