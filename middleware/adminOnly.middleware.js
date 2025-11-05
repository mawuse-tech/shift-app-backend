export const adminOnly = (req, res, next) => {
  const user = req.loggedInUser;

  if (!user || user.role !== "admin") {
    const error = new Error("Access denied. Admins only.");
    error.statusCode = 403;
    return next(error);
  }

  next();
};