import User from "../models/users.model.js";
import jwt from 'jsonwebtoken'

export const routeProtect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      const error = new Error("User not logged in, kindly login");
      error.statusCode = 401;
      return next(error);
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      const error = new Error("Invalid token");
      error.statusCode = 401;
      return next(error);
    }

    // Fetch user (exclude password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "passwordResetExpires", "passwordResetToken"] },
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    req.loggedInUser = user;
    next();

  } catch (error) {
    // Token expired or invalid
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Session expired or invalid token";
    }
    next(error);
  }
};