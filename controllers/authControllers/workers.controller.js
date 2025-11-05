import User from "../../models/users.model.js";
import { createAdmin } from "./admin.controller.js";

//fetch all workers
export const fetchAllWorkers = async (req, res, next) => {
  try {
    const allWorkers = await User.findAll({
      where: { role: ["worker", "admin"] },
      attributes: { 
        exclude: ["password", "passwordResetToken", "passwordResetExpires", "createdAt", "updatedAt"]
      }
    });

    if (!allWorkers || allWorkers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No workers available for now, please try again later",
      });
    }

    res.status(200).json({
      success: true,
      message: "Workers fetched successfully",
      workers: allWorkers,
    });
  } catch (error) {
    console.error("Error fetching workers:", error);
    next(error);
  }
};

export const removeWorker = async (req, res, next) => {
  try {
    const { id } = req.params; // get worker ID from URL

    // Find the worker
    const worker = await User.findOne({ where: { user_id: id, role: "worker" } });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Delete worker
    await worker.destroy();

    res.status(200).json({
      success: true,
      message: `Worker ${worker.firstName} ${worker.lastName} deleted successfully`,
    });

  } catch (error) {
    console.error("Error removing worker:", error);
    next(error);
  }
};

//edit profile
export const updateProfile = async (req, res, next) => {
  try {
    // Finding the user by ID (from JWT)
    const user = await User.findByPk(req.loggedInUser.user_id, {
      attributes: { exclude: ["password", "passwordResetToken", "passwordResetTokenExpiry", "__v"] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update fields only if provided
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // Handle file uploads
    if (req.files?.image) {
      user.image = `uploads/${req.files.image[0].filename}`;
    }

    // Save to DB
    await user.save();

    // Send response
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    next(error);
  }
};


