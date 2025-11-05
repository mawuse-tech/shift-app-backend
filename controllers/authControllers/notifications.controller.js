import Notification from "../../models/notification.model.js";

//fetching notifications. 
export const notifications = async(req, res, next) => {
    try {
    const { user_id } = req.params;
    const notifications = await Notification.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
} 

//delete notifications
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notification.findByPk(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    await notice.destroy();

    return res.status(200).json({
      success: true,
      message: "notification deleted successfully",
      deletedNoticeId: id,
    });
  } catch (error) {
    next(error)
  }
};