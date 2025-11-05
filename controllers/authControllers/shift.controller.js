import { sendShiftEmail } from "../../config/sendShiftEmail.js";
import Notification from "../../models/notification.model.js";
import Shift from "../../models/shift.model.js";
import User from "../../models/users.model.js";

export const createShift = async (req, res, next) => {
  try {
    const { user_id, shifts } = req.body;

    if (!Array.isArray(shifts) || shifts.length === 0) {
      return res.status(400).json({ message: "No shifts provided" });
    }

    // The logged-in admin assigning the shifts
    const assigned_by = req.loggedInUser.user_id;

    // Prepare shifts for bulk creation
    const shiftData = shifts.map((shift) => ({
      user_id,
      assigned_by,
      day: shift.day,
      date: shift.date,
      shift_type: shift.shift_type,
      notes: shift.notes || null,
    }));

    // Create all shifts at once
    const createdShifts = await Shift.bulkCreate(shiftData);

    // Fetch worker details
    const worker = await User.findOne({ where: { user_id } });

    // Determine the week (from the first shift date)
    const weekDate = new Date(shifts[0].date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Create a single notification for the week
    await Notification.create({
      user_id,
      title: "Weekly Shift Assigned",
      message: `You have been assigned a new shift schedule for the week starting ${weekDate}.`,
      type: "shift-assignment",
    });

    // Send email if worker exists
    if (worker) {
      await sendShiftEmail(worker.email, worker.firstName);
    } else {
      console.warn(`Worker with ID ${user_id} not found — email not sent.`);
    }

    res.status(201).json({
      message: "Shifts assigned successfully, notification created, and email sent.",
      createdShifts,
    });
  } catch (error) {
    console.error("Error creating shift:", error);
    next(error);
  }
};

//fetch all shifts
export const fetchAllShifts = async (req, res, next) => {
  try {
    const usersWithShifts = await User.findAll({
      attributes: ["user_id", "firstName", "lastName", "email", "phoneNumber"], // only needed fields from the user's model
      include: [
        {
          model: Shift,
          as: "shifts", // must match your association alias
          attributes: ["shift_id", "day", "shift_type", "date"],
        },
      ],
      order: [
        ["user_id", "ASC"],
        [{ model: Shift, as: "shifts" }, "day", "ASC"], // optional: sort shifts by day
      ],
    });

    // Filter out workers who have no shifts
    const filteredUsers = usersWithShifts.filter(
      (user) => user.shifts && user.shifts.length > 0
    );

    return res.status(200).json({
      success: true,
      message: "Workers and their shifts fetched successfully",
      data: filteredUsers,
    });
  } catch (error) {
    next(error)
  }
};

//delete a shift
export const deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    await shift.destroy();

    return res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
      deletedShiftId: id,
    });
  } catch (error) {
    next(error)
  }
};


// edit shift
export const editShift = async (req, res, next) => {
  try {
    const { shift_id } = req.params; // shift id from URL
    const { day, shift_type } = req.body; // updated fields

    // Find the shift record by ID
    const shift = await Shift.findOne({ where: { shift_id } });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    // Update only the provided fields
    if (day) shift.day = day;
    if (shift_type) shift.shift_type = shift_type;

    // Save the updated record
    await shift.save();

    //  Create a notification for the worker
    await Notification.create({
      user_id: shift.user_id, // make sure this field exists in your Shift model
      title: "Shift Updated",
      message: `Your shift on ${shift.date} has been updated to ${shift.shift_type}.`,
      type: "shift-update",
    });

    //  Return success response
    res.status(200).json({
      message: "Shift updated successfully",
      shift,
    });
  } catch (error) {
    console.error("Error editing shift:", error);
    next(error);
  }
};


//view my shedule
export const getMyShifts = async (req, res, next) => {
  try {
    const user_id = req.loggedInUser.user_id; // from JWT or session
    const shifts = await Shift.findAll({
      where: { user_id },
      order: [["date", "DESC"]],
    });
    res.json(shifts);
  } catch (error) {
    next(error)
  }
};

//get worker shift history
export const getWorkerShiftHistory = async (req, res, next) => {
  try {
    const { workerId } = req.params;

    const shifts = await Shift.findAll({
      where: { user_id: workerId },
      order: [["date", "DESC"]], // newest first
    });

    res.status(200).json(shifts);
  } catch (error) {
    next(error);
  }
};




