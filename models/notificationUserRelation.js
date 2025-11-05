import User from "./users.model.js";
import Notification from "./notification.model.js";

// A user can have many notifications
User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });

// Each notification belongs to one user
Notification.belongsTo(User, { foreignKey: "user_id" });

export {User, Notification}